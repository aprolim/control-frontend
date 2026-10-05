<template>
  <div class="configuracion-notificaciones">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-lg">🔔</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">Notificaciones</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Configura cuándo y cómo suenan las alertas para los técnicos</p>
          </div>
        </div>
      </div>
      
      <div class="p-6 space-y-6">
        <!-- Info -->
        <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <span>ℹ️</span> ¿Cómo funcionan las notificaciones?
          </h4>
          <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Los técnicos recibirán sonidos y avisos visuales según los eventos configurados.</li>
            <li>Los cambios aquí se aplican a todos los técnicos activos.</li>
            <li>Cada técnico puede ajustar su propio volumen y silenciar temporalmente.</li>
          </ul>
        </div>
        
        <!-- 1. Recordatorio de pendientes -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                ⏰ Recordatorio de tareas pendientes
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Suena periódicamente cuando hay tareas sin asignar
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="formConfig.recordatorioPendientes.habilitado" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div v-if="formConfig.recordatorioPendientes.habilitado" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Intervalo entre avisos
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="formConfig.recordatorioPendientes.intervaloMinutos"
                  type="number"
                  min="1"
                  max="30"
                  class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <span class="text-gray-600 dark:text-gray-400 text-sm">minutos</span>
              </div>
            </div>
            
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="formConfig.recordatorioPendientes.sonidoHabilitado" class="rounded text-blue-600">
                <span class="text-sm text-gray-700 dark:text-gray-300">🔊 Sonido activado</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="formConfig.recordatorioPendientes.soloCuandoLibre" class="rounded text-blue-600">
                <span class="text-sm text-gray-700 dark:text-gray-300">Solo cuando el técnico está libre</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- 2. Nueva tarea pendiente -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                📋 Nueva tarea pendiente
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Suena cuando entra una nueva solicitud al sistema
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="formConfig.nuevaTareaPendiente.habilitado" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div v-if="formConfig.nuevaTareaPendiente.habilitado" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="formConfig.nuevaTareaPendiente.sonidoHabilitado" class="rounded text-blue-600">
              <span class="text-sm text-gray-700 dark:text-gray-300">🔊 Reproducir sonido</span>
            </label>
          </div>
        </div>
        
        <!-- 3. Tarea asignada por supervisor -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                📌 Tarea asignada por supervisor
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Suena cuando TÚ asignas una tarea específicamente a un técnico
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="formConfig.tareaAsignada.habilitado" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div v-if="formConfig.tareaAsignada.habilitado" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="formConfig.tareaAsignada.sonidoHabilitado" class="rounded text-blue-600">
              <span class="text-sm text-gray-700 dark:text-gray-300">🔊 Reproducir sonido distintivo</span>
            </label>
          </div>
        </div>
        
        <!-- Volumen global -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            🔊 Volumen (por defecto para nuevos técnicos)
          </h3>
          <div class="flex items-center gap-4">
            <input
              v-model.number="formConfig.volumen"
              type="range"
              min="0"
              max="1"
              step="0.05"
              class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span class="text-sm font-mono text-gray-600 dark:text-gray-400 w-12 text-right">
              {{ Math.round(formConfig.volumen * 100) }}%
            </span>
          </div>
        </div>
        
        <!-- Botón guardar -->
        <button
          @click="guardar"
          :disabled="guardando"
          class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium disabled:opacity-50 dark:from-blue-700 dark:to-blue-800"
        >
          {{ guardando ? 'Guardando...' : '💾 Guardar configuración' }}
        </button>
        
        <!-- Info final -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
          <p>💡 <strong>Nota:</strong> Esta configuración se aplica a todos los técnicos activos. Cada técnico puede silenciar temporalmente sus notificaciones.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 🔥 CORREGIDO: runtimeConfig para Nuxt, formConfig para el formulario
const runtimeConfig = useRuntimeConfig();
const guardando = ref(false);

const configuracionDefault = {
  recordatorioPendientes: {
    habilitado: true,
    intervaloMinutos: 2,
    sonidoHabilitado: true,
    soloCuandoLibre: true
  },
  nuevaTareaPendiente: {
    habilitado: true,
    sonidoHabilitado: true
  },
  tareaAsignada: {
    habilitado: true,
    sonidoHabilitado: true
  },
  volumen: 0.5
};

const formConfig = ref(JSON.parse(JSON.stringify(configuracionDefault)));

const cargar = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`${runtimeConfig.public.apiBase}/configuracion/notificaciones`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.success && response.configuracion) {
      // Mezclar con defaults para evitar campos undefined
      formConfig.value = {
        recordatorioPendientes: {
          ...configuracionDefault.recordatorioPendientes,
          ...response.configuracion.recordatorioPendientes
        },
        nuevaTareaPendiente: {
          ...configuracionDefault.nuevaTareaPendiente,
          ...response.configuracion.nuevaTareaPendiente
        },
        tareaAsignada: {
          ...configuracionDefault.tareaAsignada,
          ...response.configuracion.tareaAsignada
        },
        volumen: response.configuracion.volumen ?? 0.5
      };
      
      console.log('🔔 [Config Notificaciones] Cargada:', formConfig.value);
    }
  } catch (error) {
    console.error('❌ Error cargando config:', error);
  }
};

const guardar = async () => {
  guardando.value = true;
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`${runtimeConfig.public.apiBase}/configuracion/notificaciones`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formConfig.value
    });
    
    if (response.success) {
      alert('✅ Configuración guardada. Se aplicará a todos los técnicos.');
      console.log('✅ Guardado');
    }
  } catch (error) {
    console.error('❌ Error guardando:', error);
    alert('Error al guardar la configuración');
  } finally {
    guardando.value = false;
  }
};

onMounted(() => {
  cargar();
});
</script>