import { createApp } from 'vue';

import App from './App.vue';
import './globalStyle.css';
import Captions from './components/captions/Captions.vue';

const urlParams = new URLSearchParams(window.location.search);
const isDesktopLyrics = urlParams.get('isDesktopLyrics') === 'true';
if (isDesktopLyrics) {
    // 挂载桌面歌词组件
    createApp(Captions).mount('#app');
}
else {
    // 挂载应用主面板
    createApp(App).mount('#app');
}
