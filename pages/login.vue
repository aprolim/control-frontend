<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
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
      
      <!-- 🔥 Mensaje de error amigable -->
      <div v-if="errorMessage" class="p-4 rounded-lg border" :class="errorType === 'error' ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'">
        <div class="flex items-start gap-3">
          <span class="text-xl flex-shrink-0 mt-0.5">{{ errorType === 'error' ? '❌' : '⚠️' }}</span>
          <div>
            <p class="text-sm font-semibold" :class="errorType === 'error' ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'">
              {{ errorTitle }}
            </p>
            <p class="text-sm mt-1" :class="errorType === 'error' ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'">
              {{ errorMessage }}
            </p>
            <p v-if="errorDetalle" class="text-xs mt-1 opacity-75" :class="errorType === 'error' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'">
              💡 {{ errorDetalle }}
            </p>
          </div>
        </div>
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
            :class="errorEmail ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''"
            @input="clearError"
          />
          <p v-if="errorEmail" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errorEmail }}</p>
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
            :class="errorPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''"
            @input="clearError"
          />
          <p v-if="errorPassword" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errorPassword }}</p>
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
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

// Estado de errores
const errorMessage = ref('');
const errorTitle = ref('');
const errorDetalle = ref('');
const errorType = ref('error');
const errorEmail = ref('');
const errorPassword = ref('');

const clearError = () => {
  errorMessage.value = '';
  errorTitle.value = '';
  errorDetalle.value = '';
  errorType.value = 'error';
  errorEmail.value = '';
  errorPassword.value = '';
};

const handleLogin = async () => {
  console.log('🔐 Intentando login con Zimbra...');
  
  // Limpiar errores previos
  clearError();
  
  // Validaciones
  if (!email.value || !email.value.trim()) {
    errorEmail.value = 'Por favor ingresa tu correo electrónico';
    return;
  }
  
  if (!email.value.includes('@') || !email.value.includes('.')) {
    errorEmail.value = 'Ingresa un correo válido (ejemplo@senado.gob.bo)';
    return;
  }
  
  if (!password.value || !password.value.trim()) {
    errorPassword.value = 'Por favor ingresa tu contraseña';
    return;
  }
  
  if (password.value.length < 4) {
    errorPassword.value = 'La contraseña debe tener al menos 4 caracteres';
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
    
    const errorData = error.data || error;
    const statusCode = error.status || error.statusCode || 0;
    
    console.log('📊 Status code:', statusCode);
    
    // 🔥 Manejar según el código de estado
    if (statusCode === 401) {
      // Credenciales incorrectas
      errorType.value = 'error';
      errorTitle.value = errorData?.error || 'Credenciales incorrectas';
      errorMessage.value = errorData?.mensaje || 'El usuario o la contraseña no son correctos.';
      errorDetalle.value = errorData?.detalle || 'Verifica tus datos e intenta nuevamente.';
      
      // Marcar campos específicos
      const mensaje = (errorData?.error || errorData?.mensaje || '').toLowerCase();
      if (mensaje.includes('contraseña') || mensaje.includes('password')) {
        errorPassword.value = 'Contraseña incorrecta';
      } else if (mensaje.includes('usuario') || mensaje.includes('user') || mensaje.includes('account') || mensaje.includes('mail')) {
        errorEmail.value = 'Usuario no encontrado';
      } else {
        errorEmail.value = 'Verifica tu usuario';
        errorPassword.value = 'Verifica tu contraseña';
      }
    } else if (statusCode === 400) {
      errorType.value = 'warning';
      errorTitle.value = 'Datos inválidos';
      errorMessage.value = errorData?.mensaje || 'Por favor verifica los datos ingresados.';
      errorDetalle.value = errorData?.detalle || '';
    } else if (statusCode === 503) {
      errorType.value = 'warning';
      errorTitle.value = 'Servicio no disponible';
      errorMessage.value = errorData?.mensaje || 'El servidor de autenticación no está disponible.';
      errorDetalle.value = errorData?.detalle || 'Verifica tu conexión de red o intenta más tarde.';
    } else if (statusCode === 500) {
      errorType.value = 'error';
      errorTitle.value = 'Error del servidor';
      errorMessage.value = errorData?.mensaje || 'Ocurrió un error inesperado. Intenta nuevamente.';
      errorDetalle.value = errorData?.detalle || 'Si el problema persiste, contacta al administrador.';
    } else {
      errorType.value = 'error';
      errorTitle.value = 'Error de conexión';
      errorMessage.value = 'No pudimos conectar con el servidor.';
      errorDetalle.value = 'Verifica tu conexión de red e intenta nuevamente.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.6s linear infinite;
}
</style>