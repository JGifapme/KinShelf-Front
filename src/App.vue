<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from './views/Navbar.vue';

const route = useRoute();

const hideNavbar = computed(() =>
    ['Login', 'Register'].includes(route.name as string)
);
</script>
<template>

  <NavBar v-if="!hideNavbar" />

  <main class="container">
    <RouterView />
  </main>

</template>