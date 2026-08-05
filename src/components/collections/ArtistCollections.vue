<script setup lang="ts">
import { onMounted } from 'vue';

import './collectionsStyle.css';
import { getAccountInfo } from '../../assets/user/accountManager';
import { addArtistCard } from '../../assets/ui/elementControl';
import { parseMusicData } from '../../assets/utilities/dataParsers';
import type { AxiosResponse } from 'axios';
import { getKugouResult } from '../../assets/scripts/kugou/kugouRequest';
import { getKuwoResult } from '../../assets/scripts/kuwo/kuwoRequest';
import { getNeteaseResult } from '../../assets/scripts/netease/neteaseRequest';
import { getQQmusicResult } from '../../assets/scripts/qqmusic/qqmusicRequest';

const props = defineProps({
    title: {
        type: String,
        required: false,
        default: '歌手集锦'
    },
    module: {
        type: String,
        required: false,
        default: 'artist'
    }
});

let currentPage = 0;
// 记录已加载的歌手ID，用于去重
const loadedArtistIds = new Set<string>();

function loadContent() {
    const userData = getAccountInfo('all');

    const requestFunc: Record<string, any> = {
        'netease': getNeteaseResult,
        'qqmusic': getQQmusicResult,
        'kuwo': getKuwoResult,
        'kugou': getKugouResult
    }

    // 获取内容组件
    const container = document.getElementById('collections') as HTMLElement;
    Object.keys(requestFunc).forEach((platform: string) => {
        const sendRequest = requestFunc[platform];
        sendRequest('recommendArtist', { maxLength: 20, pageIndex: currentPage }, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                // 解析数据
                const recommendations = parseMusicData(response, platform, 'recommendArtist');
                // console.log(recommendations);
                // 展示数据
                const artistList = recommendations.artistList;

                artistList.forEach((artistInfo: any) => {
                    const artistId = `artist-${platform}-${artistInfo.artistId}`;
                    // 检查是否已加载过
                    if (loadedArtistIds.has(artistId)) {
                        return;
                    }

                    const artistName = artistInfo.artistName;
                    const artistCover = artistInfo.artistCover;
                    loadedArtistIds.add(artistId);

                    addArtistCard(container, artistId, artistName, artistCover);
                });
            });
    });
}

function loadNextPage() {
    currentPage++;
    loadContent();
}

onMounted(() => {
    loadContent();

    console.log(`ArtistCollections.vue loaded with params ${JSON.stringify(props)}`);
});
</script>
<template>
    <div class="flex column" id="collectionsPage">
        <label class="text large bold" id="collectionsTitle">{{ props.title }}</label>
        <div :class="`flex row collectionsContent artist`" id="collections"></div>

        <!-- 查看更多 (下一页) 按钮 -->
        <button class="flex row listButton" id="loadMoreButton" @click="loadNextPage">
            <label class="text small bold">查看更多</label>
        </button>
    </div>
</template>
