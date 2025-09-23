<script setup lang="ts">
import { getPlayer } from '../../assets/player/player';
import { SongInfoLine } from '../../assets/widgets/Widgets';
import './playlistStyle.css';

</script>
<template>
    <div class="flex column" id="playlistPage">
        <div class="playlistPart flex column" id="currentSong">
            <label class="text large bold playlistSubtitle">正在播放</label>
            <SongInfoLine 
                v-if="`playlist_current_${getPlayer()?.playlist.current.id}`"
                :id="`playlist_current_${getPlayer()?.playlist.current.id}`" 
                :name="getPlayer()?.playlist.current.name" 
                :authors="getPlayer()?.playlist.current.authors" 
                :cover-url="getPlayer()?.playlist.current.coverUrl" 
                :duration="getPlayer()?.playlist.current.duration"
            />
        </div>
        <div class="playlistPart flex column" id="songsCutInLine">
            <label class="text large bold playlistSubtitle">插队播放</label>
            <SongInfoLine
                v-for="song in getPlayer()?.playlist.breakIn"
                :key="`playlist_cutin_${song.id}`"
                :id="`playlist_cutin_${song.id}`"
                :name="song.name"
                :authors="song.authors"
                :cover-url="song.coverUrl"
                :duration="song.duration"
            />
        </div>
        <div class="playlistPart flex column" id="songsCutInLine">
            <label class="text large bold playlistSubtitle">播放列表</label>
            <SongInfoLine
                v-for="song in getPlayer()?.playlist.waitList"
                :key="`playlist_${song.id}`"
                :id="`playlist_${song.id}`"
                :name="song.name"
                :authors="song.authors"
                :cover-url="song.coverUrl"
                :duration="song.duration"
            />
        </div>
    </div>
</template>
