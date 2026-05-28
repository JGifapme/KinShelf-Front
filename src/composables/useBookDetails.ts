import {ref, onMounted, computed} from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';
import axios from 'axios';
import type { BookUserStatus } from '../types/BookUser';
import router from "../router";

interface LoanStatus {
    available: boolean;
    loanId: number | null;
    borrowerUsername: string | null;
}

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

    const fetchBookDetails = async (silent = false) => {
        if (!silent) loading.value = true;
        try {
            //on récupère les données du livre avec les données de lecture/possession des différents utilisateurs
            const slug = route.params.slug;
            const res = await axios.get(`/api/books/${slug}`);

            // mise à jour en place plutôt que remplacement complet
            if (book.value) {
                Object.assign(book.value, res.data);
            } else {
                book.value = res.data;
            }

            if (res.data.bookUsers && res.data.bookUsers.length > 0) {
                //on récupère les infos de lecture/possession, ... de l'utilisateur connecté
                const data = res.data.bookUsers.find((u:any) => u.userSlug === userSlug);
                if (data) { // ← vérification que l'utilisateur a bien une relation avec ce livre
                    userStatus.value = {
                        isOwn: data.isOwn || false,
                        isRead: data.isRead || false,
                        isInterested: data.isInterested || false,
                        rating: data.rating || 0,
                        comment: data.comment || ""
                    };
                } else {
                    // reset si plus d'interaction
                    userStatus.value = {
                        isOwn: false,
                        isRead: false,
                        isInterested: false,
                        rating: 0,
                        comment: ""
                    };
                }
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Une erreur est survenue.");
            //si le livre n'est pas trouvé pour cette url, renvoie vers la page d'accueil.
            if (err.response?.status === 404) {
                await router.push({name: 'Home'});
            }
        } finally {
            if (!silent) loading.value = false;
        }
    };

    const toggleStatus = async (field: keyof BookUserStatus) => {
        if (!book.value) return;

        // On récupère la valeur actuelle : lu/pas lu, ...
        const currentValue = userStatus.value[field];

        // Sécurité TypeScript : On vérifie explicitement que c'est un booléen
        if (typeof currentValue === 'boolean') {
            isLoading.value = true;
            // On utilise un "as any" ou on réassigne proprement pour bypasser le verrou
            //(userStatus.value[field] as boolean) = !currentValue l'équivalent de :
            if (field === "isOwn"){
                userStatus.value.isOwn = !currentValue;
            }
            else if (field === "isRead"){
                userStatus.value.isRead = !currentValue;
            }
            else if(field === "isInterested"){
                userStatus.value.isInterested = !currentValue;
            }
            try {
                await axios.patch(
                    // pour cet endpoint le back-end récupère l'utilisateur connecté via le jwt token
                    // on ne doit pas préciser l'utilisateur dans le front
                    `/api/books/${book.value.id}/status`,
                    userStatus.value
                );
                await fetchBookDetails(true); // ← pas de loading, pas de re-render brutal
                if (userStatus.value.isOwn) {
                    await Promise.all([fetchLoanStatus(), fetchUsers()]);
                }else {
                    loanStatus.value = null; // ← reset quand on retire le livre
                    users.value = [];
                }
            } catch (error) {
                (userStatus.value[field] as boolean) = currentValue;
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
                `/api/books/${book.value.id}/status`,
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

    // gestion des prêts :
    const users = ref<{id: number, username: string}[]>([]);
    const selectedBorrowerId = ref<number | null>(null);

    const fetchUsers = async () => {
        const res = await axios.get('/api/users');
        // on exclut l'utilisateur connecté
        users.value = res.data.filter((u: any) => u.id !== authStore.user?.id);
    };
    const loanStatus = ref<LoanStatus | null>(null);

    const fetchLoanStatus = async () => {
       try {
            const res = await axios.get(`/api/loans/${book.value.id}/status`);
            loanStatus.value = res.data;
        } catch {
            loanStatus.value = null;
        }
    };

    onMounted(async () => {
        await fetchBookDetails();
        if (userStatus.value.isOwn) {
            await Promise.all([fetchLoanStatus(), fetchUsers()]);
        }
    });
    const showLendModal = ref(false);

    const lend = async () => {
        if (!selectedBorrowerId.value) return;
        await axios.post(`/api/loans/${book.value.id}/to/${selectedBorrowerId.value}`);
        await fetchLoanStatus();
        selectedBorrowerId.value = null;
        showLendModal.value = false;
    };

    const returnBook = async () => {
        await axios.patch(`/api/loans/${loanStatus.value!.loanId}`);
        await fetchLoanStatus();
    };

    return { book, loading, toggleStatus, userStatus, isLoading, loanStatus, showLendModal,
        isEditingReview, pendingRating, pendingComment, returnBook, lend, users, selectedBorrowerId,
        startEditReview, cancelEditReview, submitReview, otherUsersReviews };
}