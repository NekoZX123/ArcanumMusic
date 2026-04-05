import { createRouter, createWebHashHistory, type RouteLocationNormalizedLoaded } from 'vue-router';

import Accounts from '../components/accounts/Accounts.vue';
import Artist from '../components/artist/Artist.vue';
import ArtistCollections from '../components/collections/ArtistCollections.vue';
import SingleCollections from '../components/collections/SingleCollections.vue';
import SonglistCollections from '../components/collections/SonglistCollections.vue';
import Home from '../components/home/Home.vue';
import Library from '../components/library/Library.vue';
import Playlist from '../components/playlist/Playlist.vue';
import Search from '../components/search/Search.vue';
import Settings from '../components/settings/Settings.vue';
import Single from '../components/single/Single.vue';
import Songlist from '../components/songlist/Songlist.vue';

function idProps(route: RouteLocationNormalizedLoaded) {
    return {
        id: String(route.query.id || '')
    };
}

function collectionProps(route: RouteLocationNormalizedLoaded, fallbackTitle: string, fallbackModule: string) {
    return {
        title: String(route.query.title || fallbackTitle),
        module: String(route.query.module || fallbackModule)
    };
}

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/home',
            name: 'home',
            component: Home,
            meta: {
                label: '首页'
            }
        },
        {
            path: '/library',
            name: 'library',
            component: Library,
            meta: {
                label: '音乐库'
            }
        },
        {
            path: '/search',
            name: 'search',
            component: Search,
            meta: {
                label: '搜索'
            }
        },
        {
            path: '/settings',
            name: 'settings',
            component: Settings,
            meta: {
                label: '设置'
            }
        },
        {
            path: '/accounts',
            name: 'accounts',
            component: Accounts,
            meta: {
                label: '账号'
            }
        },
        {
            path: '/playlist',
            name: 'playlist',
            component: Playlist,
            meta: {
                label: '播放队列'
            }
        },
        {
            path: '/songlist',
            name: 'songlist',
            component: Songlist,
            props: idProps,
            meta: {
                label: '歌单详情'
            }
        },
        {
            path: '/single',
            name: 'single',
            component: Single,
            props: idProps,
            meta: {
                label: '单曲详情'
            }
        },
        {
            path: '/artist',
            name: 'artist',
            component: Artist,
            props: idProps,
            meta: {
                label: '歌手详情'
            }
        },
        {
            path: '/artist-collections',
            name: 'artistCollections',
            component: ArtistCollections,
            props: (route: RouteLocationNormalizedLoaded) => collectionProps(route, '歌手合集', 'recommendArtist'),
            meta: {
                label: '歌手合集'
            }
        },
        {
            path: '/songlist-collections',
            name: 'songlistCollections',
            component: SonglistCollections,
            props: (route: RouteLocationNormalizedLoaded) => collectionProps(route, '歌单合集', 'hotList'),
            meta: {
                label: '歌单合集'
            }
        },
        {
            path: '/single-collections',
            name: 'singleCollections',
            component: SingleCollections,
            props: (route: RouteLocationNormalizedLoaded) => collectionProps(route, '单曲合集', 'recommendSong'),
            meta: {
                label: '单曲合集'
            }
        }
    ]
});

export default router;
