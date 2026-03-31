<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white text-xl font-bold">CP</span>
        </div>
        <h2 class="mt-4 text-2xl font-bold text-gray-900">
          Crear cuenta
        </h2>
        <p class="mt-1 text-sm text-gray-600">
          Regístrate para comenzar
        </p>
      </div>
      
      <form class="mt-6 space-y-4" @submit.prevent="handleRegister">
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Nombre completo
          </label>
          <input
            v-model="form.nombre"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            v-model="form.telefono"
            type="tel"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            v-model="form.password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Tipo de cuenta
          </label>
          <select
            v-model="form.rol"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="cliente">Cliente</option>
            <option value="empleado">Empleado</option>
          </select>
          <p class="mt-1 text-xs text-gray-500">
            Los empleados deben ser aprobados por un jefe
          </p>
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>
      
      <div class="text-center">
        <p class="text-sm text-gray-600">
          ¿Ya tienes cuenta?
          <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión
          </NuxtLink>
        </p>
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
const loading = ref(false);
const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  password: '',
  rol: 'cliente'
});

const handleRegister = async () => {
  loading.value = true;
  const success = await authStore.register(form.value);
  loading.value = false;
  
  if (success) {
    navigateTo('/');
  }
};
</script>