import { existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { shell } from 'electron';
import { parseFile } from 'music-metadata';

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
        return Promise.reject(new Error('路径无效'));
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

export {
    scanLocalMusic,
    getMusicMetadata,
    getLocalPaths,
    writeLocalPaths,
    openMusicFolder
};
