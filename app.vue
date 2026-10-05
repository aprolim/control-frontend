<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  
  <!-- 🔔 Contenedor global de notificaciones toast -->
  <NotificacionToast
    v-if="notificacionesActivas.length > 0"
    :notificaciones="notificacionesActivas"
    @cerrar="cerrarNotificacion"
  />
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useNotificaciones } from '~/composables/useNotificaciones';
import { useNuxtApp } from '#app';

const authStore = useAuthStore();

// 🔥 Inicializar composable global de notificaciones
const {
  notificacionesActivas,
  cerrarNotificacion,
  inicializar: inicializarNotificaciones,
  destruir: destruirNotificaciones,
  actualizarConfiguracion
} = useNotificaciones();

onMounted(() => {
  authStore.loadFromStorage();
  
  // 🔥 Inicializar sistema de notificaciones
  if (authStore.user) {
    inicializarNotificaciones();
  }
  
  // Configurar escucha global de cambios de rol
  const nuxtApp = useNuxtApp();
  const socket = nuxtApp.$socket;
  
  if (socket) {
    console.log('🔌 [App] Configurando escucha global de cambios de rol...');
    
    socket.on('rol-actualizado', (data) => {
      console.log('========================================');
      console.log('🔄 [App][GLOBAL] Rol actualizado!');
      console.log(`   👤 Usuario ID: ${data.userId}`);
      console.log(`   🆕 Nuevo rol: ${data.nuevoRol}`);
      console.log(`   👤 Usuario actual: ${authStore.user?._id}`);
      console.log('========================================');
      
      if (data.userId === authStore.user?._id) {
        console.log(`🎯 [App] ¡Este cambio de rol es para ti!`);
        console.log(`   Rol anterior: ${authStore.user?.rol}`);
        console.log(`   Nuevo rol: ${data.nuevoRol}`);
        
        authStore.user.rol = data.nuevoRol;
        localStorage.setItem('user', JSON.stringify(authStore.user));
        
        alert(`✅ Tu rol ha sido actualizado a: ${data.nuevoRol}. La página se recargará.`);
        
        setTimeout(() => {
          const roleRoutes = {
            'supervisor': '/supervisor',
            'tecnico': '/tecnico',
            'usuario': '/usuario'
          };
          const targetRoute = roleRoutes[data.nuevoRol] || '/';
          console.log(`🔄 [App] Redirigiendo a: ${targetRoute}`);
          window.location.href = targetRoute;
        }, 1500);
      }
    });
    
    // 🔥 Escuchar cambios de configuración de notificaciones
    socket.on('notificaciones-actualizadas', (data) => {
      console.log('🔔 [App] Configuración de notificaciones actualizada:', data);
      if (data.configuracion) {
        actualizarConfiguracion(data.configuracion);
      }
    });
  }
});

onUnmounted(() => {
  destruirNotificaciones();
});
</script>