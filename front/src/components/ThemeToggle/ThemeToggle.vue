<template>
    <v-btn
        :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();

const isDark = computed(() => theme.global.current.value.dark);

const toggleTheme = () => {
    theme.global.name.value = isDark.value ? 'light' : 'dark';
    try {
        localStorage.setItem('theme', theme.global.name.value);
    } catch {}
};
</script>
