import { reactive } from "vue";
import { showNotify } from "../notifications/Notification";
import { getSongLink } from "./songUtils";
import { fetchCoverAsBase64 } from "../utilities/imageUtils";

type DownloadInfo = {
    fileName: string,
    percentage: number,
    downloaded: number,
    total: number,
    status: 'downloading' | 'completed' | 'failed'
};

// 下载队列，包含正在下载和已完成的下载项
const downloadQueue = reactive<DownloadInfo[]>([]);

/**
 * 获取下载队列
 * @returns DownloadInfo[] - 下载队列
 */
function getDownloadQueue() {
    return downloadQueue;
}

/**
 * 保存歌曲至本地
 * @param songId 歌曲 ID
 * @param songName 歌曲名称
 * @param metaData 歌曲元数据
 */
async function saveAudio(songId: string, songName: string, metaData: any) {
    // 预先获取封面图片并转为 base64 格式
    const coverUrl = metaData.coverUrl || metaData.songCover || '';
    const coverBase64 = await fetchCoverAsBase64(coverUrl);
    const enrichedMetaData = {
        ...metaData,
        coverBase64,
    };
    enrichedMetaData.authors = enrichedMetaData.authors.split(', ').join('; ');

    getSongLink(songId).then((linkInfo: any) => {
        let url = linkInfo.url;

        // 删除网易云 CDN 链接中的查询参数, 防止 403
        const neteaseCdnPostfix = 'music.126.net';
        const urlObj = new URL(url);
        const isNeteaseCdn = urlObj.hostname.endsWith(neteaseCdnPostfix) && urlObj.search;
        if (isNeteaseCdn) {
            // 当为网易云 CDN 且带查询参数时, 直接使用原始链接(移除查询) 且不通过 WebSocket 代理
            url = `${urlObj.origin}${urlObj.pathname}`;
        }

        // 添加至下载队列
        downloadQueue.push({
            fileName: songName,
            percentage: 0,
            downloaded: 0,
            total: 0,
            status: 'downloading'
        });
            
        // 注册下载进度监听
        const stopListening = window.electron.onDownloadProgress((progress: any) => {
            // console.log(`[Download] ${progress.percent}% (${progress.loaded}/${progress.total})`);
            const queueItem = downloadQueue.find(item => item.fileName === songName && item.status === 'downloading');
            if (queueItem) {
                queueItem.percentage = progress.percent;
                queueItem.downloaded = progress.loaded;
                queueItem.total = progress.total;
                if (progress.percent >= 100) {
                    queueItem.status = 'completed';
                }
            }
        });

        window.electron.downloadAudio(url, songName, enrichedMetaData)
            .then((filePath: string) => {
                stopListening();
                showNotify('downloadSucceed', 'success', '下载完成', `歌曲已保存至 ${filePath}`, 3000);
            })
            .catch((err: Error) => {
                stopListening();
                showNotify('downloadFailed', 'critical', '下载失败', err.message || '未知错误，请检查网络或重试', 3000);
            });
    }).catch(() => {
        showNotify('linkFetchFailed', 'critical', '获取链接失败', '无法解析歌曲链接，请重试', 3000);
    });
}

export {
    type DownloadInfo,
    saveAudio,
    getDownloadQueue
};
