import { defineComponent } from "vue";
import { getPlayer } from "../player/player";

const effectClassList = ['', 'appleMusic', 'lite'];

const LyricsLine = defineComponent({
    props: {
        time: Number,
        content: String,
        translation: {
            type: String,
            required: false,
            default: ''
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
    setup(props: { time: number, content: string, translation?: string, glowEffect?: boolean, lyricsMode: number }) {
        const effectMode = effectClassList[props.lyricsMode];
        const mainLineFontSize = props.lyricsMode === 2 ? 'medium' : 'large';
        const transLineFontSize = props.lyricsMode === 2 ? 'small' : 'medium';
        const lyricsFontWeight = props.lyricsMode === 0 ? 'bold' : '';
        return () => (
            <span class={`lyricsBox ${props.glowEffect ? 'glow' : ''} ${effectMode}`} onClick={() => getPlayer()?.setProgress(props.time)}>
                <ul class={`text ${mainLineFontSize} ${lyricsFontWeight}`}>{props.content}</ul>
                <ul class={`text ${transLineFontSize} ${lyricsFontWeight}`}>{props.translation}</ul>
            </span>
        );
    }
});

export { LyricsLine }
