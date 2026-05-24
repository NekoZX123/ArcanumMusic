import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import { createReadStream, existsSync } from 'fs';

function startWebSocket() {
    const wsServer = new WebSocketServer({ port: 3030 });

    wsServer.on('connection', (ws) => {
        ws.on('message', async (message) => {
            const messageStr = message.toString();

            if (messageStr.startsWith('file:///')) {
                const filePath = messageStr.slice(8);
                console.log(`[WebSocket] Local file requested: ${filePath}`);

                if (!existsSync(filePath)) {
                    console.error(`[WebSocket] Local file not found: ${filePath}`);
                    ws.close(1011, 'File not found');
                    return;
                }

                const readStream = createReadStream(filePath);
                readStream.on('data', (chunk) => {
                    ws.send(chunk);
                });
                readStream.on('end', () => {
                    ws.close();
                });
                readStream.on('error', (err) => {
                    console.error(`[WebSocket] Error reading local file: ${err.message}`);
                    ws.close(1011, err.message);
                });
            }
            else {
                const targetUrl = messageStr;
                fetch(targetUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0'
                    }
                })
                .then((response) => {
                    response.body.on('data', (chunk) => {
                        // console.log(`[WebSocket] Data received`);
                        ws.send(chunk);
                    });

                    response.body.on('end', () => {
                        ws.close();
                    });
                })
                .catch((err) => {
                    console.error(`[WebSocket] Fetch error: ${err.message}`);
                    ws.close(1011, err.message);
                });
            }
        });
    });

    console.log(`[WebSocket] Server running on http://127.0.0.1:3030/`);
}

export { startWebSocket };
