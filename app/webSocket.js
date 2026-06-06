import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import { createReadStream, existsSync } from 'fs';

const wsServer = new WebSocketServer({ port: 3030 });

function startWebSocket() {
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
                        // 'Cookie': 'appver=3.1.28.205001; deviceId=264B24D467368DC38A69A4557CB6FB68307DE15AE0D045569C18; os=pc; osver=Microsoft-Windows-11--build-26100-64bit; NMTID=00OhsH_WTYnykecbEQouvNYd6eUYa4AAAGcyGYihQ; WEVNSM=1.0.0; channel=netease; clientSign=08:00:27:1D:4A:A5@@@VB401cc2dc-9afe258d@@@@@@7cc7ffa1ee8c38928aca5c6209fbc2f586e853ad3ae00ab9dc3bec17528e8551;',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.1.28.205001'
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
                    response.body.on('data', (chunk) => {
                        // console.log(`[WebSocket] Data received`);
                        ws.send(chunk);
                    });

                    response.body.on('end', () => {
                        ws.close();
                    });

                    response.body.on('error', (err) => {
                        console.error(`[WebSocket] Stream error: ${err.message}`);
                        ws.close(1011, err.message);
                    });
                })
                .catch((err) => {
                    clearTimeout(timeout);
                    console.error(`[WebSocket] Fetch error: ${err.message}`);
                    ws.close(1011, err.message);
                });
            }
        });
    });

    console.log(`[WebSocket] Server running on http://127.0.0.1:3030/`);
}

function stopWebSocket() {
    wsServer.close(() => {
        console.log(`[WebSocket] Server has been closed`);
    });
}

export { startWebSocket, stopWebSocket };
