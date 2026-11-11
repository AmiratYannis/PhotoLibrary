<template>
    <v-btn icon="mdi-logout" aria-label="Disconnect" @click="signOut" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Auth } from 'aws-amplify';

const router = useRouter();

const signOut = async () => {
    await Auth.signOut();
    router.push('/');
};
</script>
