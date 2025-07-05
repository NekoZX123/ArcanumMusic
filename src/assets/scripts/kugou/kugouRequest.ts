import { proxyRequest } from "../../utilities/proxyRequest.ts";

import { getSignedParams, getToken, getMobileSign } from './kugouEncrypt.js';

// Note: api 包含:
// 歌曲 搜索 歌词 音乐信息 歌单 专辑 歌手 推荐歌单 热门单曲 热门歌手 排行榜 新歌 新专辑
// 酷狗音乐解析使用 devtools `设备仿真` 为移动端

function objectToKeyPairs(source: { [key: string]: any }): string {
    let keyValuePairs = Object.keys(source).map((key) => `${key}=${source[key]}`);

    return keyValuePairs.join('&');
}

function getUserId(kugoo: string): string {
    const infoList = kugoo.split('&');
    const userId = infoList[0].replace('KugooID=', '');

    return userId;
}

// 请求数据
const songlinkData = {
    dfid: '-',
    appid: 1014,
    mid: '',
    platid: 4,
    encode_album_audio_id: '',
    uuid: '',
    token: '',
    userid: ''
};
const searchData = {
    keyword: '',
    page: 1,
    pagesize: 30,
    bitrate: 0,
    isfuzzy: 0,
    inputtype: 0,
    platform: 'WebFilter',
    userid: "0",
    clientver: 1000,
    iscorrection: 1,
    privilege_filter: 0,
    callback: 'callback123',
    filter: 10,
    mid: '',
    uuid: '',
    dfid: '-',
    token: '',
    appid: 1014
};
const songInfoData = {
    srcappid: 2919,
    clientver: 20000,
    clienttime: 0,
    mid: '',
    uuid: '',
    dfid: '',
    appid: 1014,
    platid: 4,
    encode_album_audio_id: '',
    token: '',
    userid: ''
};
const songlistData = {
    dfid: '-',
    appid: 1014,
    mid: '',
    platid: 4,
    encode_gcid: '',
    uuid: '',
    token: '',
    userid: ''
};
const albumData = {
    type: 1,
    page: 1,
    albumid: '',
    srcappid: 2919,
    clientver: 20000,
    clienttime: 0,
    mid: 0,
    uuid: 0,
    dfid: '-',
    userid: '',
    token: ''
};
const artistData = {
    params: { // 参数严格按照字母顺序 不可改动 (否则会出现 `20060 sign error`)
        appid: 1058,
        clienttime: 0,
        clientver: 1000,
        dfid: '-',
        mid: '',        
        srcappid: 2919,
        uuid: '',
    },
    body: {
        author_id: 0,
        need_song_list: 1,
        page: 1,
        pagesize: 10
    }
};

// 请求链接
const songlinkUrl = 'https://wwwapi.kugou.com/play/songinfo';
const searchUrl = 'https://complexsearch.kugou.com/v2/search/song';
const songInfoUrl = 'https://wwwapi.kugou.com/play/songinfo';
const songlistUrl = 'https://wwwapi.kugou.com/play/special';
const albumUrl = 'https://m3ws.kugou.com/api/v1/album/info';
const artistUrl = 'https://gateway.kugou.com/openapi/v2/union/author/audios';

/**
 * 获取酷狗音乐歌曲链接
 * 
 * @param mid 音乐 ID
 * @param cookies 用户 Token
 * @returns Promise - 请求结果
 */
function getKugouSonglink(mid: string, cookies: { KuGoo: string }) {
    const params = songlinkData;
    params.encode_album_audio_id = mid;
    params.userid = getUserId(cookies.KuGoo);

    const userToken = getToken(cookies.KuGoo);
    params.token = userToken;

    const encryptedParams = getSignedParams(params);
    const urlParams = objectToKeyPairs(encryptedParams);

    const cookieHeader = `KuGoo=${cookies.KuGoo}`;

    return proxyRequest(
        'GET',
        `${songlinkUrl}?${urlParams}`,
        {
            'Cookie': cookieHeader
        },
        null
    );
}

/**
 * 获取酷狗音乐搜索结果
 * 
 * @param query 搜索关键词
 * @param cookies 用户 Token
 * @returns Promise - 搜索结果
 */
function getKugouSearchResult(query: string, cookies?: { KuGoo: string }) {
    const params = searchData;
    params.keyword = query;
    if (cookies) {
        params.userid = getUserId(cookies.KuGoo);
        params.token = getToken(cookies.KuGoo);
    }

    const encryptedParams = getSignedParams(params);
    const urlParams = objectToKeyPairs(encryptedParams);

    const cookieHeader = `KuGoo=${cookies?.KuGoo || ''}`;

    return proxyRequest(
        'GET',
        `${searchUrl}?${urlParams}`,
        {
            'Cookie': cookieHeader
        },
        null
    );
}

/**
 * 获取酷狗音乐歌曲信息
 * 
 * @param mid 音乐 ID
 * @param cookies 用户 Token
 * @returns Promise - 请求结果
 */
function getKugouSongInfo(mid: string, cookies: { KuGoo: string }) {
    const params = songInfoData;
    params.clienttime = Date.now();
    params.encode_album_audio_id = mid;
    params.userid = getUserId(cookies.KuGoo);

    const userToken = getToken(cookies.KuGoo);
    params.token = userToken;

    const encryptedParams = getSignedParams(params);
    const urlParams = objectToKeyPairs(encryptedParams);

    const cookieHeader = `KuGoo=${cookies.KuGoo}`;

    return proxyRequest(
        'GET',
        `${songInfoUrl}?${urlParams}`,
        {
            'Cookie': cookieHeader
        },
        null
    );
}

/**
 * 获取酷狗音乐歌曲歌词
 * 
 * @param mid 音乐 ID
 * @param cookies 用户 Token
 * @returns Promise - 请求结果
 */
function getKugouLyrics(mid: string, cookies: { KuGoo: string }) {
    return new Promise((resolve, reject) => {
        getKugouSongInfo(mid, cookies)
            .then((response) => {
                const info = response.data['data'];
                if (info) {
                    const lyrics = info['lyrics']
                    resolve(lyrics);
                }
                else {
                    reject(`[Error] Request error: ${response}`);
                }
            })
            .catch(error => {
                reject(error);
            });
    })
}

/**
 * 获取酷狗音乐歌单信息
 * @param listid 歌单ID
 * @param cookies 用户 Token
 * @returns Promise - 请求结果
 */
function getKugouSonglist(listid: string, cookies: { KuGoo: string }) {
    const params = songlistData;
    params.encode_gcid = listid;
    params.userid = getUserId(cookies.KuGoo);

    const userToken = getToken(cookies.KuGoo);
    params.token = userToken;

    const encryptedParams = getSignedParams(params);
    const urlParams = objectToKeyPairs(encryptedParams);

    const cookieHeader = `KuGoo=${cookies.KuGoo}`;

    return proxyRequest(
        'GET',
        `${songlistUrl}?${urlParams}`,
        {
            'Cookie': cookieHeader
        },
        null
    );
}

/**
 * 获取酷狗音乐专辑信息
 * @param albumid 专辑ID
 * @param cookies (可选) 用户 Token
 * @returns Promise - 请求结果
 */
function getKugouAlbum(albumid: string, cookies?: { KuGoo: string }) {
    const params = albumData;
    params.clienttime = Date.now();
    params.mid = params.clienttime;
    params.uuid = params.clienttime;

    params.albumid = albumid;
    if (cookies?.KuGoo) {
        params.userid = getUserId(cookies.KuGoo);

        const userToken = getToken(cookies.KuGoo);
        params.token = userToken;
    }

    const encryptedParams = getSignedParams(params);
    const urlParams = objectToKeyPairs(encryptedParams);
    console.log(urlParams);

    const cookieHeader = `KuGoo=${cookies?.KuGoo || ''}`;

    return proxyRequest(
        'GET',
        `${albumUrl}?${urlParams}`,
        {
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 EdgA/139.0.2151.58'
        },
        null
    );
}

/**
 * 获取酷狗音乐歌手信息
 * @param artistid 歌手ID
 * @param cookies (可选) 用户 Token
 * @returns Promise - 请求结果
 */
function getKugouArtist(artistid: number, cookies?: { KuGoo: string }) {
    const params = artistData;
    let time = Date.now();
    params.params.clienttime = time;

    params.body.author_id = artistid;

    const encryptedParams = getMobileSign(params.params, params.body);
    const urlParams = objectToKeyPairs(encryptedParams);
    console.log(urlParams);

    const cookieHeader = `KuGoo=${cookies?.KuGoo || ''}`;

    return proxyRequest(
        'POST',
        `${artistUrl}?${urlParams}`,
        {
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 EdgA/139.0.2151.58'
        },
        params.body
    );
}

export {
    getKugouSonglink,
    getKugouSearchResult,
    getKugouSongInfo,
    getKugouLyrics,
    getKugouSonglist,
    getKugouAlbum,
    getKugouArtist
};
