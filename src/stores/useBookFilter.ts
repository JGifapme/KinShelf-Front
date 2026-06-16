import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBookFilter = defineStore('bookFilter', () => {
    const search = ref('');
    const selectedGenre = ref('');
    const selectedCategory = ref('');
    const selectedUser = ref('');
    const sortBy = ref('a-z');
    const userStatus = ref<string | null>(null);
    const currentPage = ref(0);

    const reset = () => {
        search.value = '';
        selectedGenre.value = '';
        selectedCategory.value = '';
        selectedUser.value = '';
        sortBy.value = 'a-z';
        userStatus.value = null;
        currentPage.value = 0;
    };

    return { search, selectedGenre, selectedCategory, selectedUser, sortBy, userStatus, currentPage, reset };
});