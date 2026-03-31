<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white text-xl font-bold">CP</span>
        </div>
        <h2 class="mt-4 text-2xl font-bold text-gray-900">
          Control de Personal
        </h2>
        <p class="mt-1 text-sm text-gray-600">
          Inicia sesión para continuar
        </p>
      </div>
      
      <form class="mt-6 space-y-5" @submit.prevent="handleLogin">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="ejemplo@empresa.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
      
      <div class="text-center">
        <p class="text-sm text-gray-600">
          ¿No tienes cuenta?
          <NuxtLink to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            Regístrate
          </NuxtLink>
        </p>
      </div>
      
      <div class="mt-4 pt-4 border-t border-gray-200">
        <p class="text-center text-xs text-gray-500">
          Cuentas de prueba:
        </p>
        <div class="mt-2 text-xs text-gray-500 space-y-1">
          <p>📧 Jefe:         jefe@test.com / 123456</p>
          <p>📧 Empleados:    carlos@empresa.com / 123456</p>
          <p>                 maria@empresa.com / 123456</p>
          <p>                 juan@empresa.com / 123456</p>
          <p>                 ana@empresa.com / 123456</p>
          <p>📧 Clientes:     cliente@test.com / 123456</p>
          <p>                 empresa@test.com / 123456</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: 'guest'
});

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  console.log('🚀 Iniciando proceso de login...');
  console.log('📧 Email ingresado:', email.value);
  
  loading.value = true;
  
  try {
    const success = await authStore.login(email.value, password.value);
    console.log('📊 Resultado del login:', success);
    
    if (success) {
      console.log('✅ Login exitoso, redirigiendo a la página principal...');
      // Pequeño delay para asegurar que el estado se actualizó
      setTimeout(() => {
        navigateTo('/');
      }, 100);
    } else {
      console.log('❌ Login fallido - credenciales incorrectas');
    }
  } catch (error) {
    console.error('❌ Error en handleLogin:', error);
  } finally {
    loading.value = false;
  }
};
</script>