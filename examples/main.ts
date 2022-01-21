import { createApp } from 'vue';
import router from './router';
import components from "@component/index";
import '@/style/index.scss'
import App from './App'
const app = createApp(App);
app.use(components);
app.use(router);
app.mount('#app')
