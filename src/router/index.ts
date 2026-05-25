import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddBookView from '../views/AddBookView.vue'
import BookDetailsView from "../views/BookDetailsView.vue";
import EntityDetailView from "../views/EntityDetailView.vue";
import {useAuthStore} from "../stores/useAuthStore.ts";
import ProfileView from "../views/ProfileView.vue";

//Défini les chemins d'accès à l'application, les urls
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/register',
            name: 'Register',
            component: () => import('../views/RegisterView.vue')
        },
        {
            path: '/add-book',
            name: 'add-book',
            component: AddBookView
        },
        {
            path: '/edit-book/:slug',
            name: 'edit-book',
            component: AddBookView
        },
        {
            path: '/book/:slug',
            name: 'book-details',
            component: BookDetailsView,
            props: true
        },
        {
            path: '/collection',
            name: 'collection',
            component: ProfileView,
            props: true
        },
        {
            path: '/:type/:slug', // ex: /genre/fantasy ou /category/roman ou publisher/glenat
            name: 'EntityDetail',
            component: EntityDetailView
        },
        {
            path: '/user/:slug',
            name: 'UserProfile',
            component: () => import('../views/UserProfileView.vue')
        },
        {
            path: '/',
            name: 'Home',
            component: HomeView
        }
    ]
})
// Avant de définir ou l'utilisateur va être envoyé :
router.beforeEach((to) => {
    const authStore = useAuthStore();
    const publicRoutes = ['Login', 'Register'];
    // On vérifie si il est connecté, sinon on l'envoie sur la page login
    if (!authStore.isAuthenticated && !publicRoutes.includes(to.name as string)) {
        return { name: 'Login' };
    }

    // Si il est déjà connecté, pas besoin d'aller sur login/register, il va sur la homepage
    if (authStore.isAuthenticated && publicRoutes.includes(to.name as string)) {
        return { name: 'Home' };
    }
});

export default router