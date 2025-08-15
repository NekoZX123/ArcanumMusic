<script setup lang="ts">
import { onMounted } from 'vue';

import './collectionsStyle.css';
import { getAccountInfo } from '../../assets/utilities/accountManager';
import { addArtistCard } from '../../assets/utilities/elementControl';
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

onMounted(() => {
    const userData = getAccountInfo('all');

    const requestFunc: Record<string, any> = {
        'netease': getNeteaseResult,
        'qqmusic': getQQmusicResult,
        'kuwo': getKuwoResult,
        'kugou': getKugouResult
    }

    // 获取内容组件
    const container = document.getElementById('collections') as HTMLElement;
    const loadedArtists: string[] = [];
    Object.keys(requestFunc).forEach((platform: string) => {
        const sendRequest = requestFunc[platform];
        sendRequest('recommendArtist', {}, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                // 解析数据
                const recommendations = parseMusicData(response, platform, 'recommendArtist');
                // console.log(recommendations);
                // 展示数据
                const artistList = recommendations.artistList;

                artistList.forEach((artistInfo: any) => {
                    if (loadedArtists.includes(artistInfo.artistName)) {
                        return;
                    }

                    const artistId = `artist-${platform}-${artistInfo.artistId}`;
                    const artistName = artistInfo.artistName;
                    const artistCover = artistInfo.artistCover;
                    loadedArtists.push(artistName);

                    addArtistCard(container, artistId, artistName, artistCover);
                });
            });
    });

    console.log(`ArtistCollections.vue loaded with params ${JSON.stringify(props)}`);
});
</script>
<template>
    <div class="flex column" id="collectionsPage">
        <label class="text large bold" id="collectionsTitle">{{ props.title }}</label>
        <div :class="`flex row collectionsContent artist`" id="collections"></div>
    </div>
</template>
