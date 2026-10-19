<template>
    <v-form class="configure-form" @submit.prevent="onSubmit">
        <div class="text-h6 mb-2">Set up your album</div>
        <v-text-field
            v-model="title"
            label="Album name"
            prepend-inner-icon="mdi-tag"
            required
        ></v-text-field>

        <v-divider class="my-4"></v-divider>

        <div class="text-h6 mb-2">Upload pictures</div>
        <v-file-input
            v-model="newFiles"
            label="Choose pictures"
            accept="image/*"
            multiple
            prepend-icon="mdi-image"
        ></v-file-input>

        <div class="picture-area my-6">
            <div v-for="picture in existingPictures" :key="picture._id" class="picture-item">
                <v-img :src="picture.url" :alt="picture.name" aspect-ratio="1" cover></v-img>
                <v-btn
                    icon="mdi-close"
                    size="x-small"
                    color="error"
                    class="remove-btn"
                    @click="removeExistingPicture(picture)"
                ></v-btn>
            </div>
            <div v-for="(file, index) in selectedFiles" :key="file.name + index" class="picture-item">
                <v-img :src="previewUrls[index]" :alt="file.name" aspect-ratio="1" cover></v-img>
                <v-btn
                    icon="mdi-close"
                    size="x-small"
                    color="error"
                    class="remove-btn"
                    @click="removeSelectedFile(index)"
                ></v-btn>
            </div>
        </div>

        <v-alert v-if="error" type="error" class="mb-4" density="compact">
            {{ error }}
        </v-alert>

        <div class="d-flex ga-2">
            <v-btn
                v-if="isEditMode"
                color="error"
                variant="outlined"
                prepend-icon="mdi-trash-can"
                @click="deleteDialog = true"
            >Delete</v-btn>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="cancel">{{ isEditMode ? 'Go back' : 'Cancel' }}</v-btn>
            <v-btn color="primary" type="submit" :loading="saving" :disabled="!canSave">
                {{ isEditMode ? 'Update' : 'Save' }}
            </v-btn>
        </div>

        <DeleteAlbumModal v-if="album" v-model="deleteDialog" :album="album" @deleted="router.push('/albums')" />

        <v-dialog v-model="confirmDeleteDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">Are you sur to update these album like that?</v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="confirmDeleteDialog = false">No</v-btn>
                    <v-btn color="error" :loading="saving" @click="onConfirmDelete">Yes</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';
import DeleteAlbumModal from '@/components/Photolibrary/Albums/DeleteAlbumModal.vue';

interface Album {
    _id: string;
    title: string;
}

interface Picture {
    _id: string;
    name: string;
    url: string;
}

const props = defineProps<{
    album?: Album;
}>();

const router = useRouter();

const isEditMode = computed(() => !!props.album);
const title = ref<string>(props.album?.title ?? '');
const savedTitle = ref<string>(props.album?.title ?? '');
const albumId = ref<string | null>(props.album?._id ?? null);
const existingPictures = ref<Picture[]>([]);
const removedPictures = ref<Picture[]>([]);
const deleteDialog = ref<boolean>(false);
const confirmDeleteDialog = ref<boolean>(false);
const newFiles = ref<File[]>([]);
const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const saving = ref<boolean>(false);
const error = ref<string>('');

watch(newFiles, (files) => {
    if (files && files.length) {
        selectedFiles.value = [...selectedFiles.value, ...files];
        newFiles.value = [];
    }
});

watch(selectedFiles, (files) => {
    previewUrls.value.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.value = files.map((file) => URL.createObjectURL(file));
});

const canSave = computed(() => {
    if (!title.value.trim()) return false;
    return !albumId.value
        || title.value !== savedTitle.value
        || selectedFiles.value.length > 0
        || removedPictures.value.length > 0;
});

const fetchPictures = async (): Promise<void> => {
    const headers = await getAuthHeader();
    await axios.get(`http://localhost:3000/api/albums/${albumId.value}/pictures`, { headers })
        .then((res) => {
            existingPictures.value = res.data;
        })
        .catch((err) => {
            error.value = 'Failed to load pictures.';
            console.error('Failed to fetch pictures', err);
        });
};

onMounted(() => {
    if (isEditMode.value) fetchPictures();
});

const removeSelectedFile = (index: number): void => {
    selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
};

const removeExistingPicture = (picture: Picture): void => {
    const index = existingPictures.value.findIndex((existing) => existing._id === picture._id);
    if (index !== -1) {
        existingPictures.value.splice(index, 1);
    }
    removedPictures.value = [...removedPictures.value, picture];
};

const cancel = (): void => {
    router.push('/home');
};

const onSubmit = (): void => {
    if (isEditMode.value) {
        confirmDeleteDialog.value = true;
    } else {
        save();
    }
};

const onConfirmDelete = (): void => {
    confirmDeleteDialog.value = false;
    save();
};

const save = async (): Promise<void> => {
    error.value = '';
    saving.value = true;

    try {
        const headers = await getAuthHeader();

        if (!albumId.value) {
            await axios.post('http://localhost:3000/api/albums', { title: title.value }, { headers })
                .then((res) => {
                    albumId.value = res.data._id;
                    savedTitle.value = title.value;
                })
                .catch((err) => {
                    error.value = 'Failed to create album.';
                    throw err;
                });
        } else if (title.value !== savedTitle.value) {
            await axios.put(`http://localhost:3000/api/albums/${albumId.value}`, { title: title.value }, { headers })
                .then(() => {
                    savedTitle.value = title.value;
                })
                .catch((err) => {
                    error.value = 'Failed to rename album.';
                    throw err;
                });
        }

        for (const picture of [...removedPictures.value]) {
            await axios.delete(`http://localhost:3000/api/pictures/${picture._id}`, { headers })
                .then(() => {
                    console.log(`Picture ${picture.name} deleted`);
                    removedPictures.value = removedPictures.value.filter((removed) => removed._id !== picture._id);
                })
                .catch((err) => {
                    error.value = `Failed to delete ${picture.name}.`;
                    throw err;
                });
        }

        for (const file of [...selectedFiles.value]) {
            const uploadInfo = await axios.post(
                `http://localhost:3000/api/albums/${albumId.value}/upload-url`,
                { filename: file.name, contentType: file.type },
                { headers }
            )
                .then((res) => {
                    return res.data;
                })
                .catch((err) => {
                    error.value = `Failed to prepare upload for ${file.name}.`;
                    throw err;
                });

            await axios.put(uploadInfo.uploadUrl, file, {
                headers: { 'Content-Type': file.type }
            })
                .then(() => {
                    console.log(`File ${file.name} uploaded`);
                })
                .catch((err) => {
                    error.value = `Failed to upload ${file.name}.`;
                    throw err;
                });

            await axios.post(
                'http://localhost:3000/api/pictures',
                { name: file.name, key: uploadInfo.key, albumId: albumId.value },
                { headers }
            )
                .then(() => {
                    console.log(`Picture ${file.name} saved`);
                    selectedFiles.value = selectedFiles.value.filter((selected) => selected !== file);
                })
                .catch((err) => {
                    error.value = `Failed to save ${file.name}.`;
                    throw err;
                });
        }

        router.push('/albums');
    } catch (err: any) {
        if (!error.value) error.value = err.message || 'Failed to save album.';
    } finally {
        saving.value = false;
    }
};
</script>

<style scoped>
.configure-form {
    width: 100%;
}

.picture-area {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    min-height: 150px;
}

.picture-item {
    position: relative;
    width: 150px;
    height: 150px;
}

.remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
}
</style>
