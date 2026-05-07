import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // <--- On importe le plugin

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()], // <--- On dit à Vite d'utiliser le plugin
})