<script setup lang="ts">
// Songlist.vue
// 歌单 / 专辑详情页面

import { onMounted, ref } from 'vue';

import './songlistStyle.css';

import { SongInfoLine } from '../../assets/widgets/Widgets';

const listMetaData = ref({
    name: '歌单名称',
    author: 'NekoZX123',
    description: 'Songlist description 1145141919810 1145141919810 1145141919810',
    content: ['music@netease.114514', 'music@netease.178135131', 'music@netease.48143547']
});

const props = defineProps(
    {
        id: {
            type: String,
            required: true
        }
    }
);

const listType = ref('');

onMounted(() => {
    listType.value = props.id.includes('album') ? 'Album' : 'Songlist';

    console.log(`Songlist.vue loaded with songlist id ${props.id}`);
});
</script>
<template>
    <div class="flex column" id="songlistPage">
        <div class="flex row" id="songlistInfo">
            <img src="/images/player/testAlbum.png" id="songlistCover"/>
            <div class="flex column" id="songlistDetails">
                <label class="text xxlarge bold">{{ listMetaData.name }}</label>
                <label class="text ultraSmall grey">{{ listType === 'Album' ? '专辑' : '歌单' }}</label>
                <label class="text medium">{{ listType }} by {{ listMetaData.author }}</label>
                <label class="text small">{{ listMetaData.description }}</label>
            </div>
        </div>
        <div class="flex column" id="songlistContent">
            <SongInfoLine name="Test001" authors="NekoZX123" cover-url="/images/player/testAlbum.png" :duration="114"></SongInfoLine>
            <SongInfoLine name="Test002" authors="NekoZX123" cover-url="/images/player/testAlbum.png" :duration="514"></SongInfoLine>
            <SongInfoLine name="Test003" authors="NekoZX123" cover-url="/images/player/testAlbum.png" :duration="60"></SongInfoLine>
            <SongInfoLine name="Test114" authors="114514" cover-url="/images/player/testAlbum.png" :duration="100"></SongInfoLine>
            <SongInfoLine name="Test514" authors="1919810" cover-url="/images/player/testAlbum.png" :duration="300"></SongInfoLine>
        </div>
    </div>
</template>
