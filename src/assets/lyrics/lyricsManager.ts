import { reactive, type Reactive } from "vue";
import { getPlayer } from "../player/player";
import { getSongLyrics } from "../player/songUtils";
import { parseLyrics, type LyricData } from "./lyricsParser";
import { smoothScroll } from "../effects/smoothScroll";

let lyricsEffectMode = 0;
let lyricLines: Reactive<LyricData> = reactive({
    lyrics: [
        {
            time: 0.0,
            content: 'Arcanum Music',
            translation: 'made by NekoZX123'
        }
    ],
    metaData: {}
});

/**
 * 初始化歌词控制器
 * @param effectMode 歌词模式
 */
function initializeLyricsManager(effectMode: number) {
    if (effectMode < 0 || effectMode > 2) {
        console.error(`[Error] Unknown lyrics type: ${effectMode}`);
        return;
    }

    lyricsEffectMode = effectMode;
}

/**
 * 更新歌词内容
 */
function updateCurrentLyrics(_?: any) {
    const songId = getPlayer()?.playlist.current.id;
    if (!songId) return;
    const platform = songId.split('-')[1];

    // 重置歌词
    lyricLines = {
        lyrics: [],
        metaData: {}
    };

    getSongLyrics(songId)
    .then((lyricsInfo: any) => {
        console.log(lyricsInfo);

        const parseResult = parseLyrics(lyricsInfo, platform);
        if (!parseResult) {
            console.error(`[Error] Failed to parse lyrics`);
            return;
        }
        lyricLines = parseResult;

        currentLyricIndex = -1;
        updateFocusedLyric(0);
    });
}

function getLyricsData() {
    return lyricLines;
}

let currentLyricIndex = -1;
let containerElement: HTMLElement | null = null;
let lyricElements: Reactive<any[]> = reactive([]);
/**
 * 获取当前焦点歌词
 * @param time 播放时间
 */
function findLyricIndex(time: number) {
    let start = 0, end = lyricLines.lyrics.length - 1;

    while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        const midTime = lyricLines.lyrics[mid].time;

        if (midTime <= time) {
            start = mid + 1;
        }
        else {
            end = mid - 1;
        }
    }

    return end;
}

let currentLyricObject = {
    time: 0.0,
    content: 'Arcanum Music',
    translation: 'made by NekoZX123',
};

// Apple Music 歌词动效常量
// 间距增大 / 歌词滚动用时
const amScrollTime = 300;
// 间距增大单位量
const amMarginDelta = 12;
// 过冲效果时间 / 基本延迟 / 单位延迟变化
const amOverflowTime = 300;
const amOverflowDelayBase = 0;
const amOverflowDelayDelta = 20;
// 过冲位移量
const amOverflowMargin = 3;
// 恢复动画时长
const amRestoreTime = 1000;
/**
 * 同步焦点歌词
 */
function syncFocusedLyric() {
    localStorage.setItem('currentLyrics', JSON.stringify(currentLyricObject));
}
/**
 * 更新当前焦点歌词
 */
function updateFocusedLyric(time: number) {
    const targetIndex = findLyricIndex(time);

    if (targetIndex !== currentLyricIndex && lyricElements.length > 0 && targetIndex >= 0) {
        // 更新样式
        if (currentLyricIndex >= 0) {
            // console.log(targetIndex, currentLyricIndex, lyricElements.value);
            lyricElements[currentLyricIndex].classList.remove('focused');
        }
        lyricElements[targetIndex].classList.add('focused');

        // 更新焦点索引
        currentLyricIndex = targetIndex;
        currentLyricObject = lyricLines.lyrics[targetIndex];
        syncFocusedLyric();

        // 滚动至焦点位置
        const activeElement = lyricElements[targetIndex];
        if (activeElement) {
            requestAnimationFrame(() => {
                if (lyricsEffectMode === 1) { // Apple Music 样式歌词滚动效果
                    const animationStartIndex = targetIndex + 1;
                    const animationEndIndex = Math.min(lyricElements.length - 1, targetIndex + 5);

                    // Step1: 增大歌词间距
                    for (let i = animationStartIndex; i <= animationEndIndex; i++) {
                        const line = lyricElements[i] as HTMLElement;
                        const relativeIndex = i - targetIndex;

                        // 增大间距
                        line.style.transition = `transform ${amScrollTime}ms ease-out`;
                        line.style.transitionDelay = `0`;
                        line.style.transform = `translateY(${relativeIndex * amMarginDelta}px)`;
                    }
                    // Step2: 轻微过冲效果
                    setTimeout(() => {
                        for (let i = animationStartIndex; i <= animationEndIndex; i++) {
                            const line = lyricElements[i] as HTMLElement;
                            const relativeIndex = i - targetIndex;

                            line.style.transition = `transform ${amOverflowTime}ms ease-out`;
                            line.style.transitionDelay = `${amOverflowDelayBase + relativeIndex * amOverflowDelayDelta}ms`; // 每行延迟移动
                            line.style.transform = `translateY(-${amOverflowMargin}px)`;
                        }
                    }, amScrollTime);
                    // Step3: 缓慢恢复原位置
                    // 恢复动画时长
                    const restoreDelayTime = amScrollTime + 
                        amOverflowDelayBase + 
                        (animationEndIndex - targetIndex) * amOverflowDelayDelta + 
                        amOverflowTime;
                    setTimeout(() => {
                        for (let i = animationStartIndex; i <= animationEndIndex; i++) {
                            const line = lyricElements[i] as HTMLElement;

                            line.style.transition = `transform ${amRestoreTime}ms ease-out`;
                            line.style.transitionDelay = `0`;
                            line.style.transform = `translateY(1px)`;
                        }
                    }, restoreDelayTime);
                }

                setTimeout(() => {
                    if (!containerElement) return;
                    const containerHeight = containerElement.offsetHeight;
                    const elementTop = activeElement.offsetTop;
                    const elementHeight = activeElement.offsetHeight;
                    const scrollTarget = elementTop - (containerHeight / 3) + (elementHeight / 2);
                    smoothScroll(containerElement, scrollTarget, amScrollTime + amOverflowTime / 2);
                }, 0);
            });
        }
    }
}

function setContainerId(id: string) {
    const lyricsContainer = document.getElementById(id) as HTMLElement;
    if (!lyricsContainer) {
        console.error(`[Error] Failed to get element #${id}`);
        return;
    }
    containerElement = lyricsContainer;
    lyricElements = lyricsContainer.children as any;
}

export {
    initializeLyricsManager,
    updateCurrentLyrics,
    getLyricsData,
    updateFocusedLyric,
    syncFocusedLyric,
    setContainerId
};
