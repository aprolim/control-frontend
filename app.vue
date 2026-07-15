<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useNuxtApp } from '#app';

const authStore = useAuthStore();

onMounted(() => {
  authStore.loadFromStorage();
  
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
      
      // Verificar si el cambio de rol es para el usuario actual
      if (data.userId === authStore.user?._id) {
        console.log(`🎯 [App] ¡Este cambio de rol es para ti!`);
        console.log(`   Rol anterior: ${authStore.user?.rol}`);
        console.log(`   Nuevo rol: ${data.nuevoRol}`);
        
        // Actualizar el store y localStorage
        authStore.user.rol = data.nuevoRol;
        localStorage.setItem('user', JSON.stringify(authStore.user));
        
        // Mostrar notificación
        alert(`✅ Tu rol ha sido actualizado a: ${data.nuevoRol}. La página se recargará.`);
        
        // 🔥 FORZAR RECARGA COMPLETA CON EL NUEVO ROL
        // Usamos window.location.href para asegurar una recarga completa
        setTimeout(() => {
          // Determinar la ruta según el nuevo rol
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
  }
});
</script>