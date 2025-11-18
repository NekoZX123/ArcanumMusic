import { app, BrowserWindow, ipcMain, Menu, shell, Tray, clipboard } from 'electron';
import { fileURLToPath } from 'url';
import { userInfo } from 'os';
import pkg from 'auto-launch';
const AutoLaunch = pkg;

import { startService, stopService } from './service.js';
// import { startWebSocket } from './webSocket.js';
import { isFileExist, readLocalFile, writeLocalFile } from './fileManager.js';
import { deleteCookies, validateCookieExpiration, listenForCookie, prepareAccountStorage } from './accountHelper.js';
import { getAppData, getEnvironment } from './globalUtils.js';
import { getAppConfig, getUserPreferences, writeUserPreferences } from "./configHelper.js";

const __dirname = fileURLToPath(import.meta.url);

const environment = getEnvironment();
let tray;
let mainWindow = null;

// 开机自启控制器
const autoLauncher = new AutoLaunch({
    name: 'Arcanum Music'
});
// 确保正确设置开机自启
async function ensureAutoLaunchState(state) {
    const isAutoLaunch = await autoLauncher.isEnabled();

    if (state && !isAutoLaunch) { // 启用开机自启
        console.log('[Debug] Auto launch enabled');
        autoLauncher.enable();
    }
    if (!state && isAutoLaunch) { // 禁用开机自启
        console.log('[Debug] Auto launch disabled');
        autoLauncher.disable();
    }
}

// 创建主窗口
async function createMainWindow() {
    prepareAccountStorage();
    const config = await getAppConfig();
    const configObject = JSON.parse(config);

    const preferenceText = await getUserPreferences();
    const userPreferences = JSON.parse(preferenceText);

    // 开机自启判断
    const autoLaunchFlag = configObject.generic.system.start.startOnBoot;
    ensureAutoLaunchState(autoLaunchFlag);
    // 是否使用系统边框
    const windowFrame = configObject.generic.appearance.window.useSystemFrame;

    // 窗口偏好设置
    const windowOptions = userPreferences.window;

    // checkCookieExpired();

    mainWindow = new BrowserWindow({
        width: windowOptions.width,
        height: windowOptions.height,
        minWidth: 900,
        minHeight: 500,
        frame: windowFrame,
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

    if (windowOptions.isMaximized) {
        mainWindow.maximize();
    }

    if (environment === 'dev') {
        mainWindow.loadURL('http://localhost:5173');
    }
    else {
        mainWindow.loadFile('dist/index.html');
    }

    // 关闭主窗口时防止窗口残留
    mainWindow.on('closed', () => {
        const windowList = BrowserWindow.getAllWindows();
        windowList.forEach((window) => {
            if (window.id !== mainWindow.id) window.close();
        });
    });
    
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

async function savePreferences(_, pref) {
    const preference = pref;

    const config = JSON.parse(await getAppConfig());
    if (!config.generic.appearance.window.rememberSize) {
        preference.window.width = 1000;
        preference.window.height = 650;
        preference.window.isMaximized = false;
    }
    // console.log(`[Debug] Preferences: ${JSON.stringify(preference)}`);

    await writeUserPreferences(JSON.stringify(preference));
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
    ipcMain.handle('getPreference', getUserPreferences);
    ipcMain.handle('writePreference', savePreferences);
    ipcMain.handle('getAppEnvironment', () => environment);
    ipcMain.handle('getAppData', () => getAppData());
    ipcMain.handle('getAsarLocation', () => {console.log(app.getAppPath()); return app.getAppPath()});
    ipcMain.handle('getUserName', () => userInfo().username);

    ipcMain.handle('validateCookieExpiration', validateCookieExpiration);
    ipcMain.handle('listenCookie', listenForCookie);
    ipcMain.handle('deleteCookie', deleteCookies);

    ipcMain.handle('openExternal', (_, url) => shell.openExternal(url));
    ipcMain.handle('copyContent', (_, content) => clipboard.writeText(content));
    ipcMain.handle('setAutoLaunch', (_, isEnabled) => ensureAutoLaunchState(isEnabled));

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
