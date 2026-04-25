<template>
  <div class="estado-empleados bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">👥 Estado de Empleados en Tiempo Real</h2>
      <button 
        @click="refrescar" 
        :disabled="refrescando"
        class="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
      >
        <span>🔄</span> {{ refrescando ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>
    
    <div v-if="cargando" class="text-center py-8">
      <div class="animate-pulse text-gray-500">Cargando estado de empleados...</div>
    </div>
    
    <div v-else-if="estadosEmpleados.length === 0" class="text-center py-8 text-gray-500">
      No hay empleados registrados
    </div>
    
    <div v-else class="space-y-3">
      <div 
        v-for="emp in estadosEmpleados" 
        :key="emp.empleadoId"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        :class="emp.tarea ? 'bg-green-50 border-green-200' : 'bg-gray-50'"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-800">{{ emp.empleadoNombre }}</span>
              <span :class="emp.tarea ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" 
                    class="text-xs px-2 py-0.5 rounded-full">
                {{ emp.tarea ? '🟢 Ocupado' : '⚪ Disponible' }}
              </span>
              <span v-if="emp.rol === 'jefe'" class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                👔 Jefe
              </span>
            </div>
            <p class="text-xs text-gray-500">{{ emp.empleadoEmail }}</p>
          </div>
          <div v-if="emp.tarea && emp.tarea.tiempoRestante !== null" class="text-right">
            <span class="text-xs text-gray-500">Tiempo restante</span>
            <p class="text-lg font-bold" :class="emp.tarea.tiempoRestante < 5 ? 'text-red-600 animate-pulse' : 'text-blue-600'">
              {{ formatTiempoRestante(emp.tarea.tiempoRestante) }}
            </p>
          </div>
          <div v-else-if="emp.tarea && emp.tarea.tiempoRestante === null" class="text-right">
            <span class="text-xs text-gray-500">Estado</span>
            <p class="text-sm font-medium text-green-600">En progreso</p>
          </div>
        </div>
        
        <div v-if="emp.tarea" class="mt-3 pt-3 border-t border-green-200">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-medium text-gray-700">📋 {{ emp.tarea.titulo }}</span>
            <span class="text-xs text-gray-500">{{ emp.tarea.porcentajeCompletado }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              class="bg-blue-600 rounded-full h-2 transition-all duration-500"
              :style="{ width: `${emp.tarea.porcentajeCompletado}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-600 line-clamp-2">{{ emp.tarea.descripcion || 'Sin descripción' }}</p>
          
          <div class="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
            <div v-if="emp.tarea.tiempoEstimado > 0">
              ⏱️ Estimado: {{ formatTiempo(emp.tarea.tiempoEstimado) }}
            </div>
            <div v-if="emp.tarea.tiempoTranscurrido > 0">
              ⏲️ Transcurrido: {{ formatTiempo(emp.tarea.tiempoTranscurrido) }}
            </div>
            <div v-if="emp.tarea.fechaEstimadaFin">
              🎯 Finaliza: {{ formatFechaHora(emp.tarea.fechaEstimadaFin) }}
            </div>
            <div v-if="emp.tarea.fechaInicio">
              📅 Inicio: {{ formatFechaHora(emp.tarea.fechaInicio) }}
            </div>
          </div>
        </div>
        
        <div v-else class="mt-2 text-sm text-gray-500">
          Esperando nueva tarea...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const estadosEmpleados = ref([]);
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
  if (minutos <= 0) return '✅ Tiempo cumplido'; // Cambiado de "Finalizando..."
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

const cargarEstadoEmpleados = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/estado-empleados`;
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    estadosEmpleados.value = response;
  } catch (error) {
    console.error('Error cargando estado empleados:', error);
  }
};

const refrescar = async () => {
  refrescando.value = true;
  await cargarEstadoEmpleados();
  setTimeout(() => {
    refrescando.value = false;
  }, 500);
};

const actualizarEstadoTiempoReal = (data) => {
  console.log('Actualización en tiempo real:', data);
  cargarEstadoEmpleados();
};

if (process.client) {
  window.registerEstadoUpdateCallback(actualizarEstadoTiempoReal);
}

onMounted(async () => {
  cargando.value = true;
  await cargarEstadoEmpleados();
  cargando.value = false;
  
  intervaloActualizacion = setInterval(() => {
    cargarEstadoEmpleados();
  }, 30000);
});

onUnmounted(() => {
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