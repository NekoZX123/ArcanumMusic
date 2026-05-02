<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import './captionsStyle.css';
import '../../globalStyle.css';
import { timeFormat } from '../../assets/utilities/timeFormat.ts';
import { getMainColors } from '../../assets/effects/colorUtils.ts';

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
        
        // 从封面提取主要颜色更新渐变
        if (songInfo.coverUrl) {
            updateGradientFromImage(songInfo.coverUrl);
        }

        // 同步歌曲链接到音频元素
        const audioElement = document.getElementById('desktoplrc-frequencychart') as HTMLAudioElement;
        if (audioElement && songInfo.url) {
            console.log(`[Debug] Updating audio source to: ${songInfo.url}`);

            audioElement.src = songInfo.url;
            audioElement.load();
            audioElement.play().catch(error => {
                console.error('[Error] Failed to play audio:', error);
            });
        }
    }
    if (updateEvent.key === 'currentLyrics' && updateEvent.newValue) { // 更新当前歌词
        const lyrics = JSON.parse(updateEvent.newValue);
        currentLyrics.value = Object.assign({}, lyrics);
        requestAnimationFrame(adjustFontSize);
    }
    if (updateEvent.key === 'playState' && updateEvent.newValue) {
        playStateImage.value = updateEvent.newValue;

        const isPlaying = playStateImage.value.includes('pause');
        const audioElement = document.getElementById('desktoplrc-frequencychart') as HTMLAudioElement;
        if (audioElement) {
            if (isPlaying) {
                audioElement.play().catch(error => {
                    console.error('[Error] Failed to play audio:', error);
                });
            } else {
                audioElement.pause();
            }
        }
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

// 应用内通信频道
const appChannel = new BroadcastChannel('moe.nekozx123.arcanummusic');

/**
 * 向主窗口发送消息 (使用 localStorage 作为中间桥)
 * @param eventName 事件名称
 * @param message 消息内容
 */
function sendToMain(eventName: string, message?: any) {
    window.localStorage.setItem('playerSignal', '');
    window.localStorage.setItem('playerSignal', 
        JSON.stringify({
            eventName: eventName, 
            message: message, 
            identifier: windowIdentifier
        })
    );
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

// 播放进度调整
const playTimeAdjustFlag = ref(false);
let targetTime = 0;
const targetPercentage = ref(0);
const targetTimeText = ref('00:00');

// 开始调整
function adjustPlayProgress(mouseX: number) {
    const progressBar = document.getElementById('desktopLyricsProgressBar');
    if (!progressBar) return;

    // 设置进度条宽度
    const barRect = progressBar.getBoundingClientRect();
    let deltaX = mouseX - barRect.left;
    let progress = deltaX / progressBar.clientWidth;

    // 防止范围溢出
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // 设置播放进度文字
    targetPercentage.value = progress * 100;
    targetTime = Math.round(progress * songDuration.value);
    targetTimeText.value = timeFormat(targetTime);
}
function startProgressAdjust(event: MouseEvent) {
    if (event.buttons === 1 && !playTimeAdjustFlag.value) {
        // 添加全局事件监听器
        document.addEventListener('mousemove', adjustOnMouseMove);
        playTimeAdjustFlag.value = true;

        // 点击时同样调整进度
        adjustPlayProgress(event.clientX);

        // 结束调整
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', adjustOnMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            playTimeAdjustFlag.value = false;

            appChannel.postMessage({
                eventName: 'set-progress',
                message: targetTime
            });
        };

        document.addEventListener('mouseup', handleMouseUp);
    }
}
// 鼠标移动事件调整处理
function adjustOnMouseMove(event: MouseEvent) {
    const progressBar = document.getElementById('desktopLyricsProgressBar');
    if (!progressBar) return;

    if (event.buttons === 1 && playTimeAdjustFlag.value) {
        adjustPlayProgress(event.clientX);
    }
}


// 更新播放进度
const songDuration = ref(0);
const durationText = ref('00:00');
const currentProgress = ref(0);
const progressText = ref('00:00');
const progressPercentage = ref(0);
function updateSongProgress(event: MessageEvent) {
    if (event.data.eventName === 'progress-update') {
        const time = event.data.message;

        currentProgress.value = time;
        progressText.value = timeFormat(currentProgress.value);

        progressPercentage.value = currentProgress.value / songDuration.value * 100;

        // 同步播放进度到音频元素
        const audioElement = document.getElementById('desktoplrc-frequencychart') as HTMLAudioElement;
        if (audioElement && Math.abs(audioElement.currentTime - time) > 0.1) {
            audioElement.currentTime = time;
        }
    }
}

// Web Audio API 相关变量
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let frequencyData: Uint8Array<ArrayBuffer> | null = null;
let animationFrameId: number | null = null;

// 更新可视化柱状图
let visualizerCanvas: HTMLCanvasElement | null = null;
let visualizerContext: CanvasRenderingContext2D | null = null;
const gradientDefault = ['#84FAB0', '#8FD3F4'];
let gradientColor1 = '#84FAB0';
let gradientColor2 = '#8FD3F4';
let gradient: CanvasGradient | null = null;

/**
 * 从图片URL提取主要颜色并更新渐变
 */
async function updateGradientFromImage(imageUrl: string) {
    if (!imageUrl) {
        gradientColor1 = gradientDefault[0];
        gradientColor2 = gradientDefault[1];
        return;
    }
    
    try {
        const colors = await getMainColors(imageUrl);
        if (colors && colors.length >= 2) {
            gradientColor1 = colors[0];
            gradientColor2 = colors[1];
        } else {
            gradientColor1 = gradientDefault[0];
            gradientColor2 = gradientDefault[1];
        }
    } catch (error) {
        console.warn('[Warning] Failed to extract colors from image:', error);
        gradientColor1 = gradientDefault[0];
        gradientColor2 = gradientDefault[1];
    }
    
    // 更新渐变色
    if (visualizerContext) {
        gradient = visualizerContext.createLinearGradient(0, 0, 0, visualizerCanvas?.height || 100);
        gradient.addColorStop(0, gradientColor1);
        gradient.addColorStop(1, gradientColor2);
    }
}
function updateVisualizerChart(data: Uint8Array | number[]) {
    let processedData = Array.from(data);
    
    // 丢弃前 5% 和后 10% 数据
    const skipStart = Math.floor(processedData.length * 0.05);
    const skipEnd = Math.floor(processedData.length * 0.1);
    processedData = processedData.slice(skipStart, processedData.length - skipEnd);
    
    // 降采样至 32 个数据点
    const targetLength = 32;
    const sampledData: number[] = [];
    const chunkSize = processedData.length / targetLength;
    for (let i = 0; i < targetLength; i++) {
        const start = Math.floor(i * chunkSize);
        const end = Math.floor((i + 1) * chunkSize);
        const chunk = processedData.slice(start, end);
        const average = chunk.reduce((a, b) => a + b, 0) / chunk.length;
        sampledData.push(average);
    }
    
    const barHeightPercentages: number[] = sampledData.map(v => (v || 0) / 255 * 100);

    if (!visualizerCanvas || !visualizerContext) return;    

    // 清空画布
    visualizerContext.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

    // 绘制柱状图
    const barWidth = visualizerCanvas.width / barHeightPercentages.length;
    for (let i = 0; i < barHeightPercentages.length; i++) {
        const barHeight = barHeightPercentages[i] * 0.01 * visualizerCanvas.height;
        visualizerContext.fillStyle = gradient || `rgb(255, 255, 255)`;
        visualizerContext.fillRect(i * barWidth, visualizerCanvas.height - barHeight, barWidth - 1, barHeight);
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
        
        // 从封面提取主要颜色
        if (currentSongInfo.value.coverUrl) {
            updateGradientFromImage(currentSongInfo.value.coverUrl);
        }
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

    // 监听播放进度更新
    appChannel.addEventListener('message', updateSongProgress);

    // 初始化可视化画布
    visualizerCanvas = document.getElementById('visualizerCanvas') as HTMLCanvasElement;
    visualizerContext = visualizerCanvas.getContext('2d');
    visualizerCanvas.width = visualizerCanvas.clientWidth;
    visualizerCanvas.height = visualizerCanvas.clientHeight;

    // 初始化渐变色
    if (visualizerContext) {
        gradient = visualizerContext.createLinearGradient(0, 0, 0, visualizerCanvas.height);
        gradient.addColorStop(0, gradientColor1);
        gradient.addColorStop(1, gradientColor2);
    }
    // 设置 Web Audio API
    const audioElement = document.getElementById('desktoplrc-frequencychart') as HTMLAudioElement;
    if (audioElement) {
        try {
            audioContext = new AudioContext();
            
            // 创建 MediaElementSource -> AnalyserNode -> GainNode (gain=0) -> destination
            const source = audioContext.createMediaElementSource(audioElement);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0; // 静音
            
            // 连接节点
            source.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 初始化频率数据数组
            frequencyData = new Uint8Array(analyser.frequencyBinCount);
            
            // 启动频谱图绘制循环
            const drawFrequencyChart = () => {
                animationFrameId = requestAnimationFrame(drawFrequencyChart);
                if (analyser && frequencyData) {
                    analyser.getByteFrequencyData(frequencyData);
                    updateVisualizerChart(frequencyData);
                }
            };
            drawFrequencyChart();
        } catch (error) {
            console.error('[Error] Failed to initialize Web Audio API:', error);
        }
    }

    console.log(`[Debug] Captions.vue loaded`);
});
onUnmounted(() => {
    window.removeEventListener('storage', updateStorageData);
    window.removeEventListener('resize', adjustFontSize);
    appChannel.removeEventListener('message', updateSongProgress);
    
    // 清理 Web Audio API 资源
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
    }
    
    audioContext = null;
    analyser = null;
    frequencyData = null;
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
                    @click="() => sendToMain('captions-close')">
                    <img src="/images/windowControl/close.svg" alt="Close window"/>
                </button>
            </div>
        </div>

        <!-- 控制面板 -->
        <div :class="`flex row ${controlShow ? 'expanded' : ''}`" id="captionsControl">
            <img :src="currentSongInfo.coverUrl" alt="Current Song Cover" id="captionsSongCover"/>
            <div class="flex column" id="captionsSongInfo">
                <span class="text medium bold" id="desktopSongName">{{ currentSongInfo.name }}</span>
                <span class="text small" id="desktopSongAuthors">{{ currentSongInfo.authors }}</span>
                
                <div class="flex row" id="progressDesktopLyrics">
                    <label class="text ultraSmall">{{ playTimeAdjustFlag ? targetTimeText : progressText }}</label>
                    <span class="flex row" id="desktopLyricsProgressBar"
                        @mousedown="startProgressAdjust" @mousemove="adjustOnMouseMove">
                        <span id="desktopLyricsProgressDone" 
                            :style="`width: ${playTimeAdjustFlag ? targetPercentage : progressPercentage}%`"></span>
                    </span>
                    <label class="text ultraSmall">{{ durationText }}</label>
                </div>

                <div class="flex row" id="playbackControl">
                    <div class="flex row controlButtonGroup">
                        <button class="playControl small" id="repeat" title="循环播放"
                            @click="() => sendToMain('toggle-repeat')">
                            <img :src="repeatStateImage" alt="Toggle repeat"/>
                        </button>
                        <button class="playControl" id="previousButton" title="上一首" 
                            @click="() => sendToMain('previous-song')">
                            <img src="/images/player/previous.svg"/>
                        </button>
                        <button class="playControl" id="playPauseButton" title="播放 / 暂停"
                            @click="() => sendToMain('toggle-play-pause')">
                            <img :src="playStateImage"/>
                        </button>
                        <button class="playControl" id="nextButton" title="下一首"
                            @click="() => sendToMain('next-song')">
                            <img src="/images/player/next.svg"/>
                        </button>
                        <button class="playControl small" id="shuffle" title="随机播放"
                            @click="() => sendToMain('toggle-shuffle')">
                            <img :src="shuffleStateImage" alt="Toggle shuffle"/>
                        </button>
                    </div>

                    <div class="verticleSplitline"></div>

                    <div class="flex row controlButtonGroup">
                        <button class="playControl small" id="toggleTopOnControl" title="窗口置顶" @click="toggleWindowTop">
                            <img :src="alwaysOnTopImage"/>
                        </button>
                    </div>
                </div>
            </div>
            <div id="audioVisualizer">
                <canvas id="visualizerCanvas"></canvas>
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

        <audio id="desktoplrc-frequencychart" />
    </div>
</template>
