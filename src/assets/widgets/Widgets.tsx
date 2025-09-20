import { defineComponent } from "vue";
import { changePage } from "../utilities/pageSwitcher";
import { getPlayer } from "../player/player";
import { hideArtistSelect, triggerRightMenu } from "../utilities/elementControl";

// 各平台图标
const platformIcons: Record<string, string> = {
    'netease': './images/platforms/netease.png',
    'qqmusic': './images/platforms/qqmusic.png',
    'kuwo': './images/platforms/kuwo.png',
    'kugou': './images/platforms/kugou.png'
}

// 时间格式化
function timeFormat(timeSeconds: number) {
    let secondNum = timeSeconds % 60;
    if (secondNum < 0) secondNum = 0;
    let minTemp = Math.floor(timeSeconds / 60);
    let minuteNum = minTemp % 60;
    let hourNum = Math.floor(minTemp / 60);

    let second = secondNum < 10 ? `0${secondNum}` : `${secondNum}`;
    let minute = minuteNum < 10 ? `0${minuteNum}` : `${minuteNum}`;
    let hour = hourNum < 10 ? `0${hourNum}` : `${hourNum}`;

    var result = '';
    if (hourNum > 0) {
        result = `${hour}:${minute}:${second}`;
    }
    else {
        result = `${minute}:${second}`;
    }

    return result;
}

// 自定义组件

// 歌单卡片右键点击事件处理
function handleSongListRightClick(event: MouseEvent, props: any) {
    if (event.button === 2) triggerRightMenu(event, props, 'collections');
}
// 歌单卡片
const SonglistCard = defineComponent({
    props: {
        id: String,
        coverUrl: String,
        name: String
    },
    setup(props: { id: string, coverUrl: string, name: string }) {
        const platformName = props.id.replace('new_', '').split('-')[1];
        const platformIcon = platformIcons[platformName] || '';
        return () => (
            <span class="songlistCard medium" id={props.id} 
                onClick={(_) => changePage('songlist', true, props.id)} 
                onContextmenu={(event) => handleSongListRightClick(event, props)}>
                <span class="flex column">
                    <img class="songCover" src={props.coverUrl} alt="Playlist cover"/>
                    <label class="text small">{props.name}</label>
                </span>
                <button class="songlistPlatform" id={`${props.id}_platform`}>
                    <img src={platformIcon} alt={`From ${platformName}`}/>
                </button>
            </span>
        );
    },
});

// 歌曲卡片右键点击事件处理
function handleSongRightClick(event: MouseEvent, props: any) {
    if (event.button === 2) triggerRightMenu(event, props, 'song');
}
// 歌曲卡片
const SongCard = defineComponent({
    props: {
        id: String,
        coverUrl: String,
        name: String,
        authors: String,
        duration: Number
    },
    setup(props: { id: string, coverUrl: string, name: string, authors: string, duration: number }) {
        return () => (
            <span class="songCard flex row" onContextmenu={(event) => handleSongRightClick(event, props)}>
                <img class="songCover" src={props.coverUrl} 
                    onClick={() => changePage('single', true, props.id)}></img>
                <span class="songInfo flex column">
                    <label class="text small bold">{props.name}</label>
                    <label class="text ultraSmall grey">{props.authors}</label>
                </span>
                <button class="songPlay" onClick={() => getPlayer()?.playNow(props)}>
                    <img src="./images/player/play.dark.svg" alt="Play"/>
                </button>
            </span>
        );
    }
});

// 单行歌曲卡片右键点击事件处理
function handleSongLineRightClick(event: MouseEvent, props: any) {
    const menuType = props.id.includes('playlist_') ? 'playlistItem' : 'song';
    if (event.button === 2) triggerRightMenu(event, props, menuType);
}
// 歌曲卡片 (单行)
const SongInfoLine = defineComponent({
    props: {
        id: String,
        name: String,
        authors: String,
        coverUrl: String,
        duration: Number
    },
    setup(props: { id: string, name: string, authors: string, coverUrl: string, duration: number }) {
        return () => (
            <span class="songLine flex row" onContextmenu={(event) => handleSongLineRightClick(event, props)}>
                <button class="songPlay" onClick={() => getPlayer()?.playNow(props)}>
                    <img src="./images/player/play.dark.svg"/>
                </button>
                <img class="songCover" src={props.coverUrl}></img>
                <span class="songInfo flex column">
                    <label class="text small bold">{props.name}</label>
                    <label class="text ultraSmall grey">{props.authors}</label>
                </span>
                <span class="text ultraSmall songLength">{timeFormat(props.duration)}</span>
            </span>
        );
    }
});

// 歌手卡片右键点击事件处理
function handleArtistRightClick(event: MouseEvent, props: any) {
    if (event.button === 2) triggerRightMenu(event, props, 'collections');
}
// 歌手卡片
const ArtistCard = defineComponent({
    props: {
        id: String,
        coverUrl: String,
        name: String
    },
    setup(props: { id: string, coverUrl: string, name: string }) {
        return () => (
            <span class="artistCard flex column" 
            onClick={() => changePage('artist', true, props.id)} 
            onContextmenu={(event) => handleArtistRightClick(event, props)}>
                <img class="artistCover" src={props.coverUrl}></img>
                <label class="text small">{props.name}</label>
            </span>
        );
    }
});
// 单行歌手卡片
const ArtistLine = defineComponent({
    props: {
        id: String,
        coverUrl: String,
        name: String
    },
    setup(props: { id: string, coverUrl: string, name: string }) {
        return () => (
            <span class="artistLine flex row" 
            onClick={() => {
                hideArtistSelect();
                changePage('artist', true, props.id);
            }} 
            onContextmenu={(event) => handleArtistRightClick(event, props)}>
                <img class="artistCover" src={props.coverUrl}></img>
                <label class="text small">{props.name}</label>
            </span>
        );
    }
});

export { SonglistCard, SongCard, SongInfoLine, ArtistCard, ArtistLine };
