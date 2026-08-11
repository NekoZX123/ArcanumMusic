import { defineComponent, ref, onMounted, watch } from 'vue';

const TextSlideShow = defineComponent({
    props: {
        outerId: String,
        innerId: String,
        content: String,
        className: {
            type: String,
            required: false,
            default: 'text small'
        }
    },
    setup(props: { outerId: string, innerId: string, content: string, className: string }) {
        const outerRef = ref<HTMLElement | null>(null);
        const innerRef = ref<HTMLElement | null>(null);
        const shouldScroll = ref(false);

        const update = () => {
            const o = outerRef.value;
            const i = innerRef.value;
            if (o && i) {
                // 临时元素测量法
                const measureWidth = () => {
                    // 创建一个临时的不可见 label 来测量内容真实宽度
                    const tempLabel = document.createElement('label');
                    tempLabel.className = props.className;
                    tempLabel.style.visibility = 'hidden';
                    tempLabel.style.position = 'absolute';
                    tempLabel.style.whiteSpace = 'nowrap';
                    tempLabel.textContent = props.content;
                    document.body.appendChild(tempLabel);
                    const width = tempLabel.scrollWidth;
                    document.body.removeChild(tempLabel);
                    return width;
                };

                const contentWidth = measureWidth();
                shouldScroll.value = contentWidth > o.clientWidth;
                console.log(props.content, o.clientWidth, contentWidth, shouldScroll.value);
            }
            else shouldScroll.value = false;
        };

        onMounted(() => {
            update();
        });

        watch(() => props.content, update);

        return () => (
            <span class="slideshow" id={props.outerId} ref={outerRef}>
                {shouldScroll.value ? (
                    <marquee id={props.innerId} class={props.className} ref={innerRef}>{props.content}</marquee>
                ) : (
                    <label id={props.innerId} class={props.className} ref={innerRef}>{props.content}</label>
                )}
            </span>
        );
    }
});

export {
    TextSlideShow
}
