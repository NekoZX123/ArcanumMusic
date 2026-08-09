const metaDataMarks = ['ti', 'ar', 'al', 'au', 'by', 'offset', 'length', 're', 've', 'kana'];

type LyricLineInfo = {
    time: number,
    content: string,
    translation: string
    yrc?: string
};
type LyricData = {
    lyrics: LyricLineInfo[],
    metaData: any
}

function formatLyricTime(time: string) {
    const [ hms, ms ] = time.split('.');
    const integerTime = hms.split(':');
    let resultTime = 0;
    if (integerTime.length === 2) {
        const minute = parseInt(integerTime[0]);
        const second = parseInt(integerTime[1]);
        resultTime += minute * 60 + second;
    }
    else {
        const hour = parseInt(integerTime[0]);
        const minute = parseInt(integerTime[1]);
        const second = parseInt(integerTime[2]);
        resultTime += hour * 3600 + minute * 60 + second;
    }
    resultTime += parseInt(ms) * Math.pow(10, -ms?.length);

    return resultTime;
}

const YRC_MATCH_DIFF = 600; // 逐字歌词匹配时间差 (ms)

type LyricsInfo = { lyrics: string[], translation: string[], yrc?: string };
/**
 * 格式化网易云音乐/QQ音乐/酷我音乐歌词
 * @param lyricsInfo 歌词信息
 * @returns 格式化过的歌词信息
 */
function parseLyricsCommon(lyricsInfo: LyricsInfo) {
    const parsedLyrics: LyricData = {
        lyrics: [],
        metaData: {}
    };

    // 去除空字符串

    // 无歌词时返回空数据
    if (!lyricsInfo.lyrics) return parsedLyrics;
    // 翻译存在标记
    const isTranslationExist = lyricsInfo.translation ? true : false;

    for (let i = 0; i < lyricsInfo.lyrics.length; i++) {
        if (!lyricsInfo.lyrics[i]) lyricsInfo.lyrics.splice(i, 1);
    }
    if (isTranslationExist) {
        for (let i = 0; i < lyricsInfo.translation.length; i++) {
            if (!lyricsInfo.translation[i]) lyricsInfo.translation.splice(i, 1);
        }
    }

    // 添加歌词内容
    for (let i = 0; i < lyricsInfo.lyrics.length; i++) {
        const lyric = lyricsInfo.lyrics[i];
        const lyricMatch = lyric.match(/^\[([^\]]+)\](.*)/);
        if (!lyricMatch) continue;
        const prefix = lyricMatch[1];
        const lyricText = lyricMatch[2];

        const prefixMark = prefix.split(':')[0];
        // 元数据前缀
        if (metaDataMarks.includes(prefixMark)) {
            const metaContent = prefix.split(':')[1];
            parsedLyrics.metaData[prefixMark] = metaContent;
            continue;
        }

        parsedLyrics.lyrics.push({
            time: formatLyricTime(prefix),
            content: lyricText,
            translation: '',
            yrc: undefined
        });
    }
    // 添加翻译
    let lastIndex = 0; // 上次时间匹配到的位置
    if (isTranslationExist) {
        for (let i = 0; i < lyricsInfo.translation.length; i++) {
            const translation = lyricsInfo.translation[i];
            const transMatch = translation.match(/^\[([^\]]+)\](.*)/);
            if (!transMatch) continue;
            const prefix = transMatch[1];
            const transText = transMatch[2];

            const prefixMark = prefix.split(':')[0];
            // 元数据前缀
            if (metaDataMarks.includes(prefixMark)) {
                const metaContent = prefix.split(':')[1];
                parsedLyrics.metaData[prefixMark] = metaContent;
                continue;
            }

            const targetTime = formatLyricTime(prefix);
            for (let i = lastIndex; i < parsedLyrics.lyrics.length; i++){
                if (parsedLyrics.lyrics[i].time === targetTime) {
                    parsedLyrics.lyrics[i].translation = transText;
                    lastIndex = i;
                }
            }
        }
    }
    
    // 检查并添加逐字歌词
    if (lyricsInfo.yrc) {
        for (const yrcLine of lyricsInfo.yrc) {
            if (!yrcLine || !yrcLine.startsWith('[')) continue;

            // 解析 YRC 行的起始时间: 格式为 [start(ms),duration(ms)] 或 [start(ms),duration(ms),...]
            const yrcMatch = yrcLine.match(/^\[(\d+),(\d+)(?:,([^\]]+))?\]/);
            if (!yrcMatch) continue;
            const yrcStartTime = parseInt(yrcMatch[1]);

            // 以起始时间为指标匹配对应的歌词行
            for (const lyric of parsedLyrics.lyrics) {
                // parsedLyrics.lyrics[i].time 是秒，转换为毫秒比较
                // 允许误差匹配逐字歌词行
                if (Math.abs(Math.round(lyric.time * 1000) - yrcStartTime) <= YRC_MATCH_DIFF) {
                    lyric.yrc = yrcLine;
                    break;
                }
            }
        }
    }

    console.log(parsedLyrics);
    return parsedLyrics;
}

type KuwoLyricsInfo = { lyrics: Array<{ lineLyric: string, time: string }>, translation: string[] };
function parseLyricsKuwo(lyricsInfo: KuwoLyricsInfo) {
    const parsedLyrics: LyricData = {
        lyrics: [],
        metaData: {}
    };
    // 添加歌词内容
    for (let i = 0; i < lyricsInfo.lyrics.length; i++) {
        const lyricInfo = lyricsInfo.lyrics[i];
        const lyricTime = parseFloat(lyricInfo.time);
        const lyricContent = lyricInfo.lineLyric;

        // 翻译检测
        let lineSkipFlag = false;
        if (i <= lyricsInfo.lyrics.length - 2) {
            const nextLine = lyricsInfo.lyrics[i + 1];
            const nextLineTime = parseFloat(nextLine.time);
            if (nextLineTime === lyricTime) {
                lineSkipFlag = true;
                parsedLyrics.lyrics[parsedLyrics.lyrics.length - 1].translation = lyricContent;
            }
        }
        
        if (!lineSkipFlag) {
            parsedLyrics.lyrics.push({
                time: lyricTime,
                content: lyricContent,
                translation: ''
            });
        }
    }

    return parsedLyrics;
}

/**
 * 解析歌词
 * @param lyricsInfo 歌词列表
 * @param platform 平台名称
 * @returns LyricData | undefined
 */
function parseLyrics(lyricsInfo: any, platform: string): LyricData | undefined {
    if (platform === 'netease' || platform === 'qqmusic' || platform === 'kugou') {
        return parseLyricsCommon(lyricsInfo);
    }
    if (platform === 'kuwo') {
        return parseLyricsKuwo(lyricsInfo);
    }
}

export {
    parseLyrics,
    parseLyricsCommon,
    type LyricData,
    type LyricLineInfo
};
