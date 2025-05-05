import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const express = require('express');
const cors = require('cors');
import axios from 'axios';
const { exec } = require('child_process');

const server = express();
const port = 3000;

server.use(express.json());
server.use(cors());

function proxyRequest(link, method, headers = {}, body = null) {
    return new Promise((response, reject) => {
        axios({
            url: link,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            data: body ? JSON.stringify(body) : null
        })
            .then((proxyResponse) => {
                response({
                    statusCode: proxyResponse.status,
                    headers: proxyResponse.headers,
                    body: proxyResponse.data
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
        let { url, method, headers, body } = req.body;

        proxyRequest(url, method, headers, body).then((result) => {
            // console.log(`${url} => cookies: ${data.cookies}`);
            console.log(result.body);
            res.status(result.statusCode).set(result.headers).send(result.body);
        }).catch((error) => {
            console.error('[Arcanum Music - Server] Web request error: ', error);
            res.status(500).send('Error fetching data');
        });
    });

    /**
     * localhost:{srvPort}/execute/
     * Returns the result of a command
     */
    server.post('/execute/', (req, res) => {
        const { command } = req.body;

        if (!command) {
            return res.status(400).send('Command is required');
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`[Arcanum Music - Server] Command execution error: ${error.message}`);
                return res.status(500).send(`Error: ${error.message}`);
            }

            if (stderr) {
                console.warn(`[Arcanum Music - Server] Command execution stderr: ${stderr}`);
                return res.status(200).send(`Warning: ${stderr}`);
            }

            console.log(`[Arcanum Music - Server] Command executed successfully: ${stdout}`);
            res.status(200).send(stdout);
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
