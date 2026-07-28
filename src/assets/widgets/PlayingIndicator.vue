<!-- PlayingIndicator - 正在播放歌曲指示器 简单动画效果 -->
<template>
    <div class="playingIndicator flex row">
        <div class="indicatorBar line01"></div>
        <div class="indicatorBar line02"></div>
        <div class="indicatorBar line03"></div>
    </div>
</template>
<style lang="css" scoped>
.playingIndicator {
    width: 2rem;
    height: 2rem;

    padding: 4px;

    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: center;
    gap: 4px;
}

.indicatorBar {
    width: 6px;
    height: 10%; /* 起始高度 10% */

    background: linear-gradient(0deg, #6df395 0%, #63f3c8 100%);
    border-radius: 3px;

    animation-name: barWave;
    animation-duration: 1000ms;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    transform-origin: bottom center;
}

.indicatorBar.line01 {
    animation-delay: 0ms;
}
.indicatorBar.line02 {
    animation-delay: 150ms;
    animation-duration: 1050ms;
}
.indicatorBar.line03 {
    animation-delay: 300ms;
    animation-duration: 1100ms;
}

@keyframes barWave {
    0% {
        height: 30%;
    }
    50% {
        height: 100%;
    }
    100% {
        height: 30%;
    }
}
</style>
