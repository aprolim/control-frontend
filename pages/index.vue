<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Redirigiendo según tu rol...</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useRoles } from '~/composables/useRoles';
import { onMounted } from 'vue';

const authStore = useAuthStore();
const { isSupervisor, isTecnico, isUsuario } = useRoles();

onMounted(async () => {
  // Primero cargar datos del storage
  const loaded = authStore.loadFromStorage();
  
  console.log('🔍 [Index] Estado de autenticación:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    rol: authStore.user?.rol,
    loaded
  });

  // Si no está autenticado, ir a login
  if (!authStore.isAuthenticated || !authStore.user) {
    console.log('🚪 [Index] Usuario no autenticado, redirigiendo a login');
    navigateTo('/login');
    return;
  }

  // Esperar un momento para asegurar que el store está listo
  await nextTick();

  // Redirigir según el rol
  const rol = authStore.user.rol;
  console.log('🔄 [Index] Redirigiendo según rol:', rol);

  try {
    if (rol === 'supervisor') {
      console.log('👔 [Index] Redirigiendo a /supervisor');
      await navigateTo('/supervisor');
    } else if (rol === 'tecnico') {
      console.log('🔧 [Index] Redirigiendo a /tecnico');
      await navigateTo('/tecnico');
    } else if (rol === 'usuario') {
      console.log('👤 [Index] Redirigiendo a /usuario');
      await navigateTo('/usuario');
    } else {
      console.warn('⚠️ [Index] Rol desconocido:', rol);
      await navigateTo('/login');
    }
  } catch (error) {
    console.error('❌ [Index] Error en redirección:', error);
    // Si falla la redirección, intentar con window.location
    if (rol === 'supervisor') {
      window.location.href = '/supervisor';
    } else if (rol === 'tecnico') {
      window.location.href = '/tecnico';
    } else if (rol === 'usuario') {
      window.location.href = '/usuario';
    } else {
      window.location.href = '/login';
    }
  }
});
</script>