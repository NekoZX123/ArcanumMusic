// 通知管理

import Notification from './Notification.vue';
import { createApp } from "vue";

type NotifyType = 'success' | 'info' | 'warning' | 'critical';

// 主窗口通知同步到桌面歌词窗口 (通过 localStorage 传输)
const SYNCED_NOTIFY_STORAGE_KEY = 'syncedNotify';

/**
 * 将主窗口通知同步到桌面歌词窗口
 * 先清空再写入, 确保相同内容的通知也能触发 storage 事件
 */
function syncNotifyToCaptions(id: string, type: NotifyType, title: string, content: string, duration: number) {
    const notifyData = JSON.stringify({ id, type, title, content, duration });
    window.localStorage.setItem(SYNCED_NOTIFY_STORAGE_KEY, '');
    window.localStorage.setItem(SYNCED_NOTIFY_STORAGE_KEY, notifyData);
}

/**
 * 显示通知
 * @param id 通知 ID
 * @param type 类型 (success, info, warning, critical)
 * @param title 通知标题
 * @param content 通知内容
 * @param duration 显示时长 (默认 3000 ms)
 */
function showNotify(id: string, type: NotifyType, title: string, content: string, duration: number = 3000) {
    const container = document.createElement('div');
    document.getElementById('notifyArea')?.appendChild(container);

    const notificationApp = createApp(Notification, { type, id, title, content, duration });
    notificationApp.mount(container);

    let notifyBody = container.firstChild as HTMLElement;
    if (!notifyBody) return;

    setTimeout(() => {
        requestAnimationFrame(() => {
            notifyBody.classList.add('show');
        });
    }, 0);
    
    // 绑定关闭按钮事件
    const closeButton = notifyBody.querySelector('.notifyClose') as HTMLElement;
    closeButton.addEventListener('click', () => closeNotify(id));

    // 一定时间后隐藏通知
    setTimeout(closeNotify, duration, id);

    // 同步通知到桌面歌词窗口 (通过 localStorage 传输)
    syncNotifyToCaptions(id, type, title, content, duration);
}

// 关闭通知
function closeNotify(id: string) {
    const notify = document.getElementById(id);
    if (notify) {
        notify.classList.remove('show');
        notify.classList.add('closing');
        notify.addEventListener('transitionend', () => notify.remove(), { once: true });
    }
}


export {
    showNotify,
    closeNotify
}
