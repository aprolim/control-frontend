<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
        <h3 class="text-lg font-semibold text-gray-800">{{ tarjeta.titulo }}</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      
      <div class="p-4 space-y-4">
        <div class="flex justify-between items-center flex-wrap gap-2">
          <span class="px-2 py-1 rounded-full text-xs font-medium" :class="prioridadColor">
            {{ prioridadTexto }}
          </span>
          <div class="flex gap-2 flex-wrap">
            <!-- Estado de la tarea -->
            <span class="text-xs px-2 py-1 rounded-full" :class="estadoColor">
              {{ estadoTexto }}
            </span>
            
            <!-- Estado de progreso (activa/pausada) - SOLO para tareas en progreso -->
            <span v-if="tarjeta.estado === 'en_progreso'" 
                  class="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  :class="tarjeta.estadoProgreso === 'activa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
              <span v-if="tarjeta.estadoProgreso === 'activa'" class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span v-else>⏸️</span>
              {{ tarjeta.estadoProgreso === 'activa' ? 'En ejecución' : 'Pausada' }}
            </span>
            
            <span class="text-sm text-gray-500">Creada: {{ new Date(tarjeta.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
        
        <div v-if="tarjeta.tiempoSugeridoJefe > 0" class="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p class="text-sm text-blue-800">
            💡 Sugerencia del jefe: 
            <strong>{{ formatoTiempo(tarjeta.tiempoSugeridoJefe) }}</strong>
          </p>
        </div>
        
        <p class="text-gray-700">{{ tarjeta.descripcion || 'Sin descripción' }}</p>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Asignado a:</span>
            <span class="font-medium text-gray-800">{{ tarjeta.asignadoA?.nombre || 'Sin asignar' }}</span>
          </div>
          <div>
            <span class="text-gray-500">Estado:</span>
            <span class="font-medium" :class="estadoActivo ? 'text-green-600' : 'text-gray-600'">
              {{ estadoActivo ? '🟢 En progreso' : '⏸️ Pausado' }}
            </span>
          </div>
        </div>
        
        <!-- Panel de tiempo en tiempo real -->
        <div v-if="estadoActivo && tiempoEstimado > 0" class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 class="font-semibold text-blue-800 mb-3">⏱️ Progreso en Tiempo Real</h4>
          
          <div class="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div class="text-xs text-gray-500">Tiempo Estimado</div>
              <div class="text-lg font-bold text-blue-600">{{ formatoTiempo(tiempoEstimado) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Tiempo Transcurrido</div>
              <div class="text-lg font-bold text-green-600">{{ formatoTiempo(tiempoTranscurrido) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Tiempo Restante</div>
              <div class="text-lg font-bold" :class="tiempoRestante < 5 ? 'text-red-600 animate-pulse' : 'text-orange-600'">
                {{ formatoTiempo(tiempoRestante) }}
              </div>
            </div>
          </div>
          
          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <div>
                <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Progreso Automático
                </span>
              </div>
              <div class="text-right">
                <span class="text-xs font-semibold inline-block text-blue-600">
                  {{ porcentajeAutomatico }}%
                </span>
              </div>
            </div>
            <div class="overflow-hidden h-4 mb-4 text-xs flex rounded bg-blue-200">
              <div
                :style="{ width: `${porcentajeAutomatico}%` }"
                class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-1000"
              ></div>
            </div>
            <p class="text-xs text-gray-500 text-center">
              El progreso se actualiza automáticamente cada minuto según el tiempo transcurrido
            </p>
          </div>
          
          <div v-if="tiempoRestante <= 0" class="mt-3 p-2 bg-green-100 text-green-700 rounded text-center text-sm">
            🎉 ¡Tiempo estimado cumplido! Puedes registrar el progreso manualmente si aún no has completado la tarea.
          </div>
        </div>
        
        <!-- Progreso manual -->
        <div v-else class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Progreso manual:</span>
            <span class="font-medium text-gray-800">{{ tarjeta.porcentajeCompletado }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 rounded-full h-2 transition-all"
              :style="{ width: `${tarjeta.porcentajeCompletado}%` }"
            ></div>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Tiempo trabajado:</span>
              <span class="font-medium ml-1">{{ tiempoRealFormateado }}</span>
            </div>
            <div v-if="tarjeta.tiempoEstimadoEmpleado > 0">
              <span class="text-gray-500">Tiempo estimado:</span>
              <span class="font-medium text-green-600 ml-1">{{ formatoTiempo(tarjeta.tiempoEstimadoEmpleado) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div v-if="esAsignadoAMi && tarjeta.estado === 'en_progreso'" class="flex gap-2">
          <button 
            v-if="tarjeta.estadoProgreso !== 'activa' && tarjeta.tiempoEstimadoEmpleado === 0"
            @click="abrirModalIniciarTarea"
            class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            🚀 Establecer tiempo y comenzar
          </button>
          <button 
            v-else-if="tarjeta.estadoProgreso !== 'activa' && tarjeta.tiempoEstimadoEmpleado > 0"
            @click="reanudarTarea"
            class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            ▶️ Reanudar tarea
          </button>
          <button 
            v-if="tarjeta.estadoProgreso === 'activa'"
            @click="pausarTarea"
            class="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition"
          >
            ⏸️ Pausar tarea
          </button>
          <button 
            v-if="tarjeta.tiempoEstimadoEmpleado > 0 && tarjeta.estadoProgreso !== 'activa'"
            @click="abrirModalRegistrarProgreso"
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            📊 Registrar progreso
          </button>
        </div>
        
        <!-- Modificar tiempo estimado -->
        <div v-if="esAsignadoAMi && tarjeta.estado === 'en_progreso' && tarjeta.tiempoEstimadoEmpleado > 0 && tarjeta.estadoProgreso !== 'activa'" 
             class="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 class="font-semibold text-gray-800 mb-2">⏱️ Modificar tiempo estimado</h4>
          <p class="text-xs text-gray-600 mb-3">Puedes modificar el tiempo estimado si es necesario.</p>
          
          <div class="flex gap-2 items-end">
            <div class="flex-1">
              <div class="flex gap-2">
                <div class="flex-1">
                  <input
                    v-model.number="tiempoEstimadoHoras"
                    type="number"
                    step="1"
                    min="0"
                    max="23"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Horas"
                  />
                  <p class="text-xs text-gray-400">Horas (0-23)</p>
                </div>
                <div class="flex-1">
                  <input
                    v-model.number="tiempoEstimadoMinutos"
                    type="number"
                    step="1"
                    min="0"
                    max="59"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Minutos"
                  />
                  <p class="text-xs text-gray-400">Minutos (0-59)</p>
                </div>
              </div>
            </div>
            <button
              @click="actualizarTiempoEstimado"
              :disabled="actualizandoTiempo"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {{ actualizandoTiempo ? 'Guardando...' : 'Actualizar' }}
            </button>
          </div>
          
          <div class="mt-3 pt-3 border-t border-green-200">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Tu tiempo estimado:</span>
              <span class="font-medium text-green-700">{{ formatoTiempo(tarjeta.tiempoEstimadoEmpleado) }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="tarjeta.calificacion?.puntaje" class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-800">Calificación:</span>
            <span class="text-yellow-500">{{ '★'.repeat(tarjeta.calificacion.puntaje) }}{{ '☆'.repeat(5 - tarjeta.calificacion.puntaje) }}</span>
            <span class="text-sm text-gray-600">({{ tarjeta.calificacion.puntaje }}/5)</span>
          </div>
          <p class="text-sm text-gray-600 mt-1">{{ tarjeta.calificacion.comentario }}</p>
        </div>
        
        <div v-if="tarjeta.registroHoras?.length" class="mt-4">
          <h4 class="font-semibold text-gray-800 mb-2">Historial de avances</h4>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div v-for="(reg, idx) in tarjeta.registroHoras.slice().reverse()" :key="idx" class="bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">
              <div class="flex justify-between">
                <span class="font-medium text-gray-700">{{ new Date(reg.fecha).toLocaleDateString() }}</span>
                <span class="text-gray-600">{{ reg.horasTrabajadas }}h {{ reg.minutosTrabajados || 0 }}min</span>
              </div>
              <div class="text-gray-600">Progreso: {{ reg.porcentajeAvance }}%</div>
              <div v-if="reg.comentario" class="text-gray-500 text-xs mt-1">{{ reg.comentario }}</div>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2 pt-4 border-t border-gray-200 flex-wrap">
          <button 
            v-if="!tarjeta.asignadoA && (isEmpleado || isJefe) && tarjeta.estado === 'pendiente'" 
            @click="autoAsignar" 
            class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Auto-asignarme
          </button>
          
          <button 
            v-if="isJefe && !tarjeta.asignadoA && tarjeta.estado === 'pendiente'" 
            @click="abrirAsignarJefe" 
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Asignar a empleado
          </button>
          
          <button 
            v-if="isJefe && tarjeta.estado === 'revision_jefe'" 
            @click="aprobarTarea" 
            class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            ✅ Aprobar tarea
          </button>
          
          <button 
            v-if="tarjeta.estado === 'revision_cliente' && isCliente && tarjeta.clienteInfo.userId === authStore.user?._id && !tarjeta.calificacion" 
            @click="abrirCalificar" 
            class="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Calificar servicio
          </button>
        </div>
      </div>
    </div>
    
    <AsignarEmpleadoModal
      v-if="modalAsignar"
      :tarjeta="tarjeta"
      @close="modalAsignar = false"
      @asignado="handleAsignado"
    />
    
    <CalificarModal
      v-if="modalCalificar"
      :tarjeta="tarjeta"
      @close="modalCalificar = false"
      @calificado="handleUpdated"
    />
    
    <ModalTiempoEstimado
      v-if="modalIniciarTarea"
      :tarjeta="tarjeta"
      @tiempo-establecido="handleTiempoEstablecido"
    />
    
    <RegistrarProgresoModal
      v-if="modalRegistrarProgreso"
      :tarjeta="tarjeta"
      @close="modalRegistrarProgreso = false"
      @updated="handleUpdated"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useTarjetasStore } from '~/stores/tarjetas';
import ModalTiempoEstimado from './ModalTiempoEstimado.vue';
import RegistrarProgresoModal from './RegistrarProgresoModal.vue';

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

const isJefe = computed(() => authStore.isJefe);
const isEmpleado = computed(() => authStore.isEmpleado);
const isCliente = computed(() => authStore.isCliente);

const esAsignadoAMi = computed(() => {
  return props.tarjeta.asignadoA && 
         props.tarjeta.asignadoA._id === authStore.user?._id;
});

// Estado en tiempo real
const tiempoEstimado = ref(props.tarjeta.tiempoEstimadoEmpleado || 0);
const tiempoTranscurrido = ref(0);
const tiempoRestante = ref(props.tarjeta.tiempoEstimadoEmpleado || 0);
const porcentajeAutomatico = ref(props.tarjeta.porcentajeCompletado || 0);
const estadoActivo = ref(props.tarjeta.estadoProgreso === 'activa');
let intervaloActualizacion = null;

const modalAsignar = ref(false);
const modalCalificar = ref(false);
const modalIniciarTarea = ref(false);
const modalRegistrarProgreso = ref(false);
const actualizandoTiempo = ref(false);
const tiempoEstimadoHoras = ref(0);
const tiempoEstimadoMinutos = ref(0);

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
  finalizada: { texto: '🏁 Finalizada', color: 'bg-gray-100 text-gray-500' }
};

const prioridadTexto = computed(() => prioridadMap[props.tarjeta.prioridad]?.texto || 'Media');
const prioridadColor = computed(() => prioridadMap[props.tarjeta.prioridad]?.color || prioridadMap.media.color);
const estadoTexto = computed(() => estadoMap[props.tarjeta.estado]?.texto || props.tarjeta.estado);
const estadoColor = computed(() => estadoMap[props.tarjeta.estado]?.color || 'bg-gray-100 text-gray-700');

const tiempoRealFormateado = computed(() => {
  const totalMinutos = (props.tarjeta.horasTotalesReales * 60) + (props.tarjeta.minutosTotalesReales || 0);
  return formatoTiempo(totalMinutos);
});

const formatoTiempo = (minutos) => {
  if (!minutos && minutos !== 0) return '0 min';
  if (minutos === 0) return '0 min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${mins}min`;
};

const actualizarProgresoAutomatico = async () => {
  if (!estadoActivo.value || tiempoEstimado.value <= 0) return;
  
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${props.tarjeta._id}/progreso-automatico`;
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.estaActiva) {
      tiempoTranscurrido.value = response.tiempoTranscurrido;
      tiempoRestante.value = response.tiempoRestante;
      porcentajeAutomatico.value = response.porcentajeCalculado;
      
      if (response.porcentajeCalculado > props.tarjeta.porcentajeCompletado) {
        props.tarjeta.porcentajeCompletado = response.porcentajeCalculado;
      }
    }
  } catch (error) {
    console.error('Error actualizando progreso automático:', error);
  }
};

const iniciarIntervalo = () => {
  if (intervaloActualizacion) clearInterval(intervaloActualizacion);
  intervaloActualizacion = setInterval(() => {
    actualizarProgresoAutomatico();
  }, 5000);
};

const detenerIntervalo = () => {
  if (intervaloActualizacion) {
    clearInterval(intervaloActualizacion);
    intervaloActualizacion = null;
  }
};

const inicializarFormularioTiempo = () => {
  if (props.tarjeta.tiempoEstimadoEmpleado > 0) {
    const horas = Math.floor(props.tarjeta.tiempoEstimadoEmpleado / 60);
    const minutos = props.tarjeta.tiempoEstimadoEmpleado % 60;
    tiempoEstimadoHoras.value = horas;
    tiempoEstimadoMinutos.value = minutos;
  } else {
    tiempoEstimadoHoras.value = 0;
    tiempoEstimadoMinutos.value = 0;
  }
};

const recargarTarea = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${props.tarjeta._id}`;
    const tareaActualizada = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    Object.assign(props.tarjeta, tareaActualizada);
    tiempoEstimado.value = props.tarjeta.tiempoEstimadoEmpleado || 0;
    estadoActivo.value = props.tarjeta.estadoProgreso === 'activa';
    inicializarFormularioTiempo();
    
    if (estadoActivo.value && tiempoEstimado.value > 0) {
      iniciarIntervalo();
      await actualizarProgresoAutomatico();
    } else {
      detenerIntervalo();
    }
  } catch (error) {
    console.error('Error recargando tarea:', error);
  }
};

const actualizarTiempoEstimado = async () => {
  const totalMinutos = (parseInt(tiempoEstimadoHoras.value) || 0) * 60 + (parseInt(tiempoEstimadoMinutos.value) || 0);
  
  if (totalMinutos <= 0) {
    alert('El tiempo estimado debe ser mayor a 0');
    return;
  }
  
  actualizandoTiempo.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${props.tarjeta._id}/tiempo-estimado`;
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { 
        tiempoEstimadoHoras: parseInt(tiempoEstimadoHoras.value) || 0, 
        tiempoEstimadoMinutos: parseInt(tiempoEstimadoMinutos.value) || 0 
      }
    });
    
    if (response.success) {
      props.tarjeta.tiempoEstimadoEmpleado = response.tarjeta.tiempoEstimadoEmpleado;
      props.tarjeta.fechaEstimadaFin = response.tarjeta.fechaEstimadaFin;
      tiempoEstimado.value = response.tarjeta.tiempoEstimadoEmpleado;
      alert(`✅ Tiempo estimado actualizado a ${formatoTiempo(totalMinutos)}`);
      await recargarTarea();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar tiempo estimado');
  } finally {
    actualizandoTiempo.value = false;
  }
};

const pausarTarea = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${props.tarjeta._id}/pausar`;
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.success) {
      detenerIntervalo();
      estadoActivo.value = false;
      await recargarTarea();
      emit('update');
      alert('⏸️ Tarea pausada');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al pausar la tarea');
  }
};

const reanudarTarea = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${props.tarjeta._id}/reanudar`;
    console.log('🔄 REANUDAR - Enviando a:', url);
    
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ REANUDAR - Respuesta:', response);
    
    if (response.success) {
      estadoActivo.value = true;
      await recargarTarea();
      emit('update');
      alert('▶️ Tarea reanudada');
      
      setTimeout(() => {
        emit('close');
      }, 500);
    }
  } catch (error) {
    console.error('❌ Error en reanudar:', error);
    alert('Error al reanudar la tarea');
  }
};

const abrirModalIniciarTarea = () => {
  modalIniciarTarea.value = true;
};

const abrirModalRegistrarProgreso = () => {
  modalRegistrarProgreso.value = true;
};

const autoAsignar = async () => {
  try {
    await tarjetasStore.autoAsignar(props.tarjeta._id);
    await recargarTarea();
    emit('update');
    alert('✅ Tarea auto-asignada exitosamente');
  } catch (error) {
    alert('Error al auto-asignar');
  }
};

const aprobarTarea = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${props.tarjeta._id}/aprobar-jefe`;
    await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    await recargarTarea();
    emit('update');
    alert('✅ Tarea aprobada');
  } catch (error) {
    alert('Error al aprobar');
  }
};

const abrirAsignarJefe = () => {
  modalAsignar.value = true;
};

const abrirCalificar = () => {
  modalCalificar.value = true;
};

const handleAsignado = async () => {
  modalAsignar.value = false;
  await recargarTarea();
  emit('update');
};

const handleUpdated = () => {
  modalCalificar.value = false;
  modalRegistrarProgreso.value = false;
  recargarTarea();
  emit('update');
  setTimeout(() => emit('close'), 500);
};

const handleTiempoEstablecido = async () => {
  modalIniciarTarea.value = false;
  await recargarTarea();
  emit('update');
};

watch(estadoActivo, (nuevoValor) => {
  if (nuevoValor && tiempoEstimado.value > 0) {
    iniciarIntervalo();
  } else {
    detenerIntervalo();
  }
});

onMounted(() => {
  inicializarFormularioTiempo();
  estadoActivo.value = props.tarjeta.estadoProgreso === 'activa';
  tiempoEstimado.value = props.tarjeta.tiempoEstimadoEmpleado || 0;
  
  if (estadoActivo.value && tiempoEstimado.value > 0) {
    iniciarIntervalo();
    actualizarProgresoAutomatico();
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
</style>