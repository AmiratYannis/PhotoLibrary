<template>
    <v-btn icon aria-label="Disconnect" @click="signOut">
        <v-icon icon="mdi-logout" />
        <v-tooltip activator="parent" location="bottom">Disconnect</v-tooltip>
    </v-btn>
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
