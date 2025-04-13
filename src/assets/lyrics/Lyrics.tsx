import { defineComponent } from "vue";

const LyricsLine = defineComponent({
    props: {
        content: String,
        subline: String
    },
    setup(props: { content: string, subline: string}) {
        return () => (
            <span class="lyricsBox">
                <ul class="text large bold white">{props.content}</ul>
                <ul class="text medium bold white">{props.subline}</ul>
            </span>
        );
    }
});

export { LyricsLine }
