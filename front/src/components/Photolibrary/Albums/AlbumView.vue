<template>
    <v-card>
        <v-card-title>{{ album.title }}</v-card-title>

        <v-card-text>
            <v-btn prepend-icon="mdi-image" color="primary" @click="dialog = true">Manage Picture</v-btn>

            <v-row class="mt-2">
                <v-col v-for="picture in pictures" :key="picture._id" cols="6" sm="4" md="3" lg="2">
                    <v-img :src="picture.url" :alt="picture.name" aspect-ratio="1" cover></v-img>
                </v-col>
            </v-row>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-trash-can" color="error"></v-btn>
        </v-card-actions>

        <ManagePictureModal v-model="dialog" :album="album" :pictures="pictures" @picture-uploaded="fetchPictures" />
    </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getAuthHeader } from '@/utils/auth'
import ManagePictureModal from './ManagePictureModal.vue'

const props = defineProps({
    album: {
        type: Object,
        required: true
    }
})

const dialog = ref(false)
const pictures = ref([])

const fetchPictures = async () => {
    const headers = await getAuthHeader()
    const res = await axios.get(`http://localhost:3000/api/albums/${props.album._id}/pictures`, { headers })
    pictures.value = res.data
}

onMounted(fetchPictures)
</script>
