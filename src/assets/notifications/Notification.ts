// 通知管理

import Notification from './Notification.vue';
import { createApp } from "vue";

// 创建通知
function showNotify(id: string, type: string, title: string, content: string, duration: number) {
    const container = document.createElement('div');
    document.getElementById('notifyArea')?.appendChild(container);

    const notificationApp = createApp(Notification, { type, id, title, content, duration });
    notificationApp.mount(container);

    let notifyBody = container.firstChild as HTMLElement;
    if (!notifyBody) return;

    // 显示通知
    notifyBody.classList.add('show');
    // 绑定关闭按钮事件
    const closeButton = notifyBody.querySelector('.notifyClose') as HTMLElement;
    closeButton.addEventListener('click', () => closeNotify(id));

    // 一定时间后隐藏通知
    setTimeout(closeNotify, duration, id);
}

// 关闭通知
function closeNotify(id: string) {
    const notify = document.getElementById(id);
    if (notify) {
        notify.classList.remove('show');
        setTimeout(() => {
            notify.remove();
        }, 200);
    }
}


export {
    showNotify,
    closeNotify
}
