<script setup lang="ts">
import { onMounted } from 'vue';
import { SongCard } from '../../assets/widgets/Widgets.tsx';

import './collectionsStyle.css';

const props = defineProps({
    title: {
        type: String,
        required: false,
        default: '单曲集锦'
    },
    type: {
        type: String,
        required: false,
        default: 'artist'
    }
});

onMounted(() => {
    console.log('SingleCollections.vue loaded')
});
</script>
<template>
    <div class="flex column" id="collectionsPage">
        <label class="text large bold" id="collectionsTitle">{{ props.title }}</label>
        <div :class="`flex row collectionsContent ${props.type}`">
            <SongCard id="music@netease.2147483647" cover-url="/images/player/testAlbum.png" name="Song 01" authors="NekoZX123"></SongCard>
            <SongCard id="music@netease.2147483648" cover-url="/images/player/testAlbum.png" name="Song 02" authors="Author02"></SongCard>
            <SongCard id="music@netease.2147483649" cover-url="/images/player/testAlbum.png" name="Song 03" authors="Author03"></SongCard>
            <SongCard id="music@netease.2147483650" cover-url="/images/player/testAlbum.png" name="Song 04" authors="Author04"></SongCard>

            <SongCard id="music@netease.2147483651" cover-url="/images/player/testAlbum.png" name="Song 05" authors="Author05"></SongCard>
            <SongCard id="music@netease.2147483652" cover-url="/images/player/testAlbum.png" name="Song 06" authors="Author06"></SongCard>
            <SongCard id="music@netease.2147483653" cover-url="/images/player/testAlbum.png" name="Song 07" authors="Author07"></SongCard>
            <SongCard id="music@netease.2147483654" cover-url="/images/player/testAlbum.png" name="Song 08" authors="Author08"></SongCard>

            <SongCard id="music@netease.2147483655" cover-url="/images/player/testAlbum.png" name="Song 09" authors="Author09"></SongCard>
            <SongCard id="music@netease.2147483656" cover-url="/images/player/testAlbum.png" name="Song 10" authors="Author10"></SongCard>
            <SongCard id="music@netease.2147483657" cover-url="/images/player/testAlbum.png" name="Song 11" authors="Author11"></SongCard>
            <SongCard id="music@netease.2147483658" cover-url="/images/player/testAlbum.png" name="Song 12" authors="Author12"></SongCard>

            <SongCard id="music@netease.2147483659" cover-url="/images/player/testAlbum.png" name="Song 13" authors="Author13"></SongCard>
            <SongCard id="music@netease.2147483660" cover-url="/images/player/testAlbum.png" name="Song 14" authors="Author14"></SongCard>
            <SongCard id="music@netease.2147483661" cover-url="/images/player/testAlbum.png" name="Song 15" authors="Author15"></SongCard>
        </div>
    </div>
</template>
