<script setup lang="ts">
import { SongInfoLine } from '../../assets/widgets/Widgets';
import './playlistStyle.css';

</script>
<template>
    <div class="flex column" id="playlistPage">
        <div class="playlistPart flex column" id="currentSong">
            <label class="text large bold playlistSubtitle">正在播放</label>
            <SongInfoLine name="Arcanum" authors="NekoZX123" cover-url="/images/player/testAlbum.png" :duration="114"></SongInfoLine>
        </div>
        <div class="playlistPart flex column" id="songsCutInLine">
            <label class="text large bold playlistSubtitle">插队播放</label>
            <SongInfoLine name="Cut in Line" authors="123456" cover-url="/images/player/testAlbum.png" :duration="514"></SongInfoLine>
        </div>
        <div class="playlistPart flex column" id="songsCutInLine">
            <label class="text large bold playlistSubtitle">播放列表</label>
            <SongInfoLine name="Test1" authors="114514" cover-url="/images/player/testAlbum.png" :duration="100"></SongInfoLine>
            <SongInfoLine name="Test2" authors="1919810" cover-url="/images/player/testAlbum.png" :duration="200"></SongInfoLine>
        </div>
    </div>
</template>
