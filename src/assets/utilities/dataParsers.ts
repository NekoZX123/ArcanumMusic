import type { AxiosResponse } from "axios";
import { getNeteaseResult } from "../scripts/netease/neteaseRequest";
import { getQQmusicResult } from "../scripts/qqmusic/qqmusicRequest";
import { getKuwoResult } from "../scripts/kuwo/kuwoRequest";
import { getKugouResult } from "../scripts/kugou/kugouRequest";

/**
 * 数据解析器
 * 按列表逐层索引元素得到答案 
 */
const dataParsers: Record<string, any> = {
    'netease': {
        'songLink': {
            'body': ['data'],
            'url': ['data', '0', 'url']
        },
        'songInfo': {
            'body': ['data'],
            'songName': ['songs', '0', 'name'],
            'songCover': ['songs', '0', 'album', 'picUrl'],
            'songAuthors': ['songs', '0', 'artists'],
            'songDuration': ['songs', '0', 'duration'],
            'albumId': ['songs', '0', 'album', 'id'],
            'authorsObject': ['songs', '0', 'artists'],
            '@postprocessors' : {
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000),
                'authorsObject': (authors: object[]) => getAuthorObject(authors, 'netease')
            }
        },
        'lyrics': {
            'body': ['data'],
            'lyrics': ['lrc', 'lyric'],
            'translation': ['tlyric', 'lyric'],
            '@postprocessors': {
                'lyrics': (lyricText: string) => lyricText?.split('\n'),
                'translation': (lyricText: string) => lyricText?.split('\n')
            }
        },
        'search-singles': {
            'body': ['data'],
            'songList': ['result', 'songs'],
            'songId': ['id'],
            'songName': ['name'],
            'songCover': ['al', 'picUrl'],
            'songAuthors': ['ar'],
            'songDuration': ['dt'],
            '@postprocessors' : {
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        },
        'search-songlists': {
            'body': ['data'],
            'lists': ['result', 'playlists'],
            'listId': ['id'],
            'listName': ['name'],
            'listCover': ['coverImgUrl']
        },
        'search-albums': {
            'body': ['data'],
            'albumList': ['result', 'albums'],
            'albumId': ['id'],
            'albumName': ['name'],
            'albumCover': ['picUrl']
        },
        'search-artists': {
            'body': ['data'],
            'artistList': ['result', 'artists'],
            'artistId': ['id'],
            'artistName': ['name'],
            'artistCover': ['picUrl']
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
            '@postprocessors': { // 后处理函数
                'tracks': (tracks: any[]) => tracks.map((trackInfo) => trackInfo.id),
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
            '@postprocessors': { // 后处理函数
                'tracks': (tracks: any[]) => tracks.map((trackInfo) => trackInfo.id),
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        },
        'artistAlbum': {
            'body': ['data'],
            'albumList': ['hotAlbums'],
            'albumId': ['id'],
            'albumName': ['name'],
            'albumCover': ['picUrl']
        },
        'artistSongs': {
            'body': ['data'],
            'songList': ['songs'],
            'songId': ['id'],
            'songName': ['name'],
            'songCover': ['al', 'picUrl'],
            'songAuthors': ['ar'],
            'songDuration': ['dt'],
            '@postprocessors': {
                'songAuthors': (authorList: any[]) => formatAuthors(authorList, 'netease'),
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
            '@postprocessors': {
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
        'rankingContent': {
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
            '@postprocessors': { // 后处理函数
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
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
            '@postprocessors': {
                'songAuthors': (authorList: object[]) => formatAuthors(authorList, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        },
        'userFavourites': {
            'body': ['data'],
            'songCount': null,
            'tracks': ['playlist', 'trackIds'],
            'loadTracks': ['playlist', 'tracks'],
            'songId': ['id'],
            'songName': ['name'],
            'songCover': ['al', 'picUrl'],
            'songAuthors': ['ar'],
            'songDuration': ['dt'],
            '@postprocessors': {
                'tracks': (trackList: any[]) => trackList.map((trackInfo) => trackInfo.id),
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        },
        'userPlaylists': {
            'body': ['data'],
            'lists': ['playlist'],
            'listId': ['id'],
            'listName': ['name'],
            'listCover': ['coverImgUrl']
        },
        'dailyRecommends': {
            'body': ['data'],
            'songCount': null,
            'tracks': ['recommend'],
            'loadTracks': ['recommend'],
            'songId': ['id'],
            'songName': ['name'],
            'songCover': ['album', 'picUrl'],
            'songAuthors': ['artists'],
            'songDuration': ['duration'],
            '@postprocessors': {
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'netease'),
                'songDuration': (duration: number) => Math.round(duration / 1000)
            }
        }
    },
    'qqmusic': {
        'songLink': {
            'body': ['data', 'req_1'],
            'url': ['data', 'midurlinfo', '0', 'purl'],
            '@postprocessors': {
                'url': (fileName: string) => `http://aqqmusic.tc.qq.com/${fileName}`
            }
        },
        'songInfo': {
            'body': ['data', 'req_1'],
            'songName': ['data', 'track_info', 'title'],
            'songCover': ['data', 'track_info', 'album', 'pmid'],
            'songAuthors': ['data', 'track_info', 'singer'],
            'songDuration': ['data', 'track_info', 'interval'],
            'albumId': ['data', 'track_info', 'album', 'mid'],
            'authorsObject': ['data', 'track_info', 'singer'],
            '@postprocessors' : {
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'qqmusic'),
                'authorsObject': (authors: any[]) => getAuthorObject(authors, 'qqmusic')
            }
        },
        'lyrics': {
            'body': ['data'],
            'lyrics': ['lyrics'],
            'translation': ['translation']
        },
        'search-singles': {
            'body': ['data', 'req_1'],
            'songList': ['data', 'body', 'song', 'list'],
            'songId': ['mid'],
            'songName': ['name'],
            'songCover': ['album', 'pmid'],
            'songAuthors': ['singer'],
            'songDuration': ['interval'],
            '@postprocessors' : {
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (authors: any[]) => formatAuthors(authors, 'qqmusic')
            }
        },
        'search-songlists': {
            'body': ['data', 'req_1'],
            'lists': ['data', 'body', 'songlist', 'list'],
            'listId': ['dissid'], // not mid, need fix later
            'listName': ['dissname'],
            'listCover': ['imgurl']
        },
        'search-albums': {
            'body': ['data', 'req_1'],
            'albumList': ['data', 'body', 'album', 'list'],
            'albumId': ['albumMID'],
            'albumName': ['albumName'],
            'albumCover': ['albumPic']
        },
        'search-artists': {
            'body': ['data', 'req_1'],
            'artistList': ['data', 'body', 'zhida', 'list'],
            'artistId': ['custom_info', 'mid'],
            'artistName': ['title'],
            'artistCover': ['pic']
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
            '@postprocessors': {
                'tracks': (tracks: any[]) => tracks.map((trackInfo) => trackInfo.mid),
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
            '@postprocessors': {
                'tracks': (tracks: any[]) => tracks.map((trackInfo) => trackInfo.songInfo.mid),
                'author': (authorList: object[]) => formatAuthors(authorList, 'qqmusic'),
                'cover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'qqmusic'),
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
            }
        },
        'artistAlbum': {
            'body': ['data', 'req_2'],
            'albumList': ['data', 'albumList'],
            'albumId': ['albumMid'],
            'albumName': ['albumName'],
            'albumCover': ['pmid'],
            '@postprocessors': {
                'albumCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`
            }
        },
        'artistSongs': {
            'body': ['data', 'req_3'],
            'songList': ['data', 'songList'],
            'songId': ['songInfo', 'mid'],
            'songName': ['songInfo', 'title'],
            'songCover': ['songInfo', 'album', 'pmid'],
            'songAuthors': ['songInfo', 'singer'],
            'songDuration': ['songInfo', 'interval'],
            '@postprocessors': {
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (authorList: any[]) => formatAuthors(authorList, 'qqmusic')
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
            '@postprocessors': {
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
        'rankings': {
            'body': ['data', 'req_1'],
            'rankingList': ['data', 'group'],
            'rankingId': ['topId'],
            'rankingName': ['title'],
            'rankingCover': ['topAlbumURL'],
            '@preprocessors': {
                'rankingList': (groups: any[]) => {
                    const lists: object[] = [];
                    groups.forEach((groupInfo) => {
                        const groupLists = groupInfo.toplist;
                        groupLists.forEach((listInfo: object) => lists.push(listInfo));
                    });
                    return lists;
                }
            }
        },
        'rankingContent': {
            'body': ['data', 'req_1'],
            'name': ['data', 'data', 'title'],
            'cover': ['data', 'data', 'headPicUrl'],
            'description': ['data', 'data', 'intro'],
            'author': [],
            'songCount': ['data', 'data', 'totalNum'],
            'tracks': ['data', 'songInfoList'],
            'loadTracks': ['data', 'songInfoList'],
            'songId': ['mid'],
            'songName': ['name'],
            'songCover': ['album', 'pmid'],
            'songAuthors': ['singer'],
            'songDuration': ['interval'],
            '@postprocessors': {
                'author': () => 'QQ音乐',
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (singers: any[]) => formatAuthors(singers, 'qqmusic')
            }
        },
        'newAlbum': {
            'body': ['data', 'req_1'],
            'albumList': ['data', 'albums'],
            'albumId': ['mid'],
            'albumName': ['name'],
            'albumCover': ['photo', 'pic_mid'],
            '@postprocessors': {
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
            '@postprocessors': {
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (authorList: object[]) => formatAuthors(authorList, 'qqmusic')
            }
        },
        'userFavourites': {
            'body': ['data', 'req_1'],
            'songCount': null,
            'tracks': ['data', 'songlist'],
            'loadTracks': ['data', 'songlist'],
            'songId': ['mid'],
            'songName': ['name'],
            'songCover': ['album', 'pmid'],
            'songAuthors': ['singer'],
            'songDuration': ['interval'],
            '@postprocessors': {
                'tracks': (tracks: any[]) => tracks.map((trackInfo) => trackInfo.mid),
                'songCover': (pmid: string) => `https://y.qq.com/music/photo_new/T002R300x300M000${pmid}.jpg`,
                'songAuthors': (authors: object[]) => formatAuthors(authors, 'qqmusic'),
            }
        },
        'userPlaylists': {
            'body': ['data'],
            'lists': ['data', 'cdlist'],
            'listId': ['dissid'],
            'listName': ['dissname'],
            'listCover': ['logo']
        }
    },
    'kuwo': {
        'songLink': {
            'body': ['data'],
            'url': ['data', 'url']
        },
        'songInfo': {
            'body': ['data'],
            'songName': ['data', 'name'],
            'songCover': ['data', 'pic'],
            'songAuthors': ['data', 'artist'],
            'songDuration': ['data', 'duration'],
            'albumId': ['data', 'albumid'],
            'authorsObject': ['data'],
            '@postprocessors' : {
                'songAuthors': (authors: string) => authors.split('&').join(', '),
                'authorsObject': (data: any) => getAuthorObject([data], 'kuwo')
            }
        },
        'lyrics': {
            'body': ['data'],
            'lyrics': ['data', 'lrclist'],
            'translation': ['data', 'lrclist'],
        },
        'search-singles': {
            'body': ['data'],
            'songList': ['abslist'],
            'songId': ['DC_TARGETID'],
            'songName': ['NAME'],
            'songCover': ['web_albumpic_short'],
            'songAuthors': ['ARTIST'],
            'songDuration': ['DURATION'],
            '@postprocessors' : {
                'songAuthors': (authors: string) => formatAuthors(authors.split('&'), 'kuwo'),
                'songCover': (short: string) => `https://img3.kuwo.cn/star/albumcover/${short}`
            }
        },
        'search-songlists': {
            'body': ['data'],
            'lists': ['data', 'list'],
            'listId': ['id'],
            'listName': ['name'],
            'listCover': ['img']
        },
        'search-albums': {
            'body': ['data'],
            'albumList': ['data', 'albumList'],
            'albumId': ['albumid'],
            'albumName': ['album'],
            'albumCover': ['pic']
        },
        'search-artists': {
            'body': ['data'],
            'artistList': ['data', 'artistList'],
            'artistId': ['id'],
            'artistName': ['name'],
            'artistCover': ['pic']
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
            '@postprocessors': {
                'tracks': (trackList: any[]) => trackList.map((trackInfo) => trackInfo.rid),
                'songAuthors': (param: string) => formatAuthors(param.split('&'), 'kuwo')
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
            '@postprocessors': {
                'author': (authors: string) => formatAuthors(authors.split('&'), 'kuwo'),
                'tracks': (trackList: any[]) => trackList.map((trackInfo) => trackInfo.id),
                'songAuthors': (authors: string) => formatAuthors(authors.split('&'), 'kuwo'),
                'songDuration': (duration: string) => parseInt(duration)
            }
        },
        'artistAlbum': {
            'body': ['data'],
            'albumList': ['data', 'albumList'],
            'albumId': ['albumid'],
            'albumName': ['album'],
            'albumCover': ['pic']
        },
        'artistSongs': {
            'body': ['data'],
            'songList': ['data', 'list'],
            'songId': ['rid'],
            'songName': ['name'],
            'songCover': ['pic'],
            'songAuthors': ['artist'],
            'songDuration': ['duration'],
            '@postprocessors': {
                'songAuthors': (authors: string) => formatAuthors(authors.split('&'), 'kuwo')
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
            '@postprocessors': {
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
        'rankings': {
            'body': ['data'],
            'rankingList': ['data'],
            'rankingId': ['sourceid'],
            'rankingName': ['name'],
            'rankingCover': ['pic'],
            '@preprocessors': {
                'rankingList': (groups: any[]) => {
                    const lists: object[] = [];
                    
                    // console.log(groups);
                    for (let i = 0; i < groups.length; i++) {
                        const groupInfo = groups[i];
                        const groupLists = groupInfo.list;
                        groupLists.forEach((listInfo: object) => lists.push(listInfo));
                    }
                    return lists;
                }
            }
        },
        'rankingContent': {
            'body': ['data'],
            'name': [],
            'cover': ['data', 'img'],
            'description': [],
            'author': [],
            'songCount': ['data', 'num'],
            'tracks': ['data', 'musicList'],
            'loadTracks': ['data', 'musicList'],
            'songId': ['rid'],
            'songName': ['name'],
            'songCover': ['pic'],
            'songAuthors': ['artist'],
            'songDuration': ['duration'],
            '@postprocessors': {
                'name': () => '酷我音乐 - 排行榜',
                'description': () => '',
                'author': () => '酷我音乐',
                'songAuthors': (authors: string) => formatAuthors(authors.split('&'), 'kuwo')
            }
        },
        'newAlbum': {
            'body': ['data'],
            'albumList': ['data', 'musicList'],
            'albumId': ['albumid'],
            'albumName': ['album'],
            'albumCover': ['albumpic']
        },
        'newSong': {
            'body': ['data'],
            'songList': ['data', 'musicList'],
            'songId': ['rid'],
            'songName': ['name'],
            'songCover': ['pic'],
            'songAuthors': ['artist'],
            'songDuration': ['duration'],
            '@postprocessors': {
                'songAuthors': (authors: string) => formatAuthors(authors.split('&'), 'kuwo')
            }
        }
    },
    'kugou': {
        'songLink': {
            'body': ['data'],
            'url': ['data', 'play_url']
        },
        'songInfo': {
            'body': ['data'],
            'songName': ['data', 'song_name'],
            'songCover': ['data', 'img'],
            'songAuthors': ['data', 'author_name'],
            'songDuration': ['data', 'timelength'],
            'albumId': ['data', 'album_id'],
            'authorsObject': ['data', 'authors'],
            '@postprocessors' : {
                'songDuration': (duration: number) => Math.round(duration / 1000),
                'authorsObject': (authors: any[]) => getAuthorObject(authors, 'kugou')
            }
        },
        'lyrics': {
            'body': ['data'],
            'lyrics': ['data', 'lyrics'],
            'translation': ['data', 'lyrics'],
            '@postprocessors': {
                'lyrics': (lyricText: string) => lyricText?.split('\n'),
                'translation': (_: any) => []
            }
        },
        'search-singles': {
            'body': ['data'],
            'songList': ['data', 'lists'],
            'songId': ['EMixSongID'],
            'songName': ['SongName'],
            'songCover': ['Image'],
            'songAuthors': ['SingerName'],
            'songDuration': ['Duration'],
            '@postprocessors' : {
                'songCover': (img: string) => img.replace('{size}', '500')
            }
        },
        'search-songlists': {
            'body': ['data'],
            'lists': ['data', 'lists'],
            'listId': ['specialid'],
            'listName': ['specialname'],
            'listCover': ['img']
        },
        'search-albums': {
            'body': ['data'],
            'albumList': ['data', 'lists'],
            'albumId': ['albumid'],
            'albumName': ['albumname'],
            'albumCover': ['img']
        },
        'search-artists': {
            'body': ['data'],
            'artistList': ['data', 'lists'],
            'artistId': ['AuthorId'],
            'artistName': ['AuthorName'],
            'artistCover': ['Avatar']
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
            '@postprocessors': {
                'cover': (imgUrl: string) => imgUrl.replace('{size}', '500'),
                'tracks': (trackList: any[]) => trackList.map(
                    (trackInfo) => trackInfo.song_url.replace('https://m.kugou.com/mixsong/', '').replace('.html', '')
                    ),
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
            '@postprocessors': {
                'author': (authors: string) => authors.split('、')
                    .map((name: string) => { return { 'author_name': name }; }),
                'tracks': (trackList: any[]) => trackList.map(
                    (trackInfo) => trackInfo.url.replace('https://m3ws.kugou.com/mixsong/', '').replace('/html', '')
                    ),
                'songId': (songPage: string) => songPage.replace('https://m3ws.kugou.com/mixsong/', '').replace('/html', ''),
                'songName': (fileName: string) => fileName.split(' - ')[1],
                'songAuthors': (fileName: string) => fileName.split(' - ')[0].split('、').join(',')
            }
        },
        'artistAlbum': {
            'body': ['data'],
            'albumList': ['data', 'info'],
            'albumId': ['albumid'],
            'albumName': ['albumname'],
            'albumCover': ['imgurl']
        },
        'artistSongs': {
            'body': ['data'],
            'songList': ['data', 'songs'],
            'songId': ['audio_id'],
            'songName': ['audio_name'],
            'songCover': ['album_info', 'cover'],
            'songAuthors': ['authors'],
            'songDuration': ['duration'],
            '@postprocessors': {
                'songCover': (img: string) => img.replace('{size}', '500'),
                'songAuthors': (authorList: any[]) => formatAuthors(authorList, 'kugou')
            }
        },
        'hotList': {
            'body': ['data', 'plist'],
            'lists': ['list', 'info'],
            'listId': ['specialid'],
            'listName': ['specialname'],
            'listCover': ['imgurl'],
            '@postprocessors': {
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
            '@postprocessors': {
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
        'rankings': {
            'body': ['data'],
            'rankingList': ['rank', 'list'],
            'rankingId': ['rankid'],
            'rankingName': ['rankname'],
            'rankingCover': ['imgurl'],
            '@postprocessors': {
                'rankingCover': (img: string) => img.replace('{size}', '500')
            }
        },
        'rankingContent': {
            'body': ['data'],
            'name': ['info', 'rankname'],
            'cover': ['info', 'imgurl'],
            'description': ['info', 'intro'],
            'author': [],
            'songCount': ['songs', 'total'],
            'tracks': ['songs', 'list'],
            'loadTracks': ['songs', 'list'],
            'songId': ['song_url'],
            'songName': ['songname'],
            'songCover': ['album_sizable_cover'],
            'songAuthors': ['authors'],
            'songDuration': ['duration'],
            '@postprocessors': {
                'cover': (img: string) => img.replace('{size}', '500'),
                'author': () => '酷狗音乐',
                'songId': (url: string) => url.replace('https://m.kugou.com/mixsong/', '').replace('.html', ''),
                'songCover': (img: string) => img.replace('{size}', '500'),
                'songAuthors': (authors: any[]) => formatAuthors(authors, 'kugou')
            }
        },
        'newAlbum': {
            'body': ['data'],
            'albumList': [],
            '@postprocessors': {
                'albumList': (_: any) => []
            }
        },
        'newSong': {
            'body': ['data'],
            'songList': ['newSongList'],
            'songId': ['song_url'],
            'songName': ['songname'],
            'songCover': ['album_sizable_cover'],
            'songAuthors': ['authors'],
            'songDuration': ['duration'],
            '@postprocessors': {
                'songId': (songPage: string) => songPage.replace('https://m.kugou.com/mixsong/', '').replace('.html', ''),
                'songCover': (imgUrl: string) => imgUrl.replace('{size}', '500'),
                'songAuthors': (authorList: object[]) => formatAuthors(authorList, 'kugou')
            }
        }
    }
};

// 解析目标数据
const targetFormats: Record<string, any> = {
    'songLink': {
        'url': ''
    },
    'songInfo': {
        'songName': '',
        'songCover': '',
        'songAuthors': [],
        'songDuration': 0,
        'albumId': '',
        'authorsObject': []
    },
    'lyrics': {
        'lyrics': [],
        'translation': []
    },
    'search-singles': {
        'songList': '@song_brief'
    },
    'search-songlists': {
        'lists': '@songList_brief'
    },
    'search-albums': {
        'albumList': '@album_brief'
    },
    'search-artists': {
        'artistList': '@artist_brief'
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
    'rankings': {
        'rankingList': '@ranking_brief'  
    },
    'ranking_brief': {
        'rankingId': '',
        'rankingName': '',
        'rankingCover': ''
    },
    'rankingContent': {
        'name': '',
        'cover': '',
        'description': '',
        'author': [],
        'tracks': [],
        'loadTracks': '@song_brief',
        'songCount': 0
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
    'artistAlbum': {
        'albumList': '@album_brief'
    },
    'artistSongs': {
        'songList': '@song_brief'
    },
    'newAlbum': {
        'albumList': '@album_brief'
    },
    'newSong': {
        'songList': '@song_brief'
    },
    'userFavourites': {
        'songCount': 0,
        'tracks': [],
        'loadTracks': '@song_brief'
    },
    'userPlaylists': {
        'lists': '@songList_brief'
    },
    'dailyRecommends': {
        'tracks': [],
        'loadTracks': '@song_brief',
        'songCount': 0
    }
}

const platformRequest: Record<string, Record<string, any>> = {
    'netease': {
        'function': getNeteaseResult,
        'data': {
            'songInfo': { songId: '[data]' },
            'songList': { listId: '[data]' },
            'album': { albumId: '[data]' },
            'artist': { artistId: '[dataInt]' },
            'rankingContent': { rankingId: '[data]' }
        }
    },
    'qqmusic': {
        'function': getQQmusicResult,
        'data': {
            'songInfo': { songMid: '[data]' },
            'songList': { listId: '[data]' },
            'album': { albumId: '[data]' },
            'artist': { artistId: '[data]' },
            'rankingContent': { rankingId: '[data]' }
        },
        '@processors': {
            'songList': (data: { listId: string }) => { return { listId: parseInt(data.listId) }; },
            'rankingContent': (data: { rankingId: string }) => { return { rankingId: parseInt(data.rankingId) }; }
        }
    },
    'kuwo': {
        'function': getKuwoResult,
        'data': {
            'songInfo': { songId: '[data]' },
            'songList': { listId: '[data]' },
            'album': { albumId: '[data]' },
            'artist': { artistId: '[dataInt]' },
            'rankingContent': { rankingId: '[data]' }
        }
    },
    'kugou': {
        'function': getKugouResult,
        'data': {
            'songInfo': { songId: '[data]' },
            'songList': { listId: '[data]' },
            'album': { albumId: '[data]' },
            'artist': { artistId: '[dataInt]' },
            'rankingContent': { rankingId: '[data]' }
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
function getAuthorObject(authorList: any[], platform: string) {
    const parsedList: any[] = [];
    authorList.forEach((authorInfo: any) => {
        let result;
        if (platform === 'netease') {
            result = {
                id: `artist-netease-${authorInfo.id}`,
                name: authorInfo.name,
                coverUrl: authorInfo.picUrl
            }
        }
        if (platform === 'qqmusic') {
            result = {
                id: `artist-qqmusic-${authorInfo.mid}`,
                name: authorInfo.name,
                coverUrl: './images/library/defaultAvatar.svg'
            }
        }
        if (platform === 'kuwo') {
            result = {
                id: `artist-kuwo-${authorInfo.artistid}`,
                name: authorInfo.artist,
                coverUrl: './images/library/defaultAvatar.svg'
            }
        }
        if (platform === 'kugou') {
            result = {
                id: `artist-kugou-${authorInfo.author_id}`,
                name: authorInfo.author_name,
                coverUrl: authorInfo.avatar
            }
        }
        parsedList.push(result);
    });
    return parsedList;
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
            console.warn(`[Warning] Cannot parse data 'undefined' with key '${param}'`);
            return null;
        }
        object = object[param];
    }
    return object;
}

const callChildParsers = ['song_brief', 'songList_brief', 'album_brief', 'artist_brief', 'ranking_brief'];
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

        let parseResult = parseDataByArray(data, parserList);
        const resultList = [];
        let isResultList = false;
        // console.log(`${platform}/${module} => ${JSON.stringify(parseResult)}`);

        // 数据预处理
        if (parsers['@preprocessors']) {
            if (parsers['@preprocessors'][key]) {
                const preprocess = parsers['@preprocessors'][key];
                parseResult = preprocess(parseResult);
            }
        }

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
        if (parsers['@postprocessors']) {
            if (parsers['@postprocessors'][key]) {
                const postprocess = parsers['@postprocessors'][key];
                result[key] = postprocess(result[key]);
            }
        }
    });

    return result;
}

function parseMusicData(response: AxiosResponse, platform: string, module: string) {
    if (!dataParsers[platform]) {
        console.error(`[ERROR] Unsupported platform ${platform}`);
    }
    // 获取数据体
    const parsers = dataParsers[platform][module];
    const bodyParser = parsers.body;
    const body = parseDataByArray(response, bodyParser);

    // 检查请求结果
    if (body.code !== undefined) {
        if ((body.code !== 200 && platform !== 'qqmusic') || (body.code !== 0 && platform === 'qqmusic')) {
            console.error(`[ERROR] Failed to request ${platform} api (Code ${body.code})`);
            return;
        }
    }
    
    const parsedResponse = parseData(body, platform, module);

    return parsedResponse;
}

export { formatAuthors, getRequestFormat, parseMusicData };
