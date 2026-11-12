<template>
    <v-btn icon aria-label="Go to home page" @click="goHome">
        <v-icon icon="mdi-home" />
        <v-tooltip activator="parent" location="bottom">Go to Home page</v-tooltip>
    </v-btn>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    router.push('/home');
};
</script>
