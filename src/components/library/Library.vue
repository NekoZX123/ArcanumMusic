<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import './libraryStyle.css';

// 导入组件
import { SonglistCard, SongCard } from '../../assets/widgets/Widgets.tsx';
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

// 问候语
const userName = ref('NekoZX');
const greetings = ref('');
const greetingsEnd = ref('');
const greetList = ['欢迎回来! ', 'Welcome back! ', 'お帰りなさい! '];
const greetSubfix = [' ~', ' ~', ' ちゃん~'];

onMounted(() => {
    console.log('Library.vue loaded');

    // 加载问候语
    const choice = Math.floor(Math.random() * greetList.length);
    greetings.value = greetList[choice];
    greetingsEnd.value = greetSubfix[choice];
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
                <span class="listContent flex column">
                    <SongCard id="1" coverUrl="/images/player/testAlbum.png" name="Song name 1" authors="Author 1"></SongCard>
                    <SongCard id="2" coverUrl="/images/player/testAlbum.png" name="Song name 02" authors="Author 2"></SongCard>
                    <SongCard id="3" coverUrl="/images/player/testAlbum.png" name="nekozx daisuki" authors="Author 3"></SongCard>
                    <SongCard id="4" coverUrl="/images/player/testAlbum.png" name="Song Name 333" authors="Author 4, 5, 6"></SongCard>
                </span>
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
        <TabWidget id="userLists" :tabs="platformTabs" :scrollOnClick="true">
            <template #default>
                <div class="musicBox songlists" id="playlists_netease">
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="List 01"></SonglistCard>
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="List 02"></SonglistCard>
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="List 03"></SonglistCard>
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="List 04"></SonglistCard>
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="List 114514"></SonglistCard>
                    
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="List 1919810"></SonglistCard>
                </div>

                <div class="musicBox songlists" id="playlists_qqmusic">
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="QQMusic List"></SonglistCard>
                </div>

                <div class="musicBox songlists" id="playlists_kuwo">
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="Kuwo List 01"></SonglistCard>
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="Kuwo List 02"></SonglistCard>
                </div>

                <div class="musicBox songlists" id="playlists_kugou">
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="Kugou List 01"></SonglistCard>
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="Kugou List 02"></SonglistCard>
                    <SonglistCard id="114514" coverUrl="/images/player/testAlbum.png" name="Kugou List 03"></SonglistCard>
                </div>
            </template>
        </TabWidget>
    </div>
</template>
