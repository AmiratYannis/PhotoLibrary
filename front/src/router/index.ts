import Login from '@/components/Login/Login.vue';
import RequestResetPassword from '@/components/Login/RequestPassword/RequestResetPassword.vue';
import SignUp from '@/components/SignUp/SignUp.vue';
import ResetPassword from '@/components/Login/RequestPassword/ResetPassword.vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router'
import { Auth } from 'aws-amplify';
import Photolibrary from '@/components/Photolibrary/Photolibrary.vue';
import HomePage from '@/pages/Home/HomePage.vue';
import ConfigureAlbumPage from '@/pages/ConfigureAlbum/ConfigureAlbumPage.vue';

const routes: Array<RouteRecordRaw> = [
    { path: '/home', name: 'Home', component: HomePage },
    { path: '/albums', name: 'Albums', component: Photolibrary },
    { path: '/manage-album', name: 'ManageAlbum', component: ConfigureAlbumPage },
    { path: '/', name: 'Login', component: Login, meta: { public: true } },
    { path: '/signUp', name: 'Signup', component: SignUp, meta: { public: true } },
    { path: '/forgot-password', name: "RequestReset", component: RequestResetPassword, meta: { public: true } },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPassword, meta: { public: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to) => {
    if (to.meta.public) return true;

    try {
        await Auth.currentAuthenticatedUser();
        return true;
    } catch {
        return { name: 'Login' };
    }
});

export default router;