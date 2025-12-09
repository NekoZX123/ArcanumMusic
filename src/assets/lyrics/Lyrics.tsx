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
        }
    },
    setup(props: { time: number, content: string, translation: string, glowEffect: boolean }) {
        return () => (
            <span class={`lyricsBox ${props.glowEffect ? 'glow' : ''}`} onClick={() => getPlayer()?.setProgress(props.time)}>
                <ul class="text large bold">{props.content}</ul>
                <ul class="text medium bold">{props.translation}</ul>
            </span>
        );
    }
});

export { LyricsLine }
