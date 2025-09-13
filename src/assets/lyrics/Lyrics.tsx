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
        }
    },
    setup(props: { time:number, content: string, translation: string}) {
        return () => (
            <span class="lyricsBox" onClick={() => getPlayer()?.setProgress(props.time)}>
                <ul class="text large bold">{props.content}</ul>
                <ul class="text medium bold">{props.translation}</ul>
            </span>
        );
    }
});

export { LyricsLine }
