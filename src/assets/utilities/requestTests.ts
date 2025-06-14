import { getNeteaseLyrics, getNeteaseSearchResult, getNeteaseSonglink } from '../scripts/netease/neteaseRequest.ts';
import { getKuwoAlbum, getKuwoArtist, getKuwoHotList, getKuwoLyrics, getKuwoNewSong, getKuwoPlaylist, getKuwoRankingContent, getKuwoRankings, getKuwoRecommendArtist, getKuwoRecommendSong, getKuwoSearchResult, getKuwoSongInfo, getKuwoSonglink } from '../scripts/kuwo/kuwoRequest.ts';
import { getKugouLyrics, getKugouSearchResult, getKugouSonglink } from '../scripts/kugou/kugouRequest.ts';
import { getQQmusicSearchResult, getQQmusicSonglink } from '../scripts/qqmusic/qqmusicRequest.ts';

// 测试请求 (网易云音乐)
function testNeteaseRequests() {
    const udebug = '0011731BEB9F7881E24A1451AEBBA905776298E9F29D9803C86E95878966EDF478BFB84EAAF55B4F56910739A630279A046B2C4D313D055AADF15BB4E032C4DF3D18C275CFB4B99B4AFF8B346DB7CF2747CC7AD8B4B1EFADB8BAC9584B31C8AA3BCCA6AB01F9C509BC903B6E1E0E913C6F628CE15808126A9BD92E4228B077A7758DF33FEB52126CBCAF22E06E5C909192BDFAC5FA3BD6B8A63B4DCB9E1DFD2C63BB73EA63278AF12843E0AB950E34D070A0CDDE16E74239F8FEAE6E7596954877E230844E6E864F43F7EAFA65B4661C68D49BE90036BD79E4F44509D2A7CFAC768079E4F2E398EDE80D1B6C68AA3A7CD329B93ABE46063DBB63EBB2BAB42FB47455FC2C362043DE6DEE1250DF68811369C534E95B04B9D5E6FA6831EFCA8312863680CAF1292B29D66840D7EE056482EFF7DA2CC854AB57642303C2CE07EC49A166DC6712A02F578CBA8C904FEBAAAA405815D2BBF71069876BA481C1E30FC7B535C06B684BE4BE0F2D372AA462285FF4';
    getNeteaseSonglink('2064724623', 'jymaster', { 'MUSIC_U': udebug })
        .then((response) =>{
            console.log(response.data);
        });
    getNeteaseSearchResult('Memories of kindness', { 'MUSIC_U': udebug })
        .then((response) => {
            console.log(response.data);
        });
    getNeteaseLyrics('2064724623', { 'MUSIC_U': udebug })
        .then((response) => {
            console.log(response.data);
        });
}
// 测试请求 (酷我音乐)
function testKuwoRequests(id: number = 1) {
    switch (id) {
        case 1: {
            getKuwoSonglink('287928307')
                .then((response) => console.log(response.data));
            break;
        }
        case 2: {
            getKuwoSearchResult('Blue Canvas')
                .then((response) => console.log(response.data));
            break;
        }
        case 3: {
            getKuwoLyrics('287928307')
                .then((response) => console.log(response.data));
            break;
        }
        case 4: {
            getKuwoSongInfo('287928307')
                .then((response) => console.log(response.data));
            break;
        }
        case 5: {
            getKuwoPlaylist('3589494793')
                .then((response) => console.log(response.data));
            break;
        }
        case 6: {
            getKuwoAlbum('43678014')
                .then((response) => console.log(response.data));
            break;
        }
        case 7: {
            getKuwoArtist('7620042')
                .then((response) => console.log(response.data));
            break;
        }
        case 8: {
            getKuwoHotList()
                .then((response) => console.log(response.data));
            break;
        }
        case 9: {
            getKuwoRecommendSong()
                .then((response) => console.log(response.data));
            break;
        }
        case 10: {
            getKuwoRecommendArtist()
                .then((response) => console.log(response.data));
            break;
        }
        case 11: {
            getKuwoRankings()
                .then((response) => console.log(response.data));
            break;
        }
        case 12: {
            getKuwoRankingContent('93')
                .then((response) => console.log(response.data));
            break;
        }
        case 13: {
            getKuwoNewSong()
                .then((response) => console.log(response.data));
            break;
        }
        default: {
            console.error(`[Error] Unknown test code: ${id}`);
        }
    }
}
// 测试请求 (酷狗音乐)
function testKugouRequests() {
    const kugouUser = 'KugooID=2349253590&KugooPwd=A3C621A58189028EC50C7EF8C0CEA8DC&NickName=%u0032%u0033%u0034%u0039%u0032%u0035%u0033%u0035%u0039%u0030&Pic=http://imge.kugou.com/kugouicon/165/20100101/20100101192931478054.jpg&RegState=1&RegFrom=&t=2904e464073deff6959ecedb5aeb5cd24ded493e257a23b43b4ab87552ab9d6f&t_ts=1749455205&t_key=&a_id=1014&ct=1749455205&UserName=%u0032%u0033%u0034%u0039%u0032%u0035%u0033%u0035%u0039%u0030';
    getKugouSonglink('9xlu7513', { KuGoo: kugouUser })
        .then((response) => {
            console.log(response.data);
        });
    getKugouSearchResult('Shooting Athletes')
        .then((response) => {
            console.log(response.data);
        });
    getKugouLyrics('8y83yg8c', { KuGoo: kugouUser })
        .then((response) => {
            console.log(response.data);
        });
}
// 测试请求 (QQ音乐)
function testQQMusicRequests() {
    const qqmusicToken = 'Q_H_L_63k3NmaCsZ8S43k9btLsxHp8yeiwhsPQi3SHxOdLAMiE0RhA4NwnW8gkEMLbpv1t97Az0otgrJLen3qICpntwf_FoEro';
    getQQmusicSonglink('003UlmlI0hkj8t', { uin: 2168979907, qm_keyst: qqmusicToken })
        .then((response) => {
            console.log(response.data);
        });
    getQQmusicSearchResult('Memories of kindness', { uin: 2168979907, qm_keyst: qqmusicToken })
        .then((response) => {
            console.log(response.data);
        });
}

export { testNeteaseRequests, testKuwoRequests, testKugouRequests, testQQMusicRequests };
