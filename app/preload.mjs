import { contextBridge, ipcRenderer } from 'electron/renderer';

console.log('preload.mjs loaded');

contextBridge.exposeInMainWorld(
    'electron', 
    {
        minimizeWindow: () => ipcRenderer.invoke('minimizeWindow'), // 最小化窗口
        toggleMaximize: () => ipcRenderer.invoke('maximizeWindow'), // 最大化 / 还原窗口
        closeWindow: () => ipcRenderer.invoke('closeWindow'), // 关闭窗口
        getWindowRect: () => ipcRenderer.invoke('getWindowRect'), // 获取窗口位置大小
        moveWindow: (x, y) => ipcRenderer.invoke('moveWindow', x, y), // 移动窗口位置

        isFileExist: (path) => ipcRenderer.invoke('isFileExist', path), // 检查文件是否存在
        readLocalFile: (path) => ipcRenderer.invoke('readLocalFile', path), // 读取本地文件
        writeLocalFile: (path, content) => ipcRenderer.invoke('writeLocalFile', path, content), // 写入本地文件
        getAppDataLocal: () => ipcRenderer.invoke('getAppDataLocal') // 获取 %AppData%
    }
);
