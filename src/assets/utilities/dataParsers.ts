import type { AxiosResponse } from "axios";
import { getNeteaseResult } from "../scripts/netease/neteaseRequest";
import { getQQmusicResult } from "../scripts/qqmusic/qqmusicRequest";
import { getKuwoResult } from "../scripts/kuwo/kuwoRequest";
import { getKugouResult } from "../scripts/kugou/kugouRequest";

// 音乐信息模块
type MusicModule = 'songLink' | 'search' | 'songInfo' | 'lyrics' | 'songList' | 'album' | 'artist' | 
    'hotList' | 'recommendSong' | 'recommendArtist' | 'rankings' | 'rankingContent' | 'newSong' | 'newAlbum';

/**
 * 数据解析器
 * 按列表逐层索引元素得到答案
 * 
 * *以后不写这种抽象东西了 太难看了*
 * *但这样写之后写代码真的很统一化 好吧下次继续写这种抽象东西(*
 * 
 */
const dataParsers: Record<string, any> = {
    'netease': {
        'songInfo': {
            'body': ['data'],
            'songName': ['songs', '0', 'name'],
            'songCover': ['songs', '0', 'album', 'picUrl'],
            'songAuthors': ['songs', '0', 'artists'],
            'songDuration': ['songs', '0', 'duration'],
            '@processors' : {
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        },
        'songList': {
            'body': ['data'], // 数据体
            'name': ['playlist', 'name'], // 歌单名称
            'cover': ['playlist', 'coverImgUrl'], // 歌单封面
            'description': ['playlist', 'description'], // 歌单介绍
            'author': ['playlist', 'creator', 'nickname'], // 歌单作者
            'songCount': null, // 歌曲数量 (null => 使用 `tracks` 的长度)
            'tracks': ['playlist', 'trackIds'], // 所有歌曲
            'loadTracks': ['playlist', 'tracks'], // 含详细信息歌曲
            'songId': ['id'], // 歌曲 ID
            'songName': ['name'], // 歌曲名
            'songCover': ['al', 'picUrl'], // 歌曲封面
            'songAuthors': ['ar'], // 歌曲作者
            'songDuration': ['dt'], // 歌曲时长
            '@processors': { // 后处理函数
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        },
        'album': {
            'body': ['data'], // 数据体
            'name': ['album', 'name'], // 专辑名称
            'cover': ['album', 'picUrl'], // 专辑封面
            'description': ['album', 'briefDesc'], // 专辑介绍
            'author': ['album', 'artist', 'name'], // 专辑作者
            'songCount': ['album', 'size'], // 歌曲数量 (null => 使用 `tracks` 的长度)
            'tracks': ['album', 'songs'], // 所有歌曲
            'loadTracks': ['album', 'songs'], // 含详细信息歌曲
            'songId': ['id'], // 歌曲 ID
            'songName': ['name'], // 歌曲名
            'songCover': ['album', 'picUrl'], // 歌曲封面 (null => 使用专辑封面)
            'songAuthors': ['artists'], // 歌曲作者
            'songDuration': ['duration'], // 歌曲时长
            '@processors': { // 后处理函数
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        },
        'hotList': {
            'body': ['data'],
            'lists': ['result'],
            'listId': ['id'],
            'listName': ['name'],
            'listCover': ['picUrl']
        },
        'recommendSong': {
            'body': ['data'],
            'songList': ['playlist', 'tracks'],
            'songId': ['id'],
            'songName': ['name'],
            'songCover': ['al', 'picUrl'],
            'songAuthors': ['ar'],
            'songDuration': ['dt'],
            '@processors': {
                'songAuthors': (authorList: object[]) => formatAuthors(authorList, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        },
        'recommendArtist': {
            'body': ['data'],
            'artistList': ['artists'],
            'artistId': ['id'],
            'artistName': ['name'],
            'artistCover': ['picUrl']
        },
        'rankings': {
            'body': ['data'],
            'rankingList': ['list'],
            'rankingId': ['id'],
            'rankingName': ['name'],
            'rankingCover': ['coverImgUrl']
        },
        'newAlbum': {
            'body': ['data'],
            'albumList': ['albums'],
            'albumId': ['id'],
            'albumName': ['name'],
            'albumCover': ['picUrl']
        },
        'newSong': {
            'body': ['data'],
            'songList': ['result'],
            'songId': ['id'],
            'songName': ['name'],
            'songCover': ['picUrl'],
            'songAuthors': ['song', 'artists'],
            'songDuration': ['song', 'duration'],
            '@processors': {
                'songAuthors': (authorList: object[]) => formatAuthors(authorList, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        }
    },
    'qqmusic': {
        'songInfo': {
            'body': ['data', 'req_1'],
            'songName': ['data', 'track_info', 'title'],
            'songCover': ['data', 'track_info', 'album', 'pmid'],
            'songAuthors': ['data', 'track_info', 'singer'],
            'songDuration': ['data', 'track_info', 'interval'],
            '@processors' : {
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'qqmusic'),
            }
        },
        'songList': {
            'body': ['data', 'req_1'],
            'name': ['data', 'dirinfo', 'title'],
            'cover': ['data', 'dirinfo', 'picurl'],
            'description': ['data', 'dirinfo', 'desc'],
            'author': ['data', 'dirinfo', 'creator', 'nick'],
            'songCount': null,
            'tracks': ['data', 'songlist'],
            'loadTracks': ['data', 'songlist'],
            'songName': ['name'],
            'songId': ['mid'],
            'songCover': ['album', 'pmid'],
            'songAuthors': ['singer'],
            'songDuration': ['interval'],
            '@processors': {
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'qqmusic'),
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`
            }
        },
        'album': {
            'body': ['data'],
            'name': ['req_1', 'data', 'basicInfo', 'albumName'],
            'cover': ['req_1', 'data', 'basicInfo', 'pmid'],
            'description': ['req_1', 'data', 'basicInfo', 'desc'],
            'author': ['req_1', 'data', 'singer', 'singerList'],
            'songCount': ['req_2', 'data', 'totalNum'],
            'tracks': ['req_2', 'data', 'songList'],
            'loadTracks': ['req_2', 'data', 'songList'],
            'songId': ['songInfo', 'mid'],
            'songName': ['songInfo', 'title'],
            'songCover': ['songInfo', 'album', 'pmid'],
            'songAuthors': ['songInfo', 'singer'],
            'songDuration': ['songInfo', 'interval'],
            '@processors': {
                'author': (authorList: object[]) => formatAuthors(authorList, 'qqmusic'),
                'cover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'qqmusic'),
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
            }
        },
        'hotList': {
            'body': ['data', 'req_1'],
            'lists': ['data', 'List'],
            'listId': ['Playlist', 'basic', 'tid'],
            'listName': ['Playlist', 'basic', 'title'],
            'listCover': ['Playlist', 'basic', 'cover', 'default_url']
        },
        'recommendSong': {
            'body': ['data', 'req_1'],
            'songList': ['data', 'songlist'],
            'songId': ['mid'],
            'songName': ['title'],
            'songCover': ['album', 'pmid'],
            'songAuthors': ['singer'],
            'songDuration': ['interval'],
            '@processors': {
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (authorList: object[]) => formatAuthors(authorList, 'qqmusic')
            }
        },
        'recommendArtist': {
            'body': ['data', 'req_1'],
            'artistList': ['data', 'singerlist'],
            'artistId': ['singer_mid'],
            'artistName': ['singer_name'],
            'artistCover': ['singer_pic']
        },
        'newAlbum': {
            'body': ['data', 'req_1'],
            'albumList': ['data', 'albums'],
            'albumId': ['mid'],
            'albumName': ['name'],
            'albumCover': ['photo', 'pic_mid'],
            '@processors': {
                'albumCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`
            }
        },
        'newSong': {
            'body': ['data', 'req_1'],
            'songList': ['data', 'songlist'],
            'songId': ['mid'],
            'songName': ['name'],
            'songCover': ['album', 'pmid'],
            'songAuthors': ['singer'],
            'songDuration': ['interval'],
            '@processors': {
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (authorList: object[]) => formatAuthors(authorList, 'qqmusic')
            }
        }
    },
    'kuwo': {
        'songInfo': {
            'body': ['data'],
            'songName': ['data', 'name'],
            'songCover': ['data', 'pic'],
            'songAuthors': ['data', 'artist'],
            'songDuration': ['data', 'duration'],
            '@processors' : {
                'songAuthors': (authors: string) => authors.split('&').join(', ')
            }
        },
        'songList': {
            'body': ['data'],
            'name': ['data', 'name'],
            'cover': ['data', 'img500'],
            'description': ['data', 'info'],
            'author': ['data', 'username'],
            'songCount': ['data', 'total'],
            'tracks': ['data', 'musicList'],
            'loadTracks': ['data', 'musicList'],
            'songId': ['rid'],
            'songName': ['name'],
            'songCover': ['pic'],
            'songAuthors': ['artist'],
            'songDuration': ['duration'],
            '@processors': {
                'songAuthors': (param: string) => param.split('&')
            }
        },
        'album': {
            'body': ['data'],
            'name': ['name'],
            'cover': ['img'],
            'description': ['info'],
            'author': ['artist'],
            'songCount': ['songnum'],
            'tracks': ['musiclist'],
            'loadTracks': ['musiclist'],
            'songId': ['id'],
            'songName': ['name'],
            'songCover': ['pic120'],
            'songAuthors': ['artist'],
            'songDuration': ['duration'],
            '@processors': {
                'author': (authors: string) => authors.split('&'),
                'songAuthors': (authors: string) => authors.split('&'),
                'songDuration': (duration: string) => parseInt(duration)
            }
        },
        'hotList': {
            'body': ['data'],
            'lists': ['data', 'data'],
            'listId': ['id'],
            'listName': ['name'],
            'listCover': ['img']
        },
        'recommendSong': {
            'body': ['data'],
            'songList': ['data', 'musicList'],
            'songId': ['rid'],
            'songName': ['name'],
            'songCover': ['pic'],
            'songAuthors': ['artist'],
            'songDuration': ['duration'],
            '@processors': {
                'songAuthors': (authorList: string) => formatAuthors(authorList.split('&'), 'kuwo')
            }
        },
        'recommendArtist': {
            'body': ['data'],
            'artistList': ['data', 'artistList'],
            'artistId': ['id'],
            'artistName': ['name'],
            'artistCover': ['pic']
        },
        'newSong': {
            'body': ['data'],
            'songList': ['data', 'musicList'],
            'songId': ['rid'],
            'songName': ['name'],
            'songCover': ['pic'],
            'songAuthors': ['artist'],
            'songDuration': ['duration'],
            '@processors': {
                'songAuthors': (authors: string) => formatAuthors(authors.split('&'), 'kuwo')
            }
        }
    },
    'kugou': {
        'songInfo': {
            'body': ['data'],
            'songName': ['data', 'song_name'],
            'songCover': ['data', 'img'],
            'songAuthors': ['data', 'author_name'],
            'songDuration': ['data', 'timelength'],
            '@processors' : {
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        },
        'songList': {
            'body': ['data'],
            'name': ['info', 'list', 'specialname'],
            'cover': ['info', 'list', 'imgurl'],
            'description': ['info', 'list', 'intro'],
            'author': ['nickname'],
            'songCount': ['info', 'list', 'songcount'],
            'tracks': ['list', 'list', 'info'],
            'loadTracks': ['list', 'list', 'info'],
            'songId': ['song_url'],
            'songName': ['filename'],
            'songCover': ['trans_param', 'union_cover'],
            'songAuthors': ['filename'],
            'songDuration': ['duration'],
            '@processors': {
                'cover': (imgUrl: string) => imgUrl.replace('{size}', '500'),
                'songId': (songPage: string) => songPage.replace('https://m.kugou.com/mixsong/', '').replace('.html', ''),
                'songName': (fileName: string) => fileName.split(' - ')[1],
                'songAuthors': (fileName: string) => fileName.split(' - ')[0].split('、').join(',')
            }
        },
        'album': {
            'body': ['data'],
            'name': ['data', 'albumname'],
            'cover': ['data', 'img400'],
            'description': ['data', 'intro'],
            'author': ['data', 'singer'],
            'songCount': ['data', 'songcount'],
            'tracks': ['data', 'list'],
            'loadTracks': ['data', 'list'],
            'songId': ['url'],
            'songName': ['filename'],
            'songCover': ['trans_param', 'union_cover'],
            'songAuthors': ['filename'],
            'songDuration': ['duration'],
            '@processors': {
                'author': (authors: string) => authors.split('、')
                    .map((name: string) => { return { 'author_name': name }; }),
                'songId': (songPage: string) => songPage.replace('https://m3ws.kugou.com/mixsong/', '').replace('/html', ''),
                'songName': (fileName: string) => fileName.split(' - ')[1],
                'songAuthors': (fileName: string) => fileName.split(' - ')[0].split('、').join(',')
            }
        },
        'hotList': {
            'body': ['data', 'plist'],
            'lists': ['list', 'info'],
            'listId': ['specialid'],
            'listName': ['specialname'],
            'listCover': ['imgurl'],
            '@processors': {
                'listCover': (imgUrl: string) => imgUrl.replace('{size}', '500')
            }
        },
        'recommendSong': {
            'body': ['data'],
            'songList': ['data'],
            'songId': ['song_url'],
            'songName': ['song_name'],
            'songCover': ['album_sizable_cover'],
            'songAuthors': ['authors'],
            'songDuration': ['duration'],
            '@processors': {
                'songId': (songPage: string) => songPage.replace('https://m.kugou.com/mixsong/', '').replace('.html', ''),
                'songCover': (imgUrl: string) => imgUrl.replace('{size}', '500'),
                'songAuthors': (authorList: object[]) => formatAuthors(authorList, 'kugou')
            }
        },
        'recommendArtist': {
            'body': ['data'],
            'artistList': ['singers', 'list', 'info', '0', 'singer'],
            'artistId': ['singerid'],
            'artistName': ['singername'],
            'artistCover': ['imgurl']
        },
        'newSong': {
            'body': ['data'],
            'songList': ['newSongList'],
            'songId': ['song_url'],
            'songName': ['songname'],
            'songCover': ['album_sizable_cover'],
            'songAuthors': ['authors'],
            'songDuration': ['duration'],
            '@processors': {
                'songId': (songPage: string) => songPage.replace('https://m.kugou.com/mixsong/', '').replace('.html', ''),
                'songCover': (imgUrl: string) => imgUrl.replace('{size}', '500'),
                'songAuthors': (authorList: object[]) => formatAuthors(authorList, 'kugou')
            }
        }
    }
};

// 解析目标数据
const targetFormats: Record<string, any> = {
    'songInfo': {
        'songName': '',
        'songCover': '',
        'songAuthors': [],
        'songDuration': 0
    },
    'song_brief': {
        'songId': '',
        'songName': '',
        'songCover': '',
        'songAuthors': '',
        'songDuration': ''
    },
    'songList': {
        'name': '',
        'cover': '',
        'description': '',
        'author': [],
        'tracks': [],
        'loadTracks': '@song_brief',
        'songCount': 0
    },
    'songList_brief': {
        'listId': '',
        'listName': '',
        'listCover': '',
    },
    'album': {
        'name': '',
        'cover': '',
        'description': '',
        'author': [],
        'tracks': [],
        'loadTracks': '@song_brief',
        'songCount': 0
    },
    'album_brief': {
        'albumId': '',
        'albumName': '',
        'albumCover': ''
    },
    'hotList': {
        'lists': '@songList_brief'
    },
    'recommendSong': {
        'songList': '@song_brief'
    },
    'recommendArtist': {
        'artistList': '@artist_brief'
    },
    'artist': {
        'artistName': '',
        'artistCover': '',
        'artistDescription': '',
        'newSongs': '@song_brief',
        'newAlbums': '@album_brief',
        'hotSongs': '@song_brief',
        'hotAlbums': '@album_brief'
    },
    'artist_brief': {
        'artistId': '',
        'artistName': '',
        'artistCover': ''
    },
    'newAlbum': {
        'albumList': '@album_brief'
    },
    'newSong': {
        'songList': '@song_brief'
    }
}

const platformRequest: Record<string, Record<string, any>> = {
    'netease': {
        'function': getNeteaseResult,
        'data': {
            'songInfo': { songId: '[data]' },
            'songList': { listId: '[data]' },
            'album': { albumId: '[data]' },
            'artist': { artistId: '[dataInt]' }
        }
    },
    'qqmusic': {
        'function': getQQmusicResult,
        'data': {
            'songInfo': { songMid: '[data]' },
            'songList': { listId: '[data]' },
            'album': { albumId: '[data]' },
            'artist': { artistId: '[data]' }
        },
        '@processors': {
            'songList': (data: { listId: string }) => { return { listId: parseInt(data.listId) }; }
        }
    },
    'kuwo': {
        'function': getKuwoResult,
        'data': {
            'songInfo': { songId: '[data]' },
            'songList': { listId: '[data]' },
            'album': { albumId: '[data]' },
            'artist': { artistId: '[dataInt]' }
        }
    },
    'kugou': {
        'function': getKugouResult,
        'data': {
            'songInfo': { songId: '[data]' },
            'songList': { listId: '[data]' },
            'album': { albumId: '[data]' },
            'artist': { artistId: '[dataInt]' }
        }
    }
};

// 获取请求格式
function getRequestFormat() {
    return platformRequest;
}

// 格式化歌手清单
const authorDereferencers: { [type: string]: string[] } = {
    'netease': ['name'],
    'qqmusic': ['name'],
    'kuwo': [],
    'kugou': ['author_name']
};
function formatAuthors(authorList: any[], platform: string): string {
    const names: string[] = [];
    authorList.forEach((authorInfo: any) => {
        let info: any = authorInfo;
        const dereferencer = authorDereferencers[platform];
        for (let i = 0; i < dereferencer.length; i++) {
            info = info[dereferencer[i]];
        }
        names.push(info);
    });
    return names.join(', ');
}
/**
 * 根据列表解析数据
 * @param data 被解析对象
 * @param parserList 键列表
 * @returns any - 解析后数据
 * @throws 解析到 `undefined` 时若继续解析则报错
 */
function parseDataByArray(data: any, parserList: string[]) {
    let object = data;
    if (parserList === undefined) console.log(data);
    for (let i = 0; i < parserList.length; i++) {
        const param = parserList[i];
        if (object === undefined) {
            throw new Error(`[ERROR] Cannot parse data 'undefined' with key '${param}'`);
        }
        object = object[param];
    }
    return object;
}

const callChildParsers = ['song_brief', 'songList_brief', 'album_brief', 'artist_brief'];
function parseData(data: any, platform: string, module: string, parentModule: string = '') {
    // console.log(data, module);
    // 获取解析器
    let result = JSON.parse(JSON.stringify(targetFormats[module])); // 深拷贝结果对象
    if (!result) {
        console.error(`[ERROR] Unsupported module ${module} for platform ${platform}`);
    }
    const parsers = parentModule === '' ? dataParsers[platform][module] : dataParsers[platform][parentModule];

    // 解析数据
    Object.keys(result).forEach((key: string) => {
        const parserList: string[] = parsers[key];

        // songCount 解析器为 null => 使用 `loadTracks` 作为列表长度
        if (key === 'songCount') {
            if (parsers.songCount === null) {
                result[key] = result.tracks.length;
                return;
            }
        }

        const parseResult = parseDataByArray(data, parserList);
        const resultList = [];
        let isResultList = false;
        // console.log(`${platform}/${module} => ${JSON.stringify(parseResult)}`);

        // 含有子数据 => 递归解析
        if (typeof result[key] === 'string') {
            const childJudgement = result[key].replace('@', '');
            if (callChildParsers.includes(childJudgement)) {
                isResultList = true;
                const infoList = parseResult;
                for (let i = 0; i < infoList.length; i++) {
                    const infoData = infoList[i];
                    const parsedChild = parseData(infoData, platform, childJudgement, module);
                    resultList.push(parsedChild);
                }
            }
        }

        result[key] = isResultList ? resultList : parseResult;

        // 数据后处理
        if (parsers['@processors']) {
            if (parsers['@processors'][key]) {
                const processor = parsers['@processors'][key];
                result[key] = processor(result[key]);
            }
        }
    });

    return result;
}

function parseMusicData(response: AxiosResponse, platform: string, module: MusicModule) {
    if (!dataParsers[platform]) {
        console.error(`[ERROR] Unsupported platform ${platform}`);
    }
    // 获取数据体
    const parsers = dataParsers[platform][module];
    const bodyParser = parsers.body;
    const body = parseDataByArray(response, bodyParser);

    // 检查请求结果
    if ((body.code !== undefined && body.code !== 200 && platform !== 'qqmusic') || (body.code !== 0 && platform === 'qqmusic')) {
        console.error(`[ERROR] Failed to request ${platform} api (Code ${body.code})`);
        return;
    }
    
    const parsedResponse = parseData(body, platform, module);

    return parsedResponse;
}

export { formatAuthors, getRequestFormat, parseMusicData };
