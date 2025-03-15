import { defineComponent } from "vue";

// 自定义组件

// 歌单卡片
const SonglistCard = defineComponent({
    props: {
        coverUrl: String,
        name: String
    },
    setup(props: { coverUrl: string, name: string }) {
        return () => (
            <span class="songlistCard medium">
                <span class="flex column">
                    <img class="songCover" src={props.coverUrl} alt="Playlist cover"/>
                    <span class="cardFooter flex row">
                        <label class="text small">{props.name}</label>
                    </span>
                </span>
                <button class="songlistPlay" id="_play">
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

export { SonglistCard, SongCard, ArtistCard };
