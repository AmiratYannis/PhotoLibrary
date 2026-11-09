<template>

    <v-container fluid class="py-6">
        <div v-if="!loading && albums.length === 0" class="d-flex flex-column align-center text-center mt-16">
            <v-icon icon="mdi-image-off-outline" size="160" color="grey" />
            <h2 class="text-h5 mt-4">No album to display</h2>
        </div>

        <v-row v-else>
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
import AlbumView from './Albums/AlbumView.vue'


const albums = ref([])
const loading = ref(true)

const fetchAlbums = async () => {
    const headers = await getAuthHeader()
    await axios.get('http://localhost:3000/api/albums', { headers })
        .then((res) => {
            albums.value = res.data
        })
        .catch((err) => {
            console.error('Failed to fetch albums', err)
        })
        .finally(() => {
            loading.value = false
        })
}

onMounted(fetchAlbums)

</script>

