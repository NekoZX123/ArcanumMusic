<script setup lang="ts">
// Songlist.vue
// 单曲详情页面

import { onMounted, ref } from 'vue';

import './singleStyle.css';

import { SongInfoLine } from '../../assets/widgets/Widgets';
import { getAccountInfo } from '../../assets/utilities/accountManager';
import { getRequestFormat, parseMusicData } from '../../assets/utilities/dataParsers';
import type { AxiosResponse } from 'axios';

const songMetaData = ref({
    name: '单曲名称',
    cover: '/images/player/testAlbum.png',
    authors: 'NekoZX123',
    duration: 0
});

const props = defineProps(
    {
        id: {
            type: String,
            required: true
        }
    }
);

function loadSongInfo(platform: string, songId: string, cookies: object) {
    const platformRequest = getRequestFormat();

    if (!platformRequest[platform]) {
        console.error(`[ERROR] Unsupported platform ${platform}`);
        return;
    }
    const requestFunc = platformRequest[platform].function;
    const params = platformRequest[platform].data.songInfo;
    const paramString = JSON.stringify(params).replace('[data]', songId);
    let formData = JSON.parse(paramString);

    requestFunc('songInfo', formData, cookies)
        .then((response: AxiosResponse) => {
            // console.log(platform, response.data);
            const songInfo = parseMusicData(response, platform, 'songInfo');

            songMetaData.value.name = songInfo.songName;
            songMetaData.value.cover = songInfo.songCover;
            songMetaData.value.authors = songInfo.songAuthors;
            songMetaData.value.duration = songInfo.songDuration;
        })
}

onMounted(() => {
    const userData = getAccountInfo('all');

    // 解析歌曲 ID
    const properties = props.id.split('-');
    const platformName = properties[1]; // 平台名
    const songId = properties[2]; // 歌曲 ID
    
    loadSongInfo(platformName, songId, userData[platformName].cookies);

    console.log(`Single.vue loaded with music id ${props.id}`);
});
</script>
<template>
    <div class="flex column" id="singlePage">
        <div class="flex row" id="singleInfo">
            <img :src="songMetaData.cover" id="singleCover"/>
            <div class="flex column" id="songDetails">
                <label class="text xxlarge bold">{{ songMetaData.name }}</label>
                <label class="text ultraSmall grey">单曲</label>
                <label class="text medium">Single by {{ songMetaData.authors }}</label>
            </div>
        </div>
        <div class="flex column" id="content">
            <SongInfoLine :name="songMetaData.name" :authors="songMetaData.authors" :cover-url="songMetaData.cover" :duration="songMetaData.duration"></SongInfoLine>
        </div>
    </div>
</template>
