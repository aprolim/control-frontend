<template>
  <div class="estado-empleados bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white">👥 Estado de Técnicos en Tiempo Real</h2>
      <button 
        @click="refrescar" 
        :disabled="refrescando"
        class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center gap-1"
      >
        <span>🔄</span> {{ refrescando ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>
    
    <div v-if="cargando" class="text-center py-8">
      <div class="animate-pulse text-gray-500 dark:text-gray-400">Cargando estado de técnicos...</div>
    </div>
    
    <div v-else-if="estadosTecnicos.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      No hay técnicos registrados
    </div>
    
    <div v-else class="space-y-3">
      <div 
        v-for="tec in estadosTecnicos" 
        :key="tec.empleadoId"
        class="border rounded-lg p-4 hover:shadow-md transition"
        :class="[
          tec.tarea 
            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
        ]"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-800 dark:text-white">{{ tec.empleadoNombre }}</span>
              <span 
                :class="[
                  tec.tarea 
                    ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                ]" 
                class="text-xs px-2 py-0.5 rounded-full"
              >
                {{ tec.tarea ? '🟢 Ocupado' : '⚪ Disponible' }}
              </span>
              <span v-if="tec.rol === 'supervisor'" class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                👔 Supervisor
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ tec.empleadoEmail }}</p>
          </div>
          <div v-if="tec.tarea && tec.tarea.tiempoRestante !== null" class="text-right">
            <span class="text-xs text-gray-500 dark:text-gray-400">Tiempo restante</span>
            <p class="text-lg font-bold" :class="tec.tarea.tiempoRestante < 5 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-blue-600 dark:text-blue-400'">
              {{ formatTiempoRestante(tec.tarea.tiempoRestante) }}
            </p>
          </div>
          <div v-else-if="tec.tarea && tec.tarea.tiempoRestante === null" class="text-right">
            <span class="text-xs text-gray-500 dark:text-gray-400">Estado</span>
            <p class="text-sm font-medium text-green-600 dark:text-green-400">En progreso</p>
          </div>
        </div>
        
        <div v-if="tec.tarea" class="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">📋 {{ tec.tarea.titulo }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ tec.tarea.porcentajeCompletado }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div 
              class="bg-blue-600 dark:bg-blue-500 rounded-full h-2 transition-all duration-500"
              :style="{ width: `${tec.tarea.porcentajeCompletado}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{{ tec.tarea.descripcion || 'Sin descripción' }}</p>
          
          <div class="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div v-if="tec.tarea.tiempoEstimado > 0">
              ⏱️ Estimado: {{ formatTiempo(tec.tarea.tiempoEstimado) }}
            </div>
            <div v-if="tec.tarea.tiempoTranscurrido > 0">
              ⏲️ Transcurrido: {{ formatTiempo(tec.tarea.tiempoTranscurrido) }}
            </div>
            <div v-if="tec.tarea.fechaEstimadaFin">
              🎯 Finaliza: {{ formatFechaHora(tec.tarea.fechaEstimadaFin) }}
            </div>
            <div v-if="tec.tarea.fechaInicio">
              📅 Inicio: {{ formatFechaHora(tec.tarea.fechaInicio) }}
            </div>
          </div>
        </div>
        
        <div v-else class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Esperando nueva tarea...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
console.log('👥 [EstadoEmpleados] Componente cargado')

const config = useRuntimeConfig();
const estadosTecnicos = ref([]);
const cargando = ref(false);
const refrescando = ref(false);
let intervaloActualizacion = null;

const formatTiempo = (minutos) => {
  if (!minutos && minutos !== 0) return 'No establecido';
  if (minutos === 0) return '0 min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${mins}min`;
};

const formatTiempoRestante = (minutos) => {
  if (!minutos && minutos !== 0) return 'Calculando...';
  if (minutos <= 0) return '✅ Tiempo cumplido';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${mins}min`;
};

const formatFechaHora = (fecha) => {
  if (!fecha) return 'No definida';
  const d = new Date(fecha);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const cargarEstadoTecnicos = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/estado-empleados`;
    console.log('👥 [EstadoEmpleados] Cargando estado...')
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    estadosTecnicos.value = response;
    console.log(`✅ [EstadoEmpleados] ${response.length} técnicos cargados`)
  } catch (error) {
    console.error('❌ [EstadoEmpleados] Error:', error);
  }
};

const refrescar = async () => {
  refrescando.value = true;
  await cargarEstadoTecnicos();
  setTimeout(() => {
    refrescando.value = false;
  }, 500);
};

const actualizarEstadoTiempoReal = (data) => {
  console.log('👥 [EstadoEmpleados] Actualización en tiempo real:', data);
  cargarEstadoTecnicos();
};

if (process.client) {
  window.registerEstadoUpdateCallback(actualizarEstadoTiempoReal);
}

onMounted(async () => {
  console.log('✅ [EstadoEmpleados] Montado')
  cargando.value = true;
  await cargarEstadoTecnicos();
  cargando.value = false;
  
  intervaloActualizacion = setInterval(() => {
    cargarEstadoTecnicos();
  }, 30000);
});

onUnmounted(() => {
  console.log('🛑 [EstadoEmpleados] Desmontando')
  if (intervaloActualizacion) {
    clearInterval(intervaloActualizacion);
  }
});

defineExpose({
  refrescar
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>