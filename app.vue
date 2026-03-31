<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

// Solo cargar en el cliente
onMounted(() => {
  authStore.loadFromStorage();
});
</script>