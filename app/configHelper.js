// 获取应用配置
import { isFileExist, readLocalFile, writeLocalFile } from "./fileManager.js";
import { copyFileSync, mkdir } from "fs";
import { getAppData, getEnvironment } from "./globalUtils.js";
import { fileURLToPath } from "url";
import { app } from 'electron';

const __dirname = fileURLToPath(import.meta.url);

const configPath = '/ArcanumMusic_data/settings.json';
const preferencePath = '/ArcanumMusic_data/userPreferences.json';
const historyPath = '/ArcanumMusic_data/history.json';
const localMusicPath = '/ArcanumMusic_data/localMusic.list';

async function getAppConfig() {
    let prefix = getAppData();
    let confPath = prefix + configPath;

    let fileExist = await isFileExist(null, confPath);
    // console.log(confPath, fileExist);
    // 文件不存在时创建
    if (!fileExist) {
        let asarFolder = (getEnvironment() === 'dev' ? 'public' : 'dist');
        let defaultPath = __dirname
            .replace('app/configHelper.js', `${asarFolder}/data/settings.json`)
            .replace('app\\configHelper.js', `${asarFolder}/data/settings.json`);

        let configDir = confPath.substring(0, confPath.lastIndexOf('/'));
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

async function getUserPreferences() {
    let prefix = getAppData();
    let prefPath = prefix + preferencePath;

    let fileExist = await isFileExist(null, prefPath);
    // 文件不存在时创建
    if (!fileExist) {
        let asarFolder = (getEnvironment() === 'dev' ? 'public' : 'dist');
        let defaultPath = __dirname
            .replace('app/configHelper.js', `${asarFolder}/data/userPreferences.json`)
            .replace('app\\configHelper.js', `${asarFolder}/data/userPreferences.json`);

        let configDir = prefPath.substring(0, prefPath.lastIndexOf('/'));
        await new Promise((resolve, reject) => {
            mkdir(configDir, { recursive: true }, (err) => {
                if (err) {
                    console.error('[Error] Directory creation failed: ', err);
                    reject(err);
                } else {
                    copyFileSync(defaultPath, prefPath);
                    resolve();
                }
            });
        });
    }

    return await readLocalFile(null, prefPath);
}

async function writeUserPreferences(prefText) {
    let prefix = getAppData();
    let prefPath = prefix + preferencePath;

    console.log(prefPath, prefText);
    await writeLocalFile(undefined, prefPath, prefText);
}

async function getLocalMusicPaths() {
    let prefix = getAppData();
    let listPath = prefix + localMusicPath;

    let fileExist = await isFileExist(null, listPath);
    if (!fileExist) {
        let configDir = listPath.substring(0, listPath.lastIndexOf('/'));
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

        const defaultPaths = [app.getPath('music')];
        await writeLocalFile(undefined, listPath, defaultPaths.join('\n'));
        return defaultPaths;
    }

    let content = await readLocalFile(null, listPath);
    return content ? content.trim().split('\n').filter(line => line.trim() !== '') : [];
}

async function writeLocalMusicPaths(paths) {
    let prefix = getAppData();
    let listPath = prefix + localMusicPath;

    await writeLocalFile(undefined, listPath, paths.join('\n'));
}

export {
    getAppConfig,
    getUserPreferences,
    writeUserPreferences,
    getLocalMusicPaths,
    writeLocalMusicPaths
}
