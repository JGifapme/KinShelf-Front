<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

// On définit une interface pour avoir de l'autocomplétion (comme une classe Java)
interface Book {
  id: number;
  title: string;
  slug: string;
  coverUrl?: string;
}

const books = ref<Book[]>([]) // liste de "Book"
const searchQuery = ref(''); // Lie cet état au champ input
const genres = ref<any[]>([]);
const selectedGenre = ref(''); // Stocke le slug sélectionné
const users = ref<any[]>([]);
const selectedUser = ref(''); // Stocke le slug sélectionné

// 1. Charger les catégories au montage
onMounted(async () => {
  try {
    // On charge les genres d'abord
    const genreRes = await axios.get('http://localhost:8080/api/genres');
    genres.value = genreRes.data;

    const userRes = await axios.get('http://localhost:8080/api/users');
    users.value = userRes.data;

    // Ensuite on charge les livres
    await loadBooks();
  } catch (error) {
    console.error("Erreur d'initialisation", error);
  }
});

const loadBooks = async () => {
  try {
    // On prépare les paramètres pour l'URL
    const params: any = {};
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedGenre.value) params.genreSlug = selectedGenre.value;
    if (selectedUser.value) params.userSlug = selectedUser.value;

    const response = await axios.get('http://localhost:8080/api/books', { params });
    books.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des livres", error);
  }
};

let timeout: any;
// dès que search change, on relance loadBooks
watch([searchQuery, selectedGenre, selectedUser], () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    loadBooks();
  }, 500); // Attend 500ms avant de lancer la recherche
});
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
      <select v-model="selectedGenre" class="genre-select">
        <option class="griser" value="">Tous les genres</option>
        <option v-for="genre in genres" :key="genre.id" :value="genre.slug">
          {{ genre.name }}
        </option>
      </select>
      <select v-model="selectedUser" class="user-select">
        <option class="griser" value="">Tous les livres</option>
        <option v-for="user in users" :key="user.id" :value="user.slug">
          livres de {{ user.firstName }}
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

.search-input, .genre-select, .user-select {
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
.genre-select, .user-select {
  max-width: fit-content;
  padding: 0.4rem 0.5rem;
}
.search-input:focus, .genre-select:focus, .user-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 10px rgba(177, 96, 28, 0.1);
}
option.griser{
  color: grey;
}
</style>