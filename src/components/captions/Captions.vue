<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import './captionsStyle.css';
import '../../globalStyle.css';

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

const playStateImage = ref('./images/player/play.dark.svg');
const repeatStateImage = ref('./images/player/repeat.svg');
const shuffleStateImage = ref('./images/player/shuffle.svg');
const currentLyrics = ref({
    time: 0.0,
    content: 'Arcanum Music',
    translation: 'made by NekoZX123'
});
function updateStorageData(updateEvent: StorageEvent) {
    if (updateEvent.key === 'currentLyrics' && updateEvent.newValue) {
        const lyrics = JSON.parse(updateEvent.newValue);
        currentLyrics.value = Object.assign({}, lyrics);
    }
    if (updateEvent.key === 'playState' && updateEvent.newValue) {
        playStateImage.value = updateEvent.newValue || './images/player/play.dark.svg';
    }
    if (updateEvent.key === 'repeatState' && updateEvent.newValue) {
        repeatStateImage.value = updateEvent.newValue || './images/player/repeat.svg';
    }
    if (updateEvent.key === 'shuffleState' && updateEvent.newValue) {
        shuffleStateImage.value = updateEvent.newValue || './images/player/shuffle.svg';
    }
}

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

    const isCaptionsOn = alwaysOnTopButton.classList.contains('active');
    if (isCaptionsOn) {
        alwaysOnTopButton.classList.remove('active');
        window.electron.setAlwaysOnTop(captionsWindowId, false);
    }
    else {
        alwaysOnTopButton.classList.add('active');
        window.electron.setAlwaysOnTop(captionsWindowId, true);
    }
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

const windowIdentifier = 'moe.nekozx.arcanummusic.desktoplyrics';

onMounted(() => {
    window.addEventListener('storage', updateStorageData);

    console.log(`[Debug] Captions.vue loaded`);
});
onUnmounted(() => {
    window.removeEventListener('storage', updateStorageData);
});

</script>
<template>
    <div class="flex column" id="desktopLyrics">
        <!-- 窗口标题栏 -->
        <div class="flex row" id="windowControlBar" 
            @mousedown="titlebarMouseDown" @mousemove="titlebarMouseMove" @mouseup="titlebarMouseUp">
            <span class="flex column" id="windowDragCaptions"></span>
        </div>

        <!-- 控制器 -->
        <div class="flex row" id="captionsBarController">
            <button class="playControl small" id="toggleTop" title="窗口置顶" @click="toggleWindowTop">
                <img src="/images/windowControl/alwaysTop.svg"></img>
            </button>

            <div class="verticleSplitLine"></div>

            <button class="playControl small" id="previousButton" title="上一首" 
                @click="() => sendToMain('previous-song', windowIdentifier)">
                <img src="/images/player/previous.svg"></img>
            </button>
            <button class="playControl small" id="playPauseButton" title="播放 / 暂停"
                @click="() => sendToMain('toggle-play-pause', windowIdentifier)">
                <img :src="playStateImage"></img>
            </button>
            <button class="playControl small" id="nextButton" title="下一首"
                @click="() => sendToMain('next-song', windowIdentifier)">
                <img src="/images/player/next.svg"></img>
            </button>
            <button class="playControl small" id="repeat" title="循环播放"
                @click="() => sendToMain('toggle-repeat', windowIdentifier)">
                <img :src="repeatStateImage" alt="Toggle repeat"/>
            </button>
            <button class="playControl small" id="shuffle" title="随机播放"
                @click="() => sendToMain('toggle-shuffle', windowIdentifier)">
                <img :src="shuffleStateImage" alt="Toggle shuffle"/>
            </button>

            <div class="verticleSplitLine"></div>

            <button class="playControl small" id="closeCaptions" title="关闭窗口"
                @click="() => sendToMain('captions-close', windowIdentifier)">
                <img src="/images/windowControl/close.svg" alt="Close window"></img>
            </button>
        </div>

        <!-- 歌词内容 -->
        <div class="flex column" id="captionsMain">
            <span class="flex column" id="currentLyricsBox">
                <ul class="text large bold">{{ currentLyrics.content }}</ul>
                <ul class="text medium bold">{{ currentLyrics.translation }}</ul>
            </span>
        </div>
    </div>
</template>
