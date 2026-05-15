import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import type { BookUserStatus } from '../types/BookUser';

// Si tu es dans un fichier .ts à part, il faut passer les IDs en arguments
export function useBookDetails(userId: number) {
    const route = useRoute();
    const book = ref<any>(null);
    const loading = ref(true); // État du chargement initial
    const isLoading = ref(false); // État pour le bouton (patch)
    userId = 4;// a modifié

    const userStatus = ref<BookUserStatus>({
        isOwn: false,
        isRead: false,
        isInterested: false,
        rating: 0,
        comment: ""
    });

    const fetchBookDetails = async () => {
        loading.value = true;
        try {
            const resUser = await axios.get(`http://localhost:8080/api/users/id/${userId}`);
            const userSlug = resUser.data.slug;

            const slug = route.params.slug;
            const res = await axios.get(`http://localhost:8080/api/books/${slug}`);
            book.value = res.data;

            if (res.data.bookUsers && res.data.bookUsers.length > 0) {
                const data = res.data.bookUsers.find(u => u.userSlug === userSlug)

                userStatus.value = {
                    isOwn: data.isOwn || false,
                    isRead: data.isRead || false,
                    isInterested: data.isInterested || false,
                    rating: data.rating || 0,
                    comment: data.comment || ""
                };
            }
        } catch (err) {
            console.error("Erreur détails livre:", err);
        } finally {
            loading.value = false;
        }
    };

    const toggleStatus = async (field: keyof BookUserStatus) => {
        if (!book.value) return;

        // On récupère la valeur actuelle
        const currentValue = userStatus.value[field];

        // Sécurité TypeScript : On vérifie explicitement que c'est un booléen
        if (typeof currentValue === 'boolean') {
            isLoading.value = true;
            const oldValue = currentValue;

            // On utilise un "as any" ou on réassigne proprement pour bypasser le verrou
            (userStatus.value[field] as boolean) = !oldValue;

            try {
                await axios.patch(
                    `http://localhost:8080/api/books/${book.value.id}/status/${userId}`,
                    userStatus.value
                );
                await fetchBookDetails();
            } catch (error) {
                (userStatus.value[field] as boolean) = oldValue;
                console.error("Erreur de synchronisation:", error);
            } finally {
                isLoading.value = false;
            }
        } else {
            console.warn(`Le champ ${field} n'est pas un booléen et ne peut pas être switché.`);
        }
    };

    onMounted(fetchBookDetails);

    return { book, loading, toggleStatus, userStatus, isLoading };
}