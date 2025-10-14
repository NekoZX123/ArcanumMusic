import { reactive, type Reactive } from "vue";
import { getPlayer } from "../player/player";
import { getSongLyrics } from "../player/songUtils";
import { parseLyrics, type LyricData } from "./lyricsParser";

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
        const currentLyricObject = lyricLines.lyrics[targetIndex];
        localStorage.setItem('currentLyrics', JSON.stringify(currentLyricObject));

        // 滚动至焦点位置
        const activeElement = lyricElements[targetIndex];
        if (activeElement) {
            requestAnimationFrame(() => {
                containerElement?.scrollTo({
                    top: activeElement.offsetTop - containerElement.offsetHeight / 2,
                    behavior: 'smooth'
                });
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
    updateCurrentLyrics,
    getLyricsData,
    updateFocusedLyric,
    setContainerId
};
