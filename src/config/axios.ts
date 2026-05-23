import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore.ts';

// redirige vers /login si le token est expiré ou invalide
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            const authStore = useAuthStore();
            await authStore.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);