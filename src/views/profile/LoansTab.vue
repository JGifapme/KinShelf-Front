<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

type LoanFilter = 'LENT' | 'BORROWED' | 'HISTORY';

interface Loan {
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

const activeFilter = ref<LoanFilter>('LENT');
const loans = ref<Loan[]>([]);
const loading = ref(false);
const returnBook = async (loanId: number) => {
  await axios.patch(`/api/loans/${loanId}`);
  await fetchLoans();
};

const fetchLoans = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/api/loans', {
      params: { filter: activeFilter.value }
    });
    loans.value = res.data;
  } catch (err: any) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

watch(activeFilter, fetchLoans);
onMounted(fetchLoans);
</script>

<template>
  <div class="loans-tab">
    <h2>Mes Prêts</h2>

    <!-- SOUS-ONGLETS -->
    <div class="loan-filters">
      <button
          v-for="f in ([
                    { key: 'LENT', label: 'Prêtés' },
                    { key: 'BORROWED', label: 'Empruntés' },
                    { key: 'HISTORY', label: 'Historique' }
                ] as const)"
          :key="f.key"
          :class="['filter-btn', { active: activeFilter === f.key }]"
          @click="activeFilter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- LISTE -->
    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="loans.length === 0" class="empty">
      Aucun prêt à afficher.
    </div>

    <div v-else class="loans-list">
      <div v-for="loan in loans" :key="loan.id" class="loan-card">
        <div class="loan-info">
          <router-link :to="`/book/${loan.bookSlug}`" class="book-title">
            {{ loan.bookTitle }}
          </router-link>
        <span v-if="activeFilter === 'LENT'">
            prêté à <strong>{{ loan.borrowerName }}</strong> depuis le {{ loan.loanDate }}&nbsp;&nbsp;
        </span>
          <span v-else-if="activeFilter === 'BORROWED'">
            emprunté à <strong>{{ loan.ownerName }}</strong> depuis le {{ loan.loanDate }}
        </span>
          <span v-else>
            prêté à <strong>{{ loan.borrowerName }}</strong> - retourné le {{ loan.returnDate }}
        </span>

        </div>
        <button v-if="activeFilter === 'LENT'" class="btn" @click="returnBook(loan.id)">
          Marquer comme retourné
        </button>
        <!-- bouton retour uniquement pour les prêts en cours -->

      </div>
    </div>
  </div>
</template>

<style scoped>
.loans-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loan-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--text);
  border-radius: 20px;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text);
  transition: all 0.2s;
}
.filter-btn:hover{
  background-color: rgba(255, 255, 255, 0.5);
}
.filter-btn.active {
  background: var(--text);
  border-color: var(--bg);
  color: white;
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
}
button.btn{
  margin-bottom: 0;
}
.book-title {
  font-weight: bold;
  font-size: 1rem;
  text-decoration: none;
  color: var(--text);
}

.loan-info {
  font-size: 0.9rem;
  color: #444;
}

.loan-date {
  font-size: 0.85rem;
  color: #888;
}

.loading, .empty {
  color: #888;
  font-style: italic;
}
</style>