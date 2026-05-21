<script setup lang="ts">
import { useUserProfile } from '../composables/useUserProfile';
import { bookLibrary } from '../composables/bookLibrary';
import { useRoute } from 'vue-router';
const route = useRoute();
const { profile, loading, error } = useUserProfile();
const type = route.params.type as string;
const slug = route.params.slug as string;
const { books, searchQuery, currentPage, totalPages, nextPage, prevPage, goToPage, selectedGenre,
  selectedCategory, genres, categories, totalElements } = bookLibrary({
  defaultUserSlug:     type === 'user'    ? slug : slug
});
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
        <div class="search-bar-container">
          <input v-model="searchQuery" type="text" placeholder="Rechercher par titre, série ou auteur..."
                 class="search-input" />
          <select v-model="selectedCategory" class="cat-select">
            <option class="griser" value="">Tous les types</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
          </select>
          <select v-model="selectedGenre" class="genre-select">
            <option class="griser" value="">Tous les genres</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.slug">{{ genre.name }}</option>
          </select>
        </div>
        <p class="pagination-info">
          {{ totalElements }} livres - Page {{ currentPage + 1 }} / {{ totalPages }}
        </p>
        <div class="shelf">
          <div v-for="book in books" :key="book.id" class="HPlivresMini">
            <router-link :to="'/book/' + book.slug">
              <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" >
              <div v-else class="siPasCouv"><h2>{{ book.title }}</h2></div>
              <p class="HPlivresTitre">{{ book.title }}</p>
            </router-link>
          </div>
        </div>
        <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button @click="prevPage" :disabled="currentPage === 0">←</button>
            <button v-for="page in totalPages" :key="page" @click="goToPage(page - 1)"
                    :class="{ active: currentPage === page - 1 }">
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages - 1">→</button>
          </div>

      </div>
    </div>
  </div>
</template>