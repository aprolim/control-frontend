<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
      <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">⏱️ Establecer tiempo estimado</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
      </div>
      
      <div class="p-4 space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            📋 Tarea: <strong>{{ tarjeta.titulo }}</strong>
          </p>
          <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
            {{ tarjeta.descripcion || 'Sin descripción' }}
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ¿Cuánto tiempo te tomará completar esta tarea?
          </label>
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Horas (0-23)</label>
              <input
                v-model.number="tiempoHoras"
                type="number"
                step="1"
                min="0"
                max="23"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
                @input="validarHoras"
                autofocus
              />
              <p class="text-xs text-blue-500 mt-1">Valor: {{ tiempoHoras }}</p>
            </div>
            <div class="flex-1">
              <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minutos (0-59)</label>
              <input
                v-model.number="tiempoMinutos"
                type="number"
                step="1"
                min="0"
                max="59"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
                @input="validarMinutos"
              />
              <p class="text-xs text-blue-500 mt-1">Valor: {{ tiempoMinutos }}</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 El progreso se actualizará automáticamente según el tiempo que establezcas.
          </p>
          <p v-if="tiempoSugeridoJefe > 0" class="text-xs text-orange-500 dark:text-orange-400 mt-1">
            ⏱️ El jefe estimó: {{ formatoTiempo(tiempoSugeridoJefe) }}
          </p>
        </div>
        
        <button
          @click="guardarTiempo"
          :disabled="guardando || !tiempoValido"
          class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition dark:bg-green-700 dark:hover:bg-green-800"
        >
          {{ guardando ? 'Guardando...' : 'Comenzar tarea' }}
        </button>
        
        <p class="text-xs text-gray-400 dark:text-gray-500 text-center">
          Debes establecer un tiempo estimado para poder trabajar en esta tarea.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTarjetasStore } from '~/stores/tarjetas';

const props = defineProps({
  tarjeta: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['tiempo-establecido', 'close']);

console.log('📋 [ModalTiempoEstimado] Componente cargado');
console.log(`   - tarjeta.tiempoSugeridoJefe: ${props.tarjeta.tiempoSugeridoJefe}`);

const config = useRuntimeConfig();
const guardando = ref(false);
const tiempoHoras = ref(0);
const tiempoMinutos = ref(0);

// 🔥 PRECARGAR LA SUGERENCIA DEL JEFE
const tiempoSugeridoJefe = computed(() => props.tarjeta.tiempoSugeridoJefe || 0);

// Precargar valores en los inputs si el jefe sugirió algo
onMounted(() => {
  if (props.tarjeta.tiempoSugeridoJefe > 0) {
    const horas = Math.floor(props.tarjeta.tiempoSugeridoJefe / 60);
    const minutos = props.tarjeta.tiempoSugeridoJefe % 60;
    tiempoHoras.value = horas;
    tiempoMinutos.value = minutos;
    console.log(`   💡 Precargada sugerencia del jefe: ${horas}h ${minutos}min`);
  }
});

const tiempoValido = computed(() => {
  const totalMinutos = (tiempoHoras.value * 60) + tiempoMinutos.value;
  return totalMinutos > 0;
});

const formatoTiempo = (minutos) => {
  if (!minutos || minutos === 0) return '0 min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${mins}min`;
};

const validarHoras = () => {
  let horas = parseInt(tiempoHoras.value);
  if (isNaN(horas)) horas = 0;
  horas = Math.min(23, Math.max(0, horas));
  tiempoHoras.value = horas;
};

const validarMinutos = () => {
  let minutos = parseInt(tiempoMinutos.value);
  if (isNaN(minutos)) minutos = 0;
  minutos = Math.min(59, Math.max(0, minutos));
  tiempoMinutos.value = minutos;
};

// ============================================================
// 🔥 CORREGIDO: PRIMERO guardar tiempo ESTIMADO, LUEGO iniciar
// ============================================================
const guardarTiempo = async () => {
  const totalMinutos = (tiempoHoras.value * 60) + tiempoMinutos.value;
  
  if (totalMinutos <= 0) {
    alert('Debes establecer un tiempo mayor a 0');
    return;
  }
  
  guardando.value = true;
  try {
    const token = localStorage.getItem('token');
    
    // 🔥 PASO 1: Guardar el tiempo estimado
    const estimadoUrl = `${config.public.apiBase}/tarjetas/${props.tarjeta._id}/tiempo-estimado`;
    console.log('📤 PASO 1 - Guardando tiempo estimado en:', estimadoUrl);
    console.log('📦 Datos:', { 
      tiempoEstimadoHoras: tiempoHoras.value, 
      tiempoEstimadoMinutos: tiempoMinutos.value 
    });
    
    const estimadoResponse = await $fetch(estimadoUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { 
        tiempoEstimadoHoras: tiempoHoras.value, 
        tiempoEstimadoMinutos: tiempoMinutos.value 
      }
    });
    
    console.log('✅ PASO 1 - Tiempo estimado guardado:', estimadoResponse);
    
    // 🔥 PASO 2: Iniciar la tarea
    const iniciarUrl = `${config.public.apiBase}/tarjetas/${props.tarjeta._id}/iniciar`;
    console.log('📤 PASO 2 - Iniciando tarea en:', iniciarUrl);
    
    const iniciarResponse = await $fetch(iniciarUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { 
        tiempoEstimadoHoras: 0, 
        tiempoEstimadoMinutos: 0 
      }
    });
    
    console.log('✅ PASO 2 - Tarea iniciada:', iniciarResponse);
    
    if (iniciarResponse && iniciarResponse._id) {
      alert('✅ Tarea iniciada exitosamente');
      emit('tiempo-establecido', iniciarResponse);
      emit('close');
    }
  } catch (error) {
    console.error('❌ Error detallado:', error);
    console.error('❌ Error response:', error.data);
    alert('Error: ' + (error.data?.message || error.message || 'Error desconocido'));
  } finally {
    guardando.value = false;
  }
};
</script>