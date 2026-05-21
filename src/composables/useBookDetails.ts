import {ref, onMounted, computed} from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';
import axios from 'axios';
import type { BookUserStatus } from '../types/BookUser';
import router from "../router";

export function useBookDetails() {
    const route = useRoute();
    const book = ref<any>(null);
    const loading = ref(true); // État du chargement initial
    const isLoading = ref(false); // État pour le bouton (patch)
    const isEditingReview = ref(false); // mode édition activé ou non
    const pendingRating = ref(0); // valeur temporaire pendant l'édition
    const pendingComment = ref(""); // valeur temporaire pendant l'édition

    //on récupère le slug (unique) de l'utilisateur connecté grâce à son jeton jwt
    const authStore = useAuthStore();
    //const userId = authStore.user?.id; récupérer l'id si nécessaire
    const userSlug = authStore.user?.slug;

    //initialisation du user status (lu, possédé, ...)
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
            //on récupère les données du livre avec les données de lecture/possession des différents utilisateurs
            const slug = route.params.slug;
            const res = await axios.get(`http://localhost:8080/api/books/${slug}`);
            book.value = res.data;

            if (res.data.bookUsers && res.data.bookUsers.length > 0) {
                //on récupère les infos de lecture/possession, ... de l'utilisateur connecté
                const data = res.data.bookUsers.find((u:any) => u.userSlug === userSlug)
                userStatus.value = {
                    isOwn: data.isOwn || false,
                    isRead: data.isRead || false,
                    isInterested: data.isInterested || false,
                    rating: data.rating || 0,
                    comment: data.comment || ""
                };
            }
        } catch (err : any) {
            alert(err.response?.data?.message || "Une erreur est survenue.");
            //si le livre n'est pas trouvé pour cette url, renvoie vers la page d'accueil.
            if (err.response?.status === 404 || !err.response) {
                await router.push({name: 'Home'});
            }
        } finally {
            loading.value = false;
        }
    };

    const toggleStatus = async (field: keyof BookUserStatus) => {
        if (!book.value) return;

        // On récupère la valeur actuelle : lu/pas lu, ...
        const currentValue = userStatus.value[field];

        // Sécurité TypeScript : On vérifie explicitement que c'est un booléen
        if (typeof currentValue === 'boolean') {
            isLoading.value = true;
            const oldValue = currentValue;

            // On utilise un "as any" ou on réassigne proprement pour bypasser le verrou
            (userStatus.value[field] as boolean) = !oldValue;

            try {
                await axios.patch(
                    // pour cet endpoint le back-end récupère l'utilisateur connecté via le jwt token
                    // on ne doit pas préciser l'utilisateur dans le front
                    `http://localhost:8080/api/books/${book.value.id}/status`,
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
    const startEditReview = () => {
        // On copie les valeurs actuelles dans les champs temporaires
        pendingRating.value = userStatus.value.rating;
        pendingComment.value = userStatus.value.comment;
        isEditingReview.value = true;
    };

    const cancelEditReview = () => {
        isEditingReview.value = false;
    };

    const submitReview = async () => {
        if (!book.value) return;
        isLoading.value = true;
        try {
            await axios.patch(
                // pour cet endpoint le back-end récupère l'utilisateur connecté via le jwt token
                // on ne doit pas préciser l'utilisateur dans le front
                `http://localhost:8080/api/books/${book.value.id}/status`,
                {
                    ...userStatus.value,       // on garde les booléens existants
                    rating: pendingRating.value, // et on met à jour la note et le commentaire
                    comment: pendingComment.value
                }
            );
            await fetchBookDetails();
            isEditingReview.value = false;
        } catch (error) {
            console.error("Erreur lors de l'envoi de la note:", error);
        } finally {
            isLoading.value = false;
        }
    };

    const otherUsersReviews = computed(() =>
        book.value?.bookUsers.filter((u:any) =>
            (u.rating || u.comment) && u.userSlug !== userSlug
        ) ?? []
    );

    onMounted(fetchBookDetails);

    return { book, loading, toggleStatus, userStatus, isLoading,
        isEditingReview, pendingRating, pendingComment,
        startEditReview, cancelEditReview, submitReview, otherUsersReviews };
}