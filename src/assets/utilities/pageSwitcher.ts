// 应用页面切换器

import { createApp } from "vue";

import Home from '../../components/home/Home.vue';
import Library from '../../components/library/Library.vue';
import Search from '../../components/search/Search.vue';
import Settings from '../../components/settings/Settings.vue';

import Playlist from '../../components/playlist/Playlist.vue';

import Songlist from "../../components/songlist/Songlist.vue";

// 应用各页面
const appPageNames = ['home', 'library', 'search', 'settings', 'playlist', 'songlist'];
var pageComponents: { [key: string]: any } = {
    'home': Home,
    'library': Library,
    'search': Search,
    'settings': Settings,
    'playlist': Playlist,
    'songlist': Songlist
};

let currentPage = 'home';
let pageStack = ['home']; // 页面堆栈
let backedPages: string[] = []; // 回退页面堆栈
let pageApp = createApp(Home);

/**
 * ### 切换应用页面
 * 
 * @param pageId 切换的页面 ID
 * @param pushStack 是否加入堆栈
 * @param idParam 向页面传递参数
 */
function changePage(pageId: string, pushStack: boolean = true, idParam?: string) {
    let currentTab = document.getElementById(currentPage) as HTMLButtonElement;
    let newTab = document.getElementById(pageId) as HTMLButtonElement;
    if (currentTab) {
        currentTab.classList.remove('current');
        if (pageId === 'home' || pageId === 'library') newTab.classList.add('current');
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
        else if (pageId === 'songlist') { // 传递歌单 ID
            pageComponents[pageId].props = { id: idParam };
            pageApp = createApp(pageComponents[pageId], { id: idParam });
        }
        else {
            pageApp = createApp(pageComponents[pageId]);
        }

        if (pushStack) pageStack.push(pageId);
        pageApp.mount('#pageContent');
    }
    currentPage = pageId;
}

// 回退页面
function pageBack() {
    if (pageStack.length <= 1) return;
    let targetPage = pageStack[pageStack.length - 2];
    let backed = pageStack.pop();
    if (backed) backedPages.push(backed);

    changePage(targetPage, false);
}

// 前进页面
function pageForward() {
    if (backedPages.length === 0) return;
    let targetPage = backedPages[backedPages.length - 1];

    backedPages.pop();

    changePage(targetPage);
}

// 返回当前页面
function getCurrentPage() {
    return currentPage;
}

// 初始化
function initialize() {
    pageApp.mount('#pageContent');
}

export {
    initialize,
    changePage,
    pageBack,
    pageForward,
    getCurrentPage
}
