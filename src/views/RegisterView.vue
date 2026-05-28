<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const dateOfBirth = ref('');
const error = ref<string | null>(null);
const loading = ref(false);


const handleRegister = async () => {
  error.value = null;
  loading.value = true;
  try {
    await authStore.register(username.value, email.value, password.value, dateOfBirth.value);
    router.push({ name: 'Home' });
  } catch (e: any) {
    error.value = e.response?.data?.message || "Erreur lors de l'inscription.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <h1>Inscription</h1>

    <div v-if="error" class="error">{{ error }}</div>

    <input v-model="username" type="text" placeholder="Nom d'utilisateur" />
    <input v-model="email" type="email" placeholder="Email" />
    <p>Date de naissance : </p>
    <input v-model="dateOfBirth" type="date" />
    <input v-model="password" type="password" placeholder="Mot de passe" />

    <button class="btn" @click="handleRegister" :disabled="loading">
      {{ loading ? 'Inscription...' : "S'inscrire" }}
    </button>
    <br>

    <p>Déjà un compte ? <RouterLink to="/login" class="lien">Se connecter</RouterLink></p>
  </div>
</template>
<style scoped>
input, button{
  padding: 4px 5px 2px 5px;
  margin-bottom: 10px;
  font-size: 16px;
  display: block;
  margin: 10px auto;
}
</style>