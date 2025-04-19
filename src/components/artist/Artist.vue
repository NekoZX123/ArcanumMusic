<script setup lang="ts">
// Songlist.vue
// 歌手详情页面

import { onMounted, ref } from 'vue';

import './artistStyle.css';
import { SongCard, SonglistCard } from '../../assets/widgets/Widgets';


const artistMetaData = ref({
    name: 'NekoZX123',
    description: 'NekoZX123 is an indepentent software developer'
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
    console.log(`Artist.vue loaded with music id ${props.id}`);
});
</script>
<template>
    <div class="flex column" id="artistPage">
        <div class="flex row" id="artistInfo">
            <img src="/images/library/defaultAvatar.svg" id="artistAvatar"/>
            <div class="flex column" id="artistDetails">
                <label class="text xxlarge bold">{{ artistMetaData.name }}</label>
                <label class="text ultraSmall grey">歌手</label>
                <label class="text small">{{ artistMetaData.description }}</label>
            </div>
        </div>
        <div class="flex column" id="artistCreations">
            <div class="flex column" id="newCreations">
                <label class="text large bold partTitle">最新作品</label>
                <div class="flex row artistWorksBox">
                    <div class="flex column" id="newSongs">
                        <SongCard id="music@netease.12345678" cover-url="/images/player/testAlbum.png" name="Song 01" authors="NekoZX123"></SongCard>
                        <SongCard id="music@netease.12345678" cover-url="/images/player/testAlbum.png" name="Song 01" authors="NekoZX123"></SongCard>
                        <SongCard id="music@netease.12345678" cover-url="/images/player/testAlbum.png" name="Song 01" authors="NekoZX123"></SongCard>
                    </div>
                    <div class="flex row" id="newAlbums">
                        <SonglistCard id="album@netease.1919810" cover-url="/images/player/testAlbum.png" name="Songlist"></SonglistCard>
                        <SonglistCard id="album@netease.1919810" cover-url="/images/player/testAlbum.png" name="Songlist"></SonglistCard>
                        <SonglistCard id="album@netease.1919810" cover-url="/images/player/testAlbum.png" name="Songlist"></SonglistCard>
                    </div>
                </div>
            </div>
            <div class="flex column" id="songHits">
                <label class="text large bold partTitle">热门歌曲</label>
                <div class="flex column artistWorksBox">
                    <span class="flex row">
                        <SongCard id="music@netease.12345678" cover-url="/images/player/testAlbum.png" name="Song 01" authors="NekoZX123"></SongCard>
                        <SongCard id="music@netease.12345678" cover-url="/images/player/testAlbum.png" name="Song 01" authors="NekoZX123"></SongCard>
                        <SongCard id="music@netease.12345678" cover-url="/images/player/testAlbum.png" name="Song 01" authors="NekoZX123"></SongCard>
                    </span>
                    <span class="flex row">
                        <SongCard id="music@netease.12345678" cover-url="/images/player/testAlbum.png" name="Song 01" authors="NekoZX123"></SongCard>
                        <SongCard id="music@netease.12345678" cover-url="/images/player/testAlbum.png" name="Song 01" authors="NekoZX123"></SongCard>
                        <SongCard id="music@netease.12345678" cover-url="/images/player/testAlbum.png" name="Song 01" authors="NekoZX123"></SongCard>
                    </span>
                </div>
            </div>
            <div class="flex column" id="albums">
                <label class="text large bold partTitle">专辑</label>
                <div class="flex row artistWorksBox">
                    <SonglistCard id="album@netease.1919810" cover-url="/images/player/testAlbum.png" name="Songlist"></SonglistCard>
                    <SonglistCard id="album@netease.1919810" cover-url="/images/player/testAlbum.png" name="Songlist"></SonglistCard>
                    <SonglistCard id="album@netease.1919810" cover-url="/images/player/testAlbum.png" name="Songlist"></SonglistCard>
                    <SonglistCard id="album@netease.1919810" cover-url="/images/player/testAlbum.png" name="Songlist"></SonglistCard>
                    <SonglistCard id="album@netease.1919810" cover-url="/images/player/testAlbum.png" name="Songlist"></SonglistCard>
                </div>
            </div>
        </div>
    </div>
</template>
