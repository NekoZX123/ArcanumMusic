import { defineComponent } from "vue";
import { changePage } from "../utilities/pageSwitcher";

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

// 自定义组件

// 歌单卡片
const SonglistCard = defineComponent({
    props: {
        id: String,
        coverUrl: String,
        name: String
    },
    setup(props: { id: string, coverUrl: string, name: string }) {
        return () => (
            <span class="songlistCard medium" id={props.id} onClick={() => changePage('songlist', true, props.id)}>
                <span class="flex column">
                    <img class="songCover" src={props.coverUrl} alt="Playlist cover"/>
                    <span class="cardFooter flex row">
                        <label class="text small">{props.name}</label>
                    </span>
                </span>
                <button class="songlistPlay" id={`${props.id}_play`}>
                    <img src="/images/player/play.svg" alt="Play"/>
                </button>
            </span>
        );
    },
});

// 歌曲卡片
const SongCard = defineComponent({
    props: {
        coverUrl: String,
        name: String,
        authors: String
    },
    setup(props: { coverUrl: string, name: string, authors: string }) {
        return () => (
            <span class="songCard flex row">
                <img class="songCover" src={props.coverUrl}></img>
                <span class="songInfo flex column">
                    <label class="text small bold">{props.name}</label>
                    <label class="text ultraSmall grey">{props.authors}</label>
                </span>
                <button class="songPlay">
                    <img src="/images/player/play.svg" alt="Play"/>
                </button>
            </span>
        );
    }
});

// 歌曲卡片 (单行)
const SongInfoLine = defineComponent({
    props: {
        name: String,
        authors: String,
        coverUrl: String,
        duration: Number
    },
    setup(props: { name: string, authors: string, coverUrl: string, duration: number }) {
        return () => (
            <span class="songLine flex row">
                <button class="songPlay">
                    <img src="/images/player/play.dark.svg"/>
                </button>
                <img class="songCover" src={props.coverUrl}></img>
                <span class="songInfo flex column">
                    <label class="text small bold">{props.name}</label>
                    <label class="text ultraSmall grey">{props.authors}</label>
                </span>
                <span class="text ultraSmall songLength">{timeFormat(props.duration)}</span>
            </span>
        );
    }
});

// 歌手卡片
const ArtistCard = defineComponent({
    props: {
        coverUrl: String,
        name: String
    },
    setup(props: { coverUrl: string, name: string }) {
        return () => (
            <span class="artistCard flex column">
                <img class="artistCover" src={props.coverUrl}></img>
                <label class="text small">{props.name}</label>
            </span>
        );
    }
});

export { SonglistCard, SongCard, SongInfoLine, ArtistCard };
