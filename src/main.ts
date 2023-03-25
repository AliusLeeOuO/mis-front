import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.less'
import "@arco-design/web-vue/es/message/style/css.js";

createApp(App)
    .use(createPinia())
    .use(router)
    .mount("#app")
