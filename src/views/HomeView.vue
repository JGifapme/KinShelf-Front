<script setup lang="ts">
import { bookLibrary } from '../composables/bookLibrary';
const { searchQuery, selectedCategory, selectedUser, selectedGenre, genres, users, categories, books, sortBy, userStatus,
        nextPage, goToPage, prevPage, totalPages, currentPage, totalElements } = bookLibrary({}, true);
</script>

<template>
  <div>
    <!-- HOMEPAGE : APERCU DE LA BIBLIOTHÈQUE PARTAGÉE -->
    <h1>KinShelf</h1>
    <h3>La bibliothèque partagée pour les lecteurs passionnés.</h3><br>

    <!-- FILTRE ET RECHERCHE PAR TITRE/AUTEUR/SERIE POUR TRIER LES LIVRES : -->
    <div class="search-bar-container">
      <select v-model="sortBy" class="cat-select">
        <option value="a-z">A → Z</option>
        <option value="z-a">Z → A</option>
        <option value="newest">Dernier ajouté</option>
        <option value="oldest">Premier ajouté</option>
      </select>
      <input v-model="searchQuery" type="text" placeholder="Rechercher par titre, série ou auteur..."
          class="search-input" />
      </div>
    <div class="search-bar-container">
      <select v-model="selectedCategory" class="cat-select">
        <option class="griser" value="">Tous les types</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
      </select>
      <select v-model="selectedGenre" class="genre-select">
        <option class="griser" value="">Tous les genres</option>
        <option v-for="genre in genres" :key="genre.id" :value="genre.slug">{{ genre.name }}</option>
      </select>
      <select v-model="selectedUser" class="user-select">
        <option class="griser" value="">Tous les livres</option>
        <option value="all-users">Possédés par les membres</option>
        <!--<option v-for="user in users" :key="user.id" :value="user.slug">Livres de {{ user.username }}</option>-->
      </select>
      <select v-model="userStatus" class="cat-select">
        <option :value="null">Tous</option>
        <option value="readtrue">Lu</option>
        <option value="readfalse">Non lu</option>
        <option value="interested">Wishlist</option>
      </select>
    </div>
    <p class="pagination-info">
      {{ totalElements }} livres - Page {{ currentPage + 1 }} / {{ totalPages }}
    </p>
    <br><br>
    <!-- LISTE DES LIVRES AVEC LEURS COUVERTURES -->
    <div class="shelf">
      <div v-for="book in books" :key="book.id" class="HPlivresMini">
        <router-link :to="'/book/' + book.slug">
          <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" >
          <div v-else class="siPasCouv"><h2>{{ book.title }}</h2></div>
          <p class="HPlivresTitre">{{ book.title }}</p>
        </router-link>
      </div>
    </div>
    <!-- MENU DE PAGINATION -->
    <div v-if="totalPages > 1" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 0">←</button>
      <button v-for="page in totalPages" :key="page" @click="goToPage(page - 1)"
          :class="{ active: currentPage === page - 1 }">
        {{ page }}
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages - 1">→</button>
    </div>

    <div v-if="books.length === 0">Aucun livre trouvé.</div>
  </div>
</template>

<style scoped>

</style>