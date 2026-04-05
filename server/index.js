import { startArcanumService } from './serviceCore.js';

const port = Number(process.env.PORT || process.env.ARCANUM_SERVICE_PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

const service = startArcanumService({ port, host, enableCors: true });

async function shutdown() {
    try {
        await service.stop();
    }
    finally {
        process.exit(0);
    }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
