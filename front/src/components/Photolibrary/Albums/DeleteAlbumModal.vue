<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="400">
        <v-card>
            <v-card-title class="text-h6">Are you sure to delete this album?</v-card-title>
            <v-card-text>
                "{{ album.title }}" and all its pictures will be permanently removed.
                <v-alert v-if="error" type="error" class="mt-2" dense>{{ error }}</v-alert>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="$emit('update:modelValue', false)">No</v-btn>
                <v-btn color="error" :loading="deleting" @click="confirmDelete">Yes</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { getAuthHeader } from '@/utils/auth'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    album: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:modelValue', 'deleted'])

const deleting = ref(false)
const error = ref('')

const confirmDelete = async () => {
    error.value = ''
    deleting.value = true

    try {
        const headers = await getAuthHeader()
        await axios.delete(`http://localhost:3000/api/albums/${props.album._id}`, { headers })
            .then(() => {
                emit('deleted')
                emit('update:modelValue', false)
            })
            .catch((err) => {
                error.value = 'Failed to delete album.'
                throw err
            })
    } catch (err) {
        if (!error.value) error.value = err.message || 'Failed to delete album.'
    } finally {
        deleting.value = false
    }
}
</script>
