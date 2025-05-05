import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import { fileURLToPath } from 'url';
import { mkdir, copyFileSync } from 'fs';

import { startService, stopService } from './service.js';
import { isFileExist, readLocalFile, writeLocalFile } from './fileManager.js';
import { resolve } from 'path';
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

// 创建 / 获取账号数据存放目录
async function prepareAccountStorage() {
    let prefix = getAppDataLocal();
    let accountPath = prefix + '\\ArcanumMusic\\accounts\\accounts.json';

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
function createWindow() {
    prepareAccountStorage();
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

    return newAppWindow.id;
}

// 用户账户相关操作

// 获取网易云用户信息
function getNeteaseUser(id) {
    return new Promise((resolve) => {
        const appWindow = BrowserWindow.fromId(id);
        if (appWindow) {
            // 获取用户头像昵称
            appWindow.webContents.executeJavaScript('window.localStorage.G_USER', true)
                .then((result) => {
                    let data = JSON.parse(result);

                    let userData = {
                        avatarUrl: data['avatarUrl'],
                        nickname: data['nickname']
                    };

                    resolve(userData);
                });
        }
    });
}
// 获取酷狗音乐头像
function getKugouAvatar(id) {
    return new Promise((resolve) => {
        const appWindow = BrowserWindow.fromId(id);
        if (appWindow) {
            // 获取头像
            appWindow.webContents.executeJavaScript('document.querySelector(".cmhead1_i2").src', true)
                .then((result) => {
                    let element = result;
                    resolve(element.src);
                })
        }
    });
}

// cookie 监听功能
function listenForCookie(_, id, targets) {
    return new Promise((resolve) => {
        const appWindow = BrowserWindow.fromId(id);
        if (appWindow) {
            const cookiesMap = {};
            const checkCompletion = () => {
                if (targets.every(target => target in cookiesMap)) {
                    if (targets.includes('MUSIC_U')) { // 网易云音乐
                        getNeteaseUser(id).then((userData) => {
                            console.log(`[Debug] User data (netease) received: ${JSON.stringify(userData)}`);
                            let result = {
                                cookies: cookiesMap,
                                userData: userData
                            };
                            resolve(result);
                        });
                    }
                    else if (targets.includes('uname3')) { // 酷我音乐
                        let avatarUrl = cookiesMap['pic3'];
                        let nickname = cookiesMap['uname3'];
                        let result = {
                            userData: {
                                avatarUrl: avatarUrl.replace(/"/g, ''),
                                nickname: decodeURIComponent(nickname.replace(/%u([\dA-F]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))),
                            },
                            cookies: {
                                userid: cookiesMap['userid']
                            }
                        }
                        console.log(`[Debug] User data (kuwo) received: ${JSON.stringify(result)}`);
                        resolve(result);
                    }
                    else {
                        resolve({ 'cookies': cookiesMap });
                    }
                }
            };

            appWindow.webContents.session.cookies.on('changed', (_, cookie) => {
                if (targets.includes(cookie.name)) {
                    cookiesMap[cookie.name] = cookie.value;
                    console.log(`[Debug] ${cookie.name} = ${cookie.value}`);
                    checkCompletion();
                }
            });

            // 起始检查
            appWindow.webContents.session.cookies.get({})
                .then((cookies) => {
                    cookies.forEach(cookie => {
                        if (targets.includes(cookie.name)) {
                            cookiesMap[cookie.name] = cookie.value;
                            console.log(`[Debug] ${cookie.name} = ${cookie.value}`);
                        }
                    });
                    checkCompletion();
                });
        } else {
            resolve({});
        }
    });
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

function closeWindow(_) {
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
    ipcMain.handle('closeWindowById', closeWindowById);

    ipcMain.handle('isFileExist', isFileExist);
    ipcMain.handle('readLocalFile', readLocalFile);
    ipcMain.handle('writeLocalFile', writeLocalFile);

    ipcMain.handle('getAppConfig', getAppConfig);
    ipcMain.handle('getAppEnvironment', () => environment);
    ipcMain.handle('getAppDataLocal', getAppDataLocal);
    ipcMain.handle('getAsarLocation', () => app.getAppPath());

    ipcMain.handle('listenCookie', listenForCookie);

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
