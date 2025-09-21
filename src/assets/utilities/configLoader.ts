// 设置文件位置
const configLocation = '/ArcanumMusic/settings.json';
var appConfig: any = undefined;

// 获取应用配置存放位置
async function getConfigPath() {
    let prefix = await window.electron.getAppDataLocal();
    return `${prefix}${configLocation}`;
}
// 设置文件判断 & 创建 / 读取
function prepareSettings() {
    return new Promise<string>(async (resolve) => {
        let configPath = await getConfigPath();

        let configData = await window.electron.readLocalFile(configPath);

        resolve(configData);
    });
}

/**
 * 加载配置文件
 * @returns Promise<string> - 配置文件内容
 */
async function loadConfig() {
    // 设置文件准备
    let configData = await prepareSettings();
    appConfig = JSON.parse(configData);
    console.log(appConfig);

    return appConfig;
}

/**
 * 获取配置内容
 * @returns object - 配置文件内容
 */
function getConfig() {
    if (!appConfig) {
        console.error(`[Error] Config not loaded, please call loadConfig() first`);
        return;
    }
    return appConfig;
}

export { loadConfig, getConfig };
