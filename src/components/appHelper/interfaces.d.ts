// Electron API 声明

export interface IElectronAPI {
    minimizeWindow: () => Promise,
    toggleMaximize: () => Promise,
    closeWindow: () => Promise,
    
    getWindowRect: () => Promise,
    moveWindow: (x: Number, y: Number) => Promise,

    isFileExist: (path: String) => Promise,
    readLocalFile: (path: String) => Promise,
    writeLocalFile: (path: String, content: String) => Promise,

    getAppConfig: () => Promise,
    getAppDataLocal: () => Promise,
    getAppEnvironment: () => Promise,
    getAsarLocation: () => Promise
}

declare global {
    interface Window {
        electron: IElectronAPI
    }
}