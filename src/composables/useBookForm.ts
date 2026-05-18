import {reactive, ref, onMounted, computed} from 'vue';
import {useRoute, useRouter} from "vue-router";
import axios from 'axios';

export function useBookForm() {
    // 1. État du formulaire
    const bookForm = reactive({
        id: '',
        title: '',
        slug: '',
        isbn: '',
        description: '',
        numberOfPages: null as number | null,
        coverUrl: '',
        publicationDate: '',
        publisherId: null as number | null,
        categoryId: null as number | null,
        seriesId: null as number | null,
        authors: [] as { authorId: number, role: string }[],
        genreIds: [] as number[]
    });

    // 2. Listes pour les menus déroulants
    const allAuthors = ref<any[]>([]);
    const allPublishers = ref<any[]>([]);
    const allCategories = ref<any[]>([]);
    const allSeries = ref<any[]>([]);
    const allGenres = ref<any[]>([]);

    // 3. États pour l'ISBN et les suggestions
    const isbnSearch = ref('');
    const isLoadingIsbn = ref(false);
    const foundAuthorsNames = ref<string[]>([]);
    const isbnPublisherName = ref(''); // Nom brut reçu de l'API

    // 4. États des modales
    const isAuthorModalOpen = ref(false);
    const isPublisherModalOpen = ref(false);
    const isSeriesModalOpen = ref(false);

    // 5. nouveau éléments
    const newAuthor = reactive({ name: ''});
    const newSeries = reactive({
        name: '',
        status: 'EN_COURS' // Valeur par défaut
    });
    const newPublisher = reactive({ name: ''});

    const route = useRoute();
    const router = useRouter();
    // Calculer si on est en mode édition
    const isEditMode = computed(() => !!route.params.slug);

    // --- CHARGEMENT INITIAL ---
    onMounted(async () => {
        try {
            const [auth, pub, cat, gen, ser] = await Promise.all([
                axios.get('http://localhost:8080/api/authors').then(res => res.data),
                axios.get('http://localhost:8080/api/publishers').then(res => res.data),
                axios.get('http://localhost:8080/api/categories').then(res => res.data),
                axios.get('http://localhost:8080/api/genres').then(res => res.data),
                axios.get('http://localhost:8080/api/series').then(res => res.data)
            ]);
            allAuthors.value = auth;
            allPublishers.value = pub;
            allCategories.value = cat;
            allGenres.value = gen;
            allSeries.value = ser;
        } catch (err) {
            console.error("Erreur lors du chargement des données", err);
        }
        if (isEditMode.value) {
            // Si on a un slug, on va chercher les infos sur le serveur
            try {
                const slug = route.params.slug;
                //alert('slug : '+slug);
                const res = await axios.get(`http://localhost:8080/api/books/${slug}`);
                const data = res.data;
                    // Remplissage auto
                    bookForm.id = data.id || '';
                    bookForm.title = data.title || '';
                    bookForm.slug = data.slug || '';
                    bookForm.isbn = data.isbn || '';
                    bookForm.description = data.description || '';
                    bookForm.numberOfPages = data.numberOfPages || null;
                    bookForm.coverUrl = data.coverUrl || '';
                    bookForm.publicationDate = data.publicationDate || '';
                    bookForm.categoryId = data.category?.id || null;
                    bookForm.publisherId = data.publisher?.id || null;
                    bookForm.seriesId = data.series?.id || null;
                    bookForm.authors = (data.authors as any[]).map((a: any) => ({
                        authorId: a.id,
                        role: a.role
                    }));
                    bookForm.genreIds = (data.genres as any[]).map((g: any) => g.id) || [];
            } catch (err: any) {
                alert(err.response?.data?.message || "Erreur lors de la récupération des données.");
            } finally {
                isLoadingIsbn.value = false;
            }
        }
    });

    // --- LOGIQUE DE NETTOYAGE POUR LE MATCHING ---
    const cleanName = (name: string) => {
        return name.toLowerCase()
            .replace(/s\.a\.|ltd|inc|publishing|éditions|editions|group|groupe|media|média/g, '')
            .trim();
    };

    // --- MATCHING ÉDITEUR ---
    const matchPublisherAutomatically = (apiName: string) => {
        isbnPublisherName.value = apiName;
        const cleanedApiName = cleanName(apiName);

        const found = allPublishers.value.find(p => {
            const cleanedLocalName = cleanName(p.name);
            return cleanedApiName.includes(cleanedLocalName) || cleanedLocalName.includes(cleanedApiName);
        });

        if (found) {
            bookForm.publisherId = found.id;
        } else {
            bookForm.publisherId = null;
        }
    };

    // --- MATCHING AUTEURS ---
    const matchAuthorsAutomatically = (names: string[]) => {
        foundAuthorsNames.value = names;
        names.forEach(name => {
            const apiNameClean = name.toLowerCase();
            const found = allAuthors.value.find(a =>
                apiNameClean.includes(a.name.toLowerCase())
            );

            if (found && !bookForm.authors.find(ba => ba.authorId === found.id)) {
                bookForm.authors.push({ authorId: found.id, role: 'AUTEUR' });
            }
        });
    };

    // --- RECHERCHE ISBN ---
    const fetchByIsbn = async () => {
        if (!isbnSearch.value) return;
        isLoadingIsbn.value = true;
        foundAuthorsNames.value = [];
        isbnPublisherName.value = '';

        try {
            const res = await axios.get(`http://localhost:8080/api/isbn/${isbnSearch.value}`);
            const data = res.data;
                // Remplissage auto
                bookForm.title = data.title || '';
                bookForm.description = data.description || '';
                bookForm.numberOfPages = data.pageCount || null;
                bookForm.coverUrl = data.imageUrl || '';
                bookForm.publicationDate = data.publicationDate || '';

                // Lancement des matchings
                if (data.publisher) matchPublisherAutomatically(data.publisher);
                if (data.authors) matchAuthorsAutomatically(data.authors);
        } catch (err: any) {
            alert(err.response?.data?.message || "Erreur avec l'isbn.");
        } finally {
            isLoadingIsbn.value = false;
        }
    };

    const submitBook = async () => {
        try {
            const res = isEditMode.value
                ? await axios.patch(`http://localhost:8080/api/books/${bookForm.id}`, bookForm)
                : await axios.post('http://localhost:8080/api/books', bookForm);

            console.log(res.data);
            alert('Livre enregistré !');
            router.push(`/book/${res.data.slug}`);
        } catch (err: any) {
            alert(err.response?.data?.message || "Une erreur est survenue.");
        }
    };

    // 4. Actions
    const addAuthorRow = () => {
        bookForm.authors.push({ authorId: 0, role: 'AUTEUR' });
    };
    const removeAuthorRow = (index: number) => {
        bookForm.authors.splice(index, 1);
    };
    const createAuthor = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/authors', newAuthor);
            allAuthors.value.push(res.data);
            isAuthorModalOpen.value = false;
            newAuthor.name = '';
        } catch (err: any) {
            alert(err.response?.data?.message || "Une erreur est survenue.");
        }
    };
    const createPublisher = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/publishers', newPublisher);
            allPublishers.value.push(res.data);
            bookForm.publisherId = res.data.id;
            isPublisherModalOpen.value = false;
            newPublisher.name = '';
        } catch (err: any) {
            alert(err.response?.data?.message || "Une erreur est survenue.");
        }
    };
    // 3. Action pour créer la série
    const createSeries = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/series', newSeries);
            allSeries.value.push(res.data);
            bookForm.seriesId = res.data.id;
            isSeriesModalOpen.value = false;
            newSeries.name = '';
            newSeries.status = 'EN_COURS';
        } catch (err: any) {
            alert(err.response?.data?.message || "Une erreur est survenue.");
        }
    };

    // On expose uniquement ce que le HTML doit voir
    return {
        bookForm, allAuthors, isAuthorModalOpen, newAuthor, addAuthorRow, removeAuthorRow,
        createAuthor, submitBook, createPublisher, allGenres, allCategories, allPublishers,
        isPublisherModalOpen, newPublisher, allSeries, isSeriesModalOpen, newSeries,
        createSeries, isbnSearch, isLoadingIsbn, fetchByIsbn, foundAuthorsNames, isbnPublisherName
    };
}