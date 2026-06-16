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
  <div class="pageForm">
    <h1>Ajouter un nouveau livre</h1>
    <!-- FORMULAIRE POUR L'AJOUT/LA MODIFICATION D'UN LIVRE-->
    <form @submit.prevent="submitBook">
      <!-- INPUT ISBN POUR LA RECHERCHE ET LE REMPLISSAGE VIA OPEN LIBRARY/GOOGLE BOOKS -->
      <div class="isbnSearch">
        <label>
          Pré-remplir via ISBN (Google Books / OpenLibrary)
        </label>
        <div class="isbn">
          <input v-model="isbnSearch" type="text" placeholder="Ex: 9782012345678" @keyup.enter="fetchByIsbn" >
          <button type="button" @click="fetchByIsbn" :disabled="isLoadingIsbn" >
            {{ isLoadingIsbn ? 'Recherche...' : 'Rechercher' }}
          </button>
        </div>
      </div>
      <!-- REMPLISSAGE/MODIFICATION MANUELLE : -->
      <!-- Titre -->
      <div class="field">
        <label>Titre*</label>
        <input v-model="bookForm.title" type="text" required>
      </div>
      <!-- isbn -->
      <div class="field">
        <label>ISBN</label>
        <input v-model="bookForm.isbn" type="text">
      </div>
      <!--Description -->
      <div class="field descr">
        <label>Synopsis/Description</label>
        <textarea v-model="bookForm.description" rows="5" placeholder="Écrivez le résumé du livre ici..."></textarea>
      </div>
      <!--Nombre de pages -->
      <div class="field">
        <label>Nombre de pages</label>
        <input v-model.number="bookForm.numberOfPages" type="number">
      </div>
      <!--Url de l'image -->
      <div class="field">
        <label>Lien URL de l'image de couverture</label>
        <input v-model="bookForm.coverUrl" type="text">
      </div>
      <div v-if="bookForm.coverUrl" class="imgCouv">
        <img :src="bookForm.coverUrl" alt="Couvrture">
      </div>
      <!--Date de publication -->
      <div class="field">
        <label>Date de publication</label>
        <input v-model="bookForm.publicationDate" type="date">
      </div>
      <!-- Catégorie -->
      <div class="field">
        <label>Catégorie*</label>
        <select v-model.number="bookForm.categoryId">
          <option :value="null">-- Choisir une catégorie --</option>
          <option v-for="cat in allCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <!-- Éditeur avec bouton "+" pour la modale -->
      <div class="field">
        <!-- Aide si l'éditeur de l'API n'a pas été matché -->
        <div class="aide" v-if="!bookForm.publisherId && isbnPublisherName">
          <p>
            Éditeur suggéré par l'API : <strong>{{ isbnPublisherName }}</strong><br>
            (cliquez sur + pour l'ajouter si il n'existe pas encore)
          </p>
        </div>
        <label>Éditeur</label>
        <div class="field-inline">
          <select v-model.number="bookForm.publisherId">
            <option :value="null">-- Choisir un éditeur --</option>
            <option v-for="pub in allPublishers" :key="pub.id" :value="pub.id">{{ pub.name }}</option>
          </select>
          <button type="button" @click="isPublisherModalOpen = true">+</button>
        </div>


      </div>
      <!-- Série -->
      <div class="field">
        <label>Série</label>
        <div  class="field-inline">
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
      <div class="field genres">
        <label>Genres</label>
        <!-- Checkboxes multiples -->
        <div class="allgenres">
          <div v-for="genre in allGenres" :key="genre.id">
            <input type="checkbox" :id="'genre-' + genre.id" :value="genre.id" v-model="bookForm.genreIds" />
            <label :for="'genre-' + genre.id">{{ genre.name }}</label>
          </div>
        </div>
        <p>{{ bookForm.genreIds.length }} genre(s) sélectionné(s)</p>
      </div>
      <!--Auteurs-->
      <div class="field">
          <h2>Auteurs*</h2>
          <!-- Aide visuelle si on vient de faire une recherche ISBN -->
          <div class="aide" v-if="foundAuthorsNames.length > 0">
            <p>Auteurs trouvés via la recherche ISBN :</p>
            <div>
              <span v-for="name in foundAuthorsNames" :key="name"><strong>{{ name }}</strong> / </span>
            </div>
            <p>Sélectionnez-les manuellement ci-dessous ou créez-les s'ils n'existent pas encore.</p>
          </div>
          <div class="rowAuthor">
          <button type="button" @click="addAuthorRow">+ Ajouter un auteur</button>
          <button type="button" @click="isAuthorModalOpen = true">+ Créer un nouvel auteur</button>
          </div>

        <div class="rowAuthor" v-for="(author, index) in bookForm.authors" :key="index">
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
  <div v-if="isAuthorModalOpen" @click.self="isAuthorModalOpen = false" class="modal">
    <div>
      <h2>Nouvel Auteur</h2>
      <div class="aide" v-if="foundAuthorsNames.length > 0">
        <p>Auteurs trouvés via la recherche ISBN :</p>
        <div>
          <span v-for="name in foundAuthorsNames" :key="name"><strong>{{ name }}</strong> / </span>
        </div>
      </div>
      <p>Veuillez écrire sous le format : Prénom Nom .</p>
      <p>Pour les pseudos, soit le pseudo seul soit : Pseudo (Prénom Nom)</p>
      <div>
        <input v-model="newAuthor.name" placeholder="Prénom Nom">
      </div>
      <div>
        <button @click="isAuthorModalOpen = false">Annuler</button>
        <button @click="createAuthor">Créer</button>
      </div>
    </div>
  </div>

  <!-- MODALE POUR AJOUTER UN NOUVEL ÉDITEUR EN DB -->
  <div v-if="isPublisherModalOpen" @click.self="isPublisherModalOpen = false" class="modal">
    <div>
      <h2>Nouvel Éditeur</h2>
      <div class="aide" v-if="!bookForm.publisherId && isbnPublisherName">
        <p>
          Éditeur suggéré par l'API : <strong>{{ isbnPublisherName }}</strong>
        </p>
      </div>
      <input v-model="newPublisher.name" placeholder="Nom de l'éditeur">
      <div>
        <button @click="isPublisherModalOpen = false">Annuler</button>
        <button @click="createPublisher">Créer</button>
      </div>
    </div>
  </div>

  <!-- MODALE POUR AJOUTER UNE NOUVELLE SÉRIE EN DB -->
  <div v-if="isSeriesModalOpen" @click.self="isSeriesModalOpen = false" class="modal">
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
div.pageForm{
  width: 100%;
  max-width: 1000px;
  margin: 15px auto;
}
div.isbnSearch{
  background-color: rgba(255, 255, 255, 0.4);
  border: 1px solid white;
  padding: 20px 10px 10px 10px;
  border-radius: 10px;
  margin-bottom: 20px;
}
form{
  width: 500px;
  margin: 15px auto;
  max-width: 100%;
}
div.field{
  margin: 8px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}
div.isbn{
  margin: 12px 0 4px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
div.imgCouv{
  margin-bottom: 25px;
}
div.imgCouv >img {
  width: 150px;
  aspect-ratio: 2/3;
  max-width: 100%;
  border: 1px solid white;
  border-radius: 3px;
  box-shadow: rgba(43, 40, 40, 0.33) 5px 3px 10px;

}
textarea{
  width: 100%;
  padding: 3px 5px;
  border-radius: 8px;
}
div.field.genres{
  display: block;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid white;
  border-radius: 10px;
  padding: 10px;
}
h2{
display: block;
  margin: 15px auto 6px auto;
}
div.rowAuthor{
  display: flex;
  width: 100%;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 10px 0 2px 0;
}
div.aide{
  display: block;
  width: 100%;
  text-align: center;
  background-color: rgba(0, 93, 136, 0.09);
  border: 1px solid var(--text-h);
  border-radius: 10px;
  padding: 7px;
  margin-bottom: 15px;
}
div.allgenres{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 10px 0;
}
div.modal input, div.modal button, div.modal select{
  font-size: 16px;
  padding: 3px 5px;
  margin: 5px;
  border-radius: 5px;
}
</style>