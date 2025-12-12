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
        title: '综合搜索',
        icon: './images/platforms/multiplatform.png'
    },
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
const platformArray = ['multiplatform', 'netease', 'qqmusic', 'kuwo', 'kugou'];
const typeGetters: Record<string, any> = {
    'multiplatform': getMultiplatformSearchTypes,
    'netease': getNeteaseSearchTypes,
    'qqmusic': getQQmusicSearchTypes,
    'kuwo': getKuwoSearchTypes,
    'kugou': getKugouSearchTypes
};
const requestFunc: Record<string, any> = {
    'multiplatform': searchMultiplatform,
    'netease': getNeteaseResult,
    'qqmusic': getQQmusicResult,
    'kuwo': getKuwoResult,
    'kugou': getKugouResult
}
const currentPlatform = ref('multiplatform');
const currentType = ref(0);
let pageIndex = 0;

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

    searchOnTypeChange({ widgetId: tabInfo.widgetId, current: currentType.value });
}

// 综合搜索

// 搜索类型
function getMultiplatformSearchTypes () {
    return {
        'netease': getNeteaseSearchTypes(),
        'qqmusic': getQQmusicSearchTypes(),
        'kuwo': getKuwoSearchTypes(),
        'kugou': getKugouSearchTypes()
    };
}

// 单平台搜索
function searchSinglePlatform(platform: string, keyword: string, type: string, isMultiplatform: boolean = false, isNextPage: boolean = false) {
    const userData = getAccountInfo('all');

    const getType = typeGetters[platform];
    if (!getType) {
        console.error(`[Error] Unsupported platform ${platform}`);
        return;
    }

    const searchType = getType(type)[type];

    const sendRequest = requestFunc[platform];
    if (!sendRequest) {
        console.error(`[Error] Unsupported platform ${platform}`);
        return;
    }
    
    sendRequest('search', { keyword: keyword, type: searchType, pageIndex: pageIndex }, userData[platform].cookies)
        .then((response: AxiosResponse) => {
            // console.log(response.data);
            const result = parseMusicData(response, platform, `search-${type}`);
            console.log(result);
            
            setTimeout(() => {
                const containerFilter = `type-${isMultiplatform ? 'multiplatform' : platform}-${type}`;
                const container = document.getElementById(containerFilter) as HTMLElement;
                // console.log(container);
                if (!container) {
                    console.error(`[Error] Failed to get HTML Element #${containerFilter}`);
                    return;
                }

                // 非多平台搜索时清空容器
                if (!isMultiplatform && !isNextPage) {
                    container.innerHTML = '';
                }

                if (type === 'singles') { // 单曲
                    const songList = result.songList;
                    songList?.forEach((songInfo: any) => {
                        const songId = `music-${platform}-${songInfo.songId}`;
                        addSongCard(container, songId, songInfo.songName, songInfo.songCover, 
                            songInfo.songAuthors, songInfo.songDuration);
                    });
                }
                if (type === 'songlists') { // 歌单
                    const lists = result.lists;
                    lists?.forEach((listInfo: any) => {
                        const listId = `songlist-${platform}-${listInfo.listId}`;
                        addSonglistCard(container, listId, listInfo.listName, listInfo.listCover);
                    });
                }
                if (type === 'albums') { // 专辑
                    const albumList = result.albumList;
                    albumList?.forEach((albumInfo: any) => {
                        const albumId = `album-${platform}-${albumInfo.albumId}`;
                        addSonglistCard(container, albumId, albumInfo.albumName, albumInfo.albumCover);
                    });
                }
                if (type === 'artists') { // 歌手
                    const artistList = result.artistList;
                    artistList?.forEach((artistInfo: any) => {
                        const artistId = `artist-${platform}-${artistInfo.artistId}`;
                        addArtistCard(container, artistId, artistInfo.artistName, artistInfo.artistCover);
                    });
                }
            }, 200);
        })
        .catch((error: AxiosError) => {
            console.log(error);
        });
}

// 进行综合搜索
function searchMultiplatform(type: string) {
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

    for (let i = 1; i < platformArray.length; i++) {
        const platform = platformArray[i];

        searchSinglePlatform(platform, keyword, type, true);
    }
}

// 搜索类型改变时触发
function searchOnTypeChange(tabInfo: { widgetId: string, current: number }, isNextPage: boolean = false) {
    currentType.value = tabInfo.current;
    
    // 自动重置页码
    if (!isNextPage) pageIndex = 0;
    
    // 综合搜索判断
    if (currentPlatform.value === 'multiplatform') {
        searchMultiplatform(typeArray[tabInfo.current]);
        return;
    }

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

    searchSinglePlatform(currentPlatform.value, keyword, type, false, isNextPage);
}

// 加载下一页
function loadNextPage(_: MouseEvent) {
    pageIndex ++;

    searchOnTypeChange({ widgetId: '', current: currentType.value }, true);
}

onMounted(() => {
    const searchInput = document.getElementById('searchBarContainer') as HTMLElement;
    if (searchInput) {
        searchInput.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                searchOnTypeChange({ widgetId: '', current: currentType.value });
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
                <img class="outlineImage" src="/images/pageSwitcher/clear.svg"></img>
            </button>
            <button id="searchConfirm" title="搜索" @click="() => {searchOnTypeChange({ widgetId: '', current: currentType });}">
                <img class="outlineImage" src="/images/pageSwitcher/search.svg"></img>
            </button>
        </div>

        <!-- 内容 -->
        <TabWidget id="searchPlatform" :tabs="platformTabs" :scroll-on-click="false" :on-tab-switch="platformChange">
            <template #default>
                <TabWidget id="searchType_multiplatform" :tabs="searchTypeTabs" :use-small-tabs="true" :on-tab-switch="searchOnTypeChange">
                    <template #default>
                        <div class="musicBox singles" id="type-multiplatform-singles"></div>
                        <div class="musicBox songlists" id="type-multiplatform-songlists"></div>
                        <div class="musicBox songlists" id="type-multiplatform-albums"></div>
                        <div class="musicBox artists" id="type-multiplatform-artists"></div>
                    </template>
                </TabWidget>

                <TabWidget id="searchType_netease" :tabs="searchTypeTabs" :use-small-tabs="true" :on-tab-switch="searchOnTypeChange">
                    <template #default>
                        <div class="musicBox singles" id="type-netease-singles"></div>
                        <div class="musicBox songlists" id="type-netease-songlists"></div>
                        <div class="musicBox songlists" id="type-netease-albums"></div>
                        <div class="musicBox artists" id="type-netease-artists"></div>
                    </template>
                </TabWidget>

                <TabWidget id="searchType_qqmusic" :tabs="searchTypeTabs" :use-small-tabs="true" :on-tab-switch="searchOnTypeChange">
                    <template #default>
                        <div class="musicBox singles" id="type-qqmusic-singles"></div>
                        <div class="musicBox songlists" id="type-qqmusic-songlists"></div>
                        <div class="musicBox songlists" id="type-qqmusic-albums"></div>
                        <div class="musicBox artists" id="type-qqmusic-artists"></div>
                    </template>
                </TabWidget>

                <TabWidget id="searchType_kuwo" :tabs="searchTypeTabs" :use-small-tabs="true" :on-tab-switch="searchOnTypeChange">
                    <template #default>
                        <div class="musicBox singles" id="type-kuwo-singles"></div>
                        <div class="musicBox songlists" id="type-kuwo-songlists"></div>
                        <div class="musicBox songlists" id="type-kuwo-albums"></div>
                        <div class="musicBox artists" id="type-kuwo-artists"></div>
                    </template>
                </TabWidget>
                
                <TabWidget id="searchType_kugou" :tabs="searchTypeTabs" :use-small-tabs="true" :on-tab-switch="searchOnTypeChange">
                    <template #default>
                        <div class="musicBox singles" id="type-kugou-singles"></div>
                        <div class="musicBox songlists" id="type-kugou-songlists"></div>
                        <div class="musicBox songlists" id="type-kugou-albums"></div>
                        <div class="musicBox artists" id="type-kugou-artists"></div>
                    </template>
                </TabWidget>
            </template>
        </TabWidget>

        <!-- 查看更多 (下一页) 按钮 -->
        <button class="flex row listButton" id="loadMoreButton" @click="loadNextPage">
            <label class="text small bold">查看更多</label>
        </button>
    </div>
</template>
