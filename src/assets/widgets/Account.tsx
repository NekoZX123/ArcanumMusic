import { defineComponent } from "vue";

// 账号登录组件

const platformIcons: { [type: string]: string } = {
    "netease": "/images/platforms/netease.png",
    "qqmusic": "/images/platforms/qqmusic.png",
    "kuwo": "/images/platforms/kuwo.png",
    "kugou": "/images/platforms/kugou.png"
}
const platformNames: { [type: string]: string } = {
    "netease": "网易云音乐",
    "qqmusic": "QQ音乐",
    "kuwo": "酷我音乐",
    "kugou": "酷狗音乐"
}

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

export { AccountCard };
