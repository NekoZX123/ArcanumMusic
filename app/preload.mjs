import { contextBridge, ipcRenderer } from 'electron/renderer';

console.log('preload.mjs loaded');

contextBridge.exposeInMainWorld(
    'electron', 
    {
        createWindow: (title, url) => ipcRenderer.invoke('newAppWindow', title, url), // 创建新窗口
        minimizeWindow: () => ipcRenderer.invoke('minimizeWindow'), // 最小化主窗口
        toggleMaximize: () => ipcRenderer.invoke('maximizeWindow'), // 最大化 / 还原主窗口
        closeWindow: () => ipcRenderer.invoke('closeWindow'), // 关闭主窗口
        getWindowRect: () => ipcRenderer.invoke('getWindowRect'), // 获取主窗口位置大小
        moveWindow: (x, y) => ipcRenderer.invoke('moveWindow', x, y), // 移动主窗口位置
        closeWindowById: (id) => ipcRenderer.invoke('closeWindowById', id), // 根据 ID 关闭非主窗口

        isFileExist: (path) => ipcRenderer.invoke('isFileExist', path), // 检查文件是否存在
        readLocalFile: (path) => ipcRenderer.invoke('readLocalFile', path), // 读取本地文件
        writeLocalFile: (path, content) => ipcRenderer.invoke('writeLocalFile', path, content), // 写入本地文件
        
        getAppConfig: () => ipcRenderer.invoke('getAppConfig'), // 获取应用配置
        getAppEnvironment: () => ipcRenderer.invoke('getAppEnvironment'), // 获取应用环境
        getAppDataLocal: () => ipcRenderer.invoke('getAppDataLocal'), // 获取 %AppData%
        getAsarLocation: () => ipcRenderer.invoke('getAsarLocation'), // 获取 asar 文件位置
        
        listenCookie: (windowId, targetCookies) => ipcRenderer.invoke('listenCookie', windowId, targetCookies), // 监听 cookie
    }
);
