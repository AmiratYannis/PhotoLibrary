import HelloWorld from '@/components/HelloWorld.vue';
import Login from '@/components/Login.vue';
import RequestResetPassword from '@/components/RequestResetPassword.vue';
import SignUp from '@/components/SignUp.vue';
import {createRouter, createWebHistory} from 'vue-router';
import type {RouteRecordRaw} from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {path: '/home', name:'Home', component: HelloWorld},
    {path: '/', name: 'Login', component: Login},
    {path: '/signUp', name: 'Signup', component: SignUp},
    {path: '/forgot-password', name:"RequestReset", component: RequestResetPassword},
    //{path: '/resset-password', name: 'ResetPassword', component: ResetPassword},
    { path: '/:pathMatch(.*)*', redirect: '/' }
    
]

const router= createRouter({
    history: createWebHistory(),
    routes
})

export default router;