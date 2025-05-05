import { access, constants, mkdir, readFile, writeFile } from 'fs';

// 检查文件是否存在
async function isFileExist(event, path) {
    return new Promise((resolve) => {
        access(path, constants.F_OK, (err) => {
            if (err) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

// 读取本地文件
async function readLocalFile(event, path) {
    return new Promise((resolve) => {
        readFile(path, 'utf-8', (err, data) => {
            if (err) {                
                console.error(`[Error (code ${err.code})] ${err.message}`);
                resolve(null);
            }
    
            resolve(data.toString());
        });
    });
}

// 写入本地文件
async function writeLocalFile(event, path, content) {
    writeFile(path, content, 'utf-8', (err) => {
        if (!err) return;

        if (err.code.toString() === 'ENOENT') {
            let parts = path.split('\\');
            let dirPath = parts.splice(0, parts.length - 1).join('\\');
            mkdir(dirPath, (makeError) => {
                if (!makeError) return;

                if (makeError.code.toString() !== 'EEXIST') {
                    console.error('Error creating directory:', makeError);
                }
            });

            writeLocalFile(event, path, content);
        }
    });
}

export { isFileExist, readLocalFile, writeLocalFile };
