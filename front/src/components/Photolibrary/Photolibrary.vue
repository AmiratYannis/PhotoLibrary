<template>

    <v-container fluid class="py-6">
        <v-row justify="space-between" align="center" class="mb-6">
            <v-col cols="12" md="6">
                <h2 class="text-h5">Photo Library</h2>
            </v-col>

        
        </v-row>
        <v-row ustify="space-between" align="center" class="mb-6">
            <v-btn color="primary" @click="showForm = !showForm">
            <v-icon start>mdi-plus</v-icon>
            New Album
        </v-btn>
        </v-row>
        
        <v-expand-transition>
        <div v-if="showForm">
            <CreateAlbumForm @album-created="fetchAlbums" />
        </div>
    </v-expand-transition>

    <v-row class="mt-4">
        <v-col v-for="album in albums" :key="album._id" cols="12">
            <AlbumView :album="album" />
        </v-col>
    </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getAuthHeader } from '@/utils/auth'
import CreateAlbumForm from './CreateAlbumForm/CreateAlbumForm.vue'
import AlbumView from './Albums/AlbumView.vue'


const showForm = ref(false)
const albums = ref([])

const fetchAlbums = async () => {
    const headers = await getAuthHeader()
    const res = await axios.get('http://localhost:3000/api/albums', { headers })
    albums.value = res.data
}

onMounted(fetchAlbums)

</script>

