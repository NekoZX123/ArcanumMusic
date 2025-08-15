<script setup lang="ts">
import { onMounted } from 'vue';

import './collectionsStyle.css';
import { getNeteaseResult } from '../../assets/scripts/netease/neteaseRequest';
import { getQQmusicResult } from '../../assets/scripts/qqmusic/qqmusicRequest';
import type { AxiosResponse } from 'axios';
import { getKugouResult } from '../../assets/scripts/kugou/kugouRequest';
import { getKuwoResult } from '../../assets/scripts/kuwo/kuwoRequest';
import { parseMusicData } from '../../assets/utilities/dataParsers';
import { addSonglistCard } from '../../assets/utilities/elementControl';
import { getAccountInfo } from '../../assets/utilities/accountManager';

const props = defineProps({
    title: {
        type: String,
        required: false,
        default: '歌单集锦'
    },
    module: {
        type: String,
        required: false,
        default: 'hotLists'
    }
});

onMounted(() => {
    const userData = getAccountInfo('all');

    const parsedModule = props.module.split('-');
    const moduleName = parsedModule[0];

    // 获取内容组件
    const container = document.getElementById('collections') as HTMLElement;

    const requestFunc: Record<string, any> = {
        'netease': getNeteaseResult,
        'qqmusic': getQQmusicResult,
        'kuwo': getKuwoResult,
        'kugou': getKugouResult
    }

    // 推荐歌单
    if (moduleName === 'hotList') {
        Object.keys(requestFunc).forEach((platform: string) => {
            const sendRequest = requestFunc[platform];
            sendRequest('hotList', {}, userData[platform].cookies)
                .then((response: AxiosResponse)=> {
                    // 解析数据
                    const recommendations = parseMusicData(response, platform, 'hotList');
                    // 展示数据
                    const songLists = recommendations.lists;
                    for (let i = 0; i < 10; i++) {
                        const listDetail = songLists[i];

                        const listId = `songlist-${platform}-${listDetail.listId}`;
                        const listName = listDetail.listName;
                        const listCover = listDetail.listCover;

                        addSonglistCard(container, listId, listName, listCover);
                    }
                });
        });
    }
    // 排行榜
    if (moduleName === 'rankings') {
        Object.keys(requestFunc).forEach((platform: string) => {
            const sendRequest = requestFunc[platform];
            sendRequest('rankings', {}, userData[platform].cookies)
                .then((response: AxiosResponse) => {
                    const rankings = parseMusicData(response, platform, 'rankings');
                    const rankingList = rankings.rankingList;

                    rankingList.forEach((rankingInfo: any) => {
                        const rankingId = `ranking-${platform}-${rankingInfo.rankingId.toString()}`;
                        const rankingName = rankingInfo.rankingName;
                        const rankingCover = rankingInfo.rankingCover;

                        addSonglistCard(container, rankingId, rankingName, rankingCover);
                    });
                });
        });
    }
    // 新专辑
    if (moduleName === 'newAlbum') {
        Object.keys(requestFunc).forEach((platform: string) => {
            const sendRequest = requestFunc[platform];
            sendRequest('newAlbum', {}, userData[platform].cookies)
                .then((response: AxiosResponse) => {
                    // console.log(response.data);
                    const albums = parseMusicData(response, platform, 'newAlbum');
                    const albumList = albums.albumList;

                    albumList.forEach((albumInfo: any) => {
                        const albumId = `album-${platform}-${albumInfo.albumId}`;
                        const albumName = albumInfo.albumName;
                        const albumCover = albumInfo.albumCover;

                        addSonglistCard(container, albumId, albumName, albumCover);
                    });
                });
        });
    }
    // 歌手专辑
    if (moduleName === 'artistAlbum') {
        const platform = parsedModule[1];
        const artistId = parsedModule[2];
        const sendRequest = requestFunc[platform];

        let reqModule = 'artist';
        if (['kuwo', 'kugou'].includes(platform)) {
            reqModule = 'artistAlbum';
        }

        sendRequest(reqModule, { artistId: artistId }, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                console.log(response.data);
                const albums = parseMusicData(response, platform, 'artistAlbum');
                // console.log(albums);
                const albumList = albums.albumList;

                albumList.forEach((albumInfo: any) => {
                    const albumId = `album-${platform}-${albumInfo.albumId}`;
                    const albumName = albumInfo.albumName;
                    const albumCover = albumInfo.albumCover;

                    addSonglistCard(container, albumId, albumName, albumCover);
                });
            });
    }

    console.log(`SonglistCollections.vue loaded with params ${JSON.stringify(props)}`);
});
</script>
<template>
    <div class="flex column" id="collectionsPage">
        <label class="text large bold" id="collectionsTitle">{{ props.title }}</label>
        <div :class="`flex row collectionsContent songlist`" id="collections"></div>
    </div>
</template>
