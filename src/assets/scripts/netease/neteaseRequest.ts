import { proxyRequest } from './../../utilities/proxyRequest.ts';

import { getNeteaseEncrypt } from './neteaseEncrypt.js';

type neteaseEncryptedData = {
    encText: string,
    encSecKey: string
}

// Note: api 包含:
// 歌曲 搜索 歌词 音乐信息 歌单 专辑 歌手 
// 推荐歌单 热门单曲 热门歌手 排行榜 新歌 新专辑

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
const songInfoData = {
    "id": "636849647",
    "ids": "['636849647']",
    "limit": 10000,
    "offset": 0,
    "csrf_token": ""
};
const playlistData = {
    "id": "636849647",
    "ids": "['636849647']",
    "limit": 10000,
    "offset": 0,
    "csrf_token": ""
};
const albumData = {
    "id": "244089567",
    "ids": "['244089567']",
    "limit": 10000,
    "offset": 0,
    "csrf_token": ""
};
const artistData = {
    "id": 114514,
    "top": 20,
    "csrf_token": ""
};
const hotListData = {
    "order": "hot",
    "cat": "ALL",
    "limit": 35,
    "offset": 0
};
const recommendSongData = {
    "id": 3778678,
    "n": 20,
    "csrf_token": ""
};
const recommendArtistData = {
    "offset": "0",
    "total": "true",
    "limit": "60",
    "csrf_token": ""
};
const rankingsData = {
    "csrf_token": "",
    "cursor": "-1",
    "offset": "0",
    "orderType": "1",
    "pageNo": "1",
    "pageSize": "100",
    "rid": "",
    "threadId": "",
    "total": "true"
};
const newSongData = {
    "data": "{\"limit\": 10}",
    "csrf_token": ""
};
const newAlbumData = {
    "area": "ALL",
    "offset": "0",
    "total": "true",
    "limit": "50",
    "csrf_token": ""
};

// 请求链接
const songlinkUrl = 'https://music.163.com/weapi/song/enhance/player/url/v1?csrf_token=';
const searchUrl = 'https://music.163.com/weapi/cloudsearch/get/web?csrf_token=';
const lyricUrl = 'https://music.163.com/weapi/song/lyric?csrf_token=';
const songInfoUrl = 'https://music.163.com/weapi/song/detail';
const playlistUrl = 'https://music.163.com/weapi/v6/playlist/detail';
const albumUrl = 'https://music.163.com/weapi/album/[albumid]';
const artistUrl = 'https://interface.music.163.com/weapi/artist/top/song';
const hotListUrl = 'https://interface.music.163.com/weapi/personalized/playlist/v1';
const recommendSongUrl = 'https://interface.music.163.com/weapi/v6/playlist/detail';
const recommendArtistUrl = 'https://music.163.com/weapi/artist/top';
const rankingsUrl = 'https://music.163.com/weapi/toplist';
const newSongUrl = 'https://interface.music.163.com/weapi/personalized/newsong';
const newAlbumUrl = 'https://music.163.com/weapi/album/new';

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

/**
 * 获取网易云音乐歌曲信息
 * @param mid 音乐ID
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteaseSongInfo(mid: string, cookies?: { MUSIC_U: string }) {
    const data = songInfoData;
    data.id = mid;
    data.ids = `["${mid}"]`;

    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(data));

    const cookieHeader = `MUSIC_U=${cookies?.MUSIC_U || ''}`;

    return proxyRequest(
        'POST', 
        songInfoUrl, 
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
 * 获取网易云音乐歌单信息
 * @param listid 歌单ID
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteasePlaylist(listId: string, cookies?: { MUSIC_U: string }) {
    const data = playlistData;
    data.id = listId;
    data.ids = `["${listId}"]`;

    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(data));

    const cookieHeader = `MUSIC_U=${cookies?.MUSIC_U || ''}`;

    return proxyRequest(
        'POST', 
        playlistUrl, 
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
 * 获取网易云音乐专辑信息
 * @param albumid 专辑ID
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteaseAlbum(albumId: string, cookies?: { MUSIC_U: string }) {
    const data = albumData;
    data.id = albumId;
    data.ids = `["${albumId}"]`;

    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(data));

    const cookieHeader = `MUSIC_U=${cookies?.MUSIC_U || ''}`;
    const targetUrl = albumUrl.replace('[albumid]', albumId);

    return proxyRequest(
        'POST', 
        targetUrl, 
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
 * 获取网易云音乐歌手信息
 * @param artistId 歌手ID
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteaseArtist(artistId: number, cookies?: { MUSIC_U: string }) {
    const data = artistData;
    data.id = artistId;

    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(data));

    const cookieHeader = `MUSIC_U=${cookies?.MUSIC_U || ''}`;

    return proxyRequest(
        'POST', 
        artistUrl, 
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36 Edg/139.0.0.0'
        },
        {
            'params': params.encText,
            'encSecKey': params.encSecKey
        }
    );
}

/**
 * 获取网易云音乐推荐歌单
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteaseHotList(cookies?: { MUSIC_U: string }) {
    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(hotListData));

    const cookieHeader = `MUSIC_U=${cookies?.MUSIC_U || ''}`;

    return proxyRequest(
        'POST', 
        hotListUrl, 
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36 Edg/139.0.0.0'
        },
        {
            'params': params.encText,
            'encSecKey': params.encSecKey
        }
    );
}

/**
 * 获取网易云音乐推荐单曲
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteaseRecommendSong(cookies?: { MUSIC_U: string }) {
    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(recommendSongData));

    const cookieHeader = `MUSIC_U=${cookies?.MUSIC_U || ''}`;

    return proxyRequest(
        'POST', 
        recommendSongUrl, 
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36 Edg/139.0.0.0'
        },
        {
            'params': params.encText,
            'encSecKey': params.encSecKey
        }
    );
}

/**
 * 获取网易云音乐推荐歌手
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteaseRecommendArtist(cookies?: { MUSIC_U: string }) {
    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(recommendArtistData));

    const cookieHeader = `MUSIC_U=${cookies?.MUSIC_U || ''}`;

    return proxyRequest(
        'POST', 
        recommendArtistUrl, 
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
 * 获取网易云音乐排行列表
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteaseRankings(cookies?: { MUSIC_U: string }) {
    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(rankingsData));

    const cookieHeader = `MUSIC_U=${cookies?.MUSIC_U || ''}`;

    return proxyRequest(
        'POST', 
        rankingsUrl, 
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36 Edg/139.0.0.0'
        },
        {
            'params': params.encText,
            'encSecKey': params.encSecKey
        }
    );
}

/**
 * 获取网易云音乐排行榜内容
 * @param rankingId 排行榜 ID
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteaseRankingContent(rankingId: string, cookies?: { MUSIC_U: string }) {
    return getNeteasePlaylist(rankingId, cookies);
}

/**
 * 获取网易云音乐新歌
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteaseNewSong(cookies?: { MUSIC_U: string }) {
    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(newSongData));

    const cookieHeader = `MUSIC_U=${cookies?.MUSIC_U || ''}`;

    return proxyRequest(
        'POST', 
        newSongUrl, 
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36 Edg/139.0.0.0'
        },
        {
            'params': params.encText,
            'encSecKey': params.encSecKey
        }
    );
}

/**
 * 获取网易云音乐新专辑
 * @param cookies (可选) 含有用户Token (`MUSIC_U`)的 object
 * @returns 请求结果
 */
function getNeteaseNewAlbum(cookies?: { MUSIC_U: string }) {
    const params: neteaseEncryptedData = getNeteaseEncrypt(JSON.stringify(newAlbumData));

    const cookieHeader = `MUSIC_U=${cookies?.MUSIC_U || ''}`;

    return proxyRequest(
        'POST', 
        newAlbumUrl, 
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36 Edg/139.0.0.0'
        },
        {
            'params': params.encText,
            'encSecKey': params.encSecKey
        }
    );
}

export {
    getNeteaseSonglink,
    getNeteaseSearchResult,
    getNeteaseLyrics,
    getNeteaseSongInfo,
    getNeteasePlaylist,
    getNeteaseAlbum,
    getNeteaseArtist,
    getNeteaseHotList, 
    getNeteaseRecommendSong,
    getNeteaseRecommendArtist,
    getNeteaseRankings, 
    getNeteaseRankingContent, 
    getNeteaseNewSong, 
    getNeteaseNewAlbum
};
