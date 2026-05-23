import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import router from "../router";

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

//On déclare les différents chemin/url avec lesquels on accède a cette page ex: /series/le-seigneur-des-anneaux ou /author/herge
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

            const res = await axios.get(`/api/${endpoint}/${slug}`);
            entity.value = res.data;
        } catch (err:any) {
            alert(err.response?.data?.message || "Une erreur est survenue.");
            if (err.response?.status === 404 || !err.response) {
                await router.push({name: 'Home'});
            }
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    onMounted(fetchEntity);

    return { entity, loading, error };
}