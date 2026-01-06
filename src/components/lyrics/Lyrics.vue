<script setup lang="ts">
import { onMounted, ref } from 'vue';
import './lyricsStyle.css';
import { LyricsLine } from '../../assets/lyrics/Lyrics.tsx';
import { getPlayer } from '../../assets/player/player.ts';
import { getMainColors, ParticleManager } from '../../assets/effects/colorUtils.ts';
import { getLyricsData, initializeLyricsManager, setContainerId, updateCurrentLyrics, updateFocusedLyric } from '../../assets/lyrics/lyricsManager.ts';
import { getConfig } from '../../assets/utilities/configLoader.ts';

// const songData = ref(getPlayer());
// 最大偏移回弹距离
const PROGRESS_OFFSET_MAX = 15;
// 回弹方向 (左: -1 | 右: 1)
let offsetDirection = 0;

// 播放进度调整
let targetProgress = 0;
const targetPercentage = ref(0);
const playTimeAdjustFlag = ref(false);
function adjustPlayProgress(mouseX: number) {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;

    // 设置进度条宽度
    let deltaX = mouseX - progressBar.getBoundingClientRect().left;
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
    if (progress >= 1) {
        playProgress = (Math.max(0, (getPlayer()?.duration || 0) - 0.1));
    }
    getPlayer()?.updateProgress(playProgress);
    targetProgress = playProgress;
    targetPercentage.value = progress * 100;
}
function startProgressAdjust(event: MouseEvent) {
    if (event.buttons === 1) {
        // 添加全局事件监听器
        document.addEventListener('mousemove', adjustOnMouseMove);
        playTimeAdjustFlag.value = true;

        adjustPlayProgress(event.clientX);

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', adjustOnMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            getPlayer()?.setProgress(targetProgress, false);
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
// 鼠标移动事件调整处理
function adjustOnMouseMove(event: MouseEvent) {
    const progressBar = document.getElementById('playProgress');
    if (!progressBar) return;

    if (event.buttons === 1 && playTimeAdjustFlag.value) {
        adjustPlayProgress(event.clientX);
    }
}

// 隐藏歌词
function hideLyrics(_: any) {
    const lyricsPanel = document.getElementById('lyricsArea');
    if (!lyricsPanel) return;

    lyricsPanel.classList.remove('show');

    setTimeout(() => {
        stopAnimation();

        lyricsPanel.style.display = 'none;';
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

// 模糊歌曲封面背景
function loadBluredCoverBackground(_?: any) {
    // 显示模糊遮罩层
    const backgroundContainer = document.getElementById('backgroundContainer');
    const backgroundCanvas = document.getElementById('dynamicBackground');
    const backgroundBlurMask = document.getElementById('backgroundBlurMask');
    if (!backgroundContainer || !backgroundCanvas || !backgroundBlurMask) return;
    
    backgroundCanvas.style.display = 'none';
    backgroundBlurMask.style.display = 'block';

    // 加载模糊背景
    const coverUrl = getPlayer()?.coverUrl;
    if (!coverUrl) return;
    backgroundContainer.style.backgroundImage = `url(${coverUrl})`;
}

// 动态背景
let particleSystem: ParticleManager | null = null;
const PARTICLES_COUNT = 3;
/**
 * 加载动态背景 (颜色根据歌曲封面提取)
 */
async function loadMainColorBackground(_?: any) {
    // 显示画布层
    const backgroundContainer = document.getElementById('backgroundContainer');
    const backgroundCanvas = document.getElementById('dynamicBackground');
    const backgroundBlurMask = document.getElementById('backgroundBlurMask');
    if (!backgroundContainer || !backgroundCanvas || !backgroundBlurMask) return;
    
    backgroundBlurMask.style.display = 'none';
    backgroundCanvas.style.display = 'block';
    backgroundContainer.style.backgroundImage = 'transparent';

    // 加载动态背景
    const coverUrl = getPlayer()?.coverUrl;
    if (coverUrl) {
        // 获取封面主色
        const colorList: any = await getMainColors(coverUrl, PARTICLES_COUNT);
        if (!particleSystem) {
            particleSystem = new ParticleManager(colorList);
        }

        // 重置动画
        particleSystem.stopAnimation();

        // 设置光斑颜色
        console.log(colorList);
        particleSystem.setColors(colorList);

        // 重置粒子效果
        particleSystem.clearCanvas();
        particleSystem.createParticles();

        setTimeout(() => {
            particleSystem?.startAnimation();
        }, 50);
    }
}

/**
 * 歌词面板显示时检测是否开始动画
 */
function pendStartAnimation(_?: any) {
    // 播放时开始动画
    if (getPlayer()?.isPlaying && particleSystem) {
        particleSystem.stopAnimation(); // 先停止已有动画
        particleSystem.startAnimation();
    }
}
/**
 * 停止动画
 */
function stopAnimation() {
    if (particleSystem) {
        particleSystem.stopAnimation();
        particleSystem.destroy();
        particleSystem = null;
    }
}

function loadThemeColorBackground() {
    // 显示模糊遮罩层
    const backgroundContainer = document.getElementById('backgroundContainer');
    const backgroundCanvas = document.getElementById('dynamicBackground');
    const backgroundBlurMask = document.getElementById('backgroundBlurMask');
    if (!backgroundContainer || !backgroundCanvas || !backgroundBlurMask) return;
    
    backgroundCanvas.style.display = 'none';
    backgroundBlurMask.style.display = 'block';

    backgroundContainer.style.backgroundImage = `
    radial-gradient(circle at 15% 5%, var(--theme-color-default), transparent 15rem),
    radial-gradient(circle at 80% 90%, var(--theme-color-deep), var(--theme-color-ultradeep) 20rem)
    `;
}

/**
 * 更新背景
 */
function updateBackground(_?: any) {
    const config = getConfig();
    if (!config) {
        console.error(`[Error] Config not loaded`);
        return;
    }

    const lyricsBackgroundType = parseInt(config.generic.appearance.lyrics.lyricsBackground);
    if (lyricsBackgroundType === 0) { // 模糊歌曲封面
        stopAnimation();

        loadBluredCoverBackground();
    }
    else if (lyricsBackgroundType === 1) { // 歌曲封面取色 (动态)
        // 光斑背景动效
        pendStartAnimation();
        loadMainColorBackground();

        // 监听动态背景更新及动画开始事件
        window.addEventListener('beforeunload', stopAnimation);
    }
    else {
        stopAnimation();

        loadThemeColorBackground();
    }
}

/**
 * 切换播放/暂停
 */
function togglePlayPauseInLyrics(_: MouseEvent) {
    const musicPlayer = getPlayer();
    if (!musicPlayer) return;
    musicPlayer.togglePlayPause();

    if (particleSystem) {
        if (musicPlayer.isPlaying) {
            particleSystem.startAnimation();
        }
        else {
            particleSystem.stopAnimation();
        }
    }
}

/**
 * 更新歌词样式
 * @param style 歌词样式 ID
 */
function updateLyricsStyle(style: number) {
    if (style < 0 || style > 2) {
        console.error(`[Error] Unknown lyrics type: ${style}`);
        return;
    }
    lyricsEffectMode.value = style;
}

// 歌词光效及样式
const lyricsGlow = ref(true);
const lyricsEffectMode = ref(0);

onMounted(() => {
    // 设置触发器
    const playerElem = document.getElementById('arcanummusic-playcontrol') as HTMLAudioElement;
    if (!playerElem) {
        console.error('[Error] Player element not found');
        return;
    }
    // 歌词自动滚动
    playerElem.addEventListener('timeupdate', () => {
        updateFocusedLyric(playerElem.currentTime);
    });
    // 进度条更新 & 检测下一首
    playerElem.addEventListener('timeupdate', () => {
        if (!playTimeAdjustFlag.value) getPlayer()?.updateProgress(Math.floor(playerElem.currentTime));

        getPlayer()?.checkNextSong();
    });

    // 监听歌曲文件变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                updateCurrentLyrics();
                updateFocusedLyric(0);
            }
        });
    });
    observer.observe(playerElem, { attributes: true, attributeFilter: ['src'] });

    // 监听歌词事件
    window.addEventListener('update-lyrics', updateCurrentLyrics);

    // 歌词元素
    setContainerId('lyricsContent');

    // 根据应用配置加载背景
    window.addEventListener('update-background', updateBackground);
    window.addEventListener('lyrics-launch', updateBackground);
    
    // 读取配置
    const lyricsOptions = getConfig().generic.appearance.lyrics;

    // 歌词光效
    lyricsGlow.value = lyricsOptions.lyricsGlow;

    // 歌词样式
    const lyricsStyle = parseInt(lyricsOptions.lyricsStyle);
    initializeLyricsManager(lyricsStyle);
    updateLyricsStyle(lyricsStyle);

    // 同步设置变化
    window.addEventListener('config-change', () => {
        const lyricsOptions = getConfig().generic.appearance.lyrics;
        lyricsGlow.value = lyricsOptions.lyricsGlow;
        updateLyricsStyle(parseInt(lyricsOptions.lyricsStyle));
    });

    console.log('Lyrics.vue loaded');
});

</script>
<template>
    <div class="flex column" id="lyricsPanel">
        <!-- 动态背景 -->
        <div id="backgroundContainer">
            <canvas id="dynamicBackground"></canvas>
            <div id="backgroundBlurMask"></div>
        </div>
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
                        <span class="fluentProgress flex row" id="progressBar" @mousedown="startProgressAdjust" @mousemove="adjustOnMouseMove">
                            <span class="fluentFilled" id="progressDone" 
                                :style="`width: ${playTimeAdjustFlag ? targetPercentage : getPlayer()?.progressPercentage}%`"></span>
                        </span>
                        <label class="text ultraSmall bold white">{{ getPlayer()?.durationText }}</label>
                    </span>
                    <!-- 播放控制器栏 -->
                    <span class="flex row" id="controlBar">
                        <button class="playControl small glow" id="toggleRepeat" @click="getPlayer()?.toggleRepeat">
                            <img :src="getPlayer()?.repeatStateImage" alt="Toggle repeat"/>
                        </button>
                        <button class="playControl glow" id="previous" @click="getPlayer()?.previousSong">
                            <img src="/images/player/previous.svg" alt="Previous song"/>
                        </button>
                        <button class="playControl large glow" id="playPause" @click="togglePlayPauseInLyrics">
                            <img :src="getPlayer()?.playStateImage" alt="Play / Pause"/>
                        </button>
                        <button class="playControl glow" id="next" @click="getPlayer()?.nextSong">
                            <img src="/images/player/next.svg" alt="Next song"/>
                        </button>
                        <button class="playControl small glow" id="toggleShuffle" @click="getPlayer()?.toggleShuffle">
                            <img :src="getPlayer()?.shuffleStateImage" alt="Toggle shuffle"/>
                        </button>
                    </span>
                </div>
            </div>
            <!-- 歌词内容 -->
            <div class="flex column" id="lyricsContent">
                <LyricsLine 
                    v-for="lyricInfo in getLyricsData().lyrics"
                    :time="lyricInfo.time"
                    :content="lyricInfo.content"
                    :translation="lyricInfo.translation"
                    :glow-effect="lyricsGlow"
                    :lyrics-mode="lyricsEffectMode"
                />
            </div>
        </div>
    </div>
</template>
