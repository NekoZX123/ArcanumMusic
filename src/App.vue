<script setup lang="ts">
import { createApp, onMounted, ref } from 'vue';
import Home from './components/home/Home.vue';
import Library from './components/library/Library.vue';
import Search from './components/search/Search.vue';
import Settings from './components/settings/Settings.vue';

// 应用各页面
const appPageNames = ['home', 'library', 'search', 'settings'];
var pageComponents: { [key: string]: any } = {
    'home': Home,
    'library': Library,
    'search': Search,
    'settings': Settings
};

/* 窗口移动功能 */
let startX = 0;
let startY = 0;
let isMoving = false;

// 最小化窗口
function minimizeWindow() {
    (window as any).electron.minimizeWindow();
}

// 最大化 / 还原窗口
const maxButtonSrc = ref('/images/windowControl/maximize.svg');
async function toggleMaximize() {
    let winMaximumState = await (window as any).electron.toggleMaximize();

    if (winMaximumState) {
        maxButtonSrc.value = maxButtonSrc.value.replace('maximize.svg', 'restore.svg');
    }
    else {
        maxButtonSrc.value = maxButtonSrc.value.replace('restore.svg', 'maximize.svg');
    }
}

// 关闭当前窗口
const closeButtonSrc = ref('/images/windowControl/close.svg');
function closeHover() {
    closeButtonSrc.value = '/images/windowControl/close.hover.svg';
}
function closeUnHover() {
    closeButtonSrc.value = '/images/windowControl/close.svg';
}
function closeWindow() {
    (window as any).electron.closeWindow();
}

// 移动窗口
async function titlebarMouseDown(event: any) {
    let e = document.elementFromPoint(event.x, event.y);
    if (!e) return;
    if (e.id === 'windowControlBar' && event.buttons === 1) {
        startX = event.x;
        startY = event.y;
        isMoving = true;
    }
}

function titlebarMouseMove(event: any) {
    if (event.buttons === 1 && isMoving) {
        let currentX = event.x - startX;
        let currentY = event.y - startY;
        let winRect = (window as any).electron.getWindowRect();
        (window as any).electron.moveWindow(winRect.x + currentX, winRect.y + currentY);
    }
}

function titlebarMouseUp() {
    startX = 0;
    startY = 0;
    isMoving = false;
}

// 页面挂载切换器
var currentPage = 'home';
var pageApp = createApp(Home);
function onTabChange(event: any) {
    let target = event.target;
    if (event.target.tagName === 'IMG') target = event.target.parentElement;
    if (target.id !== currentPage) {
        let pageId = target.id;

        let currentTab = document.getElementById(currentPage) as HTMLButtonElement;
        let newTab = document.getElementById(pageId) as HTMLButtonElement;
        if (currentTab) {
            currentTab.classList.remove('current');
            if (pageId !== 'settings') newTab.classList.add('current');
        }

        if (appPageNames.includes(pageId)) {
            pageApp.unmount();

            if (pageId === 'search') { // 传递搜索关键词
                let searchBar = document.getElementById('search') as HTMLInputElement;
                if (searchBar) {
                    // console.log(searchBar.value);
                    pageComponents[pageId].props = { query: searchBar.value };
                    pageApp = createApp(pageComponents[pageId], { query: searchBar.value });
                }
            }
            else {
                pageApp = createApp(pageComponents[pageId]);
            }

            pageApp.mount('#pageContent');
        }
        currentPage = pageId;
    }
}

function searchInFocus() {
    let clearButton = document.getElementById('clearButton');
    if (clearButton) clearButton.style.display = 'block';
}
function searchOutFocus() {
    let clearButton = document.getElementById('clearButton');
    if (clearButton) setTimeout(() => {
        clearButton.style.display = 'none'
    }, 100);
}
function clearSearchBar() {
    console.log('114514');
    let bar = document.getElementById('search') as HTMLInputElement;
    if (bar) {
        bar.value = '';
    }
}

onMounted(() => {
    pageApp.mount('#pageContent');
});
</script>

<template>
    <div>
        <!-- 窗口标题栏 -->
        <div class="flex row" id="windowControlBar"  
            @mousedown="titlebarMouseDown" @mousemove="titlebarMouseMove" @mouseup="titlebarMouseUp">
            <span class="flex row" id="windowDrag">
                <img id="appIcon" src="/images/appIcon/appIcon.png"/>
                <label class="text small">Arcanum Music</label>
            </span>
            <span id="windowOptions">
                <button class="windowControl default" id="minimizeButton" @click="minimizeWindow">
                    <img src="/images/windowControl/minimize.svg" alt="Minimize">
                </button>
                <button class="windowControl default" id="maximizeButton" @click="toggleMaximize">
                    <img :src="maxButtonSrc" alt="Maximize / Restore">
                </button>
                <button class="windowControl close" id="closeButton" 
                    @click="closeWindow" @mouseenter="closeHover" @mouseleave="closeUnHover">
                    <img :src="closeButtonSrc" alt="Close">
                </button>
            </span>
        </div>

        <div id="appMain">
            <div class="flex row" id="windowTop">
                <div class="flex row" id="windowTabs">
                    <button class="text small tabWidget pageTab current" id="home" @click="onTabChange">首页</button>
                    <button class="text small tabWidget pageTab" id="library" @click="onTabChange">音乐库</button>
                </div>

                <!-- 搜索框 -->
                <span id="searchContainer">
                    <label class="text small" id="searchPrev">🔍</label>
                    <input class="textInput text ultraSmall" id="search" type="text" placeholder="搜索..."
                        @focusin="searchInFocus" @focusout="searchOutFocus" @keypress.enter="onTabChange"/>
                    <button class="text small" id="clearButton" @click="clearSearchBar">
                        <img src="/images/topbar/clear.svg" alt="Clear search bar"/>
                    </button>
                </span>

                <button id="settings" @click="onTabChange">
                    <img src="/images/topbar/settings.svg" alt="Application settings"/>
                </button>
            </div>

            <div id="pageContent"></div>
        </div>
    </div>
</template>
