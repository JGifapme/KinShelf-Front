<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// On définit une interface pour avoir de l'autocomplétion (comme une classe Java)
interface Book {
  id: number;
  title: string;
  slug: string;
  coverUrl?: string;
}

const books = ref<Book[]>([]) // liste de "Book"

const loadBooks = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/books')
    books.value = response.data
  } catch (error) {
    console.error("Erreur API :", error)
  }
}

onMounted(loadBooks)
</script>

<template>
  <div>
    <h1>KinShelf</h1>
    <p>La bibliothèque partagée pour les lecteurs passionnés.</p><br>

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
  gap: 20px;
  justify-content: center;
}
div.HPlivresMini{
  width: 45%;
  @media (min-width: 450px) {
    width: 28%;
  }
  @media (min-width: 750px) {
    width: 22%;
  }
  @media (min-width: 1024px) {
    width: 18%;
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
  color: var(--text-h);
}
</style>