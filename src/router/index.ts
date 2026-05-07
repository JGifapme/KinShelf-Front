import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddBookView from '../views/AddBookView.vue'
import BookDetailsView from "../views/BookDetailsView.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/add-book',
            name: 'add-book',
            component: AddBookView
        },
        {
            path: '/book/:id',
            name: 'book-details',
            component: BookDetailsView,
            props: true // Permet de recevoir l'ID comme une prop
        }
    ]
})

export default router