// 应用页面切换器 (vue-router 适配版)

import router from '../../router/index.ts';
import { getAccountInfo } from "../user/accountManager";
import { getConfig } from "../user/configLoader";

/**
 * ### 切换应用页面 (基于 vue-router)
 *
 * 按钮高亮由 App.vue 中的 router.afterEach 全局处理。
 *
 * @param pageId 切换的页面 ID
 * @param pushStack 是否加入历史堆栈
 * @param idParam 向页面传递参数
 */
function changePage(pageId: string, pushStack: boolean = true, idParam?: any) {
    let routeLocation: any;

    switch (pageId) {
        case 'home':
            routeLocation = '/';
            break;
        case 'library':
            routeLocation = '/library';
            break;
        case 'search': {
            routeLocation = '/search';
            break;
        }
        case 'settings':
            routeLocation = '/settings';
            break;
        case 'accounts':
            routeLocation = '/accounts';
            break;
        case 'playlist':
            routeLocation = '/playlist';
            break;
        case 'history':
            routeLocation = '/history';
            break;
        case 'local':
            routeLocation = '/local';
            break;
        case 'songlist':
            routeLocation = `/songlist/${idParam}`;
            break;
        case 'single':
            routeLocation = `/single/${idParam}`;
            break;
        case 'artist':
            routeLocation = `/artist/${idParam}`;
            break;
        case 'songlistCollections':
            routeLocation = {
                name: 'songlistCollections',
                query: { title: idParam?.title || '', module: idParam?.module || '' }
            };
            break;
        case 'singleCollections':
            routeLocation = {
                name: 'singleCollections',
                query: { title: idParam?.title || '', module: idParam?.module || '' }
            };
            break;
        case 'artistCollections':
            routeLocation = {
                name: 'artistCollections',
                query: { title: idParam?.title || '', module: idParam?.module || '' }
            };
            break;
        default:
            console.warn(`[pageSwitcher] Unknown page: ${pageId}`);
            return;
    }

    // 执行路由跳转
    if (pushStack) {
        router.push(routeLocation);
    } else {
        router.replace(routeLocation);
    }

    // 自动回到顶端
    const pageContainer = document.getElementById('pageContainer') as HTMLElement;
    if (pageContainer) {
        pageContainer.scrollTo({ top: 0 });
    }

    updatePlaylistIcon();
}

// 标签页点击切换页面
function onTabChange(event: any) {
    let target = event.target;
    if (event.target.tagName === 'IMG' || event.target.tagName === 'LABEL') {
        target = event.target.parentElement;
    }
    if (target.id !== getCurrentPage()) {
        changePage(target.id);
    }
}

// 切换播放列表
function togglePlaylist(_?: MouseEvent) {
    const currentPath = router.currentRoute.value.path;

    if (currentPath === '/playlist') {
        pageBack();
    } else {
        changePage('playlist');
    }
    updatePlaylistIcon();
}

// 回退页面
function pageBack() {
    router.back();
}

// 前进页面
function pageForward() {
    router.forward();
}

// 返回当前页面 ID
function getCurrentPage(): string {
    const route = router.currentRoute.value;
    const name = route.name as string | null;

    if (!name) return 'home';

    // 路由名称与页面 ID 一一对应，直接返回
    return name;
}

// 更改播放列表显示状态图标
function updatePlaylistIcon() {
    const listStateElem = document.getElementById('playlistState') as HTMLImageElement;
    if (!listStateElem) {
        console.error(`[Error] Failed to get element #playlistState`);
        return false;
    }
    const playlistEnabled = router.currentRoute.value.path === '/playlist';
    listStateElem.src = `./images/player/playlist${playlistEnabled ? '.on' : ''}.svg`;

    return playlistEnabled;
}

/** 与 AppSettings.xml dropbox 的 item id 对应的路由路径映射 */
const INITIAL_PAGE_ROUTES = ['/', '/library', '/search'];

// 初始化
function initialize() {
    const platformList = ['netease', 'qqmusic', 'kuwo', 'kugou'];
    let loginedCount = 0;
    const states = getAccountInfo();
    platformList.forEach((platform) => {
        if (states[platform].loggedIn) loginedCount++;
    });

    if (loginedCount === 0) {
        router.push('/accounts');
        return;
    }

    // 根据 initialPage 设置项决定启动页面
    const config = getConfig();
    const initialPage: number = parseInt(config.generic.appearance.window.initialPage) || 0;
    const targetRoute = INITIAL_PAGE_ROUTES[initialPage] || '/';
    console.log(`Initializing appliation at page ${targetRoute}`);
    router.push(targetRoute);
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
