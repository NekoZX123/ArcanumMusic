import { getNeteaseAlbum, getNeteaseArtist, getNeteaseHotList, getNeteaseLyrics, getNeteaseNewAlbum, getNeteaseNewSong, getNeteasePlaylist, getNeteaseRankingContent, getNeteaseRankings, getNeteaseRecommendArtist, getNeteaseRecommendSong, getNeteaseSearchResult, getNeteaseSongInfo, getNeteaseSonglink } from '../scripts/netease/neteaseRequest.ts';
import { getKuwoAlbum, getKuwoArtist, getKuwoHotList, getKuwoLyrics, getKuwoNewAlbum, getKuwoNewSong, getKuwoPlaylist, getKuwoRankingContent, getKuwoRankings, getKuwoRecommendArtist, getKuwoRecommendSong, getKuwoSearchResult, getKuwoSongInfo, getKuwoSonglink } from '../scripts/kuwo/kuwoRequest.ts';
import { getKugouAlbum, getKugouArtist, getKugouHotList, getKugouLyrics, getKugouNewAlbums, getKugouNewSong, getKugouRankings, getKugouRankinngContent, getKugouRecommendArtist, getKugouRecommendSong, getKugouSearchResult, getKugouSongInfo, getKugouSonglink, getKugouSonglist } from '../scripts/kugou/kugouRequest.ts';
import { getQQmusicResult } from '../scripts/qqmusic/qqmusicRequest.ts';

// 测试请求 (网易云音乐)
function testNeteaseRequests(id: number = 1) {
    const udebug = '[YOUR_MUSIC_U_HERE]'; // 替换为你的网易云音乐用户标识
    if (id === 1) {
        getNeteaseSonglink('2600877270', 'jymaster', { MUSIC_U: udebug }).then((response) => console.log(response.data));
    }
    else if (id === 2) {
        getNeteaseSearchResult('Blue Canvas', { MUSIC_U: udebug }).then((response) => console.log(response.data));
    }
    else if (id === 3) {
        getNeteaseLyrics('2600877270', { MUSIC_U: udebug }).then((response) => console.log(response.data));
    } 
    else if (id === 4) {
        getNeteaseSongInfo('2600877270').then((response) => console.log(response.data));
    }
    else if (id === 5) {
        getNeteasePlaylist('577991289').then((response) => console.log(response.data));
    }
    else if (id === 6) {
        getNeteaseAlbum('274252578').then((response) => console.log(response.data));
    }
    else if (id === 7) {
        getNeteaseArtist(6452).then((response) => console.log(response.data));
    }
    else if (id === 8) {
        getNeteaseHotList().then((response) => console.log(response.data));
    }
    else if (id === 9) {
        getNeteaseRecommendSong().then((response) => console.log(response.data));
    }
    else if (id === 10) {
        getNeteaseRecommendArtist().then((response) => console.log(response.data));
    }
    else if (id === 11) {
        getNeteaseRankings().then((response) => console.log(response.data));
    }
    else if (id === 12) {
        getNeteaseRankingContent('19723756').then((response) => console.log(response.data));
    }
    else if (id === 13) {
        getNeteaseNewSong().then((response) => console.log(response.data));
    }
    else if (id === 14) {
        getNeteaseNewAlbum().then((response) => console.log(response.data));
    }
    else {
        console.error(`[Error] Unknown test code (netease): ${id}`);
    }
}
// 测试请求 (酷我音乐)
function testKuwoRequests(id: number = 1) {
    if (id === 1) {
        getKuwoSonglink('287928307').then((response) => console.log(response.data));
    }
    else if (id === 2) {
        getKuwoSearchResult('Blue Canvas').then((response) => console.log(response.data));
    }
    else if (id === 3) {
        getKuwoLyrics('287928307').then((response) => console.log(response.data));
    }
    else if (id === 4) {
        getKuwoSongInfo('287928307').then((response) => console.log(response.data));
    }
    else if (id === 5) {
        getKuwoPlaylist('3589494793').then((response) => console.log(response.data));
    }
    else if (id === 6) {
        getKuwoAlbum('43678014').then((response) => console.log(response.data));
    }
    else if (id === 7) {
        getKuwoArtist('7620042').then((response) => console.log(response.data));
    }
    else if (id === 8) {
        getKuwoHotList().then((response) => console.log(response.data));
    }
    else if (id === 9) {
        getKuwoRecommendSong().then((response) => console.log(response.data));
    }
    else if (id === 10) {
        getKuwoRecommendArtist().then((response) => console.log(response.data));
    }
    else if (id === 11) {
        getKuwoRankings().then((response) => console.log(response.data));
    }
    else if (id === 12) {
        getKuwoRankingContent('93').then((response) => console.log(response.data));
    }
    else if (id === 13) {
        getKuwoNewSong().then((response) => console.log(response.data));
    }
    else if (id === 14) {
        getKuwoNewAlbum().then((response) => console.log(response.data));
    }
    else {
        console.error(`[Error] Unknown test code (kuwo): ${id}`);
    }
}
// 测试请求 (酷狗音乐)
function testKugouRequests(id: number = 1) {
    const kugouUser = '[YOUR_KUGOU_USER_HERE]'; // 替换为你的酷狗用户标识
    if (id === 1) {
        getKugouSonglink('9xlu7513', { KuGoo: kugouUser }).then((response) => console.log(response.data));
    }
    else if (id === 2) {
        getKugouSearchResult('Shooting Athletes').then((response) => console.log(response.data));
    }
    else if (id === 3) {
        getKugouSongInfo('8y83yg8c', { KuGoo: kugouUser }).then((response) => console.log(response.data));
    }
    else if (id === 4) {
        getKugouLyrics('8y83yg8c', { KuGoo: kugouUser }).then((lyrics) => console.log(lyrics));
    }
    else if (id === 5) {
        getKugouSonglist('3ica83f', { KuGoo: kugouUser }).then((response) => console.log(response.data));
    }
    else if (id === 6) {
        getKugouAlbum('79746522', { KuGoo: kugouUser }).then((response) => console.log(response.data));
    }
    else if (id === 7) {
        getKugouArtist(7230076).then((response) => console.log(response.data));
    }
    else if (id === 8) {
        getKugouHotList().then((response) => console.log(response.data));
    }
    else if (id === 9) {
        getKugouRecommendSong().then((response) => console.log(response.data));
    }
    else if (id === 10) {
        getKugouRecommendArtist().then((response) => console.log(response.data));
    }
    else if (id === 11) {
        getKugouRankings().then((response) => console.log(response.data));
    }
    else if (id === 12) {
        getKugouRankinngContent(8888).then((response) => console.log(response.data))
    }
    else if (id === 13) {
        getKugouNewSong().then((response) => console.log(response.data))
    }
    else if (id === 14) {
        getKugouNewAlbums().then((response) => console.log(response.data))
    }
    else {
        console.error(`[Error] Unknown test code (kugou): ${id}`);
    }
}
// 测试请求 (QQ音乐)
function testQQMusicRequests(id: number = 1) {
    const token = {
        uin: 114514, // 替换为你的QQ音乐用户ID
        qm_keyst: '[YOUR_QQMUSIC_TOKEN_HERE]' // 替换为你的QQ音乐Token
    };

    if (id === 1) {
        getQQmusicResult('songLink', { songMid: '003UlmlI0hkj8t' }, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 2) {
        getQQmusicResult('search', { keyword: 'Memories of kindness' }, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 3) {
        getQQmusicResult('songInfo', { songMid: '003UlmlI0hkj8t' }, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 4) {
        getQQmusicResult('lyrics', { songMid: '000akynZ2Rbro5' }, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 5) {
        getQQmusicResult('songList', { listId: 8543902164 }, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 6) {
        getQQmusicResult('album', { albumId: '001c5b9s44NoOd' }, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 7) {
        getQQmusicResult('artist', { artistId: '0025NhlN2yWrP4' }, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 8) {
        getQQmusicResult('hotList', {}, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 9) {
        getQQmusicResult('recommendSong', {}, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 10) {
        getQQmusicResult('recommendArtist', {}, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 11) {
        getQQmusicResult('rankings', {}, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 12) {
        getQQmusicResult('rankingContent', { rankingId: 4 }, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 13) {
        getQQmusicResult('newSong', {}, token)
            .then((response) => console.log(response.data));
    }
    else if (id === 14) {
        getQQmusicResult('newAlbum', {}, token)
            .then((response) => console.log(response.data));
    }
}

export { testNeteaseRequests, testKuwoRequests, testKugouRequests, testQQMusicRequests };
