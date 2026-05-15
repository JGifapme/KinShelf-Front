import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

export function bookLibrary() {
// On définit une interface pour avoir de l'autocomplétion (comme une classe Java)
    interface Book {
        id: number;
        title: string;
        slug: string;
        coverUrl?: string;
    }

    const books = ref<Book[]>([]) // liste de "Book"
    const searchQuery = ref(''); // Lie cet état au champ input
    const genres = ref<any[]>([]);
    const selectedGenre = ref(''); // Stocke le slug sélectionné
    const users = ref<any[]>([]);
    const selectedUser = ref(''); // Stocke le slug sélectionné
    const categories = ref<any[]>([]);
    const selectedCategory = ref(''); // Stocke le slug sélectionné

// 1. Charger les catégories au montage
    onMounted(async () => {
        try {
            // On charge les genres, catégories et user d'abord
            const genreRes = await axios.get('http://localhost:8080/api/genres');
            genres.value = genreRes.data;

            const catRes = await axios.get('http://localhost:8080/api/categories');
            categories.value = catRes.data;

            const userRes = await axios.get('http://localhost:8080/api/users');
            users.value = userRes.data;

            // Ensuite on charge les livres
            await loadBooks();
        } catch (error) {
            console.error("Erreur d'initialisation", error);
        }
    });

    const loadBooks = async () => {
        try {
            // On prépare les paramètres pour l'URL
            const params: any = {};
            if (searchQuery.value) params.search = searchQuery.value;
            if (selectedGenre.value) params.genreSlug = selectedGenre.value;
            if (selectedUser.value) params.userSlug = selectedUser.value;
            if (selectedCategory.value) params.categorySlug = selectedCategory.value;

            const response = await axios.get('http://localhost:8080/api/books', {params});
            books.value = response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des livres", error);
        }
    };

    let timeout: any;
// dès que search change, on relance loadBooks
    watch([searchQuery, selectedGenre, selectedUser, selectedCategory], () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            loadBooks();
        }, 500); // Attend 500ms avant de lancer la recherche
    });
    return {searchQuery, selectedCategory, selectedGenre, selectedUser, categories,
    genres, users, books
    };
}