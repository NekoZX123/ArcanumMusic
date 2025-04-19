<script setup lang="ts">
import { onMounted } from 'vue';
import { ArtistCard } from '../../assets/widgets/Widgets';

import './collectionsStyle.css';

const props = defineProps({
    title: {
        type: String,
        required: false,
        default: '歌手集锦'
    },
    type: {
        type: String,
        required: false,
        default: 'artist'
    }
});

onMounted(() => {
    console.log('ArtistCollections.vue loaded')
});
</script>
<template>
    <div class="flex column" id="collectionsPage">
        <label class="text large bold" id="collectionsTitle">{{ props.title }}</label>
        <div :class="`flex row collectionsContent ${props.type}`">
            <ArtistCard id="artist@netease.123456" cover-url="/images/player/testAlbum.png" name="NekoZX123"></ArtistCard>
            <ArtistCard id="artist@netease.123457" cover-url="/images/player/testAlbum.png" name="ArtistOne"></ArtistCard>
            <ArtistCard id="artist@netease.123458" cover-url="/images/player/testAlbum.png" name="ArtistTwo"></ArtistCard>
            <ArtistCard id="artist@netease.123459" cover-url="/images/player/testAlbum.png" name="ArtistThree"></ArtistCard>
            <ArtistCard id="artist@netease.123460" cover-url="/images/player/testAlbum.png" name="ArtistFour"></ArtistCard>

            <ArtistCard id="artist@netease.123461" cover-url="/images/player/testAlbum.png" name="ArtistFive"></ArtistCard>
            <ArtistCard id="artist@netease.123462" cover-url="/images/player/testAlbum.png" name="ArtistSix"></ArtistCard>
            <ArtistCard id="artist@netease.123463" cover-url="/images/player/testAlbum.png" name="ArtistSeven"></ArtistCard>
            <ArtistCard id="artist@netease.123464" cover-url="/images/player/testAlbum.png" name="ArtistEight"></ArtistCard>
            <ArtistCard id="artist@netease.123465" cover-url="/images/player/testAlbum.png" name="ArtistNine"></ArtistCard>

            <ArtistCard id="artist@netease.123466" cover-url="/images/player/testAlbum.png" name="ArtistTen"></ArtistCard>
            <ArtistCard id="artist@netease.123467" cover-url="/images/player/testAlbum.png" name="ArtistEleven"></ArtistCard>
            <ArtistCard id="artist@netease.123468" cover-url="/images/player/testAlbum.png" name="ArtistTwelve"></ArtistCard>
            <ArtistCard id="artist@netease.123469" cover-url="/images/player/testAlbum.png" name="ArtistThirteen"></ArtistCard>
            <ArtistCard id="artist@netease.123470" cover-url="/images/player/testAlbum.png" name="ArtistFourteen"></ArtistCard>
        </div>
    </div>
</template>
