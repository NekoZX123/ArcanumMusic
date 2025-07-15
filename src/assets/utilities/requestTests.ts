import { getNeteaseAlbum, getNeteaseArtist, getNeteaseHotList, getNeteaseLyrics, getNeteaseNewAlbum, getNeteaseNewSong, getNeteasePlaylist, getNeteaseRankingContent, getNeteaseRankings, getNeteaseRecommendArtist, getNeteaseRecommendSong, getNeteaseSearchResult, getNeteaseSongInfo, getNeteaseSonglink } from '../scripts/netease/neteaseRequest.ts';
import { getKuwoAlbum, getKuwoArtist, getKuwoHotList, getKuwoLyrics, getKuwoNewAlbum, getKuwoNewSong, getKuwoPlaylist, getKuwoRankingContent, getKuwoRankings, getKuwoRecommendArtist, getKuwoRecommendSong, getKuwoSearchResult, getKuwoSongInfo, getKuwoSonglink } from '../scripts/kuwo/kuwoRequest.ts';
import { getKugouAlbum, getKugouArtist, getKugouHotList, getKugouLyrics, getKugouNewAlbums, getKugouNewSong, getKugouRankings, getKugouRankinngContent, getKugouRecommendArtist, getKugouRecommendSong, getKugouSearchResult, getKugouSongInfo, getKugouSonglink, getKugouSonglist } from '../scripts/kugou/kugouRequest.ts';
import { getQQmusicResult } from '../scripts/qqmusic/qqmusicRequest.ts';
import { getNeteaseResult } from '../scripts/netease/neteaseRequest.v2.ts';

const MAX_TEST_SAMPLE_ID = 14;
// 模块 ID
const moduleIds: MusicModule[] = ['songLink', 'search', 'songInfo', 'lyrics', 
    'songList', 'album', 'artist', 'hotList', 'recommendSong', 'recommendArtist', 
    'rankings', 'rankingContent', 'newSong', 'newAlbum'];
// 测试样例
const testSamples = {
    'netease': [
        { 'songId': '2600877270' },
        { 'keyword': 'Blue Canvas' },
        { 'songId': '2600877270' },
        { 'songId': '2600877270' },
        { 'listId': '577991289' },
        { 'albumId': '274252578' },
        { 'artistId': 6452 },
        {},
        {},
        {},
        {},
        { 'rankingId': '19723756' },
        {},
        {}
    ],
    'qqmusic': [
        { songMid: '003UlmlI0hkj8t' },
        { keyword: 'Memories of kindness' },
        { songMid: '003UlmlI0hkj8t' },
        { songMid: '000akynZ2Rbro5' },
        { listId: 8543902164 },
        { albumId: '001c5b9s44NoOd' },
        { artistId: '0025NhlN2yWrP4' },
        {},
        {},
        {},
        {},
        { rankingId: 4 },
        {},
        {}
    ]
};
// 用户数据
const userTokens = {
    'netease': {
        'MUSIC_U': '0071F01F0CEF7599B818CF347518D45C699B97E7D5B9C4EA9336D424788F9A4A157B0B89B60268A8760430F6BDE097975E9E8CD0FB94D219095ECC5B10F34BC51BEFD22AEDC71C1A556D534CD06D822B231B3F742F665A8FF2ACB595A5DFCD945F635983BDA8F5705CF4F521AAB5A5F56346C1CD288A28EA4786A42B08E42EF83E1DB2567E46A1E656D545988DD3EAA6C3A69658466E0CCE0BB99873512A783ECCC78FB91F6DA177D77519FED5AE6BC932957890F0FED614EBFD054F9617CB8161B4F450C929CCB712EA1030B35E9AAF992D98E768154EF39D55B0281ABA5722CCBC4F236EFC3A33BCDA71E72C4360B32CAFF0A838D2ED432E5B04422F8D3A8594680639FD34C7379280E5D4FDAFD3352687D414B642FD963CA1FF58B833BD71B06E24C0F986C5467BD618ED14BCAE0E16E7107185A7E4B5053DE4F13F7CB2F7242890FAB0C23C6B275F585330D5324C2B148870D6765A7FD363E62E94BEFF5ACC504400E477A6F9F586257E094E1F5FE2'
    },
    'qqmusic': {
        'uin': 2168979907,
        'qm_keyst': 'Q_H_L_63k3NqEJTNZ6CtEq6DVu615WuWgkgIl6-bqdOoc6lJiEny_FGpl6G2zcjKmXd15rFwcitqxlfzgnysYrBmEhhcSw9SlA7qA'
    }
}

type MusicModule = 'songLink' | 'search' | 'songInfo' | 'lyrics' | 'songList' | 'album' | 'artist' | 
    'hotList' | 'recommendSong' | 'recommendArtist' | 'rankings' | 'rankingContent' | 'newSong' | 'newAlbum';
type testPlatform = 'netease' | 'qqmusic';

/**
 * 发起测试请求
 * @param platform 测试平台 (netease - 网易云音乐; qqmusic - QQ 音乐)
 * @param sampleId 测试 ID
 */
function testRequest(platform: testPlatform, sampleId: number) {
    if (sampleId <= 0 || sampleId > MAX_TEST_SAMPLE_ID) {
        throw new Error(`[Error] Unknown test id: ${sampleId}`);
    }
    const module = moduleIds[sampleId - 1];
    const sampleData = testSamples[platform][sampleId - 1];
    if (platform === 'netease') {
        getNeteaseResult(module, sampleData, userTokens['netease'])
            .then((response) => console.log(response.data));
    }
    else if (platform === 'qqmusic') {
        getQQmusicResult(module, sampleData, userTokens['qqmusic'])
            .then((response) => console.log(response.data));
    }
}

/** 测试请求 (网易云音乐) 
 * @param [id=1] 测试 ID
 * 
 * @deprecated 网易云音乐请求可通过 testRequest() 函数测试, 此函数弃用
*/
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
/** 测试请求 (QQ 音乐) 
 * @param [id=1] 测试 ID
 * 
 * @deprecated QQ 音乐请求可通过 testRequest() 函数测试, 此函数弃用
*/
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

export { testNeteaseRequests, testKuwoRequests, testKugouRequests, testQQMusicRequests, testRequest };
