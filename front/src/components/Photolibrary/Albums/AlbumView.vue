<template>
    <v-card>
        <v-card-title>{{ album.title }}</v-card-title>
    </v-card>
</template>

<script setup>
defineProps({
    album: {
        type: Object,
        required: true
    }
})
</script>