<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import './captionsStyle.css';
import '../../globalStyle.css';
import { runtime } from '../../runtime';

const capabilities = runtime.getCapabilities();

let startX = 0;
let startY = 0;
let isMoving = false;

function titlebarMouseDown(event: MouseEvent) {
    if (!capabilities.windowControls) {
        return;
    }

    const target = document.elementFromPoint(event.x, event.y) as HTMLElement | null;
    if (target?.id === 'windowControlBar' && event.buttons === 1) {
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

const themeList = ['default', 'dark', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];
let currentThemeId = 0;
let styleText = `
#currentLyricsBox > ul {
    color: var(--default-white);
    text-shadow:
        0 0 3px var(--transparent-grey),
        1px 1px 3px var(--transparent-darkgrey),
        -1px -1px 2px var(--default-darkgrey);
}
`;

function switchTheme(_: MouseEvent) {
    currentThemeId += 1;
    if (currentThemeId >= themeList.length) {
        currentThemeId = 0;
    }

    const themeName = themeList[currentThemeId];
    let textColor = '--default-white';
    let shadowColors: string[] = [];

    if (themeName === 'default') {
        textColor = '--default-white';
        shadowColors = ['--transparent-grey', '--transparent-darkgrey', '--default-darkgrey'];
    }
    else if (themeName === 'dark') {
        textColor = '--transparent-black';
        shadowColors = ['--transparent-darkgrey', '--transparent-lightgrey', '--default-grey'];
    }
    else {
        textColor = `--color-${themeName}-light`;
        shadowColors = [
            `--color-${themeName}-default`,
            `--color-${themeName}-deep`,
            `--color-${themeName}-ultradeep`
        ];
    }

    styleText = `
    #currentLyricsBox > ul {
        color: var(${textColor});
        text-shadow:
            0 0 3px var(${shadowColors[0]}),
            1px 1px 3px var(${shadowColors[1]}),
            -1px -1px 2px var(${shadowColors[2]});
    }
    `;
    lyricStyle.innerText = styleText;
}

const currentSongInfo = ref({
    name: '',
    authors: '',
    coverUrl: '',
    duration: 0,
    url: ''
});
const playStateImage = ref('./images/player/play.dark.svg');
const repeatStateImage = ref('./images/player/repeat.svg');
const shuffleStateImage = ref('./images/player/shuffle.svg');
const currentLyrics = ref({
    time: 0.0,
    content: 'Arcanum Music',
    translation: 'made by NekoZX123'
});

function updateStorageData(updateEvent: StorageEvent) {
    if (updateEvent.key === 'currentSongInfo' && updateEvent.newValue) {
        currentSongInfo.value = Object.assign({}, JSON.parse(updateEvent.newValue));
    }
    if (updateEvent.key === 'currentLyrics' && updateEvent.newValue) {
        currentLyrics.value = Object.assign({}, JSON.parse(updateEvent.newValue));
        requestAnimationFrame(adjustFontSize);
    }
    if (updateEvent.key === 'playState' && updateEvent.newValue) {
        playStateImage.value = updateEvent.newValue;
    }
    if (updateEvent.key === 'repeatState' && updateEvent.newValue) {
        repeatStateImage.value = updateEvent.newValue;
    }
    if (updateEvent.key === 'shuffleState' && updateEvent.newValue) {
        shuffleStateImage.value = updateEvent.newValue;
    }
}

let isCaptionsOn = false;
const alwaysOnTopImage = ref('./images/windowControl/alwaysTop.svg');

async function toggleWindowTop() {
    const alwaysOnTopButton = document.getElementById('toggleTop') as HTMLButtonElement | null;
    if (!alwaysOnTopButton) {
        console.error('[Error] Failed to get element #toggleTop');
        return;
    }

    const windowIdString = window.localStorage.getItem('captionsWinId');
    if (!windowIdString) {
        console.warn('[Warning] Unable to get current window ID');
        return;
    }

    const captionsWindowId = parseInt(windowIdString, 10);
    if (Number.isNaN(captionsWindowId)) {
        return;
    }

    if (isCaptionsOn) {
        alwaysOnTopImage.value = './images/windowControl/alwaysTop.svg';
        await runtime.setAlwaysOnTop(captionsWindowId, false);
    }
    else {
        alwaysOnTopImage.value = './images/windowControl/alwaysTop.on.svg';
        await runtime.setAlwaysOnTop(captionsWindowId, true);
    }

    isCaptionsOn = !isCaptionsOn;
}

function sendToMain(eventName: string, message?: any) {
    window.localStorage.setItem('playerSignal', '');
    window.localStorage.setItem('playerSignal', JSON.stringify({ eventName, message }));
}

let lyricStyle: HTMLElement;
const windowIdentifier = 'moe.nekozx.arcanummusic.desktoplyrics';

function adjustFontSize() {
    const lyricsBox = document.getElementById('currentLyricsBox');
    if (!lyricsBox) {
        return;
    }

    const ulElements = Array.from(lyricsBox.querySelectorAll('ul')) as HTMLElement[];
    ulElements.forEach((ul, index) => {
        const basePt = index === 0 ? 24 : 18;
        let fontSizePx = Math.round(basePt * 96 / 72);
        ul.style.fontSize = `${fontSizePx}px`;

        const minFontPx = 12;
        while (fontSizePx > minFontPx && ul.scrollWidth > lyricsBox.clientWidth) {
            fontSizePx -= 1;
            ul.style.fontSize = `${fontSizePx}px`;
        }
    });
}

let controlShow = false;
function toggleControlPanel() {
    const lyricsBox = document.getElementById('currentLyricsBox');
    const controlPanel = document.getElementById('captionsControl');
    const controlButton = document.getElementById('expandControl');
    if (!controlPanel || !controlButton || !lyricsBox) {
        return;
    }

    if (controlShow) {
        controlPanel.classList.remove('expanded');
        controlButton.classList.remove('expanded');
        lyricsBox.classList.remove('controlExpanded');
    }
    else {
        controlPanel.classList.add('expanded');
        controlButton.classList.add('expanded');
        lyricsBox.classList.add('controlExpanded');
    }

    controlShow = !controlShow;
}

onMounted(() => {
    lyricStyle = document.createElement('style');
    document.body.appendChild(lyricStyle);
    lyricStyle.innerText = styleText;

    const storedSongInfo = window.localStorage.getItem('currentSongInfo');
    if (storedSongInfo) {
        currentSongInfo.value = JSON.parse(storedSongInfo);
    }

    const storedLyrics = window.localStorage.getItem('currentLyrics');
    if (storedLyrics) {
        currentLyrics.value = JSON.parse(storedLyrics);
    }

    playStateImage.value = window.localStorage.getItem('playState') || './images/lyricsPanel/play.dark.svg';
    repeatStateImage.value = window.localStorage.getItem('repeatState') || './images/lyricsPanel/repeat.svg';
    shuffleStateImage.value = window.localStorage.getItem('shuffleState') || './images/lyricsPanel/shuffle.svg';

    window.addEventListener('storage', updateStorageData);
    window.addEventListener('resize', adjustFontSize);
    adjustFontSize();
});

onUnmounted(() => {
    window.removeEventListener('storage', updateStorageData);
    window.removeEventListener('resize', adjustFontSize);
});
</script>

<template>
    <div class="flex row" id="desktopLyrics">
        <div class="flex row" id="captionsControlBar"
            @mousedown="titlebarMouseDown" @mousemove="titlebarMouseMove" @mouseup="titlebarMouseUp">
            <span class="flex column" id="windowDragCaptions"></span>
        </div>

        <div class="flex row" id="captionsControl">
            <img :src="currentSongInfo.coverUrl" alt="Current Song Cover" id="captionsSongCover"/>
            <div class="flex column" id="captionsSongInfo">
                <span class="text medium bold">{{ currentSongInfo.name }}</span>
                <span class="text small">{{ currentSongInfo.authors }}</span>

                <div class="flex row" id="playbackControl">
                    <div class="flex row controlButtonGroup">
                        <button class="playControl small" id="repeat" title="循环播放"
                            @click="() => sendToMain('toggle-repeat', windowIdentifier)">
                            <img :src="repeatStateImage" alt="Toggle repeat"/>
                        </button>
                        <button class="playControl" id="previousButton" title="上一首"
                            @click="() => sendToMain('previous-song', windowIdentifier)">
                            <img src="/images/player/previous.svg"/>
                        </button>
                        <button class="playControl" id="playPauseButton" title="播放 / 暂停"
                            @click="() => sendToMain('toggle-play-pause', windowIdentifier)">
                            <img :src="playStateImage"/>
                        </button>
                        <button class="playControl" id="nextButton" title="下一首"
                            @click="() => sendToMain('next-song', windowIdentifier)">
                            <img src="/images/player/next.svg"/>
                        </button>
                        <button class="playControl small" id="shuffle" title="随机播放"
                            @click="() => sendToMain('toggle-shuffle', windowIdentifier)">
                            <img :src="shuffleStateImage" alt="Toggle shuffle"/>
                        </button>
                    </div>

                    <div class="verticleSplitline"></div>

                    <div class="flex row controlButtonGroup">
                        <button class="playControl small" id="toggleTop" title="窗口置顶" @click="toggleWindowTop">
                            <img :src="alwaysOnTopImage"/>
                        </button>

                        <button class="playControl small" id="changeTheme" title="切换主题" @click="switchTheme">
                            <img src="/images/lyricsPanel/adjustTheme.svg"/>
                        </button>

                        <button class="playControl small" id="closeCaptions" title="关闭窗口"
                            @click="() => sendToMain('captions-close', windowIdentifier)">
                            <img src="/images/windowControl/close.svg" alt="Close window"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <button class="flex row" id="expandControl" title="展开控制器" @click="toggleControlPanel">
            <img src="/images/arrows/right.svg" alt="Expand Control"/>
        </button>

        <div class="flex row" id="captionsMain">
            <span class="flex column" id="currentLyricsBox">
                <ul class="text large bold">{{ currentLyrics.content }}</ul>
                <ul class="text medium bold">{{ currentLyrics.translation }}</ul>
            </span>
        </div>
    </div>
</template>
