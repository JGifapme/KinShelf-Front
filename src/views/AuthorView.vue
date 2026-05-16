<script setup lang="ts">
import { useEntityDetails } from '../composables/useEntityDetails';

const { entity, loading, error } = useEntityDetails();
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
      <h1>Auteur : {{ entity.name }}</h1>

      <br><br>
      <!-- LISTE DES LIVRES QUI CORRESPONDENT AVEC LEURS COUVERTURES -->
      <div class="shelf">
        <div v-for="book in entity.books" :key="book.id" class="HPlivresMini">
          <router-link :to="'/book/' + book.slug">
            <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" >
            <div v-else class="siPasCouv"><h2>{{ book.title }}</h2></div>
            <p class="HPlivresTitre">{{ book.title }}</p>
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>

</style>