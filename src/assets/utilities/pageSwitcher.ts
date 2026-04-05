import router from '../../router';
import { getAccountInfo } from './accountManager';

type page ='home' |'library' | 'search' | 'settings' | 'accounts' |
    'playlist' |
    'songlist' | 'single' | 'artist' |
    'artistCollections' | 'songlistCollections' | 'singleCollections';

function getRouteTarget(pageId: page, idParam?: any) {
    if (['songlist', 'single', 'artist'].includes(pageId)) {
        return {
            name: pageId,
            query: {
                id: typeof idParam === 'string' ? idParam : JSON.stringify(idParam || '')
            }
        };
    }

    if (['artistCollections', 'songlistCollections', 'singleCollections'].includes(pageId)) {
        return {
            name: pageId,
            query: {
                title: idParam?.title || '',
                module: idParam?.module || ''
            }
        };
    }

    return {
        name: pageId
    };
}

function changePage(pageId: page, pushStack: boolean = true, idParam?: any) {
    const navigationTarget = getRouteTarget(pageId, idParam);
    const navigate = pushStack ? router.push : router.replace;

    navigate(navigationTarget);
}

function onTabChange(event: any) {
    let target = event.target;
    let currentPage = getCurrentPage();
    if (event.target.tagName === 'IMG') {
        target = event.target.parentElement;
    }

    if (target.id !== currentPage && target.id) {
        changePage(target.id);
    }
}

function togglePlaylist(_: MouseEvent | undefined) {
    let currentPage = getCurrentPage();

    if (currentPage === 'playlist') {
        pageBack();
    }
    else {
        changePage('playlist');
    }
}

function pageBack() {
    router.back();
}

function pageForward() {
    router.forward();
}

function getCurrentPage() {
    return String(router.currentRoute.value.name || '');
}

function updatePlaylistIcon() {
    return getCurrentPage() === 'playlist';
}

function initialize() {
    const platformList = ['netease', 'qqmusic', 'kuwo', 'kugou'];
    let loginedCount = 0;
    const states = getAccountInfo();
    platformList.forEach((platform) => {
        if (states[platform].loggedIn) {
            loginedCount++;
        }
    });

    const currentPage = getCurrentPage();
    if (!['', 'home', 'accounts'].includes(currentPage)) {
        return;
    }

    if (loginedCount === 0) {
        changePage('accounts', false);
    }
    else {
        changePage('home', false);
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
};
