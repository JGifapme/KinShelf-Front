<script setup lang="ts">
import { bookLibrary } from '../../composables/bookLibrary';
import { useAuthStore } from '../../stores/useAuthStore';

const authStore = useAuthStore();

const { books, searchQuery, currentPage, totalPages, nextPage, prevPage, sortBy, userStatus,
  goToPage, selectedGenre, selectedCategory, genres, categories, totalElements } = bookLibrary({
  defaultUserSlug: authStore.user?.slug
}, true);
</script>

<template>
  <div class="collection-tab">
    <h2>Ma Collection</h2>

    <div class="search-bar-container">
      <input v-model="searchQuery" type="text" placeholder="Rechercher par titre, série ou auteur..." />
      <select v-model="sortBy">
        <option value="a-z">A → Z</option>
        <option value="z-a">Z → A</option>
        <option value="newest">Dernier ajouté</option>
        <option value="oldest">Premier ajouté</option>
      </select>
      <select v-model="selectedCategory">
        <option value="">Tous les types</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
      </select>
      <select v-model="selectedGenre">
        <option value="">Tous les genres</option>
        <option v-for="genre in genres" :key="genre.id" :value="genre.slug">{{ genre.name }}</option>
      </select>
      <select v-model="userStatus">
        <option :value="null">Tous</option>
        <option value="readtrue">Lu</option>
        <option value="readfalse">Non lu</option>
        <option value="interested">Wishlist</option>
      </select>
    </div>

    <p class="pagination-info">
      {{ totalElements }} livres - Page {{ currentPage + 1 }} / {{ totalPages }}
    </p>

    <div class="shelf">
      <div v-for="book in books" :key="book.id" class="HPlivresMini">
        <router-link :to="'/book/' + book.slug">
          <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" />
          <div v-else class="siPasCouv"><h2>{{ book.title }}</h2></div>
          <p>{{ book.title }}</p>
        </router-link>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 0">←</button>
      <button v-for="p in totalPages" :key="p" @click="goToPage(p - 1)"
              :class="{ active: currentPage === p - 1 }">
        {{ p }}
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages - 1">→</button>
    </div>
  </div>
</template>

<style scoped>
input, select{
  padding: 3px 3px 2px 1px;
  font-size: 15px;
}
input{
  padding-left:4px;
}
</style>