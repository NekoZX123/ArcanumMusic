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
import { getAccountInfo } from "./accountManager";

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
let pageStack: page[] = []; // 页面堆栈
let paramStack: any[] = []; // 参数堆栈
let historyPages: page[] = []; // 历史页面堆栈
let historyParams: any[] = []; // 历史页面参数
let pageApp = createApp(Home);

type page ='home' |'library' | 'search' | 'settings' | 'accounts' | 
    'playlist' | 
    'songlist' | 'single' | 'artist' | 
    'artistCollections' | 'songlistCollections' | 'singleCollections';
/**
 * ### 切换应用页面
 * 
 * @param pageId 切换的页面 ID
 * @param pushStack 是否加入堆栈
 * @param idParam 向页面传递参数
 */
function changePage(pageId: page, pushStack: boolean = true, idParam?: any) {
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
        else if (pageId === 'artistCollections' || pageId === 'songlistCollections' || pageId === 'singleCollections') { // 传递集锦标题及模块
            pageComponents[pageId].props = idParam;
            pageApp = createApp(pageComponents[pageId], idParam);
        }
        else {
            pageApp = createApp(pageComponents[pageId]);
        }

        if (pushStack) {
            pageStack.push(pageId);
            paramStack.push(idParam || {});
        }
        pageApp.mount('#pageContent');
    }
    currentPage = pageId;

    // 自动回到顶端
    const pageContainer = document.getElementById('pageContainer') as HTMLElement;
    if (pageContainer) {
        pageContainer.scrollTo({ top: 0 });
    }
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
function togglePlaylist(_: MouseEvent | undefined) {
    let currentPage = getCurrentPage();

    if (currentPage === 'playlist') {
        pageBack();
    }
    else {
        changePage('playlist');
    }
    updatePlaylistIcon();
}

// 回退页面
function pageBack() {
    if (pageStack.length <= 1) return;
    const targetPage = pageStack[pageStack.length - 2];
    const pageParams = paramStack[paramStack.length - 2];
    let backed = pageStack.pop();
    let oldParams = paramStack.pop();
    if (backed) {
        historyPages.push(backed);
        historyParams.push(oldParams || {});
    }

    changePage(targetPage, false, pageParams);
    updatePlaylistIcon();
}

// 前进页面
function pageForward() {
    if (historyPages.length === 0) return;
    const targetPage = historyPages[historyPages.length - 1];
    const pageParams = historyParams[historyParams.length - 1];

    historyPages.pop();
    historyParams.pop();

    changePage(targetPage, true, pageParams);
    updatePlaylistIcon();
}

// 返回当前页面
function getCurrentPage() {
    return currentPage;
}

// 更改播放列表显示状态图标
function updatePlaylistIcon() {
    const listStateElem = document.getElementById('playlistState') as HTMLImageElement;
    if (!listStateElem) {
        console.error(`[Error] Failed to get element #playlistState`);
        return;
    }
    const playlistEnabled = getCurrentPage() === 'playlist';
    listStateElem.src = `./images/player/playlist${playlistEnabled ? '.on' : ''}.svg`;

    return playlistEnabled;
}

// 初始化
function initialize() {
    const platformList = ['netease', 'qqmusic', 'kuwo', 'kugou'];
    let loginedCount = 0;
    const states = getAccountInfo();
    platformList.forEach((platform) => {
        if (states[platform].loggedIn) loginedCount++;
    });

    if (loginedCount === 0) {
        changePage('accounts');
    }
    else {
        changePage('home');
    }
    
}

export {
    initialize,
    changePage,
    onTabChange,
    pageBack,
    pageForward,
    getCurrentPage,
    togglePlaylist,
    updatePlaylistIcon
}
