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

interface UserProfile {
    id: number;
    username: string;
    slug: string;
    dateOfBirth?: string;
    books: Book[];
}

export function useUserProfile() {
    const route = useRoute();
    const profile = ref<UserProfile | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    const fetchProfile = async () => {
        loading.value = true;
        error.value = null;
        try {
            const slug = route.params.slug as string;
            const res = await axios.get(`/api/users/${slug}`);
            profile.value = res.data;
        } catch (err:any) {
            error.value = "Utilisateur introuvable.";
            console.error(err);
            if (err.response?.status === 404 || !err.response) {
                await router.push({name: 'Home'});
            }
        } finally {
            loading.value = false;
        }
    };

    onMounted(fetchProfile);

    return { profile, loading, error };
}