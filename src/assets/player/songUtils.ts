import type { AxiosResponse, AxiosError } from "axios";
import { getAccountInfo } from "../utilities/accountManager";
import { parseMusicData } from "../utilities/dataParsers";
import { getKugouResult } from "../scripts/kugou/kugouRequest";
import { getKuwoResult } from "../scripts/kuwo/kuwoRequest";
import { getNeteaseResult } from "../scripts/netease/neteaseRequest";
import { getQQmusicResult } from "../scripts/qqmusic/qqmusicRequest";

const requestFuncs: Record<string, Function> = {
    netease: getNeteaseResult,
    qqmusic: getQQmusicResult,
    kuwo: getKuwoResult,
    kugou: getKugouResult
}

/**
 * 根据歌曲 ID 解析歌曲链接
 * @param songId 歌曲 ID (`music-${platform}-${id}`)
 */
function getSongLink(songId: string) {
    // console.log(songId);
    const idParts = songId.split('-');
    const platform = idParts[1];
    const id = idParts[2];
    
    return new Promise((resolve, reject) => {
        const sendRequest = requestFuncs[platform];
        if (!sendRequest) {
            reject(`[Error] Unsupported platform: ${platform}`);
        }

        const userData = getAccountInfo('all');
        let idParams: object = { songId: id };
        if (platform === 'qqmusic') {
            idParams = { songMid: id };
        }
        sendRequest('songLink', idParams, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                console.log(response.data);
                const parsedInfo = parseMusicData(response, platform, 'songLink');
                resolve(parsedInfo);
            })
            .catch((error: AxiosError) => {
                reject(error);
            });
    });
}

/**
 * 根据歌曲 ID 解析歌曲信息
 * @param songId 歌曲 ID (`music-${platform}-${id}`)
 */
function getSongInfo(songId: string) {
    // console.log(songId);
    const idParts = songId.split('-');
    const platform = idParts[1];
    const id = idParts[2];
    
    return new Promise((resolve, reject) => {
        const sendRequest = requestFuncs[platform];
        if (!sendRequest) {
            reject(`[Error] Unsupported platform: ${platform}`);
        }

        const userData = getAccountInfo('all');
        let idParams: object = { songId: id };
        if (platform === 'qqmusic') {
            idParams = { songMid: id };
        }
        sendRequest('songInfo', idParams, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                const parsedInfo = parseMusicData(response, platform, 'songInfo');
                // console.log(response.data, parsedInfo);
                resolve(parsedInfo);
            })
            .catch((error: AxiosError) => {
                reject(error);
            });
    });
}

function getListContent(listId: string) {
    const idParts = listId.split('-');
    let type = idParts[0];
    if (type === 'songlist') type = 'songList';
    const platform = idParts[1];
    let idParam = idParts[2];

    let id;
    if (platform === 'qqmusic' && type === 'songList') {
        id = parseInt(idParam);
    }
    else {
        id = idParam
    }
    
    return new Promise((resolve, reject) => {
        const sendRequest = requestFuncs[platform];
        if (!sendRequest) {
            reject(`[Error] Unsupported platform: ${platform}`);
        }

        const requestParams = type === 'songList' ? { listId: id } : { albumId: id };
        const userData = getAccountInfo('all');
        sendRequest(type, requestParams, userData[platform].cookies)
            .then((response: AxiosResponse) => {
                const parsedInfo = parseMusicData(response, platform, type);
                console.log(response.data, parsedInfo);
                resolve(parsedInfo);
            })
            .catch((error: AxiosError) => {
                reject(error);
            });
    });
}

export { getSongLink, getSongInfo, getListContent };
