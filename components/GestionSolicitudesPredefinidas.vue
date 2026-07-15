<template>
  <div class="gestion-solicitudes-predefinidas">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-lg">⚡</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">Solicitudes Rápidas</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Configura solicitudes predefinidas para que los usuarios las usen rápidamente</p>
          </div>
        </div>
      </div>
      
      <div class="p-6">
        <!-- Formulario para agregar -->
        <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 class="font-semibold text-gray-800 dark:text-white mb-3">➕ Agregar nueva solicitud rápida</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
              <input
                v-model="nuevaSolicitud.titulo"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Reparación de impresora"
                @keyup.enter="agregarSolicitud"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (opcional)</label>
              <input
                v-model="nuevaSolicitud.descripcion"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Descripción breve"
                @keyup.enter="agregarSolicitud"
              />
            </div>
            <div class="flex items-end gap-2">
              <div class="flex-1">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
                <select
                  v-model="nuevaSolicitud.prioridad"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <button
                @click="agregarSolicitud"
                :disabled="agregando || !nuevaSolicitud.titulo.trim()"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition whitespace-nowrap"
              >
                {{ agregando ? 'Agregando...' : 'Agregar' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Lista de solicitudes -->
        <div v-if="cargando" class="text-center py-8">
          <div class="animate-pulse text-gray-500 dark:text-gray-400">Cargando solicitudes...</div>
        </div>
        
        <div v-else-if="solicitudes.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">📋</span>
          </div>
          <p class="text-gray-500 dark:text-gray-400">No hay solicitudes predefinidas</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">Agrega las solicitudes más comunes para que los usuarios las usen rápidamente</p>
        </div>
        
        <div v-else class="space-y-2">
          <div
            v-for="solicitud in solicitudes"
            :key="solicitud._id"
            class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
          >
            <div class="flex items-center gap-3 flex-1">
              <span :class="prioridadColorClass(solicitud.prioridad)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ prioridadLabel(solicitud.prioridad) }}
              </span>
              <div>
                <p class="font-medium text-gray-800 dark:text-white">{{ solicitud.titulo }}</p>
                <p v-if="solicitud.descripcion" class="text-xs text-gray-500 dark:text-gray-400">{{ solicitud.descripcion }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="editarSolicitud(solicitud)"
                class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                title="Editar"
              >
                ✏️
              </button>
              <button
                @click="eliminarSolicitud(solicitud._id)"
                class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <!-- Total -->
        <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Total: <span class="font-medium">{{ solicitudes.length }}</span> solicitudes predefinidas
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig();
const solicitudes = ref([]);
const cargando = ref(false);
const agregando = ref(false);

const nuevaSolicitud = ref({
  titulo: '',
  descripcion: '',
  prioridad: 'media'
});

const prioridadColorClass = (prioridad) => {
  const map = {
    baja: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    media: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    urgente: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  };
  return map[prioridad] || map.media;
};

const prioridadLabel = (prioridad) => {
  const map = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    urgente: 'Urgente'
  };
  return map[prioridad] || 'Media';
};

const cargarSolicitudes = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`${config.public.apiBase}/configuracion/solicitudes-predefinidas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.success) {
      solicitudes.value = response.solicitudes || [];
    }
  } catch (error) {
    console.error('Error cargando solicitudes:', error);
    alert('Error al cargar las solicitudes predefinidas');
  } finally {
    cargando.value = false;
  }
};

const agregarSolicitud = async () => {
  const titulo = nuevaSolicitud.value.titulo.trim();
  if (!titulo) return;
  
  agregando.value = true;
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`${config.public.apiBase}/configuracion/solicitudes-predefinidas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        titulo,
        descripcion: nuevaSolicitud.value.descripcion || '',
        prioridad: nuevaSolicitud.value.prioridad
      }
    });
    
    if (response.success) {
      solicitudes.value.push(response.solicitud);
      nuevaSolicitud.value = { titulo: '', descripcion: '', prioridad: 'media' };
      alert('✅ Solicitud agregada exitosamente');
    }
  } catch (error) {
    console.error('Error agregando solicitud:', error);
    alert(error.data?.message || 'Error al agregar la solicitud');
  } finally {
    agregando.value = false;
  }
};

const editarSolicitud = (solicitud) => {
  // Implementar edición simple con prompt
  const nuevoTitulo = prompt('Editar título:', solicitud.titulo);
  if (nuevoTitulo && nuevoTitulo.trim() !== solicitud.titulo) {
    actualizarSolicitud(solicitud._id, { titulo: nuevoTitulo.trim() });
  }
};

const actualizarSolicitud = async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`${config.public.apiBase}/configuracion/solicitudes-predefinidas/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: data
    });
    
    if (response.success) {
      const index = solicitudes.value.findIndex(s => s._id === id);
      if (index !== -1) {
        solicitudes.value[index] = response.solicitud;
      }
      alert('✅ Solicitud actualizada');
    }
  } catch (error) {
    console.error('Error actualizando solicitud:', error);
    alert('Error al actualizar la solicitud');
  }
};

const eliminarSolicitud = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta solicitud predefinida?')) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`${config.public.apiBase}/configuracion/solicitudes-predefinidas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.success) {
      solicitudes.value = solicitudes.value.filter(s => s._id !== id);
      alert('✅ Solicitud eliminada');
    }
  } catch (error) {
    console.error('Error eliminando solicitud:', error);
    alert('Error al eliminar la solicitud');
  }
};

onMounted(() => {
  cargarSolicitudes();
});
</script>