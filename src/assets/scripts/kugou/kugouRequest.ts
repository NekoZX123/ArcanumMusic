import { proxyRequest } from "../../utilities/proxyRequest.ts";

import { getSignedParams } from './kugouEncrypt.js';

function objectToKeyPairs(source: { [key: string]: any }) {
    let keyValuePairs = Object.keys(source).map((key) => `${key}=${source[key]}`);

    return keyValuePairs.join('&');
}

// 请求数据
const songlinkData = {
    dfid: '-',
    appid: 1014,
    mid: '',
    platid: 4,
    encode_album_audio_id: '',
    uuid: '',
    token: "",
    userid: "0"
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
// 请求链接
const songlinkUrl = 'https://wwwapi.kugou.com/play/songinfo';
const searchUrl = 'https://complexsearch.kugou.com/v2/search/song';
const lyricUrl = 'https://wwwapi.kugou.com/play/songinfo';

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

    const encryptedParams = getSignedParams(params);
    const urlParams = objectToKeyPairs(encryptedParams);
    console.log(urlParams);

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

    const encryptedParams = getSignedParams(params);
    const urlParams = objectToKeyPairs(encryptedParams);
    console.log(urlParams);

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
 * 获取酷狗音乐歌曲歌词
 * 
 * @param mid 音乐 ID
 * @param cookies 用户 Token
 * @returns Promise - 请求结果
 */
function getKugouLyrics(mid: string, cookies: { KuGoo: string }) {
    const params = songlinkData;
    params.encode_album_audio_id = mid;

    const encryptedParams = getSignedParams(params);
    const urlParams = objectToKeyPairs(encryptedParams);
    console.log(urlParams);

    const cookieHeader = `KuGoo=${cookies.KuGoo}`;

    return proxyRequest(
        'GET', 
        `${lyricUrl}?${urlParams}`,
        {
            'Cookie': cookieHeader
        },
        null
    );
}

export { getKugouSonglink, getKugouSearchResult, getKugouLyrics };
