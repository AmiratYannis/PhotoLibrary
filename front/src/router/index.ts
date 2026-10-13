import Login from '@/components/Login/Login.vue';
import RequestResetPassword from '@/components/Login/RequestPassword/RequestResetPassword.vue';
import SignUp from '@/components/SignUp/SignUp.vue';
import ResetPassword from '@/components/Login/RequestPassword/ResetPassword.vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router'
import Photolibrary from '@/components/Photolibrary/Photolibrary.vue';
import HomePage from '@/pages/Home/HomePage.vue';
import ConfigureAlbumPage from '@/pages/ConfigureAlbum/ConfigureAlbumPage.vue';

const routes: Array<RouteRecordRaw> = [
    { path: '/home', name: 'Home', component: HomePage },
    { path: '/albums', name: 'Albums', component: Photolibrary },
    { path: '/manage-album', name: 'ManageAlbum', component: ConfigureAlbumPage },
    { path: '/', name: 'Login', component: Login },
    { path: '/signUp', name: 'Signup', component: SignUp },
    { path: '/forgot-password', name: "RequestReset", component: RequestResetPassword },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
    { path: '/:pathMatch(.*)*', redirect: '/' }

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;