import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

interface Book {
    id: number;
    title: string;
    slug: string;
    coverUrl: string;
}

interface BookSearchOptions {
    defaultGenreSlug?: string;
    defaultCategorySlug?: string;
    defaultUserSlug?: string;
}

export function bookLibrary(options: BookSearchOptions = {}) {
// On définit une interface pour avoir de l'autocomplétion (comme une classe Java)

    const books = ref<Book[]>([]) // liste de "Book"
    const searchQuery = ref(''); // Lie cet état au champ input
    const genres = ref<any[]>([]);
    const users = ref<any[]>([]);
    const categories = ref<any[]>([]);
    const selectedGenre = ref(options.defaultGenreSlug || '');
    const selectedCategory = ref(options.defaultCategorySlug || '');
    const selectedUser = ref(options.defaultUserSlug || '');
    const currentPage = ref(0);
    const totalPages = ref(0);
    const totalElements = ref(0);

    const init = async () => {
        try {
            // On charge les genres, catégories et user d'abord
            const [genreRes, catRes, userRes] = await Promise.all([
                axios.get('http://localhost:8080/api/genres'),
                axios.get('http://localhost:8080/api/categories'),
                axios.get('http://localhost:8080/api/users')
            ]);
            genres.value = genreRes.data;
            categories.value = catRes.data;
            users.value = userRes.data;

            // Ensuite on charge les livres
            await loadBooks();
        } catch (error) {
            console.error("Erreur d'initialisation", error);
        }
    };

    const loadBooks = async () => {
        try {
            const params: Record<string, any> = {
                page: currentPage.value,
                size: 50
            };
            // On prépare les paramètres pour l'URL
            if (searchQuery.value) params.search = searchQuery.value;
            if (selectedGenre.value) params.genreSlug = selectedGenre.value;
            if (selectedUser.value) params.userSlug = selectedUser.value;
            if (selectedCategory.value) params.categorySlug = selectedCategory.value;

            const response = await axios.get('http://localhost:8080/api/books', {params});
            books.value = response.data.content;       // on doit ajouter .content car le json renvoie les livres dans un []content
            totalPages.value = response.data.page.totalPages;
            totalElements.value = response.data.page.totalElements;
        } catch (error) {
            console.error("Erreur lors de la récupération des livres", error);
        }
    };

// dès que search change, on relance loadBooks
    let timeout: ReturnType<typeof setTimeout> | null = null;

    watch([searchQuery, selectedGenre, selectedUser, selectedCategory], () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            currentPage.value = 0;
            loadBooks();
        }, 500);
    });

    watch(currentPage, loadBooks);

    const nextPage = () => { if (currentPage.value < totalPages.value - 1) currentPage.value++; };
    const prevPage = () => { if (currentPage.value > 0) currentPage.value--; };
    const goToPage = (page: number) => { currentPage.value = page; };

    onMounted(init);
    loadBooks();

    return {searchQuery, selectedCategory, selectedGenre, selectedUser, categories,
    genres, users, books, nextPage, prevPage, goToPage, totalPages, currentPage, totalElements
    };
}