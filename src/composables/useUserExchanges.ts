// composables/useUserExchanges.ts
import { ref } from 'vue';
import axios from 'axios';

interface LoanDTO {
    id: number;
    bookId: number;
    bookTitle: string;
    bookSlug: string;
    ownerId: number;
    ownerName: string;
    borrowerId: number;
    borrowerName: string;
    borrowerSlug: string;
    loanDate: string;
    returnDate: string | null;
}

interface BookTitleAndImgDTO {
    id: number;
    title: string;
    slug: string;
    coverUrl: string;
}

export function useUserExchanges(userSlug: string, userId: number) {
    const loans = ref<LoanDTO[]>([]);
    const wishFromUser = ref<BookTitleAndImgDTO[]>([]); // ses livres dans ma wishlist
    const wishedByUser = ref<BookTitleAndImgDTO[]>([]); // mes livres dans sa wishlist
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchExchanges = async () => {
        loading.value = true;
        error.value = null;
        try {
            const [loansLent, loansBorrowed, wish, wished] = await Promise.all([
                axios.get<LoanDTO[]>('/api/loans', { params: { filter: 'LENT' } }),
                axios.get<LoanDTO[]>('/api/loans', { params: { filter: 'BORROWED' } }),
                axios.get<BookTitleAndImgDTO[]>(`/api/books/wish/${userSlug}`),
                axios.get<BookTitleAndImgDTO[]>(`/api/books/wished/${userSlug}`),
            ]);

            // Garde seulement les prêts en cours impliquant cet utilisateur
            loans.value = [
                ...loansLent.data.filter(l => l.borrowerId === userId && !l.returnDate),
                ...loansBorrowed.data.filter(l => l.ownerId === userId && !l.returnDate),
            ];

            wishFromUser.value = wish.data;
            wishedByUser.value = wished.data;
        } catch (err) {
            error.value = "Impossible de charger les échanges.";
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    return { loans, wishFromUser, wishedByUser, loading, error, fetchExchanges };
}