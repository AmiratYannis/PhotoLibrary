import HelloWorld from '@/components/HelloWorld.vue';
import Login from '@/components/Login/Login.vue';
import RequestResetPassword from '@/components/Login/RequestPassword/RequestResetPassword.vue';
import SignUp from '@/components/SignUp/SignUp.vue';
import ResetPassword from '@/components/Login/RequestPassword/ResetPassword.vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router'
import Photolibrary from '@/components/Photolibrary/Photolibrary.vue';

const routes: Array<RouteRecordRaw> = [
    { path: '/home', name: 'Home', component: Photolibrary },
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