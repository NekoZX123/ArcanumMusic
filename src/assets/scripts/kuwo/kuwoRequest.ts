import { proxyRequest } from '../../utilities/proxyRequest.ts';

import { getKuwoParams }from './kuwoEncrypt.js';

type KuwoEncryptParams = {
    uuid: string,
    hm_iuvt: string,
    secret: string
};

// 请求链接
// 搜索类型链接
const searchTypes: Record<string, string> = {
    'singles': 'singles',
    'songlists': 'songlists',
    'albums': 'albums',
    'artists': 'artists'
};
const searchLinks: Record<string, string> = {
    'singles': 'https://kuwo.cn/search/searchMusicBykeyWord',
    'songlists': 'https://www.kuwo.cn/api/www/search/searchPlayListBykeyWord',
    'albums': 'https://www.kuwo.cn/api/www/search/searchAlbumBykeyWord',
    'artists': 'https://www.kuwo.cn/api/www/search/searchArtistBykeyWord'
};
const requestUrls: { [type: string]: string } = {
    'songLink': 'https://kuwo.cn/api/v1/www/music/playUrl',
    'search': '@searchLinks',
    'songInfo': 'https://kuwo.cn/api/www/music/musicInfo',
    'lyrics': 'https://kuwo.cn/openapi/v1/www/lyric/getlyric',
    'songList': 'https://kuwo.cn/api/www/playlist/playListInfo',
    'album': 'https://searchlist.kuwo.cn/r.s',
    'artist': 'https://wapi.kuwo.cn/api/www/artist/artist',
    'artistAlbum': 'https://wapi.kuwo.cn/api/www/artist/artistAlbum',
    'artistSongs': 'https://kuwo.cn/api/www/artist/artistMusic',
    'hotList': 'https://www.kuwo.cn/api/www/classify/playlist/getRcmPlayList',
    'recommendSong': 'https://kuwo.cn/api/www/playlist/playListInfo',
    'recommendArtist': 'https://wapi.kuwo.cn/api/www/artist/artistInfo',
    'rankings': 'https://www.kuwo.cn/api/www/bang/bang/bangMenu',
    'rankingContent': 'https://www.kuwo.cn/api/www/bang/bang/musicList',
    'newSong': 'https://www.kuwo.cn/api/www/bang/bang/musicList',
    'newAlbum': 'https://www.kuwo.cn/api/www/bang/bang/musicList'
};
// 请求数据
// 搜索数据
const searchData: Record<string, string> = {
    'singles': 'vipver=1&client=kt&ft=music&cluster=0&strategy=2012&encoding=utf8&rformat=json&mobi=1&issubtitle=1&show_copyright_off=1&pn=0&rn=30&all=[keyword]',
    'songlists': 'key=[keyword]&pn=1&rn=30&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'albums': 'key=[keyword]&pn=1&rn=30&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'artists': 'key=[keyword]&pn=1&rn=30&httpsStatus=1&reqId=[uuid]&plat=web_www&from='
};
const requestData: { [type: string]: string } = {
    'songLink': 'mid=[songId]&type=music&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'search': '@searchData',
    'songInfo': 'mid=[songId]&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'lyrics': 'musicId=[songId]&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'songList': 'pid=[listId]&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'album': 'stype=albuminfo&albumid=[albumId]&show_copyright_off=1&alflac=1&vipver=1&sortby=1&newver=1&mobi=1',
    'artist': 'artistid=[artistId]&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'artistSongs': 'artistid=[artistId]&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'artistAlbum': 'artistid=[artistId]&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'hotList': 'pn=1&rn=20&order=hot&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'recommendSong': 'pid=1082685104&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'recommendArtist': 'category=0&prefix=&pn=1&rn=60&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'rankings': 'httpsStatus=1&reqId=[uuid]&plat=web_www',
    'rankingContent': 'bangId=[rankingId]&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'newSong': 'bangId=17&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from=',
    'newAlbum': 'bangId=17&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from='
};

type KuwoMusicModule = 'songLink' | 'search' | 'songInfo' | 'lyrics' | 'songList' | 'album' | 'artist' | 
    'artistAlbum' | 'artistSongs' | 'hotList' | 'recommendSong' | 'recommendArtist' | 'rankings' | 
    'rankingContent' | 'newSong' | 'newAlbum';

// 无需 UUID 的模块
const uuidNotRequired: KuwoMusicModule[] = ['album'];
// 无需 `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324` 参数的模块
const hmNotRequired: KuwoMusicModule[] = ['album', 'artist', 'artistAlbum'];
// 无需 `Secrets` 参数的模块
const secretNotRequired: KuwoMusicModule[] = ['lyrics', 'album', 'artist', 
    'artistAlbum', 'recommendArtist'];

function getKuwoSearchTypes() {
    return searchTypes;
}
/**
 * 通用酷我音乐 API 请求函数
 * 
 * 根据指定的模块名称、参数和用户 Cookie，构建请求数据并发起酷我音乐 API 请求
 * 支持歌曲链接、搜索、歌曲信息等多种模块，参数会自动替换为传入值
 * 
 * @param moduleName (必填) 请求模块名称（如 "songLink", "search", "songInfo" 等）
 * @param params (必填) 需要替换的参数对象，键为参数名，值为参数值
 * @param cookies (可选) 用户 Cookie 信息 (包含 userid)
 * @returns Promise<AxiosResponse> - 请求结果
 * 
 * @throws 如果模块名称不存在于请求数据中，则抛出错误
 * 
 * 附: moduleName 对应的 params 格式
 * - songLink: { songId: string } - 歌曲 ID
 * - search: { keyword: string, type: string } - 搜索关键词, 搜索类型
 * - songInfo: { songId: string } - 歌曲 ID
 * - lyrics: { songId: string } - 歌曲 ID
 * - songList: { listId: string } - 歌单 ID
 * - album: { albumId: string } - 专辑 ID
 * - artist: { artistId: string } - 歌手 ID
 * - hotList: {} - 空对象
 * - recommendSong: {} - 空对象
 * - recommendArtist: {} - 空对象
 * - rankings: {} - 空对象
 * - rankingContent: { rankingId: string } - 排行榜 ID
 * - newSong: {} - 空对象
 * - newAlbum: {} - 空对象
 */
function getKuwoResult(moduleName: KuwoMusicModule, params: { [type: string]: any }, cookies?: { userid: string }) {
    let targetUrl = requestUrls[moduleName];
    let moduleData = requestData[moduleName];
    // 搜索特判
    if (moduleName === 'search') {
        const searchType = params['type'];
        targetUrl = searchLinks[searchType];
        moduleData = searchData[searchType];
    }
    if (!targetUrl || !moduleData) {
        throw new Error(`Module ${moduleName} not found in request data.`);
    }

    // 获取加密参数
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;
    const hm_iuvt = encryptParams.hm_iuvt;
    const secret = encryptParams.secret;

    // 替换验证参数
    let cookieHeader = `userid=${cookies?.userid || ''};`;
    // let cookieHeader = ``;
    if (!hmNotRequired.includes(moduleName)) {
        cookieHeader += `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt}`;
    }
    if (!uuidNotRequired.includes(moduleName)) {
        moduleData = moduleData.replace('[uuid]', uuid);
    }

    // 替换数据参数
    Object.keys(params).forEach((key) => {
        if (moduleData.includes(`[${key}]`)) {
            moduleData = moduleData.replace(new RegExp(`\\[${key}\\]`, 'g'), params[key] || '');
        }
    });

    // console.log(`[Kuwo Music] ${targetUrl}?${moduleData}`);
    const referer = moduleName === 'search' ? 'https://www.kuwo.cn/' : ''

    const requestHeaders: { [type: string]: any } = {
        'Accept': 'application/json',
        'Cookie': cookieHeader,
        'Referer': referer, 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0'
    };
    if (!secretNotRequired.includes(moduleName)) {
        requestHeaders['Secret'] = secret;
    }

    return proxyRequest(
        'GET',
        `${targetUrl}?${moduleData}`,
        requestHeaders,
        null
    );
}

export { getKuwoResult, getKuwoSearchTypes };
