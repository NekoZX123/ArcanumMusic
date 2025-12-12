<script setup lang="ts">
// Songlist.vue
// 歌单 / 专辑详情页面

import { onMounted, ref } from 'vue';

import './songlistStyle.css';

import { getAccountInfo } from '../../assets/utilities/accountManager.ts';
import { addSongLine } from '../../assets/utilities/elementControl.ts';
import { formatAuthors, getRequestFormat, parseMusicData } from '../../assets/utilities/dataParsers.ts';
import type { AxiosResponse } from 'axios';
import { getPlayer } from '../../assets/player/player.ts';

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
const platform = ref('');
const typeName = ref('');

// 数据请求及解析
function loadListContent(platform: string, module: 'songList' | 'album' | 'rankingContent', dataId: string, cookies: object) {
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
            console.log(listInfo);

            // 获取歌单内容
            if (platform !== 'netease') {
                listInfo.tracks = listInfo.loadTracks;
            }
            const listTracks = listInfo.tracks;
            const listContent: any[] = [];
            listTracks.forEach((track: any) => {
                if (typeof track !== 'object') {
                    const musicId = `music-${platform}-${track}`;
                    listContent.push(musicId);
                }
                else {
                    if (platform === 'kugou' && track.songCover) {
                        track.songCover = track.songCover.replace('{size}', '500');
                    }
                    listContent.push({
                        id: `music-${platform}-${track.songId}`,
                        name: track.songName,
                        coverUrl: track.songCover || './images/library/player/testAlbum.png',
                        authors: track.songAuthors,
                        duration: track.songDuration
                    });
                }
            });
            listMetaData.value.content = listContent;

            // 设置歌单信息
            listMetaData.value.name = listInfo.name;
            listMetaData.value.cover = listInfo.cover;
            listMetaData.value.description = listInfo.description;
            listMetaData.value.author = listInfo.author;
            if (platform === 'kugou' && typeof listInfo.author === 'object') {
                listMetaData.value.author = formatAuthors(listInfo.author, 'kugou');
            }
            listMetaData.value.songCount = listInfo.songCount;

            const loadContents = listInfo.loadTracks;
            const listContentContainer = document.getElementById('songlistContent') as HTMLElement;
            // console.log(loadContents);
            loadContents.forEach((songInfo: any) => {
                // 获取歌曲信息
                const songId = `music-${platform}-${songInfo.songId}`;
                const songName = songInfo.songName;
                const songCover = songInfo.songCover;
                const songAuthors = songInfo.songAuthors;
                const songDuration = songInfo.songDuration;

                addSongLine(listContentContainer, songId, songName, songCover, songAuthors, songDuration);
            });
        });
}

function playCurrentList() {
    getPlayer()?.playByList(listMetaData.value.content);
}

onMounted(() => {
    const userData = getAccountInfo('all');

    console.log(props.id);
    // 解析歌单 ID
    const properties = props.id.replace('new_', '').split('-');
    const type = properties[0]; // 类型 (歌单 / 专辑 / 排行榜)
    const platformName = properties[1]; // 平台名
    const listId = properties[2]; // 歌单/专辑 ID

    const module = (type === 'ranking') ? 'rankingContent' : ( type === 'album' ? 'album' : 'songList' );
    listType.value = module;
    typeName.value = (type === 'ranking') ? 'Ranking' : ( type === 'album' ? 'Album' : 'Songlist' );
    platform.value = platformName;

    // 加载列表内容
    loadListContent(platformName, module, listId, userData[platformName].cookies);

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
                <button class="flex row listButton" id="playAllContent" @click="playCurrentList">
                    <img class="outlineImage" src="/images/player/play.dark.svg"></img>
                    <label class="text small bold">播放</label>
                </button>
            </div>
        </div>
        <div class="flex column" id="songlistContent"></div>
        <div id="bottomBanner"></div>
    </div>
</template>
