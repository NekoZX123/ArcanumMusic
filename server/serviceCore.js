import express from 'express';
import cors from 'cors';
import axios from 'axios';

export const allowedHosts = [
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

export const platformCookieFields = {
    netease: ['MUSIC_U'],
    qqmusic: ['uin', 'qm_keyst', 'qqmusic_key'],
    kuwo: ['userid'],
    kugou: ['KuGoo']
};

const platformHostMap = {
    netease: ['music.163.com', 'm701.music.126.net', 'm704.music.126.net', 'm801.music.126.net', 'm804.music.126.net', 'interface.music.163.com'],
    qqmusic: ['u6.y.qq.com', 'c6.y.qq.com', 'ws6.stream.qqmusic.qq.com', 'aqqmusic.tc.qq.com'],
    kuwo: ['kuwo.cn', 'www.kuwo.cn', 'searchlist.kuwo.cn', 'wapi.kuwo.cn', 'lv-sycdn.kuwo.cn'],
    kugou: ['wwwapi.kugou.com', 'complexsearch.kugou.com', 'm3ws.kugou.com', 'gateway.kugou.com', 'm.kugou.com', 'webfs.kugou.com']
};

const sessionStore = new Map();

function normalizePlatform(platform) {
    const normalized = String(platform || '').trim();
    if (!Object.prototype.hasOwnProperty.call(platformCookieFields, normalized)) {
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return normalized;
}

function getSessionId(req) {
    const sessionId = String(req.headers['x-arcanum-session'] || '').trim();
    if (!sessionId) {
        throw new Error('Missing X-Arcanum-Session header');
    }

    return sessionId;
}

function getSessionState(sessionId) {
    if (!sessionStore.has(sessionId)) {
        sessionStore.set(sessionId, { platforms: {} });
    }

    return sessionStore.get(sessionId);
}

function getLoggedOutStatus() {
    return { loggedIn: false };
}

function getCookieHeader(cookies = {}) {
    return Object.entries(cookies)
        .filter(([, value]) => value !== undefined && value !== null && String(value) !== '')
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
}

function detectPlatformFromUrl(link) {
    try {
        const parsedUrl = new URL(link);
        return Object.entries(platformHostMap).find(([, hosts]) => hosts.includes(parsedUrl.hostname))?.[0] || null;
    }
    catch {
        return null;
    }
}

function normalizeImportedState(platform, payload = {}) {
    const cookies = { ...(payload.cookies || {}) };
    if (platform === 'qqmusic' && !cookies.qqmusic_key && cookies.qm_keyst) {
        cookies.qqmusic_key = cookies.qm_keyst;
    }

    const missingFields = platformCookieFields[platform].filter((field) => !cookies[field]);
    if (missingFields.length > 0) {
        throw new Error(`Missing required cookie fields: ${missingFields.join(', ')}`);
    }

    return {
        loggedIn: true,
        userData: payload.userData || {},
        cookies
    };
}

export async function proxyRequest(link, method, headers = {}, body = null, responseType = 'json') {
    let parsedUrl;
    try {
        parsedUrl = new URL(link);
    }
    catch (error) {
        throw new Error(`Invalid proxy url: ${link}`);
    }

    if (!allowedHosts.includes(parsedUrl.hostname)) {
        throw new Error(`Proxy request to ${link} is not allowed`);
    }

    const response = await axios({
        url: link,
        method,
        headers,
        data: body,
        responseType,
        validateStatus: () => true
    });

    return {
        statusCode: response.status,
        headers: response.headers,
        body: response.data
    };
}

export function createArcanumService(options = {}) {
    const {
        enableCors = true,
        jsonLimit = '2mb'
    } = options;

    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({ limit: jsonLimit }));

    if (enableCors) {
        app.use(cors());
    }

    app.get('/health', (_, res) => {
        res.json({ ok: true });
    });

    app.post('/proxy', async (req, res) => {
        try {
            const { url, method, headers, body, responseType } = req.body || {};
            const requestHeaders = { ...(headers || {}) };
            delete requestHeaders.host;
            delete requestHeaders.Host;
            delete requestHeaders['content-length'];
            delete requestHeaders['Content-Length'];

            const sessionId = String(req.headers['x-arcanum-session'] || '').trim();
            const detectedPlatform = detectPlatformFromUrl(url);
            if (sessionId && detectedPlatform) {
                const sessionState = getSessionState(sessionId);
                const sessionAccount = sessionState.platforms[detectedPlatform];
                if (sessionAccount?.loggedIn && !requestHeaders.cookie && !requestHeaders.Cookie) {
                    const cookieHeader = getCookieHeader(sessionAccount.cookies);
                    if (cookieHeader) {
                        requestHeaders.cookie = cookieHeader;
                    }
                }
            }

            const result = await proxyRequest(url, method, requestHeaders, body, responseType);
            if (new URL(url).host === 'u6.y.qq.com') {
                result.headers['content-type'] = 'application/json';
            }

            res.status(result.statusCode).set(result.headers).send(result.body);
        }
        catch (error) {
            console.error('[Arcanum Music - Service] Web request error:', error);
            res.status(500).json({
                code: 500,
                error: error instanceof Error ? error.message : 'Failed to fetch'
            });
        }
    });

    app.get('/auth/:platform/start', (req, res) => {
        try {
            const platform = normalizePlatform(req.params.platform);
            getSessionId(req);
            res.json({
                ok: true,
                platform,
                mode: 'import',
                importFields: platformCookieFields[platform],
                message: 'Please import the required cookie fields for this platform.'
            });
        }
        catch (error) {
            res.status(400).json({
                ok: false,
                mode: 'unsupported',
                message: error instanceof Error ? error.message : 'Invalid request'
            });
        }
    });

    app.get('/auth/:platform/status', (req, res) => {
        try {
            const platform = normalizePlatform(req.params.platform);
            const sessionId = getSessionId(req);
            const sessionState = getSessionState(sessionId);
            res.json(sessionState.platforms[platform] || getLoggedOutStatus());
        }
        catch (error) {
            res.status(400).json(getLoggedOutStatus());
        }
    });

    app.post('/auth/:platform/import', (req, res) => {
        try {
            const platform = normalizePlatform(req.params.platform);
            const sessionId = getSessionId(req);
            const sessionState = getSessionState(sessionId);
            const accountState = normalizeImportedState(platform, req.body || {});
            sessionState.platforms[platform] = accountState;
            res.json(accountState);
        }
        catch (error) {
            res.status(400).json({
                loggedIn: false,
                error: error instanceof Error ? error.message : 'Import failed'
            });
        }
    });

    app.post('/auth/:platform/logout', (req, res) => {
        try {
            const platform = normalizePlatform(req.params.platform);
            const sessionId = getSessionId(req);
            const sessionState = getSessionState(sessionId);
            delete sessionState.platforms[platform];
            res.json({ ok: true, platform, loggedIn: false });
        }
        catch (error) {
            res.status(400).json({ ok: false, loggedIn: false });
        }
    });

    return app;
}

export function startArcanumService(options = {}) {
    const {
        port = 3000,
        host = '0.0.0.0',
        enableCors = true
    } = options;

    const app = createArcanumService({ enableCors });
    const server = app.listen(port, host, () => {
        console.log(`[Arcanum Music - Service] Server running at http://${host}:${port}/`);
    });

    return {
        app,
        server,
        async stop() {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(undefined);
                });
            });
        }
    };
}
