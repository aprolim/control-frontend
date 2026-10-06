<template>
  <div
    class="tarjeta-profesional bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300"
    :class="{ 
      'border-l-4': true, 
      'border-l-green-500': tarjeta.estadoProgreso === 'activa', 
      'border-l-yellow-500': tarjeta.estadoProgreso === 'pausada' 
    }"
    @click="$emit('click')"
  >
    <!-- Header -->
    <div class="flex justify-between items-start mb-2">
      <div class="flex-1">
        <h4 class="font-semibold text-gray-900 line-clamp-1">{{ tarjeta.titulo }}</h4>
        <p class="text-xs text-gray-400 mt-0.5 font-mono">#{{ tarjeta._id?.slice(-6) }}</p>
      </div>
      <div class="flex gap-1 ml-2">
        <span :class="prioridadClass" class="px-2 py-0.5 rounded-full text-xs font-medium">
          {{ prioridadTexto }}
        </span>
      </div>
    </div>
    
    <!-- Descripción -->
    <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ tarjeta.descripcion || 'Sin descripción' }}</p>
    
    <!-- Progreso -->
    <div class="space-y-2">
      <div class="flex justify-between text-xs">
        <span class="text-gray-500">Progreso</span>
        <span class="font-medium" :class="progresoColor">{{ progresoMostrado }}%</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-1.5">
        <div
          class="rounded-full h-1.5 transition-all duration-1000 ease-linear"
          :class="progresoBarraColor"
          :style="{ width: `${progresoMostrado}%` }"
        ></div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
      <div class="flex items-center gap-1.5">
        <div class="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <span class="text-[10px] font-medium text-white">{{ inicialesAsignado }}</span>
        </div>
        <span class="text-xs text-gray-600">{{ nombreAsignado }}</span>
      </div>
      
      <div class="flex items-center gap-1 text-xs text-gray-400">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ tiempoMostrado }}</span>
      </div>
    </div>
    
    <!-- Badge de estado activo -->
    <div v-if="tarjeta.estadoProgreso === 'activa'" class="absolute -top-2 -right-2">
      <span class="relative flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  tarjeta: {
    type: Object,
    required: true
  }
});

defineEmits(['click']);

// 🔥 Ref reactivo para recálculo en vivo cada segundo
const ahora = ref(Date.now());
let intervaloTick = null;

onMounted(() => {
  intervaloTick = setInterval(() => {
    ahora.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (intervaloTick) {
    clearInterval(intervaloTick);
    intervaloTick = null;
  }
});

// ============================================================
// 🔥 CÁLCULO DE PROGRESO EN VIVO (CORREGIDO)
// Funciona tanto para tareas activas como pausadas
// ============================================================

const calcularProgreso = () => {
  if (!props.tarjeta) return 0;
  
  // Si no hay tiempo estimado, usar el porcentaje guardado
  if (!props.tarjeta.tiempoEstimadoEmpleado || props.tarjeta.tiempoEstimadoEmpleado <= 0) {
    return props.tarjeta.porcentajeCompletado || 0;
  }
  
  const tiempoEstimado = props.tarjeta.tiempoEstimadoEmpleado;
  let tiempoTotal = props.tarjeta.tiempoAcumulado || 0;
  
  // 🔥 Si está ACTIVA, sumar el tiempo desde la última reanudación
  if (props.tarjeta.estadoProgreso === 'activa' && props.tarjeta.fechaUltimaReanudacion) {
    const inicio = new Date(props.tarjeta.fechaUltimaReanudacion).getTime();
    const minutosDesdeReanudacion = Math.floor((ahora.value - inicio) / 1000 / 60);
    tiempoTotal += minutosDesdeReanudacion;
  }
  
  // 🔥 Calcular SIEMPRE basado en tiempo (funciona para activa y pausada)
  let progreso = Math.min(100, Math.floor((tiempoTotal / tiempoEstimado) * 100));
  progreso = Math.max(progreso, props.tarjeta.porcentajeCompletado || 0);
  
  return Math.min(100, progreso);
};

const calcularTiempoRestante = () => {
  if (!props.tarjeta) return 0;
  if (!props.tarjeta.tiempoEstimadoEmpleado || props.tarjeta.tiempoEstimadoEmpleado <= 0) return 0;
  
  let tiempoTotal = props.tarjeta.tiempoAcumulado || 0;
  
  if (props.tarjeta.estadoProgreso === 'activa' && props.tarjeta.fechaUltimaReanudacion) {
    const inicio = new Date(props.tarjeta.fechaUltimaReanudacion).getTime();
    const minutosDesdeReanudacion = Math.floor((ahora.value - inicio) / 1000 / 60);
    tiempoTotal += minutosDesdeReanudacion;
  }
  
  return Math.max(0, props.tarjeta.tiempoEstimadoEmpleado - tiempoTotal);
};

// ============================================================
// COMPUTED
// ============================================================

const prioridadMap = {
  baja: { texto: 'Baja', class: 'bg-gray-100 text-gray-600' },
  media: { texto: 'Media', class: 'bg-blue-100 text-blue-700' },
  alta: { texto: 'Alta', class: 'bg-orange-100 text-orange-700' },
  urgente: { texto: 'Urgente', class: 'bg-red-100 text-red-700' }
};

const prioridadTexto = computed(() => prioridadMap[props.tarjeta.prioridad]?.texto || 'Media');
const prioridadClass = computed(() => prioridadMap[props.tarjeta.prioridad]?.class || prioridadMap.media.class);

const progresoMostrado = computed(() => calcularProgreso());

const progresoColor = computed(() => {
  const p = progresoMostrado.value;
  if (p >= 80) return 'text-emerald-600';
  if (p >= 50) return 'text-blue-600';
  return 'text-gray-600';
});

const progresoBarraColor = computed(() => {
  if (props.tarjeta.estadoProgreso === 'activa') return 'bg-emerald-500';
  if (props.tarjeta.estadoProgreso === 'pausada') return 'bg-amber-500';
  const p = progresoMostrado.value;
  if (p >= 80) return 'bg-emerald-500';
  if (p >= 50) return 'bg-blue-500';
  return 'bg-gray-500';
});

const nombreAsignado = computed(() => {
  return props.tarjeta.asignadoA?.nombre?.split(' ')[0] || 'Sin asignar';
});

const inicialesAsignado = computed(() => {
  const nombre = props.tarjeta.asignadoA?.nombre || '';
  return nombre.charAt(0).toUpperCase() || '?';
});

const tiempoMostrado = computed(() => {
  const restante = calcularTiempoRestante();
  
  if (props.tarjeta.estadoProgreso === 'pausada') {
    return '⏸️ Pausada';
  }
  
  if (restante <= 0) return '✅ Listo';
  
  const horas = Math.floor(restante / 60);
  const mins = restante % 60;
  if (horas === 0) return `${mins}min`;
  return `${horas}h ${mins}min`;
});
</script>

<style scoped>
.tarjeta-profesional {
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tarjeta-profesional:hover {
  transform: translateY(-2px);
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>