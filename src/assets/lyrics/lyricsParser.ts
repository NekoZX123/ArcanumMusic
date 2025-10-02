const metaDataMarks = ['ti', 'ar', 'al', 'au', 'by', 'offset', 'length', 're', 've', 'kana'];

type LyricLineInfo = {
    time: number,
    content: string,
    translation: string
};
type LyricData = {
    lyrics: LyricLineInfo[],
    metaData: any
}

function getBracketContent(text: string): string | null {
  const match = text.match(/\[(.*?)\]/);
  return match ? match[1] : null;
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

type LyricsInfo = { lyrics: string[], translation: string[] };
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
        const prefix = getBracketContent(lyric) || '';
        const lyricText = lyric.split(']')[1];

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
            translation: ''
        });
    }
    // 添加翻译
    let lastIndex = 0; // 上次时间匹配到的位置
    if (isTranslationExist) {
        for (let i = 0; i < lyricsInfo.translation.length; i++) {
            const translation = lyricsInfo.translation[i];
            const prefix = getBracketContent(translation) || '';
            const transText = translation.split(']')[1];

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
    type LyricData
};
