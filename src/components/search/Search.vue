<script setup lang="ts">
import { onMounted, ref } from 'vue';
import './searchStyle.css';

import TabWidget from '../../assets/widgets/TabWidget.vue';
import { getNeteaseResult, getNeteaseSearchTypes } from '../../assets/scripts/netease/neteaseRequest';
import { getQQmusicResult, getQQmusicSearchTypes } from '../../assets/scripts/qqmusic/qqmusicRequest';
import { getKuwoResult, getKuwoSearchTypes } from '../../assets/scripts/kuwo/kuwoRequest';
import { getKugouResult, getKugouSearchTypes } from '../../assets/scripts/kugou/kugouRequest';
import type { AxiosError, AxiosResponse } from 'axios';
import { getAccountInfo } from '../../assets/utilities/accountManager';
import { parseMusicData } from '../../assets/utilities/dataParsers';
import { addArtistCard, addSongCard, addSonglistCard } from '../../assets/utilities/elementControl';

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
const searchTypeTabs = [
    { title: '单曲' },
    { title: '歌单' },
    { title: '专辑' },
    { title: '歌手' }
];

// 搜索框焦点事件 & 清除
function searchInFocus(_: any) {
    let clearButton = document.getElementById('searchClear');
    if (clearButton) clearButton.style.display = 'block';
}
function searchOutFocus(_: any) {
    let clearButton = document.getElementById('searchClear');
    if (clearButton) setTimeout(() => {
        clearButton.style.display = 'none'
    }, 200);
}
function clearSearchBar(_: any) {
    let bar = document.getElementById('searchBar') as HTMLInputElement;
    if (bar) {
        bar.value = '';
    }
}

// 平台标签页顺序
const platformArray = ['netease', 'qqmusic', 'kuwo', 'kugou'];
const typeGetters: Record<string, any> = {
    'netease': getNeteaseSearchTypes,
    'qqmusic': getQQmusicSearchTypes,
    'kuwo': getKuwoSearchTypes,
    'kugou': getKugouSearchTypes
};
const requestFunc: Record<string, any> = {
    'netease': getNeteaseResult,
    'qqmusic': getQQmusicResult,
    'kuwo': getKuwoResult,
    'kugou': getKugouResult
}
let currentPlatform = ref('netease');
let currentType = ref(0);
// 类型标签页顺序
const typeArray = ['singles', 'songlists', 'albums', 'artists'];

// 平台标签页改变时触发
function platformChange(tabInfo: { widgetId: string, current: number }) {
    const platform = platformArray[tabInfo.current];
    if (!platform) {
        console.error(`[Error] Index out of range (platformArray, index ${tabInfo.current})`);
        return;
    }

    currentPlatform.value = platform;
    currentType.value = 0;

    typeChange({ widgetId: tabInfo.widgetId, current: currentType.value });
}

// 搜索类型改变时触发
function typeChange(tabInfo: { widgetId: string, current: number }) {
    const userData = getAccountInfo('all');

    const getType = typeGetters[currentPlatform.value];
    if (!getType) {
        console.error(`[Error] Unsupported platform ${currentPlatform.value}`);
        return;
    }

    const type = typeArray[tabInfo.current];
    if (!type) {
        console.error(`[Error] Index out of range (platformArray, index ${tabInfo.current})`);
        return;
    }
    const searchType = getType(type)[type];
    currentType.value = tabInfo.current;

    // 获取搜索关键词
    const inputBar = document.getElementById('searchBar') as HTMLInputElement;
    if (!inputBar) {
        console.error('[Error] Search bar element not found');
        return;
    }
    const keyword = inputBar.value;
    if (keyword === '') {
        console.warn(`[Warning] Empty search bar, no request sent`);
        return;
    }

    const sendRequest = requestFunc[currentPlatform.value];
    if (!sendRequest) {
        console.error(`[Error] Unsupported platform ${currentPlatform.value}`);
        return;
    }
    
    sendRequest('search', { keyword: keyword, type: searchType }, userData[currentPlatform.value].cookies)
        .then((response: AxiosResponse) => {
            // console.log(response.data);
            const result = parseMusicData(response, currentPlatform.value, `search-${type}`);
            console.log(result);
            
            setTimeout(() => {
                const containerFilter = `type-${currentPlatform.value}-${type}`;
                const container = document.getElementById(containerFilter) as HTMLElement;
                // console.log(container);
                if (!container) {
                    console.error(`[Error] Failed to get HTML Element #${containerFilter}`);
                    return;
                }
                container.innerHTML = '';

                if (type === 'singles') { // 单曲
                    const songList = result.songList;
                    songList?.forEach((songInfo: any) => {
                        const songId = `music-${currentPlatform.value}-${songInfo.songId}`;
                        addSongCard(container, songId, songInfo.songName, songInfo.songCover, 
                            songInfo.songAuthors, songInfo.songDuration);
                    });
                }
                if (type === 'songlists') { // 歌单
                    const lists = result.lists;
                    lists?.forEach((listInfo: any) => {
                        const listId = `songlist-${currentPlatform.value}-${listInfo.listId}`;
                        addSonglistCard(container, listId, listInfo.listName, listInfo.listCover);
                    });
                }
                if (type === 'albums') { // 专辑
                    const albumList = result.albumList;
                    albumList?.forEach((albumInfo: any) => {
                        const albumId = `album-${currentPlatform.value}-${albumInfo.albumId}`;
                        addSonglistCard(container, albumId, albumInfo.albumName, albumInfo.albumCover);
                    });
                }
                if (type === 'artists') { // 歌手
                    const artistList = result.artistList;
                    artistList?.forEach((artistInfo: any) => {
                        const artistId = `artist-${currentPlatform.value}-${artistInfo.artistId}`;
                        addArtistCard(container, artistId, artistInfo.artistName, artistInfo.artistCover);
                    });
                }
            }, 200);
        })
        .catch((error: AxiosError) => {
            console.log(error);
        });
}

onMounted(() => {
    const searchInput = document.getElementById('searchBarContainer') as HTMLElement;
    if (searchInput) {
        searchInput.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                typeChange({ widgetId: '', current: currentType.value });
            }
        });
    }

    console.log('Search.vue loaded');
});
</script>

<template>
    <div class="flex column" id="musicSearch">
        <!-- 搜索框 -->
        <div class="flex row" id="searchBarContainer">
            <input id="searchBar" type="text" placeholder="搜索..."
                @focusin="searchInFocus" @focusout="searchOutFocus"></input>
            <button id="searchClear" title="清空" @click="clearSearchBar">
                <img src="/images/pageSwitcher/clear.svg"></img>
            </button>
            <button id="searchConfirm" title="搜索" @click="() => {typeChange({ widgetId: '', current: currentType });}">
                <img src="/images/pageSwitcher/search.svg"></img>
            </button>
        </div>

        <!-- 内容 -->
        <TabWidget id="searchPlatform" :tabs="platformTabs" :scroll-on-click="false" :on-tab-switch="platformChange">
            <template #default>
                <TabWidget id="searchType_netease" :tabs="searchTypeTabs" :use-small-tabs="true" :on-tab-switch="typeChange">
                    <template #default>
                        <div class="musicBox singles" id="type-netease-singles"></div>
                        <div class="musicBox songlists" id="type-netease-songlists"></div>
                        <div class="musicBox songlists" id="type-netease-albums"></div>
                        <div class="musicBox artists" id="type-netease-artists"></div>
                    </template>
                </TabWidget>

                <TabWidget id="searchType_qqmusic" :tabs="searchTypeTabs" :use-small-tabs="true" :on-tab-switch="typeChange">
                    <template #default>
                        <div class="musicBox singles" id="type-qqmusic-singles"></div>
                        <div class="musicBox songlists" id="type-qqmusic-songlists"></div>
                        <div class="musicBox songlists" id="type-qqmusic-albums"></div>
                        <div class="musicBox artists" id="type-qqmusic-artists"></div>
                    </template>
                </TabWidget>

                <TabWidget id="searchType_kuwo" :tabs="searchTypeTabs" :use-small-tabs="true" :on-tab-switch="typeChange">
                    <template #default>
                        <div class="musicBox singles" id="type-kuwo-singles"></div>
                        <div class="musicBox songlists" id="type-kuwo-songlists"></div>
                        <div class="musicBox songlists" id="type-kuwo-albums"></div>
                        <div class="musicBox artists" id="type-kuwo-artists"></div>
                    </template>
                </TabWidget>
                
                <TabWidget id="searchType_kugou" :tabs="searchTypeTabs" :use-small-tabs="true" :on-tab-switch="typeChange">
                    <template #default>
                        <div class="musicBox singles" id="type-kugou-singles"></div>
                        <div class="musicBox songlists" id="type-kugou-songlists"></div>
                        <div class="musicBox songlists" id="type-kugou-albums"></div>
                        <div class="musicBox artists" id="type-kugou-artists"></div>
                    </template>
                </TabWidget>
            </template>
        </TabWidget>
    </div>
</template>
