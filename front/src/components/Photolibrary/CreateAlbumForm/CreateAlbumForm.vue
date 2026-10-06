<template>
    <v-card width="400" class="pa-6">
        <v-card-title class="text-h5">Create New Album</v-card-title>

        <v-card-text>
            <v-form @submit.prevent="createAlbum">
                <v-text-field v-model="albumName" label="Album Name" required prepend-inner-icon="mdi-folder-plus"></v-text-field>

                <v-alert v-if="error" type="error" class="mt-2" dense>
                    {{ error }}
                </v-alert>

                <v-btn :loading="loading" color="primary" class="mt-4" type="submit" block> Create Album </v-btn>
            </v-form>
        </v-card-text>
    </v-card>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

const emit = defineEmits<{
  (e: 'album-created'): void;
}>();

const albumName = ref<string>('');
const loading = ref<boolean>(false);
const error = ref<string>('');

const createAlbum = async (): Promise<void> => {
  error.value = '';
  loading.value = true;

  try {
    const headers = await getAuthHeader();

    await axios.post('http://localhost:3000/api/users', {}, { headers })
      .then(() => {
        console.log('User synced with backend');
      })
      .catch((err) => {
        error.value = 'Failed to sync user.';
        throw err;
      });

    await axios.post('http://localhost:3000/api/albums', {
      title: albumName.value,
    }, { headers })
      .then(() => {
        albumName.value = '';
        emit('album-created');
      })
      .catch((err) => {
        error.value = 'Failed to create album.';
        throw err;
      });
  } catch (err: any) {
    if (!error.value) error.value = err.message || 'Failed to create album.';
  } finally {
    loading.value = false;
  }
};
</script>