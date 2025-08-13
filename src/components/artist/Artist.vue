<script setup lang="ts">
// Songlist.vue
// 歌手详情页面

import { onMounted, ref, type Ref } from 'vue';

import './artistStyle.css';
import { changePage } from '../../assets/utilities/pageSwitcher.ts';
import { getAccountInfo } from '../../assets/utilities/accountManager.ts';
import { getNeteaseResult } from '../../assets/scripts/netease/neteaseRequest.ts';
import { addSongCard, addSonglistCard } from '../../assets/utilities/elementControl.ts';
import { formatAuthors } from '../../assets/utilities/dataParsers.ts';
import { getQQmusicResult } from '../../assets/scripts/qqmusic/qqmusicRequest.ts';
import { getKuwoResult } from '../../assets/scripts/kuwo/kuwoRequest.ts';
import { getKugouResult } from '../../assets/scripts/kugou/kugouRequest';

// 默认滑动量
const BOX_SCROLL_DISTANCE = 330;
// 向左滑动
function scrollLeft(event: MouseEvent) {
    let target = event.target as HTMLElement;
    if (target.tagName === 'IMG') target = target.parentElement as HTMLElement;

    const elementToscroll = target.nextSibling as HTMLElement;
    if (!elementToscroll) return;

    elementToscroll.scrollBy({ left: -BOX_SCROLL_DISTANCE, behavior: 'smooth' });
}
// 向右滑动
function scrollRight(event: MouseEvent) {
    let target = event.target as HTMLElement;
    if (target.tagName === 'IMG') target = target.parentElement as HTMLElement;

    const elementToscroll = target.previousSibling as HTMLElement;
    if (!elementToscroll) return;

    elementToscroll.scrollBy({ left: BOX_SCROLL_DISTANCE, behavior: 'smooth' });
}

const artistMetaData: Ref<{
    name: string,
    cover: string,
    description: string,
}> = ref({
    name: 'NekoZX123',
    cover: '/images/player/testAlbum.png',
    description: 'NekoZX123 is an indepentent software developer',
    newSong: [],
    newAlbums: [],
    hotTracks: [],
    albums: []
});

const props = defineProps(
    {
        id: {
            type: String,
            required: true
        }
    }
);

/**
 * 加载网易云歌手信息
 * @param artistId 歌手 ID
 * @param cookies 用户 Token
 */
function loadNeteaseArtist(artistId: string, cookies: { MUSIC_U: string }) {
    // 加载歌手信息及专辑
    getNeteaseResult('artist', { artistId: parseInt(artistId) }, cookies)
        .then((response) => {
            const data = response.data;
            if (data.code !== 200) {
                console.error(`[Error] Failed to get Netease artist info (artist id ${artistId}, code ${data.code})`);
            }
            
            // 获取基本信息
            artistMetaData.value.name = data.artist.name;
            artistMetaData.value.cover = data.artist.picUrl;
            artistMetaData.value.description = data.artist.briefDesc;

            // 最新 / 热门 专辑去重
            const loadedAlbums: string[] = [];
            // 获取最新专辑
            const newAlbumsContainer = document.getElementById('newAlbums') as HTMLElement;

            const albums = data.hotAlbums;
            const sortedAlbums = [...albums].sort((a, b) => {
                const toTime = (t: any) => new Date(t).getTime() || -Infinity;
                return toTime(b.publishTime) - toTime(a.publishTime);
            });
            for (let i = 0; i < 3; i++) {
                let albumInfo = sortedAlbums[i];

                const albumId = `album-netease-${albumInfo.id}`;
                const albumName = albumInfo.name;
                const albumCover = albumInfo.picUrl;

                loadedAlbums.push(albumName);
                
                addSonglistCard(newAlbumsContainer, albumId, albumName, albumCover, true);
            }

            // 获取热门专辑
            const hotAlbumsContainer = document.getElementById('hotAlbums') as HTMLElement;
            for (let i = 0; i < 8; i++) {
                let albumInfo = albums[i];

                let skips = 1;
                if (loadedAlbums.includes(albumInfo.name)) {
                    while (loadedAlbums.includes(albumInfo.name)) {
                        albumInfo = sortedAlbums[i + skips];
                        skips ++;
                    }
                }

                const albumId = `album-netease-${albumInfo.id}`;
                const albumName = albumInfo.name;
                const albumCover = albumInfo.picUrl;

                loadedAlbums.push(albumName);
                
                addSonglistCard(hotAlbumsContainer, albumId, albumName, albumCover);
            }
        });
    
    // 加载歌手歌曲
    getNeteaseResult('artistSongs', { artistId: parseInt(artistId) }, cookies)
        .then((response) => {
            const data = response.data;
            console.log(data);
            if (data.code !== 200) {
                console.error(`[Error] Failed to get Netease artist songs (artist id ${artistId}, code ${data.code})`);
            }

            // 最新 / 热门 歌曲去重
            const loadedSongs: string[] = [];
            // 获取最新歌曲
            const newSongContainer = document.getElementById('newSongs') as HTMLElement;
            
            const songs = data.songs;
            const sortedSongs = [...songs].sort((a, b) => {
                const toTime = (t: any) => new Date(t).getTime() || -Infinity;
                return toTime(b.publishTime) - toTime(a.publishTime);
            });
            for (let i = 0; i < 3; i++) {
                let songInfo = sortedSongs[i];

                const songId = `music-netease-${songInfo.id}`;
                const songName = songInfo.name;
                const songCover = songInfo.al.picUrl;
                const songAuthors = formatAuthors(songInfo.ar, 'netease');

                loadedSongs.push(songName);

                addSongCard(newSongContainer, songId, songName, songCover, songAuthors, true);
            }

            // 获取热门歌曲
            const hotSongContainer = document.getElementById('hotSongs') as HTMLElement;
            for (let i = 0; i < 9; i++) {
                let songInfo = songs[i];

                let skips = 1;
                if (loadedSongs.includes(songInfo.name)) {
                    while (loadedSongs.includes(songInfo.name)) {
                        songInfo = songs[i + skips];
                        skips ++;
                    }
                }

                const songId = `music-netease-${songInfo.id}`;
                const songName = songInfo.name;
                const songCover = songInfo.al.picUrl;
                const songAuthors = formatAuthors(songInfo.ar, 'netease');
                loadedSongs.push(songName);

                addSongCard(hotSongContainer, songId, songName, songCover, songAuthors);
            }
        });
}

/**
 * 加载QQ音乐歌手信息
 * @param artistId 歌手 ID
 * @param cookies 用户 Token
 */
function loadQQMusicArtist(artistId: string, cookies: { qm_keyst: string, uin: number }) {
    getQQmusicResult('artist', { artistId: artistId}, cookies)
        .then((response) => {
            const data = response.data;
            console.log(data);

            // 获取基本信息
            if (data.req_1.code === 0) {
                const artistInfo = data.req_1.data.singer_list[0];

                artistMetaData.value.name = artistInfo.basic_info.name;
                const pmid = artistInfo.basic_info.singer_pmid;
                artistMetaData.value.cover = `https://y.qq.com/music/photo_new/T001R300x300M000${pmid}.jpg`;
                artistMetaData.value.description = artistInfo.ex_info.desc;
            }
            else {
                console.error(`[Error] Failed to get qqmusic artist info (artistId=${artistId}, code ${data.req_1.code})`);
            }

            // 最新 / 热门 专辑去重
            const loadedAlbums: string[] = [];
            // 获取最新专辑
            const newAlbumsContainer = document.getElementById('newAlbums') as HTMLElement;

            if (data.req_2.code === 0) {
                const albums = data.req_2.data.albumList;
                const sortedAlbums = [...albums].sort((a, b) => {
                    const toTime = (t: any) => new Date(t).getTime() || -Infinity;
                    return toTime(b.publishDate) - toTime(a.publishDate);
                });
                for (let i = 0; i < 3; i++) {
                    let albumInfo = sortedAlbums[i];

                    const albumId = `album-qqmusic-${albumInfo.albumMid}`;
                    const albumName = albumInfo.albumName;
                    const albumCover = `https://y.qq.com/music/photo_new/T002R300x300M000${albumInfo.pmid}.jpg`;
                    loadedAlbums.push(albumName);
                    
                    addSonglistCard(newAlbumsContainer, albumId, albumName, albumCover, true);
                }

                // 获取热门专辑
                const hotAlbumsContainer = document.getElementById('hotAlbums') as HTMLElement;
                for (let i = 0; i < 8; i++) {
                    let albumInfo = albums[i];

                    let skips = 1;
                    if (loadedAlbums.includes(albumInfo.albumName)) {
                        while (loadedAlbums.includes(albumInfo.albumName)) {
                            albumInfo = sortedAlbums[i + skips];
                            skips ++;
                        }
                    }

                    const albumId = `album-qqmusic-${albumInfo.albumMid}`;
                    const albumName = albumInfo.albumName;
                    const albumCover = `https://y.qq.com/music/photo_new/T002R300x300M000${albumInfo.pmid}.jpg`;
                    loadedAlbums.push(albumName);
                    
                    addSonglistCard(hotAlbumsContainer, albumId, albumName, albumCover);
                }
            }
            else {
                console.error(`[Error] Failed to get qqmusic artist albums (artistId=${artistId}, code ${data.req_2.code})`);
            }

            // 最新 / 热门 歌曲去重
            const loadedSongs: string[] = [];
            // 获取最新歌曲
            const newSongContainer = document.getElementById('newSongs') as HTMLElement;
            
            if (data.req_3.code === 0)  {
                const songs = data.req_3.data.songList;
                const sortedSongs = [...songs].sort((a, b) => {
                    const toTime = (t: any) => new Date(t).getTime() || -Infinity;
                    return toTime(b.songInfo.time_public) - toTime(a.songInfo.time_public);
                });
                for (let i = 0; i < 3; i++) {
                    let songInfo = sortedSongs[i];

                    const songId = `music-qqmusic-${songInfo.songInfo.mid}`;
                    const songName = songInfo.songInfo.name;
                    const pmid = songInfo.songInfo.album.pmid;
                    const songCover = `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`;
                    const songAuthors = formatAuthors(songInfo.songInfo.singer, 'qqmusic');
                    loadedSongs.push(songName);

                    addSongCard(newSongContainer, songId, songName, songCover, songAuthors, true);
                }

                // 获取热门歌曲
                const hotSongContainer = document.getElementById('hotSongs') as HTMLElement;
                for (let i = 0; i < 9; i++) {
                    let songInfo = songs[i];

                    let skips = 1;
                    if (loadedSongs.includes(songInfo.name)) {
                        while (loadedSongs.includes(songInfo.name)) {
                            songInfo = songs[i + skips];
                            skips ++;
                        }
                    }

                    const songId = `music-qqmusic-${songInfo.songInfo.mid}`;
                    const songName = songInfo.songInfo.name;
                    const pmid = songInfo.songInfo.album.pmid;
                    const songCover = `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`;
                    const songAuthors = formatAuthors(songInfo.songInfo.singer, 'qqmusic');
                    loadedSongs.push(songName);

                    addSongCard(hotSongContainer, songId, songName, songCover, songAuthors);
                }
            }
            
        });
}

/**
 * 加载酷我音乐歌手信息
 * @param artistId 歌手 ID
 * @param cookies 用户 Token
 */
function loadKuwoArtist(artistId: string, cookies: { userid: string }) {
    // 获取基本信息
    getKuwoResult('artist', { artistId: artistId }, cookies)
        .then((response) => {
            const data = response.data;
            if (data.code !== 200) {
                console.error(`[Error] Failed to get artist info (artistId=${artistId}, code ${data.code})`);
                return;
            }

            const artistInfo = data.data;
            
            artistMetaData.value.name = artistInfo.name;
            artistMetaData.value.cover = artistInfo.pic300;
            artistMetaData.value.description = artistInfo.info;
        });
    // 获取最新 / 热门专辑
    getKuwoResult('artistAlbums', { artistId: artistId }, cookies)
        .then((response) => {
            const data = response.data;
            if (data.code !== 200) {
                console.error(`[Error] Failed to get artist albums (artistId=${artistId}, code ${data.code})`);
                return;
            }

            // 最新 / 热门 专辑去重
            const loadedAlbums: string[] = [];
            // 获取最新专辑
            const newAlbumsContainer = document.getElementById('newAlbums') as HTMLElement;

            const albums = data.data.albumList;
            const sortedAlbums = [...albums].sort((a, b) => {
                const toTime = (t: any) => new Date(t).getTime() || -Infinity;
                return toTime(b.releaseDate) - toTime(a.releaseDate);
            });
            for (let i = 0; i < 3; i++) {
                let albumInfo = sortedAlbums[i];

                const albumId = `album-kuwo-${albumInfo.albumid}`;
                const albumName = albumInfo.album;
                const albumCover = albumInfo.pic;
                loadedAlbums.push(albumName);
                
                addSonglistCard(newAlbumsContainer, albumId, albumName, albumCover, true);
            }

            // 获取热门专辑
            const hotAlbumsContainer = document.getElementById('hotAlbums') as HTMLElement;
            for (let i = 0; i < 8; i++) {
                let albumInfo = albums[i];

                let skips = 1;
                if (loadedAlbums.includes(albumInfo.albumName)) {
                    while (loadedAlbums.includes(albumInfo.albumName)) {
                        albumInfo = sortedAlbums[i + skips];
                        skips ++;
                    }
                }

                const albumId = `album-kuwo-${albumInfo.albumid}`;
                const albumName = albumInfo.album;
                const albumCover = albumInfo.pic;
                loadedAlbums.push(albumName);
                
                addSonglistCard(hotAlbumsContainer, albumId, albumName, albumCover);
            }
        });
    // 获取最新 / 热门歌曲
    getKuwoResult('artistSongs', { artistId: artistId }, cookies)
        .then((response) => {
            const data = response.data;
            if (data.code !== 200) {
                console.error(`[Error] Failed to get artist albums (artistId=${artistId}, code ${data.code})`);
                return;
            }

            // 最新 / 热门 歌曲去重
            const loadedSongs: string[] = [];
            // 获取最新歌曲
            const newSongContainer = document.getElementById('newSongs') as HTMLElement;

            const songs = data.data.list;
            const sortedSongs = [...songs].sort((a, b) => {
                const toTime = (t: any) => new Date(t).getTime() || -Infinity;
                return toTime(b.releasedate) - toTime(a.releasedate);
            });
            for (let i = 0; i < 3; i++) {
                let songInfo = sortedSongs[i];

                const songId = `music-kuwo-${songInfo.rid}`;
                const songName = songInfo.name;
                const songCover = songInfo.pic;
                const songAuthors = formatAuthors(songInfo.artist.split('&'), 'kuwo');
                loadedSongs.push(songName);

                addSongCard(newSongContainer, songId, songName, songCover, songAuthors, true);
            }

            // 获取热门歌曲
            const hotSongContainer = document.getElementById('hotSongs') as HTMLElement;
            for (let i = 0; i < 9; i++) {
                let songInfo = songs[i];

                let skips = 1;
                if (loadedSongs.includes(songInfo.name)) {
                    while (loadedSongs.includes(songInfo.name)) {
                        songInfo = songs[i + skips];
                        skips ++;
                    }
                }

                const songId = `music-kuwo-${songInfo.rid}`;
                const songName = songInfo.name;
                const songCover = songInfo.pic;
                const songAuthors = formatAuthors(songInfo.artist.split('&'), 'kuwo');
                loadedSongs.push(songName);

                addSongCard(hotSongContainer, songId, songName, songCover, songAuthors);
            }
        });
}

/**
 * 加载酷狗音乐歌手信息
 * @param artistId 歌手 ID
 * @param cookies 用户 Token
 */
function loadKugouArtist(artistId: string, cookies: { KuGoo: string }) {
    getKugouResult('artist', { artistId: parseInt(artistId) }, cookies)
        .then((response) => {
            const data = response.data;
            if (data.error_code !== 0) {
                console.log(`[Error] Failed to get Kugou artist info (artistId=${artistId}, code ${data.error_code})`);
                return;
            }

            // 获取基本信息
            const singerInfo = data.data.author_info.singer_info;
            artistMetaData.value.name = singerInfo.singername;
            artistMetaData.value.cover = singerInfo.imgurl.replace('{size}', '500');
            artistMetaData.value.description = singerInfo.intro;

            // 获取最新 / 热门歌曲
            // 最新 / 热门 歌曲去重
            const loadedSongs: string[] = [];
            // 获取最新歌曲
            const newSongContainer = document.getElementById('newSongs') as HTMLElement;

            const songs = data.data.songs;
            const sortedSongs = [...songs].sort((a, b) => {
                const toTime = (t: any) => new Date(t).getTime() || -Infinity;
                return toTime(b.publish_date) - toTime(a.publish_date);
            });
            for (let i = 0; i < 3; i++) {
                let songInfo = sortedSongs[i];

                const songId = `music-kugou-${songInfo.audio_id}`;
                const songName = songInfo.audio_name;
                const songCover = songInfo.album_info?.cover?.replace('{size}', '500') || '/images/player/testAlbum.png';
                const songAuthors = formatAuthors(songInfo.authors, 'kugou');
                loadedSongs.push(songName);

                addSongCard(newSongContainer, songId, songName, songCover, songAuthors, true);
            }

            // 获取热门歌曲
            const hotSongContainer = document.getElementById('hotSongs') as HTMLElement;
            for (let i = 0; i < 9; i++) {
                let songInfo = songs[i];

                let skips = 1;
                if (loadedSongs.includes(songInfo.name)) {
                    while (loadedSongs.includes(songInfo.name)) {
                        songInfo = songs[i + skips];
                        skips ++;
                    }
                }

                const songId = `music-kugou-${songInfo.audio_id}`;
                const songName = songInfo.audio_name;
                const songCover = songInfo.album_info?.cover?.replace('{size}', '500') || '/images/player/testAlbum.png';
                const songAuthors = formatAuthors(songInfo.authors, 'kugou');
                loadedSongs.push(songName);

                addSongCard(hotSongContainer, songId, songName, songCover, songAuthors);
            }
        });
    // 获取最新 / 热门专辑
    getKugouResult('artistAlbums', { artistId: parseInt(artistId) }, cookies)
        .then((response) => {
            const data = response.data;
            if (data.errcode !== 0) {
                console.log(`[Error] Failed to get Kugou artist albums (artistId=${artistId}, code ${data.error_code})`);
                return;
            }
            
            // 最新 / 热门 专辑去重
            const loadedAlbums: string[] = [];
            // 获取最新专辑
            const newAlbumsContainer = document.getElementById('newAlbums') as HTMLElement;

            const albums = data.data.info;
            const sortedAlbums = [...albums].sort((a, b) => {
                const toTime = (t: any) => new Date(t).getTime() || -Infinity;
                return toTime(b.publishtime) - toTime(a.publishtime);
            });
            for (let i = 0; i < 3; i++) {
                let albumInfo = sortedAlbums[i];

                const albumId = `album-kugou-${albumInfo.albumid}`;
                const albumName = albumInfo.albumname;
                const albumCover = albumInfo.imgurl.replace('{size}', 500);
                loadedAlbums.push(albumName);
                
                addSonglistCard(newAlbumsContainer, albumId, albumName, albumCover, true);
            }

            // 获取热门专辑
            const hotAlbumsContainer = document.getElementById('hotAlbums') as HTMLElement;
            for (let i = 0; i < 8; i++) {
                let albumInfo = albums[i];

                let skips = 1;
                if (loadedAlbums.includes(albumInfo.albumName)) {
                    while (loadedAlbums.includes(albumInfo.albumName)) {
                        albumInfo = sortedAlbums[i + skips];
                        skips ++;
                    }
                }

                const albumId = `album-kugou-${albumInfo.albumid}`;
                const albumName = albumInfo.albumname;
                const albumCover = albumInfo.imgurl.replace('{size}', 500);
                loadedAlbums.push(albumName);
                
                addSonglistCard(hotAlbumsContainer, albumId, albumName, albumCover);
            }
        })
}

onMounted(() => {
    const userData = getAccountInfo('all');

    // 解析歌手 ID
    const properties = props.id.split('-');
    const platformName = properties[1]; // 平台名
    const artistId = properties[2]; // 歌手 ID

    // 网易云
    if (platformName === 'netease') {
        loadNeteaseArtist(artistId, userData.netease.cookies || '');
    }
    // QQ音乐
    if (platformName === 'qqmusic') {
        loadQQMusicArtist(artistId, userData.qqmusic.cookies || '');
    }
    // 酷我音乐
    if (platformName === 'kuwo') {
        loadKuwoArtist(artistId, userData.kuwo.cookies || '');
    }
    // 酷狗音乐
    if (platformName === 'kugou') {
        loadKugouArtist(artistId, userData.kugou.cookies || '');
    }

    console.log(`Artist.vue loaded with music id ${props.id}`);
});
</script>
<template>
    <div class="flex column" id="artistPage">
        <div class="flex row" id="artistInfo">
            <img :src="artistMetaData.cover" id="artistAvatar"/>
            <div class="flex column" id="artistDetails">
                <label class="text xxlarge bold">{{ artistMetaData.name }}</label>
                <label class="text ultraSmall grey">歌手</label>
                <label class="text small" id="artistDescription">{{ artistMetaData.description }}</label>
            </div>
        </div>
        <div class="flex column" id="artistCreations">
            <div class="flex column" id="newCreations">
                <label class="text large bold partTitle">最新作品</label>
                <div class="flex row artistWorksBox">
                    <div class="flex column" id="newSongs"></div>
                    <div class="flex row" id="newAlbums"></div>
                </div>
            </div>

            <div class="flex row titleWithMore">
                <label class="text large bold">热门歌曲</label>
                <a class="text small viewMore" @click="changePage('songlistCollections', true, `${artistMetaData.name} 的热门歌曲`)">查看更多</a>
            </div>
            <div class="flex row" id="hotSongs"></div>

            <div class="flex row titleWithMore">
                <label class="text large bold">专辑</label>
                <a class="text small viewMore" @click="changePage('songlistCollections', true, `${artistMetaData.name} 的专辑`)">查看更多</a>
            </div>
            <div class="flex row" id="albums">
                <button class="scrollerButton" @click="scrollLeft">
                    <img src="/images/arrows/left.svg"></img>
                </button>
                <div class="flex row artistWorksBox" id="hotAlbums"></div>
                <button class="scrollerButton" @click="scrollRight">
                    <img src="/images/arrows/right.svg"></img>
                </button>
            </div>
        </div>

        <div id="bottomBanner"></div>
    </div>
</template>
