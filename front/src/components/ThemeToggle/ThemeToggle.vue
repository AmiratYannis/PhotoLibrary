<template>
    <v-btn icon :aria-label="label" @click="toggleTheme">
        <v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" />
        <v-tooltip activator="parent" location="bottom">{{ label }}</v-tooltip>
    </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();

const isDark = computed(() => theme.global.current.value.dark);
const label = computed(() => isDark.value ? 'Switch to light mode' : 'Switch to dark mode');

const toggleTheme = () => {
    theme.global.name.value = isDark.value ? 'light' : 'dark';
    try {
        localStorage.setItem('theme', theme.global.name.value);
    } catch {}
};
</script>
