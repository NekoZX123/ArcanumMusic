<script setup lang="ts">
// Songlist.vue
// 单曲详情页面

import { onMounted, ref } from 'vue';

import './singleStyle.css';

import { SongInfoLine } from '../../assets/widgets/Widgets';

const songMetaData = ref({
    name: '单曲名称',
    author: 'NekoZX123'
});

const props = defineProps(
    {
        id: {
            type: String,
            required: true
        }
    }
);

onMounted(() => {
    console.log(`Single.vue loaded with music id ${props.id}`);
});
</script>
<template>
    <div class="flex column" id="singlePage">
        <div class="flex row" id="singleInfo">
            <img src="/images/player/testAlbum.png" id="singleCover"/>
            <div class="flex column" id="songDetails">
                <label class="text xxlarge bold">{{ songMetaData.name }}</label>
                <label class="text ultraSmall grey">单曲</label>
                <label class="text medium">Single by {{ songMetaData.author }}</label>
            </div>
        </div>
        <div class="flex column" id="content">
            <SongInfoLine name="Test001" authors="NekoZX123" cover-url="/images/player/testAlbum.png" :duration="114"></SongInfoLine>
        </div>
    </div>
</template>
