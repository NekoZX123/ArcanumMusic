import { createApp } from 'vue';

import App from './App.vue';
import './globalStyle.css';
import Captions from './components/captions/Captions.vue';
import router from './router';

const urlParams = new URLSearchParams(window.location.search);
const isDesktopLyrics = urlParams.get('isDesktopLyrics') === 'true';
if (isDesktopLyrics) {
    createApp(Captions).mount('#app');
}
else {
    createApp(App)
        .use(router)
        .mount('#app');
}
