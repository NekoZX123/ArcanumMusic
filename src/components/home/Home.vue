<script setup lang="ts">
import { onMounted, ref } from 'vue';
import './homeStyle.css';

import { changePage } from '../../assets/utilities/pageSwitcher.ts';
import { getAccountInfo } from '../../assets/utilities/accountManager.ts';
import { getNeteaseResult } from '../../assets/scripts/netease/neteaseRequest.ts';
import { getQQmusicResult } from '../../assets/scripts/qqmusic/qqmusicRequest.ts';
import { getKuwoResult } from '../../assets/scripts/kuwo/kuwoRequest.ts';
import { getKugouResult } from '../../assets/scripts/kugou/kugouRequest.ts';
import { addSonglistCard, addSongCard, addArtistCard } from '../../assets/utilities/elementControl.ts';
import type { AxiosResponse } from 'axios';
import { parseMusicData } from '../../assets/utilities/dataParsers.ts';
import { getPlayer } from '../../assets/player/player.ts';

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

const recommendCover = ref('/images/player/testAlbum.png');
const radioCover = ref('/images/player/testAlbum.png');
const completeRecommendListId = ref('songList-netease-3136952023');
const neteaseRecommendListId = ref('3136952023');

const requestFunc: Record<string, any> = {
    'netease': getNeteaseResult,
    'qqmusic': getQQmusicResult,
    'kuwo': getKuwoResult,
    'kugou': getKugouResult
}

onMounted(() => {
    const userData = getAccountInfo('all');

    // 获取每日推荐封面
    getNeteaseResult('songList', { listId: '3136952023' }, userData.netease.cookies)
        .then((response) => {
            const data = response.data;
            if (data.code !== 200) {
                console.error(`[Error] Failed to request netease api (module 'hotList', code ${data.code})`);
                return;
            }

            recommendCover.value = data.playlist.coverImgUrl;
        });
    // 获取音乐雷达封面
    getNeteaseResult('dailyRecommends', {}, userData.netease.cookies)
        .then((response) => {
            const data = response.data;
            // console.log(data);
            if (data.code !== 200) {
                console.error(`[Error] Failed to request netease api (module 'dailyRecommends', code ${data.code})`);
                return;
            }

            radioCover.value = data.recommend[0].album.picUrl;
        });
    
    // 获取推荐歌单
    let hotListContainer = null;
    if (!hotListContainer) {
        hotListContainer = document.getElementById('songlistRecommends') as HTMLElement;
    }
    Object.keys(requestFunc).forEach((platform: string) => {
        const sendRequest = requestFunc[platform];
        sendRequest('hotList', {}, userData[platform].cookies)
            .then((response: AxiosResponse)=> {
                // 解析数据
                const recommendations = parseMusicData(response, platform, 'hotList');
                // 展示数据
                const songLists = recommendations.lists;
                for (let i = 0; i < 2; i++) {
                    const listDetail = songLists[i];

                    const listId = `songlist-${platform}-${listDetail.listId}`;
                    const listName = listDetail.listName;
                    const listCover = listDetail.listCover;

                    addSonglistCard(hotListContainer, listId, listName, listCover);
                }
            });
    });

    // 获取推荐歌曲
    let recommendSongContainer = null;
    if (!recommendSongContainer) {
        recommendSongContainer = document.getElementById('singleRecommends') as HTMLElement;
    }
    const loadedRecommendSongs: string[] = [];
    Object.keys(requestFunc).forEach((platform: string) => {
        const sendRequest = requestFunc[platform];
        sendRequest('recommendSong', {}, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                // 解析数据
                const recommendations = parseMusicData(response, platform, 'recommendSong');
                // 展示数据
                const songs = recommendations.songList;
                for (let i = 0; i < 3; i++) {
                    let skips = 1;
                    let songDetail = songs[i];

                    if (loadedRecommendSongs.includes(songDetail.songName)) {
                        while (loadedRecommendSongs.includes(songDetail.songName)) {
                            songDetail = songs[skips+1];
                            skips++;
                        }
                    }

                    const songId = `songlist-${platform}-${songDetail.songId}`;
                    const songName = songDetail.songName;
                    const songCover = songDetail.songCover;
                    const songAuthors = songDetail.songAuthors;
                    const songDuration = songDetail.songDuration;
                    loadedRecommendSongs.push(songName);

                    addSongCard(recommendSongContainer, songId, songName, songCover, songAuthors, songDuration);
                }
            });
    });

    // 获取推荐歌手
    let recommendArtistContainer = null;
    if (!recommendArtistContainer) {
        recommendArtistContainer = document.getElementById('artistRecommends') as HTMLElement;
    }
    const loadedArtists: string[] = [];
    Object.keys(requestFunc).forEach((platform: string) => {
        const sendRequest = requestFunc[platform];
        sendRequest('recommendArtist', {}, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                // 解析数据
                const recommendations = parseMusicData(response, platform, 'recommendArtist');
                // console.log(recommendations);
                // 展示数据
                const artistList = recommendations.artistList;

                for (let i = 0; i < 2; i++) {
                    let artistInfo = artistList[i];
                    let skips = 1;

                    if (loadedArtists.includes(artistInfo.artistName)) {
                        while (loadedArtists.includes(artistInfo.artistName)) {
                            artistInfo = artistList[skips+1];
                            skips++;
                        }
                    }

                    const artistId = `artist-${platform}-${artistInfo.artistId}`;
                    const artistName = artistInfo.artistName;
                    const artistCover = artistInfo.artistCover;
                    loadedArtists.push(artistName);

                    addArtistCard(recommendArtistContainer, artistId, artistName, artistCover);
                }
            });
    });

    // 获取排行榜
    let rankingsContainer = null;
    if (!rankingsContainer) {
        rankingsContainer = document.getElementById('rankings') as HTMLElement;
    }
    getNeteaseResult('rankings', {}, userData.netease.cookies)
        .then((response) => {
            const data = response.data;
            if (data.code !== 200) {
                console.error(`[Error] Failed to request netease api (module 'rankings', code ${data.code})`);
                return;
            }

            const rankings = data.list;
            for (let i = 0; i < 6; i++) {
                const rankingInfo = rankings[i];

                const rankingId = `ranking-netease-${rankingInfo.id.toString()}`;
                const rankingName = rankingInfo.name;
                const rankingCover = rankingInfo.coverImgUrl;

                addSonglistCard(rankingsContainer, rankingId, rankingName, rankingCover);
            }
        });

    // 获取新专辑
    let newAlbumContainer = null;
    if (!newAlbumContainer) {
        newAlbumContainer = document.getElementById('newAlbums') as HTMLElement;
    }
    ['netease', 'qqmusic'].forEach((platform: string) => {
        const sendRequest = requestFunc[platform];
        sendRequest('newAlbum', {}, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                // 解析数据
                const recommendations = parseMusicData(response, platform, 'newAlbum');
                // console.log(recommendations);
                // 展示数据
                const albumList = recommendations.albumList;

                for (let i = 0; i < 4; i++) {
                    const albumInfo = albumList[i];
                    
                    const albumId = `album-${platform}-${albumInfo.albumId}`;
                    const albumName = albumInfo.albumName;
                    const albumCover = albumInfo.albumCover;

                    addSonglistCard(newAlbumContainer, albumId, albumName, albumCover);
                }
            });
    });

    // 获取新歌
    let newSinglesContainer = null;
    if (!newSinglesContainer) {
        newSinglesContainer = document.getElementById('newSingles') as HTMLElement;
    }
    const loadedSongs: string[] = [];
    Object.keys(requestFunc).forEach((platform: string) => {
        const sendRequest = requestFunc[platform];
        sendRequest('newSong', {}, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                // 解析数据
                // console.log(response.data);
                const recommendations = parseMusicData(response, platform, 'newSong');
                // console.log(recommendations);
                // 展示数据
                const songs = recommendations.songList;

                for (let i = 0; i < 3; i++) {
                    let songInfo = songs[i];
                    let skips = 1;
                    
                    if (loadedSongs.includes(songInfo.songName)) {
                        while (loadedSongs.includes(songInfo.songName)) {
                            songInfo = songs[i + skips];
                            skips ++;
                        }
                    }

                    const songId = `music-${platform}-${songInfo.songId}`;
                    const songName = songInfo.songName;
                    const songCover = songInfo.songCover;
                    const songAuthors = songInfo.songAuthors;
                    const songDuration = songInfo.songDuration;

                    loadedSongs.push(songName);

                    addSongCard(newSinglesContainer, songId, songName, songCover, songAuthors, songDuration);
                }
            });
    });

    console.log('Home.vue loaded');
});
</script>

<template>
    <div class="flex column" id="musicHome">
        <!-- 每日推荐 -->
        <label class="text large bold sectionTitle">今日定制</label>
        <div class="flex row" id="homeRecommends">
            <!-- 今日推荐 -->
            <div class="songlistCard midlarge" id="dailyRecommends" :style="`background: url(${recommendCover})`"
                @click="changePage('songlist', true, `songlist-netease-${neteaseRecommendListId}`)">
                <span class="cardHeader flex row">
                    <span class="cardInfo flex column">
                        <label class="text extraLarge bold" id="recommendTitle">今&nbsp;日推&nbsp;荐</label>
                        <label class="text ultraSmall">共 30 首歌</label>
                    </span>
                </span>
                <button class="songlistPlay" id="dailyRecommends_play" @click="getPlayer()?.playListId(completeRecommendListId)">
                    <img src="/images/player/play.svg" alt="Play"/>
                </button>
            </div>

            <!-- 电台 -->
            <div class="flex row songlistCard midlarge" id="musicRadio">
                <span class="cardHeader flex column">
                    <label id="radioTitle" class="text bold">音&nbsp;乐电&nbsp;台</label>

                    <span class="flex row">
                        <button class="songlistPlay" id="musicRadio_prev">
                            <img src="/images/player/previous.svg" alt="Previous"/>
                        </button>
                        <button class="songlistPlay" id="musicRadio_play">
                            <img src="/images/player/play.dark.svg" alt="Play"/>
                        </button>
                        <button class="songlistPlay" id="musicRadio_next">
                            <img src="/images/player/next.svg" alt="Next"/>
                        </button>
                    </span>
                </span>
                <img class="songCover" :src="radioCover" alt="Playlist cover"/>
            </div>
        </div>

        <!-- 推荐歌单 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">推荐歌单</label>
            <a class="text small viewMore" 
                @click="changePage('songlistCollections', true, { title: '推荐歌单', module: 'hotList' })">
                查看更多
            </a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img src="/images/arrows/left.svg"></img>
            </button>
            <div class="nowrapBox" id="songlistRecommends"></div>
            <button class="scrollerButton" @click="scrollRight">
                <img src="/images/arrows/right.svg"></img>
            </button>
        </div>
        

        <!-- 推荐单曲 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">推荐单曲</label>
            <a class="text small viewMore" 
                @click="changePage('singleCollections', true, { title: '推荐单曲', module: 'recommendSong' })">
                查看更多
            </a>
        </div>
        <div class="flex row" id="singleRecommends"></div>

        <!-- 推荐歌手 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">推荐歌手</label>
            <a class="text small viewMore" 
                @click="changePage('artistCollections', true, { title: '推荐歌手', module: 'recommendArtist' })">
                查看更多
            </a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img src="/images/arrows/left.svg"></img>
            </button>
            <div class="flex row nowrapBox" id="artistRecommends"></div>
            <button class="scrollerButton" @click="scrollRight">
                <img src="/images/arrows/right.svg"></img>
            </button>
        </div>

        <!-- 排行榜 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">排行榜</label>
            <a class="text small viewMore" 
                @click="changePage('songlistCollections', true, { title: '排行榜', module: 'rankings' })">
                查看更多
            </a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img src="/images/arrows/left.svg"></img>
            </button>
            <div class="flex row nowrapBox" id="rankings"></div>
            <button class="scrollerButton" @click="scrollRight">
                <img src="/images/arrows/right.svg"></img>
            </button>
        </div>

        <!-- 新专辑 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">新专辑</label>
            <a class="text small viewMore" 
            @click="changePage('songlistCollections', true, { title: '新专辑', module: 'newAlbum' })">
            查看更多
        </a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img src="/images/arrows/left.svg"></img>
            </button>
            <div class="flex row nowrapBox" id="newAlbums"></div>
            <button class="scrollerButton" @click="scrollRight">
                <img src="/images/arrows/right.svg"></img>
            </button>
        </div>

        <!-- 新单曲 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">新歌速递</label>
            <a class="text small viewMore" 
            @click="changePage('singleCollections', true, { title: '新歌速递', module: 'newSong' })">
            查看更多
        </a>
        </div>
        <div class="flex row" id="newSingles"></div>

        <!-- 页面底部 -->
        <div class="flex column" id="pageFooter">
            <label class="text small grey" id="footerText">-----&nbsp;已到达页面底部&nbsp;-----</label>
            <label class="text small grey">Arcanum Music v0.7.5</label>
            <label class="text small grey">Made by NekoZX123</label>
            <label class="text ultraSmall grey">Licensed under Apache-2.0 license</label>
            <label class="text ultraSmall grey">仅供学习交流使用, 不得用于商业用途</label>
        </div>
    </div>
</template>
