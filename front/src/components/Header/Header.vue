<template>
    <v-app-bar color="blue-darken-2" theme="dark" height="80" flat>
        <div class="d-flex flex-column ml-4">
            <h1 class="header-title" @click="goHome">Photolibrary</h1>
            <span class="text-body-2 text-medium-emphasis">
                Display your personal pictures in your albums through this Photolibrary app!
            </span>
        </div>

        <v-spacer />

        <ThemeToggle />
        <HomeButton />
        <DisconnectButton class="mr-2" />
    </v-app-bar>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle.vue';
import DisconnectButton from '@/components/DisconnectButton/DisconnectButton.vue';
import HomeButton from '@/components/HomeButton/HomeButton.vue';

const router = useRouter();

const goHome = () => {
    router.push('/home');
};
</script>

<style scoped>
.header-title {
    cursor: pointer;
}
</style>
