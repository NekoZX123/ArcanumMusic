import { defineComponent } from "vue";
import { getPlayer } from "../player/player";

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
        isLite: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    setup(props: { time: number, content: string, translation?: string, glowEffect?: boolean, isLite?: boolean }) {
        return () => (
            <span class={`lyricsBox ${props.glowEffect ? 'glow' : ''} ${props.isLite ? 'lite' : ''}`} onClick={() => getPlayer()?.setProgress(props.time)}>
                <ul class={`text ${props.isLite ? 'medium' : 'large bold'}`}>{props.content}</ul>
                <ul class={`text ${props.isLite ? 'small' : 'medium bold'}`}>{props.translation}</ul>
            </span>
        );
    }
});

export { LyricsLine }
