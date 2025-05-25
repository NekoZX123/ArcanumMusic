<script setup lang="ts">
import { createApp, onMounted, ref } from 'vue';
import Lyrics from './components/lyrics/Lyrics.vue';

import { showNotify } from './assets/notifications/Notification.ts';
import { showPopup } from './assets/notifications/popup.tsx';
import { createPlayer } from './assets/player/player.ts';
import { changePage, getCurrentPage, initialize, pageBack, pageForward } from './assets/utilities/pageSwitcher.ts';

import { getNeteaseLyrics, getNeteaseSearchResult, getNeteaseSonglink } from './assets/scripts/netease/neteaseRequest.ts';
import { getKuwoLyrics, getKuwoSearchResult, getKuwoSonglink } from './assets/scripts/kuwo/kuwoRequest.ts';
import { getKugouLyrics, getKugouSearchResult, getKugouSonglink } from './assets/scripts/kugou/kugouRequest.ts';
import { getQQmusicSonglink } from './assets/scripts/qqmusic/qqmusicRequest.ts';

// 设置文件位置
const configLocation = '/ArcanumMusic/settings.json';
var appConfig = '';

// 获取应用配置存放位置
async function getConfigPath() {
    let prefix = await window.electron.getAppDataLocal();
    return `${prefix}${configLocation}`;
}
// 设置文件判断 & 创建 / 读取
function prepareSettings() {
    return new Promise<string>(async (resolve) => {
        let configPath = await getConfigPath();

        let configData = await window.electron.readLocalFile(configPath);

        resolve(configData);
    });
}

/* 窗口移动功能 */
let startX = 0;
let startY = 0;
let isMoving = false;

// 最小化窗口
function minimizeWindow() {
    (window as any).electron.minimizeWindow();
}

// 最大化 / 还原窗口
const maxButtonSrc = ref('/images/windowControl/maximize.svg');
async function toggleMaximize() {
    let winMaximumState = await (window as any).electron.toggleMaximize();

    if (winMaximumState) {
        maxButtonSrc.value = maxButtonSrc.value.replace('maximize.svg', 'restore.svg');
    }
    else {
        maxButtonSrc.value = maxButtonSrc.value.replace('restore.svg', 'maximize.svg');
    }
}

// 关闭当前窗口
const closeButtonSrc = ref('/images/windowControl/close.svg');
function closeHover() {
    closeButtonSrc.value = '/images/windowControl/close.hover.svg';
}
function closeUnHover() {
    closeButtonSrc.value = '/images/windowControl/close.svg';
}
function closeWindow() {
    (window as any).electron.closeWindow();
}

// 移动窗口
async function titlebarMouseDown(event: any) {
    let e = document.elementFromPoint(event.x, event.y);
    if (!e) return;
    if (e.id === 'windowControlBar' && event.buttons === 1) {
        startX = event.x;
        startY = event.y;
        isMoving = true;
    }
}

function titlebarMouseMove(event: any) {
    if (event.buttons === 1 && isMoving) {
        let currentX = event.x - startX;
        let currentY = event.y - startY;
        let winRect = (window as any).electron.getWindowRect();
        (window as any).electron.moveWindow(winRect.x + currentX, winRect.y + currentY);
    }
}

function titlebarMouseUp() {
    startX = 0;
    startY = 0;
    isMoving = false;
}

// 页面挂载切换器
let latestPage = 'home';
function onTabChange(event: any) {
    let target = event.target;
    let currentPage = getCurrentPage();
    if (event.target.tagName === 'IMG') target = event.target.parentElement;
    if (target.id !== currentPage) {
        changePage(target.id);
    }
}
function togglePlaylist(_: MouseEvent) {
    let currentPage = getCurrentPage();

    if (currentPage === 'playlist') {
        changePage(latestPage);
    }
    else {
        latestPage = currentPage;
        changePage('playlist');
    }
}

// 搜索框焦点事件 & 清除
function searchInFocus() {
    let clearButton = document.getElementById('clearButton');
    if (clearButton) clearButton.style.display = 'block';
}
function searchOutFocus() {
    let clearButton = document.getElementById('clearButton');
    if (clearButton) setTimeout(() => {
        clearButton.style.display = 'none'
    }, 100);
}
function clearSearchBar() {
    console.log('114514');
    let bar = document.getElementById('search') as HTMLInputElement;
    if (bar) {
        bar.value = '';
    }
}

// 弹窗回调
function popupCallback(code: number) {
    console.log(code);
}

// 当前音乐信息
const playerMetaInfo = ref(createPlayer(['volumeControl', 'lyricsVolume']));
const progressTooltipOffset = ref('left: 0');

// 播放进度调整
function startProgressAdjust(event: MouseEvent) {
    if (event.buttons === 1) {
        // 添加全局事件监听器
        showProgressTooltip();
        document.addEventListener('mousemove', adjustPlayProgress);

        document.addEventListener('mouseup', () => {
            hideProgressTooltip();
            document.removeEventListener('mousemove', adjustPlayProgress);
        });
    }
}
function adjustPlayProgress(event: MouseEvent) {
    const progressBar = document.getElementById('playProgress');
    if (!progressBar) return;

    if (event.buttons === 1) {
        // 移动播放进度提示
        let tooltipX = event.clientX;
        if (tooltipX < 80) tooltipX = 80;
        if (tooltipX > document.body.clientWidth - 80) tooltipX = document.body.clientWidth - 80;

        progressTooltipOffset.value = `left: calc(${tooltipX}px - 4rem)`;

        // 设置进度条宽度
        let deltaX = event.clientX - progressBar.getBoundingClientRect().left;
        let progress = deltaX / progressBar.clientWidth;

        // 防止范围溢出
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;

        // 设置播放进度文字
        let playProgress = Math.round(playerMetaInfo.value.duration * progress);
        playerMetaInfo.value.updateProgress(playProgress);
    }
}

function showProgressTooltip(_: any = undefined) {
    let tooltip = document.getElementById('progressTooltip');
    if (tooltip) {
        tooltip.classList.add('show');
    }
}
function hideProgressTooltip(_: any = undefined) {
    let tooltip = document.getElementById('progressTooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
    }
}

// 音量调整
function adjustVolume(event: MouseEvent) {
    if (event.buttons !== 1) return;

    let volumeBar = document.getElementById('volumeControl') as HTMLInputElement;
    if (!volumeBar) return;
    
    playerMetaInfo.value.setVolume(Number(volumeBar.value));
}

// 切换歌词面板
function showLyrics(_: MouseEvent) {
    const lyricsPanel = document.getElementById('lyricsArea');
    if (!lyricsPanel) return;

    lyricsPanel.style = 'display: block';
    setTimeout(() => {
        lyricsPanel.classList.add('show');
    }, 50);
}

onMounted(async () => {
    // 设置文件准备
    let configData = await prepareSettings();
    appConfig = JSON.parse(configData);
    console.log(appConfig);

    // 加载初始页面
    initialize();

    // 测试通知
    showNotify('Notifyyyyyy', 'success', 'Welcome!', 'Welcome to Arcanum Music!', 3000);

    // 测试弹窗
    showPopup('success', 'notice', 
        'Welcome', '欢迎使用 Arcanum Music! \n (此应用仍在开发中)', 
        [], popupCallback);

    // 歌词面板挂载
    const lyrics = createApp(Lyrics);
    lyrics.mount('#lyricsArea');

    const lyricsArea = document.getElementById('lyricsArea');
    if (lyricsArea) lyricsArea.style = 'display: none;';

    // 初始化播放器
    const player = playerMetaInfo.value;
    // [For Debug]
    player?.updateDuration(114);
    player?.updateProgress(0);

    // 测试请求 (网易云音乐)
    const udebug = 'NETEASE_MUSIC_U';
    getNeteaseSonglink('2064724623', 'jymaster', { 'MUSIC_U': udebug })
        .then((response) =>{
            console.log(response.data);
        });
    getNeteaseSearchResult('Memories of kindness', { 'MUSIC_U': udebug })
        .then((response) => {
            console.log(response.data);
        });
    getNeteaseLyrics('2064724623', { 'MUSIC_U': udebug })
        .then((response) => {
            console.log(response.data);
        });

    // 测试请求 (酷我音乐)
    getKuwoSonglink('287928307')
        .then((response) => {
            console.log(response.data);
        });
    getKuwoSearchResult('Blue Canvas')
        .then((response) => {
            console.log(response.data);
        });
    getKuwoLyrics('287928307')
        .then((response) => {
            console.log(response.data);
        });
    
    // 测试请求 (酷狗音乐)
    const kugouUser = 'KUGOO';
    getKugouSonglink('9xlu7513', { KuGoo: kugouUser })
        .then((response) => {
            console.log(response.data);
        });
    getKugouSearchResult('Shooting Athletes')
        .then((response) => {
            console.log(response.data);
        });
    getKugouLyrics('8y83yg8c', { KuGoo: kugouUser })
        .then((response) => {
            console.log(response.data);
        });
    // 测试请求 (QQ音乐)
    const qqmusicToken = 'QQMUSIC_TOKEN';
    getQQmusicSonglink('003UlmlI0hkj8t', { uin: 2168979907, qm_keyst: qqmusicToken })
        .then((response) => {
            console.log(response.data);
        });
});
</script>

<template>
    <div id="windowMain">
        <!-- 窗口标题栏 -->
        <div class="flex row" id="windowControlBar"  
            @mousedown="titlebarMouseDown" @mousemove="titlebarMouseMove" @mouseup="titlebarMouseUp">
            <span class="flex row" id="windowDrag">
                <img id="appIcon" src="/images/appIcon/appIcon.png"/>
                <label class="text small">Arcanum Music</label>
            </span>
            <span id="windowOptions">
                <button class="windowControl default" id="minimizeButton" @click="minimizeWindow">
                    <img src="/images/windowControl/minimize.svg" alt="Minimize">
                </button>
                <button class="windowControl default" id="maximizeButton" @click="toggleMaximize">
                    <img :src="maxButtonSrc" alt="Maximize / Restore">
                </button>
                <button class="windowControl close" id="closeButton" 
                    @click="closeWindow" @mouseenter="closeHover" @mouseleave="closeUnHover">
                    <img :src="closeButtonSrc" alt="Close">
                </button>
            </span>
        </div>

        <div id="appMain">
            <div class="flex row" id="windowTop">
                <!-- 前进 / 后退 -->
                <div class="flex row" id="backForward">
                    <button class="pageControl" id="pageBack" @click="pageBack">
                        <img src="/images/topbar/arrowLeft.svg" alt="Back"/>
                    </button>
                    <button class="pageControl" id="pageForawrd" @click="pageForward">
                        <img src="/images/topbar/arrowRight.svg" alt="Forward"/>
                    </button>
                </div>

                <!-- 窗口标签页 -->
                <div class="flex row" id="windowTabs">
                    <button class="text small tabWidget pageTab current" id="home" @click="onTabChange">首页</button>
                    <button class="text small tabWidget pageTab" id="library" @click="onTabChange">音乐库</button>
                </div>

                <!-- 搜索框 -->
                <span id="searchContainer">
                    <label class="text small" id="searchPrev">🔍</label>
                    <input class="textInput text ultraSmall" id="search" type="text" placeholder="搜索..."
                        @focusin="searchInFocus" @focusout="searchOutFocus" @keypress.enter="onTabChange"/>
                    <button class="text small" id="clearButton" @click="clearSearchBar">
                        <img src="/images/topbar/clear.svg" alt="Clear search bar"/>
                    </button>
                </span>

                <!-- 设置 -->
                <button id="settings" @click="onTabChange">
                    <img src="/images/topbar/settings.svg" alt="Application settings"/>
                </button>
            </div>

            <!-- 页面内容 -->
            <div id="pageContainer">
                <div id="pageContent"></div>
                <div id="bottomBlock"></div>
            </div>
        </div>

        <!-- 播放器控制栏 -->
        <div class="flex column" id="playControlContainer">
            <div class="fluentProgress flex row" id="playProgress" @mousedown="startProgressAdjust" @mousemove="adjustPlayProgress">
                <div class="fluentFilled" id="playedCover" :style="`width: ${playerMetaInfo.progressPercentage}%`"></div>
            </div>
            <div class="flex row" id="playControlBar">
                <!-- 当前歌曲信息 -->
                <div class="flex row" id="currentSong">
                    <img class="currentSongCover" :src="playerMetaInfo.coverUrl"/>
                    <span class="flex column">
                        <label class="text small bold">{{ playerMetaInfo.name }}</label>
                        <label class="text ultraSmall">{{ playerMetaInfo.authors }}</label>
                    </span>
                </div>

                <!-- 播放控制 -->
                <div class="flex row" id="playControl">
                    <button class="playControl" id="previousButton">
                        <img src="/images/player/previous.svg" alt="Previous song"/>
                    </button>
                    <button class="playControl large" id="playButton">
                        <img src="/images/player/play.dark.svg" alt="Play / Pause"/>
                    </button>
                    <button class="playControl" id="nextButton">
                        <img src="/images/player/next.svg" alt="Next song"/>
                    </button>
                </div>

                <!-- 其他控制 / 歌词 -->
                <div class="flex row" id="controlRightBar">
                    <button class="playControl small" id="playlist" @click="togglePlaylist">
                        <img src="/images/player/playlist.svg" alt="Toggle playlist"/>
                    </button>
                    <button class="playControl small" id="repeat" @click="playerMetaInfo.toggleRepeat">
                        <img :src="playerMetaInfo.repeatStateImage" alt="Toggle repeat"/>
                    </button>
                    <button class="playControl small" id="shuffle" @click="playerMetaInfo.toggleShuffle">
                        <img :src="playerMetaInfo.shuffleStateImage" alt="Toggle shuffle"/>
                    </button>
                    <span class="flex row">
                        <img class="playControl small" :src="playerMetaInfo.volumeLevel" @click="playerMetaInfo.toggleMute"/>
                        <input type="range" id="volumeControl" min="0" max="100" value="100" step="1" @mousemove="adjustVolume"/>
                    </span>
                    <button class="playControl small" id="lyrics" @click="showLyrics">
                        <img src="/images/player/expand.svg" alt="Expand lyrics"/>
                    </button>
                </div>
            </div>
        </div>
        

        <!-- 通知区域 -->
        <div class="notifyArea flex column" id="notifyArea"></div>

        <!-- 弹出窗口 -->
        <div class="flex column" id="popupArea"></div>

        <!-- 播放进度标签 -->
        <div class="text ultraSmall flex column" id="progressTooltip" :style="progressTooltipOffset">
            {{ `${playerMetaInfo.playedTimeText} / ${playerMetaInfo.durationText}` }}
        </div>

        <!-- 歌词面板 -->
        <div id="lyricsArea"></div>
    </div>
</template>
