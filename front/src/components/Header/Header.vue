<template>
    <v-app-bar color="blue-darken-2" height="80" flat>
        <div class="d-flex flex-column ml-4">
            <h1>Photolibrary</h1>
            <span class="text-body-2 text-medium-emphasis">
                Display your personal pictures in your albums through this Photolibrary app!
            </span>
        </div>

        <v-spacer />

        <v-btn icon="mdi-home" aria-label="Go to home page" @click="goHome" />
    </v-app-bar>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    router.push('/home');
};
</script>
