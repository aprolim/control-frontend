<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
      <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">📊 Registrar progreso</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-4 space-y-4">
        <!-- Información de la tarea -->
        <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm font-medium text-gray-800 dark:text-white">{{ tarjeta.titulo }}</p>
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Progreso actual: <strong class="text-blue-600 dark:text-blue-400">{{ tarjeta.porcentajeCompletado }}%</strong></span>
            <span>Tiempo estimado: <strong>{{ formatTiempo(tarjeta.tiempoEstimadoEmpleado) }}</strong></span>
          </div>
          <div class="text-xs text-green-600 dark:text-green-400 mt-1">
            ⏱️ Tiempo trabajado: <strong>{{ tiempoTranscurridoFormateado }}</strong>
            <span class="text-gray-400 text-[10px] block">(Calculado automáticamente)</span>
          </div>
        </div>
        
        <!-- SOLO PORCENTAJE DE AVANCE -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            📊 Nuevo porcentaje completado <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.porcentajeAvance"
            type="range"
            min="0"
            max="100"
            step="5"
            class="w-full"
          />
          <div class="text-center text-sm font-bold mt-1" :class="porcentajeColor">
            {{ form.porcentajeAvance }}%
          </div>
        </div>
        
        <!-- COMENTARIO (OPCIONAL) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            💬 Comentario (opcional)
          </label>
          <textarea
            v-model="form.comentario"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe el avance realizado..."
          ></textarea>
        </div>
        
        <!-- BOTONES -->
        <div class="flex gap-2 pt-2">
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition dark:bg-green-700 dark:hover:bg-green-800"
          >
            {{ loading ? 'Guardando...' : '📊 Registrar avance' }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
        
        <!-- Mensaje de advertencia -->
        <div v-if="form.porcentajeAvance >= 100" class="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
          <p class="text-sm text-green-700 dark:text-green-300 text-center">
            🎉 ¡Tarea completada! Se enviará a revisión del supervisor.
          </p>
        </div>
      </form>
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

const emit = defineEmits(['close', 'updated']);

console.log('📊 [RegistrarProgresoModal] Componente cargado - VERSIÓN SIMPLIFICADA');

const tarjetasStore = useTarjetasStore();
const loading = ref(false);

const form = ref({
  porcentajeAvance: props.tarjeta.porcentajeCompletado || 0,
  comentario: ''
});

const tiempoTranscurridoFormateado = computed(() => {
  let tiempoTotal = props.tarjeta.tiempoAcumulado || 0;
  
  if (props.tarjeta.estadoProgreso === 'activa' && props.tarjeta.fechaUltimaReanudacion) {
    const ahora = new Date();
    const inicio = new Date(props.tarjeta.fechaUltimaReanudacion);
    const minutosDesdeReanudacion = Math.floor((ahora - inicio) / 1000 / 60);
    tiempoTotal += minutosDesdeReanudacion;
  }
  
  return formatTiempo(tiempoTotal);
});

const porcentajeColor = computed(() => {
  if (form.value.porcentajeAvance >= 100) return 'text-green-600 dark:text-green-400';
  if (form.value.porcentajeAvance >= 50) return 'text-blue-600 dark:text-blue-400';
  return 'text-gray-600 dark:text-gray-400';
});

const formatTiempo = (minutos) => {
  if (!minutos || minutos === 0) return '0 min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${mins}min`;
};

const handleSubmit = async () => {
  console.log('📤 [RegistrarProgresoModal] Enviando progreso...');
  console.log(`   📊 Progreso: ${form.value.porcentajeAvance}%`);
  console.log(`   💬 Comentario: ${form.value.comentario}`);
  
  loading.value = true;
  try {
    const dataToSend = {
      porcentajeAvance: form.value.porcentajeAvance,
      comentario: form.value.comentario
    };
    
    console.log('📦 Datos enviados:', dataToSend);
    
    await tarjetasStore.registrarProgreso(props.tarjeta._id, dataToSend);
    emit('updated');
    emit('close');
  } catch (error) {
    console.error('❌ Error registrando progreso:', error);
    console.error('   Detalles:', error.data);
    alert('Error al registrar el progreso: ' + (error.message || error.data?.message || 'Error desconocido'));
  } finally {
    loading.value = false;
  }
};
</script>