// 应用配置及偏好设置
let appConfig: any = undefined;
let userPreference: any = undefined;

// 设置文件判断 & 创建 / 读取
function prepareSettings() {
    return new Promise<string>(async (resolve) => {
        let configData = await window.electron.getAppConfig();

        resolve(configData);
    });
}

/**
 * 加载配置文件
 * @returns Promise<object> - 配置文件内容
 */
async function loadConfig() {
    // 设置文件准备
    let configData = await prepareSettings();
    appConfig = JSON.parse(configData);
    console.log(appConfig);

    return appConfig;
}

/**
 * 设置配置内容
 * @param config 配置文件内容
 */
function setConfig(config: any) {
    if (!appConfig) {
        console.error(`[Error] Config not loaded, please call loadConfig() first`);
        return;
    }
    appConfig = config;

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

// 偏好设置文件判断 & 创建 / 读取
function preparePreference() {
    return new Promise<string>(async (resolve) => {
        let prefData = await window.electron.getUserPreference();

        resolve(prefData);
    });
}

/**
 * 加载用户偏好设置
 * @returns Promise<object> - 用户偏好设置
 */
async function loadPreference() {
    // 准备偏好设置文件
    let prefData = await preparePreference();
    userPreference = JSON.parse(prefData);
    console.log(userPreference);

    return userPreference;
}

/**
 * 设置用户偏好
 * @param pref 偏好设置内容
 */
function writePreference(pref: any) {
    if (!userPreference) {
        console.error(`[Error] User preference not loaded, please call loadPreference() first`);
        return;
    }
    userPreference = pref;

    window.electron.writeUserPreferences(userPreference);

    return userPreference;
}

/**
 * 获取偏好设置
 * @returns object - 偏好设置内容
 */
function getPreference() {
    if (!userPreference) {
        console.error(`[Error] Config not loaded, please call loadPreference() first`);
        return;
    }
    return userPreference;
}

export {
    loadConfig,
    getConfig,
    setConfig,
    loadPreference,
    writePreference,
    getPreference
};
