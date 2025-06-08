import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const express = require('express');
const cors = require('cors');
import axios from 'axios';

const server = express();
const port = 3000;

server.use(express.json());
server.use(cors());

function proxyRequest(link, method, headers = {}, body = null, responseType = 'json') {
    // console.log(`[Arcanum Music - Server] ${method} ${link}, headers: ${JSON.stringify(headers)}, body: ${JSON.stringify(body)}`);
    return new Promise((resolve, reject) => {
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
     * Returns the result of a proxy web request.
     */
    server.post('/proxy', (req, res) => {
        let { url, method, headers, body, responseType } = req.body;

        proxyRequest(url, method, headers, body, responseType).then((result) => {
            // console.log(`${url} => cookies: ${data.cookies}`);
            if (url.includes('u6.y.qq.com')) {
                result.headers['content-type'] = 'application/json';
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

    server.listen(port, () => {
        console.log(`[Arcanum Music - Service] Local proxy server running at http://localhost:${port}/`)
    })
}

function stopService() {
    console.log(`[Arcanum Music - Service] Service at http://localhost:${port}/ has been closed`);

    process.exit(0);
}

export { startService, stopService };
