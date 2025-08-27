<script setup lang="tsx">
import { defineComponent, onMounted } from 'vue';
import { getPlayer } from '../player/player';
import { changePage } from '../utilities/pageSwitcher';

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

type MenuType = 'collections' | 'song' | 'playlistItem';
const props = defineProps<{
    targetInfo: any,
    menuType: MenuType
}>();

onMounted(() => {
    console.log(`[Debug] Menu loaded with properties ${JSON.stringify(props)}`);
});
</script>
<template>
    <div class="rightMenu flex column">
        <span class="menuPart flex column">
            <MenuItem id="play" icon="/images/menu/play.svg" text="播放" 
                :on-click="() => {getPlayer()?.playNow(props.targetInfo)}" 
                v-if="props.menuType === 'song'"></MenuItem>
            <MenuItem id="playNext" icon="/images/menu/addToList.svg" text="下一首播放" 
                :on-click="() => {getPlayer()?.playlistAdd(props.targetInfo, true)}" 
                v-if="props.menuType === 'song'"></MenuItem>
            <MenuItem id="likeControl" icon="/images/menu/addToFavourites.svg" text="收藏" 
                :on-click="() => {console.log(`[Debug] Add to favourites: ${JSON.stringify(props.targetInfo)}`)}"></MenuItem>
        </span>
        <span class="menuPart flex column">
            <MenuItem id="songInfo" icon="/images/menu/play.svg" text="查看歌曲信息" 
                :on-click="() => {changePage('single', true, props.targetInfo.id)}" 
                v-if="props.menuType === 'playlistItem'"></MenuItem>
            <MenuItem id="albumInfo" icon="/images/menu/album.svg" text="查看专辑" 
                :on-click="() => {}" 
                v-if="props.menuType !== 'collections'"></MenuItem>
            <MenuItem id="menuArtistInfo" icon="/images/menu/artist.svg" text="查看歌手" 
                :on-click="() => {}" 
                v-if="props.menuType !== 'collections'"></MenuItem>
        </span>
        <span class="menuPart flex column">
            <MenuItem id="copyLink" icon="/images/menu/copyLink.svg" text="复制播放链接" 
                :on-click="() => {}" 
                v-if="props.menuType !== 'collections'"></MenuItem>
        </span>
        <span class="menuPart flex column">
            <MenuItem id="listRemove" icon="/images/menu/removeFromList.svg" text="从列表中删除" 
                :on-click="() => {}" 
                v-if="props.menuType === 'playlistItem'"></MenuItem>
        </span>
    </div>
</template>
