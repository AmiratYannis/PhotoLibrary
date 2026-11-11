<template>
    <v-btn icon="mdi-home" aria-label="Go to home page" @click="goHome" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    router.push('/home');
};
</script>
