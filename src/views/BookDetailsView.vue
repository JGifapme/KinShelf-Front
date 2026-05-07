<script setup lang="ts">
import { useBookDetails } from '../composables/useBookDetails';
const { book, loading } = useBookDetails();
</script>

<template>
  <div v-if="loading" class="text-center p-10 font-bold">Chargement des données...</div>

  <div v-else-if="book">
    <section>
      <h1>{{ book.title }}</h1>

      <div class="wrapper">
        <!-- Colonne 1 : Image -->
        <div v-if="book.coverUrl">
          <img v-if="book.coverUrl" :src="book.coverUrl" alt="Couverture">
          <div v-else>Pas de couverture</div>
        </div>
        <!-- Colonne 2 : Infos techniques -->
        <div>
          <h2>Fiche Technique</h2>
          <p><strong>Série : </strong>
            <router-link v-if="book.series" :to="'/series/' + book.series?.id">
              {{ book.series.name}} ({{ book.series.status }})
            </router-link>
            <span v-else>One-shot</span>
          </p>
          <p><strong>Éditeur :</strong> {{ book.publisher?.name }}</p>
          <p><strong>Catégorie :</strong> {{ book.category?.name }}</p>
          <p><strong>Pages :</strong> {{ book.numberOfPages }}</p>
          <p><strong>Date de sortie :</strong> {{ book.publicationDate }}</p>
          <p><strong>Genre(s) :</strong> <span v-for="genre in book.genres" :key="genre.id">{{ genre.name }}&nbsp;</span></p>
          <p><strong>Auteur(s) : </strong>
            <span v-for="(a, index) in book.authors" :key="a.id">
              <router-link :to="'/author/' + a.id">
                {{ a.fullName }} <span class="author-role">({{ a.role.toLowerCase() }})</span>
              </router-link>
              <span v-if="index < book.authors.length - 1">, </span>
            </span>
          </p>
        </div>
      </div>
      <h3>Synopsis</h3>
      <p>{{ book.description }}</p>
    </section>
    <!-- Section Sociale (Interactions utilisateurs) -->
    <section>
      <div class="wrapper interUtil">
        <!-- 1. Possesseurs -->
        <div>
          <h3><span>📚</span><br>Possédé par</h3>
          <div>
            <div v-for="bu in book.bookUsers.filter(u => u.isOwn)" :key="bu.userId">
              <span>{{ bu.userName }}</span>
            </div>
            <p v-if="book.bookUsers.filter(u => u.isOwn).length === 0">Personne ne l'a encore.</p>
          </div>
        </div>
        <!-- 2. Lecteurs -->
        <div>
          <h3><span>📖</span><br>Lu par</h3>
          <div>
            <div v-for="bu in book.bookUsers.filter(u => u.isRead)" :key="bu.userId">
              <span>{{ bu.userName }}</span>
            </div>
            <p v-if="book.bookUsers.filter(u => u.isRead).length === 0">Pas encore de lecture.</p>
          </div>
        </div>
        <!-- 3. Wishlist -->
        <div>
          <h3><span>✨</span><br>Voudrait le lire</h3>
          <div>
            <div v-for="bu in book.bookUsers.filter(u => u.isInterested)" :key="bu.userId">
              <span>{{ bu.userName }}</span>
            </div>
            <p v-if="book.bookUsers.filter(u => u.isInterested).length === 0">Dans aucune wishlist.</p>
          </div>
        </div>
      </div>
      <!-- Avis et Notes -->

      <h3><span>★</span> Critiques et notes</h3>
      <div>
        <div v-for="bu in book.bookUsers.filter(u => u.rating || u.comment)" :key="bu.userId">
          <div>
            <span>{{ bu.userName }}</span>
            <div><span v-for="i in 5" :key="i">{{ i <= bu.rating ? '★' : '☆' }}</span></div>
          </div>
          <p v-if="bu.comment">"{{ bu.comment }}"</p>
        </div>
      </div>


    </section>

  </div>
</template>

<style scoped>
div.wrapper{
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  gap: 25px;
  margin-bottom: 25px;

}
div.wrapper > div{
  text-align: left;
}
div.wrapper p{
  margin: 10px 0;
  font-size: 16px;
}
div.wrapper.interUtil{
  margin: 25px 0;
}
div.wrapper.interUtil > div{
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background-color: rgba(255, 255, 255, 0.2);
  padding: 10px;
}
</style>