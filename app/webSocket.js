import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';

function startWebSocket() {
    const wsServer = new WebSocketServer({ port: 3001 });

    wsServer.on('connection', (ws) => {
        ws.on('message', async (message) => {
            const targetUrl = message.toString();
            fetch(targetUrl, {
                headers: {
                    'Origin': 'https://music.163.com/',
                    'Referer': 'https://music.163.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0'
                }
            })
            .then((response) => {
                response.body.on('data', (chunk) => {
                    console.log(`[WebSocket] Data received`);
                    ws.send(chunk);
                });

                response.body.on('end', () => {
                    ws.close();
                });
            });
        });
    });

    console.log(`[WebSocket] Server running on http://127.0.0.1:3001/`);
}

export { startWebSocket };
