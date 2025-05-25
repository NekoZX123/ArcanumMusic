import { proxyRequest } from "../../utilities/proxyRequest.ts";

import { getSign, getSearchId }from "./qqmusicEncrypt.js";

// 表单数据
const songlinkData = {
    "comm": {
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
    "req_1": {
        "module": "music.vkey.GetEVkey",
        "method": "GetUrl",
        "param": {
            "guid": 0,
            "songmid": [
                ""
            ],
            "songtype": [
                0
            ],
            "uin": "",
            "loginflag": 1,
            "platform": "20",
            "xcdn": 1,
            "qdesc": "lq96kOgg"
        }
    }
};
const searchData = {
    "comm": {
        "cv": 4747474,
        "ct": 24,
        "format": "json",
        "inCharset": "utf-8",
        "outCharset": "utf-8",
        "notice": 0,
        "platform": "yqq.json",
        "needNewCode": 1,
        "uin": 0,
        "g_tk_new_20200303": 1201561931,
        "g_tk": 1201561931
    },
    "req_1": {
        "method": "DoSearchForQQMusicDesktop",
        "module": "music.search.SearchCgiService",
        "param": {
            "remoteplace": "txt.yqq.top",
            "searchid": 0,
            "search_type": 0,
            "query": "",
            "page_num": 1,
            "num_per_page": 10
        }
    }
};
// 请求链接
const universalUrl = 'https://u6.y.qq.com/cgi-bin/musics.fcg';

/**
 * 获取 QQ 音乐歌曲链接
 * 
 * @param mid 音乐 ID
 * @param cookies 用户 Token
 * @returns Promise - 请求结果
 */
function getQQmusicSonglink(mid: string, cookies: { uin: number, qm_keyst: string }) {
    const data = songlinkData;
    const guid = Math.random() * 1000000000;
    data.comm.uin = cookies.uin;
    data.req_1.param.uin = `${cookies.uin}`;
    data.req_1.param.guid = guid;
    data.req_1.param.songmid = [mid];

    const sign = getSign(JSON.stringify(data));
    console.log(`sign = ${sign}`);

    const requestParams = `_=${Date.now()}&sign=${sign}`;
    const cookieHeader = `uin=${cookies.uin};qm_keyst=${cookies.qm_keyst};qqmusic_key=${cookies.qm_keyst}`;

    return proxyRequest(
        'POST',
        `${universalUrl}?${requestParams}`,
        {
            'Cookie': cookieHeader
        },
        data
    );
}

function getQQmusicSearchResult(query: string, cookies: { uin: number, qm_keyst: string }) {
    const data = searchData;
    const searchid = getSearchId();
    data.comm.uin = cookies.uin;
    data.req_1.param.searchid = searchid;
    data.req_1.param.query = query;

    const sign = getSign(JSON.stringify(data));
    console.log(`sign = ${sign}`);

    const requestParams = `_=${Date.now()}&sign=${sign}`;
    const cookieHeader = `uin=${cookies.uin};qm_keyst=${cookies.qm_keyst};qqmusic_key=${cookies.qm_keyst}`;

    return proxyRequest(
        'POST',
        `${universalUrl}?${requestParams}`,
        {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieHeader
        },
        data
    );
}

export { getQQmusicSonglink, getQQmusicSearchResult };
