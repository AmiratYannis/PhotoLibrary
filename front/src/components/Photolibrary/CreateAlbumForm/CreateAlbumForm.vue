<template>
    <v-card width="400" class="pa-6">
        <v-card-title class="text-h5">Create New Album</v-card-title>

        <v-card-text>

            <v-text-field v-model="albumName" label="Album Name" required prepend-inner-icon="mdi-folder-plus"></v-text-field>

            <v-btn :loading="loading" color="primary" class="mt-4"  type="submit" block> Create Album </v-btn>
        </v-card-text>

        



    </v-card>

</template>

<script>
</script>