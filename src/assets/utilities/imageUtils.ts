/**
 * 根据 URL 获取图片并转为 base64 格式
 * @param url 图片 URL
 * @returns base64 数据 URI，获取失败时返回空字符串
 */
async function fetchCoverAsBase64(url: string): Promise<string> {
    if (!url) return '';

    try {
        const response = await fetch(url);
        if (!response.ok) return '';

        const blob = await response.blob();
        // const mimeType = blob.type || 'image/jpeg';

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string || '');
            };
            reader.onerror = () => resolve('');
            reader.readAsDataURL(blob);
        });
    } catch {
        return '';
    }
}

export { fetchCoverAsBase64 };
