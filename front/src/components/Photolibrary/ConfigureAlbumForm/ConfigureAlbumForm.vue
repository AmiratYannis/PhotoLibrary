<template>
    <v-form class="configure-form" @submit.prevent="save">
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

        <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="cancel">Cancel</v-btn>
            <v-btn color="primary" type="submit" :loading="saving" :disabled="!canSave">Save</v-btn>
        </div>
    </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

const router = useRouter();

const title = ref<string>('');
const savedTitle = ref<string>('');
const albumId = ref<string | null>(null);
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
    return !albumId.value || title.value !== savedTitle.value || selectedFiles.value.length > 0;
});

const removeSelectedFile = (index: number): void => {
    selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
};

const cancel = (): void => {
    router.push('/home');
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
