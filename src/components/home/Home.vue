<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import './homeStyle.css';

import router from '../../router/index.ts';
import { getAccountInfo } from '../../assets/user/accountManager.ts';
import { getNeteaseResult } from '../../assets/scripts/netease/neteaseRequest.ts';
import { getQQmusicResult } from '../../assets/scripts/qqmusic/qqmusicRequest.ts';
import { getKuwoResult } from '../../assets/scripts/kuwo/kuwoRequest.ts';
import { getKugouResult } from '../../assets/scripts/kugou/kugouRequest.ts';
import { addSonglistCard, addSongCard, addArtistCard } from '../../assets/ui/elementControl.ts';
import { parseMusicData } from '../../assets/utilities/dataParsers.ts';
import { getPlayer } from '../../assets/player/player.ts';
import { getMainColors } from '../../assets/effects/colorUtils.ts';
import { getConfig } from '../../assets/user/configLoader.ts';

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

const recommendCover = ref('./images/player/testAlbum.png');
const radioCover = ref('./images/player/testAlbum.png');
const completeRecommendListId = ref('songList-netease-3136952023');
const neteaseRecommendListId = ref('3136952023');

const requestFunc: Record<string, any> = {
    'netease': getNeteaseResult,
    'qqmusic': getQQmusicResult,
    'kuwo': getKuwoResult,
    'kugou': getKugouResult
}

function playNeteaseRadio(_: MouseEvent) {
    const userData = getAccountInfo('all');

    getNeteaseResult('dailyRecommends', {}, userData.netease.cookies)
        .then((response) => {
            const recommends = parseMusicData(response, 'netease', 'dailyRecommends');

            const tracks = recommends.loadTracks;
            const listContent: any[] = [];
            tracks.forEach((trackInfo: any) => {
                listContent.push({
                    id: `music-netease-${trackInfo.songId}`,
                    name: trackInfo.songName,
                    coverUrl: trackInfo.songCover || './images/library/player/testAlbum.png',
                    authors: trackInfo.songAuthors,
                    duration: trackInfo.songDuration
                });
            });

            getPlayer()?.playByList(listContent);
        });
}

const SONGLIST_RECOMMEND_LENGTH = 8;
const SONG_RECOMMEND_LENGTH = 12;
const ARTIST_RECOMMEND_LENGTH = 8;

// 懒加载状态管理
const loadedSections = ref<Set<string>>(new Set());
const sectionLoaders: Record<string, () => Promise<void>> = {};
let observer: IntersectionObserver | null = null;
const LAZY_LOAD_THRESHOLD = 0.1; // 当元素进入视口 10% 时触发加载
const ROOT_MARGIN = '200px'; // 提前 200px 开始加载

// 标记区域已加载
function markSectionLoaded(sectionName: string) {
    loadedSections.value.add(sectionName);
}

// 检查区域是否已加载
function isSectionLoaded(sectionName: string): boolean {
    return loadedSections.value.has(sectionName);
}

// 获取每日推荐封面和音乐雷达封面（首屏优先加载）
async function loadTopRecommendCovers() {
    if (isSectionLoaded('topCovers')) return;

    const userData = getAccountInfo('all');

    // 获取每日推荐封面
    try {
        const response = await getNeteaseResult('songList', { listId: '3136952023', maxLength: 20 }, userData.netease.cookies);
        const data = response.data;
        if (data.code !== 200) {
            console.error(`[Error] Failed to request netease api (module 'hotList', code ${data.code})`);
        } else {
            const imgUrl = data.playlist.coverImgUrl;
            recommendCover.value = imgUrl;

            const colors = await getMainColors(imgUrl, 2);
            if (colors.length < 2) colors[1] = colors[0];

            const [gradientColor1, gradientColor2] = colors;

            const radioBox = document.getElementById('musicRadio');
            if (radioBox) {
                radioBox.style.background = `linear-gradient(120deg, ${gradientColor1}, ${gradientColor2})`;
            }
        }
    } catch (error) {
        console.error('[Error] Failed to load recommend cover:', error);
    }

    // 获取音乐雷达封面
    try {
        const response = await getNeteaseResult('dailyRecommends', {}, userData.netease.cookies);
        const data = response.data;
        if (data.code !== 200) {
            console.error(`[Error] Failed to request netease api (module 'dailyRecommends', code ${data.code})`);
        } else {
            radioCover.value = data.recommend[0].album.picUrl;
        }
    } catch (error) {
        console.error('[Error] Failed to load radio cover:', error);
    }

    markSectionLoaded('topCovers');
}

// 获取推荐歌单
async function loadSonglistRecommends() {
    if (isSectionLoaded('songlistRecommends')) return;

    const userData = getAccountInfo('all');
    const config = getConfig();
    const enabledPlatforms = Object.keys(config.sources.enabledSources).filter((platform) => {
        return config.sources.enabledSources[platform];
    });

    const hotListContainer = document.getElementById('songlistRecommends') as HTMLElement;
    if (!hotListContainer) return;

    const singlePlatformItems = Math.floor(SONGLIST_RECOMMEND_LENGTH / enabledPlatforms.length);

    await Promise.all(enabledPlatforms.map(async (platform: string) => {
        try {
            const sendRequest = requestFunc[platform];
            const response = await sendRequest('hotList', { maxLength: 3, pageIndex: 0 }, userData[platform].cookies);
            const recommendations = parseMusicData(response, platform, 'hotList');
            const songLists = recommendations.lists;

            for (let i = 0; i < Math.min(singlePlatformItems, songLists.length); i++) {
                const listDetail = songLists[i];
                const listId = `songlist-${platform}-${listDetail.listId}`;
                const listName = listDetail.listName;
                const listCover = listDetail.listCover;
                addSonglistCard(hotListContainer, listId, listName, listCover);
            }
        } catch (error) {
            console.error(`[Error] Failed to load songlist recommends for ${platform}:`, error);
        }
    }));

    markSectionLoaded('songlistRecommends');
}

// 获取推荐单曲
async function loadSingleRecommends() {
    if (isSectionLoaded('singleRecommends')) return;

    const userData = getAccountInfo('all');
    const config = getConfig();
    const enabledPlatforms = Object.keys(config.sources.enabledSources).filter((platform) => {
        return config.sources.enabledSources[platform];
    });

    const recommendSongContainer = document.getElementById('singleRecommends') as HTMLElement;
    if (!recommendSongContainer) return;

    const singlePlatformSongItems = Math.floor(SONG_RECOMMEND_LENGTH / enabledPlatforms.length);
    const loadedRecommendSongs: string[] = [];

    await Promise.all(enabledPlatforms.map(async (platform: string) => {
        try {
            const sendRequest = requestFunc[platform];
            const response = await sendRequest('recommendSong', { maxLength: 5, pageIndex: 0 }, userData[platform].cookies);
            const recommendations = parseMusicData(response, platform, 'recommendSong');
            const songs = recommendations.songList;

            for (let i = 0; i < Math.min(singlePlatformSongItems, songs.length); i++) {
                let skips = 0;
                let songDetail = songs[i];

                if (loadedRecommendSongs.includes(songDetail.songName)) {
                    while (loadedRecommendSongs.includes(songDetail.songName)) {
                        songDetail = songs[skips+1];
                        skips++;
                    }
                }

                const songId = `music-${platform}-${songDetail.songId}`;
                const songName = songDetail.songName;
                const songCover = songDetail.songCover;
                const songAuthors = songDetail.songAuthors;
                const songDuration = songDetail.songDuration;
                loadedRecommendSongs.push(songName);

                addSongCard(recommendSongContainer, songId, songName, songCover, songAuthors, songDuration);
            }
        } catch (error) {
            console.error(`[Error] Failed to load single recommends for ${platform}:`, error);
        }
    }));

    markSectionLoaded('singleRecommends');
}

// 获取推荐歌手
async function loadArtistRecommends() {
    if (isSectionLoaded('artistRecommends')) return;

    const userData = getAccountInfo('all');
    const config = getConfig();
    const enabledPlatforms = Object.keys(config.sources.enabledSources).filter((platform) => {
        return config.sources.enabledSources[platform];
    });

    const recommendArtistContainer = document.getElementById('artistRecommends') as HTMLElement;
    if (!recommendArtistContainer) return;

    const singlePlatformArtistItems = Math.floor(ARTIST_RECOMMEND_LENGTH / enabledPlatforms.length);
    const loadedArtists: string[] = [];

    await Promise.all(enabledPlatforms.map(async (platform: string) => {
        try {
            const sendRequest = requestFunc[platform];
            const response = await sendRequest('recommendArtist', { maxLength: 5, pageIndex: 0 }, userData[platform].cookies);
            const recommendations = parseMusicData(response, platform, 'recommendArtist');
            const artistList = recommendations.artistList;

            for (let i = 0; i < Math.min(singlePlatformArtistItems, artistList.length); i++) {
                let artistInfo = artistList[i];
                let skips = 0;

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
        } catch (error) {
            console.error(`[Error] Failed to load artist recommends for ${platform}:`, error);
        }
    }));

    markSectionLoaded('artistRecommends');
}

// 获取排行榜
async function loadRankings() {
    if (isSectionLoaded('rankings')) return;

    const userData = getAccountInfo('all');
    const rankingsContainer = document.getElementById('rankings') as HTMLElement;
    if (!rankingsContainer) return;

    try {
        const response = await getNeteaseResult('rankings', { maxLength: 5, pageIndex: 0 }, userData.netease.cookies);
        const data = response.data;
        if (data.code !== 200) {
            console.error(`[Error] Failed to request netease api (module 'rankings', code ${data.code})`);
            return;
        }

        const rankings = data.data.reduce((acc: any[], category: any) => {
            return acc.concat(category.list.map((ranking: any) => {
                return {
                    id: ranking.id,
                    name: ranking.name,
                    coverUrl: ranking.coverUrl
                };
            }));
        }, []);

        for (let i = 0; i < 6; i++) {
            const rankingInfo = rankings[i];
            const rankingId = `ranking-netease-${rankingInfo.id.toString()}`;
            const rankingName = rankingInfo.name;
            const rankingCover = rankingInfo.coverUrl;
            addSonglistCard(rankingsContainer, rankingId, rankingName, rankingCover);
        }
    } catch (error) {
        console.error('[Error] Failed to load rankings:', error);
    }

    markSectionLoaded('rankings');
}

// 获取新专辑
async function loadNewAlbums() {
    if (isSectionLoaded('newAlbums')) return;

    const userData = getAccountInfo('all');
    const config = getConfig();
    const enabledPlatforms = Object.keys(config.sources.enabledSources).filter((platform) => {
        return config.sources.enabledSources[platform];
    });
    const platforms = ['netease', 'qqmusic'].filter((p) => enabledPlatforms.includes(p));

    const newAlbumContainer = document.getElementById('newAlbums') as HTMLElement;
    if (!newAlbumContainer) return;

    await Promise.all(platforms.map(async (platform: string) => {
        try {
            const sendRequest = requestFunc[platform];
            const response = await sendRequest('newAlbum', { maxLength: 5, pageIndex: 0 }, userData[platform].cookies);
            const recommendations = parseMusicData(response, platform, 'newAlbum');
            const albumList = recommendations.albumList;

            for (let i = 0; i < 4; i++) {
                const albumInfo = albumList[i];
                const albumId = `album-${platform}-${albumInfo.albumId}`;
                const albumName = albumInfo.albumName;
                const albumCover = albumInfo.albumCover;
                addSonglistCard(newAlbumContainer, albumId, albumName, albumCover);
            }
        } catch (error) {
            console.error(`[Error] Failed to load new albums for ${platform}:`, error);
        }
    }));

    markSectionLoaded('newAlbums');
}

// 获取新歌
async function loadNewSingles() {
    if (isSectionLoaded('newSingles')) return;

    const userData = getAccountInfo('all');
    const config = getConfig();
    const enabledPlatforms = Object.keys(config.sources.enabledSources).filter((platform) => {
        return config.sources.enabledSources[platform];
    });

    const newSinglesContainer = document.getElementById('newSingles') as HTMLElement;
    if (!newSinglesContainer) return;

    const singlePlatformNewSongLength = Math.floor(SONG_RECOMMEND_LENGTH / enabledPlatforms.length);
    const loadedSongs: string[] = [];

    await Promise.all(enabledPlatforms.map(async (platform: string) => {
        try {
            const sendRequest = requestFunc[platform];
            const response = await sendRequest('newSong', { maxLength: 3, pageIndex: 0 }, userData[platform].cookies);
            const recommendations = parseMusicData(response, platform, 'newSong');
            const songs = recommendations.songList;

            for (let i = 0; i < Math.min(singlePlatformNewSongLength, songs.length); i++) {
                let songInfo = songs[i];
                let skips = 0;

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
        } catch (error) {
            console.error(`[Error] Failed to load new singles for ${platform}:`, error);
        }
    }));

    markSectionLoaded('newSingles');
}

// 注册所有区域的加载器
function registerSectionLoaders() {
    sectionLoaders.songlistRecommends = loadSonglistRecommends;
    sectionLoaders.singleRecommends = loadSingleRecommends;
    sectionLoaders.artistRecommends = loadArtistRecommends;
    sectionLoaders.rankings = loadRankings;
    sectionLoaders.newAlbums = loadNewAlbums;
    sectionLoaders.newSingles = loadNewSingles;
}

// IntersectionObserver 回调
function handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const sectionName = entry.target.id;
            const loader = sectionLoaders[sectionName];
            if (loader && !isSectionLoaded(sectionName)) {
                loader();
                // 加载后取消观察该元素
                observer?.unobserve(entry.target);
            }
        }
    });
}

// 初始化 IntersectionObserver
function initLazyLoadObserver() {
    registerSectionLoaders();

    observer = new IntersectionObserver(handleIntersection, {
        root: null, // 视口
        rootMargin: ROOT_MARGIN,
        threshold: LAZY_LOAD_THRESHOLD
    });

    // 观察所有需要懒加载的区域容器
    const lazyLoadSections = [
        'songlistRecommends',
        'singleRecommends',
        'artistRecommends',
        'rankings',
        'newAlbums',
        'newSingles'
    ];

    lazyLoadSections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            observer?.observe(element);
        }
    });

    // 也观察页脚，作为兜底触发加载所有剩余内容
    const footer = document.getElementById('pageFooter');
    if (footer) {
        observer?.observe(footer);
    }
}

onMounted(async () => {
    // 首屏优先加载：每日推荐封面和音乐雷达封面
    await loadTopRecommendCovers();

    // 初始化懒加载观察器
    initLazyLoadObserver();

    console.log('Home.vue loaded with lazy loading');
});

onUnmounted(() => {
    // 清理观察器
    if (observer) {
        observer.disconnect();
        observer = null;
    }
});
</script>

<template>
    <div class="flex column" id="musicHome">
        <!-- 每日推荐 -->
        <label class="text large bold sectionTitle">今日定制</label>
        <div class="flex row" id="homeRecommends">
            <!-- 今日推荐 -->
            <div class="songlistCard midlarge" id="dailyRecommends" :style="`background: url(${recommendCover})`"
                @click="router.push(`/songlist/songlist-netease-${neteaseRecommendListId}`)">
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
                <span class="cardHeader flex column" id="radioHeader">
                    <label id="radioTitle" class="text bold">音&nbsp;乐电&nbsp;台</label>

                    <label id="radioSource" class="text ultraSmall white">by Netease Music</label>
                </span>
                <span id="radioCoverBox">
                    <img class="songCover" id="radioCover" :src="radioCover" alt="Playlist cover"/>
                    <button class="songlistPlay" id="musicRadio_play" @click="playNeteaseRadio">
                        <img src="/images/player/play.dark.svg" alt="Play"/>
                    </button>
                </span>
            </div>
        </div>

        <!-- 推荐歌单 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">推荐歌单</label>
            <a class="text small viewMore"
                @click="router.push({ name: 'songlistCollections', query: { title: '推荐歌单', module: 'hotList' } })">
                查看更多
            </a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img class="outlineImage" src="/images/arrows/left.svg"></img>
            </button>
            <div class="nowrapBox" id="songlistRecommends"></div>
            <button class="scrollerButton" @click="scrollRight">
                <img class="outlineImage" src="/images/arrows/right.svg"></img>
            </button>
        </div>
        

        <!-- 推荐单曲 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">推荐单曲</label>
            <a class="text small viewMore"
                @click="router.push({ name: 'singleCollections', query: { title: '推荐单曲', module: 'recommendSong' } })">
                查看更多
            </a>
        </div>
        <div class="flex row" id="singleRecommends"></div>

        <!-- 推荐歌手 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">推荐歌手</label>
            <a class="text small viewMore"
                @click="router.push({ name: 'artistCollections', query: { title: '推荐歌手', module: 'recommendArtist' } })">
                查看更多
            </a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img class="outlineImage" src="/images/arrows/left.svg"></img>
            </button>
            <div class="flex row nowrapBox" id="artistRecommends"></div>
            <button class="scrollerButton" @click="scrollRight">
                <img class="outlineImage" src="/images/arrows/right.svg"></img>
            </button>
        </div>

        <!-- 排行榜 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">排行榜</label>
            <a class="text small viewMore"
                @click="router.push({ name: 'songlistCollections', query: { title: '排行榜', module: 'rankings' } })">
                查看更多
            </a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img class="outlineImage" src="/images/arrows/left.svg"></img>
            </button>
            <div class="flex row nowrapBox" id="rankings"></div>
            <button class="scrollerButton" @click="scrollRight">
                <img class="outlineImage" src="/images/arrows/right.svg"></img>
            </button>
        </div>

        <!-- 新专辑 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">新专辑</label>
            <a class="text small viewMore" 
            @click="router.push({ name: 'songlistCollections', query: { title: '新专辑', module: 'newAlbum' } })">
            查看更多
        </a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img class="outlineImage" src="/images/arrows/left.svg"></img>
            </button>
            <div class="flex row nowrapBox" id="newAlbums"></div>
            <button class="scrollerButton" @click="scrollRight">
                <img class="outlineImage" src="/images/arrows/right.svg"></img>
            </button>
        </div>

        <!-- 新单曲 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">新歌速递</label>
            <a class="text small viewMore" 
            @click="router.push({ name: 'singleCollections', query: { title: '新歌速递', module: 'newSong' } })">
            查看更多
        </a>
        </div>
        <div class="flex row" id="newSingles"></div>

        <!-- 页面底部 -->
        <div class="flex column" id="pageFooter">
            <label class="text small grey" id="footerText">-----&nbsp;已到达页面底部&nbsp;-----</label>
            <label class="text small grey">Arcanum Music [dev]</label>
            <label class="text small grey">Made by NekoZX123</label>
            <label class="text ultraSmall grey">Licensed under Apache-2.0 license</label>
            <label class="text ultraSmall grey">仅供学习交流使用, 不得用于商业用途</label>
        </div>
    </div>
</template>
