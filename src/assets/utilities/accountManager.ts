import { decrypt, encrypt } from './crypto.ts';

let userData: { [type: string]: any } = {
    netease: {
        userData: {
            avatarUrl: '/images/library/defaultAvatar.png',
            nickname: '未登录',
            userId: -1
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

// 获取登录信息
function getAccountInfo(platform: string = 'all') {
    if (platform === 'all') return userData;
    else if (userData[platform]) return userData[platform];
    else return null;
}
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

    const encrypted = await encrypt(baseString);
    const cipherData = encrypted;
    
    // 存储登录信息
    const fileName = `${platform}.arca`;
    const filePath = `${await window.electron.getAppDataLocal()}\\ArcanumMusic\\accounts\\${fileName}`;

    window.electron.writeLocalFile(filePath, cipherData);
}
// 读取登录信息
async function readAccountInfo(platform: string = 'all') {
    if (platform === 'all') {
        const platforms = ['netease', 'qqmusic', 'kuwo', 'kugou'];
        platforms.forEach((plat) => {
            readAccountInfo(plat);
        });
        return;
    }

    const cookieValidate =  await window.electron.validateCookie(platform);
    console.log(await cookieValidate);

    const fileName = `${platform}.arca`;
    const filePath = `${await window.electron.getAppDataLocal()}\\ArcanumMusic\\accounts\\${fileName}`;

    const fileExist = await window.electron.isFileExist(filePath);
    if (!fileExist) return null;

    const cipherData = await window.electron.readLocalFile(filePath);
    if (cipherData === '') {
        return null;
    }

    // 解密登录信息
    const decryptedString = await decrypt(cipherData);
    if (!decryptedString) {
        console.error(`Failed to decrypt data for platform: ${platform}, please login again`);
        cleanAccountInfo(platform);
        return null;
    }

    const accountData = JSON.parse(decryptedString);
    console.log(accountData);
    setAccountInfo(platform, accountData);

    return accountData;
}
// 重置登录信息
async function cleanAccountInfo(platform: string) {
    window.electron.deleteCookies(platform);
}

export {
    storeAccountInfo,
    readAccountInfo,
    cleanAccountInfo,
    getAccountInfo,
    setAccountInfo
}
