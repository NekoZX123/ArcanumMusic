<script setup lang="ts">
import {createApp, onMounted, onUnmounted, ref} from 'vue';
import Lyrics from './components/lyrics/Lyrics.vue';

import {showNotify} from './assets/notifications/Notification.ts';
import {createPlayer, getPlayer} from './assets/player/player.ts';
import {
  changePage,
  initialize,
  pageBack,
  pageForward,
  togglePlaylist,
  updatePlaylistIcon
} from './assets/utilities/pageSwitcher.ts';
// import { testRequest } from './assets/utilities/requestTests.ts';
import {PageButton} from './assets/widgets/pageSwitcher.tsx';
import {readAccountInfo} from './assets/utilities/accountManager.ts';
import {hideArtistSelect, hideRightMenu} from './assets/utilities/elementControl.ts';
import {getConfig, getPreference, loadConfig, loadPreference, writePreference} from './assets/utilities/configLoader.ts';
import {loadProxyPort} from './assets/utilities/proxyRequest.ts';
import {syncFocusedLyric} from './assets/lyrics/lyricsManager.ts';
import { initializeTheme, setControlBarTheme, type colorThemeName } from './assets/utilities/themeControl.ts';

/* 窗口移动功能 */
let startX = 0;
let startY = 0;
let isMoving = false;

// 最小化窗口
function minimizeWindow() {
    window.electron.minimizeWindow();
}

// 最大化 / 还原窗口
const maxButtonSrc = ref('./images/windowControl/maximize.svg');
let winMaximumState: boolean = false;
async function toggleMaximize() {
    winMaximumState = await window.electron.toggleMaximize();

    if (winMaximumState) {
        maxButtonSrc.value = maxButtonSrc.value.replace('maximize.svg', 'restore.svg');
    }
    else {
        maxButtonSrc.value = maxButtonSrc.value.replace('restore.svg', 'maximize.svg');
    }

    winMaximumState = !winMaximumState;
}

// 关闭当前窗口
const closeButtonSrc = ref('./images/windowControl/close.svg');
function closeHover() {
    closeButtonSrc.value = './images/windowControl/close.hover.svg';
}
function closeUnHover() {
    closeButtonSrc.value = './images/windowControl/close.svg';
}
function closeWindow() {
    savePreferences();

    window.electron.closeWindow();
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

async function titlebarMouseMove(event: any) {
    if (event.buttons === 1 && isMoving) {
        let currentX = event.x - startX;
        let currentY = event.y - startY;
        let winRect = await window.electron.getWindowRect();
        window.electron.moveWindow(winRect.x + currentX, winRect.y + currentY);
    }
}

function titlebarMouseUp() {
    startX = 0;
    startY = 0;
    isMoving = false;
}

// 当前音乐信息
// 创建播放器
createPlayer(['lyricsVolume']);
const progressTooltipOffset = ref('left: 0');
let targetProgress = 0;
const targetPercentage = ref(0);
const playTimeAdjustFlag = ref(false);

// 播放进度调整
// 开始调整
function adjustPlayProgress(mouseX: number) {
    const progressBar = document.getElementById('playProgress');
    if (!progressBar) return;

    // 移动播放进度提示
    let tooltipX = mouseX;
    if (tooltipX < 80) tooltipX = 80;
    if (tooltipX > document.body.clientWidth - 80) tooltipX = document.body.clientWidth - 80;

    progressTooltipOffset.value = `left: calc(${tooltipX}px - 4rem)`;

    // 设置进度条宽度
    const barRect = progressBar.getBoundingClientRect();
    let deltaX = mouseX - barRect.left;
    let progress = deltaX / progressBar.clientWidth;

    // 防止范围溢出
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // 设置播放进度文字
    let playProgress = Math.round((getPlayer()?.duration || 0) * progress);
    getPlayer()?.updateProgress(playProgress);
    targetProgress = playProgress;
    targetPercentage.value = progress * 100;
}
function startProgressAdjust(event: MouseEvent) {
    if (event.buttons === 1 && !playTimeAdjustFlag.value) {
        // 添加全局事件监听器
        showProgressTooltip();
        document.addEventListener('mousemove', adjustOnMouseMove);
        playTimeAdjustFlag.value = true;

        // 点击时同样调整进度
        adjustPlayProgress(event.clientX);

        // 结束调整
        const handleMouseUp = () => {
            hideProgressTooltip();
            document.removeEventListener('mousemove', adjustOnMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            getPlayer()?.setProgress(targetProgress);
            playTimeAdjustFlag.value = false;
        };

        document.addEventListener('mouseup', handleMouseUp);
    }
}
// 鼠标移动事件调整处理
function adjustOnMouseMove(event: MouseEvent) {
    const progressBar = document.getElementById('playProgress');
    if (!progressBar) return;

    if (event.buttons === 1 && playTimeAdjustFlag.value) {
        adjustPlayProgress(event.clientX);
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
    const volumeBar = document.getElementById('volumeBar');
    if (!volumeBar) return;

    if (event.buttons === 1) {
        // 设置音量条宽度
        let deltaX = event.clientX - volumeBar.getBoundingClientRect().left;
        let volume = Math.round(deltaX / volumeBar.clientWidth * 100);

        // 防止范围溢出
        if (volume < 0) volume = 0;
        if (volume > 100) volume = 100;

        getPlayer()?.setVolume(volume);
    }
}

// 切换播放列表
function togglePlaylistPanel(event: MouseEvent) {
    togglePlaylist(event);
}

// 切换歌词面板
const lyricShowEvent = new CustomEvent('lyrics-background-anim');
function showLyrics(_: MouseEvent) {
    const lyricsPanel = document.getElementById('lyricsArea');
    if (!lyricsPanel) return;

    lyricsPanel.style.display = 'block';
    setTimeout(() => {
        lyricsPanel.classList.add('show');
    }, 50);
    window.dispatchEvent(lyricShowEvent);
}

// 切换桌面歌词
const captionWindowOptions = {
    width: 700,
    height: 160,
    minWidth: 600,
    minHeight: 150,
    frame: false,
    transparent: true,
    focusable: true,
    skipTaskbar: true,
    maximizable: false,
    fullscreenable: false
};
// 桌面歌词窗口 ID
let captionWindowId = -1;
let isCaptionsOn: boolean = false;
// 桌面歌词窗口关闭处理
function handleCaptionsClose() {
    const captionsButton = document.getElementById('captions') as HTMLButtonElement;
    if (!captionsButton) {
        console.error(`[Error] Failed to get element #captions`);
        return;
    }

    captionsButton.classList.remove('active');
    window.electron.closeWindowById(captionWindowId);

    isCaptionsOn = false;
}
// 切换桌面歌词显示状态
async function toggleCaptions(_?: MouseEvent) {
    const captionsButton = document.getElementById('captions') as HTMLButtonElement;
    if (!captionsButton) {
        console.error(`[Error] Failed to get element #captions`);
        return;
    }

    if (isCaptionsOn) {
        captionsButton.classList.remove('active');
        await window.electron.closeWindowById(captionWindowId);

        window.localStorage.setItem('captionsWinId', '');
    }
    else {
        captionsButton.classList.add('active');
        const captionWindowUrl = `${window.location.href}?isDesktopLyrics=true`
        // 启动桌面歌词
        captionWindowId = await window.electron.createWindow(
            'Arcanum Music - Desktop Lyrics',
            captionWindowUrl,
            captionWindowOptions
        );

        window.localStorage.setItem('captionsWinId', captionWindowId.toString());

        // 同步播放状态及焦点歌词
        const player = getPlayer();
        setTimeout(() => {
            player?.syncPlayStateImage();
            player?.syncRepeatStateImage();
            player?.syncShuffleStateImage();
            syncFocusedLyric();
        }, 150);
    }

    isCaptionsOn = !isCaptionsOn;
}

// 长歌曲名称焦点滚动
function checkScrollAnimation(_: MouseEvent) {
    const nameContainer = document.getElementById('songNameContainer') as HTMLElement;
    const nameContent = document.getElementById('currentSongName') as HTMLElement;
    
    if (nameContainer.scrollWidth > nameContainer.offsetWidth && !nameContent.classList.contains('autoScroll')) {
        nameContent.classList.add(`autoScroll`);
    }
}
// 重置滚动动画
function resetScroll(_: MouseEvent) {
    const nameContent = document.getElementById('currentSongName') as HTMLElement;
    nameContent.classList.remove('autoScroll');
}

// 限制歌手文字长度
function limitAuthorsTextLength(authors: string) {
    const authorsContent = document.getElementById('currentSongAuthors') as HTMLElement;
    if (!authorsContent) {
        return;
    }

    if (authors.length > 15) {
      return `${authors.substring(0, 15)}...`;
    }
    return authors;
}

// 桌面歌词窗口播放控制 (使用 localStorage 作为中间桥)
const allowedIdentifiers = ['moe.nekozx.arcanummusic.desktoplyrics'];
function handleStorageData (updateEvent: StorageEvent) {
    if (updateEvent.key === 'playerSignal' && updateEvent.newValue) {
        const eventObject = JSON.parse(updateEvent.newValue);
        const eventName = eventObject.eventName;
        if (!allowedIdentifiers.includes(eventObject.message)) {
            console.error(`[Error] Unidentified identifier ${eventObject.message}`);
            return;
        }

        if (eventName === 'previous-song')      getPlayer()?.previousSong();    // 上一曲
        if (eventName === 'toggle-play-pause')  getPlayer()?.togglePlayPause(); // 播放 / 暂停
        if (eventName === 'next-song')          getPlayer()?.nextSong();        // 下一曲
        if (eventName === 'toggle-repeat')      getPlayer()?.toggleRepeat();    // 切换循环播放状态
        if (eventName === 'toggle-shuffle')     getPlayer()?.toggleShuffle();   // 切换随机播放状态
        if (eventName === 'captions-close')     handleCaptionsClose();          // 处理桌面歌词关闭事件
    }
}

// 保存用户配置
async function savePreferences() {
    let preferences = getPreference();

    // 窗口属性
    const windowRect = await window.electron.getWindowRect();
    preferences.window.width = windowRect.width;
    preferences.window.height = windowRect.height;
    preferences.window.isMaximized = winMaximumState;

    // 播放器属性
    preferences.player.desktopLyrics = isCaptionsOn;
    preferences.player.repeatState = getPlayer()?.repeatState;
    preferences.player.shuffleState = getPlayer()?.shuffleState;
    preferences.player.volume = getPlayer()?.volume;

    writePreference(preferences);
}

onMounted(async () => {
    // 绕过 QQ 音乐脚本环境监测
    // 参考 / Reference: https://jixun.uk/posts/2024/qqmusic-zzc-sign/
    window.__qmfe_sign_check = 1;

    // 加载代理端口
    loadProxyPort();

    // 加载配置文件
    await loadConfig();
    await loadPreference();

    // 测试通知
    setTimeout(() => showNotify('Notify1', 'success', 'Welcome!', 'Welcome to Arcanum Music!'), 2000);

    // 歌词面板挂载
    const lyrics = createApp(Lyrics);
    lyrics.mount('#lyricsArea');

    const lyricsArea = document.getElementById('lyricsArea');
    if (lyricsArea) lyricsArea.style.display = 'none;';

    // 读取账户信息
    await readAccountInfo('all');

    // 加载初始页面
    updatePlaylistIcon();
    setTimeout(() => {
        initialize();
    }, 300);

    // 设置点击 / 滚动时隐藏右键菜单
    window.addEventListener('click', (event) => {
        if (event.button === 0) {
            hideRightMenu();
        }
    });
    document.getElementById('pageContainer')?.addEventListener('scroll', (_) => hideRightMenu());

    // 加载应用配置文件
    const config = getConfig();
    const startMinimized = config.generic.system.start.startMinimized;
    if (startMinimized) { // 启动时最小化窗口判断
        minimizeWindow();
    }
    const systemFrameFlag = config.generic.appearance.window.useSystemFrame;
    if (systemFrameFlag) { // 使用系统窗口边框时隐藏自定义边框
        const titleBar = document.getElementById('windowControlBar');
        if (!titleBar) return;

        titleBar.style.display = 'none';
    }
    // 加载主题颜色
    const themeList: colorThemeName[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    const colorIndex = config.generic.appearance.colors.themeColor;
    const themeColor = themeList[colorIndex];
    initializeTheme(themeColor);
    // 窗口标题栏显示主题色
    const showColorInBorders = config.generic.appearance.colors.showColorInBorders;
    setControlBarTheme(showColorInBorders);

    // 加载用户配置
    const userPreference = getPreference();
    const player = getPlayer();
    console.log(`[Debug] Preferences: ${JSON.stringify(userPreference)}`);
    if (userPreference.player.isMaximized) { // 窗口最大化
        toggleMaximize();
    }
    player?.setRepeatState(userPreference.player.repeatState); // 循环播放状态
    player?.setShuffleState(userPreference.player.shuffleState); // 随机播放状态
    player?.setVolume(userPreference.player.volume); // 音量
    if (userPreference.player.desktopLyrics) { // 桌面歌词
        toggleCaptions();
    }
    
    // 设置触发器
    // 播放器组件
    const playerElem = document.getElementById('arcanummusic-playcontrol') as HTMLAudioElement;
    if (!playerElem) {
        console.error('[Error] Player element not found');
        return;
    }
    playerElem.addEventListener('timeupdate', () => {
        if (!playTimeAdjustFlag.value) getPlayer()?.updateProgress(Math.ceil(playerElem.currentTime));

        getPlayer()?.checkNextSong();
    });

    // 桌面歌词窗口播放控制 (使用 localStorage 作为中间桥)
    window.addEventListener('storage', handleStorageData);

    // 关闭窗口时保存偏好数据
    window.addEventListener('close', savePreferences);
});
onUnmounted(() => {
    window.removeEventListener('storage', handleStorageData);
});

</script>

<template>
    <div id="windowMain">
        <!-- 窗口标题栏 -->
        <div class="flex row" id="windowControlBar"
            @mousedown="titlebarMouseDown" @mousemove="titlebarMouseMove" @mouseup="titlebarMouseUp">
            <span class="flex row" id="windowDrag">
                <img id="appIcon" src="/appIcon/ArcanumMusic.png" alt="Arcanum Music"/>
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
                        <img src="/images/pageSwitcher/arrowLeft.svg" alt="Back"/>
                    </button>
                    <button class="pageControl" id="pageForawrd" @click="pageForward">
                        <img src="/images/pageSwitcher/arrowRight.svg" alt="Forward"/>
                    </button>
                </div>

                <div id="topBarSpace"></div>

                <!-- 设置 -->
                <button class="pageButton" id="settings" title="设置" @click="(_: any) => {changePage('settings')}">
                    <img src="/images/pageSwitcher/settings.svg" alt="Application settings"/>
                </button>
                <!-- 账户 -->
                <button class="pageButton" id="accounts" title="我的账户" @click="(_: any) => {changePage('accounts')}">
                    <img src="/images/pageSwitcher/accounts.svg" alt="My accounts"/>
                </button>
            </div>

            <!-- 页面内容 -->
            <div class="flex row">
                <div class="flex column" id="pageSelector">
                    <PageButton id="home" icon="./images/pageSwitcher/home.svg" text="首页"></PageButton>
                    <PageButton id="library" icon="./images/pageSwitcher/library.svg" text="音乐库"></PageButton>
                    <PageButton id="search" icon="./images/pageSwitcher/search.svg" text="搜索"></PageButton>
                </div>
                <div id="pageContainer">
                    <div id="pageContent"></div>
                    <div id="bottomBlock"></div>
                </div>
            </div>
        </div>

        <!-- 播放器控制栏 -->
        <div class="flex column" id="playControlContainer">
            <div class="fluentProgress flex row" id="playProgress" 
                @mousedown="startProgressAdjust" @mousemove="adjustOnMouseMove">
                <div class="fluentFilled" id="playedCover" 
                    :style="`width: ${playTimeAdjustFlag ? targetPercentage : getPlayer()?.progressPercentage}%`"></div>
            </div>
            <div class="flex row" id="playControlBar">
                <!-- 当前歌曲信息 -->
                <div class="flex row" id="currentSong">
                    <img class="currentSongCover" :src="getPlayer()?.coverUrl" alt="Song cover"/>
                    <span class="flex column">
                        <span id="songNameContainer" @mouseenter="checkScrollAnimation" @mouseleave="resetScroll">
                            <label class="text small bold" id="currentSongName">{{ getPlayer()?.name }}</label>
                        </span>
                        <label class="text ultraSmall" id="currentSongAuthors">{{ limitAuthorsTextLength(getPlayer()?.authors || '') }}</label>
                    </span>
                </div>

                <!-- 播放控制 -->
                <div class="flex row" id="playControl">
                    <button class="playControl" id="previousButton" @click="getPlayer()?.previousSong">
                        <img src="/images/player/previous.svg" alt="Previous song"/>
                    </button>
                    <button class="playControl large" id="playButton" @click="getPlayer()?.togglePlayPause">
                        <img :src="getPlayer()?.playStateImage" alt="Play / Pause"/>
                    </button>
                    <button class="playControl" id="nextButton" @click="getPlayer()?.nextSong">
                        <img src="/images/player/next.svg" alt="Next song"/>
                    </button>
                </div>

                <!-- 其他控制 / 歌词 -->
                <div class="flex row" id="controlRightBar">
                    <button class="playControl small" id="captions" @click="toggleCaptions" title="桌面歌词">
                        <img src="/images/player/caption.svg" id="captionState" alt="Toggle caption"/>
                    </button>
                    <button class="playControl small" id="playlist" @click="togglePlaylistPanel" title="播放列表">
                        <img src="/images/player/playlist.svg" id="playlistState" alt="Toggle playlist"/>
                    </button>
                    <button class="playControl small" id="repeat" @click="getPlayer()?.toggleRepeat" title="循环播放">
                        <img :src="getPlayer()?.repeatStateImage" alt="Toggle repeat"/>
                    </button>
                    <button class="playControl small" id="shuffle" @click="getPlayer()?.toggleShuffle" title="随机播放">
                        <img :src="getPlayer()?.shuffleStateImage" alt="Toggle shuffle"/>
                    </button>
                    <div class="flex row">
                        <img class="playControl small" :src="getPlayer()?.volumeLevel" @click="getPlayer()?.toggleMute" title="静音" alt="mute"/>
                        <div id="volumeAdjust" @mousemove="adjustVolume">
                            <div id="volumeBar">
                                <div id="volumeFilled" :style="`width: ${getPlayer()?.volume}%`"></div>
                            </div>
                            <div class="text ultraSmall" id="volumeLabel" :style="`left: calc(${getPlayer()?.volume}% - 1.5rem)`">{{ getPlayer()?.volume }}%</div>
                        </div>
                    </div>
                    <button class="playControl small" id="lyrics" @click="showLyrics" title="显示歌词">
                        <img src="/images/player/expand.svg" alt="Expand lyrics"/>
                    </button>
                </div>
            </div>
        </div>

        <!-- 通知区域 -->
        <div class="notifyArea flex column" id="notifyArea"></div>

        <!-- 弹出窗口 -->
        <div class="flex column" id="popupArea"></div>
        <!-- 歌手选择弹窗 -->
        <div class="flex column" id="artistSelect">
            <div class="flex row" id="artistSelectTopBar">
                <label class="text medium">请选择</label>
                <button id="artistSelectClose" @click="hideArtistSelect">
                    <img src="/images/windowControl/close.svg" alt="Close"/>
                </button>
            </div>
            <div id="artistSelectContent"></div>
        </div>

        <!-- 播放进度标签 -->
        <div class="text ultraSmall flex column" id="progressTooltip" :style="progressTooltipOffset">
            {{ `${getPlayer()?.playedTimeText} / ${getPlayer()?.durationText}` }}
        </div>

        <!-- 歌词面板 -->
        <div id="lyricsArea"></div>

        <!-- 播放器 -->
        <audio id="arcanummusic-playcontrol" :src="getPlayer()?.url" controls></audio>

        <!-- 右键菜单 -->
        <div id="rightClickMenuContainer"></div>
    </div>
</template>
