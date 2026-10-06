<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="480">
        <v-card>
            <v-card-title class="text-h6">Manage {{ album.title }} album</v-card-title>

            <v-card-text>
                <v-text-field
                    v-model="title"
                    label="Album name"
                    prepend-inner-icon="mdi-tag"
                    class="mb-2"
                ></v-text-field>

                <v-file-input
                    v-model="newFiles"
                    label="Choose pictures"
                    accept="image/*"
                    multiple
                    prepend-icon="mdi-image"
                ></v-file-input>

                <template v-if="selectedFiles.length">
                    <v-divider class="my-4"></v-divider>
                    <div class="text-subtitle-2 mb-2">New pictures</div>
                    <v-row>
                        <v-col v-for="(file, index) in selectedFiles" :key="file.name + index" cols="4">
                            <div style="position: relative">
                                <v-img :src="previewUrls[index]" :alt="file.name" aspect-ratio="1" cover></v-img>
                                <v-btn
                                    icon="mdi-close"
                                    size="x-small"
                                    color="error"
                                    style="position: absolute; top: 4px; right: 4px;"
                                    @click="removeSelectedFile(index)"
                                ></v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </template>

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
                <v-btn color="primary" :loading="uploading" :disabled="!hasChanges" @click="onConfirmClick">Confirm</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDeleteDialog" max-width="400">
        <v-card>
            <v-card-title class="text-h6">Are you sure to delete these pictures?</v-card-title>
            <v-card-text>
                Deleted picture(s) will also be permanently removed from S3. 
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="confirmDeleteDialog = false">No</v-btn>
                <v-btn color="error" :loading="uploading" @click="onConfirmDelete">Yes</v-btn>
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

const emit = defineEmits(['update:modelValue', 'picture-uploaded', 'album-updated'])

const selectedFiles = ref([])
const newFiles = ref([])
const previewUrls = ref([])
const uploading = ref(false)
const error = ref('')
const title = ref(props.album.title)
const visiblePictures = ref([...props.pictures])
const confirmDeleteDialog = ref(false)

watch(() => props.pictures, (newPictures) => {
    visiblePictures.value = [...newPictures]
})

watch(() => props.modelValue, (isOpen) => {
    if (!isOpen) {
        visiblePictures.value = [...props.pictures]
        title.value = props.album.title
        selectedFiles.value = []
    }
})

watch(newFiles, (files) => {
    if (files.length) {
        selectedFiles.value = [...selectedFiles.value, ...files]
        newFiles.value = []
    }
})

watch(selectedFiles, (files) => {
    previewUrls.value.forEach((url) => URL.revokeObjectURL(url))
    previewUrls.value = files.map((file) => URL.createObjectURL(file))
})

const removeSelectedFile = (index) => {
    selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
}

const hidePicture = (pictureId) => {
    visiblePictures.value = visiblePictures.value.filter((picture) => picture._id !== pictureId)
}

const hasChanges = computed(() => {
    return selectedFiles.value.length > 0 || visiblePictures.value.length !== props.pictures.length || title.value !== props.album.title
})

const removedPictures = computed(() => {
    return props.pictures.filter((picture) => !visiblePictures.value.some((visible) => visible._id === picture._id))
})

const cancel = () => {
    emit('update:modelValue', false)
    selectedFiles.value = []
    title.value = props.album.title
    error.value = ''
}

const onConfirmClick = () => {
    if (removedPictures.value.length) {
        confirmDeleteDialog.value = true
    } else {
        applyChanges()
    }
}

const onConfirmDelete = () => {
    confirmDeleteDialog.value = false
    applyChanges()
}

const applyChanges = async () => {
    error.value = ''
    uploading.value = true

    try {
        const headers = await getAuthHeader()

        if (title.value !== props.album.title) {
            await axios.put(
                `http://localhost:3000/api/albums/${props.album._id}`,
                { title: title.value },
                { headers }
            )
                .then(() => {
                    emit('album-updated', title.value)
                })
                .catch((err) => {
                    error.value = 'Failed to rename album.'
                    throw err
                })
        }

        for (const picture of removedPictures.value) {
            await axios.delete(`http://localhost:3000/api/pictures/${picture._id}`, { headers })
                .then(() => {
                    console.log(`Picture ${picture.name} deleted`)
                })
                .catch((err) => {
                    error.value = `Failed to delete ${picture.name}.`
                    throw err
                })
        }

        for (const file of selectedFiles.value) {
            const uploadInfo = await axios.post(
                `http://localhost:3000/api/albums/${props.album._id}/upload-url`,
                { filename: file.name, contentType: file.type },
                { headers }
            )
                .then((res) => {
                    return res.data
                })
                .catch((err) => {
                    error.value = `Failed to prepare upload for ${file.name}.`
                    throw err
                })

            await axios.put(uploadInfo.uploadUrl, file, {
                headers: { 'Content-Type': file.type }
            })
                .then(() => {
                    console.log(`File ${file.name} uploaded`)
                })
                .catch((err) => {
                    error.value = `Failed to upload ${file.name}.`
                    throw err
                })

            await axios.post(
                'http://localhost:3000/api/pictures',
                { name: file.name, key: uploadInfo.key, albumId: props.album._id },
                { headers }
            )
                .then(() => {
                    console.log(`Picture ${file.name} saved`)
                })
                .catch((err) => {
                    error.value = `Failed to save ${file.name}.`
                    throw err
                })
        }

        selectedFiles.value = []
        emit('update:modelValue', false)
        emit('picture-uploaded')
    } catch (err) {
        if (!error.value) error.value = err.message || 'Failed to save changes.'
    } finally {
        uploading.value = false
    }
}
</script>