import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const express = require('express');
const cors = require('cors');
import axios from 'axios';

const server = express();
let port = 3000;

server.use(express.json());
server.use(cors());

// Only proxy requests to explicitly approved music platform origins.
const allowedOrigins = new Map([
    ['music.163.com', 'https://music.163.com'],
    ['m701.music.126.net', 'https://m701.music.126.net'],
    ['m704.music.126.net', 'https://m704.music.126.net'],
    ['m801.music.126.net', 'https://m801.music.126.net'],
    ['m804.music.126.net', 'https://m804.music.126.net'],
    ['interface.music.163.com', 'https://interface.music.163.com'],
    ['u6.y.qq.com', 'https://u6.y.qq.com'],
    ['c6.y.qq.com', 'https://c6.y.qq.com'],
    ['ws6.stream.qqmusic.qq.com', 'https://ws6.stream.qqmusic.qq.com'],
    ['aqqmusic.tc.qq.com', 'https://aqqmusic.tc.qq.com'],
    ['kuwo.cn', 'https://kuwo.cn'],
    ['www.kuwo.cn', 'https://www.kuwo.cn'],
    ['searchlist.kuwo.cn', 'https://searchlist.kuwo.cn'],
    ['wapi.kuwo.cn', 'https://wapi.kuwo.cn'],
    ['lv-sycdn.kuwo.cn', 'https://lv-sycdn.kuwo.cn'],
    ['wwwapi.kugou.com', 'https://wwwapi.kugou.com'],
    ['complexsearch.kugou.com', 'https://complexsearch.kugou.com'],
    ['m3ws.kugou.com', 'https://m3ws.kugou.com'],
    ['gateway.kugou.com', 'https://gateway.kugou.com'],
    ['m.kugou.com', 'https://m.kugou.com'],
    ['webfs.kugou.com', 'https://webfs.kugou.com']
]);

const allowedMethods = new Set(['GET', 'POST']);
const blockedHeaderNames = new Set(['host', 'content-length']);

function sanitizeHeaders(headers = {}) {
    if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
        return {};
    }

    return Object.entries(headers).reduce((result, [key, value]) => {
        const normalizedKey = String(key).toLowerCase();
        if (blockedHeaderNames.has(normalizedKey) || value === undefined || value === null) {
            return result;
        }

        result[key] = value;
        return result;
    }, {});
}

function resolveSafeRequest(link, method) {
    const parsedUrl = new URL(link);
    const protocol = parsedUrl.protocol.toLowerCase();
    const hostname = parsedUrl.hostname.toLowerCase();
    const safeOrigin = allowedOrigins.get(hostname);
    const safeMethod = String(method || 'GET').toUpperCase();

    if (!['http:', 'https:'].includes(protocol)) {
        throw new Error(`Proxy protocol ${protocol} is not allowed`);
    }

    if (!safeOrigin) {
        throw new Error(`Proxy hostname ${hostname} is not allowed`);
    }

    if (parsedUrl.username || parsedUrl.password) {
        throw new Error('Proxy credentials are not allowed in the target URL');
    }

    if (!allowedMethods.has(safeMethod)) {
        throw new Error(`Proxy method ${safeMethod} is not allowed`);
    }

    return {
        method: safeMethod,
        url: `${safeOrigin}${parsedUrl.pathname}${parsedUrl.search}`
    };
}

function proxyRequest(link, method, headers = {}, body = null, responseType = 'json') {
    return new Promise((resolve, reject) => {
        try {
            const safeRequest = resolveSafeRequest(link, method);
            const safeHeaders = sanitizeHeaders(headers);

            axios({
                url: safeRequest.url,
                method: safeRequest.method,
                headers: safeHeaders,
                data: body,
                responseType: responseType,
                maxRedirects: 5,
                beforeRedirect: (options) => {
                    const redirectHost = String(options.hostname || '').toLowerCase();
                    const redirectProtocol = String(options.protocol || '').toLowerCase();

                    if (!['http:', 'https:'].includes(redirectProtocol) || !allowedOrigins.has(redirectHost)) {
                        throw new Error(`Proxy redirect to ${redirectProtocol}//${redirectHost} is not allowed`);
                    }

                    delete options.headers.host;
                }
            })
                .then((response) => {
                    resolve({
                        statusCode: response.status,
                        headers: response.headers,
                        body: response.data
                    });
                })
                .catch((error) => {
                    reject(error);
                });
        } catch (error) {
            console.error('[Arcanum Music - Server] Invalid proxy request:', error);
            reject(error);
        }
    });
}

function startService(environment) {
    /**
     * localhost:{srvPort}/proxy/
     * Local loopback proxy service.
     */
    server.post('/proxy', (req, res) => {
        const { url, method, headers, body, responseType } = req.body;

        proxyRequest(url, method, headers, body, responseType)
            .then((result) => {
                try {
                    const parsedUrl = new URL(url);
                    if (parsedUrl.host === 'u6.y.qq.com') {
                        result.headers['content-type'] = 'application/json';
                    }
                } catch (error) {
                    console.error('[Arcanum Music - Server] Invalid URL:', url);
                }

                res.status(result.statusCode).set(result.headers).send(result.body);
            })
            .catch((error) => {
                console.error('[Arcanum Music - Server] Web request error:', error);
                res.status(500).send({
                    code: 500,
                    error: 'Failed to fetch'
                });
            });
    });

    port = environment === 'dev' ? 3001 : 3000;
    server.listen(port, () => {
        console.log(`[Arcanum Music - Service] Local proxy server running at http://localhost:${port}/`);
    });
}

function stopService() {
    console.log(`[Arcanum Music - Service] Service at http://localhost:${port}/ has been closed`);
    process.exit(0);
}

export { startService, stopService };
