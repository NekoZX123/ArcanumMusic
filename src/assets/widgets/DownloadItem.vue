<script setup lang="ts">
import type { DownloadInfo } from "../player/musicDownloader";
import { sizeFormat } from "../utilities/formatter";

const statusText = {
    downloading: '下载中',
    completed: '已完成',
    failed: '下载失败'
}

defineProps<{
    item: DownloadInfo
}>();
</script>
<template>
    <div class="flex row downloadItem">
        <div class="text ultraSmall downloadFileName">{{ item.fileName }}</div>
        <label class="text ultraSmall downloadStatus">{{ statusText[item.status] }}</label>
        <div class="flex column progressDisplay">
            <label class="text ultraSmall">{{ sizeFormat(item.downloaded) }}/{{ sizeFormat(item.total) }}</label>
            <div :class="`downloadProgress ${item.status}`">
                <div class="downloadCompleted" :style="{ width: item.percentage + '%' }"></div>
            </div>
        </div>
    </div>
</template>
