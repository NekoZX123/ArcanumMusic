// Electron API 声明

export interface IElectronAPI {
    createWindow: (title: String, url: String, options?: any) => Promise<number>,
    minimizeWindow: () => Promise<void>,
    toggleMaximize: () => Promise<boolean>,
    closeWindow: () => Promise<void>,
    setAlwaysOnTop: (id: number, flag: boolean) => Promise<void>,
    closeWindowById: (windowId: Number) => Promise<void>,
    
    getWindowRect: () => Promise<{x: number, y: number, width: number, height: number}>,
    moveWindow: (x: Number, y: Number) => Promise<void>,

    isFileExist: (path: String) => Promise<boolean>,
    readLocalFile: (path: String) => Promise<string>,
    writeLocalFile: (path: String, content: String) => Promise<void>,

    getAppConfig: () => Promise<string>,
    getUserPreference: () => Promise<string>,
    writeUserPreferences: (pref: string) => Promise<void>,
    
    getAppData: () => Promise<string>,
    getAppEnvironment: () => Promise<string>,
    getAsarLocation: () => Promise<string>,
    getUserName: () => Promise<string>,

    listenCookie: (windowId: Number, targetCookies: String[]) => Promise<any>,
    validateCookie: (platform: string) => Promise<any>,
    deleteCookies: (platform: string) => Promise<void>,

    openExternal: (url: String) => Promise<void>,
    copyToClipboard: (content: String) => Promise<void>
}

declare global {
    interface Window {
        __qmfe_sign_check: any,
        electron: IElectronAPI
    }
}

declare module "*.vue" {
    import { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}
