<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUserProfile } from '../composables/useUserProfile';
import { bookLibrary } from '../composables/bookLibrary';
import { useUserExchanges } from '../composables/useUserExchanges';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';
import { useRouter } from 'vue-router';

interface LoanDTO {
  id: number;
  bookId: number;
  bookTitle: string;
  bookSlug: string;
  ownerId: number;
  ownerName: string;
  borrowerId: number;
  borrowerName: string;
  borrowerSlug: string;
  loanDate: string;
  returnDate: string | null;
}

interface BookTitleAndImgDTO {
  id: number;
  title: string;
  slug: string;
  coverUrl: string;
}

const router = useRouter();
const authStore = useAuthStore();
const route = useRoute();
const { profile, loading, error } = useUserProfile();
const type = route.params.type as string;
const slug = route.params.slug as string;


const activeTab = ref<'library' | 'exchanges'>('library');

const { books, searchQuery, currentPage, totalPages, nextPage, prevPage, goToPage,
  selectedGenre, selectedCategory, genres, categories, totalElements } = bookLibrary({
  defaultUserSlug: type === 'user' ? slug : slug
});

const loans = ref<LoanDTO[]>([]);
const wishFromUser = ref<BookTitleAndImgDTO[]>([]);
const wishedByUser = ref<BookTitleAndImgDTO[]>([]);
const loadingExchanges = ref(false);
const errorExchanges = ref<string | null>(null);

watch(profile, async (newProfile) => {
  if (newProfile && authStore.user?.slug === newProfile.slug) {
    await router.replace('/collection');
    return;
  }
  if (!newProfile) return;
  loadingExchanges.value = true;
  const result = useUserExchanges(newProfile.slug, newProfile.id);
  await result.fetchExchanges();
  loans.value = result.loans.value;
  wishFromUser.value = result.wishFromUser.value;
  wishedByUser.value = result.wishedByUser.value;
  loadingExchanges.value = false;
  errorExchanges.value = result.error.value;
}, { immediate: true });
</script>

<template>
  <div class="profile-container">

    <!-- Chargement -->
    <div v-if="loading">Chargement...</div>

    <!-- Erreur -->
    <div v-else-if="error">{{ error }}</div>

    <!-- Contenu -->
    <div v-else-if="profile">

      <!-- Infos publiques -->
      <div class="profile-header">
        <h1>{{ profile.username }}</h1>
        <p v-if="profile.dateOfBirth">
          Né(e) en {{ new Date(profile.dateOfBirth).getFullYear() }}
        </p>
      </div>

      <!-- Onglets -->
      <div class="profile-tabs">
        <button :class="{ active: activeTab === 'library' }"
                @click="activeTab = 'library'">
          Bibliothèque
        </button>
        <button :class="{ active: activeTab === 'exchanges' }"
                @click="activeTab = 'exchanges'">
          Échanges/Wishlist
        </button>
      </div>

      <!-- TAB : Bibliothèque -->
      <div v-if="activeTab === 'library'" class="profile-books">
        <div class="search-bar-container">
          <input v-model="searchQuery" type="text" placeholder="Rechercher par titre, série ou auteur..."
                 class="search-input" />
          <select v-model="selectedCategory" class="cat-select">
            <option value="">Tous les types</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
          </select>
          <select v-model="selectedGenre" class="genre-select">
            <option value="">Tous les genres</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.slug">{{ genre.name }}</option>
          </select>
        </div>
        <p v-if="books.length === 0">Aucun livre pour le moment.</p>
        <p v-else class="pagination-info">
          {{ totalElements }} livres - Page {{ currentPage + 1 }} / {{ totalPages }}
        </p>
        <div class="shelf">
          <div v-for="book in books" :key="book.id" class="HPlivresMini">
            <router-link :to="'/book/' + book.slug">
              <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title">
              <div v-else class="siPasCouv"><h2>{{ book.title }}</h2></div>
              <p class="HPlivresTitre">{{ book.title }}</p>
            </router-link>
          </div>
        </div>
        <div v-if="totalPages > 1" class="pagination">
          <button @click="prevPage" :disabled="currentPage === 0">←</button>
          <button v-for="page in totalPages" :key="page" @click="goToPage(page - 1)"
                  :class="{ active: currentPage === page - 1 }">{{ page }}</button>
          <button @click="nextPage" :disabled="currentPage === totalPages - 1">→</button>
        </div>
      </div>

      <!-- TAB : Échanges/wishlist -->
      <div v-if="activeTab === 'exchanges'" class="profile-exchanges">
        <div v-if="loadingExchanges">Chargement...</div>
        <div v-else-if="errorExchanges">{{ errorExchanges }}</div>
        <template v-else>

          <section class="exchanges-section">
            <h3>Prêts en cours avec {{ profile.username }}</h3>
            <p v-if="loans.length === 0">Aucun prêt en cours.</p>
            <div v-else class="loans-list">
              <div v-for="loan in loans" :key="loan.id" class="loan-card">
                <router-link class="book-title" :to="'/book/' + loan.bookSlug">
                  <strong>{{ loan.bookTitle }}</strong>
                </router-link>
                <span v-if="loan.ownerId === profile.id">{{ profile.username }} te l'a prêté</span>
                <span v-else>Tu lui as prêté ce livre</span>
                <span class="loan-date">depuis le {{ loan.loanDate }}</span>
              </div>
            </div>
          </section>

          <section class="exchanges-section">
            <h3>Ses livres dans ta wishlist</h3>
            <p v-if="wishFromUser.length === 0">
              Aucun livre de {{ profile.username }} n'est dans ta wishlist.
            </p>
            <div v-else class="shelf">
              <div v-for="book in wishFromUser" :key="book.id" class="HPlivresMini">
                <router-link :to="'/book/' + book.slug">
                  <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title">
                  <div v-else class="siPasCouv"><h2>{{ book.title }}</h2></div>
                  <p class="HPlivresTitre">{{ book.title }}</p>
                </router-link>
              </div>
            </div>
          </section>
          <section class="exchanges-section">
            <h3>Tes livres dans la wishlist de {{ profile.username }}</h3>
            <p v-if="wishedByUser.length === 0">
              {{ profile.username }} ne souhaite lire aucun de tes livres.
            </p>
            <div v-else class="shelf">
              <div v-for="book in wishedByUser" :key="book.id" class="HPlivresMini">
                <router-link :to="'/book/' + book.slug">
                  <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title">
                  <div v-else class="siPasCouv"><h2>{{ book.title }}</h2></div>
                  <p class="HPlivresTitre">{{ book.title }}</p>
                </router-link>
              </div>
            </div>
          </section>

        </template>
      </div>

    </div>
  </div>
</template>
<style scoped>
.profile-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;

  button {
    padding: 0.75rem 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: var(--text-h);
    border-bottom: 3px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s;
  }

  button.active {
    color: var(--text);
    border-bottom-color: var(--text);
    font-weight: bold;
  }

  button:hover:not(.active) {
    color: #333;
  }
}

.exchanges-section {
  margin-bottom: 2rem;

  h3 {
    margin-bottom: 1rem;
    font-size: 21px;
    font-weight: 600;
  }
}
.loans-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.loan-card {
  padding: 0.7rem;
  border: 1px solid var(--text);
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  gap: 0.5rem;

  .loan-date {
    margin-left: auto;
    font-size: 0.85rem;
    color: #888;
  }

  .book-title {
    font-size: 1rem;
    text-decoration: none;
    color: var(--text);
  }
}
</style>