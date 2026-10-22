<template>

    <v-container fluid class="py-6">
        <v-row>
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

const fetchAlbums = async () => {
    const headers = await getAuthHeader()
    await axios.get('http://localhost:3000/api/albums', { headers })
        .then((res) => {
            albums.value = res.data
        })
        .catch((err) => {
            console.error('Failed to fetch albums', err)
        })
}

onMounted(fetchAlbums)

</script>

