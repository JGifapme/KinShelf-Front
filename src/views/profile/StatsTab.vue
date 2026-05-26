<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface UserStats {
  totalOwned: number;
  totalRead: number;
  totalLent: number;
  booksByCategory: Record<string, number>;
}

const stats = ref<UserStats | null>(null);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await axios.get('/api/users/me/stats');
    stats.value = res.data;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="stats-tab">
    <h2>Mes Statistiques</h2>

    <div v-if="loading">Chargement...</div>

    <div v-else-if="stats" class="stats-content">

      <!-- CHIFFRES CLÉS -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">{{ stats.totalOwned }}</span>
          <span class="stat-label">Livres possédés</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ stats.totalRead }}</span>
          <span class="stat-label">Livres lus</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ stats.totalLent }}</span>
          <span class="stat-label">Livres prêtés</span>
        </div>
      </div>

      <!-- RÉPARTITION PAR TYPE -->
      <div class="stats-categories">
        <h3>Répartition par type d'ouvrage de la bibliothèque</h3>
        <div class="category-bars">
          <div
              v-for="(count, category) in stats.booksByCategory"
              :key="category"
              class="category-row"
          >
            <span class="category-name">{{ category }}</span>
            <div class="bar-container">
              <div
                  class="bar"
                  :style="{ width: (count / stats.totalOwned * 100) + '%' }"
              ></div>
            </div>
            <span class="category-count">{{ count }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.stats-tab {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text);
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
}

.stats-favorites h3,
.stats-categories h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.favorite-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 1px solid var(--text);
  border-radius: 6px;
}

.favorite-label {
  color: #666;
  font-size: 0.9rem;
}

.favorite-value {
  font-weight: bold;
}

.category-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-row {
  display: grid;
  grid-template-columns: 120px 1fr 40px;
  align-items: center;
  gap: 1rem;
}

.category-name {
  font-size: 0.9rem;
  color: #444;
}

.bar-container {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  height: 12px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: var(--text);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.category-count {
  font-size: 0.85rem;
  color: #666;
  text-align: right;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>