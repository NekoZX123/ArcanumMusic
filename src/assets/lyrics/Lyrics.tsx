import { defineComponent } from "vue";
import { getPlayer } from "../player/player";
import { type LyricLineInfo } from "./lyricsParser";

const effectClassList = ['', 'appleMusic', 'lite'];

const LyricsLine = defineComponent({
    props: {
        lyricsObject: {
            type: Object as () => LyricLineInfo,
            required: true
        },
        glowEffect: {
            type: Boolean,
            required: false,
            default: true
        },
        lyricsMode: {
            type: Number,
            required: true,
            default: 0
        }
    },
    setup(props: { lyricsObject: LyricLineInfo, glowEffect?: boolean, lyricsMode: number }) {
        return () => {
            const effectMode = effectClassList[props.lyricsMode];
            const mainLineFontSize = props.lyricsMode === 2 ? 'medium' : 'large';
            const transLineFontSize = props.lyricsMode === 2 ? 'small' : 'medium';
            const lyricsFontWeight = props.lyricsMode === 0 ? 'bold' : '';
            return (
                <span class={`lyricsBox ${props.glowEffect ? 'glow' : ''} ${effectMode}`} onClick={() => getPlayer()?.setProgress(props.lyricsObject.time)}>
                    <ul class={`text ${mainLineFontSize} ${lyricsFontWeight}`}>{props.lyricsObject.content}</ul>
                    <ul class={`text ${transLineFontSize} ${lyricsFontWeight}`}>{props.lyricsObject.translation}</ul>
                </span>
            );
        };
    }
});

export { LyricsLine }
