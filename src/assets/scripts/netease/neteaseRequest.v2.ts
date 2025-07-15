import { proxyRequest } from './../../utilities/proxyRequest.ts';

import { getNeteaseEncrypt } from './neteaseEncrypt.js';

type neteaseEncryptedData = {
    encText: string,
    encSecKey: string
}

// 请求链接
const requestUrls: { [type: string]: string } = {
    'songLink': 'https://music.163.com/weapi/song/enhance/player/url/v1?csrf_token=',
    'search': 'https://music.163.com/weapi/cloudsearch/get/web?csrf_token=',
    'songInfo': 'https://music.163.com/weapi/song/detail',
    'lyrics': 'https://music.163.com/weapi/song/lyric?csrf_token=',
    'songList': 'https://music.163.com/weapi/v6/playlist/detail',
    'album': 'https://music.163.com/weapi/album/[albumid]',
    'artist': 'https://interface.music.163.com/weapi/artist/top/song',
    'hotList': 'https://interface.music.163.com/weapi/personalized/playlist/v1',
    'recommendSong': 'https://interface.music.163.com/weapi/v6/playlist/detail',
    'recommendArtist': 'https://music.163.com/weapi/artist/top',
    'rankings': 'https://music.163.com/weapi/toplist',
    'rankingContent': 'https://music.163.com/weapi/v6/playlist/detail',
    'newSong': 'https://interface.music.163.com/weapi/personalized/newsong',
    'newAlbum': 'https://music.163.com/weapi/album/new'
};

// 请求数据
const requestData: { [type: string]: any } = {
    "songLink": {
        "ids": ["[songId]"],
        "level": "jymaster",
        "encodeType": "flac"
    },
    "search": {
        "hlpretag": "<span class=\"s-fc7\">",
        "hlposttag": "</span>",
        "s": "[keyword]",
        "type": "1",
        "offset": "0",
        "total": "true",
        "limit": "100",
        "csrf_token": ""
    },
    "songInfo": {
        "id": "[songId]",
        "ids": "['[songId]']",
        "limit": 10000,
        "offset": 0,
        "csrf_token": ""
    },
    "lyrics": {
        "id": "[songId]", 
        "lv": -1, 
        "tv": -1, 
        "csrf_token": ""
    },
    "songList": {
        "id": "[listId]",
        "ids": "['[listId]']",
        "limit": 10000,
        "offset": 0,
        "csrf_token": ""
    },
    "album": {
        "id": "[albumId]",
        "ids": "['[albumId]']",
        "limit": 10000,
        "offset": 0,
        "csrf_token": ""
    },
    "artist": {
        "id": "[artistId]",
        "top": 20,
        "csrf_token": ""
    },
    "hotList": {
        "order": "hot",
        "cat": "ALL",
        "limit": 35,
        "offset": 0
    },
    "recommendSong": {
        "id": 3778678,
        "n": 20,
        "csrf_token": ""
    },
    "recommendArtist": {
        "offset": "0",
        "total": "true",
        "limit": "100",
        "csrf_token": ""
    },
    "rankings": {
        "csrf_token": "",
        "cursor": "-1",
        "offset": "0",
        "orderType": "1",
        "pageNo": "1",
        "pageSize": "100",
        "rid": "",
        "threadId": "",
        "total": "true"
    },
    "rankingContent": {
        "id": "[rankingId]",
        "ids": "['[rankingId]']",
        "limit": 10000,
        "offset": 0,
        "csrf_token": ""
    },
    "newSong": {
        "data": "{\"limit\": 10}",
        "csrf_token": ""
    },
    "newAlbum": {
        "area": "ALL",
        "offset": "0",
        "total": "true",
        "limit": "50",
        "csrf_token": ""
    }
};

// User-Agent (两种)
const mobileUA = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36 Edg/139.0.0.0';
const ncmDesktopUA = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/2.10.2.200154';
const mobileModuleList: MusicModule[] = ['artist', 'hotList', 'recommendSong', 'rankings', 'newSong', 'newAlbum'];

type MusicModule = 'songLink' | 'search' | 'songInfo' | 'lyrics' | 'songList' | 'album' | 'artist' | 
    'hotList' | 'recommendSong' | 'recommendArtist' | 'rankings' | 'rankingContent' | 'newSong' | 'newAlbum';

/**
 * 通用网易云音乐 API 请求函数
 * 
 * 根据指定的模块名称、参数和用户 Cookie，构建请求数据并发起网易云音乐 API 请求
 * 支持歌曲链接、搜索、歌曲信息等多种模块，参数会自动替换为传入值
 * 
 * @param moduleName (必填) 请求模块名称（如 "songLink", "search", "songInfo" 等）
 * @param params (必填) 需要替换的参数对象，键为参数名，值为参数值
 * @param cookies (必填, 否则无法获取数据) 用户 Cookie 信息 (MUSIC_U)
 * @returns Promise<AxiosResponse> - 请求结果
 * 
 * @throws 如果模块名称不存在于请求数据中，则抛出错误
 * 
 * 附: moduleName 对应的 params 格式
 * - songLink: { songId: string } - 歌曲 ID
 * - search: { keyword: string } - 搜索关键词
 * - songInfo: { songId: string } - 歌曲 ID
 * - lyrics: { songId: string } - 歌曲 ID
 * - songList: { listId: string } - 歌单 ID
 * - album: { albumId: string } - 专辑 ID
 * - artist: { artistId: number } - 歌手 ID
 * - hotList: {} - 空对象
 * - recommendSong: {} - 空对象
 * - recommendArtist: {} - 空对象
 * - rankings: {} - 空对象
 * - rankingContent: { rankingId: string } - 排行榜 ID
 * - newSong: {} - 空对象
 * - newAlbum: {} - 空对象
 */
function getNeteaseResult(moduleName: MusicModule, params: { [type: string]: any }, cookies: { MUSIC_U: string }) {
    const targetUrl = requestUrls[moduleName];
    const moduleData = requestData[moduleName];
    if (!targetUrl || !moduleData) {
        throw new Error(`Module ${moduleName} not found in request data.`);
    }

    let moduleString = JSON.stringify(moduleData);
    // 替换参数
    Object.keys(params).forEach((key) => {
        if (moduleString.includes(`[${key}]`)) {
            // 根据数据类型替换参数, 保证类型正确
            if (typeof params[key] === 'number') {
                moduleString = moduleString.replace(new RegExp(`"\\[${key}\\]"`, 'g'), params[key].toString() || '');
            }
            else {
                moduleString = moduleString.replace(new RegExp(`\\[${key}\\]`, 'g'), params[key] || '');
            }
        }
    });
    const moduleParams = moduleString;

    const requestParams: neteaseEncryptedData = getNeteaseEncrypt(moduleParams);
    const cookieHeader = `MUSIC_U=${cookies.MUSIC_U}`;
    const userAgent = mobileModuleList.includes(moduleName) ? mobileUA : ncmDesktopUA;

    console.log(`[Netease Music]\n URL: ${targetUrl};\n Data: ${moduleParams};`);

    return proxyRequest(
        'POST',
        targetUrl,
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': userAgent
        },
        {
            'params': requestParams.encText,
            'encSecKey': requestParams.encSecKey
        }
    );
}

export { getNeteaseResult };
