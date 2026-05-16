<script setup lang="ts">
import { useBookForm } from '../composables/useBookForm';

const {
  bookForm, allAuthors, isAuthorModalOpen, newAuthor, foundAuthorsNames,
  addAuthorRow, removeAuthorRow, createAuthor, submitBook, allCategories, isbnPublisherName,
  allPublishers, allGenres, createPublisher, isPublisherModalOpen, newPublisher,
    allSeries, isSeriesModalOpen, createSeries, newSeries, isbnSearch, isLoadingIsbn, fetchByIsbn
} = useBookForm();
</script>

<template>
  <div>
    <h1>Ajouter un nouveau livre</h1>
    <!-- FORMULAIRE POUR L'AJOUT/LA MODIFICATION D'UN LIVRE-->
    <form @submit.prevent="submitBook">
      <!-- INPUT ISBN POUR LA RECHERCHE ET LE REMPLISSAGE VIA OPEN LIBRARY/GOOGLE BOOKS -->
      <div>
        <label>
          Pré-remplir via ISBN (Google Books / OpenLibrary)
        </label>
        <div>
          <input v-model="isbnSearch" type="text" placeholder="Ex: 9782012345678" @keyup.enter="fetchByIsbn" >
          <button type="button" @click="fetchByIsbn" :disabled="isLoadingIsbn" >
            {{ isLoadingIsbn ? 'Recherche...' : 'Rechercher' }}
          </button>
        </div>
      </div>
      <!-- REMPLISSAGE/MODIFICATION MANUELLE : -->
      <!-- Titre -->
      <div>
        <label>Titre*</label>
        <input v-model="bookForm.title" type="text" required>
      </div>
      <!-- isbn -->
      <div>
        <label>isbn</label>
        <input v-model="bookForm.isbn" type="text">
      </div>
      <!--Description -->
      <div>
        <label>Synopsis/Description</label>
        <input v-model="bookForm.description" type="text">
      </div>
      <!--Nombre de pages -->
      <div>
        <label>Nombre de pages</label>
        <input v-model.number="bookForm.numberOfPages" type="number">
      </div>
      <!--Url de l'image -->
      <div>
        <label>Lien URL de l'image de couverture</label>
        <input v-model="bookForm.coverUrl" type="text">
      </div>
      <!--Date de publication -->
      <div>
        <label>Date de publication</label>
        <input v-model="bookForm.publicationDate" type="date">
      </div>
      <!-- Catégorie -->
      <div>
        <label>Catégorie*</label>
        <select v-model.number="bookForm.categoryId">
          <option :value="null">-- Choisir une catégorie --</option>
          <option v-for="cat in allCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <!-- Éditeur avec bouton "+" pour la modale -->
      <div>
        <label>Éditeur</label>
        <div>
          <select v-model.number="bookForm.publisherId">
            <option :value="null">-- Choisir un éditeur --</option>
            <option v-for="pub in allPublishers" :key="pub.id" :value="pub.id">{{ pub.name }}</option>
          </select>
          <button type="button" @click="isPublisherModalOpen = true">+</button>
        </div>

        <!-- Aide si l'éditeur de l'API n'a pas été matché -->
        <p v-if="!bookForm.publisherId && isbnPublisherName">
          Suggéré par l'API : <strong>{{ isbnPublisherName }}</strong>
          (cliquez sur + pour l'ajouter)
        </p>
      </div>
      <!-- Série -->
      <div>
        <label>Série</label>
        <div>
          <select v-model.number="bookForm.seriesId">
            <option :value="null">-- Aucune série --</option>
            <option v-for="s in allSeries" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
          <button type="button" @click="isSeriesModalOpen = true">+</button>
        </div>
      </div>
      <!--Genres -->
      <div>
        <label>Genres</label>
        <!-- Checkboxes multiples -->
        <div>
          <div v-for="genre in allGenres" :key="genre.id">
            <input type="checkbox" :id="'genre-' + genre.id" :value="genre.id" v-model="bookForm.genreIds" />
            <label :for="'genre-' + genre.id">{{ genre.name }}</label>
          </div>
        </div>
        <p>{{ bookForm.genreIds.length }} genre(s) sélectionné(s)</p>
      </div>
      <!--Auteurs-->
      <div>
        <div>
          <h2>Auteurs*</h2>
          <button type="button" @click="addAuthorRow">+ Ajouter un auteur</button>
          <button type="button" @click="isAuthorModalOpen = true">+ Créer un nouvel auteur</button>
        </div>

        <!-- Aide visuelle si on vient de faire une recherche ISBN -->
        <div v-if="foundAuthorsNames.length > 0">
          <p>Auteurs trouvés via la recherche ISBN :</p>
          <div>
          <span v-for="name in foundAuthorsNames" :key="name">{{ name }}</span>
          </div>
          <p>Sélectionnez-les manuellement ci-dessous ou créez-les s'ils n'existent pas encore.</p>
        </div>

        <div v-for="(author, index) in bookForm.authors" :key="index">
          <select v-model.number="author.authorId">
            <option disabled value="0">Choisir un auteur</option>
            <option v-for="a in allAuthors" :key="a.id" :value="a.id">
              {{ a.name }}
            </option>
          </select>
          <div>
            <label>Rôle</label>
            <select v-model="author.role">
              <option value="AUTEUR">Auteur</option>
              <option value="SCENARISTE">Scénariste</option>
              <option value="DESSINATEUR">Dessinateur</option>
              <option value="ILLUSTRATEUR">Illustrateur</option>
              <option value="COLORISTE">Coloriste</option>
              <option value="AUTEUR_COMPLET">Auteur complet</option>
            </select>
          </div>
          <button type="button" @click="removeAuthorRow(index)"> ✕ </button>
        </div>
      </div>

      <button type="submit">Enregistrer le livre</button>
    </form>
  </div>
  <!-- MODALE POUR AJOUTER UN NOUVEL AUTEUR EN DB -->
  <div v-if="isAuthorModalOpen" class="modal">
    <div>
      <h2>Nouvel Auteur</h2>
      <div>
        <input v-model="newAuthor.name" placeholder="Nom">
      </div>
      <div>
        <button @click="isAuthorModalOpen = false">Annuler</button>
        <button @click="createAuthor">Créer</button>
      </div>
    </div>
  </div>

  <!-- MODALE POUR AJOUTER UN NOUVEL ÉDITEUR EN DB -->
  <div v-if="isPublisherModalOpen" class="modal">
    <div>
      <h2>Nouvel Éditeur</h2>
      <input v-model="newPublisher.name" placeholder="Nom de l'éditeur">
      <div>
        <button @click="isPublisherModalOpen = false">Annuler</button>
        <button @click="createPublisher">Créer</button>
      </div>
    </div>
  </div>

  <!-- MODALE POUR AJOUTER UNE NOUVELLE SÉRIE EN DB -->
  <div v-if="isSeriesModalOpen" class="modal">
    <div>
      <h2>Nouvelle Série</h2>
      <label>Nom</label>
      <input v-model="newSeries.name" placeholder="Titre de la série">
      <br>
      <label>Statut</label>
      <select v-model="newSeries.status">
        <option value="EN_COURS">En cours</option>
        <option value="FINIE">Finie</option>
        <option value="ARRET">Arrêtée</option>
      </select>
      <div>
        <button @click="isSeriesModalOpen = false">Annuler</button>
        <button @click="createSeries">Créer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>