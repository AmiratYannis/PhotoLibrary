<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="480">
        <v-card>
            <v-card-title class="text-h6">Add picture to {{ album.title }}</v-card-title>

            <v-card-text>
                <v-file-input
                    v-model="selectedFile"
                    label="Choose a picture"
                    accept="image/*"
                    prepend-icon="mdi-image"
                ></v-file-input>

                <v-alert v-if="error" type="error" icon="false" class="mt-2" dense>
                    {{ error }}
                </v-alert>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="cancel">Cancel</v-btn>
                <v-btn color="primary" :loading="uploading" :disabled="!selectedFile" @click="confirm">Confirm</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { getAuthHeader } from '@/utils/auth'

const props = defineProps({
    album: {
        type: Object,
        required: true
    },
    modelValue: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'picture-uploaded'])

const selectedFile = ref(null)
const uploading = ref(false)
const error = ref('')

const cancel = () => {
    emit('update:modelValue', false)
    selectedFile.value = null
    error.value = ''
}

const confirm = async () => {
    const file = Array.isArray(selectedFile.value) ? selectedFile.value[0] : selectedFile.value
    if (!file) {
        return
    }

    error.value = ''
    uploading.value = true

    try {
        const headers = await getAuthHeader()

        const { data } = await axios.post(
            `http://localhost:3000/api/albums/${props.album._id}/upload-url`,
            { filename: file.name, contentType: file.type },
            { headers }
        )

        await axios.put(data.uploadUrl, file, {
            headers: { 'Content-Type': file.type }
        })

        const { data: picture } = await axios.post(
            'http://localhost:3000/api/pictures',
            { name: file.name, key: data.key, albumId: props.album._id },
            { headers }
        )

        selectedFile.value = null
        emit('update:modelValue', false)
        emit('picture-uploaded', picture)
    } catch (err) {
        error.value = err.message || 'Failed to upload picture.'
    } finally {
        uploading.value = false
    }
}
</script>