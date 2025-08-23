<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import './libraryStyle.css';

import { SongCard } from '../../assets/widgets/Widgets.tsx';
import TabWidget from '../../assets/widgets/TabWidget.vue';
import { getNeteaseResult } from '../../assets/scripts/netease/neteaseRequest.ts';
import { getAccountInfo } from '../../assets/utilities/accountManager.ts';
import { parseMusicData } from '../../assets/utilities/dataParsers.ts';
import { addSongCard, addSonglistCard } from '../../assets/utilities/elementControl.ts';
import { getQQmusicResult } from '../../assets/scripts/qqmusic/qqmusicRequest.ts';
import { getKuwoResult } from '../../assets/scripts/kuwo/kuwoRequest.ts';
import { getKugouResult } from '../../assets/scripts/kugou/kugouRequest.ts';
import type { AxiosResponse } from 'axios';

const platformTabs = [
    {
        title: '网易云音乐',
        icon: '/images/platforms/netease.png'
    },
    {
        title: 'QQ 音乐',
        icon: '/images/platforms/qqmusic.png'
    },
    {
        title: '酷我音乐',
        icon: '/images/platforms/kuwo.png'
    },
    {
        title: '酷狗音乐',
        icon: '/images/platforms/kugou.png'
    }
];

// 问候语
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

onMounted(() => {
    const userData = getAccountInfo('all');

    // 加载问候语
    const choice = Math.floor(Math.random() * greetList.length);
    greetings.value = greetList[choice];
    greetingsEnd.value = greetSubfix[choice];

    // 加载收藏歌曲
    getNeteaseResult('userFavourites', {}, userData.netease.cookies)
        .then((response) => {
            // console.log(response.data);
            const favList = parseMusicData(response, 'netease', 'userFavourites');

            const favContainer = document.getElementById('userFavouritesPreview') as HTMLElement;
            if (!favContainer) {
                console.error(`[Error] Failed to get element #userFavouritesPreview`);
                return;
            }
            
            const loadList = favList.loadTracks;
            for (let i = 0; i < 4; i++) {
                const songInfo = loadList[i];
                if (i >= loadList.length) {
                    break;
                }

                const songId = `music-netease-${songInfo.songId}`;
                addSongCard(favContainer, songId, songInfo.songName, songInfo.songCover, songInfo.songAuthors);
            }
        });
    // getQQmusicResult('userFavourites', {}, userData.qqmusic.cookies)
    //     .then((response) => {
    //         console.log(response.data);
    //     });

    // 加载初始标签内容
    platformChange({ widgetId: 'HOMO114514', current: 0 });

    console.log('Library.vue loaded');
});
</script>

<template>
    <div class="flex column" id="musicLibrary">
        <!-- 当前用户信息 -->
        <div class="flex row" id="userInfo">
            <img src="/images/library/defaultAvatar.svg" id="avatar" alt="User avatar"/>
            <div class="flex column" id="userInfoText">
                <label class="text large bold" id="userName">{{ greetings + userName + greetingsEnd }}</label>
                <label class="text ultraSmall decoration">在此处访问您的所有音乐</label>
            </div>
        </div>

        <!-- 收藏 & 推荐 -->
        <div class="flex row" id="userCollections">
            <div class="songlistCard exlarge flex row" id="userFavourites">
                <span class="cardHeader flex row">
                    <span class="cardInfo flex column">
                        <label class="text medium bold">我喜欢的音乐</label>
                        <label class="text ultraSmall">共 0 首歌</label>
                    </span>
                    <button class="songlistPlay" id="userFavrourites_play">
                        <img src="/images/player/play.svg" alt="Play"/>
                    </button>
                </span>
                <span class="listContent flex column" id="userFavouritesPreview"></span>
            </div>

            <div class="songlistCard large flex column" id="dailyRecommend">
                <span class="cardHeader flex column">
                    <label class="text bold medium">每日推荐</label>
                    <label class="text light ultraSmall">共 30 首</label>
                </span>
                <span class="listContent flex column">
                    <SongCard id="5" coverUrl="/images/player/testAlbum.png" name="nekozx daisuki" authors="Author 114"></SongCard>
                    <SongCard id="6" coverUrl="/images/player/testAlbum.png" name="daily recommend" authors="Author 514"></SongCard>
                </span>
                <span class="cardFooter flex row">
                    <span class="musicSource flex row">
                        <label class="text ultraSmall">音乐源: </label>
                        <img class="playlistSource" src="/images/platforms/netease.png" alt="Netease Music"/>
                    </span>
                    <button class="songlistPlay" id="dailyRecommend_play">
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
