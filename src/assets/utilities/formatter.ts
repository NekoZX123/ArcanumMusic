// 时间格式化
function timeFormat(timeSeconds: number) {
    let secondNum = Math.round(timeSeconds % 60);
    if (secondNum < 0) secondNum = 0;
    let minTemp = Math.floor(timeSeconds / 60);
    let minuteNum = minTemp % 60;
    let hourNum = Math.floor(minTemp / 60);

    let second = secondNum < 10 ? `0${secondNum}` : `${secondNum}`;
    let minute = minuteNum < 10 ? `0${minuteNum}` : `${minuteNum}`;
    let hour = hourNum < 10 ? `0${hourNum}` : `${hourNum}`;

    let result: string;
    if (hourNum > 0) {
        result = `${hour}:${minute}:${second}`;
    }
    else {
        result = `${minute}:${second}`;
    }

    return result;
}

// 文件大小格式化
function sizeFormat(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length);
    const value = bytes / Math.pow(1024, unitIndex);
    return `${value.toFixed(1)} ${units[unitIndex - 1]}`;
}

export { timeFormat, sizeFormat };
