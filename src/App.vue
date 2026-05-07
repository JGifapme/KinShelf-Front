<template>
  <!--<nav class="p-4 bg-gray-800 text-white flex gap-4">
    <RouterLink to="/" class="hover:text-blue-400">Accueil</RouterLink>
    <RouterLink to="/add-book" class="hover:text-blue-400">Ajouter un livre</RouterLink>
  </nav>
  La Navbar sera affichée en haut sur TOUTES les pages -->
  <Navbar />

  <main class="container mx-auto p-4">
    <RouterView />
  </main>

</template>
<script setup lang="ts">
import Navbar from "./views/Navbar.vue";
</script>