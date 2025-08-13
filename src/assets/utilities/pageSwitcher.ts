// 应用页面切换器

import { createApp } from "vue";

import Home from '../../components/home/Home.vue';
import Library from '../../components/library/Library.vue';
import Search from '../../components/search/Search.vue';
import Settings from '../../components/settings/Settings.vue';
import Accounts from '../../components/accounts/Accounts.vue';

import Playlist from '../../components/playlist/Playlist.vue';

import Songlist from "../../components/songlist/Songlist.vue";
import Single from "../../components/single/Single.vue";
import Artist from "../../components/artist/Artist.vue";
import ArtistCollections from "../../components/collections/ArtistCollections.vue";
import SonglistCollections from "../../components/collections/SonglistCollections.vue";
import SingleCollections from "../../components/collections/SingleCollections.vue";

// 应用各页面
const appPageNames = [
    'home', 'library', 'search', 'settings', 'accounts',
    'playlist', 
    'songlist', 'single', 'artist',
    'artistCollections', 'songlistCollections', 'singleCollections'
];
var pageComponents: { [key: string]: any } = {
    'home': Home,
    'library': Library,
    'search': Search,
    'settings': Settings,
    'accounts': Accounts,
    'playlist': Playlist,
    'songlist': Songlist,
    'single': Single,
    'artist': Artist,
    'artistCollections': ArtistCollections,
    'songlistCollections': SonglistCollections,
    'singleCollections': SingleCollections
};
const pageHighlights = ['home', 'library', 'search', 'settings', 'accounts'];

let currentPage = '';
let latestPage = '';
let pageStack: string[] = []; // 页面堆栈
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
    }
    if (pageHighlights.includes(pageId)) {
        newTab.classList.add('current');
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
        else if (pageId === 'songlist' || pageId === 'single' || pageId === 'artist') { // 传递详细信息 ID
            pageComponents[pageId].props = { id: idParam };
            pageApp = createApp(pageComponents[pageId], { id: idParam });
        }
        else if (pageId === 'artistCollections' || pageId === 'songlistCollections' || pageId === 'singleCollections') { // 传递集锦标题
            pageComponents[pageId].props = { title: idParam, type: pageId.replace('Collections', '') };
            pageApp = createApp(pageComponents[pageId], { title: idParam, type: pageId.replace('Collections', '') });
        }
        else {
            pageApp = createApp(pageComponents[pageId]);
        }

        if (pushStack) pageStack.push(pageId);
        pageApp.mount('#pageContent');
    }
    currentPage = pageId;
}

// 标签页点击切换页面
function onTabChange(event: any) {
    let target = event.target;
    let currentPage = getCurrentPage();
    if (event.target.tagName === 'IMG') target = event.target.parentElement;
    if (target.id !== currentPage) {
        changePage(target.id);
    }
}

// 切换播放列表
function togglePlaylist(_: MouseEvent) {
    let currentPage = getCurrentPage();

    if (currentPage === 'playlist') {
        changePage(latestPage);
    }
    else {
        latestPage = currentPage;
        changePage('playlist');
    }
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
    changePage('home');
}

export {
    initialize,
    changePage,
    onTabChange,
    pageBack,
    pageForward,
    getCurrentPage,
    togglePlaylist
}
