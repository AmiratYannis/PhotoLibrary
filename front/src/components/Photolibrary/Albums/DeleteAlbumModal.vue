<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="400">
        <v-card>
            <v-card-title class="text-h6">Are you sure to delete this album?</v-card-title>
            <v-card-text>
                "{{ album.title }}" and all its pictures will be permanently removed.
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="$emit('update:modelValue', false)">No</v-btn>
                <v-btn color="error" @click="$emit('confirm')">Yes</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    album: {
        type: Object,
        required: true
    }
})

defineEmits(['update:modelValue', 'confirm'])
</script>
