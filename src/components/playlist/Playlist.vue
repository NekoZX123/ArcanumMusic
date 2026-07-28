<script setup lang="ts">
import { computed, watch, nextTick } from 'vue';
import { getPlayer } from '../../assets/player/player';
import { PlaylistSongLine } from '../../assets/widgets/Widgets';
import './playlistStyle.css';

/** 根据 repeatState / shuffleState 组合需展示的列表项 */
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

/** 自动滚动到当前项 (repeatState 0/2 时) */
watch(
    () => getPlayer()?.playlist.currentIndex,
    () => {
        const player = getPlayer();
        if (!player) return;
        if (player.repeatState === 0 || player.repeatState === 2) {
            nextTick(() => {
                const el = document.querySelector('.playlistLine.currentItem');
                if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            });
        }
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
