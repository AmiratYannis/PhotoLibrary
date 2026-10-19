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
                <v-btn prepend-icon="mdi-image-multiple" color="primary" @click="browseDialog = true">
                    Browse albums
                </v-btn>

                <v-btn prepend-icon="mdi-pencil" color="secondary" @click="goToManageAlbum">
                    Configure an album
                </v-btn>
            </v-card-text>
        </v-card>

        <BrowseAlbumModal v-model="browseDialog" @select="openAlbum" />
    </v-container>
</template>

<script setup>
import { ref, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import BrowseAlbumModal from '@/components/Photolibrary/Albums/BrowseAlbumModal.vue'

const router = useRouter()

const browseDialog = ref(false)

const openAlbum = (album) => {
    router.push({ name: 'ManageAlbum', state: { album: toRaw(album) } })
}

const goToManageAlbum = () => {
    router.push('/manage-album')
}
</script>
