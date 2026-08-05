import { proxyRequest } from '../../utilities/proxyRequest.ts';

import CryptoJS from 'crypto-js';

// 不同搜索类型 API 地址
const searchApiTable: { [type: string]: string } = {
    'singles': 'search/song/list/page',
    'songlists': 'v1/search/playlist/get',
    'albums': 'v1/search/album/get',
    'artists': 'v1/search/artist/get'
};
// 请求链接
const requestUrls: { [type: string]: string } = {
    'songLink': 'https://interfacepc.music.163.com/eapi/song/enhance/player/url/v1',
    'search': 'https://interfacepc.music.163.com/eapi/[SEARCH_API_PATH]',
    'songInfo': 'https://interfacepc.music.163.com/eapi/v3/song/detail',
    'lyrics': 'https://interfacepc.music.163.com/eapi/song/lyric/v1',
    'songList': 'https://interfacepc.music.163.com/eapi/v6/playlist/detail',
    'album': 'https://interfacepc.music.163.com/eapi/album/v3/detail',
    'artist': 'https://interfacepc.music.163.com/eapi/artist/v3/detail',
    'artistAlbum': 'https://interfacepc.music.163.com/eapi/artist/albums/[artistId]',
    'hotList': 'https://interfacepc.music.163.com/eapi/personalized/playlist/v1',
    'recommendSong': 'https://interfacepc.music.163.com/eapi/v6/playlist/detail',
    'recommendArtist': 'https://interfacepc.music.163.com/eapi/v1/artist/list',
    'rankings': 'https://interfacepc.music.163.com/eapi/toplist/detail/v2',
    'rankingContent': 'https://interfacepc.music.163.com/eapi/v6/playlist/detail',
    'newSong': 'https://interfacepc.music.163.com/eapi/v2/discovery/new/songs',
    'newAlbum': 'https://interfacepc.music.163.com/eapi/discovery/new/albums',
    'dailyRecommends': 'https://interfacepc.music.163.com/eapi/v2/discovery/recommend/songs',
    'userFavourites': 'https://interfacepc.music.163.com/eapi/v6/playlist/detail',
    'userPlaylists': 'https://interfacepc.music.163.com/eapi/user/playlist'
};

// 请求数据
// 搜索类型
const searchTypes: Record<string, string> = {
    'singles': 'singles',
    'songlists': 'songlists',
    'albums': 'albums',
    'artists': 'artists'
};
const requestData: { [type: string]: any } = {
    "songLink": {
        "ids": "[[songId]]",
        "level": "hires",
        "encodeType": "flac"
    },
    "search-singles": {
        "keyword": "[keyword]",
        "limit": "[maxLength]",
        "offset": "[pageOffset]",
        "scene": "NORMAL"
    },
    "search": {
        "s": "[keyword]",
        "limit": "[maxLength]",
        "offset": "[pageOffset]",
        "scene": "NORMAL",
        "queryCorrect": "true"
    },
    "songInfo": {
        "c": "[{\"id\":[songId],\"v\":0}]"
    },
    "lyrics": {
        "id": "[songId]", 
        "cp": "false",
        "lv": "0", // 标准歌词
        "tv": "0", // 翻译歌词
        "yv": "0" // 逐字歌词
    },
    "songList": {
        "id": "[listId]",
        "offset": "0",
        "total": "true",
        "limit": "[maxLength]",
        "n": "[maxLength]"
    },
    "album": { // 此处需要稍后填入 `cache_key`
        "id": "[albumId]"
    },
    "artist": { // 此处需要稍后填入 `cache_key`
        "id": "[artistId]",
        "top": "[maxLength]"
    },
    "artistAlbum": {
        "id": "[artistId]",
        "top": "[maxLength]"
    },
    "hotList": {
        "limit": "[maxLength]",
        "offset": "[pageOffset]"
    },
    "recommendSong": {
        "id": 3778678,
        "n": 30,
        "offset": "[pageOffset]",
        "csrf_token": ""
    },
    "recommendArtist": {
        "area":"-1",
        "type":"-1",
        "initial":"-1",
        "offset":"[pageOffset]",
        "limit":"[maxLength]",
    },
    "rankings": {
        "total": "true"
    },
    "rankingContent": {
        "id": "[rankingId]",
        "offset": "[pageOffset]",
        "total": "true",
        "limit": "[maxLength]",
        "n": "[maxLength]"
    },
    "newSong": {
        "areaId": "0",
        "limit": "[maxLength]",
        "offset": "[pageOffset]"
    },
    "newAlbum": {
        "area":"ALL",
        "year": "[currentYear]",
        "month": "[currentMonth]",
        "offset": "[pageOffset]",
        "limit": "[maxLength]",
        "rcmd": "true"
    },
    "dailyRecommends": {
        "offset": "[pageOffset]", 
        "total": "true",
        "csrf_token": ""
    },
    "userFavourites": {
        "id": "12352057833",
        "offset": "0",
        "total": "true",
        "limit": "[maxLength]",
        "n": "[maxLength]",
        "csrf_token": ""
    },
    "userPlaylists": {
        "uid": "[userId]",
        "offset": "0",
        "limit": "1000"
    }
};

const PAGE_SIZE = 30;

// User-Agent (两种)
const ncmDesktopUA = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.1.28.205001';

type NeteaseMusicModule = 'songLink' | 'search' | 'songInfo' | 'lyrics' | 'songList' | 'album' | 'artist' | 
    'artistAlbum' | 'hotList' | 'recommendSong' | 'recommendArtist' | 'rankings' | 'rankingContent' 
    | 'newSong' | 'newAlbum' | 'dailyRecommends' | 'userFavourites' | 'userPlaylists';

function getNeteaseSearchTypes() {
    return searchTypes;
}

/**
 * 获取网易云专辑 / 歌手 API 的 cache_key
 * @param params 请求参数对象
 */
function getNeteaseCacheKey(params: Record<string, any>): string {
    // 排序参数键名
    const keys = Object.keys(params).sort((a, b) => a.codePointAt(0)! - b.codePointAt(0)!);

    const record: Record<string, string> = {};
    for (const k of keys) {
        record[k] = String(params[k]);
    }
    const text = new URLSearchParams(record).toString();

    // AES-128-ECB / PKCS7
    const encryptKey = CryptoJS.enc.Utf8.parse(')(13daqP@ssw0rd~');
    const encrypted = CryptoJS.AES.encrypt(text, encryptKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

/**
 * 解密 getNeteaseCacheKey 生成的 cache_key, 还原原始 query string
 *
 * @param cacheKey Base64 编码的 cache_key (getNeteaseCacheKey 的返回值)
 * @returns 解密后的原始 query string
 */
function decryptNeteaseCacheKey(cacheKey: string): string {
    const ciphertext = CryptoJS.enc.Base64.parse(cacheKey);

    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });

    const encryptKey = CryptoJS.enc.Utf8.parse(')(13daqP@ssw0rd~');
    const decrypted = CryptoJS.AES.decrypt(cipherParams, encryptKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    if (!plaintext) {
        throw new Error('解密失败: cache_key 无效或密钥不匹配');
    }

    return plaintext;
}

/**
 * 通用网易云音乐 API 请求函数 (v2, 电脑端 API)
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
 * - search: { keyword: string, type: string, pageIndex: number } - 搜索关键词, 搜索类型, 页码 (从 0 开始)
 * - songInfo: { songId: string } - 歌曲 ID
 * - lyrics: { songId: string } - 歌曲 ID
 * - songList: { listId: string, maxLength: number } - 歌单 ID, 最大长度
 * - album: { albumId: string, maxLength: number } - 专辑 ID, 最大长度
 * - artist: { artistId: number } - 歌手 ID
 * - artistAlbum: { artistId: number, maxLength: number } - 歌手 ID, 最大长度
 * - hotList: { maxLength: number } - 最大长度
 * - recommendSong: {} - 空对象
 * - recommendArtist: { maxLength: number } - 最大长度
 * - rankings: {} - 空对象
 * - rankingContent: { rankingId: string, maxLength: number } - 排行榜 ID, 最大长度
 * - newSong: { maxLength: number } - 最大长度
 * - newAlbum: {} - 空对象
 * - dailyRecommends: {} - 空对象
 * - userFavourites: { maxLength: number } - 最大长度
 * - userPlaylists: { userId: string } - 用户 ID
 * 
 */
function getNeteaseResult(moduleName: NeteaseMusicModule, params: { [type: string]: any }, cookies: { MUSIC_U: string }) {
    let targetUrl = requestUrls[moduleName];
    if (moduleName === 'search') { // 填充搜索类型
        targetUrl = targetUrl.replace('[SEARCH_API_PATH]', searchApiTable[params.type]);
    }
    if (moduleName === 'album') { // 专辑信息
        targetUrl = targetUrl.replace('[albumId]', params.albumId);
    }
    if (moduleName === 'artist') { // 歌手信息及专辑
        targetUrl = targetUrl.replace('[artistId]', params.artistId);
    }
    if (moduleName === 'artistAlbum') { // 歌手专辑
        targetUrl = targetUrl.replace('[artistId]', params.artistId);
    }
    let moduleData = requestData[moduleName];
    if (moduleName === 'search' && params.type === 'singles') { // 单曲搜索使用不同表单数据
        moduleData = requestData['search-singles'];
    }

    if (!targetUrl || !moduleData) {
        throw new Error(`Module ${moduleName} not found in request data.`);
    }

    let moduleString = JSON.stringify(moduleData);
    if (!Object.keys(params).includes('pageIndex')) params.pageIndex = 0; // 默认页码为 0
    // 替换参数
    Object.keys(params).forEach((key) => {
        // 页码按照偏移量替换
        if (key === 'pageIndex') {
            const offsetValue = params[key] * (params.maxLength || PAGE_SIZE);
            moduleString = moduleString.replaceAll(`[pageOffset]`, offsetValue.toString() || '');
        }
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

    if (moduleName === 'search') { // 搜索页码
        const pageOffset = (params.pageIndex || 0) * (params.maxLength || 30);
        moduleString = moduleString.replace(new RegExp(`"\\[pageOffset\\]\\"`, 'g'), pageOffset.toString());
    }
    if (moduleName === 'album' || moduleName === 'artist') { // 生成 cache_key
        const paramsObject = JSON.parse(moduleString);
        const cacheKey = getNeteaseCacheKey(paramsObject);
        console.log(`[Debug] Generated cache_key for module ${moduleName}: ${cacheKey}`);
        moduleString = JSON.stringify({ ...paramsObject, cache_key: cacheKey });
    }
    if (moduleName === 'newAlbum') { // 填入年月
        moduleString = moduleString.replace("[currentYear]", new Date().getFullYear().toString());
        moduleString = moduleString.replace("[currentMonth]", (new Date().getMonth() + 1).toString());
    }
    const moduleParams = moduleString;

    // Cookie
    const cookieHeader = `MUSIC_U=${cookies.MUSIC_U}`;
    
    // 加密参数 (API 地址)
    const urlApiPart = targetUrl.replace('https://interfacepc.music.163.com', '').replace('eapi', 'api');

    // 加密请求参数
    const encryptKey = CryptoJS.enc.Utf8.parse('e82ckenh8dichen8');
    const digest = `nobody${urlApiPart}use${moduleParams}md5forencrypt`;
    const dataDigest = CryptoJS.MD5(digest).toString(CryptoJS.enc.Hex);
    const finalParams = `${urlApiPart}-36cd479b6b5-${moduleParams}-36cd479b6b5-${dataDigest}`;

    // 使用 PKCS7 填充
    const encrypted = CryptoJS.AES.encrypt(finalParams, encryptKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    // 转换为十六进制字符串并大写
    const hexParams = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();

    console.log(`[Debug] Original data: ${finalParams} \n Encrypted data: ${hexParams}`);
    return proxyRequest(
        'POST',
        targetUrl,
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': ncmDesktopUA,
            'Referer': 'https://music.163.com/'
        },
        `params=${hexParams}`
    );
}

/**
 * 获取网易云用户信息
 * @param cookies (必填, 否则无法获取数据) 用户 Cookie 信息, 含有 `MUSIC_U` 参数
 */
function getNeteaseAccount(cookies: { MUSIC_U: string }) {
    const userInfoUrl = 'https://interfacepc.music.163.com/eapi/w/nuser/account/get';
    const requestData = { csrf_token: '' };

    // 加密请求参数
    const encryptKey = CryptoJS.enc.Utf8.parse('e82ckenh8dichen8');
    const digest = `nobody/api/w/nuser/account/getuse${JSON.stringify(requestData)}md5forencrypt`;
    const dataDigest = CryptoJS.MD5(digest).toString(CryptoJS.enc.Hex);
    const finalParams = `/api/w/nuser/account/get-36cd479b6b5-${JSON.stringify(requestData)}-36cd479b6b5-${dataDigest}`;

    // 使用 PKCS7 填充
    const encrypted = CryptoJS.AES.encrypt(finalParams, encryptKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    // 转换为十六进制字符串并大写
    const hexParams = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();

    const cookieHeader = `MUSIC_U=${cookies.MUSIC_U}`;

    return proxyRequest(
        'POST',
        userInfoUrl,
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader,
            'User-Agent': ncmDesktopUA
        },
        {
            'params': hexParams
        }
    );
}

/**
 * 解密 getNeteaseResult_v2 加密参数 (解密 `getNeteaseResult_v2` 的 hex 字符串)
 *
 * @param hexParams 加密后的十六进制字符串 (如 `getNeteaseResult_v2` 的 hexParams)
 * @returns 解密后的明文字符串 (即 finalParams)
 */
function decryptHexParams(hexParams: string): string {
    // 1. 将十六进制字符串解析为 CryptoJS WordArray
    const ciphertext = CryptoJS.enc.Hex.parse(hexParams);

    // 2. 构造 CipherParams 对象供 AES.decrypt 使用
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });

    // 3. AES-128-ECB / PKCS7 解密 (与加密参数一致)
    const encryptKey = CryptoJS.enc.Utf8.parse('e82ckenh8dichen8');
    const decrypted = CryptoJS.AES.decrypt(cipherParams, encryptKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    // 4. 转为 UTF-8 字符串 (即 finalParams)
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    if (!plaintext) {
        throw new Error('解密失败: 明文为空, 请检查 hexParams 是否正确');
    }

    return plaintext;
}

export {
    getNeteaseResult,
    getNeteaseSearchTypes,
    getNeteaseAccount,
    decryptHexParams,
    getNeteaseCacheKey,
    decryptNeteaseCacheKey
};
