// Electron API 声明

export interface IElectronAPI {
    createWindow: (title: String, url: String) => Promise,
    minimizeWindow: () => Promise,
    toggleMaximize: () => Promise,
    closeWindow: () => Promise,
    closeWindowById: (windowId: Number) => Promise,
    
    getWindowRect: () => Promise,
    moveWindow: (x: Number, y: Number) => Promise,

    isFileExist: (path: String) => Promise,
    readLocalFile: (path: String) => Promise,
    writeLocalFile: (path: String, content: String) => Promise,

    getAppConfig: () => Promise,
    getAppDataLocal: () => Promise,
    getAppEnvironment: () => Promise,
    getAsarLocation: () => Promise,
    getUserName: () => Promise,

    listenCookie: (windowId: Number, targetCookies: String[]) => Promise,
    validateCookie: (platform: string) => Promise,

    openExternal: (url: String) => Promise,
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
