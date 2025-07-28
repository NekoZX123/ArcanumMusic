<script setup lang="tsx">
import { onMounted } from 'vue';
import './searchStyle.css';

import { SonglistCard, SongCard, ArtistCard } from '../../assets/widgets/Widgets.tsx';
import TabWidget from '../../assets/widgets/TabWidget.vue';

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


onMounted(() => {
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
            <button id="searchConfirm" title="搜索">
                <img src="/images/pageSwitcher/search.svg"></img>
            </button>
        </div>

        <!-- 内容 -->
        <TabWidget id="searchPlatform" :tabs="platformTabs" :scroll-on-click="false">
            <template #default>
                <TabWidget id="searchType_netease" :tabs="searchTypeTabs" :use-small-tabs="true">
                    <template #default>
                        <div class="musicBox singles current" id="type_singles">
                            <SongCard id="single@netease.114514" coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                            <SongCard id="single@netease.114514" coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                            <SongCard id="single@netease.114514" coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                            <SongCard id="single@netease.114514" coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                            <SongCard id="single@netease.114514" coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                        </div>
                        <div class="musicBox songlists" id="type_songlists">
                            <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                            <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                            <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                            <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                            <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                            <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        </div>
                        <div class="musicBox songlists" id="type_albums">
                            <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                            <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                            <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                            <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        </div>
                        <div class="musicBox artists" id="type_artists">
                            <ArtistCard id="artist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></ArtistCard>
                        </div>
                    </template>
                </TabWidget>

                <TabWidget id="searchType_qqmusic" :tabs="searchTypeTabs" :use-small-tabs="true">
                    <template #default>
                        <div class="musicBox singles current" id="type_singles">
                            <SongCard id="single@qqmusic.114514" coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                        </div>
                        <div class="musicBox songlists" id="type_songlists">
                            <SonglistCard id="songlist@qqmusic.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        </div>
                        <div class="musicBox songlists" id="type_albums">
                            <SonglistCard id="songlist@qqmusic.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        </div>
                        <div class="musicBox artists" id="type_artists">
                            <ArtistCard id="artist@qqmusic.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></ArtistCard>
                        </div>
                    </template>
                </TabWidget>

                <TabWidget id="searchType_kuwo" :tabs="searchTypeTabs" :use-small-tabs="true">
                    <template #default>
                        <div class="musicBox singles current" id="type_singles">
                            <SongCard id="single@kuwo.114514" coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                        </div>
                        <div class="musicBox songlists" id="type_songlists">
                            <SonglistCard id="songlist@kuwo.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        </div>
                        <div class="musicBox songlists" id="type_albums">
                            <SonglistCard id="songlist@kuwo.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        </div>
                        <div class="musicBox artists" id="type_artists">
                            <ArtistCard id="artist@kuwo.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></ArtistCard>
                        </div>
                    </template>
                </TabWidget>
                
                <TabWidget id="searchType_kugou" :tabs="searchTypeTabs" :use-small-tabs="true">
                    <template #default>
                        <div class="musicBox singles current" id="type_singles">
                            <SongCard id="single@kugou.114514" coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                        </div>
                        <div class="musicBox songlists" id="type_songlists">
                            <SonglistCard id="songlist@kugou.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        </div>
                        <div class="musicBox songlists" id="type_albums">
                            <SonglistCard id="songlist@kugou.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        </div>
                        <div class="musicBox artists" id="type_artists">
                            <ArtistCard id="artist@kugou.1919810" coverUrl="/images/player/testAlbum.png" name="Sample.text"></ArtistCard>
                        </div>
                    </template>
                </TabWidget>
            </template>
        </TabWidget>
    </div>
</template>
