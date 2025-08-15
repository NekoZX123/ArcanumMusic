<script setup lang="ts">
import { onMounted } from 'vue';

import './collectionsStyle.css';
import { getAccountInfo } from '../../assets/utilities/accountManager.ts';
import type { AxiosResponse } from 'axios';
import { getKugouResult } from '../../assets/scripts/kugou/kugouRequest.ts';
import { getKuwoResult } from '../../assets/scripts/kuwo/kuwoRequest.ts';
import { getNeteaseResult } from '../../assets/scripts/netease/neteaseRequest.ts';
import { getQQmusicResult } from '../../assets/scripts/qqmusic/qqmusicRequest.ts';
import { parseMusicData } from '../../assets/utilities/dataParsers.ts';
import { addSongCard } from '../../assets/utilities/elementControl.ts';

const props = defineProps({
    title: {
        type: String,
        required: false,
        default: '单曲集锦'
    },
    module: {
        type: String,
        required: false,
        default: 'recommendSongs'
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
    };

    // 推荐单曲
    if (moduleName === 'recommendSong') {
        const loadedRecommendSongs: string[] = [];
        Object.keys(requestFunc).forEach((platform: string) => {
            const sendRequest = requestFunc[platform];
            sendRequest('recommendSong', {}, userData[platform].cookies)
                .then((response: AxiosResponse)=> {
                    // 解析数据
                    const recommendations = parseMusicData(response, platform, 'recommendSong');
                    // 展示数据
                    const songs = recommendations.songList;
                    for (let i = 0; i < songs.length; i++) {
                        let skips = 1;
                        let songDetail = songs[i];

                        if (loadedRecommendSongs.includes(songDetail.songName)) {
                            while (loadedRecommendSongs.includes(songDetail.songName)) {
                                songDetail = songs[skips+1];
                                skips++;
                            }
                        }

                        const songId = `songlist-${platform}-${songDetail.songId}`;
                        const songName = songDetail.songName;
                        const songCover = songDetail.songCover;
                        const songAuthors = songDetail.songAuthors
                        loadedRecommendSongs.push(songName);

                        addSongCard(container, songId, songName, songCover, songAuthors);
                    }
                });
        });
    }
    // 新歌曲
    if (moduleName === 'newSong') {
        const loadedSongs: string[] = [];
        Object.keys(requestFunc).forEach((platform: string) => {
            const sendRequest = requestFunc[platform];
            sendRequest('newSong', {}, userData[platform].cookies)
                .then((response: AxiosResponse) => {
                    // 解析数据
                    // console.log(response.data);
                    const recommendations = parseMusicData(response, platform, 'newSong');
                    // console.log(recommendations);
                    // 展示数据
                    const songs = recommendations.songList;

                    for (let i = 0; i < songs.length; i++) {
                        let songInfo = songs[i];
                        let skips = 1;
                        
                        if (loadedSongs.includes(songInfo.songName)) {
                            while (loadedSongs.includes(songInfo.songName)) {
                                songInfo = songs[i + skips];
                                skips ++;
                            }
                        }

                        const songId = `music-${platform}-${songInfo.songId}`;
                        const songName = songInfo.songName;
                        const songCover = songInfo.songCover;
                        const songAuthors = songInfo.songAuthors;

                        loadedSongs.push(songName);

                        addSongCard(container, songId, songName, songCover, songAuthors);
                    }
                });
        });
    }
    // 歌手歌曲
    if (moduleName === 'artistSongs') {
        const platform = parsedModule[1];
        const artistId = parsedModule[2];

        let reqModule = 'artist';
        if (['netease', 'kuwo'].includes(platform)) {
            reqModule = 'artistSongs';
        }

        const sendRequest = requestFunc[platform];
        sendRequest(reqModule, { artistId: artistId }, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                // 解析数据
                // console.log(response.data);
                const songList = parseMusicData(response, platform, 'artistSongs');
                // console.log(songList);
                // 展示数据
                const songs = songList.songList;

                for (let i = 0; i < songs.length; i++) {
                    let songInfo = songs[i];
                    const songId = `music-${platform}-${songInfo.songId}`;
                    const songName = songInfo.songName;
                    const songCover = songInfo.songCover;
                    const songAuthors = songInfo.songAuthors;

                    addSongCard(container, songId, songName, songCover, songAuthors);
                }
            });
    }

    console.log(`SingleCollections.vue loaded with params ${JSON.stringify(props)}`);;
});
</script>
<template>
    <div class="flex column" id="collectionsPage">
        <label class="text large bold" id="collectionsTitle">{{ props.title }}</label>
        <div :class="`flex row collectionsContent single`" id="collections"></div>
    </div>
</template>
