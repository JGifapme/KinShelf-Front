<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

const handleLogin = async () => {
  error.value = null;
  loading.value = true;
  try {
    await authStore.login(username.value, password.value);
    router.push({ name: 'Home' });
  } catch (e: any) {
    error.value = e.response?.data?.message || "Identifiants incorrects.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <h1>Bienvenue sur KinShelf</h1>
    <h2>Merci de vous connecter pour accèder à l'application.</h2><br>

    <div v-if="error" class="error">{{ error }}</div>

    <input v-model="username" type="text" placeholder="Nom d'utilisateur" /><br>
    <input v-model="password" type="password" placeholder="Mot de passe" /><br>

    <button class="btn" @click="handleLogin" :disabled="loading">
      {{ loading ? 'Connexion...' : 'Se connecter' }}
    </button>
    <br>

    <p>Pas encore de compte ? <RouterLink to="/register">S'inscrire</RouterLink></p>
  </div>
</template>