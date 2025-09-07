<script setup lang="ts">
import { onMounted, ref } from 'vue';
import './lyricsStyle.css';
import { LyricsLine } from '../../assets/lyrics/Lyrics';
import { getPlayer } from '../../assets/player/player';

const songData = ref(getPlayer());
// 最大偏移回弹距离
const PROGRESS_OFFSET_MAX = 15;
// 回弹方向 (左: -1 | 右: 1)
let offsetDirection = 0;

// 播放进度调整
let targetProgress = 0;
const targetPercentage = ref(0);
const playTimeAdjustFlag = ref(false);
function startProgressAdjust(event: MouseEvent) {
    if (event.buttons === 1) {
        // 添加全局事件监听器
        document.addEventListener('mousemove', adjustPlayProgress);
        playTimeAdjustFlag.value = true;

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', adjustPlayProgress);
            document.removeEventListener('mouseup', handleMouseUp);
            getPlayer()?.setProgress(targetProgress);
            playTimeAdjustFlag.value = false;

            const progressBar = document.getElementById('progressBar');
            if (!progressBar) return;

            progressBar.style.transform = `translateX(${PROGRESS_OFFSET_MAX * offsetDirection * 0.6}px)`;
            setTimeout(() => {
                progressBar.style.transform = 'translateX(0)';
                offsetDirection = 0;
            }, 200);
        };

        document.addEventListener('mouseup', handleMouseUp);
    }
}
function adjustPlayProgress(event: MouseEvent) {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar || !songData.value) return;

    if (event.buttons === 1 && playTimeAdjustFlag.value) {
        // 设置进度条宽度
        let deltaX = event.clientX - progressBar.getBoundingClientRect().left;
        let progress = deltaX / progressBar.clientWidth;

        // 防止范围溢出 & 处理回弹动画
        if (progress < 0 || progress > 1) {
            if (deltaX > PROGRESS_OFFSET_MAX) deltaX = PROGRESS_OFFSET_MAX;
            if (deltaX < -PROGRESS_OFFSET_MAX) deltaX = -PROGRESS_OFFSET_MAX;

            progressBar.style.transform = `translateX(${deltaX}px)`;
            offsetDirection = deltaX < 0 ? 1 : -1;

            progress = deltaX < 0 ? 0 : 1;
        }

        // 设置播放进度文字
        let playProgress = Math.round((getPlayer()?.duration || 0) * progress);
        getPlayer()?.updateProgress(playProgress);
        targetProgress = playProgress;
        targetPercentage.value = progress * 100;
    }
}

// 隐藏歌词
function hideLyrics(_: any) {
    const lyricsPanel = document.getElementById('lyricsArea');
    if (!lyricsPanel) return;

    lyricsPanel.classList.remove('show');

    setTimeout(() => {
        lyricsPanel.style = 'display: none;';
    }, 500);
}

// 音量调整
function adjustVolume(event: MouseEvent) {
    const volumeBar = document.getElementById('lyricsPageVolumeBar');
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

// 长歌曲名称焦点滚动
function checkScrollAnimation(_: MouseEvent) {
    const nameContainer = document.getElementById('lyricsPageSongNameContainer') as HTMLElement;
    const nameContent = document.getElementById('songName') as HTMLElement;
    
    if (nameContainer.scrollWidth > nameContainer.offsetWidth && !nameContent.classList.contains('autoScroll')) {
        nameContent.classList.add(`autoScroll`);
    }
}
// 重置滚动动画
function resetScroll(_: MouseEvent) {
    const nameContent = document.getElementById('songName') as HTMLElement;
    nameContent.classList.remove('autoScroll');
}

// 限制歌手文字长度
function limitAuthorsTextLength(authors: string) {
    const authorsContent = document.getElementById('currentSongAuthors') as HTMLElement;
    if (!authorsContent) {
        return;
    }

    if (authors.length > 10) {
        const limitedText = `${authors.substring(0, 10)}...`;
        return limitedText;
    }
    return authors;
}



onMounted(() => {
    // 设置触发器
    const playerElem = document.getElementById('arcanummusic-playcontrol') as HTMLAudioElement;
    if (!playerElem) {
        console.error('[Error] Player element not found');
        return;
    }
    playerElem.addEventListener('timeupdate', () => {
        if (!playTimeAdjustFlag.value) getPlayer()?.updateProgress(Math.floor(playerElem.currentTime));

        getPlayer()?.checkNextSong('Lyrics.vue');
    });

    console.log('Lyrics.vue loaded');
});

</script>
<template>
    <div class="flex column" id="lyricsPanel">
        <!-- 面板顶栏 -->
        <div class="flex row" id="panelTop">
            <button id="lyricsHide" @click="hideLyrics">
                <img src="/images/player/expand.svg" alt="Hide lyrics"/>
            </button>
        </div>
        <!-- 主面板 -->
        <div class="flex row" id="panelMain">
            <!-- 歌曲信息 & 播放控制 -->
            <div class="flex column" id="controller">
                <div class="flex column" id="songInfo">
                    <img id="songCover" :src="getPlayer()?.playlist.current.coverUrl"/>
                    <div class="flex row" id="playerInfo">
                        <div class="flex column">
                            <span id="lyricsPageSongNameContainer" @mouseenter="checkScrollAnimation" @mouseleave="resetScroll">
                                <label class="text medium white bold" id="songName">{{ getPlayer()?.playlist.current.name }}</label>
                            </span>
                            <label class="text small white bold" id="songAuthors">{{ limitAuthorsTextLength(getPlayer()?.playlist.current.authors || '') }}</label>
                        </div>
                        <div class="flex row" id="volumeInLyrics">
                            <button id="toggleMute" @click="getPlayer()?.toggleMute">
                                <img :src="getPlayer()?.volumeLevel"/>
                            </button>
                            <div id="lyricsPageVolumeFilled" @mousemove="adjustVolume">
                                <div id="lyricsPageVolumeBar">
                                    <div id="lyricsPageVolumeFilled" :style="`width: ${getPlayer()?.volume}%`"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex column" id="playerControl">
                    <span class="flex row" id="progressContainer">
                        <label class="text ultraSmall bold white">{{ getPlayer()?.playedTimeText }}</label>
                        <span class="fluentProgress flex row" id="progressBar" @mousedown="startProgressAdjust" @mousemove="adjustPlayProgress">
                            <span class="fluentFilled" id="progressDone" 
                                :style="`width: ${playTimeAdjustFlag ? targetPercentage : getPlayer()?.progressPercentage}%`"></span>
                        </span>
                        <label class="text ultraSmall bold white">{{ getPlayer()?.durationText }}</label>
                    </span>
                    <!-- 播放控制器栏 -->
                    <span class="flex row" id="controlBar">
                        <button class="playControl small" id="toggleRepeat" @click="getPlayer()?.toggleRepeat">
                            <img :src="getPlayer()?.repeatStateImage" alt="Toggle repeat"/>
                        </button>
                        <button class="playControl" id="previous" @click="getPlayer()?.previousSong">
                            <img src="/images/player/previous.svg" alt="Previous song"/>
                        </button>
                        <button class="playControl large" id="playPause" @click="getPlayer()?.togglePlayPause">
                            <img :src="getPlayer()?.playStateImage" alt="Play / Pause"/>
                        </button>
                        <button class="playControl" id="next" @click="getPlayer()?.nextSong">
                            <img src="/images/player/next.svg" alt="Next song"/>
                        </button>
                        <button class="playControl small" id="toggleShuffle" @click="getPlayer()?.toggleShuffle">
                            <img :src="getPlayer()?.shuffleStateImage" alt="Toggle shuffle"/>
                        </button>
                    </span>
                </div>
            </div>
            <!-- 歌词内容 -->
            <div class="flex column" id="lyricsContent">
                <LyricsLine content="歌词内容 1" translation="Lyrics content 1"></LyricsLine>
                <LyricsLine content="这是一段较长的内容, 用于测试应用对长歌词的显示情况" 
                    translation="This content is long, in order to test whether the application can display long content well"></LyricsLine>
            </div>
        </div>
    </div>
</template>
