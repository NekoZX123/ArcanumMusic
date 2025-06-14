<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import './libraryStyle.css';

// 导入组件
import { SonglistCard, SongCard } from '../../assets/widgets/Widgets.tsx';

// 歌单列表
var currentContainerId = 'netease';
// 歌单列表切换功能
function changeCurrentContainer(id: string) {
    if (currentContainerId === id) return;

    // 滚动页面
    document.getElementById('playlistSourceTabs')?.scrollIntoView({ behavior: 'smooth' });

    document.getElementById(currentContainerId)?.classList.remove('current');
    document.getElementById(id)?.classList.add('current');

    let prevContainer = document.getElementById('playlists_' + currentContainerId);
    let nextContainer = document.getElementById('playlists_' + id);

    if (prevContainer && nextContainer) {
        prevContainer.classList.remove('current');
        nextContainer.classList.add('current');
    }

    currentContainerId = id;
}
function onSourceTabClick(event: any) {
    let target = event.target;
    if (event.target.tagName === 'IMG' || event.target.tagName === 'LABEL') {
        target = event.target.parentElement;
    }
    if (target.tagName === 'BUTTON') {
        changeCurrentContainer(target.id);
    }
}

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

    // 获取歌单元素
    changeCurrentContainer('netease');
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
        <div class="flex column" id="userPlaylistContainer">
            <span class="flex row" id="playlistSourceTabs">
                <button class="tabWidget sourceTab flex row current" id="netease" @click="onSourceTabClick">
                    <img src="/images/platforms/netease.png"/>
                    <label class="text bold small">网易云音乐</label>
                </button>
                <button class="tabWidget sourceTab flex row" id="qqmusic" @click="onSourceTabClick">
                    <img src="/images/platforms/qqmusic.png"/>
                    <label class="text bold small">QQ音乐</label>
                </button>
                <button class="tabWidget sourceTab flex row" id="kuwo" @click="onSourceTabClick">
                    <img src="/images/platforms/kuwo.png"/>
                    <label class="text bold small">酷我音乐</label>
                </button>
                <button class="tabWidget sourceTab flex row" id="kugou" @click="onSourceTabClick">
                    <img src="/images/platforms/kugou.png"/>
                    <label class="text bold small">酷狗音乐</label>
                </button>
            </span>
            <div class="musicContainer" id="userPlaylists">
                <div class="musicBox songlists current" id="playlists_netease">
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
            </div>
        </div>
    </div>
</template>
