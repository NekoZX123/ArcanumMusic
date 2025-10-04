import { Buffer } from 'buffer';

import { proxyRequest } from "../../utilities/proxyRequest.ts";

// @ts-ignore 6133
import { getSign, getSearchId, validate } from "./qqmusicEncrypt.js";
import type { AxiosResponse } from 'axios';

// Note: api 包含:
// 歌曲 搜索 歌词 音乐信息 歌单 专辑 歌手 
// 推荐歌单 热门单曲 热门歌手 排行榜 新歌 新专辑

// 表单数据
// 搜索类型
const searchTypes: Record<string, number> = {
    'singles': 0,
    'songlists': 3,
    'albums': 2,
    'artists': 0
};
const requestData: any = {
    // 通用数据
    "common": {
        "cv": 4747474,
        "ct": 24,
        "format": "json",
        "inCharset": "utf-8",
        "outCharset": "utf-8",
        "notice": 0,
        "platform": "yqq.json",
        "needNewCode": 1,
        "uin": 0,
        "g_tk_new_20200303": 240514324,
        "g_tk": 240514324
    },
    // 歌曲链接
    "songLink": [
        {
            "module": "music.vkey.GetEVkey",
            "method": "GetUrl",
            "param": {
                "guid": "986724784312345",
                "songmid": [
                    "[songMid]"
                ],
                "songtype": [
                    0
                ],
                "uin": "[QQMUSIC_UIN]",
                "loginflag": 1,
                "platform": "20",
                "xcdn": 1,
                "qdesc": "lq96kOgg"
            }
        }
    ],
    // 搜索
    "search": [
        {
            "method": "DoSearchForQQMusicDesktop",
            "module": "music.search.SearchCgiService",
            "param": {
                "remoteplace": "txt.yqq.top",
                "searchid": 0,
                "search_type": "[type]",
                "query": "[keyword]",
                "page_num": "[pageIndex]",
                "num_per_page": 30
            }
        }
    ],
    // 歌曲信息
    "songInfo": [
        {
            "method": "get_song_detail_yqq",
            "module": "music.pf_song_detail_svr",
            "param": {
                "song_mid": "[songMid]",
            }
        }
    ],
    // 歌词
    "lyrics": [
        {
            "module": "music.musichallSong.PlayLyricInfo",
            "method": "GetPlayLyricInfo",
            "param": {
                "songMID": "[songMid]"
            }
        }
    ],
    // 歌单
    "songList": [
        {
            "module": "music.srfDissInfo.aiDissInfo",
            "method": "uniform_get_Dissinfo",
            "param": {
                "disstid": "[listId]",
                "userinfo": 1,
                "tag": 1,
                "orderlist": 1,
                "song_begin": 0,
                "song_num": 100,
                "onlysonglist": 0,
                "enc_host_uin": ""
            }
        }
    ],
    // 专辑
    "album": [
        {
            "module": "music.musichallAlbum.AlbumInfoServer",
            "method": "GetAlbumDetail",
            "param": {
                "albumMid": "[albumId]",
                "albumID": 0
            }
        },
        {
            "module": "music.musichallAlbum.AlbumSongList",
            "method": "GetAlbumSongList",
            "param": {
                "albumMid": "[albumId]",
                "albumID": 0,
                "begin": 0,
                "num": 10,
                "order": 2
            }
        }
    ],
    // 歌手信息
    "artist": [
        {
            "method": "GetSingerDetail",
            "param": {
                "singer_mids": [
                    "[artistId]"
                ],
                "ex_singer": 1,
                "wiki_singer": 1,
                "group_singer": 0,
                "pic": 1,
                "photos": 0
            },
            "module": "music.musichallSinger.SingerInfoInter"
        },
        {
            "method": "GetAlbumList",
            "param": {
                "singerMid": "[artistId]",
                "order": 0,
                "begin": 0,
                "num": 30,
                "songNumTag": 0,
                "singerID": 0
            },
            "module": "music.musichallAlbum.AlbumListServer"
        },
        {
            "method": "GetSingerSongList",
            "param": {
                "singerMid": "[artistId]",
                "order": 1,
                "begin": 0,
                "num": 20
            },
            "module": "musichall.song_list_server"
        }
    ],
    // 推荐歌单
    "hotList": [
        {
            "method": "GetRecommendFeed",
            "module": "music.playlist.PlaylistSquare",
            "param": {
                "From": 0,
                "Size": 50
            }
        }
    ],
    // 推荐单曲
    "recommendSong": [
        {
            "module": "newsong.NewSongServer",
            "method": "get_new_song_info",
            "param": {
                "type": 5
            }
        }
    ],
    // 推荐歌手
    "recommendArtist": [
        {
            "module": "music.musichallSinger.SingerList",
            "method": "GetSingerListIndex",
            "param": {
                "area": -100,
                "sex": -100,
                "genre": -100,
                "index": -100,
                "sin": 0,
                "cur_page": 1
            }
        }
    ],
    // 排行榜列表
    "rankings": [
        {
            "module": "musicToplist.ToplistInfoServer",
            "method": "GetAll",
            "param": {}
        }
    ],
    // 排行榜内容
    "rankingContent": [
        {
            "module": "musicToplist.ToplistInfoServer",
            "method": "GetDetail",
            "param": {
                "topid": "[rankingId]",
                "offset": 0,
                "num": 50,
                "period": ""
            }
        }
    ],
    // 新歌
    "newSong": [
        {
            "module": "newsong.NewSongServer",
            "method": "get_new_song_info",
            "param": {
                "type": 0
            }
        }
    ],
    // 新专辑
    "newAlbum": [
        {
            "module": "newalbum.NewAlbumServer",
            "method": "get_new_album_info",
            "param": {
                "area": 1,
                "sin": 0,
                "num": 50
            }
        }
    ],
    // 收藏歌曲
    "userFavourites": [
        {
            "module": "music.srfDissInfo.aiDissInfo",
            "method": "uniform_get_Dissinfo",
            "param": {
                "song_begin": 0,
                "song_num": 100,
                "disstid": 5507561315,
                "ctx": 1
            }
        }
    ],
    "userPlaylists": []
};
// 特例 - 用户信息
const userInfoData = {
    "module": "userInfo.BaseUserInfoServer",
    "method": "get_user_baseinfo_v2",
    "param": {
        "vec_uin": [
            "0"
        ]
    }
};
// 请求链接
const universalUrl = 'https://u6.y.qq.com/cgi-bin/musics.fcg';
// 收藏歌单链接
const userPlaylistsUrl = 'https://c6.y.qq.com/fav/fcgi-bin/fcg_get_profile_order_asset.fcg?_=[timestamp]&cv=4747474&ct=20&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=1&uin=[uin]&g_tk_new_20200303=1923713770&g_tk=1923713770&cid=205360956&userid=[uin]&reqtype=3&sin=0&ein=10'

type QQMusicModule = 'songLink' | 'search' | 'songInfo' | 'lyrics' | 'songList' | 'album' | 'artist' | 
    'hotList' | 'recommendSong' | 'recommendArtist' | 'rankings' | 'rankingContent' | 'newSong' | 'newAlbum' | 
    'userFavourites' | 'userPlaylists';

/**
 * 获取 QQ音乐 用户收藏歌单
 * @param cookies (必填, 否则无法获取数据) 用户 Cookie 信息，包括 uin 和 qm_keyst
 * @returns Promise<AxiosResponse> - 请求结果
 */
function getQQmusicUserLists(cookies: { uin: number, qm_keyst: string }) {
    const uin = cookies.uin;
    const now = Date.now();

    const targetUrl = userPlaylistsUrl.replace('[timestamp]', now.toString()).replace(/\[uin\]/g, uin.toString());
    const cookieHeader = `uin=${cookies.uin}; qm_keyst=${cookies.qm_keyst}; qqmusic_key=${cookies.qm_keyst};`;
    return proxyRequest(
        'GET',
        targetUrl,
        {
            'Accept': 'application/json',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
        },
        null
    );
}
function getQQmusicSearchTypes() {
    return searchTypes;
}
/**
 * 通用 QQ 音乐 API 请求函数
 * 
 * 根据指定的模块名称、参数和用户 Cookie，构建请求数据并发起 QQ 音乐 API 请求
 * 支持歌曲链接、搜索、歌曲信息等多种模块，参数会自动替换为传入值
 * 
 * @param moduleName (必填) 请求模块名称（如 "songLink", "search", "songInfo" 等）
 * @param params (必填) 需要替换的参数对象，键为参数名，值为参数值
 * @param cookies (必填, 否则无法获取数据) 用户 Cookie 信息，包括 uin 和 qm_keyst
 * @returns Promise<AxiosResponse> - 请求结果
 * 
 * @throws 如果模块名称不存在于请求数据中，则抛出错误
 * 
 * 附: moduleName 对应的 params 格式
 * - songLink: { songMid: string } - 歌曲 ID
 * - search: { keyword: string, type: number, pageIndex: number } - 搜索关键词, 搜索类型, 页码 (从 0 开始)
 * - songInfo: { songMid: string } - 歌曲 ID
 * - lyrics: { songMid: string } - 歌曲 ID
 * - songList: { listId: number } - 歌单 ID
 * - album: { albumId: string } - 专辑 ID
 * - artist: { artistId: string } - 歌手 ID
 * - hotList: {} - 空对象
 * - recommendSong: {} - 空对象
 * - recommendArtist: {} - 空对象
 * - rankings: {} - 空对象
 * - rankingContent: { rankingId: number } - 排行榜 ID
 * - newSong: {} - 空对象
 * - newAlbum: {} - 空对象
 * - userFavourites: {} - 空对象
 * - userPlaylists: {} - 空对象
 */
function getQQmusicResult(moduleName: QQMusicModule, params: { [type: string]: any }, cookies: { uin: number, qm_keyst: string }) {
    // 用户收藏歌单特判
    if (moduleName === 'userPlaylists') {
        return getQQmusicUserLists(cookies);
    }

    // 自动将搜索页码改为从 1 开始
    if (Object.keys(params).includes('pageIndex') && moduleName === 'search') {
        params.pageIndex ++;
    }
    
    const common = requestData.common;
    const moduleData = requestData[moduleName];
    if (!moduleData) {
        throw new Error(`Module ${moduleName} not found in request data.`);
    }
    common.uin = cookies.uin;

    let moduleString = JSON.stringify(moduleData);
    moduleString.replace(/[QQMUSIC_UIN]/g, cookies.uin.toString());
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
    const moduleParams: object[] = JSON.parse(moduleString);

    const data: { [type: string]: any } = {
        'comm': common
    }
    // 添加数据
    moduleParams.forEach((reqData, index) => {
        data[`req_${index + 1}`] = reqData;
    });

    const sign = getSign(JSON.stringify(data));
    const requestParams = `_=${Date.now()}&sign=${sign}`; // 不使用ag-1编码 (不加密数据)
    const cookieHeader = `uin=${cookies.uin};qm_keyst=${cookies.qm_keyst};qqmusic_key=${cookies.qm_keyst}`;
    // console.log(cookieHeader);

    if (moduleName === 'lyrics') { // 对歌词进行 Base64 解析
        return new Promise<AxiosResponse>((resolve, reject) => {
            proxyRequest(
                'POST',
                `${universalUrl}?${requestParams}`,
                {
                    'Accept': 'application/octet-stream; text/plain; application/json',
                    'Content-Type': 'text/plain',
                    'Cookie': cookieHeader,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
                },
                data
            )
                .then((response) => {
                    const resp = response.data.req_1;

                    if (resp.code !== 0) {
                        reject(`[Error] Failed to get lyrics from QQ Music (Error code ${resp.code})`);
                    }

                    let encodedLyrics = resp.data.lyric;
                    let encodedTranslation = resp.data.trans;

                    const decodedLyrics = Buffer.from(encodedLyrics, 'base64').toString('utf-8');
                    const decodedTranslation = Buffer.from(encodedTranslation, 'base64').toString('utf-8');
                    
                    response.data = {
                        'lyrics': decodedLyrics.split('\n'),
                        'translation': decodedTranslation.split('\n'),
                        'originalResponse': response.data
                    };
                    resolve(response);
                });
        });
    }
    return proxyRequest(
        'POST',
        `${universalUrl}?${requestParams}`,
        {
            'Accept': 'application/octet-stream; text/plain; application/json',
            'Content-Type': 'text/plain',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
        },
        data
    );
}

/**
 * 获取 QQ 音乐用户信息
 * @param cookies 
 * @returns (必填, 否则无法获取数据) 用户 Cookie 信息，包括 uin 和 qm_keyst
 */
function getQQmusicAccount(cookies: { uin: number, qm_keyst: string }) {
    const common = requestData.common;
    const moduleData = userInfoData;
    common.uin = cookies.uin;
    moduleData.param.vec_uin = [cookies.uin.toString()];
    const data: { [type: string]: any } = {
        'comm': common,
        'req_1': moduleData
    };

    const sign = getSign(JSON.stringify(data));
    const requestParams = `_=${Date.now()}&sign=${sign}`; // 不使用ag-1编码 (不加密数据)
    const cookieHeader = `uin=${cookies.uin};qm_keyst=${cookies.qm_keyst};qqmusic_key=${cookies.qm_keyst}`;

    return proxyRequest(
        'POST',
        `${universalUrl}?${requestParams}`,
        {
            'Accept': 'application/octet-stream; text/plain; application/json',
            'Content-Type': 'text/plain',
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
        },
        data
    );
}

export { getQQmusicResult, getQQmusicAccount, getQQmusicSearchTypes };
