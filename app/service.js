import { startArcanumService } from '../server/serviceCore.js';

let serviceHandle;
let port = 3000;

function startService(environment) {
    port = environment === 'dev' ? 3001 : 3000;
    serviceHandle = startArcanumService({
        port,
        host: '127.0.0.1',
        enableCors: true
    });
}

function stopService() {
    if (!serviceHandle) {
        process.exit(0);
        return;
    }

    serviceHandle.stop()
        .catch((error) => {
            console.error(`[Arcanum Music - Service] Failed to stop service at http://127.0.0.1:${port}/`, error);
        })
        .finally(() => {
            console.log(`[Arcanum Music - Service] Service at http://127.0.0.1:${port}/ has been closed`);
            process.exit(0);
        });
}

export { startService, stopService };
