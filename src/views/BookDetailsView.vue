<script setup lang="ts">
import { useBookDetails } from '../composables/useBookDetails';
const { book, loading, toggleStatus, userStatus, isLoading, isEditingReview, returnBook, lend, loanStatus,
  users, selectedBorrowerId, showLendModal,
  cancelEditReview, startEditReview, submitReview, pendingComment, pendingRating, otherUsersReviews } = useBookDetails();
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
          <router-link :to="`/edit-book/${book.slug}`" class="lien">
            Modifier le livre
          </router-link>
          <h2>Fiche Technique</h2>
          <p><strong>isbn :</strong> {{ book.isbn }}</p>
          <p><strong>Série : </strong>
            <router-link v-if="book.series" :to="'/series/' + book.series?.slug" class="lien">
              {{ book.series.name}} ({{ book.series.status }})
            </router-link>
            <span v-else>Non</span>
          </p>
          <p><strong>Éditeur :</strong> <router-link :to="'/publisher/' + book.publisher?.slug" class="lien">{{ book.publisher?.name }}</router-link></p>
          <p><strong>Catégorie :</strong> <router-link :to="'/category/' + book.category?.slug" class="lien">{{ book.category?.name }}</router-link></p>
          <p><strong>Pages :</strong> {{ book.numberOfPages }}</p>
          <p><strong>Date de sortie :</strong> {{ book.publicationDate }}</p>
          <p><strong>Genre(s) :</strong> <span v-for="genre in book.genres" :key="genre.id">
            <router-link :to="'/genre/' + genre.slug" class="lien">
              {{ genre.name }}
            </router-link>
            &nbsp;</span></p>
          <p><strong>Auteur(s) : </strong>
            <span v-for="(a, index) in book.authors" :key="a.id">
              <router-link :to="'/author/' + a.slug" class="lien">
                {{ a.name }} <span class="author-role">({{ a.role.toLowerCase() }})</span>
              </router-link>
              <span v-if="index < book.authors.length - 1">, </span>
            </span>
          </p>
        </div>
      </div>
      <h3 v-if="book.description">Synopsis</h3>
      <p>{{ book.description }}</p>
    </section>

    <!-- Section Sociale (Interactions utilisateurs) -->
    <section>
      <p v-if="isLoading">Mise à jour en cours...</p>
      <div class="wrapper interUtil">
        <!-- 1. Possesseurs -->
        <div>
          <button @click="toggleStatus('isOwn')"
                  :class="['btn', userStatus.isOwn ? 'btn-vert' : 'btn-rouge']"
                  :disabled="loading || isLoading">
            <i v-if="userStatus.isOwn" class="fas fa-check"></i>
            {{ userStatus.isOwn ? 'Dans ma bibliothèque' : 'Ajouter à ma bibliothèque' }}
          </button>
          <div v-if="userStatus.isOwn">
            <div v-if="!loanStatus?.available">
              <p>Prêté à {{ loanStatus?.borrowerUsername }}</p>
              <button class="btn" @click="returnBook">Retourner</button>
            </div>
            <div v-else>
              <button class="btn" @click="showLendModal = true">Prêter</button>
            </div>
          </div>
          <h3><span>📚</span><br>Possédé par</h3>
          <div>
            <span v-for="bu in book.bookUsers.filter((u:any) => u.isOwn)" :key="bu.id">
              <router-link :to="'/user/' + bu.userSlug" class="lien">
                <span>{{ bu.username }}</span>
              </router-link>&nbsp;&nbsp;
            </span>
            <p v-if="book.bookUsers.filter((u:any) => u.isOwn).length === 0">Personne ne l'a encore.</p>
          </div>
        </div>
        <!-- 2. Lecteurs -->
        <div>
          <button @click="toggleStatus('isRead')"
                  :class="['btn', userStatus.isRead ? 'btn-vert' : 'btn-rouge']"
                  :disabled="loading || isLoading">
            {{ userStatus.isRead ? 'Livre lu' : 'Marquer comme lu' }}
          </button>
          <h3><span>📖</span><br>Lu par</h3>
          <div>
            <span v-for="bu in book.bookUsers.filter((u:any) => u.isRead)" :key="bu.userSlug">
              <router-link :to="'/user/' + bu.userSlug" class="lien">
              <span>{{ bu.username }}</span>
              </router-link>&nbsp;
            </span>
            <p v-if="book.bookUsers.filter((u:any) => u.isRead).length === 0">Pas encore de lecture.</p>
          </div>
        </div>
        <!-- 3. Wishlist -->
        <div>
          <button @click="toggleStatus('isInterested')"
                  :class="['btn', userStatus.isInterested ? 'btn-vert' : 'btn-rouge']"
                  :disabled="loading || isLoading">
            {{ userStatus.isInterested ? 'Dans la wishlist' : 'Ajouter à la whishlist' }}
          </button>
          <h3><span>✨</span><br>Voudrait le lire</h3>
          <div>
            <div v-for="bu in book.bookUsers.filter((u:any) => u.isInterested)" :key="bu.userSlug">
              <span>{{ bu.username }}</span>
            </div>
            <p v-if="book.bookUsers.filter((u:any) => u.isInterested).length === 0">Dans aucune wishlist.</p>
          </div>
        </div>
      </div>
      <!-- Avis et Notes -->

      <h3><span>★</span> Critiques et notes</h3>

      <!-- affiche le commentaire de l'utilisateur connecté (mais pas si il modifie/crée son avis) -->
      <div class="avisUtil" v-if="!isEditingReview">
        <p><strong>Mon commentaire :</strong></p>
        <div><span v-for="i in 5" :key="i">{{ i <= userStatus.rating ? '★' : '☆' }}</span></div>
        <p>{{ userStatus.comment || "Aucun commentaire" }}</p>
        <button class="btn" @click="startEditReview">
          {{ userStatus.rating || userStatus.comment ? "Modifier" : "Ajouter une note" }}
        </button>
      </div>

      <!-- Formulaire pour donner son avis + commentaires -->
      <div class="avisUtil" v-else>
        <input type="number" v-model="pendingRating" min="0" max="5" placeholder="Note (0-5)" />
        <textarea v-model="pendingComment" placeholder="Votre commentaire..." />
        <button @click="submitReview" :disabled="isLoading">Envoyer</button>
        <button @click="cancelEditReview">Annuler</button>
      </div>
      <!-- Avis + commentaires des autres utilisateurs -->
      <div>
        <div class="avisUtil" v-for="bu in otherUsersReviews.filter((u:any) => (u.rating || u.comment))" :key="bu.userSlug">
          <div>
            <span>{{ bu.username }}</span>
            <div><span v-for="i in 5" :key="i">{{ i <= bu.rating ? '★' : '☆' }}</span></div>
          </div>
          <p v-if="bu.comment">"{{ bu.comment }}"</p>
        </div>
      </div>

    </section>


    <!-- Modale -->
    <div v-if="showLendModal" class="modal" @click.self="showLendModal = false">
      <div>
        <h3>Prêter {{ book.title }} à :</h3>

        <select v-model="selectedBorrowerId">
          <option disabled value="">Choisir un utilisateur</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.username }}
          </option>
        </select>

        <div>
          <button class="btn" @click="showLendModal = false">Annuler</button>
          <button class="btn" :disabled="!selectedBorrowerId" @click="lend">Confirmer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
div.wrapper > div{
  text-align: left;
}
div.wrapper > div img{
  max-height: 280px;
  margin: 0 auto 15px auto;
  display: block;
  box-shadow: rgba(43, 40, 40, 0.33) 5px 3px 10px;
  border: 1px solid #959298;
}
div.wrapper p{
  margin: 10px 0;
  font-size: 16px;
}
div.wrapper.interUtil{
  margin: 25px 0;
  padding: 15px;
}
div.wrapper.interUtil > div, div.avisUtil{
  width: 90%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 10px;
  margin: 0 auto 10px auto;
}

</style>