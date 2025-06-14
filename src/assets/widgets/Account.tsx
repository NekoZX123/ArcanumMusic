import { defineComponent } from "vue";

import { closePopup, showPopup } from "../notifications/popup";
import { showNotify } from "../notifications/Notification";

import { storeAccountInfo, readAccountInfo, cleanAccountInfo, setAccountInfo } from "../utilities/accountManager.ts";
import axios from "axios";

// 各平台登录信息
const initialTokens: { [type: string]: any } = {
    "netease": {
        "MUSIC_U": ""
    },
    "qqmusic": {
        "uin": "",
        "qm_keyst": "",
        "qqmusic_key": ""
    },
    "kuwo": {
        "userid": ""
    },
    "kugou": {
        "KuGoo": ""
    }
}
let platformTokens: { [type: string]: any } = {
    "netease": {
        "MUSIC_U": ""
    },
    "qqmusic": {
        "uin": "",
        "qm_keyst": "",
        "qqmusic_key": ""
    },
    "kuwo": {
        "userid": "",
    },
    "kugou": {
        "KuGoo": ""
    }
}

// 各平台信息常量池

// 平台图标
const platformIcons: { [type: string]: string } = {
    "netease": "/images/platforms/netease.png",
    "qqmusic": "/images/platforms/qqmusic.png",
    "kuwo": "/images/platforms/kuwo.png",
    "kugou": "/images/platforms/kugou.png"
}

// 平台名称
const platformNames: { [type: string]: string } = {
    "netease": "网易云音乐",
    "qqmusic": "QQ音乐",
    "kuwo": "酷我音乐",
    "kugou": "酷狗音乐"
}

// 平台链接
const platformLinks: { [type: string]: string } = {
    "netease": "https://music.163.com/",
    "qqmusic": "https://y.qq.com/",
    "kuwo": "https://www.kuwo.cn/",
    "kugou": "https://www.kugou.com/"
}

// 平台 cookie 监听目标
const platformCookieTargets: { [type: string]: string[] } = {
    "netease": ["MUSIC_U"],
    "qqmusic": ["uin", "qqmusic_key", "qm_keyst"],
    "kuwo": ["userid", "uname3", "pic3"],
    "kugou": ["KuGoo"]
}

// 用户头像 / 昵称获取 / 设置
function displayAccount(platform: string, nickname: string, avatar: string) {
    const accountButton = document.getElementById(`login.${platform}`);
    if (!accountButton || !accountButton.parentElement) return;

    const accountWidget = accountButton.parentElement;

    const accountAvatar = accountWidget.querySelector('.accountAvatar') as HTMLImageElement;
    const accountNickname = accountWidget.querySelector('.accountInfo .text.small') as HTMLLabelElement;

    console.log(accountAvatar, accountNickname);
    accountAvatar.src = avatar;
    accountNickname.innerHTML = nickname;
}

// 账户登录功能

// 登录取消
function loginCancelled() {
    showNotify('arcanummusic.accounts.logincancelled', 'critical', '登录失败', '登录请求已被用户取消', 3000);
}

// 登出指定平台
function platformLogout(platform: string) {
    platformTokens[platform] = initialTokens[platform];

    cleanAccountInfo(platform);
    displayAccount(platform, '未登录', '/images/library/defaultAvatar.svg');

    showNotify('arcanummusic.accounts.logout', 'success', '登出成功!', `${platformNames[platform]} 已登出`, 3000);

    let loginButton = document.getElementById(`login.${platform}`) as HTMLButtonElement;
    if (loginButton) {
        loginButton.innerHTML = '登入';

        loginButton.onclick = () => {
            platformLogin(platform);
        }
    }
}

// 登录指定平台
async function platformLogin(platform: string) {
    const targetLink = platformLinks[platform];
    if (!targetLink) {
        console.error(`[Error] Unknown music platform: ${platform}`);
        return;
    }

    showPopup('info', 'cancel', '请登录', '应用将打开一个新窗口, 请在此窗口中登录对应平台', [''], loginCancelled);

    const loginWindowId = await window.electron.createWindow(`Arcanum Music - ${platformNames[platform]} 账号登录`, targetLink);

    // 监听 cookie 变化
    let cookiePromise = window.electron.listenCookie(loginWindowId, platformCookieTargets[platform]);

    // 获取到指定 cookie 后关闭提示弹窗与登录窗口
    cookiePromise.then(async (userData: { userData?: { avatarUrl?: string, nickname?: string }, cookies: any }) => {
        console.log(`[Debug] User info received: ${JSON.stringify(userData)}`);

        // 设置用户信息
        setAccountInfo(platform, userData);
        storeAccountInfo(platform);

        // 获取用户信息
        if (platform === 'qqmusic' && userData.cookies) { // QQ 音乐 - 网络请求用户信息
            const qm_keyst = userData.cookies['qm_keyst'];
            const uin = userData.cookies['uin'];
            const cookies = `uin=${uin};qm_keyst=${qm_keyst}`;

            const data = {
                "comm": {
                    "cv": 4747474,
                    "ct": 24,
                    "format": "json",
                    "inCharset": "utf-8",
                    "outCharset": "utf-8",
                    "notice": 0,
                    "platform": "yqq.json",
                    "needNewCode": 1,
                    "uin": uin,
                    "g_tk_new_20200303": 1696903369,
                    "g_tk": 1696903369
                },
                "req_1": {
                    "module": "userInfo.BaseUserInfoServer",
                    "method": "get_user_baseinfo_v2",
                    "param": {
                        "vec_uin": [
                            `${uin}`
                        ]
                    }
                }
            }

            // const sign = await getSignViaIframe(JSON.stringify(data));
            const requestUrl = `https://u6.y.qq.com/cgi-bin/musics.fcg?_=${Date.now()}&sign=${0}`;

            const requestParams = {
                url: requestUrl,
                method: 'POST',
                headers: {
                    'Cookie': cookies
                },
                body: JSON.stringify(data)
            }

            axios.post('http://127.0.0.1:3000/proxy', requestParams)
                .then((response) => {
                    console.log(response.status);
                    console.log(response.data);
                });
        }
        else if (userData.userData) { // 其他平台 - 从 localStorage (网易云) / cookie (酷我 / 酷狗) 获取用户信息
            console.log(userData);
            const avatarUrl = userData.userData.avatarUrl || '/images/library/defaultAvatar.svg';
            const nickname = userData.userData.nickname || '未知用户';
            displayAccount(platform, nickname, avatarUrl);
        }

        closePopup(0, () => {
            showNotify('arcanummusic.accounts.loginsuccess', 'success',
                '登录成功!', `${platformNames[platform]} 登录成功`, 3000);
        });

        window.electron.closeWindowById(loginWindowId);

        // 更改按钮绑定事件
        let loginButton = document.getElementById(`login.${platform}`) as HTMLButtonElement;
        if (loginButton) {
            loginButton.innerHTML = '登出';

            loginButton.onclick = () => {
                platformLogout(platform);
            }
        }
    });
}

// 账号登录组件
const AccountCard = defineComponent({
    props: {
        id: String,
        platform: String,
        isLogin: Boolean,
        avatar: String,
        user: String
    },
    setup(props: { id: string, platform: string, isLogin: boolean, avatar: string, user: string }) {
        let platform = platformIcons[props.platform];
        let type = platformNames[props.platform];
        return () => (
            <span class="accountElement optionBox flex row" id={`${props.id}_container`}>
                <span class="accountImageContainer">
                    <img class="accountAvatar" src={props.avatar} />
                    <img class="accountPlatform" src={platform}></img>
                </span>
                <span class="accountInfo flex column">
                    <label class="text medium bold">{type}</label>
                    <label class="text small">{props.user}</label>
                </span>
                <button class="accountManage text small bold" id={props.id} 
                    onClick={props.isLogin ? () => platformLogout(props.platform) : () => platformLogin(props.platform)}>
                    {props.isLogin ? '登出' : '登入'}
                    </button>
            </span>
        );
    }
});

export { AccountCard, readAccountInfo, platformLogin, platformLogout };
