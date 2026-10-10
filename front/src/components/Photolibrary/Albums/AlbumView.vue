<template>
    <v-card>
        <v-card-title>{{ album.title }}</v-card-title>

        <v-card-text>
            <v-btn prepend-icon="mdi-image" color="primary" @click="dialog = true">Manage Picture</v-btn>

            <v-row class="mt-2">
                <v-col v-for="picture in pictures" :key="picture._id" cols="6" sm="4" md="3" lg="2">
                    <v-img :src="picture.url" :alt="picture.name" aspect-ratio="1" cover class="picture" tabindex="0"></v-img>
                </v-col>
            </v-row>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-trash-can" color="error" @click="deleteDialog = true"></v-btn>
        </v-card-actions>

        <ManageAlbumModal
            v-model="dialog"
            :album="album"
            :pictures="pictures"
            @picture-uploaded="fetchPictures"
            @album-updated="$emit('album-updated', { albumId: album._id, title: $event })"
        />
        <DeleteAlbumModal v-model="deleteDialog" :album="album" @deleted="$emit('album-deleted', album._id)" />
    </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getAuthHeader } from '@/utils/auth'
import ManageAlbumModal from './ManageAlbumModal.vue'
import DeleteAlbumModal from './DeleteAlbumModal.vue'

const props = defineProps({
    album: {
        type: Object,
        required: true
    }
})

defineEmits(['album-deleted', 'album-updated'])

const dialog = ref(false)
const deleteDialog = ref(false)
const pictures = ref([])

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
