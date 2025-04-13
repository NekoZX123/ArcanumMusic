import { defineComponent } from "vue";

import { showPopup } from "../notifications/popup";
import { showNotify } from "../notifications/Notification";

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

// 账户登录功能

function loginCancelled() {
    showNotify('arcanummusic.accounts.logincancelled', 'critical', '登录失败', '登录请求已被用户取消', 3000);
}

function platformLogin(platform: string) {
    const targetLink = platformLinks[platform];
    if (!targetLink) {
        console.error(`[Error] Unknown music platform: ${platform}`);
        return;
    }

    showPopup('info', 'cancel', '请登录', '应用将打开一个新窗口, 请在此窗口中登录对应平台', [''], loginCancelled);

    window.electron.createWindow(`Arcanum Music - ${platformNames[platform]} 账号登录`, targetLink);
}

// 账号登录组件
const AccountCard = defineComponent({
    props: {
        id: String,
        platform: String, 
        avatar: String,
        user: String
    },
    setup(props: { id: string, platform: string, avatar: string, user: string }) {
        let platform = platformIcons[props.platform];
        let type = platformNames[props.platform];
        return () => (
            <span class="accountElement optionBox flex row" id={`${props.id}_container`}>
                <span class="accountImageContainer">
                    <img class="accountAvatar" src={props.avatar}/>
                    <img class="accountPlatform" src={platform}></img>
                </span>
                <span class="accountInfo flex column">
                    <label class="text medium bold">{type}</label>
                    <label class="text small">{props.user}</label>
                </span>
                <button class="accountManage text small bold" id={props.id}>登入</button>
            </span>
        );
    }
});

export { AccountCard, platformLogin };
