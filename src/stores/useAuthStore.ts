import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

interface AuthResponse {
    message: string;
    token: string;
    roles: string[];
    expiresAt: string;
}

interface UserInfo {
    id: number;
    slug: string;
    username: string;
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('token'));
    const roles = ref<string[]>(JSON.parse(localStorage.getItem('roles') || '[]'));
    const user = ref<UserInfo | null>(JSON.parse(localStorage.getItem('user') || 'null'));

    const isAuthenticated = computed(() => !!token.value);

    const fetchUserInfo = async () => {
        const res = await axios.get('http://localhost:8080/api/users/me');
        user.value = res.data;
        localStorage.setItem('user', JSON.stringify(res.data));
    };

    const login = async (username: string, password: string) => {
        const res = await axios.post<AuthResponse>('http://localhost:8080/api/auth/login', {
            username,
            password
        });
        token.value = res.data.token;
        roles.value = res.data.roles;
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('roles', JSON.stringify(res.data.roles));
        await fetchUserInfo();
    };

    const register = async (username: string, email: string, password: string, dateOfBirth: string) => {
        const res = await axios.post<AuthResponse>('http://localhost:8080/api/auth/register', {
            username, email, password, dateOfBirth
        });
        token.value = res.data.token;
        roles.value = res.data.roles;
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('roles', JSON.stringify(res.data.roles));
        await fetchUserInfo(); // récupère l'id et le slug après s'être inscrit
    };

    const logout = () => {
        token.value = null;
        roles.value = [];
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        localStorage.removeItem('user');
    };

    return { token, roles, user, isAuthenticated, login, register, logout };
});