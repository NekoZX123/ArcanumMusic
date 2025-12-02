import { reactive } from "vue";
import { showNotify } from "../notifications/Notification.ts";
import { getListContent, getSongInfo, getSongLink } from "./songUtils.ts";

// 时间格式化
function timeFormat(timeSeconds: number) {
    let secondNum = Math.round(timeSeconds % 60);
    if (secondNum < 0) secondNum = 0;
    let minTemp = Math.floor(timeSeconds / 60);
    let minuteNum = minTemp % 60;
    let hourNum = Math.floor(minTemp / 60);

    let second = secondNum < 10 ? `0${secondNum}` : `${secondNum}`;
    let minute = minuteNum < 10 ? `0${minuteNum}` : `${minuteNum}`;
    let hour = hourNum < 10 ? `0${hourNum}` : `${hourNum}`;

    let result: string;
    if (hourNum > 0) {
        result = `${hour}:${minute}:${second}`;
    }
    else {
        result = `${minute}:${second}`;
    }

    return result;
}

const neteaseCdnPostfix = 'music.126.net';

// 循环 / 随机播放图片链接常量池
const IMAGES_REPEAT = ['./images/player/repeat.svg', './images/player/repeat.on.svg', './images/player/repeatSingle.svg'];
const IMAGES_SHUFFLE = ['./images/player/shuffle.svg', './images/player/shuffle.on.svg'];

class Player {
    // 播放列表信息
    playlist: {
            current: any,
            breakIn: any[],
            waitList: any[],
            history: any[]
        };

    // 当前歌曲信息
    name: string;
    authors: string;
    private _coverUrl: string;
    get coverUrl(): string {
        return this._coverUrl;
    }
    set coverUrl(value: string) {
        if (this._coverUrl !== value) {
            this._coverUrl = value;
            // 封面链接改变事件
            const event = new CustomEvent('cover-background-reload', { detail: value });
            window.dispatchEvent(event);
        }
    }

    // 时间信息
    duration: number;
    durationText: string;
    playedTime: number;
    playedTimeText: string;
    progressPercentage: number;
    playStateImage: string;
    isPlaying: boolean;

    // 音量信息
    volume: number;
    volumeLevel: string;
    volumeBarIds: string[];
    isMuted: boolean;
    latestVolume: number;

    // 循环 / 随机信息
    // 循环播放: 0 => 不循环; 1 => 列表循环; 2 => 单曲循环
    repeatState: number;
    repeatStateImage: string;
    // 随机播放: 0 => 不随机; 1 => 随机;
    shuffleState: number;
    shuffleStateImage: string;

    // 播放链接
    url: string;

    constructor(volumeBarIds: string[] = []) {
        this.playlist = {
            current: {
                'name': '未在播放',
                'authors': '',
                'coverUrl': './images/player/testAlbum.png'
            },
            breakIn: [],
            waitList: [],
            history: []
        };

        this.name = '未在播放';
        this.authors = '';
        this._coverUrl = './images/player/testAlbum.png';

        this.playedTime = 0;
        this.duration = 1;
        this.durationText = '';
        this.playedTimeText = '';
        this.progressPercentage = 0;
        this.playStateImage = './images/player/play.dark.svg';
        this.syncPlayStateImage();
        this.isPlaying = false;

        this.volume = 100;
        this.volumeLevel = './images/player/volume_04.svg';
        this.volumeBarIds = volumeBarIds;
        this.isMuted = false;
        this.latestVolume = 100;

        let volumeBarStyle = document.createElement('style');
        volumeBarStyle.id = 'globalVolumeFill';
        document.head.appendChild(volumeBarStyle);
        let volumeFill = '';
        volumeBarIds.forEach(id => {
            volumeFill += `
            #${id}::-webkit-slider-runnable-track {
                --fill-percentage: ${this.volume}%;
            }
            `;
        });
        volumeBarStyle.innerHTML = volumeFill;

        this.repeatState = 0;
        this.repeatStateImage = IMAGES_REPEAT[0];
        this.syncRepeatStateImage();
        this.shuffleState = 0;
        this.shuffleStateImage = IMAGES_SHUFFLE[0];
        this.syncShuffleStateImage();

        this.url = '';
    }

    // 更新歌曲长度
    updateDuration(time: number) {
        this.duration = time;
        this.durationText = timeFormat(time);
    }
    // 更新播放进度
    updateProgress(time: number) {
        this.playedTime = time;
        this.playedTimeText = timeFormat(time);

        this.progressPercentage = time / this.duration * 100;
    }
    // 设置播放进度
    setProgress(time: number, check: boolean = true) {
        const playerElem = document.getElementById('arcanummusic-playcontrol') as HTMLAudioElement;
        if (!playerElem) {
            console.error('[Error] Player element not found');
            return;
        }
        console.log(`[Debug] Time adjusted to ${time}`);
        playerElem.currentTime = time;

        if (check) {
            this.checkNextSong();
        }
    }

    // 更改音量
    setVolume(value: number) {
        const playerElem = document.getElementById('arcanummusic-playcontrol') as HTMLAudioElement;
        if (!playerElem) {
            console.error('[Error] Player element not found');
            return;
        }

        if (value < 0) value = 0;
        if (value > 100) value = 100;

        let level: number;

        if (value === 0) level = 1;
        else if (value > 0 && value <= 33) level = 2;
        else if (value > 33 && value <= 67) level = 3;
        else level = 4;

        if (this.isMuted) this.isMuted = false;

        this.volume = value;
        this.volumeLevel = `./images/player/volume_0${level}.svg`;
        playerElem.volume = value / 100;

        let volumeBarStyle = document.getElementById('globalVolumeFill');
        if (!volumeBarStyle) {
            volumeBarStyle = document.createElement('style');
            document.body.appendChild(volumeBarStyle);
        }
        let fillStyle = ``;
        this.volumeBarIds.forEach(id => {
            fillStyle += `
            #${id}::-webkit-slider-runnable-track {
                --fill-percentage: ${this.volume}%;
            }
            `;

            let bar = document.getElementById(id) as HTMLInputElement;
            if (bar) bar.value = String(this.volume);
        });

        volumeBarStyle.innerHTML = fillStyle;
    }
    // 切换静音
    toggleMute() {
        if (this.isMuted) {
            this.setVolume(this.latestVolume);
        }
        else {
            this.latestVolume = this.volume;
            this.setVolume(0);
            this.isMuted = true;
        }
    }

    // 切换循环 / 随机状态
    toggleRepeat() {
        let state = this.repeatState + 1
        if (state > 2) state = 0;

        if (this.shuffleState === 1) {
            this.setShuffleState(0);
        }

        this.setRepeatState(state);
    }
    toggleShuffle() {
        let state = this.shuffleState === 1 ? 0 : 1;

        if (this.repeatState) {
            this.setRepeatState(0);
        }

        this.setShuffleState(state);
    }
    setRepeatState(state: number) {
        // console.log(`[Debug] Repeat state: ${state}`);
        if (state < 0 || state > 2) {
            console.error(`[ArcanumMusic - player] Error: unknown repeat state: ${state}`);
            return;
        }

        this.repeatState = state;
        this.repeatStateImage = IMAGES_REPEAT[state];
        this.syncRepeatStateImage();
    }
    setShuffleState (state: number) {
        // console.log(`[Debug] Shuffle state: ${state}`);
        if (state !== 0 && state !== 1) {
            console.error(`[ArcanumMusic - player] Error: unknown shuffle state: ${state}`);
            return;
        }

        this.shuffleState = state;
        this.shuffleStateImage = IMAGES_SHUFFLE[state];
        this.syncShuffleStateImage();
    }

    /**
     * 切换播放 / 暂停
     */
    togglePlayPause() {
        const playerElem = document.getElementById('arcanummusic-playcontrol') as HTMLAudioElement;
        if (!playerElem) {
            console.error('[Error] Player element not found');
            return;
        }

        this.playStateImage = playerElem.paused ? './images/player/pause.dark.svg' : './images/player/play.dark.svg';
        this.syncPlayStateImage();
        if (playerElem.paused && this.url !== '') {
            playerElem.play();
            this.isPlaying = true;
        }
        else {
            playerElem.pause();
            this.isPlaying = false;
        }
    }

    /**
     * 播放指定歌曲
     * @param songInfo 歌曲信息
     * @param addToHistory
     */
    playAudio(songInfo: any, addToHistory: boolean = true) {
        console.log(`[Debug] Playing: ${JSON.stringify(songInfo)}`);
        songInfo = Object.assign({}, songInfo);
        songInfo.id = songInfo.id.replace('new_', '').replace('playlist_', '')
            .replace('cutin_', '').replace('current_', '');

        const current = this.playlist.current;
        if (Object.keys(current).length !== 0 && addToHistory) this.playlist.history.unshift(current);

        this.playlist.current = songInfo;

        getSongLink(songInfo.id)
        .then((infoObject) => {
            const playInfo = {
                ...songInfo,
                ...Object.assign({}, infoObject)
            };
            console.log(`[Debug]>>> Playing: ${JSON.stringify(playInfo)}`);

            // 设置歌曲信息
            this.name = playInfo.name;
            this.authors = playInfo.authors;
            this.coverUrl = playInfo.coverUrl;
            this.duration = playInfo.duration;
            this.updateDuration(playInfo.duration);
            this.updateProgress(0);
            this.setProgress(0, false);
            // 设置播放链接
            if (!playInfo.url) {
                showNotify('songUrlNullError', 'critical', `无法播放 ${this.name}`, '获取播放链接失败');
                if (this.playlist.breakIn.length === 0 && this.playlist.waitList.length === 0) {
                    this.togglePlayPause();
                    this.playStateImage = './images/player/play.dark.svg';
                    return;
                }
                this.nextSong();
                return;
            }
            if (playInfo.url.includes(neteaseCdnPostfix)) {
                // const audioChunks: BlobPart[] = [];
                // const ws =  new WebSocket('ws://127.0.0.1:3001');

                // ws.onmessage = (event) => {
                //     audioChunks.push(event.data);
                // };
                // ws.onclose = (_) => {
                //     const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
                //     const audioUrl = URL.createObjectURL(audioBlob);
                //     console.log(`[Debug] Audio blob URL: ${audioUrl}`);
                //     this.url = audioUrl;
                // };

                // ws.onopen = () => {
                //     ws.send(playInfo.url);
                // };
                const idParts = playInfo.id.split('-');
                const musicId = idParts[2];
                const fallbackUrl = `https://music.163.com/song/media/outer/url?id=${musicId}.mp3`;
                console.log(`[Debug] Play URL: ${fallbackUrl}`);
                this.url = fallbackUrl;
            }
            else {
                this.url = playInfo.url;
            }

            this.playStateImage = './images/player/pause.dark.svg';
            this.syncPlayStateImage();
            this.isPlaying = true;

            // 更新歌词
            const lyricsEvent = new CustomEvent('update-lyrics');
            window.dispatchEvent(lyricsEvent);

            // 更新动态背景
            const backgroundEvent = new CustomEvent('update-background');
            window.dispatchEvent(backgroundEvent);
        });
    }
    /**
     * 立即播放指定音频
     * @param songInfo 歌曲信息
     */
    playNow(songInfo: any) {
        this.playAudio(songInfo);
    }
    /**
     * 检查播放状态并切换下一首
     */
    checkNextSong() {
        // console.log(this.playedTime, this.duration);
        if (this.playedTime >= this.duration) {
            console.log(`[Debug] Song playing finished, changing to next song...`);
            this.nextSong();
        }
    }

    /**
     * 播放上一首
     */
    previousSong() {
        // 历史记录为空
        if (this.playlist.history.length === 0 && this.repeatState === 0) {
            console.warn(`[Warning] No songs in play history, ignoring...`);
            return;
        }
        // 历史记录为空 (列表循环开启)
        if (this.playlist.history.length <= 1 && this.repeatState === 1) {
            console.log(`[Debug] List repeat enabled`);

            const current = Object.assign({}, this.playlist.current);
            this.playlist.breakIn.unshift(current);

            let lastSong;
            if (this.playlist.waitList.length === 0) {
                const breakInLength = this.playlist.breakIn.length;
                if (breakInLength === 0) {
                    console.log(`[Debug] No songs in list, replaying current song...`);
                    this.updateProgress(0);
                    this.setProgress(0);
                    return;
                }
                lastSong = this.playlist.breakIn[breakInLength - 1];
                this.playlist.breakIn.pop();
            }
            else {
                const index = this.playlist.waitList.length - 1;
                lastSong = this.playlist.waitList[index];
                this.playlist.waitList.pop();
            }
            this.playAudio(lastSong, false);
            return;
        }
        // 单曲循环
        if (this.repeatState === 2) {
            console.log(`[Debug] Single repeat enabled`);
            this.updateProgress(0);
            this.setProgress(0);
            return;
        }
        // 播放上一首
        const prevSong = Object.assign({}, this.playlist.history[0]);
        const current = Object.assign({}, this.playlist.current);
        this.playlist.breakIn.unshift(current); // 将当前播放作为下一首
        this.playlist.history.splice(0, 1);
        this.playAudio(prevSong, false);
    }
    /**
     * 播放下一首
     */
    nextSong() {
        // 末端曲目播放完成
        if (this.playlist.breakIn.length === 0 && this.playlist.waitList.length === 0 
            && this.repeatState === 0 && this.shuffleState === 0) {
            if (this.isPlaying) {
                this.togglePlayPause();
            }
            console.warn(`[Warning] No songs to play in the list, ignoring...`);
            return;
        }
        
        // 单曲循环
        if (this.repeatState === 2) {
            console.log(`[Debug] Single repeat enabled`);
            this.updateProgress(0);
            this.setProgress(0);
            return;
        }
        // 随机播放
        if (this.shuffleState === 1) {
            console.log(`[Debug] Shuffle playing enabled`);
            const listSize = this.playlist.breakIn.length + this.playlist.waitList.length;
            const songIndex = Math.floor(Math.random() * listSize);
            let songInfo;
            if (listSize === 0) { // 列表为空
                console.log(`[Debug] No songs to play in the list, ignoring...`);
                this.playAudio(this.playlist.current, false);
                return;
            }
            if (songIndex >= this.playlist.breakIn.length) { // 从非插队播放中选取
                const waitListIndex = songIndex - this.playlist.breakIn.length;
                songInfo = this.playlist.waitList[waitListIndex];
            }
            else { // 从插队播放中选取
                songInfo = this.playlist.breakIn[songIndex];
            }

            this.playAudio(songInfo, false);
            return;
        }
        // 继续播放
        if (this.playlist.breakIn.length !== 0) { // 有插队播放
            const currentSong = Object.assign({}, this.playlist.current);
            // 列表循环时将当前歌曲加至队列末
            if (this.repeatState === 1) this.playlist.waitList.push(currentSong);

            const nextSong = Object.assign({}, this.playlist.breakIn[0]);
            this.playlist.breakIn.splice(0, 1);
            this.playAudio(nextSong);
        }
        else { // 无插队播放
            const currentSong = Object.assign({}, this.playlist.current);
            // 列表循环时将当前歌曲加至队列末
            if (this.repeatState === 1) this.playlist.waitList.push(currentSong);

            const nextSong = Object.assign({}, this.playlist.waitList[0]);
            this.playlist.waitList.splice(0, 1);
            this.playAudio(nextSong);
        }
    }

    /**
     * 添加音频到播放列表
     * @param songInfo 歌曲信息
     * @param isBreakIn 是否插队播放
     */
    playlistAdd(songInfo: any, isBreakIn: boolean = true) {
        // 当前无播放时直接播放
        if (this.playlist.breakIn.length === 0 && this.playlist.waitList.length === 0 
            && Object.keys(this.playlist.current).length === 0) {
            this.playAudio(songInfo);
            return;
        }
        if (isBreakIn) {
            this.playlist.breakIn.push(songInfo);
        }
        else {
            this.playlist.waitList.push(songInfo);
        }
    }

    /**
     * 从播放列表删除
     * @param targetId 
     */
    playlistRemove(targetId: any) {
        console.log(`[Debug] Remove from playlist: targetId = ${targetId}`);
        // 目标为当前歌曲 - 切换下一首
        if (targetId.includes('current_')) {
            this.nextSong();
            return;
        }

        const pureId = targetId.replace('new_', '').replace('playlist_', '')
            .replace('cutin_', '').replace('current_', '');
        
        // 插队歌曲内匹配
        if (targetId.includes('cutin_')) {
            for (let i = 0; i < this.playlist.breakIn.length; i++) {
                const songInfo = this.playlist.breakIn[i];
                if (songInfo.id === pureId) {
                    this.playlist.breakIn.splice(i, 1);
                    break;
                }
            }
            return;
        }

        // 普通队列内匹配
        this.playlist.waitList.forEach((songInfo, index) => {
            if (songInfo.id === pureId) {
                this.playlist.waitList.splice(index, 1);
            }
        });
    }

    /**
     * 播放歌单 / 专辑
     * @param list 歌曲信息列表 / ID 列表
     * @param hasDetail 列表元素是否含详细信息
     */
    async playByList(list: any[], hasDetail: boolean = false) {
        // 清除当前列表
        this.playlist.current = {};
        this.playlist.breakIn = [];
        this.playlist.waitList = [];

        // 播放传入的列表
        let detailFlag = hasDetail;
        detailFlag = !(typeof list[0] !== 'object');

        if (detailFlag) {
            list.forEach((songInfo) => {
                this.playlistAdd(Object.assign({}, songInfo), false);
            });
        }
        else {
            let requestCount = list.length;
            if (requestCount > 10) requestCount = 10;

            for (let i = 0; i < requestCount; i++) {
                const songInfo: any = await getSongInfo(list[i]);
                const infoObject = {
                    id: list[i],
                    name: songInfo.songName,
                    coverUrl: songInfo.songCover,
                    authors: songInfo.songAuthors,
                    duration: songInfo.songDuration
                };
                this.playlistAdd(infoObject, false);
            }
        }
    }
    /**
     * 根据 ID 播放歌单 / 专辑
     * @param listId 歌单 / 专辑 ID
     */
    playListId(listId: string) {
        getListContent(listId)
        .then((listInfo: any) => {
            const idParts = listId.split('-');
            const platform = idParts[1];

            const tracks = listInfo.tracks;
            const parsedTracks: any[] = [];
            const hasDetail = !(platform === 'netease');
            tracks.forEach((trackInfo: any) => {
                if (typeof trackInfo === 'object') {
                    trackInfo.id = `music-${platform}-${trackInfo.id}`;
                    parsedTracks.push(trackInfo);
                }
                else {
                    parsedTracks.push(`music-${platform}-${trackInfo}`);
                }
            });
            console.log(parsedTracks);

            this.playByList(parsedTracks, hasDetail);
        });
    }

    syncPlayStateImage() {
        this.updateStoredVariable('playState', this.playStateImage);
    }
    syncRepeatStateImage() {
        this.updateStoredVariable('repeatState', this.repeatStateImage);
    }
    syncShuffleStateImage() {
        this.updateStoredVariable('shuffleState', this.shuffleStateImage);
    }
    updateStoredVariable(key: string, content: string) {
        window.localStorage.setItem(key, content);
    }
}

let player: Player | undefined = undefined;
let playerReactive: any = undefined;

/**
 * 创建播放器控制器
 * @param volumeBarIds 关联的 <input/> 式音量调节框
 * @returns Player - 创建的播放器控制器
 */
function createPlayer(volumeBarIds?: string[]) {
    if (player) {
        console.warn('[ArcanumMusic - player] Warning: player already initialized, returning existing player');

        return playerReactive;
    }

    player = new Player(volumeBarIds);
    playerReactive = reactive(player);

    return playerReactive;
}

/**
 * 获取播放器控制器
 * @returns Player - 现有的播放器控制器
 */
function getPlayer(): Player | undefined {
    return playerReactive;
}

export {
    createPlayer,
    getPlayer
};
