<template>
    <v-card>
        <v-card-title>{{ album.title }}</v-card-title>

        <v-card-text>
            <v-btn prepend-icon="mdi-image" color="primary" @click="dialog = true">Add pictures</v-btn>
        </v-card-text>

        <PictureModal v-model="dialog" :album="album" />
    </v-card>
</template>

<script setup>
import { ref } from 'vue'
import PictureModal from './PictureModal.vue'

defineProps({
    album: {
        type: Object,
        required: true
    }
})

const dialog = ref(false)
</script>