<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="480">
        <v-card>
            <v-card-title class="text-h6">Manage picture of {{ album.title }} album</v-card-title>

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

                <template v-if="visiblePictures.length">
                    <v-divider class="my-4"></v-divider>
                    <div class="text-subtitle-2 mb-2">Pictures in this album</div>
                    <v-row>
                        <v-col v-for="picture in visiblePictures" :key="picture._id" cols="4">
                            <div style="position: relative">
                                <v-img :src="picture.url" :alt="picture.name" aspect-ratio="1" cover></v-img>
                                <v-btn
                                    icon="mdi-close"
                                    size="x-small"
                                    color="error"
                                    style="position: absolute; top: 4px; right: 4px;"
                                    @click="hidePicture(picture._id)"
                                ></v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="cancel">Cancel</v-btn>
                <v-btn color="primary" :loading="uploading" :disabled="!hasChanges" @click="confirm">Confirm</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
    },
    pictures: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue', 'picture-uploaded'])

const selectedFile = ref(null)
const uploading = ref(false)
const error = ref('')
const visiblePictures = ref([...props.pictures])

watch(() => props.pictures, (newPictures) => {
    visiblePictures.value = [...newPictures]
})

watch(() => props.modelValue, (isOpen) => {
    if (!isOpen) {
        visiblePictures.value = [...props.pictures]
    }
})

const hidePicture = (pictureId) => {
    visiblePictures.value = visiblePictures.value.filter((picture) => picture._id !== pictureId)
}

const hasChanges = computed(() => {
    const file = Array.isArray(selectedFile.value) ? selectedFile.value[0] : selectedFile.value
    return !!file || visiblePictures.value.length !== props.pictures.length
})

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