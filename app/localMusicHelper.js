import { existsSync, readdirSync, statSync, createWriteStream } from 'fs';
import path from 'path';
import { shell } from 'electron';
import { parseFile } from 'music-metadata';
import fetch from 'node-fetch';
import NodeID3 from 'node-id3';

import { getLocalMusicPaths, writeLocalMusicPaths } from './configHelper.js';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.ogg', '.aac', '.wma', '.m4a', '.opus']);

// 扫描本地音乐文件夹，返回包含路径和文件列表的对象数组
async function scanLocalMusic(_) {
    const paths = await getLocalMusicPaths();
    const results = [];

    for (const dir of paths) {
        if (!existsSync(dir)) continue;

        const normalizedDir = dir.replace(/\\/g, '/');
        const files = readdirSync(dir).filter(file => {
            const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
            return AUDIO_EXTENSIONS.has(ext);
        });

        if (files.length > 0) {
            results.push({ path: normalizedDir, files });
        }
    }

    return results;
}

function getLocalPaths(_) {
    return getLocalMusicPaths();
}

function writeLocalPaths(_, paths) {
    if (paths.length === 0) {
        return Promise.reject(new Error('路径列表不能为空'));
    }

    writeLocalMusicPaths(paths);
}

function openMusicFolder(_, folderPath) {
    let targetPath = folderPath;
    try {
        if (statSync(folderPath).isFile()) {
            targetPath = path.dirname(folderPath);
        }
    } catch {
        return Promise.reject(new Error(`路径无效: ${folderPath}`));
    }

    shell.openPath(targetPath);
}

// 获取音乐文件的元数据
async function getMusicMetadata(_, filePath) {
    const metadata = await parseFile(filePath);
    const { common, format } = metadata;

    let songCover = './images/player/testAlbum.png';
    if (common.picture && common.picture.length > 0) {
        const pic = common.picture[0];
        songCover = `data:${pic.format};base64,${Buffer.from(pic.data).toString('base64')}`;
    }

    const author = common.artist || common.artists?.join(', ') || '未知作者';
    const duration = Math.round(format.duration) || -1;

    const name = common.title || filePath.substring(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.')) || '未知名称';

    const size = statSync(filePath).size;

    const ext = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();

    return { name, songCover, author, duration, size, ext };
}

/**
 * 下载音频文件到本地音乐目录（第一个路径）
 * @param event IPC 事件对象（用于推送进度）
 * @param url 音频下载链接
 * @param songName 歌曲名称（用于生成文件名）
 * @param metaData 歌曲元数据
 * @returns 保存的文件路径
 */
async function downloadAudio(event, url, songName, metaData) {
    const paths = await getLocalMusicPaths();
    if (!paths || paths.length === 0) {
        throw new Error('未配置本地音乐路径');
    }
    const targetDir = paths[0];

    if (!existsSync(targetDir)) {
        throw new Error(`本地音乐目录不存在: ${targetDir}`);
    }

    // 发起下载请求，获取响应头和流
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`下载失败，服务器返回状态码: ${response.status}`);
    }

    // 从 URL 路径中推断扩展名
    let ext = '.mp3';
    try {
        const urlPath = new URL(url).pathname;
        const urlExt = path.extname(urlPath).toLowerCase();
        if (['.mp3', '.flac', '.wav', '.ogg', '.aac', '.wma', '.m4a', '.opus'].includes(urlExt)) {
            ext = urlExt;
        }
    } catch {
        // URL 解析失败，使用默认扩展名
    }

    // URL 未提供扩展名时，从 Content-Type 推断
    if (ext === '.mp3') {
        const contentType = response.headers.get('content-type') || '';
        const mimeMap = {
            'audio/mpeg': '.mp3',
            'audio/flac': '.flac',
            'audio/wav': '.wav',
            'audio/ogg': '.ogg',
            'audio/aac': '.aac',
            'audio/x-wma': '.wma',
            'audio/x-m4a': '.m4a',
            'audio/mp4': '.m4a',
            'audio/opus': '.opus',
        };
        for (const [mime, mimeExt] of Object.entries(mimeMap)) {
            if (contentType.includes(mime)) {
                ext = mimeExt;
                break;
            }
        }
    }

    // 生成合法文件名（移除 Windows 非法字符）
    const baseName = (songName || `audio_${Date.now()}`)
        .replace(/[<>:"/\\|?*]/g, '_')
        .trim() || `audio_${Date.now()}`;

    // 处理重名文件
    let fileName = `${baseName}${ext}`;
    let filePath = path.join(targetDir, fileName);
    let counter = 1;
    while (existsSync(filePath)) {
        fileName = `${baseName} (${counter})${ext}`;
        filePath = path.join(targetDir, fileName);
        counter++;
    }

    // 流式下载并写入文件
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    const writeStream = createWriteStream(filePath);
    let loaded = 0;

    response.body.on('data', (chunk) => {
        loaded += chunk.length;
        if (total > 0 && event && event.sender) {
            event.sender.send('download-progress', {
                percent: Math.round((loaded / total) * 100),
                loaded,
                total,
            });
        }
    });

    response.body.pipe(writeStream);

    return new Promise((resolve, reject) => {
        writeStream.on('finish', async () => {
            // 推送完成进度
            if (event && event.sender) {
                event.sender.send('download-progress', {
                    percent: 100,
                    loaded: total || loaded,
                    total: total || loaded,
                });
            }

            // 写入 ID3 元数据
            if (metaData) {
                try {
                    const tags = {};

                    if (metaData.name) tags.title = metaData.name;
                    if (metaData.authors || metaData.songAuthors) {
                        tags.artist = metaData.authors || metaData.songAuthors;
                    }
                    if (metaData.albumName) tags.album = metaData.albumName;

                    // 解析封面图片（base64 格式）
                    if (metaData.coverBase64) {
                        const matches = metaData.coverBase64.match(/^data:(image\/\w+);base64,(.+)$/);
                        if (matches) {
                            const mimeType = matches[1];
                            const imageBuffer = Buffer.from(matches[2], 'base64');
                            tags.image = {
                                imageBuffer,
                                type: { id: 3, name: 'front cover' },
                                mime: mimeType,
                                description: '',
                            };
                        }
                    }

                    const result = NodeID3.write(tags, filePath);
                    if (!result) {
                        console.warn(`[Warning] Failed to write ID3 tags for: ${filePath}`);
                    }
                } catch (tagErr) {
                    console.warn(`[Warning] Error writing ID3 tags: ${tagErr.message}`);
                }
            }

            resolve(filePath);
        });
        writeStream.on('error', (err) => {
            reject(new Error(`文件写入失败: ${err.message}`));
        });
    });
}

export {
    scanLocalMusic,
    getMusicMetadata,
    getLocalPaths,
    writeLocalPaths,
    openMusicFolder,
    downloadAudio,
};
