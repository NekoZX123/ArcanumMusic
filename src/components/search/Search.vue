<script setup lang="tsx">
import { defineComponent, onMounted, ref } from 'vue';
import './searchStyle.css';

import { SonglistCard, SongCard, ArtistCard } from '../../assets/widgets/Widgets.tsx';

const props = defineProps({
    query: {
        type: String,
        required: true,
        default: ''
    }
});
const query = ref(props.query);

// 歌单列表
var currentContainerId = '';
// 歌单列表切换
function changeCurrentSource(id: string) {
    if (currentContainerId === id) return;

    document.getElementById(currentContainerId)?.classList.remove('current');
    document.getElementById(id)?.classList.add('current');

    let prevContainer = document.getElementById('search_' + currentContainerId);
    let nextContainer = document.getElementById('search_' + id);

    if (nextContainer) {
        if (prevContainer) prevContainer.classList.remove('current');
        nextContainer.classList.add('current');
    }

    currentContainerId = id;
}
function onSourceTabClick(event: any) {
    let target = event.target;
    if (event.target.tagName === 'IMG' || event.target.tagName === 'LABEL') {
        target = event.target.parentElement;
    }
    if (target.tagName === 'BUTTON') {
        changeCurrentSource(target.id);
    }
}

// 搜索类型列表
var currentTypeId = 'singles';
// 搜索类型切换
function changeCurrentType(type: string) {
    if (type === currentTypeId) return;

    let sourceContainer = document.getElementById('search_' + currentContainerId);

    if (sourceContainer) {
        const prevTypeElement = sourceContainer.querySelector(`#${currentTypeId}`);
        const nextTypeElement = sourceContainer.querySelector(`#${type}`);

        let prevContainer = sourceContainer.querySelector('#type_' + currentTypeId);
        let nextContainer = sourceContainer.querySelector('#type_' + type);

        if (prevTypeElement) {
            prevTypeElement.classList.remove('current');
        }
        if (nextTypeElement) {
            nextTypeElement.classList.add('current');
        }

        if (prevContainer && nextContainer) {
            prevContainer.classList.remove('current');
            nextContainer.classList.add('current');
        }

        currentTypeId = type;
    }
}
function onTypeTabClick(event: any) {
    let target = event.target;
    if (event.target.tagName === 'IMG' || event.target.tagName === 'LABEL') {
        target = event.target.parentElement;
    }
    if (target.tagName === 'BUTTON') {
        changeCurrentType(target.id);
    }
}

// 搜索类型标签页组件
const TypesTabs = defineComponent({
    props: {
        parentId: String
    },
    setup(props: { parentId: string }) {
        const handleTypeTabClick = (event: any) => onTypeTabClick(event);
        return () => (
            <div class="musicBox types flex column" id={props.parentId}>
                <span class="flex row" id="typeTabs">
                    <button class="tabWidget typeTab text small current" id="singles" onClick={handleTypeTabClick}>单曲</button>
                    <button class="tabWidget typeTab text small" id="songlists" onClick={handleTypeTabClick}>歌单</button>
                    <button class="tabWidget typeTab text small" id="albums" onClick={handleTypeTabClick}>专辑</button>
                    <button class="tabWidget typeTab text small" id="artists" onClick={handleTypeTabClick}>歌手</button>
                </span>
                <div class="musicContainer">
                    <div class="musicBox singles current" id="type_singles">
                        <SongCard coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                        <SongCard coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                        <SongCard coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                        <SongCard coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                        <SongCard coverUrl="/images/player/testAlbum.png" name="Sample Text" authors="示例文字"></SongCard>
                    </div>
                    <div class="musicBox songlists" id="type_songlists">
                        <SonglistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        <SonglistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        <SonglistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        <SonglistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        <SonglistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        <SonglistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                    </div>
                    <div class="musicBox songlists" id="type_albums">
                        <SonglistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        <SonglistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        <SonglistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                        <SonglistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></SonglistCard>
                    </div>
                    <div class="musicBox artists" id="type_artists">
                        <ArtistCard coverUrl="/images/player/testAlbum.png" name="Sample.text"></ArtistCard>
                    </div>
                </div> 
            </div>
        );
    }
});


onMounted(() => {
    console.log('Search.vue loaded');

    changeCurrentSource('netease');
});
</script>

<template>
    <div class="flex column" id="musicSearch">
        <!-- 标题 -->
        <label class="text large bold" id="searchTitle">'{{ query }}' 的搜索结果</label>

        <!-- 内容 -->
        <div class="flex column" id="searchSourceContainer">
            <span class="flex row" id="searchSourceTabs">
                <button class="tabWidget sourceTab flex row current" id="netease" @click="onSourceTabClick">
                    <img src="/images/platforms/netease.png"/>
                    <label class="text bold small">网易云音乐</label>
                </button>
                <button class="tabWidget sourceTab flex row" id="qqmusic" @click="onSourceTabClick">
                    <img src="/images/platforms/qqmusic.png"/>
                    <label class="text bold small">QQ音乐</label>
                </button>
                <button class="tabWidget sourceTab flex row" id="kuwo" @click="onSourceTabClick">
                    <img src="/images/platforms/kuwo.png"/>
                    <label class="text bold small">酷我音乐</label>
                </button>
                <button class="tabWidget sourceTab flex row" id="kugou" @click="onSourceTabClick">
                    <img src="/images/platforms/kugou.png"/>
                    <label class="text bold small">酷狗音乐</label>
                </button>
            </span>
            <div class="musicContainer" id="searchTypeTabs">
                <TypesTabs parentId="search_netease"></TypesTabs>

                <TypesTabs parentId="search_qqmusic"></TypesTabs>

                <TypesTabs parentId="search_kuwo"></TypesTabs>

                <TypesTabs parentId="search_kugou"></TypesTabs>
            </div>
        </div>
    </div>
</template>
