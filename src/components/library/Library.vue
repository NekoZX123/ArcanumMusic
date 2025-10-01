<script setup lang="tsx">
import { onMounted, onUnmounted, ref } from 'vue';
import './libraryStyle.css';

import TabWidget from '../../assets/widgets/TabWidget.vue';
import { getNeteaseResult } from '../../assets/scripts/netease/neteaseRequest.ts';
import { getAccountInfo } from '../../assets/utilities/accountManager.ts';
import { parseMusicData } from '../../assets/utilities/dataParsers.ts';
import { addSongCard, addSonglistCard, triggerRightMenu } from '../../assets/utilities/elementControl.ts';
import { getQQmusicResult } from '../../assets/scripts/qqmusic/qqmusicRequest.ts';
import { getKuwoResult } from '../../assets/scripts/kuwo/kuwoRequest.ts';
import { getKugouResult } from '../../assets/scripts/kugou/kugouRequest.ts';
import type { AxiosResponse } from 'axios';
import { getPlayer } from '../../assets/player/player.ts';
import { getConfig } from '../../assets/utilities/configLoader.ts';

const platformTabs = [
    {
        title: '网易云音乐',
        icon: './images/platforms/netease.png'
    },
    {
        title: 'QQ 音乐',
        icon: './images/platforms/qqmusic.png'
    },
    {
        title: '酷我音乐',
        icon: './images/platforms/kuwo.png'
    },
    {
        title: '酷狗音乐',
        icon: './images/platforms/kugou.png'
    }
];

// 问候语
const userAvatar = ref('./images/library/defaultAvatar.svg');
const userName = ref('NekoZX');
const greetings = ref('');
const greetingsEnd = ref('');
const greetList = ['欢迎回来! ', 'Welcome back! ', 'お帰りなさい! '];
const greetSubfix = [' ~', ' ~', ' ちゃん~'];

const platformList = ['netease', 'qqmusic', 'kuwo', 'kugou'];
const requestFuncs: Record<string, Function> = {
    netease: getNeteaseResult,
    qqmusic: getQQmusicResult,
    kuwo: getKuwoResult,
    kugou: getKugouResult,
}
function platformChange(widgetInfo: { widgetId: string, current: number }) {
    const userData = getAccountInfo('all');

    const platform = platformList[widgetInfo.current];
    if (platform === 'kuwo') {
        console.warn(`[Warning] Platform ${platform} is not supported yet`);
        return;
    }

    setTimeout(() => {
        const container = document.getElementById(`playlists_${platform}`) as HTMLElement;
        if (!container) {
            console.error(`[Error] Failed to get element #playlists_${platform}`);
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 获取歌单数据
        const sendRequest = requestFuncs[platform];
        if (!sendRequest) {
            console.error(`[Error] No request function found for platform: ${platform}`);
            return;
        }

        let requestParams = {};
        if (platform === 'netease') {
            requestParams = { userId: userData.netease.userData.userId };
        }
        sendRequest('userPlaylists', requestParams, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                // console.log(response.data);
                if (platform === 'kugou') {
                    console.log(response.data);
                    return;
                }
                const userLists = parseMusicData(response, platform, 'userPlaylists');
                // console.log(userLists);

                const songLists = userLists.lists;
                songLists.forEach((listInfo: any) => {
                    const listId = `songList-${platform}-${listInfo.listId}`;
                    addSonglistCard(container, listId, listInfo.listName, listInfo.listCover);
                });
            });
    }, 300);
}

// 加载收藏歌曲
const currentFavPlatform = ref('netease');
function loadFavPreview(platform: string, cookies: any) {
    const sendRequest = requestFuncs[platform];
    if (!sendRequest) {
        console.error(`[Error] Unknown platform ${platform}`);
        return;
    }
    else if (['kuwo', 'kugou'].includes(platform)) {
        console.warn(`[Warning] Unsupported platform ${platform}`);
        return;
    }

    currentFavPlatform.value = platform;
    userFavourites.value = userFavouriteIds[platform];

    sendRequest('userFavourites', {}, cookies)
        .then((response: any) => {
            // console.log(response.data);
            const favList = parseMusicData(response, platform, 'userFavourites');

            const favContainer = document.getElementById('userFavouritesPreview') as HTMLElement;
            if (!favContainer) {
                console.error(`[Error] Failed to get element #userFavouritesPreview`);
                return;
            }
            favContainer.innerHTML = '';
            
            favLength.value = favList.tracks.length;
            const loadList = favList.loadTracks;
            
            for (let i = 0; i < Math.min(10, loadList.length); i++) {
                const songInfo = loadList[i];
                const songId = `music-${platform}-${songInfo.songId}`;
                addSongCard(favContainer, songId, songInfo.songName, songInfo.songCover, 
                    songInfo.songAuthors, songInfo.songDuration);
            }
        });
}
function favouritesLoadHandler(event: any) {
    const userData = getAccountInfo('all');
    const platform = event.detail.platform;
    loadFavPreview(platform, userData[platform]?.cookies);
}

// 加载每日推荐
const currentRecommendPlatform = ref('netease');
function loadRecommendPreview(platform: string, cookies: any) {
    const sendRequest = requestFuncs[platform];
    if (!sendRequest) {
        console.error(`[Error] Unknown platform ${platform}`);
        return;
    }
    else if (['kuwo', 'kugou'].includes(platform)) {
        console.warn(`[Warning] Unsupported platform ${platform}`);
        return;
    }

    currentRecommendPlatform.value = platform;
    dailyRecommends.value = `songList-${platform}-${dailyRecommendIds[platform]}`;
    const targetId = dailyRecommendIds[platform];

    sendRequest('songList', { listId: targetId }, cookies)
        .then((response: any) => {
            const recommends = parseMusicData(response, platform, 'songList');

            const container = document.getElementById('recommendContainer') as HTMLElement;
            if (!container) {
                console.error(`[Error] Failed to get element #recommendContainer`);
            }
            container.innerHTML = '';
            
            recommendLength.value = recommends.tracks.length;
            const songList = recommends.loadTracks;
            for (let i = 0; i < Math.min(10, songList.length); i++) {
                const songInfo = songList[i];
                const songId = `music-${platform}-${songInfo.songId}`;
                addSongCard(container, songId, songInfo.songName, songInfo.songCover, 
                    songInfo.songAuthors, songInfo.songDuration);
            }
        });
}
function recommendsLoadHandler(event: any) {
    const userData = getAccountInfo('all');
    const platform = event.detail.platform;
    loadRecommendPreview(platform, userData[platform]?.cookies);
}

const userFavouriteIds: Record<string, string> = {
    'netease': 'songList-netease-12352057833',
    'qqmusic': 'songList-qqmusic-5507561315',
    'kuwo': '',
    'kugou': ''
}
const dailyRecommendIds: Record<string, string | number> = {
    'netease': 3136952023,
    'qqmusic': 7309419218,
    'kuwo': '',
    'kugou': ''
}
const userFavourites = ref('songList-netease-12352057833');
const dailyRecommends = ref('songList-netease-3136952023');

const favLength = ref(0);
const recommendLength = ref(0);
onMounted(() => {
    const userData = getAccountInfo('all');

    // 加载用户名称
    const config = getConfig();
    if (config) {
        const name = config.user.localInfo.user.userName;
        const pic = config.user.localInfo.user.avatarLink;
        userName.value = name;
        userAvatar.value = pic;
    }

    // 加载问候语
    const choice = Math.floor(Math.random() * greetList.length);
    greetings.value = greetList[choice];
    greetingsEnd.value = greetSubfix[choice];

    loadFavPreview('netease', userData.netease.cookies);

    loadRecommendPreview('netease', userData.netease.cookies);

    // 加载初始标签内容
    platformChange({ widgetId: 'HOMO114514', current: 0 });

    // 监听收藏平台更新事件
    window.addEventListener('load-favourites', favouritesLoadHandler);
    window.addEventListener('load-recommends', recommendsLoadHandler);

    console.log('Library.vue loaded');
});
onUnmounted(() => {
    // 自动卸载监听器
    window.removeEventListener('load-favourites', favouritesLoadHandler);
    window.removeEventListener('load-recommends', recommendsLoadHandler);
});
</script>

<template>
    <div class="flex column" id="musicLibrary">
        <!-- 当前用户信息 -->
        <div class="flex row" id="userInfo">
            <img :src="userAvatar" id="avatar" alt="User avatar"/>
            <div class="flex column" id="userInfoText">
                <label class="text large bold" id="userName">{{ greetings + userName + greetingsEnd }}</label>
                <label class="text ultraSmall decoration">在此处访问您的所有音乐</label>
            </div>
        </div>

        <!-- 收藏 & 推荐 -->
        <div class="flex row" id="userCollections">
            <div class="songlistCard exlarge flex row" id="userFavourites">
                <span class="cardHeader flex row" id="userFavouritesBackground" 
                    @contextmenu="(event) => {
                        triggerRightMenu(event, { type: 'userFavourites' }, 'platformSelect')
                    }" 
                    :style="`background-image: url('./images/library/favouritesBackground_${currentFavPlatform}.jpg')`">
                    <span class="cardInfo flex column">
                        <label class="text medium bold">我喜欢的音乐</label>
                        <label class="text ultraSmall">共 {{ favLength }} 首</label>
                    </span>
                    <button class="songlistPlay" id="userFavrourites_play" @click="getPlayer()?.playListId(userFavourites)">
                        <img src="/images/player/play.svg" alt="Play"/>
                    </button>
                </span>
                <span class="listContent flex column" id="userFavouritesPreview"></span>
            </div>

            <div class="songlistCard large flex column" id="dailyRecommend">
                <span class="cardHeader flex column">
                    <label class="text bold medium">每日推荐</label>
                    <label class="text light ultraSmall">共 {{ recommendLength }} 首</label>
                </span>
                <span class="listContent flex column" id="recommendContainer"></span>
                <span class="cardFooter flex row">
                    <span class="flex row" id="musicSource" @contextmenu="(event) => {
                        triggerRightMenu(event, { type: 'dailyRecommends' }, 'platformSelect')
                    }">
                        <label class="text ultraSmall">音乐源: </label>
                        <img class="playlistSource" :src="`./images/platforms/${currentRecommendPlatform}.png`" alt="Netease Music"/>
                    </span>
                    <button class="songlistPlay" id="dailyRecommend_play" @click="getPlayer()?.playListId(dailyRecommends)">
                        <img src="/images/player/play.svg" alt="Play"/>
                    </button>
                </span>
            </div>
        </div>

        <!-- 用户歌单 -->
        <TabWidget id="userLists" :tabs="platformTabs" :scrollOnClick="true" :onTabSwitch="platformChange">
            <template #default>
                <div class="musicBox songlists userLists" id="playlists_netease"></div>
                <div class="musicBox songlists userLists" id="playlists_qqmusic"></div>
                <div class="musicBox songlists userLists" id="playlists_kuwo"></div>
                <div class="musicBox songlists userLists" id="playlists_kugou"></div>
            </template>
        </TabWidget>
    </div>
</template>
