<script setup lang="ts">
// Songlist.vue
// 歌单 / 专辑详情页面

import { onMounted, ref } from 'vue';

import './songlistStyle.css';

import { getAccountInfo } from '../../assets/utilities/accountManager.ts';
import { addSongLine } from '../../assets/utilities/elementControl.ts';
import { formatAuthors, getRequestFormat, parseMusicData } from '../../assets/utilities/dataParsers.ts';
import type { AxiosResponse } from 'axios';

// 歌单 / 专辑数据
const listMetaData = ref({
    name: '',
    cover: '',
    author: '',
    description: '',
    content: [''],
    songCount: NaN
});

// 页面参数
const props = defineProps(
    {
        id: {
            type: String,
            required: true
        }
    }
);

// 列表类型 (歌单 / 专辑)
const listType = ref('');
const typeName = ref('');

// 数据请求及解析
function requestListInfo(platform: string, module: 'songList' | 'album' | 'rankingContent', dataId: string, cookies: object) {
    const platformRequest = getRequestFormat();

    if (!platformRequest[platform]) {
        console.error(`[ERROR] Unsupported platform ${platform}`);
        return;
    }
    const requestFunc = platformRequest[platform].function;
    const params = platformRequest[platform].data[module];
    const paramString = JSON.stringify(params).replace('[data]', dataId).replace(`'[dataInt]'`, dataId);
    let formData = JSON.parse(paramString);

    // 预处理数据
    if (platformRequest[platform]['@processors']) {
        let processors = platformRequest[platform]['@processors'];
        if (Object.keys(processors).includes(module)) {
            const process = processors[module];
            formData = process(formData);
        }
    }

    // 请求数据
    requestFunc(module, formData, cookies)
        .then((response: AxiosResponse) => {
            // 解析歌单数据
            const listInfo: any = parseMusicData(response, platform, module);
            if (!listInfo) {
                console.error(`[ERROR] Unable to parse song list info (Platform ${platform}, param: ${dataId})`);
                return;
            }

            // 获取歌单内容
            const listTracks = listInfo.tracks;
            const listContent: string[] = [];
            listTracks.forEach((trackInfo: Record<string, any>) => {
                const musicId = `music-${platform}-${trackInfo}`;
                listContent.push(musicId);
            });

            // 设置歌单信息
            listMetaData.value.name = listInfo.name;
            listMetaData.value.cover = listInfo.cover;
            listMetaData.value.description = listInfo.description;
            listMetaData.value.author = listInfo.author;
            if (platform === 'kugou' && typeof listInfo.author === 'object') {
                listMetaData.value.author = formatAuthors(listInfo.author, 'kugou');
            }
            listMetaData.value.content = listContent;
            listMetaData.value.songCount = listInfo.songCount;

            const loadContents = listInfo.loadTracks;
            const listContentContainer = document.getElementById('songlistContent') as HTMLElement;
            loadContents.forEach((songInfo: any, index: number) => {
                // 获取歌曲信息
                const songId = listContent[index];
                const songName = songInfo.songName;
                const songCover = songInfo.songCover;
                const songAuthors = songInfo.songAuthors;
                const songDuration = songInfo.songDuration;

                addSongLine(listContentContainer, songId, songName, songCover, songAuthors, songDuration);
            });
        });
}

onMounted(() => {
    const userData = getAccountInfo('all');

    // 解析歌单 ID
    const properties = props.id.replace('new_', '').split('-');
    const type = properties[0]; // 类型 (歌单 / 专辑 / 排行榜)
    const platformName = properties[1]; // 平台名
    const listId = properties[2]; // 歌单/专辑 ID

    const module = (type === 'ranking') ? 'rankingContent' : ( type === 'album' ? 'album' : 'songList' );
    listType.value = module;
    typeName.value = (type === 'ranking') ? 'Ranking' : ( type === 'album' ? 'Album' : 'Songlist' );

    // 加载列表内容
    requestListInfo(platformName, module, listId, userData[platformName].cookies);

    console.log(`Songlist.vue loaded with songlist id ${props.id}`);
});
</script>
<template>
    <div class="flex column" id="songlistPage">
        <div class="flex row" id="songlistInfo">
            <img :src="listMetaData.cover" id="songlistCover"/>
            <div class="flex column" id="songlistDetails">
                <label class="text xxlarge bold">{{ listMetaData.name }}</label>
                <label class="text ultraSmall grey">{{ `${listType === 'Album' ? '专辑' : '歌单'} / 共 ${listMetaData.songCount} 首` }}</label>
                <label class="text medium">{{ typeName }} by {{ listMetaData.author }}</label>
                <label class="text ultraSmall" id="listDescription">{{ listMetaData.description }}</label>
            </div>
        </div>
        <div class="flex column" id="songlistContent"></div>
        <div id="bottomBanner"></div>
    </div>
</template>
