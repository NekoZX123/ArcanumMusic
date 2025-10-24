import { app, BrowserWindow, ipcMain, Menu, shell, Tray, clipboard } from 'electron';
import { fileURLToPath } from 'url';
import { copyFileSync, mkdir } from 'fs';
import { userInfo } from 'os';
import { startService, stopService } from './service.js';
import { startWebSocket } from './webSocket.js';
import { isFileExist, readLocalFile, writeLocalFile } from './fileManager.js';
import { deleteCookies, validateCookieExpiration, listenForCookie } from './accountHelper.js';

const __dirname = fileURLToPath(import.meta.url);

// const environment = 'dev';
const environment = 'build-kyrios-internal';
let tray;
let mainWindow = null;

// 获取应用配置
async function getAppConfig() {
    let prefix = getAppData();
    let confPath = prefix + '\\ArcanumMusic_data\\settings.json';

    let fileExist = await isFileExist(null, confPath);
    // console.log(confPath, fileExist);
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

// 创建 / 获取账号数据存放目录
async function prepareAccountStorage() {
    let prefix = getAppData();
    let accountPath = prefix + '\\ArcanumMusic_data\\accounts\\accounts.json';

    let fileExist = await isFileExist(null, accountPath);
    if (!fileExist) {
        let configDir = accountPath.substring(0, accountPath.lastIndexOf('\\'));
        await new Promise((resolve, reject) => {
            mkdir(configDir, { recursive: true }, (err) => {
                if (err) {
                    console.error('[Error] Directory creation failed: ', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    return accountPath;
}

// 创建主窗口
function createMainWindow() {
    prepareAccountStorage();
    const configLoad = getAppConfig();

    // checkCookieExpired();

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
        icon: `${environment === 'dev' ? './public' : './dist'}/appIcon/AppIcon.ico`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: __dirname.replace('app.js', 'preload.mjs')
        }
    });

    if (environment === 'dev') {
        mainWindow.loadURL('http://localhost:5173');
    }
    else {
        mainWindow.loadFile('dist/index.html');
    }

    // 防止窗口残留
    mainWindow.on('closed', () => {
        const windowList = BrowserWindow.getAllWindows();
        windowList.forEach((window) => {
            if (window.id !== mainWindow.id) window.close();
        });
    });
    
    configLoad.then((config) => {
        const configObject = JSON.parse(config);

        if (configObject.developerOptions.application.devtoolsOnLaunched) { // 启动时打开开发者工具
            mainWindow.webContents.openDevTools();
        }

        if (!configObject.developerOptions.application.enableDevtoolsHotkey){ // 根据设置禁用 DevTools 快捷键
            mainWindow.webContents.on('before-input-event', (event, input) => {
                if (input.key === 'I' && input.control && input.shift && !input.meta && !input.alt) {
                    console.log('[Debug] Due to user settings, DevTools launch request rejected');
                    event.preventDefault();
                }
            });
        }
    });
}

// 新建窗口
function newWindow(_, title, url, options) {
    let windowConfig;
    if (options) {
        windowConfig = options;
        windowConfig.icon = `${environment === 'dev' ? './public' : './dist'}/appIcon/AppIcon.ico`;
        windowConfig.webPreferences = {
            nodeIntegration: true,
            contextIsolation: true,
            preload: __dirname.replace('app.js', 'preload.mjs')
        };
    }
    else {
        windowConfig = {
            width: 1000,
            height: 600,
            minWidth: 600,
            minHeight: 400,
            frame: true,
            resizable: true,
            focusable: true,
            title: title,
            icon: `${environment === 'dev' ? './public' : './dist'}/appIcon/AppIcon.ico`,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: __dirname.replace('app.js', 'preload.mjs')
            }
        };
    }
    let newAppWindow = new BrowserWindow(windowConfig);

    newAppWindow.loadURL(url);

    return newAppWindow.id;
}

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

// 调整指定窗口是否置顶
function setWindowTopState(_, id, flag) {
    const targetWindow = BrowserWindow.fromId(id);
    if (targetWindow) {
        targetWindow.setAlwaysOnTop(flag);
    }
}

function closeAllWindows(_) {
    // 先关闭所有非主窗口
    const windowList = BrowserWindow.getAllWindows();
    windowList.forEach((window) => {
        if (window.id !== mainWindow.id) window.close();
    });
    
    if (mainWindow) {
        mainWindow.close();
    }
}

// 根据 ID 关闭窗口
function closeWindowById(_, id) {
    let targetWindow = BrowserWindow.fromId(id);
    if (targetWindow) {
        targetWindow.close();
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

/**
 * 获取 %AppData%
 */
function getAppData(_) {
    return app.getPath('appData');
}

app.whenReady().then(() => {
    // 添加事件触发
    ipcMain.handle('newAppWindow', newWindow);
    ipcMain.handle('minimizeWindow', minimizeWindow);
    ipcMain.handle('maximizeWindow', toggleMaximize);
    ipcMain.handle('closeWindow', closeAllWindows);
    ipcMain.handle('getWindowRect', getWindowRect);
    ipcMain.handle('moveWindow', moveWindow);
    ipcMain.handle('setAlwaysOnTop', setWindowTopState);
    ipcMain.handle('closeWindowById', closeWindowById);

    ipcMain.handle('isFileExist', isFileExist);
    ipcMain.handle('readLocalFile', readLocalFile);
    ipcMain.handle('writeLocalFile', writeLocalFile);

    ipcMain.handle('getAppConfig', getAppConfig);
    ipcMain.handle('getAppEnvironment', () => environment);
    ipcMain.handle('getAppData', () => getAppData());
    ipcMain.handle('getAsarLocation', () => {console.log(app.getAppPath()); return app.getAppPath()});
    ipcMain.handle('getUserName', () => userInfo().username);

    ipcMain.handle('validateCookieExpiration', validateCookieExpiration);
    ipcMain.handle('listenCookie', listenForCookie);
    ipcMain.handle('deleteCookie', deleteCookies);

    ipcMain.handle('openExternal', (_, url) => shell.openExternal(url));
    ipcMain.handle('copyContent', (_, content) => clipboard.writeText(content));

    // 启动服务
    startService(environment);
    // startWebSocket();

    // 创建应用主窗口
    createMainWindow();

    // 托盘图标
    tray = new Tray(`${environment === 'dev' ? './public' : `${app.getAppPath()}/dist`}/appIcon/AppIcon.ico`);
    const menu = Menu.buildFromTemplate([
        {
            label: '退出',
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
