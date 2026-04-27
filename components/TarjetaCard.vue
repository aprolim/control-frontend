<template>
  <div class="tarjeta-card bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4"
    :class="[prioridadBorder, estadoClaseBorde]">
    <div class="flex justify-between items-start mb-2">
      <h4 class="font-semibold text-gray-900 truncate flex-1">{{ tarjeta.titulo }}</h4>
      <div class="flex gap-1 ml-2">
        <!-- Estado de progreso (activa/pausada) -->
        <span v-if="tarjeta.estadoProgreso === 'activa'" 
              class="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1"
              title="En ejecución">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Activa
        </span>
        <span v-else-if="tarjeta.estadoProgreso === 'pausada'" 
              class="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1"
              title="Pausada">
          ⏸️ Pausada
        </span>
        <span v-else-if="tarjeta.estadoProgreso === 'pendiente' && tarjeta.tiempoEstimadoEmpleado === 0" 
              class="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full"
              title="Sin iniciar">
          ⏳ Pendiente
        </span>
        
        <!-- Prioridad -->
        <span :class="prioridadColor" class="px-2 py-1 rounded-full text-xs font-medium">
          {{ prioridadTexto }}
        </span>
      </div>
    </div>
    
    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
      {{ tarjeta.descripcion || 'Sin descripción' }}
    </p>
    
    <div class="space-y-2">
      <div class="flex justify-between text-xs text-gray-500">
        <span>Progreso: {{ progresoMostrado }}%</span>
        <span>⏱️ {{ tiempoRealMostrado }} / {{ tiempoEstimadoFormateado }}</span>
      </div>
      
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="rounded-full h-2 transition-all duration-500"
          :class="progresoColorBarra"
          :style="{ width: `${progresoMostrado}%` }"
        ></div>
      </div>
      
      <div class="flex justify-between items-center text-xs">
        <div class="flex items-center gap-1 text-gray-600">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{{ tarjeta.asignadoA?.nombre || 'Sin asignar' }}</span>
        </div>
        
        <div v-if="tarjeta.calificacion?.puntaje" class="flex items-center gap-1">
          <svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{{ tarjeta.calificacion.puntaje }}</span>
        </div>
      </div>
      
      <div v-if="tarjeta.tipo === 'solicitud_cliente' && !tarjeta.clienteInfo?.logueado" class="text-xs text-gray-400 flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6-4h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
        </svg>
        <span>Solicitud anónima</span>
      </div>
      
      <div v-if="tarjeta.tipo === 'solicitud_cliente' && tarjeta.clienteInfo?.logueado" class="text-xs text-green-600 flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Cliente verificado ★</span>
      </div>
      
      <div v-if="tarjeta.tolerancias?.length" class="text-xs text-orange-600 flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ tarjeta.tolerancias.filter(t => t.estado === 'pendiente').length }} tolerancias pendientes</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  tarjeta: {
    type: Object,
    required: true
  }
});

const forceUpdate = ref(0);
let intervaloActualizacion = null;

const prioridadMap = {
  baja: { texto: 'Baja', color: 'bg-gray-100 text-gray-700', border: 'border-gray-300' },
  media: { texto: 'Media', color: 'bg-blue-100 text-blue-700', border: 'border-blue-500' },
  alta: { texto: 'Alta', color: 'bg-orange-100 text-orange-700', border: 'border-orange-500' },
  urgente: { texto: 'Urgente', color: 'bg-red-100 text-red-700', border: 'border-red-500' }
};

const prioridadTexto = computed(() => prioridadMap[props.tarjeta.prioridad]?.texto || 'Media');
const prioridadColor = computed(() => prioridadMap[props.tarjeta.prioridad]?.color || prioridadMap.media.color);
const prioridadBorder = computed(() => prioridadMap[props.tarjeta.prioridad]?.border || prioridadMap.media.border);

const estadoClaseBorde = computed(() => {
  if (props.tarjeta.estadoProgreso === 'activa') {
    return 'border-l-green-500';
  }
  if (props.tarjeta.estadoProgreso === 'pausada') {
    return 'border-l-yellow-500';
  }
  return '';
});

const progresoColorBarra = computed(() => {
  if (props.tarjeta.estadoProgreso === 'activa') {
    return 'bg-green-500';
  }
  return 'bg-primary-600';
});

const tiempoEstimadoFormateado = computed(() => {
  const totalMinutos = (props.tarjeta.tiempoEstimadoEmpleado || 0);
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  
  if (totalMinutos === 0) return 'Sin estimar';
  if (horas === 0) return `${minutos} min`;
  if (minutos === 0) return `${horas} ${horas === 1 ? 'h' : 'h'}`;
  return `${horas}h ${minutos}min`;
});

const calcularTiempoTotalTrabajado = () => {
  let tiempoTotal = props.tarjeta.tiempoAcumulado || 0;
  
  if (props.tarjeta.estadoProgreso === 'activa' && props.tarjeta.fechaUltimaReanudacion) {
    const ahora = new Date();
    const inicio = new Date(props.tarjeta.fechaUltimaReanudacion);
    const minutosDesdeReanudacion = Math.floor((ahora - inicio) / 1000 / 60);
    tiempoTotal += minutosDesdeReanudacion;
  }
  
  return tiempoTotal;
};

const formatoTiempo = (minutos) => {
  if (!minutos && minutos !== 0) return '0 min';
  if (minutos === 0) return '0 min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'h' : 'h'}`;
  return `${horas}h ${mins}min`;
};

const tiempoRealMostrado = computed(() => {
  const tiempoTotal = calcularTiempoTotalTrabajado();
  return formatoTiempo(tiempoTotal);
});

const progresoMostrado = computed(() => {
  const tiempoEstimado = props.tarjeta.tiempoEstimadoEmpleado || 0;
  
  if (tiempoEstimado > 0) {
    const tiempoTotal = calcularTiempoTotalTrabajado();
    const progresoPorTiempo = Math.min(100, Math.floor((tiempoTotal / tiempoEstimado) * 100));
    return Math.max(props.tarjeta.porcentajeCompletado || 0, progresoPorTiempo);
  }
  
  return props.tarjeta.porcentajeCompletado || 0;
});

const iniciarIntervalo = () => {
  if (intervaloActualizacion) clearInterval(intervaloActualizacion);
  
  if (props.tarjeta.estadoProgreso === 'activa') {
    intervaloActualizacion = setInterval(() => {
      forceUpdate.value++;
    }, 1000);
  }
};

const detenerIntervalo = () => {
  if (intervaloActualizacion) {
    clearInterval(intervaloActualizacion);
    intervaloActualizacion = null;
  }
};

watch(() => props.tarjeta.estadoProgreso, (nuevoEstado) => {
  if (nuevoEstado === 'activa') {
    iniciarIntervalo();
  } else {
    detenerIntervalo();
  }
}, { immediate: true });

watch(() => props.tarjeta, () => {
  forceUpdate.value++;
}, { deep: true });

onMounted(() => {
  if (props.tarjeta.estadoProgreso === 'activa') {
    iniciarIntervalo();
  }
});

onUnmounted(() => {
  detenerIntervalo();
});
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>