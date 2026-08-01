// 应用路由管理器 (vue-router)

import { createRouter, createWebHashHistory } from 'vue-router';

import Home from '../components/home/Home.vue';
import Library from '../components/library/Library.vue';
import Search from '../components/search/Search.vue';
import Settings from '../components/settings/Settings.vue';
import Accounts from '../components/accounts/Accounts.vue';
import Playlist from '../components/playlist/Playlist.vue';
import History from '../components/history/History.vue';
import Local from '../components/local/Local.vue';
import Songlist from '../components/songlist/Songlist.vue';
import Single from '../components/single/Single.vue';
import Artist from '../components/artist/Artist.vue';
import ArtistCollections from '../components/collections/ArtistCollections.vue';
import SonglistCollections from '../components/collections/SonglistCollections.vue';
import SingleCollections from '../components/collections/SingleCollections.vue';

const routes = [
    { path: '/',                         name: 'home',                component: Home },
    { path: '/library',                  name: 'library',             component: Library },
    { path: '/search',                   name: 'search',              component: Search },
    { path: '/settings',                 name: 'settings',            component: Settings },
    { path: '/accounts',                 name: 'accounts',            component: Accounts },
    { path: '/playlist',                 name: 'playlist',            component: Playlist },
    { path: '/history',                  name: 'history',             component: History },
    { path: '/local',                    name: 'local',               component: Local },
    { path: '/songlist/:id',             name: 'songlist',            component: Songlist, props: true },
    { path: '/single/:id',               name: 'single',              component: Single, props: true },
    { path: '/artist/:id',               name: 'artist',              component: Artist, props: true },
    {
        path: '/collections/songlist',
        name: 'songlistCollections',
        component: SonglistCollections,
        props: (route: any) => ({ title: route.query.title, module: route.query.module })
    },
    {
        path: '/collections/single',
        name: 'singleCollections',
        component: SingleCollections,
        props: (route: any) => ({ title: route.query.title, module: route.query.module })
    },
    {
        path: '/collections/artist',
        name: 'artistCollections',
        component: ArtistCollections,
        props: (route: any) => ({ title: route.query.title, module: route.query.module })
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
