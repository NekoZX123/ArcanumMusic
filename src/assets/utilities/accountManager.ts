import CryptoJS from 'crypto-js';
import { decrypt, encrypt } from './crypto.ts';

let userData: { [type: string]: any } = {
    netease: {
        userData: {
            avatarUrl: '/images/library/defaultAvatar.png',
            nickname: '未登录'
        },
        cookies: {
            'MUSIC_U': '',
        }
    },
    qqmusic: {
        userData: {
            avatarUrl: '/images/library/defaultAvatar.png',
            nickname: '未登录'
        },
        cookies: {
            'uin': '',
            'qm_keyst': '',
            'qqmusic_key': ''
        }
    },
    kuwo: {
        userData: {
            avatarUrl: '/images/library/defaultAvatar.png',
            nickname: '未登录'
        },
        cookies: {
            'userid': ''
        }
    },
    kugou: {
        userData: {
            avatarUrl: '/images/library/defaultAvatar.png',
            nickname: '未登录'
        },
        cookies: {
            "KuGoo": ""
        }
    }
}

// 登录信息管理
const password = 'arcanummusic.app.encrypt@moe.nekozx.arcanummusic'; // 密码

// 写入登录信息
function setAccountInfo(platform: string, data: any) {
    if (!userData[platform]) return;

    // 设置用户信息
    userData[platform] = data;
}

// 存储登录信息
async function storeAccountInfo(platform: string) {
    if (!userData[platform]) return;

    // 加密登录信息
    const baseString = JSON.stringify(userData[platform]);

    const encrypted = encrypt(baseString, password);
    const cipherData = CryptoJS.enc.Utf8.parse(JSON.stringify(encrypted));

    const encryptedBase64 = CryptoJS.enc.Base64.stringify(cipherData);
    
    // 存储登录信息
    const fileName = `arcanum.${platform}.account`;
    const filePath = `${await window.electron.getAppDataLocal()}\\ArcanumMusic\\accounts\\${fileName}`;

    window.electron.writeLocalFile(filePath, encryptedBase64);
}
// 读取登录信息
async function readAccountInfo(platform: string) {
    const fileName = `arcanum.${platform}.account`;
    const filePath = `${await window.electron.getAppDataLocal()}\\ArcanumMusic\\accounts\\${fileName}`;

    const fileExist = await window.electron.isFileExist(filePath);
    if (!fileExist) return null;

    const encryptedBase64 = await window.electron.readLocalFile(filePath);
    if (!encryptedBase64 || encryptedBase64 === '') {
        return null;
    }

    // 解密登录信息
    const cipherData = CryptoJS.enc.Base64.parse(encryptedBase64);
    const decrypted = JSON.parse(CryptoJS.enc.Utf8.stringify(cipherData));
    const decryptedString = decrypt(decrypted, password);

    const accountData = JSON.parse(decryptedString);
    console.log(accountData);
    setAccountInfo(platform, accountData);

    return accountData;
}
// 重置登录信息
async function cleanAccountInfo(platform: string) {
    const fileName = `arcanum.${platform}.account`;
    const filePath = `${await window.electron.getAppDataLocal()}\\ArcanumMusic\\accounts\\${fileName}`;

    window.electron.writeLocalFile(filePath, '');
}

export {
    storeAccountInfo,
    readAccountInfo,
    cleanAccountInfo,
    setAccountInfo
}
