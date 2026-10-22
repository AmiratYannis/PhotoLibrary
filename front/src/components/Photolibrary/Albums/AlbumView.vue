<template>
    <v-card>
        <v-card-title>{{ album.title }}</v-card-title>

        <v-card-text>
            <v-row>
                <v-col v-for="picture in pictures" :key="picture._id" cols="6" sm="4" md="3" lg="2">
                    <v-img :src="picture.url" :alt="picture.name" aspect-ratio="1" cover class="picture" tabindex="0"></v-img>
                </v-col>
            </v-row>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-pencil" color="primary" aria-label="Edit album" @click="editAlbum"></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref, onMounted, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { getAuthHeader } from '@/utils/auth'

const props = defineProps({
    album: {
        type: Object,
        required: true
    }
})

const router = useRouter()

const pictures = ref([])

const editAlbum = () => {
    router.push({ name: 'ManageAlbum', state: { album: toRaw(props.album) } })
}

const fetchPictures = async () => {
    const headers = await getAuthHeader()
    await axios.get(`http://localhost:3000/api/albums/${props.album._id}/pictures`, { headers })
        .then((res) => {
            pictures.value = res.data
        })
        .catch((err) => {
            console.error('Failed to fetch pictures', err)
        })
}

onMounted(fetchPictures)
</script>

<style scoped>
.picture {
    transition: transform 0.2s ease;
    cursor: pointer;
}

.picture:hover,
.picture:focus-visible {
    transform: scale(1.5);
    z-index: 1;
}
</style>
