<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue';
import { SongInfoLine } from '../../assets/widgets/Widgets';
import { getPlayer } from '../../assets/player/player';
import { buttonTypes, showPopup } from '../../assets/notifications/popup.tsx';
import '../../globalStyle.css';
import './historyStyle.css';

const history: Ref<any[]> = ref([]);
const historyCover = ref(`./images/player/testAlbum.png`);

function loadHistory() {
    const stored = window.localStorage.getItem('playHistory');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                history.value = parsed;
                historyCover.value = parsed.length > 0 ? parsed[0].coverUrl : `./images/player/testAlbum.png`;
            }
        } catch (e) {
            console.error('[Error] Failed to parse playHistory:', e);
            historyCover.value = `./images/player/testAlbum.png`;
        }
    }
}

function playHistory() {
    getPlayer()?.playByList(history.value, true);
}

function clearHistory() {
    showPopup('warning', 'confirm', '清空播放历史', '是否清空播放历史?', ['', 'red'], (code: number) => {
        if (code === buttonTypes.BUTTON_CONFIRM) {
            window.localStorage.removeItem('playHistory');
            history.value = [];

            const player = getPlayer();
            if (player) {
               player.playlist.history = [];
            }
        }
    });
}

// 根据日期字符串返回分类标签
function getDateCategory(dateStr: string): string {
    if (!dateStr) return '很久之前';

    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays <= 7) return '一周内';
    if (diffDays <= 30) return '一个月内';
    return '很久之前';
}

// 将历史记录分组并插入标签
const groupedHistory = computed(() => {
    const groups: ({ type: 'label'; text: string } | { type: 'item'; data: any })[] = [];
    let lastCategory = '';

    for (const item of history.value) {
        const category = getDateCategory(item.addTime);
        if (category !== lastCategory) {
            groups.push({ type: 'label', text: category });
            lastCategory = category;
        }
        groups.push({ type: 'item', data: item });
    }

    return groups;
});

onMounted(() => {
    console.log('[Debug] History.vue loaded');
    loadHistory();
    window.addEventListener('storage', (event) => {
        if (event.key === 'playHistory') {
            loadHistory();
        }
    });
});
</script>
<template>
    <div class="flex column" id="historyPage">
        <div class="flex row" id="historyHeader">
            <div id="songlistCoverContainer">
                <img :src="historyCover" id="songlistCover"/>
                <img src="/images/library/historyCover.png" id="historyCoverMask"/>
            </div>
            <div class="flex column" id="historyInfo">
                <div class="flex column">
                    <label class="text xxlarge bold">播放历史</label>
                    <label class="text ultraSmall grey">{{ `共 ${history.length} 首` }}</label>
                    <label class="text ultraSmall" id="listDescription">此处记录了您在 Arcanum Music 中的播放记录</label>
                </div>
                <div class="flex row" id="historyButtonGroup">
                    <button class="flex row listButton" id="playAllContent" @click="playHistory">
                        <img class="outlineImage" src="/images/player/play.dark.svg"></img>
                        <label class="text small bold">播放</label>
                    </button>
                    <button class="flex row listButton" id="playAllContent" @click="clearHistory">
                        <img class="outlineImage" src="/images/library/clearHistory.svg"></img>
                        <label class="text small bold">清空</label>
                    </button>
                </div>
            </div>
        </div>
        <div id="historyContainer">
            <template v-for="entry in groupedHistory" :key="entry.type === 'label' ? `label_${entry.text}` : `history_${entry.data.id}`">
                <label v-if="entry.type === 'label'" class="text ultraSmall grey historyTimeTag">{{ entry.text }}</label>
                <SongInfoLine v-else
                    :id="`history_${entry.data.id}`"
                    :name="entry.data.name"
                    :authors="entry.data.authors"
                    :cover-url="entry.data.coverUrl"
                    :duration="entry.data.duration"
                />
            </template>
            <label v-if="history.length === 0" class="text small grey">暂无播放历史, 快去添加一些歌曲吧</label>
        </div>
    </div>
</template>
