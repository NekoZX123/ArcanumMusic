<script setup lang="ts">
import { computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { getPlayer } from '../../assets/player/player';
import { PlaylistSongLine } from '../../assets/widgets/Widgets';
import './playlistStyle.css';
import { getConfig } from '../../assets/user/configLoader';

// 懒加载配置
const LAZY_LOAD_COUNT = 15;       // 每次加载数量
const SCROLL_LOAD_THRESHOLD = 200; // 距容器底部多少 px 时触发加载
const PLAY_LOAD_BUFFER = 5;       // 播放到距已加载末尾还剩几首时触发加载

// 懒加载下一批歌曲
function loadMoreSongs() {
    return getPlayer()?.loadMoreSongs(LAZY_LOAD_COUNT);
}

// 播放列表滚动到底部时自动加载
let scrollContainer: HTMLElement | null = null;
function onPlaylistScroll() {
    if (!scrollContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    if (scrollHeight - scrollTop - clientHeight <= SCROLL_LOAD_THRESHOLD) {
        loadMoreSongs();
    }
}

// 播放到已加载内容末尾时自动加载
watch(
    () => getPlayer()?.playlist.currentIndex,
    (index) => {
        const player = getPlayer();
        if (index === undefined || !player || !player.playlist.hasMore) return;
        if (index >= player.playlist.playList.length - PLAY_LOAD_BUFFER) {
            loadMoreSongs();
        }
    }
);

// 首屏未填满容器时持续补载
async function fillContainer() {
    if (!scrollContainer) return;
    const player = getPlayer();
    if (!player || !player.playlist.hasMore) return;
    if (scrollContainer.scrollHeight <= scrollContainer.clientHeight + SCROLL_LOAD_THRESHOLD) {
        await loadMoreSongs();
        await nextTick();
        await fillContainer();
    }
}

onMounted(() => {
    scrollContainer = document.getElementById('pageContainer');
    scrollContainer?.addEventListener('scroll', onPlaylistScroll);
    fillContainer();
});

onBeforeUnmount(() => {
    scrollContainer?.removeEventListener('scroll', onPlaylistScroll);
    scrollContainer = null;
});

//  根据 repeatState / shuffleState 组合需展示的列表项
const mergedPlaylist = computed(() => {
    const player = getPlayer();
    if (!player) return [];

    const playList = player.playlist.playList || [];
    const currentId = player.playlist.current?.id;

    // 播放列表 & 会话历史
    return [
        ...playList.map((s: any, i: number) => ({
            ...s,
            _listIndex: i,
            _isCurrent: s.id === currentId,
            _isHistory: (i < player.playlist.currentIndex && player.shuffleState !== 1)
        }))
    ];
});

// 顺序播放/单曲循环/随机播放时自动滚动到当前项
watch(
    () => getPlayer()?.playlist.currentIndex,
    () => {
        const player = getPlayer();
        const autoScroll = getConfig().generic.playOptions.playlist.autoScroll;
        if (!player || !autoScroll) return;
        nextTick(() => {
            const container = document.querySelector('#pageContainer');
            const el = document.querySelector('.playlistLine.currentItem') as HTMLElement;

            if (container && el) {
                container.scrollTo({
                    top: Math.max(el.offsetTop - 24, 0),
                    behavior: 'smooth'
                });
            }
        });
    }
);
</script>
<template>
    <div class="flex column" id="playlistPage">
        <div class="playlistPart flex column" id="songsPlaylist">
            <label class="text large bold playlistSubtitle">播放列表</label>
            <PlaylistSongLine
                v-for="(item) in mergedPlaylist"
                :key="`playlist_${item.id}_${item._isHistory ? 'history' : 'list'}`"
                :id="`playlist_${item.id}`"
                :index="item._listIndex"
                :name="item.name"
                :authors="item.authors"
                :cover-url="item.coverUrl"
                :duration="item.duration"
                :is-current="item._isCurrent"
                :highlight-current="item._isCurrent && (getPlayer()?.repeatState === 2)"
                :is-history="item._isHistory"
            />
        </div>
    </div>
</template>
