<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';

import '../../globalStyle.css';
import { showNotify } from '../../assets/notifications/Notification.ts';
import './localStyle.css';
import { LocalSongLine } from '../../assets/widgets/Widgets';
import { getPlayer } from '../../assets/player/player.ts';

const scanPaths: Ref<string[]> = ref([]);
const localMusic: Ref<any[]> = ref([]);

const showScanPathManager = ref(false);
const manageBtnRef = ref<HTMLElement | null>(null);
const scanPathManagerStyle = ref({ left: '0px', bottom: '0px' });

function toggleScanPathManager() {
    if (manageBtnRef.value) {
        const btnRect = manageBtnRef.value.getBoundingClientRect();
        const page = document.getElementById('localPage')!;
        const pageRect = page.getBoundingClientRect();
        scanPathManagerStyle.value = {
            left: `${btnRect.left - pageRect.left}px`,
            bottom: `${pageRect.bottom - btnRect.bottom + 4}px`,
        };
    }
    showScanPathManager.value = true;
}

function closeScanPathManager() {
    showScanPathManager.value = false;
}

function openMusicFolder(folderPath: string) {
    window.electron.openMusicFolder(folderPath);
}

async function removeScanPath(folderPath: string) {
    if (scanPaths.value.length <= 1) {
        showNotify('local.removePathRejected', 'warning', '无法移除', '至少保留一个扫描路径');
        return;
    }
    scanPaths.value = scanPaths.value.filter(p => p !== folderPath);

    const pathList = Object.assign([], scanPaths.value);
    await window.electron.writeLocalPaths(pathList);
}

async function addScanPath() {
    const selectedPath = await window.electron.selectFolder();
    if (!selectedPath) return;

    const normalizedPath = selectedPath.replaceAll('\\', '/');
    if (scanPaths.value.includes(normalizedPath)) { // 路径已存在
        showNotify('local.pathExists', 'warning', '路径已存在', normalizedPath);
        return;
    }

    scanPaths.value.push(normalizedPath);

    const pathList = Object.assign([], scanPaths.value);
    await window.electron.writeLocalPaths(pathList);
}

onMounted(async () => {
    const paths = await window.electron.getLocalPaths();
    scanPaths.value = paths.map(p => p.toString());

    try {
        const dirs = await window.electron.scanLocalMusic();
        console.log(dirs);
        const results: any[] = [];

        for (const { path: dir, files } of dirs) {
            const metadataPromises = files.map((file: string) =>
                window.electron.getMusicMetadata(`${dir}/${file}`).then(meta => ({
                    id: `local_${dir}/${file}`,
                    path: `${dir}/${file}`,
                    name: meta.name,
                    coverUrl: meta.songCover ? meta.songCover : './images/player/testAlbum.png',
                    authors: meta.author,
                    duration: meta.duration,
                    ext: meta.ext,
                    sizeBytes: meta.size
                })).catch(() => null)
            );
            const entries = await Promise.all(metadataPromises);
            results.push(...entries.filter(e => e !== null));
        }

        localMusic.value = results;
        console.log(results);
    } catch (e) {
        console.error('[Error] Failed to load local music:', e);
    }

    console.log('Local.vue loaded');
});
</script> 
<template>
    <div class="flex column" id="localPage">
        <!-- 本地音乐信息 -->
        <div class="flex row" id="localHeader">
            <div id="songlistCoverContainer">
                <img src="/images/player/testAlbum.png" id="songlistCover"/>
            </div>
            <div class="flex column" id="localInfo">
                <div class="flex column">
                    <label class="text xxlarge bold">本地音乐</label>
                    <label class="text ultraSmall grey">{{ `共 ${localMusic.length} 首` }}</label>
                    <label class="text ultraSmall" id="listDescription">此处显示了本地存储的音乐</label>
                </div>
                <div class="flex row" id="localButtonGroup">
                    <button class="flex row listButton" id="playAllContent" @click="getPlayer()?.playByList(localMusic, true)">
                        <img class="outlineImage" src="/images/player/play.dark.svg"></img>
                        <label class="text small bold">播放</label>
                    </button>
                    <button ref="manageBtnRef" class="flex row listButton" id="manageScanPaths" @click="toggleScanPathManager">
                        <img class="outlineImage" src="/images/library/downloads.svg"></img>
                        <label class="text small bold">管理扫描路径</label>
                    </button>
                </div>
            </div>
        </div>

        <!-- 扫描路径管理窗口 -->
        <Transition name="slide-up">
            <div v-if="showScanPathManager" :style="scanPathManagerStyle" class="flex column" id="scanPathManager">
                <div class="flex row" id="scanPathTitle">
                    <label class="text small">本地音频扫描路径</label>
                    <button id="closeScanPathManager" @click="closeScanPathManager">
                    <img class="outlineImage" src="/images/windowControl/close.svg"/>
                </button>
            </div>
            <div class="flex column" id="scanPathsList">
                <div v-for="path in scanPaths" :key="path">
                    <label class="text ultraSmall" :title="path">{{ path }}</label>
                    <button class="flex row pathManageButton" @click="openMusicFolder(path)">
                        <img class="outlineImage" src="/images/library/openFolder.svg"/>
                        <label class="text ultraSmall">查看</label>
                    </button>
                    <button class="flex row pathManageButton" @click="removeScanPath(path)">
                        <img class="outlineImage" src="/images/library/remove.svg"/>
                        <label class="text ultraSmall">移除</label>
                    </button>
                </div>
            </div>
            <div class="flex row" id="addPathContainer">
                <button id="addScanPath" class="flex row" @click="addScanPath">
                    <img class="outlineImage" src="/images/library/addPath.svg"/>
                    <label class="text small">添加</label>
                </button>
            </div>
        </div>
        </Transition>

        <!-- 本地音乐内容 -->
        <div class="flex column" id="localContent">
            <LocalSongLine v-for="info in localMusic"
                :key="`local_${info.path}`"
                :id="info.id"
                :name="info.name"
                :cover-url="info.coverUrl"
                :authors="info.authors"
                :duration="info.duration"
                :ext="info.ext"
                :size-bytes="info.sizeBytes"
            ></LocalSongLine>
        </div>
    </div>
</template>