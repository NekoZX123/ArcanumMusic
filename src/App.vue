<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { createApp, computed, onMounted, onUnmounted, ref, watch } from 'vue';

import Lyrics from './components/lyrics/Lyrics.vue';

import { showNotify } from './assets/notifications/Notification.ts';
import { createPlayer, getPlayer } from './assets/player/player.ts';
import {
    changePage,
    initialize,
    pageBack,
    pageForward,
    togglePlaylist
} from './assets/utilities/pageSwitcher.ts';
import { readAccountInfo } from './assets/utilities/accountManager.ts';
import { hideArtistSelect, hideRightMenu } from './assets/utilities/elementControl.ts';
import { getConfig, getPreference, loadConfig, loadPreference, writePreference } from './assets/utilities/configLoader.ts';
import { loadProxyPort } from './assets/utilities/proxyRequest.ts';
import { syncFocusedLyric } from './assets/lyrics/lyricsManager.ts';
import { runtime } from './runtime';
import { initializeTheme, setControlBarTheme, setWindowBackground, type colorThemeName } from './assets/effects/themeControl.ts';
import { buttonTypes, showPopup } from './assets/notifications/popup.tsx';

const route = useRoute();
const capabilities = runtime.getCapabilities();
const appReady = ref(false);
const viewportWidth = ref(window.innerWidth);
const currentPageName = computed(() => String(route.name || ''));
const currentPageTitle = computed(() => String(route.meta.label || 'Arcanum Music'));
const showWindowControls = ref(capabilities.windowControls);
const showHostedProxyWarning = computed(() => !runtime.isElectron() && !capabilities.hostedProxy);
const isMobileViewport = computed(() => viewportWidth.value < 768);
const isTabletViewport = computed(() => viewportWidth.value >= 768 && viewportWidth.value < 900);
const playlistImage = computed(() => currentPageName.value === 'playlist'
    ? '/images/player/playlist.on.svg'
    : '/images/player/playlist.svg');

const primaryTabs = [
    { id: 'home', label: '首页', icon: '/images/pageSwitcher/home.svg' },
    { id: 'library', label: '音乐库', icon: '/images/pageSwitcher/library.svg' },
    { id: 'search', label: '搜索', icon: '/images/pageSwitcher/search.svg' }
] as const;
const mobileTabs = [
    ...primaryTabs,
    { id: 'playlist', label: '队列', icon: '/images/player/playlist.svg' }
] as const;
const NAVIGATION_ICON_SCALE_DEFAULT = 100;

let startX = 0;
let startY = 0;
let isMoving = false;
let winMaximumState = false;
let clickHandler: ((event: MouseEvent) => void) | undefined;
let scrollHandler: (() => void) | undefined;
let audioElement: HTMLAudioElement | null = null;
let audioTimeUpdateHandler: (() => void) | undefined;

function navigateTo(pageId: string) {
    changePage(pageId as any);
}

function handleViewportResize() {
    viewportWidth.value = window.innerWidth;
}

function getNavigationIconScaleValue() {
    const rawValue = Number(getConfig()?.generic?.appearance?.navigation?.iconScale ?? NAVIGATION_ICON_SCALE_DEFAULT);
    if (!Number.isFinite(rawValue)) {
        return NAVIGATION_ICON_SCALE_DEFAULT;
    }

    return Math.min(120, Math.max(80, rawValue));
}

function applyNavigationIconScale() {
    const scale = getNavigationIconScaleValue() / 100;
    const rootStyle = document.documentElement.style;

    rootStyle.setProperty('--nav-icon-size', `${(3 * scale).toFixed(3)}rem`);
    rootStyle.setProperty('--nav-top-action-icon-size', `${(2 * scale).toFixed(3)}rem`);
    rootStyle.setProperty('--mobile-tab-icon-size', `${(1.8 * scale).toFixed(3)}rem`);
}

function minimizeWindow() {
    runtime.minimizeWindow();
}

const maxButtonSrc = ref('./images/windowControl/maximize.svg');
async function toggleMaximize() {
    if (!capabilities.windowControls) {
        return;
    }

    winMaximumState = await runtime.toggleMaximize();
    maxButtonSrc.value = winMaximumState
        ? './images/windowControl/restore.svg'
        : './images/windowControl/maximize.svg';
}

const closeButtonSrc = ref('./images/windowControl/close.svg');
function closeHover() {
    closeButtonSrc.value = './images/windowControl/close.hover.svg';
}
function closeUnHover() {
    closeButtonSrc.value = './images/windowControl/close.svg';
}
async function closeWindow() {
    if (!capabilities.windowControls) {
        return;
    }

    if (!capabilities.tray) {
        await savePreferences();
        await runtime.closeWindow(false);
        return;
    }

    const appDataPath = await runtime.getAppData();
    const firstRunCheckPath = `${appDataPath}/ArcanumMusic_data/.notfirstrun`;
    const notFirstRun = await runtime.isFileExist(firstRunCheckPath);

    if (!notFirstRun) {
        showPopup(
            'info',
            'yesno',
            '窗口关闭时操作选择',
            '是否在关闭 Arcanum Music 主窗口时将应用隐藏到系统托盘？',
            ['', ''],
            async (code: number) => {
                if (code === buttonTypes.BUTTON_CLOSE) {
                    return;
                }

                const hideToTray = code === buttonTypes.BUTTON_YES;
                const settings = getConfig();
                settings.generic.system.closeOptions.hideToTray = hideToTray;
                const settingsText = JSON.stringify(settings);
                const targetFile = `${appDataPath}/ArcanumMusic_data/settings.json`;

                await runtime.writeLocalFile(targetFile, settingsText);
                await runtime.writeLocalFile(firstRunCheckPath, 'Not first run! Let me pass!');
                await savePreferences();
                await runtime.closeWindow(hideToTray);
            }
        );
        return;
    }

    const settings = getConfig();
    const hideToTrayFlag = settings.generic.system.closeOptions.hideToTray;
    await savePreferences();
    await runtime.closeWindow(hideToTrayFlag);
}

function titlebarMouseDown(event: MouseEvent) {
    if (!capabilities.windowControls || event.buttons !== 1) {
        return;
    }

    const target = document.elementFromPoint(event.x, event.y) as HTMLElement | null;
    if (!target) {
        return;
    }

    if (target.closest('#windowDrag')) {
        startX = event.x;
        startY = event.y;
        isMoving = true;
    }
}

async function titlebarMouseMove(event: MouseEvent) {
    if (!capabilities.windowControls || event.buttons !== 1 || !isMoving) {
        return;
    }

    const currentX = event.x - startX;
    const currentY = event.y - startY;
    const winRect = await runtime.getWindowRect();
    await runtime.moveWindow(winRect.x + currentX, winRect.y + currentY);
}

function titlebarMouseUp() {
    startX = 0;
    startY = 0;
    isMoving = false;
}

createPlayer(['lyricsVolume']);
const progressTooltipOffset = ref('left: 0');
let targetProgress = 0;
const targetPercentage = ref(0);
const playTimeAdjustFlag = ref(false);

function adjustPlayProgress(mouseX: number) {
    const progressBar = document.getElementById('playProgress');
    if (!progressBar) {
        return;
    }

    let tooltipX = mouseX;
    if (tooltipX < 80) {
        tooltipX = 80;
    }
    if (tooltipX > document.body.clientWidth - 80) {
        tooltipX = document.body.clientWidth - 80;
    }

    progressTooltipOffset.value = `left: calc(${tooltipX}px - 4rem)`;

    const barRect = progressBar.getBoundingClientRect();
    let progress = (mouseX - barRect.left) / progressBar.clientWidth;
    if (progress < 0) {
        progress = 0;
    }
    if (progress > 1) {
        progress = 1;
    }

    const playProgress = Math.round((getPlayer()?.duration || 0) * progress);
    getPlayer()?.updateProgress(playProgress);
    targetProgress = playProgress;
    targetPercentage.value = progress * 100;
}

function startProgressAdjust(event: MouseEvent) {
    if (event.buttons !== 1 || playTimeAdjustFlag.value) {
        return;
    }

    showProgressTooltip();
    document.addEventListener('mousemove', adjustOnMouseMove);
    playTimeAdjustFlag.value = true;
    adjustPlayProgress(event.clientX);

    const handleMouseUp = () => {
        hideProgressTooltip();
        document.removeEventListener('mousemove', adjustOnMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        getPlayer()?.setProgress(targetProgress);
        playTimeAdjustFlag.value = false;
    };

    document.addEventListener('mouseup', handleMouseUp);
}

function adjustOnMouseMove(event: MouseEvent) {
    if (event.buttons === 1 && playTimeAdjustFlag.value) {
        adjustPlayProgress(event.clientX);
    }
}

function showProgressTooltip() {
    document.getElementById('progressTooltip')?.classList.add('show');
}

function hideProgressTooltip() {
    document.getElementById('progressTooltip')?.classList.remove('show');
}

function adjustVolume(event: MouseEvent) {
    const volumeBar = document.getElementById('volumeBar');
    if (!volumeBar || event.buttons !== 1) {
        return;
    }

    let volume = Math.round((event.clientX - volumeBar.getBoundingClientRect().left) / volumeBar.clientWidth * 100);
    if (volume < 0) {
        volume = 0;
    }
    if (volume > 100) {
        volume = 100;
    }

    getPlayer()?.setVolume(volume);
}

function togglePlaylistPanel(event: MouseEvent) {
    togglePlaylist(event);
}

const lyricShowEvent = new CustomEvent('lyrics-launch');
function showLyrics() {
    const lyricsPanel = document.getElementById('lyricsArea');
    if (!lyricsPanel) {
        return;
    }

    lyricsPanel.style.display = 'block';
    setTimeout(() => {
        lyricsPanel.classList.add('show');
    }, 50);
    window.dispatchEvent(lyricShowEvent);
}

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

let captionWindowId = -1;
let isCaptionsOn = false;
const desktopLyricsImage = ref('./images/player/desktopLyrics.svg');

async function handleCaptionsClose() {
    desktopLyricsImage.value = './images/player/desktopLyrics.svg';
    if (captionWindowId !== -1) {
        await runtime.closeWindowById(captionWindowId);
    }
    isCaptionsOn = false;
}

async function toggleCaptions() {
    if (!capabilities.desktopLyricsWindow) {
        showNotify('desktop-lyrics-unavailable', 'info', '桌面歌词不可用', '当前运行环境不支持独立桌面歌词窗口', 3000);
        return;
    }

    if (isCaptionsOn) {
        desktopLyricsImage.value = './images/player/desktopLyrics.svg';
        await runtime.closeWindowById(captionWindowId);
        window.localStorage.setItem('captionsWinId', '');
        isCaptionsOn = false;
        return;
    }

    desktopLyricsImage.value = './images/player/desktopLyrics.on.svg';
    const captionWindowUrl = `${window.location.href.split('#')[0].split('?')[0]}?isDesktopLyrics=true`;
    captionWindowId = await runtime.createWindow('Arcanum Music - Desktop Lyrics', captionWindowUrl, captionWindowOptions);
    window.localStorage.setItem('captionsWinId', captionWindowId.toString());

    const player = getPlayer();
    setTimeout(() => {
        player?.syncSongInfo();
        player?.syncPlayStateImage();
        player?.syncRepeatStateImage();
        player?.syncShuffleStateImage();
        syncFocusedLyric();
    }, 150);

    isCaptionsOn = true;
}

function checkScrollAnimation() {
    const nameContainer = document.getElementById('songNameContainer') as HTMLElement | null;
    const nameContent = document.getElementById('currentSongName') as HTMLElement | null;
    if (nameContainer && nameContent && nameContainer.scrollWidth > nameContainer.offsetWidth && !nameContent.classList.contains('autoScroll')) {
        nameContent.classList.add('autoScroll');
    }
}

function resetScroll() {
    document.getElementById('currentSongName')?.classList.remove('autoScroll');
}

function limitAuthorsTextLength(authors: string) {
    if (authors.length > 24 && isMobileViewport.value) {
        return `${authors.substring(0, 24)}...`;
    }
    if (authors.length > 15) {
        return `${authors.substring(0, 15)}...`;
    }
    return authors;
}

const allowedIdentifiers = ['moe.nekozx.arcanummusic.desktoplyrics', 'moe.nekozx.arcanummusic.contextmenu'];
function handleStorageData(updateEvent: StorageEvent) {
    if (updateEvent.key !== 'playerSignal' || !updateEvent.newValue) {
        return;
    }

    const eventObject = JSON.parse(updateEvent.newValue);
    if (!allowedIdentifiers.includes(eventObject.message)) {
        return;
    }

    const eventName = eventObject.eventName;
    if (eventName === 'previous-song') getPlayer()?.previousSong();
    if (eventName === 'toggle-play-pause') getPlayer()?.togglePlayPause();
    if (eventName === 'next-song') getPlayer()?.nextSong();
    if (eventName === 'toggle-repeat') getPlayer()?.toggleRepeat();
    if (eventName === 'toggle-shuffle') getPlayer()?.toggleShuffle();
    if (eventName === 'captions-close') handleCaptionsClose();
}

async function savePreferences() {
    const preferences = getPreference();
    if (!preferences) {
        return;
    }

    if (capabilities.windowControls) {
        const windowRect = await runtime.getWindowRect();
        preferences.window.width = windowRect.width;
        preferences.window.height = windowRect.height;
        preferences.window.isMaximized = winMaximumState;
    }
    else {
        preferences.window.width = window.innerWidth;
        preferences.window.height = window.innerHeight;
        preferences.window.isMaximized = false;
    }

    preferences.player.desktopLyrics = capabilities.desktopLyricsWindow ? isCaptionsOn : false;
    preferences.player.repeatState = getPlayer()?.repeatState;
    preferences.player.shuffleState = getPlayer()?.shuffleState;
    preferences.player.volume = getPlayer()?.volume;

    writePreference(preferences);
}

async function copySongName() {
    const songName = getPlayer()?.name;
    if (!songName) {
        return;
    }

    await runtime.copyText(songName);
    showNotify('copySucceed', 'success', '复制成功', '歌曲名称已复制到剪贴板', 1000);
}

async function bootApplication() {
    window.__qmfe_sign_check = 1;

    try {
        loadProxyPort();
        await loadConfig();
        await loadPreference();
        await readAccountInfo('all');
        applyNavigationIconScale();

        const lyrics = createApp(Lyrics);
        lyrics.mount('#lyricsArea');
        const lyricsArea = document.getElementById('lyricsArea');
        if (lyricsArea) {
            lyricsArea.style.display = 'none';
        }

        initialize();

        clickHandler = (event: MouseEvent) => {
            if (event.button === 0) {
                hideRightMenu();
            }
        };
        window.addEventListener('click', clickHandler);

        scrollHandler = () => hideRightMenu();
        document.getElementById('pageContainer')?.addEventListener('scroll', scrollHandler);

        const config = getConfig();
        if (config.generic.system.start.startMinimized && capabilities.windowControls) {
            minimizeWindow();
        }

        const systemFrameFlag = config.generic.appearance.window.useSystemFrame;
        showWindowControls.value = capabilities.windowControls && !systemFrameFlag;

        const themeList: colorThemeName[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
        const colorIndex = config.generic.appearance.colors.themeColor;
        const themeColor = themeList[colorIndex];
        const darkEnabled = parseInt(config.generic.appearance.colors.darkMode);
        const windowBackgroundMode: any = parseInt(config.generic.appearance.colors.backgroundColor);

        initializeTheme(themeColor, darkEnabled);
        setWindowBackground(windowBackgroundMode);
        setControlBarTheme(config.generic.appearance.colors.showColorInBorders);

        const preferences = getPreference();
        if (capabilities.windowControls && preferences.window.isMaximized) {
            await toggleMaximize();
        }

        const player = getPlayer();
        player?.setRepeatState(preferences.player.repeatState);
        player?.setShuffleState(preferences.player.shuffleState);
        player?.setVolume(preferences.player.volume);
        if (capabilities.desktopLyricsWindow && preferences.player.desktopLyrics) {
            await toggleCaptions();
        }

        audioElement = document.getElementById('arcanummusic-playcontrol') as HTMLAudioElement | null;
        audioTimeUpdateHandler = () => {
            if (!playTimeAdjustFlag.value) {
                getPlayer()?.updateProgress(Math.ceil(audioElement?.currentTime || 0));
            }
            getPlayer()?.checkNextSong();
        };
        audioElement?.addEventListener('timeupdate', audioTimeUpdateHandler);

        window.addEventListener('storage', handleStorageData);
        window.onstorage = handleStorageData;
        window.addEventListener('beforeunload', savePreferences);
        window.addEventListener('resize', handleViewportResize);
        window.addEventListener('config-change', applyNavigationIconScale);

        setTimeout(() => showNotify('Notify1', 'success', 'Welcome!', 'Welcome to Arcanum Music!'), 1200);
        if (showHostedProxyWarning.value) {
            showNotify(
                'web-proxy-warning',
                'warning',
                '移动基础版已启用',
                '当前构建仅包含移动基础能力，不含线上数据代理；配置 VITE_PROXY_BASE_URL 后可启用完整 Web/PWA 请求与账号能力。',
                5000
            );
        }
    }
    catch (error: any) {
        console.error(error);
        showNotify('boot-failed', 'critical', '启动失败', error?.message || '应用初始化失败', 5000);
    }
    finally {
        appReady.value = true;
    }
}

watch(() => route.fullPath, () => {
    document.getElementById('pageContainer')?.scrollTo({ top: 0 });
});

onMounted(async () => {
    await bootApplication();
});

onUnmounted(() => {
    window.removeEventListener('storage', handleStorageData);
    if (window.onstorage === handleStorageData) {
        window.onstorage = null;
    }
    window.removeEventListener('beforeunload', savePreferences);
    window.removeEventListener('resize', handleViewportResize);
    window.removeEventListener('config-change', applyNavigationIconScale);

    if (clickHandler) {
        window.removeEventListener('click', clickHandler);
    }
    if (scrollHandler) {
        document.getElementById('pageContainer')?.removeEventListener('scroll', scrollHandler);
    }
    if (audioElement && audioTimeUpdateHandler) {
        audioElement.removeEventListener('timeupdate', audioTimeUpdateHandler);
    }
});
</script>

<template>
    <div id="windowMain">
        <div
            v-if="showWindowControls"
            class="flex row"
            id="windowControlBar"
            @mousedown="titlebarMouseDown"
            @mousemove="titlebarMouseMove"
            @mouseup="titlebarMouseUp"
        >
            <span class="flex row" id="windowDrag">
                <img id="appIcon" src="/appIcon/ArcanumMusic.png" alt="Arcanum Music"/>
                <label class="text small">Arcanum Music</label>
            </span>
            <span id="windowOptions">
                <button class="windowControl default" id="minimizeButton" @click="minimizeWindow">
                    <img class="outlineImage" src="/images/windowControl/minimize.svg" alt="Minimize"/>
                </button>
                <button class="windowControl default" id="maximizeButton" @click="toggleMaximize">
                    <img class="outlineImage" :src="maxButtonSrc" alt="Maximize / Restore"/>
                </button>
                <button
                    class="windowControl close"
                    id="closeButton"
                    @click="closeWindow"
                    @mouseenter="closeHover"
                    @mouseleave="closeUnHover"
                >
                    <img class="outlineImage" :src="closeButtonSrc" alt="Close"/>
                </button>
            </span>
        </div>

        <div id="appMain" :class="{ webShell: !showWindowControls, mobileShell: isMobileViewport, tabletShell: isTabletViewport }">
            <div class="flex row" id="windowTop">
                <div class="flex row" id="backForward">
                    <button class="pageControl" id="pageBack" @click="pageBack">
                        <img class="outlineImage" src="/images/pageSwitcher/arrowLeft.svg" alt="Back"/>
                    </button>
                    <button class="pageControl" id="pageForward" @click="pageForward">
                        <img class="outlineImage" src="/images/pageSwitcher/arrowRight.svg" alt="Forward"/>
                    </button>
                </div>

                <label class="text small bold" id="mobileRouteTitle">{{ currentPageTitle }}</label>
                <div id="topBarSpace"></div>

                <div class="flex row" id="topActions">
                    <button
                        class="pageButton topAction"
                        id="accounts"
                        title="我的账号"
                        :class="{ current: currentPageName === 'accounts' }"
                        @click="() => navigateTo('accounts')"
                    >
                        <img class="outlineImage" src="/images/pageSwitcher/accounts.svg" alt="My accounts"/>
                    </button>
                    <button
                        class="pageButton topAction"
                        id="settings"
                        title="设置"
                        :class="{ current: currentPageName === 'settings' }"
                        @click="() => navigateTo('settings')"
                    >
                        <img class="outlineImage" src="/images/pageSwitcher/settings.svg" alt="Application settings"/>
                    </button>
                </div>
            </div>

            <div class="flex row" id="workspaceShell">
                <div class="flex column" id="pageSelector">
                    <button
                        v-for="tab in primaryTabs"
                        :key="tab.id"
                        class="pageButton"
                        :class="{ current: currentPageName === tab.id }"
                        :id="tab.id"
                        @click="() => navigateTo(tab.id)"
                    >
                        <img class="pageSwitcherImg outlineImage" :src="tab.icon" :alt="tab.label"/>
                        <label class="text">{{ tab.label }}</label>
                    </button>
                </div>

                <div id="pageContainer">
                    <div v-if="showHostedProxyWarning" class="text small" id="proxyWarningBanner">
                        当前构建仅包含移动基础能力，尚未配置线上代理。
                    </div>
                    <div v-if="!appReady" id="appBooting" class="flex column">
                        <label class="text medium bold">正在初始化 Arcanum Music...</label>
                    </div>
                    <div v-else id="pageContent">
                        <RouterView />
                    </div>
                    <div id="bottomBlock" :class="{ mobile: isMobileViewport }"></div>
                </div>
            </div>
        </div>

        <div class="flex column" id="playControlContainer" :class="{ mobile: isMobileViewport, tablet: isTabletViewport && !isMobileViewport }">
            <div class="fluentProgress flex row" id="playProgress" @mousedown="startProgressAdjust" @mousemove="adjustOnMouseMove">
                <div class="fluentFilled" id="playedCover" :style="`width: ${playTimeAdjustFlag ? targetPercentage : getPlayer()?.progressPercentage}%`"></div>
            </div>
            <div class="flex row" id="playControlBar">
                <div class="flex row" id="currentSong">
                    <button class="currentSongCoverButton" @click="showLyrics" title="显示歌词">
                        <img class="currentSongCover" :src="getPlayer()?.coverUrl" alt="Song cover"/>
                    </button>
                    <span class="flex column songMeta">
                        <span id="songNameContainer" @mouseenter="checkScrollAnimation" @mouseleave="resetScroll">
                            <label class="text small bold" id="currentSongName" @click="copySongName">{{ getPlayer()?.name }}</label>
                        </span>
                        <label class="text ultraSmall" id="currentSongAuthors">{{ limitAuthorsTextLength(getPlayer()?.authors || '') }}</label>
                    </span>
                </div>

                <div class="flex row" id="playControl">
                    <button class="playControl" id="previousButton" @click="() => getPlayer()?.previousSong()">
                        <img class="outlineImage" src="/images/player/previous.svg" alt="Previous song"/>
                    </button>
                    <button class="playControl large" id="playButton" @click="() => getPlayer()?.togglePlayPause()">
                        <img class="outlineImage" :src="getPlayer()?.playStateImage" alt="Play / Pause"/>
                    </button>
                    <button class="playControl" id="nextButton" @click="() => getPlayer()?.nextSong()">
                        <img class="outlineImage" src="/images/player/next.svg" alt="Next song"/>
                    </button>
                </div>

                <div class="flex row" id="controlRightBar">
                    <button
                        v-if="capabilities.desktopLyricsWindow"
                        class="playControl small"
                        id="captions"
                        @click="toggleCaptions"
                        title="桌面歌词"
                    >
                        <img class="outlineImage" :src="desktopLyricsImage" id="captionState" alt="Toggle caption"/>
                    </button>
                    <button class="playControl small" id="playlist" @click="togglePlaylistPanel" title="播放列表">
                        <img class="outlineImage" :src="playlistImage" id="playlistState" alt="Toggle playlist"/>
                    </button>
                    <button class="playControl small" id="repeat" @click="() => getPlayer()?.toggleRepeat()" title="循环播放">
                        <img class="outlineImage" :src="getPlayer()?.repeatStateImage" alt="Toggle repeat"/>
                    </button>
                    <button class="playControl small" id="shuffle" @click="() => getPlayer()?.toggleShuffle()" title="随机播放">
                        <img class="outlineImage" :src="getPlayer()?.shuffleStateImage" alt="Toggle shuffle"/>
                    </button>
                    <div class="flex row" id="volumeControl">
                        <img
                            id="volumeLevel"
                            class="playControl small outlineImage"
                            :src="`./images/player/volume_0${getPlayer()?.volumeLevel}.svg`"
                            @click="() => getPlayer()?.toggleMute()"
                            title="静音"
                            alt="Toggle mute"
                        />
                        <div id="volumeAdjust" @mousemove="adjustVolume">
                            <div id="volumeBar">
                                <div id="volumeFilled" :style="`width: ${getPlayer()?.volume}%`"></div>
                            </div>
                            <div class="text ultraSmall" id="volumeLabel" :style="`left: calc(${getPlayer()?.volume}% - 1.5rem)`">{{ getPlayer()?.volume }}%</div>
                        </div>
                    </div>
                    <button class="playControl small" id="lyrics" @click="showLyrics" title="显示歌词">
                        <img class="outlineImage" src="/images/player/expand.svg" alt="Expand lyrics"/>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="isMobileViewport" class="flex row" id="mobileTabBar">
            <button
                v-for="tab in mobileTabs"
                :key="tab.id"
                class="pageButton mobileTab"
                :class="{ current: currentPageName === tab.id }"
                @click="() => navigateTo(tab.id)"
            >
                <img class="outlineImage" :src="tab.icon" :alt="tab.label"/>
                <label class="text">{{ tab.label }}</label>
            </button>
        </div>

        <div class="notifyArea flex column" id="notifyArea"></div>
        <div class="flex column" id="popupArea"></div>
        <div class="flex column" id="artistSelect">
            <div class="flex row" id="artistSelectTopBar">
                <label class="text medium">请选择</label>
                <button id="artistSelectClose" @click="hideArtistSelect">
                    <img class="outlineImage" src="/images/windowControl/close.svg" alt="Close"/>
                </button>
            </div>
            <div id="artistSelectContent"></div>
        </div>

        <div class="text ultraSmall flex column" id="progressTooltip" :style="progressTooltipOffset">
            {{ `${getPlayer()?.playedTimeText} / ${getPlayer()?.durationText}` }}
        </div>

        <div id="lyricsArea"></div>
        <audio id="arcanummusic-playcontrol" :src="getPlayer()?.url" controls></audio>
        <div id="rightClickMenuContainer"></div>
    </div>
</template>

<style>
#appMain.webShell {
    top: 0;
    height: calc(100vh - 4.5rem);
}

#workspaceShell {
    width: 100%;
    height: calc(100% - 3rem);
}

#pageContent {
    min-height: 100%;
}

#appBooting {
    min-height: 16rem;
    align-items: center;
    justify-content: center;
}

#proxyWarningBanner {
    background: rgba(255, 196, 0, 0.18);
    border: 1px solid rgba(255, 196, 0, 0.45);
    border-radius: 0.75rem;
    margin: 0.75rem 0.75rem 0;
    padding: 0.75rem 0.9rem;
}

#mobileRouteTitle {
    display: none;
    min-width: 0;
    text-align: center;
}

#topActions {
    gap: 0.35rem;
}

.pageButton.topAction {
    width: 3rem;
    height: 3rem;
    margin: 0;
    border-radius: 1.5rem;
}

.pageButton.topAction > img {
    width: var(--nav-top-action-icon-size);
    height: var(--nav-top-action-icon-size);
}

.pageButton.topAction > label {
    display: none;
}

.currentSongCoverButton {
    appearance: none;
    background: transparent;
    border: none;
    border-radius: 0.6rem;
    padding: 0;
    margin-right: 6px;
    cursor: pointer;

    transition: transform 150ms ease-in-out;
}

.currentSongCoverButton:hover {
    transform: scale(1.03);
}

.currentSongCoverButton .currentSongCover {
    margin-right: 0;
}

#bottomBlock.mobile {
    height: 10rem;
}

#playControlContainer.tablet {
    width: calc(100% - 5rem);
    left: 2.5rem;
}

#mobileTabBar {
    position: fixed;
    left: 0.5rem;
    right: 0.5rem;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 0.35rem);
    height: 4rem;
    padding: 0.25rem;
    background: var(--interface-transparent);
    backdrop-filter: blur(12px);
    border-radius: 1rem;
    box-shadow: 0 0 10px var(--transparent-grey);
    justify-content: space-between;
    z-index: 120;
}

.mobileTab {
    flex: 1 1 0;
    width: auto;
    height: 3.35rem;
    margin: 0;
    border-radius: 0.9rem;
    justify-content: center;
}

.mobileTab > img {
    width: var(--mobile-tab-icon-size);
    height: var(--mobile-tab-icon-size);
}

.mobileTab > label {
    font-size: 0.72rem;
}

#playControlContainer.mobile {
    width: calc(100% - 1rem);
    left: 0.5rem;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 4.7rem);
    border-radius: 1rem;
}

#playControlContainer.mobile #playControlBar {
    padding: 0 0.85rem;
    gap: 0.5rem;
}

#playControlContainer.mobile #currentSong {
    min-width: 0;
    flex: 1 1 auto;
}

#playControlContainer.mobile .songMeta {
    min-width: 0;
}

#playControlContainer.mobile #songNameContainer {
    width: auto;
    max-width: 100%;
}

#playControlContainer.mobile #currentSongAuthors {
    display: none;
}

#playControlContainer.mobile #playControl {
    position: static;
    left: auto;
}

#playControlContainer.mobile #controlRightBar {
    margin-left: auto;
}

#playControlContainer.mobile #captions,
#playControlContainer.mobile #repeat,
#playControlContainer.mobile #shuffle,
#playControlContainer.mobile #volumeControl {
    display: none;
}

#playControlContainer.mobile .currentSongCover {
    width: 2.75rem;
    height: 2.75rem;
}

@media (max-width: 899px) {
    #windowTop {
        padding: 0 1rem;
        gap: 0.75rem;
    }

    #playControlContainer {
        width: calc(100% - 2rem);
        left: 1rem;
    }
}

@media (max-width: 767px) {
    body {
        overflow: auto;
    }

    #windowControlBar {
        display: none;
    }

    #appMain {
        top: 0;
        height: calc(100vh - 9.5rem);
    }

    #workspaceShell {
        height: calc(100vh - 12.5rem);
    }

    #pageSelector {
        display: none;
    }

    #pageContainer {
        width: 100%;
        left: 0;
        height: calc(100vh - 12.5rem);
        padding: 0 0.35rem;
    }

    #windowTop {
        position: sticky;
        top: 0;
        z-index: 80;
        padding: 0.4rem 0.85rem;
        background: color-mix(in srgb, var(--interface-background) 82%, transparent);
        backdrop-filter: blur(10px);
    }

    #mobileRouteTitle {
        display: block;
        flex: 1 1 auto;
    }

    #topBarSpace {
        display: none;
    }

    #backForward .pageControl {
        width: 2.6rem;
        height: 2.6rem;
    }

    #playControlContainer.mobile #lyrics {
        display: inline-flex;
    }
}
</style>
