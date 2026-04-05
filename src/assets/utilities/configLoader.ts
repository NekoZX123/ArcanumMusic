import { runtime } from '../../runtime';

let appConfig: any = undefined;
let userPreference: any = undefined;

async function loadConfig() {
    const configData = await runtime.getConfig();
    appConfig = JSON.parse(configData);
    return appConfig;
}

const configChangeEvent = new CustomEvent('config-change');

function setConfig(config: any) {
    if (!appConfig) {
        console.error('[Error] Config not loaded, please call loadConfig() first');
        return;
    }
    appConfig = config;

    window.dispatchEvent(configChangeEvent);

    return appConfig;
}

function getConfig() {
    if (!appConfig) {
        console.error('[Error] Config not loaded, please call loadConfig() first');
        return;
    }
    return appConfig;
}

async function loadPreference() {
    const prefData = await runtime.getPreferences();
    userPreference = JSON.parse(prefData);

    return userPreference;
}

function writePreference(pref: any) {
    if (!userPreference) {
        console.error('[Error] User preference not loaded, please call loadPreference() first');
        return;
    }
    userPreference = pref;

    runtime.savePreferences(userPreference);

    return userPreference;
}

function getPreference() {
    if (!userPreference) {
        console.error('[Error] Config not loaded, please call loadPreference() first');
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
