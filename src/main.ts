import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importe ton fichier router
import './style.css'

const app = createApp(App)
app.use(router) // Utilise le router
app.mount('#app')