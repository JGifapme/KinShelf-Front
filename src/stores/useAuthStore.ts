import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

interface AuthResponse {
    message: string;
    roles: string[];
}

interface UserInfo {
    id: number;
    slug: string;
    username: string;
}

export const useAuthStore = defineStore('auth', () => {
    // plus de token en localStorage — le cookie est géré par le navigateur
    const roles = ref<string[]>(JSON.parse(localStorage.getItem('roles') || '[]'));
    const user = ref<UserInfo | null>(JSON.parse(localStorage.getItem('user') || 'null'));

    // isAuthenticated basé sur user plutôt que sur le token
    const isAuthenticated = computed(() => !!user.value);

    const fetchUserInfo = async () => {
        const res = await axios.get('/api/users/me');
        user.value = res.data;
        localStorage.setItem('user', JSON.stringify(res.data));
    };

    const login = async (username: string, password: string) => {
        const res = await axios.post<AuthResponse>('/api/auth/login', { username, password });
        roles.value = res.data.roles;
        localStorage.setItem('roles', JSON.stringify(res.data.roles));
        await fetchUserInfo();
    };

    const register = async (username: string, email: string, password: string, dateOfBirth: string) => {
        const res = await axios.post<AuthResponse>('/api/auth/register', {
            username, email, password, dateOfBirth
        });
        roles.value = res.data.roles;
        localStorage.setItem('roles', JSON.stringify(res.data.roles));
        await fetchUserInfo();
    };

    const logout = async () => {
        await axios.post('/api/auth/logout'); // demande au serveur de supprimer le cookie
        roles.value = [];
        user.value = null;
        localStorage.removeItem('roles');
        localStorage.removeItem('user');
    };

    return { roles, user, isAuthenticated, login, register, logout };
});