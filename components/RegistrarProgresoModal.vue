<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
      
      <!-- Header sticky -->
      <div class="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800 rounded-t-lg flex-shrink-0">
        <h3 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <span class="text-xl sm:text-2xl">✅</span>
          Finalizar tarea
        </h3>
        <button 
          @click="$emit('close')" 
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition"
        >
          ✕
        </button>
      </div>
      
      <!-- Body con scroll interno -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        
        <!-- Info de la tarea -->
        <div class="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p class="text-sm font-medium text-gray-800 dark:text-white">{{ tarjeta.titulo }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{{ tarjeta.descripcion || 'Sin descripción' }}</p>
        </div>
        
        <!-- RESUMEN DE TIEMPO -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            📊 Resumen de tiempo
          </h4>
          
          <div class="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 text-center border border-gray-200 dark:border-gray-700">
              <span class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 block mb-1">⏱️ Trabajado</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400 text-base sm:text-lg font-mono">
                {{ formatTiempo(tiempoTranscurridoReal) }}
              </span>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 text-center border border-gray-200 dark:border-gray-700">
              <span class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 block mb-1">🎯 Estimado</span>
              <span class="font-bold text-blue-600 dark:text-blue-400 text-base sm:text-lg font-mono">
                {{ tiempoEstimado > 0 ? formatTiempo(tiempoEstimado) : 'Sin definir' }}
              </span>
            </div>
          </div>
          
          <div v-if="tiempoEstimado > 0" 
               class="text-[11px] sm:text-xs p-2 rounded-lg text-center font-medium"
               :class="tiempoTranscurridoReal <= tiempoEstimado 
                 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                 : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'">
            <span v-if="tiempoTranscurridoReal <= tiempoEstimado">
              ✅ Terminaste {{ formatTiempo(tiempoEstimado - tiempoTranscurridoReal) }} antes
            </span>
            <span v-else>
              ⚠️ Excediste por {{ formatTiempo(tiempoTranscurridoReal - tiempoEstimado) }}
            </span>
          </div>
        </div>
        
        <!-- COMENTARIO OBLIGATORIO -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            💬 Comentario de finalización <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.comentario"
            rows="3"
            required
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition text-sm resize-none"
            :class="comentarioError 
              ? 'border-red-400 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-600'"
            placeholder="Explica brevemente cómo se desarrolló la tarea..."
            @input="comentarioError = false"
          ></textarea>
          <p v-if="comentarioError" class="text-[11px] sm:text-xs text-red-500 dark:text-red-400 mt-1">
            ⚠️ El comentario es obligatorio (mínimo 5 caracteres).
          </p>
          <p v-else class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
            El supervisor leerá este comentario al revisar la tarea.
          </p>
        </div>
        
        <!-- ADVERTENCIA -->
        <div class="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 sm:p-3">
          <p class="text-[11px] sm:text-xs text-yellow-800 dark:text-yellow-200">
            ⚠️ <strong>Esta acción no se puede deshacer.</strong> La tarea se marcará como <strong>100% completada</strong> y se enviará a revisión del supervisor.
          </p>
        </div>
        
      </form>
      
      <!-- Footer sticky con botones -->
      <div class="flex gap-2 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg flex-shrink-0">
        <button
          type="button"
          @click="handleSubmit"
          :disabled="loading || !comentarioValido"
          class="flex-1 bg-emerald-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2 text-sm"
        >
          <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ loading ? 'Finalizando...' : '✅ Confirmar' }}
        </button>
        <button
          type="button"
          @click="$emit('close')"
          class="flex-1 bg-gray-200 text-gray-700 py-2 sm:py-2.5 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-medium text-sm"
        >
          Cancelar
        </button>
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

const emit = defineEmits(['close', 'updated']);

console.log('✅ [RegistrarProgresoModal] Modal de finalización cargado');

const tarjetasStore = useTarjetasStore();
const loading = ref(false);
const comentarioError = ref(false);

const form = ref({
  comentario: ''
});

const comentarioValido = computed(() => {
  return form.value.comentario && form.value.comentario.trim().length >= 5;
});

const tiempoEstimado = computed(() => props.tarjeta.tiempoEstimadoEmpleado || 0);

const tiempoTranscurridoReal = computed(() => {
  let tiempoTotal = props.tarjeta.tiempoAcumulado || 0;
  
  if (props.tarjeta.estadoProgreso === 'activa' && props.tarjeta.fechaUltimaReanudacion) {
    const ahora = new Date();
    const inicio = new Date(props.tarjeta.fechaUltimaReanudacion);
    const minutosDesdeReanudacion = Math.floor((ahora - inicio) / 1000 / 60);
    tiempoTotal += minutosDesdeReanudacion;
  }
  
  return tiempoTotal;
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
  if (!comentarioValido.value) {
    comentarioError.value = true;
    return;
  }
  
  console.log('✅ [RegistrarProgresoModal] Finalizando tarea...');
  console.log(`   📊 Se enviará 100% de progreso`);
  console.log(`   ⏱️ Tiempo trabajado: ${formatTiempo(tiempoTranscurridoReal.value)}`);
  console.log(`   💬 Comentario: ${form.value.comentario}`);
  
  const confirmacion = confirm(
    `¿Confirmar la finalización de la tarea?\n\n` +
    `⏱️ Tiempo trabajado: ${formatTiempo(tiempoTranscurridoReal.value)}\n` +
    (tiempoEstimado.value > 0 ? `🎯 Tiempo estimado: ${formatTiempo(tiempoEstimado.value)}\n` : '') +
    `\nLa tarea se marcará como 100% completada y se enviará a revisión.`
  );
  
  if (!confirmacion) return;
  
  loading.value = true;
  try {
    const dataToSend = {
      porcentajeAvance: 100,
      comentario: form.value.comentario.trim()
    };
    
    await tarjetasStore.registrarProgreso(props.tarjeta._id, dataToSend);
    alert('✅ Tarea finalizada exitosamente. Se envió a revisión del supervisor.');
    emit('updated');
    emit('close');
  } catch (error) {
    console.error('❌ Error finalizando:', error);
    alert('Error al finalizar: ' + (error.message || error.data?.message || 'Error desconocido'));
  } finally {
    loading.value = false;
  }
};
</script>