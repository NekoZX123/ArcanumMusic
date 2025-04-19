// 时间格式化
function timeFormat(timeSeconds: number) {
    let secondNum = timeSeconds % 60;
    if (secondNum < 0) secondNum = 0;
    let minTemp = Math.floor(timeSeconds / 60);
    let minuteNum = minTemp % 60;
    let hourNum = Math.floor(minTemp / 60);

    let second = secondNum < 10 ? `0${secondNum}` : `${secondNum}`;
    let minute = minuteNum < 10 ? `0${minuteNum}` : `${minuteNum}`;
    let hour = hourNum < 10 ? `0${hourNum}` : `${hourNum}`;

    var result = '';
    if (hourNum > 0) {
        result = `${hour}:${minute}:${second}`;
    }
    else {
        result = `${minute}:${second}`;
    }

    return result;
}

// 循环 / 随机播放图片链接常量池
const IMAGES_REPEAT = ['/images/player/repeat.svg', '/images/player/repeat.svg', '/images/player/repeatSingle.svg'];
const IMAGES_SHUFFLE = ['/images/player/shuffle.svg', '/images/player/shuffle.svg'];

class Player {
    // 播放列表信息
    playlist: object;

    // 当前歌曲信息
    name: string;
    authors: string;
    coverUrl: string;

    // 时间信息
    duration: number;
    durationText: string;
    playedTime: number;
    playedTimeText: string;
    progressPercentage: number;

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
            current: '',
            breakIn: [],
            waitList: []
        };

        this.name = '未在播放';
        this.authors = 'undefined';
        this.coverUrl = '/images/player/testAlbum.png';

        this.playedTime = 0;
        this.duration = 114;
        this.durationText = timeFormat(this.duration);
        this.playedTimeText = timeFormat(this.playedTime);
        this.progressPercentage = 0;

        this.volume = 100;
        this.volumeLevel = '/images/player/volume_04.svg';
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
        this.shuffleState = 0;
        this.shuffleStateImage = IMAGES_SHUFFLE[0];

        this.url = 'https://example.com/example.flac';
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

    // 更改音量
    setVolume(value: number) {
        if (value < 0) value = 0;
        if (value > 100) value = 100;

        let level = 0;

        if (value === 0) level = 1;
        else if (value > 0 && value <= 33) level = 2;
        else if (value > 33 && value <= 67) level = 3;
        else level = 4;

        if (this.isMuted) this.isMuted = false;

        this.volume = value;
        this.volumeLevel = `/images/player/volume_0${level}.svg`;

        let volumeBarStyle = document.getElementById('globalVolumeFill');
        if (volumeBarStyle) {
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
            console.error(`[Error] player.ts error: unknown repeat state: ${state}`);
            return;
        }

        this.repeatState = state;
        this.repeatStateImage = IMAGES_REPEAT[state];
    }
    setShuffleState (state: number) {
        // console.log(`[Debug] Shuffle state: ${state}`);
        if (state !== 0 && state !== 1) {
            console.error(`[Error] player.ts error: unknown shuffle state: ${state}`);
            return;
        }

        this.shuffleState = state;
        this.shuffleStateImage = IMAGES_SHUFFLE[state];
    }
}

let player: Player | undefined = undefined;

function createPlayer(volumeBarIds?: string[]) {
    if (player) {
        console.error('[Error] player.ts error: player already initialized, returning existing player');

        return player;
    }

    player = new Player(volumeBarIds);

    return player;
}

function getPlayer() {
    return player;
}

export {
    createPlayer,
    getPlayer
};
