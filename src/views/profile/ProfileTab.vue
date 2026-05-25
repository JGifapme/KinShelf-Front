<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/useAuthStore';

const authStore = useAuthStore();

interface ProfileForm {
  username: string;
  email: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

const form = ref<ProfileForm>({
  username: '',
  email: '',
  dateOfBirth: '',
  password: '',
  confirmPassword: ''
});

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const loading = ref(false);

onMounted(async () => {
  const res = await axios.get('/api/users/me');
  form.value.username = res.data.username;
  form.value.email = res.data.email;
  form.value.dateOfBirth = res.data.dateOfBirth;
});

const handleUpdate = async () => {
  errorMessage.value = null;
  successMessage.value = null;

  if (form.value.password && form.value.password !== form.value.confirmPassword) {
    errorMessage.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  loading.value = true;
  try {
    const payload: any = {
      username: form.value.username,
      email: form.value.email,
      dateOfBirth: form.value.dateOfBirth,
    };

    if (form.value.password) {
      payload.password = form.value.password;
    }

    await axios.patch(`/api/users/${authStore.user?.id}`, payload);

    if (authStore.user) {
      authStore.user.username = form.value.username;
    }

    successMessage.value = "Profil mis à jour avec succès.";
    form.value.password = '';
    form.value.confirmPassword = '';

  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || "Une erreur est survenue.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="profile-tab">
    <h2>Mon Profil</h2>

    <form class="profile-form" @submit.prevent="handleUpdate">

      <div class="form-group">
        <label>Nom d'utilisateur</label>
        <input v-model="form.username" type="text" placeholder="Nom d'utilisateur" />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="Email" />
      </div>

      <div class="form-group">
        <label>Date de naissance</label>
        <input v-model="form.dateOfBirth" type="date" />
      </div>

      <hr />

      <p class="password-hint">Laisse vide si tu ne veux pas changer ton mot de passe.</p>

      <div class="form-group">
        <label>Nouveau mot de passe</label>
        <input v-model="form.password" type="password" placeholder="Nouveau mot de passe" />
      </div>

      <div class="form-group">
        <label>Confirmer le mot de passe</label>
        <input v-model="form.confirmPassword" type="password" placeholder="Confirmer le mot de passe" />
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <button class="btn" type="submit" :disabled="loading">
        {{ loading ? 'Mise à jour...' : 'Enregistrer' }}
      </button>

    </form>
  </div>
</template>

<style scoped>
hr {
  border: none;
  border-top: 1px solid #e0e0e0;
}

.password-hint {
  font-size: 0.85rem;
  color: #888;
}

.error {
  color: red;
  font-size: 0.9rem;
}

.success {
  color: green;
  font-size: 0.9rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>