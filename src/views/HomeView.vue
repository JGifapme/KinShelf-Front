<script setup lang="ts">
import { bookLibrary } from '../composables/bookLibrary';
const { searchQuery, selectedCategory, selectedUser, selectedGenre, genres, users, categories, books } = bookLibrary();
</script>

<template>
  <div>
    <h1>KinShelf</h1>
    <h3>La bibliothèque partagée pour les lecteurs passionnés.</h3><br>
    <div class="search-bar-container">
      <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par titre, série ou auteur..."
          class="search-input"
      />
      <select v-model="selectedCategory" class="cat-select">
        <option class="griser" value="">Tous les types</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
          {{ cat.name }}
        </option>
      </select>
      <select v-model="selectedGenre" class="genre-select">
        <option class="griser" value="">Tous les genres</option>
        <option v-for="genre in genres" :key="genre.id" :value="genre.slug">
          {{ genre.name }}
        </option>
      </select>
      <select v-model="selectedUser" class="user-select">
        <option class="griser" value="">Tous les livres</option>
        <option value="all-users">Des utilisateurs</option>
        <option v-for="user in users" :key="user.id" :value="user.slug">
          livres de {{ user.username }}
        </option>
      </select>
    </div>
    <div class="shelf">
      <div v-for="book in books" :key="book.id" class="HPlivresMini">
        <router-link :to="'/book/' + book.slug">
          <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" >
          <div v-else class="siPasCouv"><h2>{{ book.title }}</h2></div>
          <p class="HPlivresTitre">{{ book.title }}</p>
        </router-link>
      </div>
    </div>

    <div v-if="books.length === 0">Aucun livre trouvé.</div>
  </div>
</template>

<style scoped>
div.shelf{
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  padding: 0 10px;
  @media (min-width: 450px) {
    padding: 0;
    gap: 20px;
  }
}
div.HPlivresMini{
  width: 45%;
  @media (min-width: 450px) {
    width: 28%;
  }
  @media (min-width: 750px) {
    width: 22%;
  }
  @media (min-width: 850px) {
    width: 17%;
  }
  @media (min-width: 1024px) {
    width: 14%;
  }
  @media (min-width: 1300px) {
    width: 12%;
  }
}
div.HPlivresMini:hover{
  opacity: 0.7;
}
div.HPlivresMini a{
  text-decoration: none;
}
div.HPlivresMini img{
  width: 100%;
  aspect-ratio: 2/3;
  background-size: cover;
  box-shadow: rgba(43, 40, 40, 0.33) 5px 3px 10px;
  border: 1px solid #959298;
  transition: transform .3s;
}
div.HPlivresMini:hover img{
  transform: scale(1.05);
}
div.HPlivresMini div.siPasCouv {
  background-color: #34383c;
  background: linear-gradient(to right bottom, #43474e, #2c2f32);
  text-align: center;
  width: 100%;
  border: 1px solid #959298;
  aspect-ratio: 2/3;
  vertical-align: center;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform .3s;
}
div.HPlivresMini:hover div.siPasCouv {
  transform: scale(1.05)
}
div.HPlivresMini div.siPasCouv h2{
  font-size: 18px;
  color: #EEE9DF;
  opacity: 0.3;
  margin: 0 2px;
}
p.HPlivresTitre{
  font-size: 14px;
  margin: 5px 2px;
  color: var(--text);
}
.search-bar-container {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.search-input, .genre-select, .user-select, .cat-select {
  width: 100%;
  max-width: 300px;
  padding: 0.4rem 0.8rem;
  border-radius: 25px;
  border: 2px solid var(--bg); /* Couleur bois */
  background-color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  outline: none;
  box-shadow: 2px 2px 5px rgba(177, 96, 28, 0.1);
  transition: all 0.3s ease;
}
.genre-select, .user-select, .cat-select {
  max-width: fit-content;
  padding: 0.4rem 0.5rem;
}
.search-input:focus, .genre-select:focus, .user-select:focus, .cat-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 10px rgba(177, 96, 28, 0.1);
}
option.griser{
  color: grey;
}
</style>