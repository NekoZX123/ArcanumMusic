import { app } from 'electron';

// 运行环境
// const environment = 'dev';
const environment = 'build-kyrios-internal';

/**
 * 获取 %AppData%
 */
function getAppData(_) {
    return app.getPath('appData');
}

function getEnvironment(_) {
    return environment;
}

export {
    getAppData,
    getEnvironment,
};
