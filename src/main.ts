import './config/axios.ts';
import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router' // Importe ton fichier router
import './style.css'

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);      // ← Pinia AVANT le router
app.use(router);

app.mount('#app');