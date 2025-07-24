import { getNeteaseResult } from '../scripts/netease/neteaseRequest.ts';
import { getQQmusicResult } from '../scripts/qqmusic/qqmusicRequest.ts';
import { getKuwoResult } from '../scripts/kuwo/kuwoRequest.ts';
import { getKugouResult } from '../scripts/kugou/kugouRequest.ts';

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
    ],
    'kuwo': [
        { songId: '287928307' },
        { keyword: 'Blue Canvas' },
        { songId: '287928307' },
        { songId: '287928307' },
        { listId: '3589494793' },
        { albumId: '43678014' },
        { artistId: '7620042' },
        {},
        {},
        {},
        {},
        { rankingId: '93' },
        {},
        {}
    ],
    'kugou': [
        { songId: '9xlu7513' },
        { keyword: 'Shooting Athletes' },
        { songId: '8y83yg8c' },
        { songId: '8y83yg8c' },
        { listId: '3ica83f' },
        { albumId: '79746522' },
        { artistId: 7230076 },
        {},
        {},
        {},
        {},
        { rankingId: 8888 },
        {},
        {}
    ]
};
// 用户数据 (替换为自己的用户Token)
const userTokens = {
    'netease': {
        'MUSIC_U': '[YOUR_MUSIC_U_PARAM_HERE]'
    },
    'qqmusic': {
        'uin': 114514,
        'qm_keyst': '[YOUR_QM_KEYST_PARAM_HERE]'
    },
    'kuwo': {
        'userid': '1919810'
    },
    'kugou': {
        'KuGoo': '[YOUR_KUGOO_PARAM_HERE]'
    }
}

type MusicModule = 'songLink' | 'search' | 'songInfo' | 'lyrics' | 'songList' | 'album' | 'artist' | 
    'hotList' | 'recommendSong' | 'recommendArtist' | 'rankings' | 'rankingContent' | 'newSong' | 'newAlbum';
type testPlatform = 'netease' | 'qqmusic' | 'kuwo' | 'kugou';

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
    else if (platform === 'kuwo') {
        getKuwoResult(module, sampleData, userTokens['kuwo'])
            .then((response) => console.log(response.data));
    }
    else if (platform === 'kugou') {
        getKugouResult(module, sampleData, userTokens['kugou'])
            .then((response) => console.log(response.data));
    }
}

export { testRequest };
