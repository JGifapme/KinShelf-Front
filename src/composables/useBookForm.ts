import {reactive, ref, onMounted, computed} from 'vue';
import {useRoute, useRouter} from "vue-router";

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
    const newAuthor = reactive({ firstName: '', lastName: '' });
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
                fetch('http://localhost:8080/api/authors').then(res => res.json()),
                fetch('http://localhost:8080/api/publishers').then(res => res.json()),
                fetch('http://localhost:8080/api/categories').then(res => res.json()),
                fetch('http://localhost:8080/api/genres').then(res => res.json()),
                fetch('http://localhost:8080/api/series').then(res => res.json())
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
                const res = await fetch(`http://localhost:8080/api/books/${slug}`);
                const data = await res.json();
                if (res.ok) {
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
                }
                else {
                    alert(data.message);
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des données", err);
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
                apiNameClean.includes(a.lastName.toLowerCase()) ||
                apiNameClean.includes(a.firstName.toLowerCase())
            );

            if (found && !bookForm.authors.find(ba => ba.authorId === found.id)) {
                bookForm.authors.push({ authorId: found.id, role: 'SCENARISTE' });
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
            const res = await fetch(`http://localhost:8080/api/isbn/${isbnSearch.value}`);
            const data = await res.json();
            if (res.ok) {
                // Remplissage auto
                bookForm.title = data.title || '';
                bookForm.description = data.description || '';
                bookForm.numberOfPages = data.pageCount || null;
                bookForm.coverUrl = data.imageUrl || '';
                bookForm.publicationDate = data.publicationDate || '';

                // Lancement des matchings
                if (data.publisher) matchPublisherAutomatically(data.publisher);
                if (data.authors) matchAuthorsAutomatically(data.authors);
            }
            else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Erreur ISBN:", err);
        } finally {
            isLoadingIsbn.value = false;
        }
    };

    const submitBook = async () => {
        let res;
        if (isEditMode.value) {
            res = await fetch(`http://localhost:8080/api/books/${bookForm.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(bookForm)
            });
        }
        else {
            res = await fetch('http://localhost:8080/api/books', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(bookForm)
            });
        }
        const retourJson = await res.json();//récupère le json du livre créé ou de l'erreur éventuelle
        if (res.ok) {
            console.log(retourJson);
            alert('Livre enregistré !');
            router.push(`/book/${retourJson.slug}`);
        } else {
            alert(retourJson.message);
        }
    };

    // 4. Actions
    const addAuthorRow = () => {
        bookForm.authors.push({ authorId: 0, role: 'SCENARISTE' });
    };
    const removeAuthorRow = (index: number) => {
        bookForm.authors.splice(index, 1);
    };
    const createAuthor = async () => {
        const res = await fetch('http://localhost:8080/api/authors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAuthor)
        });
        const retourJson = await res.json();
        if (res.ok) {
            allAuthors.value.push(retourJson);
            isAuthorModalOpen.value = false;
            newAuthor.firstName = '';
            newAuthor.lastName = '';
        }
        else {
            alert(retourJson.message);
        }
    };
    const createPublisher = async () => {
        const res = await fetch('http://localhost:8080/api/publishers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPublisher)
        });
        const retourJson = await res.json();
        if (res.ok) {
            allPublishers.value.push(retourJson);
            bookForm.publisherId = retourJson.id; // On le sélectionne direct !
            isPublisherModalOpen.value = false;
            newPublisher.name = '';
        }
        else {
            alert(retourJson.message);
        }
    };
    // 3. Action pour créer la série
    const createSeries = async () => {
        const res = await fetch('http://localhost:8080/api/series', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSeries)
        });
        const retourJson = await res.json();
        if (res.ok) {
            allSeries.value.push(retourJson);
            bookForm.seriesId = retourJson.id; // On la sélectionne direct
            isSeriesModalOpen.value = false;
            newSeries.name = '';
            newSeries.status = 'EN_COURS';
        }
        else {
            alert(retourJson.message);
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