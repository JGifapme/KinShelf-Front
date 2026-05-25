<script setup lang="ts">
import { ref } from 'vue';
import ProfileTab from './profile/ProfileTab.vue';
import CollectionTab from './profile/CollectionTab.vue';
import LoansTab from './profile/LoansTab.vue';
import StatsTab from './profile/StatsTab.vue';
import { useAuthStore } from '../stores/useAuthStore.ts';

type Tab = 'collection' | 'profile' | 'loans' | 'stats';
const activeTab = ref<Tab>('collection');
const authStore = useAuthStore();
</script>

<template>
  <div class="profile-page">

    <!-- HEADER PROFIL -->
    <div class="profile-header">
      <h1>{{ authStore.user?.username }}</h1>
    </div>

    <!-- ONGLETS -->
    <nav class="profile-tabs">
      <button
          v-for="tab in ([
                    { key: 'collection', label: 'Collection' },
                    { key: 'profile', label: 'Profil' },
                    { key: 'loans', label: 'Prêts' },
                    { key: 'stats', label: 'Statistiques' }
                ] as const)"
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- CONTENU -->
    <div class="profile-content">
      <CollectionTab v-if="activeTab === 'collection'" />
      <ProfileTab v-else-if="activeTab === 'profile'" />
      <LoansTab v-else-if="activeTab === 'loans'" />
      <StatsTab v-else-if="activeTab === 'stats'" />
    </div>

  </div>
</template>

<style scoped>
.profile-page {
  max-width: 1050px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100dvh;
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-top:none;
  border-radius: 0 0 8px 8px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.profile-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

.tab-btn {
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

.tab-btn.active {
  color: var(--text);
  border-bottom-color: var(--text);
  font-weight: bold;
}

.tab-btn:hover:not(.active) {
  color: #333;
}
</style>