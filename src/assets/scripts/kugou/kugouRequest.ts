import { proxyRequest } from "../../utilities/proxyRequest.ts";

import { getSignedParams, getToken, getMobileSign } from './kugouEncrypt.js';

function objectToKeyPairs(source: { [key: string]: any }): string {
    let keyValuePairs = Object.keys(source).map((key) => `${key}=${source[key]}`);

    return keyValuePairs.join('&');
}

function getUserId(kugoo: string): string {
    const infoList = kugoo.split('&');
    const userId = infoList[0].replace('KugooID=', '');

    return userId;
}

// 请求链接
const requestUrls: { [type: string]: string } = {
    'songLink': 'https://wwwapi.kugou.com/play/songinfo',
    'search': 'https://complexsearch.kugou.com/v2/search/song',
    'songInfo': 'https://wwwapi.kugou.com/play/songinfo',
    'lyrics': 'https://wwwapi.kugou.com/play/songinfo',
    'songList': 'https://m.kugou.com/plist/list/[listId]',
    'album': 'https://m3ws.kugou.com/api/v1/album/info',
    'artist': 'https://gateway.kugou.com/openapi/v2/union/author/audios',
    'hotList': 'https://m.kugou.com/plist/index',
    'recommendSong': 'https://m.kugou.com/',
    'recommendArtist': 'https://m.kugou.com/singer/list',
    'rankings': 'https://m.kugou.com/rank/list',
    'rankingContent': 'https://m.kugou.com/rank/info/[rankingId]',
    'newSong': 'https://m.kugou.com/newsong/index',
    'newAlbum': 'https://m.kugou.com/rank/info/8888'
};

// 请求数据
const requestData: { [type: string]: any } = {
    'songLink': {
        dfid: '-',
        appid: 1014,
        mid: '',
        platid: 4,
        encode_album_audio_id: '[songId]',
        uuid: '',
        token: '',
        userid: ''
    },
    'search': {
        keyword: '[keyword]',
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
    },
    'songInfo': {
        srcappid: 2919,
        clientver: 20000,
        clienttime: 0,
        mid: '',
        uuid: '',
        dfid: '',
        appid: 1014,
        platid: 4,
        encode_album_audio_id: '[songId]',
        token: '',
        userid: ''
    },
    'lyrics': {
        srcappid: 2919,
        clientver: 20000,
        clienttime: 0,
        mid: '',
        uuid: '',
        dfid: '',
        appid: 1014,
        platid: 4,
        encode_album_audio_id: '[songId]',
        token: '',
        userid: ''
    },
    'songList': {
        json: true
    },
    'album': {
        type: 1,
        page: 1,
        albumid: '[albumId]',
        srcappid: 2919,
        clientver: 20000,
        clienttime: 0,
        mid: 0,
        uuid: 0,
        dfid: '-',
        userid: '',
        token: ''
    },
    'artist': {// 参数严格按照字母顺序 不可改动 (否则会出现 `20060 sign error`)
        appid: 1058,
        clienttime: 0,
        clientver: 1000,
        dfid: '-',
        mid: '',        
        srcappid: 2919,
        uuid: ''
    },
    'hotList': {
        json: true
    },
    'recommendSong': {
        json: true
    },
    'recommendArtist': {
        json: true
    },
    'rankings': {
        json: true
    },
    'rankingContent': {
        json: true
    },
    'newSong': {
        json: true
    },
    'newAlbum': {
        json: true
    }
};
const artistApiPostData = {
    author_id: "[artistId]",
    need_song_list: 1,
    page: 1,
    pagesize: 10
};

type MusicModule = 'songLink' | 'search' | 'songInfo' | 'lyrics' | 'songList' | 'album' | 'artist' | 
    'hotList' | 'recommendSong' | 'recommendArtist' | 'rankings' | 'rankingContent' | 'newSong' | 'newAlbum';

// 需要用户信息的模块
const needCookies: MusicModule[] = ['songLink', 'songInfo', 'lyrics', 'songList'];
const needUserIds: MusicModule[] = ['songLink', 'search', 'songInfo', 'album'];
const needTokens: MusicModule[] = ['songLink', 'search', 'songInfo', 'lyrics'];
// 需要移动端 UA 的模块
const mobileUA = 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 EdgA/139.0.2151.58';
const mobileModuleList: MusicModule[] = ['songList', 'album', 'artist', 'hotList', 
    'recommendSong', 'recommendArtist', 'rankings', 'rankingContent', 'newSong', 'newAlbum'];

/**
 * 通用酷狗音乐 API 请求函数
 * 
 * 根据指定的模块名称、参数和用户 Cookie，构建请求数据并发起酷狗音乐 API 请求
 * 支持歌曲链接、搜索、歌曲信息等多种模块，参数会自动替换为传入值
 * 
 * @param moduleName (必填) 请求模块名称（如 "songLink", "search", "songInfo" 等）
 * @param params (必填) 需要替换的参数对象，键为参数名，值为参数值
 * @param cookies (必填, 否则无法获取数据) 用户 Cookie 信息 (KuGoo)
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
function getKugouResult(moduleName: MusicModule, params: { [type: string]: any }, cookies: { KuGoo: string }) {
    let targetUrl = requestUrls[moduleName];

    if (moduleName === 'songList') { // 歌单信息
        targetUrl = targetUrl.replace('[listId]', params.listId);
    }
    else if (moduleName === 'rankingContent') { // 排行榜内容
        targetUrl = targetUrl.replace('[rankingId]', params.rankingId);
    }
    
    const moduleData = requestData[moduleName];
    if (!targetUrl || !moduleData) {
        throw new Error(`[Error] Module ${moduleName} not found in request data`);
    }
    if (needCookies.includes(moduleName) && cookies.KuGoo === '') {
        throw new Error(`[Error] Module ${moduleName} cannot work due to lack of cookie param 'KuGoo'`);
    }

    // 填入 clienttime 参数
    if (Object.keys(moduleData).includes('clienttime')) {
        moduleData.clienttime = Date.now();
    }

    // 添加 userid 参数
    if (needUserIds.includes(moduleName) && moduleName !== 'artist') {
        moduleData.userid = getUserId(cookies.KuGoo);
    }
    // 添加 Token
    if (needTokens.includes(moduleName) && moduleName !== 'artist') {
        moduleData.token = getToken(cookies.KuGoo);
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
    const moduleParams = JSON.parse(moduleString);

    const requestParams = getSignedParams(moduleParams);
    const paramString = objectToKeyPairs(requestParams);
    const cookieHeader = `KuGoo=${cookies.KuGoo}`;
    const userAgent = mobileModuleList.includes(moduleName) ? mobileUA : '';

    // 歌手信息 - POST API
    if (moduleName === 'artist') {
        const formData = artistApiPostData;
        formData.author_id = params.artistId;

        const encryptedParams = getMobileSign(moduleParams, formData);
        const urlParams = objectToKeyPairs(encryptedParams);
        return proxyRequest(
            'POST',
            `${targetUrl}?${urlParams}`,
            {
                'Cookie': cookieHeader,
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 EdgA/139.0.2151.58'
            },
            formData
        );
    }

    return proxyRequest(
        'GET',
        `${targetUrl}?${paramString}`,
        {
            'Cookie': cookieHeader,
            'User-Agent': userAgent
        },
        null
    );
}

export { getKugouResult };
