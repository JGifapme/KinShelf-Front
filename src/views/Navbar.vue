<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">

      <!-- CÔTÉ GAUCHE (Desktop) -->
      <div class="nav-left desktop-only">
        <router-link to="/" class="nav-link home-link">Accueil</router-link>
        <router-link to="/add-book" class="nav-link">Ajouter un livre</router-link>
      </div>

      <!-- MOBILE : ACCUEIL SEUL -->
      <div class="mobile-only">
        <router-link to="/" class="nav-link home-link">Accueil</router-link>
      </div>

      <!-- CÔTÉ DROIT (Desktop) -->
      <div class="nav-right desktop-only">
        <router-link to="/collection" class="nav-link">Ma Bibliothèque</router-link>
      </div>

      <!-- BOUTON BURGER (Mobile) -->
      <div class="mobile-only">
        <button @click="toggleMenu" class="burger-button">
          <span class="burger-icon" :class="{ 'is-open': isOpen }"></span>
        </button>
      </div>
    </div>

    <!-- MENU DÉROULANT (Mobile) -->
    <transition name="slide">
      <div v-if="isOpen" class="mobile-menu">
        <router-link to="/add-book" @click="closeMenu" class="mobile-link">Ajouter un livre</router-link>
        <router-link to="/collection" @click="closeMenu" class="mobile-link">Ma Bibliothèque</router-link>
      </div>
    </transition>
  </nav>
</template>