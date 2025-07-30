<script setup lang="ts">
import { onMounted } from 'vue';
import './homeStyle.css';

import { SonglistCard, SongCard, ArtistCard } from '../../assets/widgets/Widgets.tsx';
import { changePage } from '../../assets/utilities/pageSwitcher.ts';

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

onMounted(() => {
    console.log('Home.vue loaded');
});
</script>

<template>
    <div class="flex column" id="musicHome">
        <!-- 每日推荐 -->
        <label class="text large bold sectionTitle">今日定制</label>
        <div class="flex row" id="homeRecommends">
            <!-- 今日推荐 -->
            <div class="flex row songlistCard midlarge" id="dailyRecommends" @click="changePage('songlist', true, 'songlist@netease.recommends')">
                <span class="cardHeader flex row">
                    <span class="cardInfo flex column">
                        <label class="text medium bold">今日推荐</label>
                        <label class="text ultraSmall">共 30 首歌</label>
                    </span>
                </span>
                <img class="songCover" src="/images/player/testAlbum.png" alt="Playlist cover"/>
            </div>

            <!-- 电台 -->
            <div class="flex row songlistCard midlarge" id="musicRadio">
                <span class="cardHeader flex column">
                    <label class="text medium bold">音乐电台</label>

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
                <img class="songCover" src="/images/player/testAlbum.png" alt="Playlist cover"/>
            </div>
        </div>

        <!-- 推荐歌单 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">推荐歌单</label>
            <a class="text small viewMore" @click="changePage('songlistCollections', true, '推荐歌单')">查看更多</a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img src="/images/arrows/left.svg"></img>
            </button>
            <div class="nowrapBox" id="songlistRecommends">
                <SonglistCard id="songlist@netease.114514" coverUrl="/images/player/testAlbum.png" name="List 01"></SonglistCard>
                <SonglistCard id="songlist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="List 02"></SonglistCard>
                <SonglistCard id="songlist@netease.123456" coverUrl="/images/player/testAlbum.png" name="List 03"></SonglistCard>
                <SonglistCard id="songlist@netease.789000" coverUrl="/images/player/testAlbum.png" name="List 04"></SonglistCard>
                <SonglistCard id="songlist@netease.123475891" coverUrl="/images/player/testAlbum.png" name="List 05"></SonglistCard>
                <SonglistCard id="songlist@netease.123475891" coverUrl="/images/player/testAlbum.png" name="List 06"></SonglistCard>
                <SonglistCard id="songlist@netease.123475891" coverUrl="/images/player/testAlbum.png" name="List 07"></SonglistCard>
                <SonglistCard id="songlist@netease.123475891" coverUrl="/images/player/testAlbum.png" name="List 08"></SonglistCard>
            </div>
            <button class="scrollerButton" @click="scrollRight">
                <img src="/images/arrows/right.svg"></img>
            </button>
        </div>
        

        <!-- 推荐单曲 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">推荐单曲</label>
            <a class="text small viewMore" @click="changePage('singleCollections', true, '推荐单曲')">查看更多</a>
        </div>
        <div class="flex row" id="singleRecommends">
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 01" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 02" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 03" authors="Sample Text"></SongCard>
            
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 04" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 05" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 06" authors="Sample Text"></SongCard>
            
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 07" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 08" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 09" authors="Sample Text"></SongCard>
        </div>

        <!-- 推荐歌手 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">推荐歌手</label>
            <a class="text small viewMore" @click="changePage('artistCollections', true, '推荐歌手')">查看更多</a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img src="/images/arrows/left.svg"></img>
            </button>
            <div class="flex row nowrapBox" id="artistRecommends">
                <ArtistCard id="artist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample Text"></ArtistCard>
                <ArtistCard id="artist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample Text"></ArtistCard>
                <ArtistCard id="artist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample Text"></ArtistCard>
                <ArtistCard id="artist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample Text"></ArtistCard>
                <ArtistCard id="artist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample Text"></ArtistCard>
                <ArtistCard id="artist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample Text"></ArtistCard>
                <ArtistCard id="artist@netease.1919810" coverUrl="/images/player/testAlbum.png" name="Sample Text"></ArtistCard>
            </div>
            <button class="scrollerButton" @click="scrollRight">
                <img src="/images/arrows/right.svg"></img>
            </button>
        </div>

        <!-- 排行榜 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">排行榜</label>
            <a class="text small viewMore" @click="changePage('songlistCollections', true, '排行榜')">查看更多</a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img src="/images/arrows/left.svg"></img>
            </button>
            <div class="flex row nowrapBox" id="rankings">
                <SonglistCard id="songlist@netease.21854151" coverUrl="/images/player/testAlbum.png" name="Ranking 01"></SonglistCard>
                <SonglistCard id="songlist@netease.21854152" coverUrl="/images/player/testAlbum.png" name="Ranking 02"></SonglistCard>
                <SonglistCard id="songlist@netease.21854153" coverUrl="/images/player/testAlbum.png" name="Ranking 03"></SonglistCard>
                <SonglistCard id="songlist@netease.21854154" coverUrl="/images/player/testAlbum.png" name="Ranking 04"></SonglistCard>
                <SonglistCard id="songlist@netease.21854155" coverUrl="/images/player/testAlbum.png" name="Ranking 05"></SonglistCard>
                <SonglistCard id="songlist@netease.21854155" coverUrl="/images/player/testAlbum.png" name="Ranking 06"></SonglistCard>
                <SonglistCard id="songlist@netease.21854155" coverUrl="/images/player/testAlbum.png" name="Ranking 07"></SonglistCard>
            </div>
            <button class="scrollerButton" @click="scrollRight">
                <img src="/images/arrows/right.svg"></img>
            </button>
        </div>

        <!-- 新专辑 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">新专辑</label>
            <a class="text small viewMore" @click="changePage('songlistCollections', true, '新专辑')">查看更多</a>
        </div>
        <div class="flex row horizontalScroll">
            <button class="scrollerButton" @click="scrollLeft">
                <img src="/images/arrows/left.svg"></img>
            </button>
            <div class="flex row nowrapBox" id="newAlbums">
                <SonglistCard id="album@netease.123456" coverUrl="/images/player/testAlbum.png" name="Album 01"></SonglistCard>
                <SonglistCard id="album@netease.123456" coverUrl="/images/player/testAlbum.png" name="Album 02"></SonglistCard>
                <SonglistCard id="album@netease.123456" coverUrl="/images/player/testAlbum.png" name="Album 03"></SonglistCard>
                <SonglistCard id="album@netease.123456" coverUrl="/images/player/testAlbum.png" name="Album 04"></SonglistCard>
                <SonglistCard id="album@netease.123456" coverUrl="/images/player/testAlbum.png" name="Album 05"></SonglistCard>
                <SonglistCard id="album@netease.123456" coverUrl="/images/player/testAlbum.png" name="Album 06"></SonglistCard>
                <SonglistCard id="album@netease.123456" coverUrl="/images/player/testAlbum.png" name="Album 07"></SonglistCard>
            </div>
            <button class="scrollerButton" @click="scrollRight">
                <img src="/images/arrows/right.svg"></img>
            </button>
        </div>

        <!-- 新单曲 -->
        <div class="flex row titleWithMore">
            <label class="text large bold">新歌速递</label>
            <a class="text small viewMore" @click="changePage('singleCollections', true, '新歌速递')">查看更多</a>
        </div>
        <div class="flex row" id="newSingles">
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 01" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 02" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 03" authors="Sample Text"></SongCard>
            
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 04" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 05" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 06" authors="Sample Text"></SongCard>
            
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 07" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 08" authors="Sample Text"></SongCard>
            <SongCard id="music@netease.123456" coverUrl="/images/player/testAlbum.png" name="Song 09" authors="Sample Text"></SongCard>
        </div>

        <!-- 页面底部 -->
        <div class="flex column" id="pageFooter">
            <label class="text small grey" id="footerText">---&nbsp;已到达页面底部&nbsp;---</label>
            <label class="text small grey">Arcanum Music v0.1.0</label>
            <label class="text small grey">Made by NekoZX</label>
            <label class="text ultraSmall grey">Licensed under Apache-2.0 license</label>
        </div>
    </div>
</template>
