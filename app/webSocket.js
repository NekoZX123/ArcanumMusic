import { WebSocketServer } from 'ws';
import { request } from 'https';

function requestAudio(targetUrl, origin) {
    return new Promise((resolve, reject) => {
        const urlObject = new URL(targetUrl);
        const req = request(
            {
                hostname: urlObject.hostname,
                path: urlObject.pathname + urlObject.search,
                method: 'GET',
                headers: {
                    'referer': origin,
                    'priority': 'i',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.1.28.205001',
                    'sec-fetch-dest': 'audio',
                    'sec-fetch-mode': 'no-cors',
                    'sec-fetch-site': 'cross-site'
                },
            },
            (res) => resolve(res)
        );

        req.on('error', (err) => reject(err));
        req.end();
    });
}

function startWebSocket() {
    const wsServer = new WebSocketServer({ port: 3003 });

    wsServer.on('connection', (ws) => {
        ws.on('message', async (message) => {
            const targetUrl = message.toString();
            const referer = new URL(targetUrl).origin;
            const response = await requestAudio(targetUrl, referer);

            response.on('data', (chunk) => {
                console.log(response.headers);
                ws.send(chunk);
            });

            response.on('end', () => {
                ws.close();
            });

            response.on('error', (err) => {
                console.error('[WebSocket] Response error', err);
                ws.close();
            });
        });
    });

    console.log(`[WebSocket] Server running on http://127.0.0.1:3003/`);
}

export { startWebSocket };
