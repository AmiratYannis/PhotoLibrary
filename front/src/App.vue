<template>
  <v-app>
    <Header v-if="showHeader" />
    <v-main>
     <router-view/>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from '@/components/Header/Header.vue';

const route = useRoute();
const showHeader = computed(() => route.name !== 'Home');
</script>
