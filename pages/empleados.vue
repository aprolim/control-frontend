<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">👥 Gestión de Usuarios</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Asigna roles a los usuarios que inician sesión con Zimbra
        </p>
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        <span class="font-medium">Total:</span> {{ usuarios.length }}
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="text-center py-12">
      <div class="animate-pulse">
        <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div v-else-if="usuarios.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Rol actual</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nuevo rol</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="user in usuarios" :key="user._id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {{ user.nombre?.charAt(0) || '?' }}
                  </div>
                  <span class="text-sm font-medium text-gray-800 dark:text-white">{{ user.nombre }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</td>
              <td class="px-4 py-3">
                <span :class="rolBadgeClass(user.rol)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ user.rol }}
                </span>
              </td>
              <td class="px-4 py-3">
                <select 
                  v-model="user.nuevoRol" 
                  :disabled="user._id === authStore.user?._id"
                  class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="cliente">Cliente</option>
                  <option value="empleado">Empleado</option>
                  <option value="jefe">Jefe</option>
                </select>
                <p v-if="user._id === authStore.user?._id" class="text-xs text-gray-400 mt-1">(Tu propio rol)</p>
              </td>
              <td class="px-4 py-3">
                <button
                  @click="actualizarRol(user)"
                  :disabled="user.rol === user.nuevoRol || actualizando === user._id || user._id === authStore.user?._id"
                  class="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  <span v-if="actualizando === user._id" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {{ actualizando === user._id ? 'Guardando...' : 'Actualizar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mensaje cuando no hay usuarios -->
    <div v-else class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="text-4xl mb-4">📭</div>
      <p class="text-gray-500 dark:text-gray-400">No hay usuarios registrados</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Los usuarios se crean automáticamente al iniciar sesión con Zimbra</p>
    </div>

    <!-- Mensajes de estado -->
    <div v-if="mensaje" class="mt-4 p-4 rounded-lg" :class="mensajeError ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'">
      <div class="flex items-center gap-2">
        <span>{{ mensajeError ? '❌' : '✅' }}</span>
        <span>{{ mensaje }}</span>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📋 Leyenda de roles</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
        <div class="flex items-center gap-2">
          <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Jefe</span>
          <span class="text-gray-600 dark:text-gray-400">Puede asignar roles y ver todo</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Empleado</span>
          <span class="text-gray-600 dark:text-gray-400">Puede tomar y trabajar tareas</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Cliente</span>
          <span class="text-gray-600 dark:text-gray-400">Puede solicitar y calificar servicios</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: 'auth'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();

const usuarios = ref([]);
const cargando = ref(false);
const actualizando = ref(null);
const mensaje = ref('');
const mensajeError = ref(false);

const rolBadgeClass = (rol) => {
  const map = {
    jefe: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    empleado: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    cliente: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  };
  return map[rol] || 'bg-gray-100 text-gray-700';
};

const cargarUsuarios = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/empleados/todos`;
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    usuarios.value = response.map(u => ({
      ...u,
      nuevoRol: u.rol
    }));
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    if (error.status === 403) {
      mensaje.value = '❌ No tienes permisos para ver esta página. Solo los jefes pueden acceder.';
    } else {
      mensaje.value = '❌ Error al cargar usuarios';
    }
    mensajeError.value = true;
  } finally {
    cargando.value = false;
  }
};

const actualizarRol = async (user) => {
  if (user.rol === user.nuevoRol) return;
  if (user._id === authStore.user?._id) {
    mensaje.value = '❌ No puedes cambiar tu propio rol';
    mensajeError.value = true;
    return;
  }
  
  actualizando.value = user._id;
  mensaje.value = '';
  mensajeError.value = false;
  
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/empleados/${user._id}/rol`;
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { rol: user.nuevoRol }
    });
    
    if (response.success) {
      user.rol = user.nuevoRol;
      mensaje.value = `✅ Rol de ${user.nombre} actualizado a ${user.rol}`;
      mensajeError.value = false;
      
      // Si el rol actualizado es del usuario logueado, actualizar store
      if (user._id === authStore.user?._id) {
        authStore.user.rol = user.rol;
        localStorage.setItem('user', JSON.stringify(authStore.user));
      }
    }
  } catch (error) {
    console.error('Error actualizando rol:', error);
    mensaje.value = error.data?.error || '❌ Error al actualizar rol';
    mensajeError.value = true;
    // Revertir selección
    user.nuevoRol = user.rol;
  } finally {
    actualizando.value = null;
  }
};

onMounted(() => {
  cargarUsuarios();
});
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.6s linear infinite;
}
</style>