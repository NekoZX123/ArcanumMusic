import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import { createReadStream, existsSync } from 'fs';
import path from 'path';

import { getLocalMusicPaths } from './configHelper.js';

const wsServer = new WebSocketServer({ port: 3030 });

// 允许通过 WebSocket 读取的本地音频扩展名
const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.ogg', '.aac', '.wma', '.m4a', '.opus']);

// 网易云桌面端 User-Agent (远程音频流式请求使用)
const NETEASE_DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.1.28.205001';

/**
 * 校验本地文件路径是否位于已配置的本地音乐目录内, 防止任意文件读取
 * @param {string} filePath 待校验的文件路径
 * @param {string[]} roots 已配置的本地音乐根目录列表
 */
function isWithinRoots(filePath, roots) {
    const resolved = path.resolve(filePath);
    return roots.some((root) => {
        const resolvedRoot = path.resolve(root);
        const relative = path.relative(resolvedRoot, resolved);
        return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
    });
}

/**
 * 校验远程地址是否安全, 阻止 SSRF (本地回环 / 内网地址 / 非 http(s) 协议)
 * 公网 http(s) 地址 (各音乐平台 CDN) 仍然放行
 * @param {string} rawUrl 远程音频地址
 */
function isSafeRemoteUrl(rawUrl) {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return false;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (host === 'localhost' || host.endsWith('.localhost')) return false;
    if (host === '::1' || host === '::' || host.startsWith('fe80') || host.startsWith('fc') || host.startsWith('fd')) return false;

    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4) {
        const first = Number(ipv4[1]);
        const second = Number(ipv4[2]);
        if (first === 0 || first === 127 || first === 10) return false;      // 未指定 / 回环 / 私有
        if (first === 169 && second === 254) return false;                   // 链路本地
        if (first === 192 && second === 168) return false;                   // 私有
        if (first === 172 && second >= 16 && second <= 31) return false;     // 私有
    }

    return true;
}

// 流式转发数据并在结束 / 出错时关闭连接
function streamToSocket(ws, stream) {
    stream.on('data', (chunk) => ws.send(chunk));
    stream.on('end', () => ws.close());
    stream.on('error', (err) => {
        console.error(`[WebSocket] Stream error: ${err.message}`);
        ws.close(1011, err.message);
    });
}

function startWebSocket() {
    wsServer.on('connection', (ws) => {
        ws.on('message', async (message) => {
            const messageStr = message.toString();

            if (messageStr.startsWith('file:///')) {
                const filePath = messageStr.slice(8);
                console.log(`[WebSocket] Local file requested: ${filePath}`);

                // 仅允许读取已配置本地音乐目录内的音频文件 (防止任意文件读取)
                const ext = path.extname(filePath).toLowerCase();
                if (!AUDIO_EXTENSIONS.has(ext)) {
                    console.error(`[WebSocket] Rejected non-audio local file: ${filePath}`);
                    ws.close(1008, 'File type not allowed');
                    return;
                }

                const roots = await getLocalMusicPaths();
                if (!isWithinRoots(filePath, roots)) {
                    console.error(`[WebSocket] Rejected local file outside configured music folders: ${filePath}`);
                    ws.close(1008, 'File path not allowed');
                    return;
                }

                if (!existsSync(filePath)) {
                    console.error(`[WebSocket] Local file not found: ${filePath}`);
                    ws.close(1011, 'File not found');
                    return;
                }

                streamToSocket(ws, createReadStream(filePath));
            }
            else {
                const targetUrl = messageStr;

                // 阻止 SSRF: 仅允许 http(s) 的公网地址
                if (!isSafeRemoteUrl(targetUrl)) {
                    console.error(`[WebSocket] Rejected unsafe remote URL: ${targetUrl}`);
                    ws.close(1008, 'URL not allowed');
                    return;
                }

                fetch(targetUrl, {
                    headers: {
                        'User-Agent': NETEASE_DESKTOP_UA
                    }
                })
                .then((response) => {
                    if (!response.ok) {
                        console.error(`[WebSocket] Upstream returned ${response.status} ${response.statusText}`);
                        ws.close(1011, `Upstream returned ${response.status}`);
                        return;
                    }
                    if (!response.body) {
                        console.error(`[WebSocket] Null response body for ${targetUrl}`);
                        ws.close(1011, 'Empty response body from upstream');
                        return;
                    }
                    streamToSocket(ws, response.body);
                })
                .catch((err) => {
                    console.error(`[WebSocket] Fetch error: ${err.message}`);
                    ws.close(1011, err.message);
                });
            }
        });
    });

    console.log(`[WebSocket] Server running on ws://127.0.0.1:3030/`);
}

function stopWebSocket() {
    wsServer.close(() => {
        console.log(`[WebSocket] Server has been closed`);
    });
}

export { startWebSocket, stopWebSocket };
