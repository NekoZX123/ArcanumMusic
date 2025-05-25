import { proxyRequest } from './../../utilities/proxyRequest.ts';

import { getKuwoParams }from './kuwoEncrypt.js';

type KuwoEncryptParams = {
    uuid: string,
    hm_iuvt: string,
    secret: string
};

// 请求数据
const songlinkData = 'mid=[mid]&type=music&httpsStatus=1&reqId=[uuid]&plat=web_www&from=';
const searchData = 'vipver=1&client=kt&ft=music&cluster=0&strategy=2012&encoding=utf8&rformat=json&mobi=1&issubtitle=1&show_copyright_off=1&pn=0&rn=20&all=[query]';
const lyricsData = 'musicId=[mid]&httpsStatus=1&reqId=[uuid]&plat=web_www&from=';
// 请求链接
const songlinkUrl = 'https://kuwo.cn/api/v1/www/music/playUrl';
const searchUrl = 'https://kuwo.cn/search/searchMusicBykeyWord';
const lyricUrl = 'https://kuwo.cn/openapi/v1/www/lyric/getlyric';

/**
 * 获取酷狗音乐音乐链接
 * 
 * @param mid 音乐 ID
 * @returns Promise - 请求结果
 */
function getKuwoSonglink(mid: string, cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;
    const hm_iuvt = encryptParams.hm_iuvt;
    const secretHeader = encryptParams.secret;

    let requestParams = songlinkData.replace('[mid]', mid).replace('[uuid]', uuid);
    const cookieHeader = `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt};userid=${cookies?.userid || ''}`;

    return proxyRequest(
        'GET', 
        `${songlinkUrl}?${requestParams}`, 
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader,
            'Secret': secretHeader
        },
        null
    );
}

/**
 * 获取酷我音乐搜索结果
 * 
 * @param query 搜索关键词
 * @returns Promise - 搜索结果
 */
function getKuwoSearchResult(query: string, cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const hm_iuvt = encryptParams.hm_iuvt;

    let requestParams = searchData.replace('[query]', query);
    const cookieHeader = `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt};userid=${cookies?.userid || ''}`;

    return proxyRequest(
        'GET', 
        `${searchUrl}?${requestParams}`, 
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader
        },
        null
    );
}

/**
 * 获取酷我音乐歌词
 * 
 * @param mid 音乐 ID
 * @returns Promise - 请求结果
 */
function getKuwoLyrics(mid: string, cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;
    const hm_iuvt = encryptParams.hm_iuvt;

    const cookieHeader = `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt};userid=${cookies?.userid || ''}`;
    let requestParams = lyricsData.replace('[mid]', mid).replace('[uuid]', uuid);

    return proxyRequest(
        'GET',
        `${lyricUrl}?${requestParams}`,
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader
        },
        null
    );
}

export { getKuwoSonglink, getKuwoSearchResult, getKuwoLyrics };
