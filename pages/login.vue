<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <!-- Theme Toggle -->
      <div class="flex justify-end -mt-4 -mr-4">
        <ThemeToggle />
      </div>
      
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white text-xl font-bold">CP</span>
        </div>
        <h2 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Control de Personal
        </h2>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Inicia sesión con tu cuenta de Zimbra
        </p>
      </div>
      
      <form class="mt-6 space-y-5" @submit.prevent="handleLogin">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Correo electrónico (Zimbra)
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="username"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            placeholder="ejemplo@senado.gob.bo"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contraseña de Zimbra
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Verificando...' : 'Ingresar con Zimbra' }}
        </button>
      </form>
      
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p class="text-center text-xs text-gray-500 dark:text-gray-400">
          🔐 La autenticación se realiza contra el servidor Zimbra
        </p>
        <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-1">
          Usa tu correo y contraseña de Zimbra
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import ThemeToggle from '~/components/ThemeToggle.vue';

definePageMeta({
  middleware: 'guest'
});

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  console.log('🔐 Intentando login con Zimbra...');
  
  if (!email.value || !password.value) {
    alert('Por favor ingresa tu correo y contraseña');
    return;
  }
  
  loading.value = true;
  
  try {
    const success = await authStore.login(email.value, password.value);
    
    if (success) {
      console.log('✅ Login exitoso, redirigiendo...');
      navigateTo('/');
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
  } finally {
    loading.value = false;
  }
};
</script>