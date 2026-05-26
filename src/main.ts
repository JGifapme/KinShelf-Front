import axios from 'axios';
import './config/axios.ts';
import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router' // Importe ton fichier router
import './style.css'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
axios.defaults.withCredentials = true;

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);      // ← Pinia AVANT le router
app.use(router);

app.mount('#app');