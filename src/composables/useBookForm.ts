import { reactive, ref, onMounted } from 'vue';

export function useBookForm() {
    // 1. État du formulaire
    const bookForm = reactive({
        title: '',
        description: '',
        numberOfPages: 0,
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


    // --- LOGIQUE DE NETTOYAGE POUR LE MATCHING ---
    const cleanName = (name: string) => {
        return name.toLowerCase()
            .replace(/s\.a\.|ltd|inc|publishing|éditions|editions|group|media/g, '')
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
            if (res.ok) {
                const data = await res.json();

                // Remplissage auto
                bookForm.title = data.title || '';
                bookForm.description = data.description || '';
                bookForm.numberOfPages = data.pageCount || 0;
                bookForm.coverUrl = data.imageUrl || '';
                bookForm.publicationDate = data.publicationDate || '';

                // Lancement des matchings
                if (data.publisher) matchPublisherAutomatically(data.publisher);
                if (data.authors) matchAuthorsAutomatically(data.authors);
            }
        } catch (err) {
            console.error("Erreur ISBN:", err);
        } finally {
            isLoadingIsbn.value = false;
        }
    };


    const submitBook = async () => {
        const res = await fetch('http://localhost:8080/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookForm)
        });
        if (res.ok) alert('Livre enregistré !');
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
        if (res.ok) {
            const created = await res.json();
            allAuthors.value.push(created);
            isAuthorModalOpen.value = false;
            newAuthor.firstName = '';
            newAuthor.lastName = '';
        }
    };
    const createPublisher = async () => {
        const res = await fetch('http://localhost:8080/api/publishers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPublisher)
        });
        if (res.ok) {
            const created = await res.json();
            allPublishers.value.push(created);
            bookForm.publisherId = created.id; // On le sélectionne direct !
            isPublisherModalOpen.value = false;
            newPublisher.name = '';
        }
    };
    // 3. Action pour créer la série
    const createSeries = async () => {
        const res = await fetch('http://localhost:8080/api/series', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSeries)
        });
        if (res.ok) {
            const created = await res.json();
            allSeries.value.push(created);
            bookForm.seriesId = created.id; // On la sélectionne direct
            isSeriesModalOpen.value = false;
            newSeries.name = '';
            newSeries.status = 'EN_COURS';
        }
    };

    // --- CHARGEMENT INITIAL ---
    const fetchInitialData = async () => {
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
            console.error("Erreur chargement données", err);
        }
    };

    onMounted(fetchInitialData);

    // On expose uniquement ce que le HTML doit voir
    return {
        bookForm, allAuthors, isAuthorModalOpen, newAuthor, addAuthorRow, removeAuthorRow,
        createAuthor, submitBook, createPublisher, allGenres, allCategories, allPublishers,
        isPublisherModalOpen, newPublisher, allSeries, isSeriesModalOpen, newSeries,
        createSeries, isbnSearch, isLoadingIsbn, fetchByIsbn, foundAuthorsNames, isbnPublisherName
    };
}