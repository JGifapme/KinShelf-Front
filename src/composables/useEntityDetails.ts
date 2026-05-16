import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

interface Book {
    id: number;
    title: string;
    slug: string;
    coverUrl: string;
}

interface EntityDetails {
    id: number;
    name: string;
    books: Book[];
}

const ENTITY_ENDPOINTS: Record<string, string> = {
    author: 'authors',
    publisher: 'publishers',
    genre: 'genres',
    series: 'series',
    category: 'categories'
};

export function useEntityDetails() {
    const route = useRoute();
    const entity = ref<EntityDetails | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    const fetchEntity = async () => {
        loading.value = true;
        error.value = null;

        try {
            const type = route.params.type as string;
            const slug = route.params.slug as string;
            const endpoint = ENTITY_ENDPOINTS[type];

            if (!endpoint) {
                error.value = "Type introuvable.";
                return;
            }

            const res = await axios.get(`http://localhost:8080/api/${endpoint}/${slug}`);
            entity.value = res.data;
        } catch (err) {
            error.value = "Erreur lors du chargement.";
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    onMounted(fetchEntity);

    return { entity, loading, error };
}