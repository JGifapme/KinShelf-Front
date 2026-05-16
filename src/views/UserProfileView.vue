<script setup lang="ts">
import { useUserProfile } from '../composables/useUserProfile';

const { profile, loading, error } = useUserProfile();
</script>

<template>
  <div class="profile-container">

    <!-- Chargement -->
    <div v-if="loading">Chargement...</div>

    <!-- Erreur -->
    <div v-else-if="error">{{ error }}</div>

    <!-- Contenu -->
    <div v-else-if="profile">

      <!-- Infos publiques -->
      <div class="profile-header">
        <h1>{{ profile.username }}</h1>
        <p v-if="profile.dateOfBirth">
          Né(e) en {{ new Date(profile.dateOfBirth).getFullYear() }}
        </p>
      </div>

      <!-- Ses livres -->
      <div class="profile-books">
        <h2>Sa bibliothèque <!--({{ profile.books.length }} livres)--></h2>

       <!-- <div v-if="profile.books.length === 0">
          Aucun livre pour le moment.
        </div>-->

        <div class="books-grid">
          <RouterLink
              v-for="book in profile.books"
              :key="book.id"
              :to="`/books/${book.slug}`"
              class="book-card"
          >
            <img :src="book.coverUrl" :alt="book.title" />
            <p>{{ book.title }}</p>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>