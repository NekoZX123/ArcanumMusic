import { proxyRequest } from './../../utilities/proxyRequest.ts';

import { getNeteaseEncrypt } from './neteaseEncrypt.js';

type neteaseEncryptedData = {
    encText: string,
    encSecKey: string
}

// 表单数据
const songlinkData: { ids: string[], level: string, encodeType: string } = {
    "ids": [],
    "level": "level",
    "encodeType": "flac"
};
const searchData = {
    "hlpretag": "<span class=\"s-fc7\">",
    "hlposttag": "</span>",
    "s": "query",
    "type": "1",
    "offset": "0",
    "total": "true",
    "limit": "30",
    "csrf_token": ""
}
const lyricsData = {
    "id": "2630217057", 
    "lv": -1, 
    "tv": -1, 
    "csrf_token": ""
}
// 请求链接
const songlinkUrl = 'https://music.163.com/weapi/song/enhance/player/url/v1?csrf_token=';
const searchUrl = 'https://music.163.com/weapi/cloudsearch/get/web?csrf_token=';
const lyricUrl = 'https://music.163.com/weapi/song/lyric?csrf_token=';

/**
 * 获取网易云音乐链接
 * @param mid 目标音乐ID
 * @param level 音质
 * @param cookies 含有用户Token (`MUSIC_U`)的 object
 * @returns Promise - 返回请求结果
 */
function getNeteaseSonglink(mid: string, level: string, cookies: { MUSIC_U: string }) {
    let data = songlinkData;
    data.ids = [mid];
    data.level = level;

    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(data));
    // console.log(params);

    const cookieHeader = `MUSIC_U=${cookies.MUSIC_U}`;
    
    return proxyRequest(
        'POST', 
        songlinkUrl, 
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/2.10.2.200154'
        },
        {
            'params': params.encText,
            'encSecKey': params.encSecKey
        }
    );
}

/**
 * 获取网易云音乐搜索结果
 * @param query 搜索关键词
 * @param cookies 含有用户Token (`MUSIC_U`)的 object
 * @returns 返回搜索请求结果
 */
function getNeteaseSearchResult(query: string, cookies: { MUSIC_U: string }) {
    let data = searchData;
    data.s = query;

    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(data));
    // console.log(data, params);

    const cookieHeader = `MUSIC_U=${cookies.MUSIC_U}`;
    
    return proxyRequest(
        'POST', 
        searchUrl, 
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/2.10.2.200154'
        },
        {
            'params': params.encText,
            'encSecKey': params.encSecKey
        }
    );
}

/**
 * 获取网易云音乐歌词
 * @param mid 音乐ID
 * @param cookies 含有用户Token (`MUSIC_U`)的 object
 * @returns 歌词请求结果
 */
function getNeteaseLyrics(mid: string, cookies: { MUSIC_U: string }) {
    let data = lyricsData;
    data.id = mid;

    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(data));

    const cookieHeader = `MUSIC_U=${cookies.MUSIC_U}`;
    
    return proxyRequest(
        'POST', 
        lyricUrl, 
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/2.10.2.200154'
        },
        {
            'params': params.encText,
            'encSecKey': params.encSecKey
        }
    );
}

export { getNeteaseSonglink, getNeteaseSearchResult, getNeteaseLyrics };
