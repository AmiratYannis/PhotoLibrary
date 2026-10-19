<template>
    <v-container fluid class="pa-6">
        <ConfigureAlbumForm :album="album" />
    </v-container>
</template>

<script setup lang="ts">
import ConfigureAlbumForm from '@/components/Photolibrary/ConfigureAlbumForm/ConfigureAlbumForm.vue';

const album = history.state.album;
</script>
