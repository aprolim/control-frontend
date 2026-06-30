<template>
  <div class="configuracion-auto-cierre">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-lg">⚙️</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">Auto-cierre de Tareas</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Configura cuándo y cómo se auto-finalizan las tareas</p>
          </div>
        </div>
      </div>
      
      <div class="p-6">
        <!-- Switch principal -->
        <div class="mb-6 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white">🔘 Habilitar Auto-cierre</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Las tareas se revisarán automáticamente según los días configurados</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="configuracion.habilitado" class="sr-only peer" @change="guardarConfiguracion">
            <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <!-- Columnas a revisar -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📋 ¿Qué columnas revisar?</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2">
              <input type="radio" v-model="configuracion.revisarColumna" value="revision_cliente" class="text-blue-600 dark:text-blue-400">
              <span class="text-gray-700 dark:text-gray-300">Solo Revisión Cliente</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="radio" v-model="configuracion.revisarColumna" value="revision_jefe" class="text-blue-600 dark:text-blue-400">
              <span class="text-gray-700 dark:text-gray-300">Solo Revisión Jefe</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="radio" v-model="configuracion.revisarColumna" value="ambas" class="text-blue-600 dark:text-blue-400">
              <span class="text-gray-700 dark:text-gray-300">Ambas columnas</span>
            </label>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Días máximos cliente -->
          <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              👥 Días máximos para Cliente
            </label>
            <div class="flex items-center gap-3">
              <input
                v-model.number="configuracion.diasMaximosCliente"
                type="number"
                min="1"
                max="30"
                class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                @change="guardarConfiguracion"
              />
              <span class="text-gray-600 dark:text-gray-400">días</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Tiempo que tiene el cliente para calificar</p>
          </div>
          
          <!-- Días máximos jefe -->
          <div class="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              👔 Días máximos para Jefe
            </label>
            <div class="flex items-center gap-3">
              <input
                v-model.number="configuracion.diasMaximosJefe"
                type="number"
                min="1"
                max="15"
                class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                @change="guardarConfiguracion"
              />
              <span class="text-gray-600 dark:text-gray-400">días</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Tiempo que tiene el jefe para aprobar</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Acción automática -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">⚡ Acción al vencer</label>
            <select
              v-model="configuracion.accionAuto"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              @change="guardarConfiguracion"
            >
              <option value="finalizar">✅ Finalizar tarea automáticamente</option>
              <option value="notificar_jefe">📢 Notificar al jefe</option>
              <option value="escalar">🔄 Reabrir y reasignar</option>
              <option value="reabrir">🔁 Reabrir la tarea</option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ textoAccion }}
            </p>
          </div>
          
          <!-- Notificar antes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🔔 Notificar antes de vencer</label>
            <div class="flex items-center gap-3">
              <input
                v-model.number="configuracion.notificarAntesDias"
                type="number"
                min="0"
                max="5"
                class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                @change="guardarConfiguracion"
              />
              <span class="text-gray-600 dark:text-gray-400">días antes</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Enviar recordatorio al cliente y empleado</p>
          </div>
        </div>
        
        <!-- Excepciones de empleados -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">👥 Empleados excluidos</label>
          <select
            v-model="empleadoSeleccionado"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-2"
          >
            <option value="">-- Seleccionar empleado --</option>
            <option v-for="emp in empleados" :key="emp._id" :value="emp._id">
              {{ emp.nombre }} - {{ emp.email }}
            </option>
          </select>
          <button
            @click="agregarExcepcion"
            :disabled="!empleadoSeleccionado"
            class="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition mb-3"
          >
            + Agregar excepción
          </button>
          
          <div class="flex flex-wrap gap-2">
            <div
              v-for="empId in configuracion.excepcionesEmpleados"
              :key="empId"
              class="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center gap-2"
            >
              <span class="text-gray-700 dark:text-gray-300">{{ getEmpleadoNombre(empId) }}</span>
              <button @click="removerExcepcion(empId)" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">✕</button>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Los empleados excluidos no serán afectados por el auto-cierre</p>
        </div>
        
        <!-- Resumen de configuración -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
          <h4 class="font-semibold text-gray-800 dark:text-white mb-2">📊 Resumen de configuración</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-gray-600 dark:text-gray-400">Estado:</div>
            <div :class="configuracion.habilitado ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400'">
              {{ configuracion.habilitado ? 'Activo' : 'Inactivo' }}
            </div>
            <div class="text-gray-600 dark:text-gray-400">Columnas revisadas:</div>
            <div class="text-gray-800 dark:text-gray-200">{{ textoColumna }}</div>
            <div class="text-gray-600 dark:text-gray-400">Tiempo cliente:</div>
            <div class="text-gray-800 dark:text-gray-200">{{ configuracion.diasMaximosCliente }} días</div>
            <div class="text-gray-600 dark:text-gray-400">Tiempo jefe:</div>
            <div class="text-gray-800 dark:text-gray-200">{{ configuracion.diasMaximosJefe }} días</div>
            <div class="text-gray-600 dark:text-gray-400">Acción:</div>
            <div class="text-gray-800 dark:text-gray-200">{{ textoAccion }}</div>
            <div class="text-gray-600 dark:text-gray-400">Notificación:</div>
            <div class="text-gray-800 dark:text-gray-200">{{ configuracion.notificarAntesDias === 0 ? 'No notificar' : configuracion.notificarAntesDias + ' días antes' }}</div>
            <div class="text-gray-600 dark:text-gray-400">Excluidos:</div>
            <div class="text-gray-800 dark:text-gray-200">{{ configuracion.excepcionesEmpleados?.length || 0 }} empleados</div>
          </div>
        </div>
        
        <!-- Botón de guardar -->
        <button
          @click="guardarConfiguracion"
          :disabled="guardando"
          class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium disabled:opacity-50 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900"
        >
          {{ guardando ? 'Guardando...' : '💾 Guardar configuración' }}
        </button>
      </div>
    </div>
    
    <!-- Estadísticas de auto-cierre -->
    <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <h3 class="font-semibold text-gray-800 dark:text-white">📈 Estadísticas de Auto-cierre</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ estadisticas.totalAutoFinalizadas || 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Tareas auto-finalizadas</p>
            <p class="text-xs text-gray-400 dark:text-gray-500">Últimos 30 días</p>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ estadisticas.clientesSinRevisar || 0 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Clientes sin revisión</p>
            <p class="text-xs text-gray-400 dark:text-gray-500">Tareas pendientes</p>
          </div>
          <div class="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ configuracion.diasMaximosCliente || 5 }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Días configurados</p>
            <p class="text-xs text-gray-400 dark:text-gray-500">Para revisión de cliente</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig();
const guardando = ref(false);
const empleadoSeleccionado = ref('');
const empleados = ref([]);

const configuracion = ref({
  revisarColumna: 'revision_cliente',
  diasMaximosCliente: 5,
  diasMaximosJefe: 3,
  accionAuto: 'finalizar',
  notificarAntesDias: 1,
  habilitado: true,
  excepcionesEmpleados: []
});

const estadisticas = ref({
  totalAutoFinalizadas: 0,
  clientesSinRevisar: 0
});

const textoColumna = computed(() => {
  const mapa = {
    revision_cliente: 'Solo Revisión Cliente',
    revision_jefe: 'Solo Revisión Jefe',
    ambas: 'Ambas columnas'
  };
  return mapa[configuracion.value.revisarColumna] || 'No definido';
});

const textoAccion = computed(() => {
  const mapa = {
    finalizar: 'Finalizar tarea automáticamente',
    notificar_jefe: 'Notificar al jefe',
    escalar: 'Reabrir y reasignar',
    reabrir: 'Reabrir la tarea'
  };
  return mapa[configuracion.value.accionAuto] || '';
});

const cargarConfiguracion = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`${config.public.apiBase}/configuracion/auto-cierre`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    configuracion.value = response.configuracion;
    empleados.value = response.empleados;
  } catch (error) {
    console.error('Error cargando configuración:', error);
  }
};

const cargarEstadisticas = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`${config.public.apiBase}/configuracion/auto-cierre/estadisticas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    estadisticas.value = response;
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
};

const guardarConfiguracion = async () => {
  guardando.value = true;
  try {
    const token = localStorage.getItem('token');
    await $fetch(`${config.public.apiBase}/configuracion/auto-cierre`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: configuracion.value
    });
    
    alert('✅ Configuración guardada exitosamente');
  } catch (error) {
    console.error('Error guardando configuración:', error);
    alert('Error al guardar la configuración');
  } finally {
    guardando.value = false;
  }
};

const agregarExcepcion = () => {
  if (empleadoSeleccionado.value && !configuracion.value.excepcionesEmpleados.includes(empleadoSeleccionado.value)) {
    configuracion.value.excepcionesEmpleados.push(empleadoSeleccionado.value);
    empleadoSeleccionado.value = '';
    guardarConfiguracion();
  }
};

const removerExcepcion = (empId) => {
  configuracion.value.excepcionesEmpleados = configuracion.value.excepcionesEmpleados.filter(id => id !== empId);
  guardarConfiguracion();
};

const getEmpleadoNombre = (empId) => {
  const emp = empleados.value.find(e => e._id === empId);
  return emp?.nombre || empId;
};

onMounted(() => {
  cargarConfiguracion();
  cargarEstadisticas();
});
</script>