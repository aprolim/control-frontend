<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slideUp">
      <!-- Header -->
      <div class="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-lg">📋</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">{{ tarjeta.titulo }}</h3>
            <p class="text-xs text-gray-400">ID: #{{ tarjeta._id?.slice(-8) }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
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
                :class="tarjeta.estadoProgreso === 'activa' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'">
            <span v-if="tarjeta.estadoProgreso === 'activa'" class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span v-else>⏸️</span>
            {{ tarjeta.estadoProgreso === 'activa' ? 'En ejecución' : 'Pausada' }}
          </span>
        </div>
        
        <!-- Descripción -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">📝 Descripción</h4>
          <p class="text-gray-600 dark:text-gray-400">{{ tarjeta.descripcion || 'Sin descripción' }}</p>
        </div>
        
        <!-- Información adicional -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
            <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">👤 Asignado a</p>
            <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ tarjeta.asignadoA?.nombre || 'Sin asignar' }}</p>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
            <p class="text-xs text-purple-600 dark:text-purple-400 font-medium">📅 Creada</p>
            <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDate(tarjeta.createdAt) }}</p>
          </div>
        </div>
        
        <!-- Progreso -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <h4 class="font-semibold text-gray-700 dark:text-gray-300">📊 Progreso</h4>
            <span class="text-2xl font-bold" :class="progresoColor">{{ tarjeta.porcentajeCompletado }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div class="rounded-full h-3 transition-all duration-500" :class="progresoBarraColor" :style="{ width: `${tarjeta.porcentajeCompletado}%` }"></div>
          </div>
        </div>
        
        <!-- ============================================================
             COMENTARIO DEL TÉCNICO (VISIBLE PARA SUPERVISOR Y TÉCNICO)
             ============================================================ -->
        <div v-if="tarjeta.registroHoras && tarjeta.registroHoras.length > 0" 
             class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm flex items-center gap-2">
            💬 Comentario del técnico
          </h4>
          <div v-for="(registro, index) in tarjeta.registroHoras.slice().reverse().filter(r => r.comentario)" :key="index" 
               class="border-b border-yellow-100 dark:border-yellow-800/50 last:border-0 py-2">
            <p class="text-sm text-gray-700 dark:text-gray-300">
              {{ registro.comentario }}
            </p>
            <div class="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>📅 {{ formatDate(registro.fecha) }}</span>
              <span>⏱️ Trabajó: {{ formatTiempo((registro.horasTrabajadas || 0) * 60 + (registro.minutosTrabajados || 0)) }}</span>
              <span>📊 {{ registro.porcentajeAvance }}%</span>
            </div>
          </div>
          <p v-if="!tarjeta.registroHoras.some(r => r.comentario)" class="text-sm text-gray-500 dark:text-gray-400 italic">
            El técnico no dejó comentario.
          </p>
        </div>
        
        <!-- ============================================================
             TIEMPO - INFORMACIÓN CORREGIDA
             ============================================================ -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">⏱️ Tiempo</h4>
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Tu tiempo estimado</p>
              <p class="text-lg font-bold" :class="tiempoEstimadoActual > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 dark:text-red-400'">
                {{ tiempoEstimadoActual > 0 ? formatTiempo(tiempoEstimadoActual) : 'No definido' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">⏱️ Tiempo real trabajado</p>
              <p class="text-lg font-bold text-green-600 dark:text-green-400">
                {{ tiempoRealTrabajadoFormateado }}
              </p>
              <p class="text-[10px] text-gray-400" v-if="tiempoEstimadoActual > 0 && tiempoRealTrabajado > 0">
                <span v-if="tiempoRealTrabajado <= tiempoEstimadoActual" class="text-green-500">
                  ✅ {{ formatTiempo(tiempoEstimadoActual - tiempoRealTrabajado) }} menos de lo estimado
                </span>
                <span v-else class="text-orange-500">
                  ⚠️ {{ formatTiempo(tiempoRealTrabajado - tiempoEstimadoActual) }} más de lo estimado
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <!-- ============================================================
             ESTABLECER/MODIFICAR TIEMPO ESTIMADO
             ============================================================ -->
        <div v-if="esAsignadoAMi && tarjeta.estado === 'en_progreso' && tarjeta.estadoProgreso === 'pausada'" 
             class="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 class="font-semibold text-gray-800 dark:text-white mb-2">
            ⏱️ {{ tiempoEstimadoActual > 0 ? 'Modificar tiempo estimado' : 'Establecer tiempo estimado' }}
          </h4>
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
            {{ tiempoEstimadoActual > 0 ? 'Puedes modificar el tiempo si lo deseas.' : 'Define el tiempo que te tomará completar esta tarea.' }}
          </p>
          
          <div class="flex gap-2 items-end">
            <div class="flex-1">
              <div class="flex gap-2">
                <div class="flex-1">
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Horas</label>
                  <input
                    v-model.number="tiempoEstimadoHoras"
                    type="number"
                    step="1"
                    min="0"
                    max="999"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div class="flex-1">
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minutos</label>
                  <input
                    v-model.number="tiempoEstimadoMinutos"
                    type="number"
                    step="1"
                    min="0"
                    max="59"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                💡 Ejemplos: 2h 30min, 1h 45min, 90min (solo minutos)
              </p>
              <p v-if="tiempoEstimadoHoras > 0 && tiempoEstimadoMinutos > 59" class="text-xs text-red-500 dark:text-red-400 mt-1">
                ⚠️ Cuando hay horas, los minutos no pueden ser mayores a 59
              </p>
            </div>
            <button
              @click="guardarTiempoEstimado"
              :disabled="actualizandoTiempo || !tiempoValido"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition whitespace-nowrap"
            >
              {{ actualizandoTiempo ? 'Guardando...' : 'Guardar tiempo' }}
            </button>
          </div>
          
          <div v-if="tiempoTotalMinutos > 0" class="mt-2 text-sm text-green-700 dark:text-green-300">
            ⏱️ Total: <strong>{{ formatTiempo(tiempoTotalMinutos) }}</strong>
          </div>
        </div>
        
        <!-- ============================================================
             BOTONES DE ACCIÓN
             ============================================================ -->
        <div class="flex gap-3 pt-3 flex-wrap">
          <!-- Auto-asignarse -->
          <button 
            v-if="puedeAutoAsignar" 
            @click="autoAsignar" 
            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition font-medium"
          >
            🎯 Auto-asignarme
          </button>
          
          <!-- Asignar por supervisor -->
          <button 
            v-if="puedeAsignarJefe" 
            @click="abrirAsignarEmpleado" 
            class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium"
          >
            👥 Asignar a técnico
          </button>
          
          <!-- Iniciar tarea -->
          <button 
            v-if="puedeIniciar" 
            @click="iniciarTarea" 
            :disabled="tiempoEstimadoActual === 0"
            class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ tiempoEstimadoActual === 0 ? '⚠️ Guarda el tiempo primero' : '🚀 Iniciar tarea' }}
          </button>
          
          <!-- Reanudar -->
          <button 
            v-if="puedeReanudar" 
            @click="reanudarTarea" 
            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition font-medium"
          >
            ▶️ Reanudar
          </button>
          
          <!-- Pausar -->
          <button 
            v-if="puedePausar" 
            @click="pausarTarea" 
            class="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition font-medium"
          >
            ⏸️ Pausar
          </button>
          
          <!-- Registrar progreso -->
          <button 
            v-if="puedeRegistrarProgreso" 
            @click="abrirRegistrarProgreso" 
            class="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2.5 rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-medium"
          >
            📊 Registrar progreso
          </button>
          
          <!-- Aprobar tarea (solo supervisor) -->
          <button 
            v-if="puedeAprobar" 
            @click="aprobarTarea" 
            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition font-medium"
          >
            ✅ Aprobar tarea
          </button>
          
          <!-- Calificar (solo usuario) -->
          <button 
            v-if="puedeCalificar" 
            @click="abrirCalificar" 
            class="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition font-medium"
          >
            ⭐ Calificar servicio
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modales -->
    <RegistrarProgresoModal
      v-if="modalRegistrarProgreso"
      :tarjeta="tarjeta"
      @close="modalRegistrarProgreso = false"
      @updated="handleUpdated"
    />
    
    <AsignarEmpleadoModal
      v-if="modalAsignarEmpleado"
      :tarjeta="tarjeta"
      @close="modalAsignarEmpleado = false"
      @asignado="handleAsignado"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useTarjetasStore } from '~/stores/tarjetas';
import RegistrarProgresoModal from './RegistrarProgresoModal.vue';
import AsignarEmpleadoModal from './AsignarEmpleadoModal.vue';

const props = defineProps({
  tarjeta: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'update', 'calificar']);

const authStore = useAuthStore();
const tarjetasStore = useTarjetasStore();
const config = useRuntimeConfig();

const modalRegistrarProgreso = ref(false);
const modalAsignarEmpleado = ref(false);
const actualizandoTiempo = ref(false);
const tiempoEstimadoHoras = ref(0);
const tiempoEstimadoMinutos = ref(0);

// ============================================================
// COMPUTED - PERMISOS
// ============================================================
const esAsignadoAMi = computed(() => {
  return props.tarjeta.asignadoA?._id === authStore.user?._id;
});

const puedeAutoAsignar = computed(() => {
  return !props.tarjeta.asignadoA && 
         (authStore.isTecnico || authStore.isSupervisor) && 
         props.tarjeta.estado === 'pendiente';
});

const puedeAsignarJefe = computed(() => {
  return authStore.isSupervisor && 
         !props.tarjeta.asignadoA && 
         props.tarjeta.estado === 'pendiente';
});

const puedeIniciar = computed(() => {
  return esAsignadoAMi.value && 
         props.tarjeta.estado === 'en_progreso' && 
         props.tarjeta.estadoProgreso === 'pausada';
});

const puedeReanudar = computed(() => {
  return esAsignadoAMi.value && 
         props.tarjeta.estado === 'en_progreso' && 
         props.tarjeta.estadoProgreso === 'pausada' &&
         props.tarjeta.tiempoEstimadoEmpleado > 0 &&
         props.tarjeta.tiempoAcumulado > 0;
});

const puedePausar = computed(() => {
  return esAsignadoAMi.value && 
         props.tarjeta.estado === 'en_progreso' && 
         props.tarjeta.estadoProgreso === 'activa';
});

const puedeRegistrarProgreso = computed(() => {
  return esAsignadoAMi.value && 
         props.tarjeta.estado === 'en_progreso' && 
         props.tarjeta.tiempoEstimadoEmpleado > 0 &&
         (props.tarjeta.estadoProgreso === 'activa' || props.tarjeta.tiempoAcumulado > 0);
});

const puedeAprobar = computed(() => {
  return authStore.isSupervisor && props.tarjeta.estado === 'revision_jefe';
});

const puedeCalificar = computed(() => {
  return authStore.isUsuario && 
         props.tarjeta.estado === 'revision_cliente' && 
         !props.tarjeta.calificacion &&
         props.tarjeta.clienteInfo?.userId === authStore.user?._id;
});

// ============================================================
// COMPUTED - TIEMPO
// ============================================================
const tiempoEstimadoActual = computed(() => {
  return props.tarjeta.tiempoEstimadoEmpleado || 0;
});

const calcularTiempoTrabajado = () => {
  const horasReales = props.tarjeta.horasTotalesReales || 0;
  const minutosReales = props.tarjeta.minutosTotalesReales || 0;
  
  if (horasReales > 0 || minutosReales > 0) {
    return (horasReales * 60) + minutosReales;
  }
  
  let tiempo = props.tarjeta.tiempoAcumulado || 0;
  if (props.tarjeta.estadoProgreso === 'activa' && props.tarjeta.fechaUltimaReanudacion) {
    const ahora = new Date();
    const inicio = new Date(props.tarjeta.fechaUltimaReanudacion);
    tiempo += Math.floor((ahora - inicio) / 1000 / 60);
  }
  return tiempo;
};

const tiempoRealTrabajado = computed(() => {
  return calcularTiempoTrabajado();
});

const tiempoRealTrabajadoFormateado = computed(() => {
  return formatTiempo(tiempoRealTrabajado.value);
});

const tiempoTotalMinutos = computed(() => {
  const horas = parseInt(tiempoEstimadoHoras.value) || 0;
  const minutos = parseInt(tiempoEstimadoMinutos.value) || 0;
  return (horas * 60) + minutos;
});

const tiempoValido = computed(() => {
  return tiempoTotalMinutos.value > 0;
});

// ============================================================
// COMPUTED - ESTILOS
// ============================================================
const prioridadMap = {
  baja: { texto: 'Baja', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  media: { texto: 'Media', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  alta: { texto: 'Alta', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  urgente: { texto: 'Urgente', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' }
};

const estadoMap = {
  pendiente: { texto: '📋 Pendiente', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  en_progreso: { texto: '⚙️ En Progreso', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  revision_jefe: { texto: '👔 Revisión Supervisor', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  revision_cliente: { texto: '⭐ Revisión Usuario', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  finalizada: { texto: '🏁 Finalizada', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' }
};

const prioridadTexto = computed(() => prioridadMap[props.tarjeta.prioridad]?.texto || 'Media');
const prioridadColor = computed(() => prioridadMap[props.tarjeta.prioridad]?.color || prioridadMap.media.color);
const estadoTexto = computed(() => estadoMap[props.tarjeta.estado]?.texto || props.tarjeta.estado);
const estadoColor = computed(() => estadoMap[props.tarjeta.estado]?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300');

const progresoColor = computed(() => {
  if (props.tarjeta.porcentajeCompletado >= 80) return 'text-green-600 dark:text-green-400';
  if (props.tarjeta.porcentajeCompletado >= 50) return 'text-blue-600 dark:text-blue-400';
  return 'text-gray-600 dark:text-gray-400';
});

const progresoBarraColor = computed(() => {
  if (props.tarjeta.porcentajeCompletado >= 80) return 'bg-green-500';
  if (props.tarjeta.porcentajeCompletado >= 50) return 'bg-blue-500';
  return 'bg-gray-500';
});

// ============================================================
// FUNCIONES DE TIEMPO
// ============================================================
const formatDate = (date) => {
  if (!date) return 'Fecha no disponible';
  return new Date(date).toLocaleString('es-ES');
};

const formatTiempo = (minutos) => {
  if (!minutos || minutos === 0) return '0 min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${mins}min`;
};

// ============================================================
// ACCIONES
// ============================================================
const guardarTiempoEstimado = async () => {
  if (!tiempoValido.value) {
    alert('⚠️ Debes establecer un tiempo mayor a 0');
    return;
  }
  
  if (tiempoEstimadoHoras.value > 0 && tiempoEstimadoMinutos.value > 59) {
    alert('⚠️ Cuando hay horas, los minutos no pueden ser mayores a 59');
    return;
  }
  
  actualizandoTiempo.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${props.tarjeta._id}/tiempo-estimado`;
    
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: { 
        tiempoEstimadoHoras: parseInt(tiempoEstimadoHoras.value) || 0, 
        tiempoEstimadoMinutos: parseInt(tiempoEstimadoMinutos.value) || 0 
      }
    });
    
    if (response.success) {
      props.tarjeta.tiempoEstimadoEmpleado = response.tarjeta.tiempoEstimadoEmpleado;
      props.tarjeta.fechaEstimadaFin = response.tarjeta.fechaEstimadaFin;
      alert(`✅ Tiempo estimado guardado: ${formatTiempo(response.tarjeta.tiempoEstimadoEmpleado)}`);
      emit('update');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error al guardar tiempo estimado: ' + (error.message || error.data?.message || 'Error desconocido'));
  } finally {
    actualizandoTiempo.value = false;
  }
};

const iniciarTarea = async () => {
  console.log('🚀 [INICIAR-TAREA] Iniciando tarea...');
  
  if (!props.tarjeta.tiempoEstimadoEmpleado || props.tarjeta.tiempoEstimadoEmpleado === 0) {
    alert('⚠️ Debes establecer un tiempo estimado antes de iniciar la tarea.');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${props.tarjeta._id}/iniciar`;
    
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: { 
        tiempoEstimadoHoras: 0, 
        tiempoEstimadoMinutos: 0 
      }
    });
    
    if (response._id) {
      alert('🚀 Tarea iniciada');
      emit('update');
      emit('close');
    }
  } catch (error) {
    console.error('❌ Error al iniciar tarea:', error);
    alert('Error al iniciar la tarea: ' + (error.message || 'Error desconocido'));
  }
};

const pausarTarea = async () => {
  try {
    const token = localStorage.getItem('token');
    await $fetch(`${config.public.apiBase}/tarjetas/${props.tarjeta._id}/pausar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    alert('⏸️ Tarea pausada');
    emit('update');
    emit('close');
  } catch (error) {
    console.error('Error:', error);
    alert('Error al pausar la tarea');
  }
};

const reanudarTarea = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await $fetch(`${config.public.apiBase}/tarjetas/${props.tarjeta._id}/reanudar`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.success) {
      alert('▶️ Tarea reanudada');
      emit('update');
      emit('close');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al reanudar la tarea');
  }
};

const autoAsignar = async () => {
  try {
    await tarjetasStore.autoAsignar(props.tarjeta._id);
    alert('✅ Tarea auto-asignada');
    emit('update');
    emit('close');
  } catch (error) {
    alert('Error al auto-asignar');
  }
};

const abrirAsignarEmpleado = () => {
  modalAsignarEmpleado.value = true;
};

const handleAsignado = () => {
  modalAsignarEmpleado.value = false;
  emit('update');
  emit('close');
};

const abrirRegistrarProgreso = () => {
  modalRegistrarProgreso.value = true;
};

const handleUpdated = () => {
  modalRegistrarProgreso.value = false;
  emit('update');
  emit('close');
};

const aprobarTarea = async () => {
  try {
    const token = localStorage.getItem('token');
    await $fetch(`${config.public.apiBase}/tarjetas/${props.tarjeta._id}/aprobar-jefe`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    alert('✅ Tarea aprobada');
    emit('update');
    emit('close');
  } catch (error) {
    alert('Error al aprobar');
  }
};

const abrirCalificar = () => {
  emit('calificar', props.tarjeta);
};

const cargarTiempo = () => {
  console.log('📋 [TarjetaModalProfesional] Cargando tiempo...');
  
  if (props.tarjeta.tiempoEstimadoEmpleado > 0) {
    const horas = Math.floor(props.tarjeta.tiempoEstimadoEmpleado / 60);
    const minutos = props.tarjeta.tiempoEstimadoEmpleado % 60;
    tiempoEstimadoHoras.value = horas;
    tiempoEstimadoMinutos.value = minutos;
  } else if (props.tarjeta.tiempoSugeridoJefe > 0) {
    const horas = Math.floor(props.tarjeta.tiempoSugeridoJefe / 60);
    const minutos = props.tarjeta.tiempoSugeridoJefe % 60;
    tiempoEstimadoHoras.value = horas;
    tiempoEstimadoMinutos.value = minutos;
  } else {
    tiempoEstimadoHoras.value = 0;
    tiempoEstimadoMinutos.value = 0;
  }
};

watch(() => props.tarjeta, () => {
  cargarTiempo();
}, { deep: true, immediate: true });

onMounted(() => {
  cargarTiempo();
});
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