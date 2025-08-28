import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const express = require('express');
const cors = require('cors');
import axios from 'axios';
const server = express();
const port = 3000;

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
            reject(new Error(`Proxy request to ${link} is not allowed`));
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
            .catch((error) => {
                reject(error);
            });
    });
}

function startService() {
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
     * localhost:{srvPort}/proxyAudio/
     * 本地回环代理音频数据获取服务器
     */
    server.get('/neteaseProxy/', async (req, res) => {
        const { url } = req.query;
        if (!url) {
            res.status(400).send({ error: 'Missing url parameter' });
            return;
        }
        let allowFlag = false;
        const targetUrl = decodeURIComponent(url)
        try {
            const parsedUrl = new URL(targetUrl);
            if (allowedHosts.includes(parsedUrl.hostname)) allowFlag = true;
        } catch (error) {
            res.status(400).send({ error: 'Invalid URL' });
            return;
        }
        if (!allowFlag) {
            res.status(403).send({ error: 'Proxy request to this host is not allowed' });
            return;
        }
        console.log(`[Debug] Netease proxy: Receiving data from ${targetUrl}`);
        
    });

    server.listen(port, () => {
        console.log(`[Arcanum Music - Service] Local proxy server running at http://localhost:${port}/`)
    })
}

function stopService() {
    console.log(`[Arcanum Music - Service] Service at http://localhost:${port}/ has been closed`);

    process.exit(0);
}

export { startService, stopService };
