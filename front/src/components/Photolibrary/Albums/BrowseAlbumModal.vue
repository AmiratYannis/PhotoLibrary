<template>
    <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500">
        <v-card>
            <v-card-title class="text-h6">Browse my album</v-card-title>

            <v-card-text>
                <p class="mb-4">Find here all the album you created and the list album you created</p>

                <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
                <v-alert v-else-if="error" type="error" density="compact">{{ error }}</v-alert>
                <p v-else-if="!albums.length" class="text-medium-emphasis">You have no album yet.</p>

                <v-list v-else>
                    <v-list-item
                        v-for="album in albums"
                        :key="album._id"
                        :title="album.title"
                        prepend-icon="mdi-folder-image"
                        @click="selectAlbum(album)"
                    ></v-list-item>
                </v-list>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

interface Album {
    _id: string;
    title: string;
}

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'select', album: Album): void;
}>();

const albums = ref<Album[]>([]);
const loading = ref<boolean>(false);
const error = ref<string>('');

const fetchAlbums = async (): Promise<void> => {
    error.value = '';
    loading.value = true;

    try {
        const headers = await getAuthHeader();
        await axios.get('http://localhost:3000/api/albums', { headers })
            .then((res) => {
                albums.value = res.data;
            })
            .catch((err) => {
                error.value = 'Failed to load albums.';
                throw err;
            });
    } catch (err: any) {
        if (!error.value) error.value = err.message || 'Failed to load albums.';
    } finally {
        loading.value = false;
    }
};

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) fetchAlbums();
});

const selectAlbum = (album: Album): void => {
    emit('select', album);
    emit('update:modelValue', false);
};
</script>
