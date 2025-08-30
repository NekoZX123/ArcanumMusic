<script setup lang="tsx">
import { defineComponent, onMounted } from 'vue';
import { getPlayer } from '../player/player.ts';
import { changePage } from '../utilities/pageSwitcher.ts';
import { getSongInfo, getSongLink } from '../player/songUtils.ts';
import { hideArtistSelect, showArtistSelect } from '../utilities/elementControl.ts';
import { showNotify } from '../notifications/Notification.ts';

const MenuItem = defineComponent({
    props: {
        id: String,
        icon: String,
        text: String,
        onClick: Function
    },
    setup(props: { id: string, icon: string, text: string, onClick: Function }) {
        return () => (
            <button class="menuItem flex row" id={props.id} onClick={(event) => props.onClick(event)}>
                <img class="menuIcon" src={props.icon}></img>
                <label class="text ultraSmall menuText">{props.text}</label>
            </button>
        );
    }
});

type MenuType = 'collections' | 'song' | 'playlistItem' | 'platformSelect';
const props = defineProps<{
    targetInfo: any,
    menuType: MenuType
}>();

function playCurrentContent() {
    if (props.menuType === 'song') {
        getPlayer()?.playNow(props.targetInfo);
    }
    if (props.menuType === 'collections') {
        getPlayer()?.playListId(props.targetInfo.id);
    }
}

/**
 * 跳转至歌曲专辑
 * @param songId 歌曲 ID
 */
function jumpToSongAlbum(songId: string) {
    const idParts = songId.split('-');
    const platform = idParts[1];

    getSongInfo(songId)
    .then((songInfo: any) => {
        const albumId = `album-${platform}-${songInfo.albumId}`;

        changePage('songlist', true, albumId);
    });
}

/**
 * 跳转至歌曲歌手
 * @param songId 歌曲 ID
 */
function jumpToSongArtist(songId: string) {
    getSongInfo(songId)
    .then((songInfo: any) => {
        const artists = songInfo.authorsObject;

        if (artists.length === 1) {
            const artistId = artists[0].id;

            hideArtistSelect();
            changePage('artist', true, artistId);
        }
        else {
            showArtistSelect(artists);
        }
    });
}

/**
 * 复制歌曲链接
 * @param songId 歌曲 ID
 */
function copyLink(songId: string) {
    const idParts = songId.split('-');
    const platform = idParts[1];

    getSongLink(songId)
    .then((linkInfo: any) => {
        let link = linkInfo.url;
        const musicId = idParts[2];
        if (platform === 'netease') {
            link = `https://music.163.com/song/media/outer/url?id=${musicId}.mp3`;
        }

        window.electron.copyToClipboard(link);
        showNotify('linkCopySucceed', 'success', '链接复制成功', '歌曲链接已复制至剪贴板', 1000);
    });
}

onMounted(() => {
    console.log(`[Debug] Menu loaded with properties ${JSON.stringify(props)}`);
});
</script>
<template>
    <div class="rightMenu flex column">
        <span class="menuPart flex column">
            <MenuItem id="play" icon="/images/menu/play.svg" text="播放" 
                :on-click="playCurrentContent" 
                v-if="['collections', 'song'].includes(props.menuType)"></MenuItem>
            <MenuItem id="playNext" icon="/images/menu/addToList.svg" text="下一首播放" 
                :on-click="() => {getPlayer()?.playlistAdd(props.targetInfo, true)}" 
                v-if="props.menuType === 'song'"></MenuItem>
            <MenuItem id="likeControl" icon="/images/menu/addToFavourites.svg" text="收藏" 
                :on-click="() => {console.log(`[Debug] Add to favourites: ${JSON.stringify(props.targetInfo)}`)}" 
                v-if="props.menuType !== 'platformSelect'"></MenuItem>
        </span>
        <span class="menuPart flex column">
            <MenuItem id="songInfo" icon="/images/menu/play.svg" text="查看歌曲信息" 
                :on-click="() => {changePage('single', true, props.targetInfo.id)}" 
                v-if="props.menuType === 'playlistItem'"></MenuItem>
            <MenuItem id="albumInfo" icon="/images/menu/album.svg" text="查看专辑" 
                :on-click="() => {jumpToSongAlbum(props.targetInfo.id)}" 
                v-if="['song', 'playlistItem'].includes(props.menuType)"></MenuItem>
            <MenuItem id="menuArtistInfo" icon="/images/menu/artist.svg" text="查看歌手" 
                :on-click="() => {jumpToSongArtist(props.targetInfo.id)}" 
                v-if="['song', 'playlistItem'].includes(props.menuType)"></MenuItem>
        </span>
        <span class="menuPart flex column">
            <MenuItem id="copyLink" icon="/images/menu/copyLink.svg" text="复制播放链接" 
                :on-click="() => {copyLink(props.targetInfo.id)}" 
                v-if="['song', 'playlistItem'].includes(props.menuType)"></MenuItem>
        </span>
        <span class="menuPart flex column">
            <MenuItem id="listRemove" icon="/images/menu/removeFromList.svg" text="从列表中删除" 
                :on-click="() => {}" 
                v-if="props.menuType === 'playlistItem'"></MenuItem>
        </span>
        <span class="menuPart flex column">
            <MenuItem id="platform_netease" icon="/images/platforms/netease.png" text="网易云音乐" 
                :on-click="() => {}" 
                v-if="props.menuType === 'platformSelect'"></MenuItem>
            <MenuItem id="platform_qqmusic" icon="/images/platforms/qqmusic.png" text="QQ 音乐" 
                :on-click="() => {}" 
                v-if="props.menuType === 'platformSelect'"></MenuItem>
            <MenuItem id="platform_kuwo" icon="/images/platforms/kuwo.png" text="酷我音乐" 
                :on-click="() => {}" 
                v-if="props.menuType === 'platformSelect'"></MenuItem>
            <MenuItem id="platform_kugou" icon="/images/platforms/kugou.png" text="酷狗音乐" 
                :on-click="() => {}" 
                v-if="props.menuType === 'platformSelect'"></MenuItem>
        </span>
    </div>
</template>
