import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import { fileURLToPath } from 'url';
import { mkdir, copyFileSync } from 'fs';

import { startService, stopService } from './service.js';
import { isFileExist, readLocalFile, writeLocalFile } from './fileManager.js';

const __dirname = fileURLToPath(import.meta.url);

const environment = 'dev';
let tray;
let mainWindow = null;

// 获取应用配置
async function getAppConfig() {
    let prefix = getAppDataLocal();
    let confPath = prefix + '\\ArcanumMusic\\settings.json';

    let fileExist = await isFileExist(null, confPath);
    // console.log(fileExist);
    if (!fileExist) {
        let asarFolder = (environment === 'dev' ? 'public' : 'dist');
        let defaultPath = __dirname.replace('app\\app.js', `${asarFolder}/data/settings.json`);

        let configDir = confPath.substring(0, confPath.lastIndexOf('\\'));
        await new Promise((resolve, reject) => {
            mkdir(configDir, { recursive: true }, (err) => {
                if (err) {
                    console.error('[Error] Directory creation failed: ', err);
                    reject(err);
                } else {
                    copyFileSync(defaultPath, confPath);
                    resolve();
                }
            });
        });
    }

    return await readLocalFile(null, confPath);
}

// 创建主窗口
function createWindow() {
    getAppConfig();

    mainWindow = new BrowserWindow({
        width: 1000,
        height: 650,
        minWidth: 900,
        minHeight: 500,
        frame: false,
        resizable: true,
        focusable: true,
        skipTaskbar: false,
        alwaysOnTop: false,
        title: 'Arcanum Music',
        icon: `${environment === 'dev' ? './public' : 'dist'}/images/appIcon/appIcon.png`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: __dirname.replace('app.js', 'preload.mjs')
        }
    });

    if (environment === 'dev') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile('dist/index.html');
    }
}

// 新建窗口
function newWindow(_, title, url) {
    let newAppWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 600,
        minHeight: 400,
        frame: true,
        resizable: true,
        focusable: true,
        title: title,
        icon: `${environment === 'dev' ? './public' : 'dist'}/images/appIcon/appIcon.png`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true
        }
    });

    newAppWindow.loadURL(url);
}

// 窗口操作
function minimizeWindow(_) {
    if (mainWindow) {
        mainWindow.minimize();
    }
}

function toggleMaximize(_) {
    if (mainWindow) {
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        else mainWindow.maximize();

        return mainWindow.isMaximized();
    }
}

function closeWindow(_) {
    if (mainWindow) {
        mainWindow.close();
    }
}

function getWindowRect(_) {
    if (mainWindow) {
        return mainWindow.getBounds();
    }
    else return undefined;
}

function moveWindow(_, x, y) {
    if (mainWindow) {
        mainWindow.setPosition(x, y);
    }
}


// 获取 %AppData%
function getAppDataLocal() {
    let roamingPath = app.getPath('appData')
    return roamingPath.replace('Roaming', 'Local');
}

app.whenReady().then(() => {
    ipcMain.handle('newAppWindow', newWindow);
    ipcMain.handle('minimizeWindow', minimizeWindow);
    ipcMain.handle('maximizeWindow', toggleMaximize);
    ipcMain.handle('closeWindow', closeWindow);
    ipcMain.handle('getWindowRect', getWindowRect);
    ipcMain.handle('moveWindow', moveWindow);

    ipcMain.handle('isFileExist', isFileExist);
    ipcMain.handle('readLocalFile', readLocalFile);
    ipcMain.handle('writeLocalFile', writeLocalFile);

    ipcMain.handle('getAppConfig', getAppConfig);
    ipcMain.handle('getAppEnvironment', () => environment);
    ipcMain.handle('getAppDataLocal', getAppDataLocal);
    ipcMain.handle('getAsarLocation', () => app.getAppPath());

    startService();
    createWindow();

    // 托盘图标
    tray = new Tray(`${environment === 'dev' ? './public' : 'dist'}/images/appIcon/appIcon.png`);
    const menu = Menu.buildFromTemplate([
        {
            label: 'Exit',
            type: 'normal',
            click: () => {
                stopService();
                app.quit();
            }
        }
    ]);
    tray.setToolTip('Arcanum Music');
    tray.setContextMenu(menu);
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        stopService();
        app.quit();
    }
});
