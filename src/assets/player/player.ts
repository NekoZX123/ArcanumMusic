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

class Player {
    name: string;
    authors: string;
    coverUrl: string;

    duration: number;
    durationText: string;
    playedTime: number;
    playedTimeText: string;
    progressPercentage: number;

    volume: number;
    volumeLevel: string;
    volumeBarIds: string[];

    url: string;

    constructor(volumeBarIds: string[] = []) {
        this.name = 'Arcanum';
        this.authors = 'NekoZX123';
        this.coverUrl = '/images/player/testAlbum.png';

        this.playedTime = 0;
        this.duration = 114;
        this.durationText = timeFormat(this.duration);
        this.playedTimeText = timeFormat(this.playedTime);
        this.progressPercentage = 0;

        this.volume = 100;
        this.volumeLevel = '/images/player/volume_04.svg';
        this.volumeBarIds = volumeBarIds;

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
