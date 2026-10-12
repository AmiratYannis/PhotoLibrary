<template>
    <v-container class="d-flex justify-center align-center fill-height">
        <v-card  class="pa-6">
            <div class="d-flex flex-column align-center mb-4">
                <img src="/icon/photo-library-icon.svg" alt="Photolibrary icon" width="200" height="200" />
                <h1 class="text-h3 mt-2">Photolibrary</h1>
                <p class="text-body-1 text-medium-emphasis text-center mt-2">
                    Display your personal pictures in your albums through this Photolibrary app!
                </p>
            </div>

            <v-card-text class="d-flex justify-center" style="gap: 40px">
                <v-btn prepend-icon="mdi-image-multiple" color="primary" @click="goToAlbums">
                    Browse albums
                </v-btn>

                <v-btn prepend-icon="mdi-pencil" color="secondary" @click="goToManageAlbum">
                    Configure an album
                </v-btn>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAlbums = () => {
    router.push('/albums')
}

const goToManageAlbum = () => {
    router.push('/manage-album')
}
</script>
