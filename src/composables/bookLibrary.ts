import {ref, onMounted, watch, computed} from 'vue'
import axios from 'axios'
import { useBookFilter } from '../stores/useBookFilter';


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
    defaultPublisherSlug?: string;
    defaultSortBy?: string;
    defaultUserStatus?: string;
}

export function bookLibrary(options: BookSearchOptions = {}, persist = false) {
    const filterStore = persist ? useBookFilter() : null;

    // si persist, on utilise le store, sinon des ref locaux
    const searchQuery = persist
        ? computed({ get: () => filterStore!.search, set: (v) => filterStore!.search = v })
        : ref('');

    const selectedGenre = persist
        ? computed({ get: () => filterStore!.selectedGenre, set: (v) => filterStore!.selectedGenre = v })
        : ref(options.defaultGenreSlug || '');

    const selectedCategory = persist
        ? computed({ get: () => filterStore!.selectedCategory, set: (v) => filterStore!.selectedCategory = v })
        : ref(options.defaultCategorySlug || '');

    const sortBy = persist
        ? computed({ get: () => filterStore!.sortBy, set: (v) => filterStore!.sortBy = v })
        : ref(options.defaultSortBy || 'a-z');

    const userStatus = persist
        ? computed({ get: () => filterStore!.userStatus, set: (v) => filterStore!.userStatus = v })
        : ref<string | null>(null);

    const currentPage = persist
        ? computed({ get: () => filterStore!.currentPage, set: (v) => filterStore!.currentPage = v })
        : ref(0);
    const selectedUser = ref(options.defaultUserSlug || '');
    const selectedPublisher = ref(options.defaultPublisherSlug || '');

    const books = ref<Book[]>([]) // liste de "Book"
    const genres = ref<any[]>([]);
    const users = ref<any[]>([]);
    const categories = ref<any[]>([]);
    const totalPages = ref(0);
    const totalElements = ref(0);

    const init = async () => {
        try {
            // On charge les genres, catégories et user d'abord
            const [genreRes, catRes, userRes] = await Promise.all([
                axios.get('/api/genres'),
                axios.get('/api/categories'),
                axios.get('/api/users')
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
                size: 50,
                sortBy: sortBy.value
            };
            // On prépare les paramètres pour l'URL
            if (searchQuery.value) params.search = searchQuery.value;
            if (selectedGenre.value) params.genreSlug = selectedGenre.value;
            if (selectedUser.value) params.userSlug = selectedUser.value;
            if (selectedCategory.value) params.categorySlug = selectedCategory.value;
            if (selectedPublisher.value) params.publisherSlug = selectedPublisher.value;
            if (userStatus.value !== null) params.userStatus = userStatus.value;


            const response = await axios.get('/api/books', { params });
            books.value = response.data.content; // on doit ajouter .content car le json renvoie les livres dans un []content
            totalPages.value = response.data.page.totalPages;
            totalElements.value = response.data.page.totalElements;
        } catch (error) {
            console.error("Erreur lors de la récupération des livres", error);
        }
    };

// dès que search change, on relance loadBooks
    let timeout: ReturnType<typeof setTimeout> | null = null;

    watch([searchQuery, selectedGenre, selectedUser, selectedCategory, sortBy, userStatus], () => {
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

    return {searchQuery, selectedCategory, selectedGenre, selectedUser, categories, sortBy, userStatus,
    genres, users, books, nextPage, prevPage, goToPage, totalPages, currentPage, totalElements
    };
}