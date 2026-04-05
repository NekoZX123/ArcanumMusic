import { defineComponent, onMounted, ref } from 'vue';

import { showNotify } from '../notifications/Notification';
import { cleanAccountInfo, readAccountInfo, setAccountInfo, storeAccountInfo } from '../utilities/accountManager.ts';
import { getQQmusicAccount } from '../scripts/qqmusic/qqmusicRequest.ts';
import { getNeteaseAccount } from '../scripts/netease/neteaseRequest.ts';
import {
    platformAccountCookieFields,
    runtime,
    type MusicPlatform,
    type RuntimeAccountStatus
} from '../../runtime';

const defaultAvatar = './images/library/defaultAvatar.svg';

const platformIcons: Record<MusicPlatform, string> = {
    netease: './images/platforms/netease.png',
    qqmusic: './images/platforms/qqmusic.png',
    kuwo: './images/platforms/kuwo.png',
    kugou: './images/platforms/kugou.png'
};

const platformNames: Record<MusicPlatform, string> = {
    netease: '网易云音乐',
    qqmusic: 'QQ 音乐',
    kuwo: '酷我音乐',
    kugou: '酷狗音乐'
};

function createPlaceholderAccount() {
    return {
        userData: {
            avatarUrl: defaultAvatar,
            nickname: '已导入账号'
        },
        cookies: {}
    };
}

async function promptImportFields(platform: MusicPlatform, importFields: string[]) {
    const values: Record<string, string> = {};
    for (const field of importFields) {
        const value = window.prompt(`请输入 ${platformNames[platform]} 的 ${field}`, values[field] || '');
        if (value === null) {
            return null;
        }

        values[field] = value.trim();
    }

    if (platform === 'qqmusic' && !values.qqmusic_key && values.qm_keyst) {
        values.qqmusic_key = values.qm_keyst;
    }

    return values;
}

async function buildImportedAccount(platform: MusicPlatform, rawCookies: Record<string, string>) {
    if (platform === 'netease') {
        const response = await getNeteaseAccount({ MUSIC_U: rawCookies.MUSIC_U });
        const infoObject = response.data.profile;

        return {
            userData: {
                avatarUrl: infoObject?.avatarUrl || defaultAvatar,
                nickname: infoObject?.nickname || '未知用户',
                userId: infoObject?.userId || -1
            },
            cookies: {
                MUSIC_U: rawCookies.MUSIC_U
            }
        };
    }

    if (platform === 'qqmusic') {
        const uin = parseInt(rawCookies.uin, 10);
        const qmKeyst = rawCookies.qm_keyst || rawCookies.qqmusic_key;
        const response = await getQQmusicAccount({ uin, qm_keyst: qmKeyst });
        const infoObject = response.data.req_1?.data?.map_userinfo || {};
        const userInfo = infoObject[uin];

        return {
            userData: {
                avatarUrl: userInfo?.headurl || defaultAvatar,
                nickname: userInfo?.nick || '未知用户'
            },
            cookies: {
                uin,
                qm_keyst: qmKeyst,
                qqmusic_key: qmKeyst
            }
        };
    }

    if (platform === 'kuwo') {
        return {
            ...createPlaceholderAccount(),
            cookies: {
                userid: rawCookies.userid
            }
        };
    }

    return {
        ...createPlaceholderAccount(),
        cookies: {
            KuGoo: rawCookies.KuGoo
        }
    };
}

async function importBrowserAccount(platform: MusicPlatform) {
    const accountFlow = await runtime.startAccountFlow(platform);

    if (!accountFlow.ok && accountFlow.mode === 'unsupported') {
        showNotify(
            `arcanummusic.accounts.${platform}.unsupported`,
            'warning',
            '当前不可用',
            accountFlow.message || '当前构建未配置网页账号能力',
            4000
        );
        return null;
    }

    if (accountFlow.mode === 'redirect' && accountFlow.loginUrl) {
        await runtime.openExternal(accountFlow.loginUrl);
        showNotify(
            `arcanummusic.accounts.${platform}.redirect`,
            'info',
            '请继续登录',
            '已打开登录页面，完成后返回并刷新账号状态。',
            4000
        );
        return await runtime.getAccountStatus(platform);
    }

    const importFields = accountFlow.importFields || platformAccountCookieFields[platform];
    const rawCookies = await promptImportFields(platform, importFields);
    if (!rawCookies) {
        return null;
    }

    const importedAccount = await buildImportedAccount(platform, rawCookies);
    const runtimeStatus = await runtime.importAccount(platform, {
        cookies: rawCookies,
        userData: importedAccount.userData
    });

    if (runtimeStatus?.loggedIn) {
        return runtimeStatus;
    }

    return {
        loggedIn: true,
        ...importedAccount
    } as RuntimeAccountStatus;
}

async function resolveElectronAccount(platform: MusicPlatform, runtimeResult: any) {
    const runtimeData = runtimeResult?.data;
    if (!runtimeData) {
        return null;
    }

    if (platform === 'qqmusic' && runtimeData.cookies) {
        const qmKeyst = runtimeData.cookies.qm_keyst;
        const uin = parseInt(runtimeData.cookies.uin, 10);
        const response = await getQQmusicAccount({ uin, qm_keyst: qmKeyst });
        const infoObject = response.data.req_1?.data?.map_userinfo || {};
        const currentUser = infoObject[uin];

        return {
            userData: {
                avatarUrl: currentUser?.headurl || defaultAvatar,
                nickname: currentUser?.nick || '未知用户'
            },
            cookies: {
                uin,
                qm_keyst: qmKeyst,
                qqmusic_key: qmKeyst
            }
        };
    }

    if (platform === 'netease' && runtimeData.cookies) {
        const musicu = runtimeData.cookies.MUSIC_U;
        const response = await getNeteaseAccount({ MUSIC_U: musicu });
        const infoObject = response.data.profile;

        return {
            userData: {
                avatarUrl: infoObject?.avatarUrl || defaultAvatar,
                nickname: infoObject?.nickname || '未知用户',
                userId: infoObject?.userId || -1
            },
            cookies: {
                MUSIC_U: musicu
            }
        };
    }

    if (runtimeData.userData) {
        return runtimeData;
    }

    return null;
}

const AccountCard = defineComponent({
    props: {
        platform: String
    },
    setup(props: { platform: MusicPlatform }) {
        const platformIcon = platformIcons[props.platform];
        const platformName = platformNames[props.platform];

        const isLogin = ref(false);
        const avatar = ref(defaultAvatar);
        const userName = ref('未登录');

        async function syncCardState() {
            const user = await readAccountInfo(props.platform);
            if (user?.userData) {
                isLogin.value = !!user.loggedIn;
                avatar.value = user.userData.avatarUrl || defaultAvatar;
                userName.value = user.userData.nickname || '未知用户';
                return;
            }

            isLogin.value = false;
            avatar.value = defaultAvatar;
            userName.value = '未登录';
        }

        async function platformLogout() {
            await cleanAccountInfo(props.platform);
            await syncCardState();

            showNotify(
                `arcanummusic.accounts.${props.platform}.logout`,
                'success',
                '退出成功',
                `${platformName} 已退出登录`,
                3000
            );
        }

        async function platformLogin() {
            try {
                let accountPayload: RuntimeAccountStatus | null = null;

                if (runtime.getCapabilities().browserLogin && !runtime.isElectron()) {
                    accountPayload = await importBrowserAccount(props.platform);
                }
                else {
                    const runtimeResult = await runtime.startAccountFlow(props.platform);
                    if (!runtimeResult.ok) {
                        showNotify(
                            `arcanummusic.accounts.${props.platform}.loginfailed`,
                            'critical',
                            '登录失败',
                            runtimeResult.message || '无法启动登录流程',
                            4000
                        );
                        return;
                    }

                    const electronAccount = await resolveElectronAccount(props.platform, runtimeResult);
                    if (!electronAccount) {
                        showNotify(
                            `arcanummusic.accounts.${props.platform}.loginfailed`,
                            'critical',
                            '登录失败',
                            `${platformName} 登录失败，无法获取用户 Token`,
                            4000
                        );
                        return;
                    }

                    accountPayload = {
                        loggedIn: true,
                        ...electronAccount
                    };
                }

                if (!accountPayload?.loggedIn) {
                    showNotify(
                        `arcanummusic.accounts.${props.platform}.loginfailed`,
                        'critical',
                        '登录失败',
                        `${platformName} 登录失败`,
                        4000
                    );
                    return;
                }

                setAccountInfo(props.platform, accountPayload);
                await storeAccountInfo(props.platform);
                await syncCardState();

                showNotify(
                    `arcanummusic.accounts.${props.platform}.loginsuccess`,
                    'success',
                    '登录成功',
                    `${platformName} 登录成功`,
                    3000
                );
            }
            catch (error: any) {
                console.error(error);
                showNotify(
                    `arcanummusic.accounts.${props.platform}.loginfailed`,
                    'critical',
                    '登录失败',
                    error?.message || `${platformName} 登录失败`,
                    4000
                );
            }
        }

        onMounted(async () => {
            await syncCardState();
        });

        return () => (
            <span class="accountElement optionBox flex row" id={`${props.platform}_container`}>
                <span class="accountImageContainer">
                    <img class="accountAvatar" src={avatar.value} />
                    <img class="accountPlatform" src={platformIcon}></img>
                </span>
                <span class="accountInfo flex column">
                    <label class="text medium bold">{platformName}</label>
                    <label class="text small">{userName.value}</label>
                </span>
                <button class="accountManage text small bold" id={props.platform}
                    onClick={isLogin.value ? platformLogout : platformLogin}>
                    {isLogin.value ? '退出' : '登录'}
                </button>
            </span>
        );
    }
});

export { AccountCard, readAccountInfo };
