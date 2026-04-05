import type { IElectronAPI } from '../components/interfaces';

export type MusicPlatform = 'netease' | 'qqmusic' | 'kuwo' | 'kugou';
export type AccountFlowMode = 'electron' | 'import' | 'redirect' | 'unsupported';

export type RuntimeCapabilities = {
    windowControls: boolean;
    desktopLyricsWindow: boolean;
    tray: boolean;
    localEncryptedAccounts: boolean;
    hostedProxy: boolean;
    browserLogin: boolean;
};

export type RuntimeAccountStatus = {
    loggedIn: boolean;
    userData?: Record<string, any>;
    cookies?: Record<string, any>;
    reason?: string;
};

export type RuntimeAccountFlow = {
    ok: boolean;
    platform: MusicPlatform;
    mode: AccountFlowMode;
    message?: string;
    loginUrl?: string;
    importFields?: string[];
    data?: any;
};

export interface RuntimeAdapter {
    isElectron(): boolean;
    getCapabilities(): RuntimeCapabilities;
    getEnvironment(): Promise<string>;
    getProxyBaseUrl(): string;
    getConfig(): Promise<string>;
    saveConfig(config: string): Promise<void>;
    getPreferences(): Promise<string>;
    savePreferences(preferences: string | Record<string, any>): Promise<void>;
    getSettingsSchema(): Promise<string>;
    openExternal(url: string): Promise<void>;
    copyText(content: string): Promise<void>;
    startAccountFlow(platform: MusicPlatform): Promise<RuntimeAccountFlow>;
    getAccountStatus(platform: MusicPlatform): Promise<RuntimeAccountStatus | null>;
    importAccount(platform: MusicPlatform, payload: Record<string, any>): Promise<RuntimeAccountStatus | null>;
    logout(platform: MusicPlatform): Promise<void>;
    validateCookie(platform: MusicPlatform): Promise<any>;
    minimizeWindow(): Promise<void>;
    toggleMaximize(): Promise<boolean>;
    closeWindow(hideToTrayFlag?: boolean): Promise<void>;
    createWindow(title: string, url: string, options?: any): Promise<number>;
    closeWindowById(id: number): Promise<void>;
    setAlwaysOnTop(id: number, flag: boolean): Promise<void>;
    getWindowRect(): Promise<{x: number, y: number, width: number, height: number}>;
    moveWindow(x: number, y: number): Promise<void>;
    getAppData(): Promise<string>;
    isFileExist(path: string): Promise<boolean>;
    readLocalFile(path: string): Promise<string>;
    writeLocalFile(path: string, content: string): Promise<void>;
    getUserName(): Promise<string>;
    setAutoLaunch(isEnabled: boolean): Promise<void>;
}

const WEB_CONFIG_KEY = 'arcanummusic.web.config';
const WEB_PREFERENCES_KEY = 'arcanummusic.web.preferences';
const WEB_SESSION_KEY = 'arcanummusic.web.session';

const platformLinks: Record<MusicPlatform, string> = {
    netease: 'https://music.163.com/',
    qqmusic: 'https://y.qq.com/',
    kuwo: 'https://www.kuwo.cn/',
    kugou: 'https://www.kugou.com/'
};

const platformCookieFields: Record<MusicPlatform, string[]> = {
    netease: ['MUSIC_U'],
    qqmusic: ['uin', 'qm_keyst', 'qqmusic_key'],
    kuwo: ['userid'],
    kugou: ['KuGoo']
};

function getElectronApi(): IElectronAPI | undefined {
    return typeof window !== 'undefined' ? window.electron : undefined;
}

function isElectronRuntime() {
    return !!getElectronApi();
}

function trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, '');
}

function resolvePublicAsset(assetPath: string) {
    const cleanPath = assetPath.replace(/^\/+/, '');
    const baseUrl = window.location.href.split('#')[0];

    return new URL(cleanPath, baseUrl).toString();
}

async function fetchAssetText(assetPath: string) {
    const response = await fetch(resolvePublicAsset(assetPath));
    if (!response.ok) {
        throw new Error(`Failed to fetch asset '${assetPath}' (${response.status})`);
    }

    return response.text();
}

async function fetchJsonAsset(assetPath: string) {
    return await fetchAssetText(assetPath);
}

function getHostedBaseUrl() {
    const baseUrl = String(import.meta.env.VITE_PROXY_BASE_URL || '').trim();
    return baseUrl ? trimTrailingSlash(baseUrl) : '';
}

function getWebSessionId() {
    const existing = window.localStorage.getItem(WEB_SESSION_KEY);
    if (existing) {
        return existing;
    }

    const newId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    window.localStorage.setItem(WEB_SESSION_KEY, newId);
    return newId;
}

function getHostedHeaders() {
    const headers: Record<string, string> = {};
    if (!isElectronRuntime() && getHostedBaseUrl()) {
        headers['X-Arcanum-Session'] = getWebSessionId();
    }
    return headers;
}

async function hostedJsonRequest<T>(path: string, init?: RequestInit) {
    const baseUrl = getHostedBaseUrl();
    if (!baseUrl) {
        throw new Error('Hosted proxy is not configured');
    }

    const requestInit: RequestInit = {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...getHostedHeaders(),
            ...(init?.headers || {})
        }
    };

    const response = await fetch(`${baseUrl}${path}`, requestInit);
    const rawText = await response.text();
    const body = rawText ? JSON.parse(rawText) : null;

    if (!response.ok) {
        throw new Error(body?.error || body?.message || `Hosted request failed (${response.status})`);
    }

    return body as T;
}

function defaultWebCapabilities(): RuntimeCapabilities {
    const hostedProxy = !!getHostedBaseUrl();
    return {
        windowControls: false,
        desktopLyricsWindow: false,
        tray: false,
        localEncryptedAccounts: false,
        hostedProxy,
        browserLogin: hostedProxy
    };
}

const electronAdapter: RuntimeAdapter = {
    isElectron: () => true,
    getCapabilities: () => ({
        windowControls: true,
        desktopLyricsWindow: true,
        tray: true,
        localEncryptedAccounts: true,
        hostedProxy: true,
        browserLogin: false
    }),
    async getEnvironment() {
        return await getElectronApi()?.getAppEnvironment() || 'prod';
    },
    getProxyBaseUrl() {
        const injectedBaseUrl = getHostedBaseUrl();
        if (injectedBaseUrl) {
            return injectedBaseUrl;
        }

        const isDevServer = window.location.port === '5173';
        return `http://localhost:${isDevServer ? 3001 : 3000}`;
    },
    async getConfig() {
        return await getElectronApi()?.getAppConfig() || '{}';
    },
    async saveConfig(config: string) {
        const electron = getElectronApi();
        if (!electron) {
            return;
        }

        const appDataPath = await electron.getAppData();
        const targetFile = `${appDataPath}/ArcanumMusic_data/settings.json`;
        await electron.writeLocalFile(targetFile, config);
    },
    async getPreferences() {
        return await getElectronApi()?.getUserPreference() || '{}';
    },
    async savePreferences(preferences: string | Record<string, any>) {
        const electron = getElectronApi();
        if (!electron) {
            return;
        }

        const payload = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
        await electron.writeUserPreferences(payload);
    },
    async getSettingsSchema() {
        const electron = getElectronApi();
        if (!electron) {
            return '';
        }

        const appEnv = await electron.getAppEnvironment();
        let asarPath = await electron.getAsarLocation();
        asarPath += appEnv === 'dev' ? '/public' : '/dist';
        return await electron.readLocalFile(`${asarPath}/data/AppSettings.xml`);
    },
    async openExternal(url: string) {
        await getElectronApi()?.openExternal(url);
    },
    async copyText(content: string) {
        await getElectronApi()?.copyToClipboard(content);
    },
    async startAccountFlow(platform: MusicPlatform) {
        const electron = getElectronApi();
        if (!electron) {
            return {
                ok: false,
                platform,
                mode: 'unsupported',
                message: 'Electron runtime is unavailable'
            };
        }

        const loginWindowId = await electron.createWindow(`Arcanum Music - ${platform} 登录`, platformLinks[platform]);
        const data = await electron.listenCookie(loginWindowId, platformCookieFields[platform]);

        return {
            ok: !!data,
            platform,
            mode: 'electron',
            data
        };
    },
    async getAccountStatus() {
        return null;
    },
    async importAccount() {
        return null;
    },
    async logout(platform: MusicPlatform) {
        await getElectronApi()?.deleteCookies(platform);
    },
    async validateCookie(platform: MusicPlatform) {
        return await getElectronApi()?.validateCookie(platform);
    },
    async minimizeWindow() {
        await getElectronApi()?.minimizeWindow();
    },
    async toggleMaximize() {
        return await getElectronApi()?.toggleMaximize() || false;
    },
    async closeWindow(hideToTrayFlag?: boolean) {
        await getElectronApi()?.closeWindow(hideToTrayFlag);
    },
    async createWindow(title: string, url: string, options?: any) {
        return await getElectronApi()?.createWindow(title, url, options) || -1;
    },
    async closeWindowById(id: number) {
        await getElectronApi()?.closeWindowById(id);
    },
    async setAlwaysOnTop(id: number, flag: boolean) {
        await getElectronApi()?.setAlwaysOnTop(id, flag);
    },
    async getWindowRect() {
        return await getElectronApi()?.getWindowRect() || { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    },
    async moveWindow(x: number, y: number) {
        await getElectronApi()?.moveWindow(x, y);
    },
    async getAppData() {
        return await getElectronApi()?.getAppData() || '';
    },
    async isFileExist(path: string) {
        return await getElectronApi()?.isFileExist(path) || false;
    },
    async readLocalFile(path: string) {
        return await getElectronApi()?.readLocalFile(path) || '';
    },
    async writeLocalFile(path: string, content: string) {
        await getElectronApi()?.writeLocalFile(path, content);
    },
    async getUserName() {
        return await getElectronApi()?.getUserName() || 'desktop-user';
    },
    async setAutoLaunch(isEnabled: boolean) {
        await getElectronApi()?.setAutoLaunch(isEnabled);
    }
};

const webAdapter: RuntimeAdapter = {
    isElectron: () => false,
    getCapabilities: () => defaultWebCapabilities(),
    async getEnvironment() {
        return 'web';
    },
    getProxyBaseUrl() {
        return getHostedBaseUrl();
    },
    async getConfig() {
        const stored = window.localStorage.getItem(WEB_CONFIG_KEY);
        if (stored) {
            return stored;
        }

        const content = await fetchJsonAsset('./data/settings.json');
        window.localStorage.setItem(WEB_CONFIG_KEY, content);
        return content;
    },
    async saveConfig(config: string) {
        window.localStorage.setItem(WEB_CONFIG_KEY, config);
    },
    async getPreferences() {
        const stored = window.localStorage.getItem(WEB_PREFERENCES_KEY);
        if (stored) {
            return stored;
        }

        const content = await fetchJsonAsset('./data/userPreferences.json');
        window.localStorage.setItem(WEB_PREFERENCES_KEY, content);
        return content;
    },
    async savePreferences(preferences: string | Record<string, any>) {
        const payload = typeof preferences === 'string' ? preferences : JSON.stringify(preferences);
        window.localStorage.setItem(WEB_PREFERENCES_KEY, payload);
    },
    async getSettingsSchema() {
        return await fetchAssetText('./data/AppSettings.xml');
    },
    async openExternal(url: string) {
        window.open(url, '_blank', 'noopener,noreferrer');
    },
    async copyText(content: string) {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(content);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.setAttribute('readonly', 'readonly');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
    },
    async startAccountFlow(platform: MusicPlatform) {
        if (!getHostedBaseUrl()) {
            return {
                ok: false,
                platform,
                mode: 'unsupported',
                message: '当前 Web/PWA 构建未配置线上代理与账号服务'
            };
        }

        return await hostedJsonRequest<RuntimeAccountFlow>(`/auth/${platform}/start`, {
            method: 'GET'
        });
    },
    async getAccountStatus(platform: MusicPlatform) {
        if (!getHostedBaseUrl()) {
            return null;
        }

        return await hostedJsonRequest<RuntimeAccountStatus>(`/auth/${platform}/status`, {
            method: 'GET'
        });
    },
    async importAccount(platform: MusicPlatform, payload: Record<string, any>) {
        if (!getHostedBaseUrl()) {
            return null;
        }

        return await hostedJsonRequest<RuntimeAccountStatus>(`/auth/${platform}/import`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },
    async logout(platform: MusicPlatform) {
        if (!getHostedBaseUrl()) {
            return;
        }

        await hostedJsonRequest(`/auth/${platform}/logout`, {
            method: 'POST',
            body: JSON.stringify({})
        });
    },
    async validateCookie(platform: MusicPlatform) {
        const status = await this.getAccountStatus(platform);
        return !!status?.loggedIn;
    },
    async minimizeWindow() {},
    async toggleMaximize() {
        return false;
    },
    async closeWindow() {
        window.close();
    },
    async createWindow(_: string, url: string) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return -1;
    },
    async closeWindowById() {},
    async setAlwaysOnTop() {},
    async getWindowRect() {
        return {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };
    },
    async moveWindow() {},
    async getAppData() {
        return '';
    },
    async isFileExist() {
        return false;
    },
    async readLocalFile(path: string) {
        try {
            return await fetchAssetText(path);
        }
        catch {
            return '';
        }
    },
    async writeLocalFile() {},
    async getUserName() {
        return 'web-user';
    },
    async setAutoLaunch() {}
};

export const runtime: RuntimeAdapter = isElectronRuntime() ? electronAdapter : webAdapter;
export const platformAccountLinks = platformLinks;
export const platformAccountCookieFields = platformCookieFields;

export function getRuntimeHeaders() {
    return getHostedHeaders();
}
