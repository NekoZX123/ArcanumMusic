import { proxyRequest } from '../../utilities/proxyRequest.ts';

import { getKuwoParams }from './kuwoEncrypt.js';

// Note: api 包含:
// 歌曲 搜索 歌词 音乐信息 歌单 专辑 歌手 推荐歌单 热门单曲 热门歌手 排行榜 新歌 新专辑

type KuwoEncryptParams = {
    uuid: string,
    hm_iuvt: string,
    secret: string
};

// 请求数据
const songlinkData = 'mid=[mid]&type=music&httpsStatus=1&reqId=[uuid]&plat=web_www&from=';
const searchData = 'vipver=1&client=kt&ft=music&cluster=0&strategy=2012&encoding=utf8&rformat=json&mobi=1&issubtitle=1&show_copyright_off=1&pn=0&rn=20&all=[query]';
const lyricsData = 'musicId=[mid]&httpsStatus=1&reqId=[uuid]&plat=web_www&from=';
const songInfoData = 'mid=[mid]&httpsStatus=1&reqId=[uuid]&plat=web_www&from=';
const playlistData = 'pid=[pid]&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from=';
const albumData = 'stype=albuminfo&albumid=[albumid]&show_copyright_off=1&alflac=1&vipver=1&sortby=1&newver=1&mobi=1';
const artistData = 'artistid=[artistid]&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from=';
const hotListData = 'pn=1&rn=20&order=hot&httpsStatus=1&reqId=[uuid]&plat=web_www&from=';
const recommendSongData = 'pid=1082685104&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from=';
const recommendArtistData = 'category=0&prefix=&pn=1&rn=60&httpsStatus=1&reqId=[uuid]&plat=web_www&from=';
const rankingData = 'httpsStatus=1&reqId=[uuid]&plat=web_www';
const rankingContentData = 'bangId=[rankingid]&pn=1&rn=20&httpsStatus=1&reqId=[uuid]&plat=web_www&from='
// 请求链接
const songlinkUrl = 'https://kuwo.cn/api/v1/www/music/playUrl';
const searchUrl = 'https://kuwo.cn/search/searchMusicBykeyWord';
const lyricUrl = 'https://kuwo.cn/openapi/v1/www/lyric/getlyric';
const songInfoUrl = 'https://kuwo.cn/api/www/music/musicInfo';
const playlistUrl = 'https://kuwo.cn/api/www/playlist/playListInfo';
const albumUrl = 'https://searchlist.kuwo.cn/r.s';
const artistUrl = 'https://kuwo.cn/api/www/artist/artistMusic';
const hotListUrl = 'https://www.kuwo.cn/api/www/classify/playlist/getRcmPlayList';
const recommendSongUrl = 'https://kuwo.cn/api/www/playlist/playListInfo';
const recommendArtistUrl = 'https://wapi.kuwo.cn/api/www/artist/artistInfo';
const rankingUrl = 'https://www.kuwo.cn/api/www/bang/bang/bangMenu';
const rankingContentUrl = 'https://www.kuwo.cn/api/www/bang/bang/musicList';

/**
 * 获取酷我音乐音乐链接
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

/**
 * 获取酷我音乐歌曲信息
 * 
 * @param mid 音乐 ID
 * @returns Promise - 请求结果
 */
function getKuwoSongInfo(mid: string, cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;
    const hm_iuvt = encryptParams.hm_iuvt;
    const secretHeader = encryptParams.secret;

    const cookieHeader = `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt};userid=${cookies?.userid || ''}`;
    let requestParams = songInfoData.replace('[mid]', mid).replace('[uuid]', uuid);

    return proxyRequest(
        'GET',
        `${songInfoUrl}?${requestParams}`,
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader,
            'Secret': secretHeader
        },
        null
    );
}

/**
 * 获取酷我音乐歌单信息
 * 
 * @param pid 歌单 ID
 * @returns Promise - 请求结果
 */
function getKuwoPlaylist(pid: string, cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;
    const hm_iuvt = encryptParams.hm_iuvt;
    const secretHeader = encryptParams.secret;

    const cookieHeader = `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt};userid=${cookies?.userid || ''}`;
    let requestParams = playlistData.replace('[pid]', pid).replace('[uuid]', uuid);

    return proxyRequest(
        'GET',
        `${playlistUrl}?${requestParams}`,
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader,
            'Secret': secretHeader
        },
        null
    );
}

/**
 * 获取酷我音乐专辑信息
 * 
 * @param albumid 专辑 ID
 * @returns Promise - 请求结果
 */
function getKuwoAlbum(albumid: string, cookies?: { userid: string }) {
    const cookieHeader = `userid=${cookies?.userid || ''}`;
    let requestParams = albumData.replace('[albumid]', albumid);

    return proxyRequest(
        'GET',
        `${albumUrl}?${requestParams}`,
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader
        },
        null
    );
}

/**
 * 获取酷我音乐歌手信息
 * 
 * @param artistid 歌手 ID
 * @returns Promise - 请求结果
 */
function getKuwoArtist(artistid: string, cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;
    const hm_iuvt = encryptParams.hm_iuvt;
    const secretHeader = encryptParams.secret;

    const cookieHeader = `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt};userid=${cookies?.userid || ''}`;
    let requestParams = artistData.replace('[artistid]', artistid).replace('[uuid]', uuid);

    return proxyRequest(
        'GET',
        `${artistUrl}?${requestParams}`,
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader,
            'Secret': secretHeader
        },
        null
    );
}

/**
 * 获取酷我音乐热门歌单
 * 
 * @returns Promise - 请求结果
 */
function getKuwoHotList(cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;
    const hm_iuvt = encryptParams.hm_iuvt;
    const secretHeader = encryptParams.secret;

    const cookieHeader = `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt};userid=${cookies?.userid || ''}`;
    let requestParams = hotListData.replace('[uuid]', uuid);

    return proxyRequest(
        'GET',
        `${hotListUrl}?${requestParams}`,
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader,
            'Secret': secretHeader
        },
        null
    );
}

/**
 * 获取酷我音乐推荐歌曲
 * 
 * @returns Promise - 请求结果
 */
function getKuwoRecommendSong(cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;
    const hm_iuvt = encryptParams.hm_iuvt;
    const secretHeader = encryptParams.secret;

    const cookieHeader = `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt};userid=${cookies?.userid || ''}`;
    let requestParams = recommendSongData.replace('[uuid]', uuid);

    return proxyRequest(
        'GET',
        `${recommendSongUrl}?${requestParams}`,
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader,
            'Secret': secretHeader
        },
        null
    );
}

/**
 * 获取酷我音乐推荐歌手
 * 
 * @returns Promise - 请求结果
 */
function getKuwoRecommendArtist(cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;

    const cookieHeader = `userid=${cookies?.userid || ''}`;
    let requestParams = recommendArtistData.replace('[uuid]', uuid);

    return proxyRequest(
        'GET',
        `${recommendArtistUrl}?${requestParams}`,
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader,
        },
        null
    );
}

/**
 * 获取酷我音乐排行榜
 * 
 * @returns Promise - 请求结果
 */
function getKuwoRankings(cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;
    const hm_iuvt = encryptParams.hm_iuvt;
    const secretHeader = encryptParams.secret;

    const cookieHeader = `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt};userid=${cookies?.userid || ''}`;
    let requestParams = rankingData.replace('[uuid]', uuid);

    return proxyRequest(
        'GET',
        `${rankingUrl}?${requestParams}`,
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader,
            'Secret': secretHeader
        },
        null
    );
}

/**
 * 获取酷我音乐排行榜内容
 * 
 * @param rankingId 排行榜 ID
 * @returns Promise - 请求结果
 */
function getKuwoRankingContent(rankingId: string, cookies?: { userid: string }) {
    const encryptParams: KuwoEncryptParams = getKuwoParams();
    const uuid = encryptParams.uuid;
    const hm_iuvt = encryptParams.hm_iuvt;
    const secretHeader = encryptParams.secret;

    const cookieHeader = `Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324=${hm_iuvt};userid=${cookies?.userid || ''}`;
    let requestParams = rankingContentData.replace('[rankingid]', rankingId).replace('[uuid]', uuid);

    return proxyRequest(
        'GET',
        `${rankingContentUrl}?${requestParams}`,
        {
            'Accept': 'application/json, text/plain, */*',
            'Cookie': cookieHeader,
            'Secret': secretHeader
        },
        null
    );
}

/**
 * 获取酷我音乐新歌
 * 
 * @returns Promise - 请求结果
 */
function getKuwoNewSong(cookies?: { userid: string }) {
    return getKuwoRankingContent('17', cookies);
}

/**
 * 获取酷我音乐新专辑
 * 
 * @returns Promise - 请求结果
 */
function getKuwoNewAlbum(cookies?: { userid: string }) {
    return getKuwoRankingContent('17', cookies);
}

export {
    getKuwoSonglink,
    getKuwoSearchResult,
    getKuwoLyrics,
    getKuwoSongInfo,
    getKuwoPlaylist,
    getKuwoAlbum,
    getKuwoArtist,
    getKuwoHotList,
    getKuwoRecommendSong,
    getKuwoRecommendArtist,
    getKuwoRankings,
    getKuwoRankingContent,
    getKuwoNewSong,
    getKuwoNewAlbum
};
