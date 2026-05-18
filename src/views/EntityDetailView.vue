<script setup lang="ts">
import { useEntityDetails } from '../composables/useEntityDetails';
import { bookLibrary } from '../composables/bookLibrary';
import { useRoute } from 'vue-router';
const route = useRoute();

const { entity, loading, error } = useEntityDetails();

const entityTitle: Record<string, string> = {
  author : 'Auteur',
  publisher: 'Éditeur',
  genre: 'Genre',
  category: 'Catégorie',
  series: 'Série'
};

const type = route.params.type as string;
const slug = route.params.slug as string;

const { books, searchQuery, currentPage, totalPages, nextPage, prevPage, goToPage, selectedGenre,
  selectedCategory, selectedUser, users, genres, categories, totalElements } = bookLibrary({
    defaultGenreSlug:    type === 'genre'     ? slug : undefined,
      defaultCategorySlug: type === 'category'  ? slug : undefined,
      defaultUserSlug:     type === 'author'    ? slug : undefined,
    defaultPublisherSlug:     type === 'publisher'    ? slug : undefined,
});
</script>

<template>
  <div>
    <!-- Chargement -->
    <div v-if="loading">Chargement...</div>

    <!-- Erreur -->
    <div v-else-if="error">{{ error }}</div>

    <!-- Contenu -->
    <div v-else-if="entity">
      <!-- INFOS : NOM de la série, du genre, de la catégorie -->
      <h1>{{ entityTitle[type] }} : {{ entity.name }}</h1>

      <div v-if="!['author', 'series'].includes(type)" class="search-bar-container">
        <input v-model="searchQuery" type="text" placeholder="Rechercher par titre, série ou auteur..."
               class="search-input" />
        <select v-if="type !== 'category'" v-model="selectedCategory" class="cat-select">
          <option class="griser" value="">Tous les types</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
        </select>
        <select v-if="type !== 'genre'" v-model="selectedGenre" class="genre-select">
          <option class="griser" value="">Tous les genres</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre.slug">{{ genre.name }}</option>
        </select>
        <select v-model="selectedUser" class="user-select">
          <option class="griser" value="">Tous les livres</option>
          <option value="all-users">De tous les utilisateurs</option>
          <option v-for="user in users" :key="user.id" :value="user.slug">Livres de {{ user.username }}</option>
        </select>
      </div>
      <p v-if="!['author', 'series'].includes(type)" class="pagination-info">
        {{ totalElements }} livres - Page {{ currentPage + 1 }} / {{ totalPages }}
      </p>
      <p v-else>{{entity.books.length}} livres</p>
      <br><br>
      <!-- Pas de select genre ici, déjà filtré -->
      <!-- LISTE DES LIVRES QUI CORRESPONDENT AVEC LEURS COUVERTURES -->
      <div v-if="!['author', 'series'].includes(type)" class="shelf">
        <div v-for="book in books" :key="book.id" class="HPlivresMini">
          <router-link :to="'/book/' + book.slug">
            <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" >
            <div v-else class="siPasCouv"><h2>{{ book.title }}</h2></div>
            <p class="HPlivresTitre">{{ book.title }}</p>
          </router-link>
        </div>
      </div>
      <div v-else class="shelf">
        <div v-for="book in entity.books" :key="book.id" class="HPlivresMini">
          <router-link :to="'/book/' + book.slug">
            <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" >
            <div v-else class="siPasCouv"><h2>{{ book.title }}</h2></div>
            <p class="HPlivresTitre">{{ book.title }}</p>
          </router-link>
        </div>
      </div>
      <!-- Pagination -->
      <div v-if="!['author', 'series'].includes(type)">
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