import { decrypt, encrypt } from './crypto';
import { runtime, type MusicPlatform, type RuntimeAccountStatus } from '../../runtime';

const platformList: MusicPlatform[] = ['netease', 'qqmusic', 'kuwo', 'kugou'];
const defaultAvatar = './images/library/defaultAvatar.svg';

function getDefaultAccountState() {
    return {
        netease: {
            loggedIn: false,
            userData: {
                avatarUrl: defaultAvatar,
                nickname: '未登录',
                userId: -1
            },
            cookies: {
                MUSIC_U: ''
            }
        },
        qqmusic: {
            loggedIn: false,
            userData: {
                avatarUrl: defaultAvatar,
                nickname: '未登录'
            },
            cookies: {
                uin: '',
                qm_keyst: '',
                qqmusic_key: ''
            }
        },
        kuwo: {
            loggedIn: false,
            userData: {
                avatarUrl: defaultAvatar,
                nickname: '未登录'
            },
            cookies: {
                userid: ''
            }
        },
        kugou: {
            loggedIn: false,
            userData: {
                avatarUrl: defaultAvatar,
                nickname: '未登录'
            },
            cookies: {
                KuGoo: '',
                userid: '',
                token: ''
            }
        }
    };
}

let userData: Record<string, any> = getDefaultAccountState();

function getAccountInfo(platform: string = 'all') {
    if (platform === 'all') {
        return userData;
    }

    return userData[platform] || null;
}

function resetAccountInfo(platform: string) {
    const defaults = getDefaultAccountState();
    const defaultState = defaults[platform as keyof typeof defaults];
    if (!defaultState) {
        return;
    }

    userData[platform] = defaultState;
}

function setAccountInfo(platform: string, data: any) {
    if (!userData[platform]) {
        return;
    }

    const defaults = getDefaultAccountState()[platform as keyof ReturnType<typeof getDefaultAccountState>];
    userData[platform] = {
        ...defaults,
        ...data,
        loggedIn: true,
        userData: {
            ...defaults.userData,
            ...(data?.userData || {})
        },
        cookies: {
            ...defaults.cookies,
            ...(data?.cookies || {})
        }
    };
}

async function storeAccountInfo(platform: string) {
    if (!userData[platform] || !runtime.getCapabilities().localEncryptedAccounts) {
        return;
    }

    const cipherData = await encrypt(JSON.stringify(userData[platform]));
    const filePath = `${await runtime.getAppData()}\\ArcanumMusic_data\\accounts\\${platform}.arca`;
    await runtime.writeLocalFile(filePath, cipherData);
}

function applyRuntimeStatus(platform: MusicPlatform, status: RuntimeAccountStatus | null) {
    if (!status?.loggedIn) {
        resetAccountInfo(platform);
        return null;
    }

    setAccountInfo(platform, status);
    return userData[platform];
}

async function readLocalEncryptedAccount(platform: MusicPlatform) {
    const filePath = `${await runtime.getAppData()}\\ArcanumMusic_data\\accounts\\${platform}.arca`;
    const fileExist = await runtime.isFileExist(filePath);
    if (!fileExist) {
        resetAccountInfo(platform);
        return null;
    }

    const cipherData = await runtime.readLocalFile(filePath);
    if (!cipherData) {
        resetAccountInfo(platform);
        return null;
    }

    const decryptedString = await decrypt(cipherData);
    if (!decryptedString) {
        console.error(`Failed to decrypt data for platform: ${platform}, please login again`);
        await cleanAccountInfo(platform);
        return null;
    }

    const accountData = JSON.parse(decryptedString);
    setAccountInfo(platform, accountData);
    return accountData;
}

async function readAccountInfo(platform: string = 'all') {
    if (platform === 'all') {
        await Promise.all(platformList.map((currentPlatform) => readAccountInfo(currentPlatform)));
        return userData;
    }

    const targetPlatform = platform as MusicPlatform;

    if (runtime.getCapabilities().localEncryptedAccounts) {
        await runtime.validateCookie(targetPlatform);
        return await readLocalEncryptedAccount(targetPlatform);
    }

    if (runtime.getCapabilities().browserLogin) {
        const status = await runtime.getAccountStatus(targetPlatform);
        return applyRuntimeStatus(targetPlatform, status);
    }

    resetAccountInfo(targetPlatform);
    return userData[targetPlatform];
}

async function cleanAccountInfo(platform: string) {
    await runtime.logout(platform as MusicPlatform);
    resetAccountInfo(platform);
}

export {
    storeAccountInfo,
    readAccountInfo,
    cleanAccountInfo,
    getAccountInfo,
    setAccountInfo
};
