import { defineComponent, computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { getPlayer } from "../player/player";
import { type LyricLineInfo } from "./lyricsParser";

const effectClassList = ['', 'appleMusic', 'lite'];

// ---- 逐字歌词 (YRC) ----
// 单个字符的计时信息 (毫秒)
type YrcCharInfo = {
    char: string,
    start: number,
    duration: number
};
// 解析后的一行 YRC 数据
type YrcLineData = {
    lineStart: number,
    lineDuration: number,
    chars: YrcCharInfo[]
};
/**
 * 解析一行 YRC 逐字歌词
 * 格式: [lineStart,lineDuration](start,duration,fade)字符(start,duration,fade)字符...
 */
function parseYrc(yrcLine: string): YrcLineData | null {
    const lineMatch = yrcLine.match(/^\[(\d+),(\d+)\](.*)$/);
    if (!lineMatch) return null;

    const lineStart = parseInt(lineMatch[1], 10);
    const lineDuration = parseInt(lineMatch[2], 10);
    const body = lineMatch[3].replace(/[\r\n]/g, '');

    const chars: YrcCharInfo[] = [];
    // 匹配 (start,duration[,fade]) 后紧跟的字符 (可能为多字符/空格)
    const tokenReg = /\((\d+),(\d+)(?:,\d+)?\)([^()]*)/g;
    let match: RegExpExecArray | null;
    while ((match = tokenReg.exec(body)) !== null) {
        const start = parseInt(match[1], 10);
        const duration = parseInt(match[2], 10);
        const textChars = Array.from(match[3]);
        const len = textChars.length;
        if (len === 0) continue;
        // 一个时间戳可能对应多个字符时均匀分配时长
        for (let i = 0; i < len; i++) {
            chars.push({
                char: textChars[i],
                start: start + Math.round(duration * i / len),
                duration: Math.round(duration / len)
            });
        }
    }

    if (chars.length === 0) return null;
    return { lineStart, lineDuration, chars };
}

// ---- 逐字上抬参数 ----
// 满上抬量 (px), 与之前的 -6px 一致
const CHAR_RISE_PX = 6;
// 后方字符上抬随距离衰减的字符数 (超过此距离后完全归零, 保持平齐)
const RISE_DECAY_LEN = 4;

// 计算单个字符的上抬量: rel<=0 (已唱/当前字符) 满上抬, rel>0 (后方字符) 以 easeOut 二次曲线平滑衰减至 0。
// 相比旧的 1/(1+ratio) 双曲线 (近焦点骤升到 75% + 长尾永不归零), 新曲线让上抬随扫过逐渐累积、
// 到焦点处恰满上抬, 配合 CSS transition 形成连贯柔顺的"波浪式"推进。
function liftOffset(index: number, pos: number): number {
    const rel = index - pos;
    if (rel <= 0) return -CHAR_RISE_PX;
    const t = rel / RISE_DECAY_LEN;
    if (t >= 1) return 0;
    const eased = 1 - t;
    return -CHAR_RISE_PX * eased * eased;
}

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
        // 解析 yrc (随 props 变化而重新计算)
        const yrcData = computed(() =>
            props.lyricsObject.yrc ? parseYrc(props.lyricsObject.yrc) : null
        );
        // console.log(Object.assign({}, props.lyricsObject));

        // 已上抬的字符数; -1 表示未启用 (非焦点行或无 yrc)
        const activeCharCount = ref(-1);
        // 遮罩层从左向右的滑动进度 (0 ~ 1, 连续)
        const sweepProgress = ref(0);
        // 根元素 (用于判断是否为焦点行)
        const rootElement = ref<HTMLElement | null>(null);

        let animationId = 0;
        let playerElement: HTMLAudioElement | null = null;

        /**
         * 根据当前播放时间计算高亮状态
         * 字符高亮时间 = 字符时间戳 - 当前行开始时间戳 (与行开始做差)
         * 返回连续字符位置 pos; count = floor(pos) 驱动逐字上抬, progress = pos/总字符数 驱动遮罩滑动
         */
        function computeHighlight(currentTime: number): { count: number, progress: number } {
            const data = yrcData.value;
            if (!data) return { count: -1, progress: 0 };
            const elapsedMs = (currentTime - props.lyricsObject.time) * 1000;
            let pos = 0;
            for (let i = 0; i < data.chars.length; i++) {
                const relStart = data.chars[i].start - data.lineStart;
                const relEnd = relStart + data.chars[i].duration;
                if (elapsedMs >= relEnd) { pos = i + 1; }
                else if (elapsedMs >= relStart) {
                    const dur = Math.max(data.chars[i].duration, 1); // 防除零
                    pos = i + (elapsedMs - relStart) / dur;
                    break;
                }
                else break;
            }
            const count = Math.floor(pos);
            const progress = data.chars.length ? Math.min(1, pos / data.chars.length) : 0;
            return { count, progress };
        }

        // 逐帧刷新高亮状态
        const tick = () => {
            const data = yrcData.value;
            if (data) {
                const isFocused = rootElement.value?.classList.contains('focused') === true;
                if (isFocused && playerElement) {
                    const { count, progress } = computeHighlight(playerElement.currentTime);
                    if (count !== activeCharCount.value) activeCharCount.value = count;
                    if (progress !== sweepProgress.value) sweepProgress.value = progress;
                }
                else if (activeCharCount.value >= 0) {
                    activeCharCount.value = -1; // 非焦点行恢复普通显示
                    sweepProgress.value = 0;
                }
            }
            animationId = requestAnimationFrame(tick);
        };

        watch(yrcData, (data) => {
            activeCharCount.value = -1;
            if (data && !animationId) {
                animationId = requestAnimationFrame(tick);
            }
            else if (!data && animationId) {
                cancelAnimationFrame(animationId);
                animationId = 0;
            }
        }, { immediate: true });

        onMounted(() => {
            playerElement = document.getElementById('arcanummusic-playcontrol') as HTMLAudioElement;
        });
        onBeforeUnmount(() => {
            if (animationId) cancelAnimationFrame(animationId);
        });

        return () => {
            const effectMode = effectClassList[props.lyricsMode];
            const mainLineFontSize = props.lyricsMode === 2 ? 'medium' : 'large';
            const transLineFontSize = props.lyricsMode === 2 ? 'small' : 'medium';
            const lyricsFontWeight = props.lyricsMode === 0 ? 'bold' : '';

            // 有 yrc 时渲染逐字字符 + 发光遮罩层, 否则渲染普通文本
            const data = yrcData.value;
            const activeCount = activeCharCount.value;
            const focused = activeCount >= 0;
            // 连续字符位置 (驱动遮罩滑动与后方衰减上抬)
            const charPos = focused ? sweepProgress.value * (data?.chars.length ?? 0) : 0;
            // 单字符上抬样式: 焦点行才生效 (已唱/当前字符满上抬, 后方字符随距离衰减)
            const charStyle = (index: number) => focused
                ? { transform: `translateY(${liftOffset(index, charPos).toFixed(2)}px)` }
                : {};
            // 遮罩层逐字符裁切: 依相对位置 rel = index - charPos
            //   rel > 0  未唱到      → 完全隐藏 (inset 左缘全量裁切)
            //   rel <= -1 已唱完     → 完全露出 (不裁切)
            //   -1 < rel <= 0 当前字符 → 按演唱进度裁出左侧 (-rel) 比例
            // 逐字符而非整行 inset 裁切, 使长歌词自动换行后各行高亮独立、互不串行
            const sweepCharStyle = (index: number) => {
                const rel = index - charPos;
                let clipPath: string;
                if (rel > 0) clipPath = 'inset(0 0 0 100%)';
                else if (rel <= -1) clipPath = 'none';
                else clipPath = `inset(0 ${((1 + rel) * 100).toFixed(2)}% 0 0)`;
                return { ...charStyle(index), clipPath };
            };
            const mainContent = data
                ? (
                    <ul class={`text ${mainLineFontSize} ${lyricsFontWeight} yrc`}>
                        <span class="yrcText">
                            {data.chars.map((c, index) => (
                                <span class="yrcChar" style={charStyle(index)}>{c.char}</span>
                            ))}
                            {focused && (
                                <span class="yrcSweep">
                                    {data.chars.map((c, index) => (
                                        <span class="yrcChar" style={sweepCharStyle(index)}>{c.char}</span>
                                    ))}
                                </span>
                            )}
                        </span>
                    </ul>
                )
                : (
                    <ul class={`text ${mainLineFontSize} ${lyricsFontWeight}`}>{props.lyricsObject.content}</ul>
                );

            return (
                <span ref={rootElement} class={`lyricsBox ${props.glowEffect ? 'glow' : ''} ${effectMode}`} onClick={() => getPlayer()?.setProgress(props.lyricsObject.time)}>
                    {mainContent}
                    <ul class={`text ${transLineFontSize} ${lyricsFontWeight}`}>{props.lyricsObject.translation}</ul>
                </span>
            );
        };
    }
});

export { LyricsLine }
