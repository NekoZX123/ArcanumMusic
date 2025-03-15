import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const http = require('http');
const https = require('https');

const express = require('express');
const cors = require('cors');

const server = express();
const port = 3000;

server.use(express.json());
server.use(cors());

function proxyRequest(link, method, headers = {}, body = null) {
    return new Promise((response, reject) => {
        const splitUrl = link.split(':');
        const protocol = splitUrl[0] === 'https' ? https : http;

        const requestOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const proxyRequest = protocol.request(link, requestOptions, (proxyResponse) => {
            // console.log(`[Proxy] ${method} ${link} code ${proxyResponse.statusCode}}`);
            if (proxyResponse.statusCode !== 200) {
                console.error(`[Arcanum Music - Server] Proxy request error: Code ${proxyResponse.statusCode} at link ${link}`);
            }

            let result = '';
            proxyResponse.on('data', (d) => {
                result += d.toString();
            });

            proxyResponse.on('end', () => {
                response({
                    statusCode: proxyResponse.statusCode,
                    headers: proxyResponse.headers,
                    body: result
                });
            });
        });

        proxyRequest.on('error', (error) => {
            reject(error);
        });

        if (body) {
            proxyRequest.write(JSON.stringify(body));
        }

        proxyRequest.end();
    });
}

function startService() {
    /**
     * localhost:{srvPort}/proxy/
     * Returns the result of a proxy web request.
     */
    server.post('/proxy', (req, res) => {
        let { url, method, headers, body } = req.body;

        proxyRequest(url, method, headers, body).then((result) => {
            // console.log(`${url} => cookies: ${data.cookies}`);
            res.status(result.statusCode).set(result.headers).send(result.body);
        }).catch((error) => {
            console.error('[Arcanum Music - Server] Web request error: ', error);
            res.status(500).send('Error fetching data');
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
