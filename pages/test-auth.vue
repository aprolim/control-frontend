<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Prueba de Autenticación</h1>
    
    <div class="space-y-4">
      <div class="bg-gray-100 p-4 rounded">
        <h2 class="font-bold">Token almacenado:</h2>
        <pre class="text-xs overflow-auto">{{ token }}</pre>
      </div>
      
      <div class="bg-gray-100 p-4 rounded">
        <h2 class="font-bold">Usuario:</h2>
        <pre>{{ user }}</pre>
      </div>
      
      <button 
        @click="testApi" 
        class="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Probar API
      </button>
      
      <div v-if="apiResult" class="bg-green-100 p-4 rounded">
        <h2 class="font-bold">Resultado API:</h2>
        <pre>{{ apiResult }}</pre>
      </div>
      
      <div v-if="apiError" class="bg-red-100 p-4 rounded">
        <h2 class="font-bold">Error API:</h2>
        <pre>{{ apiError }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore();
const config = useRuntimeConfig();
const token = ref(null);
const user = ref(null);
const apiResult = ref(null);
const apiError = ref(null);

onMounted(() => {
  token.value = localStorage.getItem('token');
  user.value = authStore.user;
});

const testApi = async () => {
  try {
    const headers = {
      Authorization: `Bearer ${token.value}`
    };
    
    // ✅ CORREGIDO: URL completa
    const url = `${config.public.apiBase}/tarjetas`;
    console.log('📤 Probando API en:', url);
    
    const result = await $fetch(url, { headers });
    apiResult.value = result;
    apiError.value = null;
  } catch (error) {
    apiError.value = error;
    apiResult.value = null;
    console.error('Error en testApi:', error);
  }
};
</script>