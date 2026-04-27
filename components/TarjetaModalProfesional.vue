<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slideUp">
      <!-- Header -->
      <div class="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-lg">📋</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">{{ tarjeta.titulo }}</h3>
            <p class="text-xs text-gray-400">ID: #{{ tarjeta._id?.slice(-8) }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
          ✕
        </button>
      </div>
      
      <div class="p-5 space-y-5">
        <!-- Badges y estado -->
        <div class="flex flex-wrap gap-2 items-center">
          <span class="px-3 py-1 rounded-full text-sm font-medium" :class="prioridadColor">
            {{ prioridadTexto }}
          </span>
          <span class="px-3 py-1 rounded-full text-sm font-medium" :class="estadoColor">
            {{ estadoTexto }}
          </span>
          <span v-if="tarjeta.estado === 'en_progreso'" 
                class="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                :class="tarjeta.estadoProgreso === 'activa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
            <span v-if="tarjeta.estadoProgreso === 'activa'" class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span v-else>⏸️</span>
            {{ tarjeta.estadoProgreso === 'activa' ? 'En ejecución' : 'Pausada' }}
          </span>
        </div>
        
        <!-- Descripción -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 mb-2 text-sm">📝 Descripción</h4>
          <p class="text-gray-600">{{ tarjeta.descripcion || 'Sin descripción' }}</p>
        </div>
        
        <!-- Información adicional -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-blue-50 rounded-lg p-3">
            <p class="text-xs text-blue-600 font-medium">👤 Asignado a</p>
            <p class="text-sm font-semibold text-gray-800">{{ tarjeta.asignadoA?.nombre || 'Sin asignar' }}</p>
          </div>
          <div class="bg-purple-50 rounded-lg p-3">
            <p class="text-xs text-purple-600 font-medium">📅 Creada</p>
            <p class="text-sm font-semibold text-gray-800">{{ formatDate(tarjeta.createdAt) }}</p>
          </div>
        </div>
        
        <!-- Progreso -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <h4 class="font-semibold text-gray-700">📊 Progreso</h4>
            <span class="text-2xl font-bold" :class="progresoColor">{{ tarjeta.porcentajeCompletado }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="rounded-full h-3 transition-all duration-500" :class="progresoBarraColor" :style="{ width: `${tarjeta.porcentajeCompletado}%` }"></div>
          </div>
        </div>
        
        <!-- Tiempo -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 mb-3">⏱️ Tiempo</h4>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-xs text-gray-500">Estimado</p>
              <p class="text-lg font-bold text-blue-600">{{ formatTiempo(tarjeta.tiempoEstimadoEmpleado) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Trabajado</p>
              <p class="text-lg font-bold text-green-600">{{ formatTiempoTrabajado() }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Restante</p>
              <p class="text-lg font-bold" :class="tiempoRestanteClass">{{ formatTiempoRestante() }}</p>
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex gap-3 pt-3">
          <button 
            v-if="puedeAutoAsignar" 
            @click="autoAsignar" 
            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition font-medium"
          >
            🎯 Auto-asignarme
          </button>
          
          <button 
            v-if="puedeIniciar" 
            @click="abrirModalIniciar" 
            class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium"
          >
            🚀 Iniciar tarea
          </button>
          
          <button 
            v-if="puedeReanudar" 
            @click="reanudarTarea" 
            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition font-medium"
          >
            ▶️ Reanudar
          </button>
          
          <button 
            v-if="puedePausar" 
            @click="pausarTarea" 
            class="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition font-medium"
          >
            ⏸️ Pausar
          </button>
          
          <button 
            v-if="puedeAprobar" 
            @click="aprobarTarea" 
            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition font-medium"
          >
            ✅ Aprobar tarea
          </button>
        </div>
      </div>
    </div>
    
    <ModalTiempoEstimado
      v-if="modalIniciar"
      :tarjeta="tarjeta"
      @tiempo-establecido="handleTiempoEstablecido"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useTarjetasStore } from '~/stores/tarjetas';
import ModalTiempoEstimado from './ModalTiempoEstimado.vue';

const props = defineProps({
  tarjeta: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'update']);

const authStore = useAuthStore();
const tarjetasStore = useTarjetasStore();
const config = useRuntimeConfig();

const modalIniciar = ref(false);

const esAsignadoAMi = computed(() => {
  return props.tarjeta.asignadoA?._id === authStore.user?._id;
});

const puedeAutoAsignar = computed(() => {
  return !props.tarjeta.asignadoA && 
         (authStore.isEmpleado || authStore.isJefe) && 
         props.tarjeta.estado === 'pendiente';
});

const puedeIniciar = computed(() => {
  return esAsignadoAMi.value && 
         props.tarjeta.estado === 'en_progreso' && 
         props.tarjeta.tiempoEstimadoEmpleado === 0;
});

const puedeReanudar = computed(() => {
  return esAsignadoAMi.value && 
         props.tarjeta.estado === 'en_progreso' && 
         props.tarjeta.estadoProgreso === 'pausada' &&
         props.tarjeta.tiempoEstimadoEmpleado > 0;
});

const puedePausar = computed(() => {
  return esAsignadoAMi.value && 
         props.tarjeta.estado === 'en_progreso' && 
         props.tarjeta.estadoProgreso === 'activa';
});

const puedeAprobar = computed(() => {
  return authStore.isJefe && props.tarjeta.estado === 'revision_jefe';
});

const prioridadMap = {
  baja: { texto: 'Baja', color: 'bg-gray-100 text-gray-700' },
  media: { texto: 'Media', color: 'bg-blue-100 text-blue-700' },
  alta: { texto: 'Alta', color: 'bg-orange-100 text-orange-700' },
  urgente: { texto: 'Urgente', color: 'bg-red-100 text-red-700' }
};

const estadoMap = {
  pendiente: { texto: '📋 Pendiente', color: 'bg-gray-100 text-gray-700' },
  en_progreso: { texto: '⚙️ En Progreso', color: 'bg-blue-100 text-blue-700' },
  revision_jefe: { texto: '👔 Revisión Jefe', color: 'bg-orange-100 text-orange-700' },
  revision_cliente: { texto: '⭐ Revisión Cliente', color: 'bg-yellow-100 text-yellow-700' },
  finalizada: { texto: '🏁 Finalizada', color: 'bg-green-100 text-green-700' }
};

const prioridadTexto = computed(() => prioridadMap[props.tarjeta.prioridad]?.texto || 'Media');
const prioridadColor = computed(() => prioridadMap[props.tarjeta.prioridad]?.color || prioridadMap.media.color);
const estadoTexto = computed(() => estadoMap[props.tarjeta.estado]?.texto || props.tarjeta.estado);
const estadoColor = computed(() => estadoMap[props.tarjeta.estado]?.color || 'bg-gray-100 text-gray-700');

const progresoColor = computed(() => {
  if (props.tarjeta.porcentajeCompletado >= 80) return 'text-green-600';
  if (props.tarjeta.porcentajeCompletado >= 50) return 'text-blue-600';
  return 'text-gray-600';
});

const progresoBarraColor = computed(() => {
  if (props.tarjeta.porcentajeCompletado >= 80) return 'bg-green-500';
  if (props.tarjeta.porcentajeCompletado >= 50) return 'bg-blue-500';
  return 'bg-gray-500';
});

const tiempoRestanteClass = computed(() => {
  const restante = calcularTiempoRestante();
  if (restante <= 0) return 'text-green-600';
  if (restante < 30) return 'text-red-600 animate-pulse';
  return 'text-orange-600';
});

const formatDate = (date) => {
  return new Date(date).toLocaleString('es-ES');
};

const formatTiempo = (minutos) => {
  if (!minutos || minutos === 0) return '0 min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'h' : 'h'}`;
  return `${horas}h ${mins}min`;
};

const calcularTiempoTrabajado = () => {
  let tiempo = props.tarjeta.tiempoAcumulado || 0;
  if (props.tarjeta.estadoProgreso === 'activa' && props.tarjeta.fechaUltimaReanudacion) {
    tiempo += Math.floor((new Date() - new Date(props.tarjeta.fechaUltimaReanudacion)) / 1000 / 60);
  }
  return tiempo;
};

const calcularTiempoRestante = () => {
  const estimado = props.tarjeta.tiempoEstimadoEmpleado || 0;
  const trabajado = calcularTiempoTrabajado();
  return Math.max(0, estimado - trabajado);
};

const formatTiempoTrabajado = () => {
  return formatTiempo(calcularTiempoTrabajado());
};

const formatTiempoRestante = () => {
  return formatTiempo(calcularTiempoRestante());
};

const autoAsignar = async () => {
  await tarjetasStore.autoAsignar(props.tarjeta._id);
  emit('update');
  emit('close');
};

const abrirModalIniciar = () => {
  modalIniciar.value = true;
};

const handleTiempoEstablecido = () => {
  modalIniciar.value = false;
  emit('update');
  emit('close');
};

const pausarTarea = async () => {
  const token = localStorage.getItem('token');
  await $fetch(`${config.public.apiBase}/tarjetas/${props.tarjeta._id}/pausar`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  emit('update');
  emit('close');
};

const reanudarTarea = async () => {
  const token = localStorage.getItem('token');
  const response = await $fetch(`${config.public.apiBase}/tarjetas/${props.tarjeta._id}/reanudar`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.success) {
    emit('update');
    emit('close');
  }
};

const aprobarTarea = async () => {
  const token = localStorage.getItem('token');
  await $fetch(`${config.public.apiBase}/tarjetas/${props.tarjeta._id}/aprobar-jefe`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  emit('update');
  emit('close');
};
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>