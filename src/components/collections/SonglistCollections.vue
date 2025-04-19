<script setup lang="ts">
import { onMounted } from 'vue';
import { SonglistCard } from '../../assets/widgets/Widgets.tsx';

import './collectionsStyle.css';

const props = defineProps({
    title: {
        type: String,
        required: false,
        default: '歌单集锦'
    },
    type: {
        type: String,
        required: false,
        default: 'artist'
    }
});

onMounted(() => {
    console.log('SonglistCollections.vue loaded')
});
</script>
<template>
    <div class="flex column" id="collectionsPage">
        <label class="text large bold" id="collectionsTitle">{{ props.title }}</label>
        <div :class="`flex row collectionsContent ${props.type}`">
            <SonglistCard id="songlist@netease.1" cover-url="/images/player/testAlbum.png" name="Songlist 1"></SonglistCard>
            <SonglistCard id="songlist@netease.2" cover-url="/images/player/testAlbum.png" name="Songlist 2"></SonglistCard>
            <SonglistCard id="songlist@netease.3" cover-url="/images/player/testAlbum.png" name="Songlist 3"></SonglistCard>
            <SonglistCard id="songlist@netease.4" cover-url="/images/player/testAlbum.png" name="Songlist 4"></SonglistCard>
            <SonglistCard id="songlist@netease.5" cover-url="/images/player/testAlbum.png" name="Songlist 5"></SonglistCard>

            <SonglistCard id="songlist@netease.6" cover-url="/images/player/testAlbum.png" name="Songlist 6"></SonglistCard>
            <SonglistCard id="songlist@netease.7" cover-url="/images/player/testAlbum.png" name="Songlist 7"></SonglistCard>
            <SonglistCard id="songlist@netease.8" cover-url="/images/player/testAlbum.png" name="Songlist 8"></SonglistCard>
            <SonglistCard id="songlist@netease.9" cover-url="/images/player/testAlbum.png" name="Songlist 9"></SonglistCard>
            <SonglistCard id="songlist@netease.10" cover-url="/images/player/testAlbum.png" name="Songlist 10"></SonglistCard>

            <SonglistCard id="songlist@netease.11" cover-url="/images/player/testAlbum.png" name="Songlist 11"></SonglistCard>
            <SonglistCard id="songlist@netease.12" cover-url="/images/player/testAlbum.png" name="Songlist 12"></SonglistCard>
            <SonglistCard id="songlist@netease.13" cover-url="/images/player/testAlbum.png" name="Songlist 13"></SonglistCard>
            <SonglistCard id="songlist@netease.14" cover-url="/images/player/testAlbum.png" name="Songlist 14"></SonglistCard>
            <SonglistCard id="songlist@netease.15" cover-url="/images/player/testAlbum.png" name="Songlist 15"></SonglistCard>
        </div>
    </div>
</template>
