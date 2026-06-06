import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const express = require('express');
const cors = require('cors');
import axios from 'axios';
const server = express();
let port = 3000;

server.use(express.json());
server.use(cors());

// 允许的请求地址, 防止 SSRF 攻击
const allowedHosts = [
    'music.163.com',
    'm701.music.126.net',
    'm704.music.126.net',
    'm801.music.126.net',
    'm804.music.126.net',
    'interface.music.163.com',
    'interface3.music.163.com',
    'interfacepc.music.163.com',
    'u6.y.qq.com',
    'c6.y.qq.com',
    'ws6.stream.qqmusic.qq.com',
    'aqqmusic.tc.qq.com',
    'kuwo.cn',
    'www.kuwo.cn',
    'searchlist.kuwo.cn',
    'wapi.kuwo.cn',
    'lv-sycdn.kuwo.cn',
    'wwwapi.kugou.com',
    'complexsearch.kugou.com',
    'm3ws.kugou.com',
    'gateway.kugou.com',
    'm.kugou.com',
    'webfs.kugou.com'
];

function proxyRequest(link, method, headers = {}, body = null, responseType = 'json') {
    // console.log(`[Arcanum Music - Server] ${method} ${link}, headers: ${JSON.stringify(headers)}, body: ${JSON.stringify(body)}`);
    return new Promise((resolve, reject) => {
        // 检查链接是否在允许的范围内
        let allowFlag = false;
        try {
            const parsedUrl = new URL(link);
            if (allowedHosts.includes(parsedUrl.hostname)) allowFlag = true;
        }
        catch (error) {
            reject(error);
        }
        if (!allowFlag) {
            console.error(`[Arcanum Music - Server] Proxy request to ${link} is not allowed`);
            reject(`Proxy request to ${link} is not allowed`);
            return;
        }
        axios({
            url: link,
            method: method,
            headers: headers,
            data: body,
            responseType: responseType
        })
            .then((response) => {
                // console.log(`[Arcanum Music - Server] Proxy request to ${link} completed with status ${response.status}, data: ${response.data}`);
                resolve({
                    statusCode: response.status,
                    headers: response.headers,
                    body: response.data
                });
            })
            .catch((err) => {
                console.log(`Web request failed: ${err}`);
                reject(err);
            });
    });
}

function startService(environment) {
    /**
     * localhost:{srvPort}/proxy/
     * 本地回环代理服务器
     */
    server.post('/proxy', (req, res) => {
        let { url, method, headers, body, responseType } = req.body;

        proxyRequest(url, method, headers, body, responseType).then((result) => {
            // console.log(`${url} => cookies: ${data.cookies}`);
            try {
                const parsedUrl = new URL(url);
                if (parsedUrl.host === 'u6.y.qq.com') {
                    result.headers['content-type'] = 'application/json';
                }
            } catch (error) {
                console.error('[Arcanum Music - Server] Invalid URL:', url);
            }
            res.status(result.statusCode).set(result.headers).send(result.body);
        }).catch((error) => {
            console.error('[Arcanum Music - Server] Web request error: ', error);
            res.status(500).send({
                code: 500,
                error: 'Failed to fetch'
            });
        });
    });

    /**
     * localhost:{srvPort}/proxy/stream?url=<encoded_url>
     * 流式代理端点 - 用于音频流式播放
     * 支持 Range 请求头 (用于音频进度拖拽/跳跃)
     */
    server.get('/proxy/stream', async (req, res) => {
        const { url } = req.query;
        if (!url || typeof url !== 'string') {
            res.status(400).json({ error: 'Missing or invalid url parameter' });
            return;
        }

        // 检查链接是否在允许的范围内
        let allowFlag = false;
        try {
            const parsedUrl = new URL(url);
            // 精确匹配 allowedHosts
            if (allowedHosts.includes(parsedUrl.hostname)) {
                allowFlag = true;
            }
            // 通配匹配 *.music.126.net (网易云音乐 CDN 子域名不固定)
            if (parsedUrl.hostname.endsWith('music.126.net')) {
                allowFlag = true;
            }
        } catch (error) {
            res.status(400).json({ error: 'Invalid URL' });
            return;
        }
        if (!allowFlag) {
            console.error(`[Arcanum Music - Server] Stream proxy request to ${url} is not allowed`);
            res.status(403).json({ error: `Proxy request to ${url} is not allowed` });
            return;
        }

        console.log(`[Arcanum Music - Server] Proxying stream request to: ${url}`);
        try {
            const axiosConfig = {
                url: url,
                method: 'GET',
                responseType: 'stream',
                headers: {}
            };

            // 转发 Range 请求头以支持音频拖拽/跳跃
            const rangeHeader = req.headers['range'];
            if (rangeHeader) {
                axiosConfig.headers['Range'] = rangeHeader;
            }

            const response = await axios(axiosConfig);

            // 转发关键响应头
            const forwardHeaders = [
                'content-type',
                'content-length',
                'content-range',
                'accept-ranges',
                'cache-control',
                'expires',
                'last-modified',
                'etag'
            ];
            forwardHeaders.forEach((header) => {
                const value = response.headers[header];
                if (value) {
                    res.setHeader(header, value);
                }
            });

            // 防止代理端缓存
            res.setHeader('Cache-Control', 'no-cache');
            // 设置状态码 (206 用于 Range 请求)
            res.status(response.status);

            // 流式传输音频数据
            response.data.pipe(res);
        } catch (error) {
            console.error(`[Arcanum Music - Server] Stream proxy error:`, error.message);
            if (error.response) {
                res.status(error.response.status).json({ error: `Upstream returned ${error.response.status}` });
            } else {
                res.status(502).json({ error: 'Failed to fetch stream' });
            }
        }
    });

    port = environment === 'dev' ? 3001 : 3000;
    server.listen(port, () => {
        console.log(`[Arcanum Music - Service] Local proxy server running at http://localhost:${port}/`)
    });
}

function stopService() {
    console.log(`[Arcanum Music - Service] Service at http://localhost:${port}/ has been closed`);

    process.exit(0);
}

export { startService, stopService };
