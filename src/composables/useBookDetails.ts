import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export function useBookDetails() {
    const route = useRoute();
    const book = ref<any>(null);
    const loading = ref(true);

    const fetchBookDetails = async () => {
        try {
            const slug = route.params.slug;
            const res = await fetch(`http://localhost:8080/api/books/${slug}`);
            if (res.ok) {
                book.value = await res.json();
            }
        } catch (err) {
            console.error("Erreur détails livre:", err);
        } finally {
            loading.value = false;
        }
    };

    onMounted(fetchBookDetails);

    return { book, loading };
}