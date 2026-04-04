<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import './captionsStyle.css';
import '../../globalStyle.css';
import { timeFormat } from '../../assets/utilities/timeFormat.ts';

/* 窗口移动功能 */
let startX = 0;
let startY = 0;
let isMoving = false;

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

// 歌词配色切换
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
    currentThemeId ++;
    if (currentThemeId >= themeList.length) currentThemeId = 0;
    const themeName = themeList[currentThemeId];

    let textColor = '--default-white';
    let shadowColors: string[] = [];
    if (themeName === 'default') {
        textColor = '--default-white',
        shadowColors = ['--transparent-grey', '--transparent-darkgrey', '--default-darkgrey'];
    }
    else if (themeName === 'dark') {
        textColor = '--transparent-black',
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

// 歌曲信息
const currentSongInfo = ref({
    name: '',
    authors: '',
    coverUrl: '',
    duration: 0,
    url: ''
});
// 播放状态、循环状态、随机状态图片
const playStateImage = ref('./images/player/play.dark.svg');
const repeatStateImage = ref('./images/player/repeat.svg');
const shuffleStateImage = ref('./images/player/shuffle.svg');
// 当前歌词
const currentLyrics = ref({
    time: 0.0,
    content: 'Arcanum Music',
    translation: 'made by NekoZX123'
});
function updateStorageData(updateEvent: StorageEvent) {
    if (updateEvent.key === 'currentSongInfo' && updateEvent.newValue) { // 更新歌曲元数据
        const songInfoStr = updateEvent.newValue;
        const songInfo = JSON.parse(songInfoStr);

        currentSongInfo.value = Object.assign({}, songInfo);

        songDuration.value = songInfo.duration;
        durationText.value = timeFormat(songInfo.duration);
    }
    if (updateEvent.key === 'currentLyrics' && updateEvent.newValue) { // 更新当前歌词
        const lyrics = JSON.parse(updateEvent.newValue);
        currentLyrics.value = Object.assign({}, lyrics);
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
function toggleWindowTop(_?: any) {
    const alwaysOnTopButton = document.getElementById('toggleTop') as HTMLButtonElement;
    if (!alwaysOnTopButton) {
        console.error(`[Error] Failed to get element #toggleTop`);
        return;
    }

    let windowIdString = window.localStorage.getItem('captionsWinId');
    if (!windowIdString) {
        console.warn(`[Warning] Unable to get current window ID`);
        return;
    }
    const captionsWindowId = parseInt(windowIdString);

    if (isCaptionsOn) {
        alwaysOnTopImage.value = './images/windowControl/alwaysTop.svg';
        window.electron.setAlwaysOnTop(captionsWindowId, false);
    }
    else {
        alwaysOnTopImage.value = './images/windowControl/alwaysTop.on.svg';
        window.electron.setAlwaysOnTop(captionsWindowId, true);
    }
    isCaptionsOn = !isCaptionsOn;
}

/**
 * 向主窗口发送消息 (使用 localStorage 作为中间桥)
 * @param eventName 事件名称
 * @param message 消息内容
 */
function sendToMain(eventName: string, message?: any) {
    window.localStorage.setItem('playerSignal', '');
    window.localStorage.setItem('playerSignal', JSON.stringify({eventName: eventName, message: message}));
}

let lyricStyle: HTMLElement;
const windowIdentifier = 'moe.nekozx123.arcanummusic.desktoplyrics';

// 限制歌词字体大小
function adjustFontSize() {
    const lyricsBox = document.getElementById('currentLyricsBox');
    if (!lyricsBox) return;

    const ulElements = Array.from(lyricsBox.querySelectorAll('ul')) as HTMLElement[];
    ulElements.forEach((ul, index) => {
        // 选择初始 pt 大小
        const basePt = index === 0 ? 24 : 18;

        // pt -> px
        let fontSizePx = Math.round(basePt * 96 / 72);
        ul.style.fontSize = `${fontSizePx}px`;

        // 逐步缩小字号
        const minFontPx = 12;
        while (fontSizePx > minFontPx && ul.scrollWidth > lyricsBox.clientWidth) {
            fontSizePx -= 1;
            ul.style.fontSize = `${fontSizePx}px`;
        }
    });
}

// 切换控制面板状态
let controlShow = ref(false);
function toggleControlPanel() {
    controlShow.value = !controlShow.value;
}

// 更新播放进度
let progressUpdateInterval: number | null = null;
const songDuration = ref(0);
const durationText = ref('00:00');
const currentProgress = ref(0);
const progressText = ref('00:00');
const progressPercentage = ref(0);
async function updateSongProgress() {
    const progressStr = await window.electron.readData('songProgress', windowIdentifier);
    if (progressStr) {
        currentProgress.value = parseFloat(progressStr);
        progressText.value = timeFormat(currentProgress.value);

        progressPercentage.value = currentProgress.value / songDuration.value * 100;
    }
}

onMounted(() => {
    lyricStyle = document.createElement('style');
    document.body.appendChild(lyricStyle);
    lyricStyle.innerText = styleText;

    // 加载 localStorage 中的歌曲信息
    const storedSongInfo = window.localStorage.getItem('currentSongInfo');
    if (storedSongInfo) {
        currentSongInfo.value = JSON.parse(storedSongInfo);

        songDuration.value = currentSongInfo.value.duration;
        durationText.value = timeFormat(songDuration.value);
    }
    // 加载 localStorage 中的歌词和状态
    const storedLyrics = window.localStorage.getItem('currentLyrics');
    if (storedLyrics) {
        currentLyrics.value = JSON.parse(storedLyrics);
    }
    playStateImage.value = window.localStorage.getItem('playState') || './images/lyricsPanel/play.dark.svg';
    repeatStateImage.value = window.localStorage.getItem('repeatState') || './images/lyricsPanel/repeat.svg';
    shuffleStateImage.value = window.localStorage.getItem('shuffleState') || './images/lyricsPanel/shuffle.svg';

    // 监听 localStorage 变化以更新歌词和歌曲信息
    window.addEventListener('storage', updateStorageData);

    // 监听窗口大小变化以调整歌词字体大小
    window.addEventListener('resize', adjustFontSize);
    adjustFontSize();

    // 定期更新播放进度
    progressUpdateInterval = setInterval(updateSongProgress, 200);

    console.log(`[Debug] Captions.vue loaded`);
});
onUnmounted(() => {
    window.removeEventListener('storage', updateStorageData);
    window.removeEventListener('resize', adjustFontSize);

    clearInterval(progressUpdateInterval!);
});

</script>
<template>
    <div class="flex row" id="desktopLyrics">
        <!-- 窗口标题栏 -->
        <div class="flex row" id="captionsControlBar" 
            @mousedown="titlebarMouseDown" @mousemove="titlebarMouseMove" @mouseup="titlebarMouseUp">
            <span class="flex column" id="windowDragCaptions"></span>
            <div :class="`flex row ${controlShow ? 'expanded' : ''}`" id="windowControlGroup">
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

        <!-- 控制面板 -->
        <div :class="`flex row ${controlShow ? 'expanded' : ''}`" id="captionsControl">
            <img :src="currentSongInfo.coverUrl" alt="Current Song Cover" id="captionsSongCover"/>
            <div class="flex column" id="captionsSongInfo">
                <span class="text medium bold">{{ currentSongInfo.name }}</span>
                <span class="text small">{{ currentSongInfo.authors }}</span>
                
                <div class="flex row" id="progressDesktopLyrics">
                    <label class="text ultraSmall">{{ progressText }}</label>
                    <span class="flex row" id="desktopLyricsProgressBar">
                        <span id="desktopLyricsProgressDone" :style="`width: ${progressPercentage}%`"></span>
                    </span>
                    <label class="text ultraSmall">{{ durationText }}</label>
                </div>

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
                </div>
            </div>
        </div>

        <button :class="`flex row ${controlShow ? 'expanded' : ''}`" id="expandControl" title="展开控制器" @click="toggleControlPanel">
            <img src="/images/arrows/right.svg" alt="Expand Control"/>
        </button>

        <!-- 歌词内容 -->
        <div class="flex row" id="captionsMain">
            <span :class="`flex column ${controlShow ? 'controlExpanded' : ''}`" id="currentLyricsBox">
                <ul class="text large bold">{{ currentLyrics.content }}</ul>
                <ul class="text medium bold">{{ currentLyrics.translation }}</ul>
            </span>
        </div>
    </div>
</template>
