<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
      <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Registrar progreso</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ tarjeta.titulo }}</label>
          <p class="text-xs text-gray-500 dark:text-gray-400">Progreso actual: {{ tarjeta.porcentajeCompletado }}%</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Tiempo estimado: {{ tiempoEstimadoTexto(tarjeta) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Tiempo trabajado: {{ tiempoRealTexto(tarjeta) }}</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiempo trabajado hoy *</label>
          <div class="flex gap-2">
            <div class="flex-1">
              <input
                v-model.number="form.horasTrabajadas"
                type="number"
                step="0.5"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Horas"
              />
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Horas</p>
            </div>
            <div class="flex-1">
              <input
                v-model.number="form.minutosTrabajados"
                type="number"
                step="5"
                min="0"
                max="55"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Minutos"
              />
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Minutos</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total hoy: {{ tiempoHoyFormateado }}</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nuevo porcentaje completado *</label>
          <input
            v-model.number="form.porcentajeAvance"
            type="range"
            min="0"
            max="100"
            step="5"
            class="w-full"
          />
          <div class="text-center text-sm font-bold mt-1 text-blue-600 dark:text-blue-400">{{ form.porcentajeAvance }}%</div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentario</label>
          <textarea
            v-model="form.comentario"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="¿Qué avanzaste?"
          ></textarea>
        </div>
        
        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.cruzoMedianoche" class="rounded text-blue-600 dark:text-blue-400" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Trabajé hasta después de medianoche</span>
          </label>
          
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.esHoraExtra" class="rounded text-blue-600 dark:text-blue-400" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Estas horas son extras (requiere aprobación)</span>
          </label>
        </div>
        
        <div class="flex gap-2">
          <input
            v-model="form.inicioTrabajo"
            type="datetime-local"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
          <input
            v-model="form.finTrabajo"
            type="datetime-local"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {{ loading ? 'Guardando...' : 'Registrar avance' }}
        </button>
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

const tarjetasStore = useTarjetasStore();
const config = useRuntimeConfig();
const loading = ref(false);

const form = ref({
  horasTrabajadas: 0,
  minutosTrabajados: 0,
  porcentajeAvance: props.tarjeta.porcentajeCompletado,
  comentario: '',
  inicioTrabajo: new Date().toISOString().slice(0, 16),
  finTrabajo: new Date().toISOString().slice(0, 16),
  cruzoMedianoche: false,
  esHoraExtra: false
});

const tiempoHoyFormateado = computed(() => {
  const totalMinutos = (form.value.horasTrabajadas * 60) + form.value.minutosTrabajados;
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  
  if (totalMinutos === 0) return '0 minutos';
  if (horas === 0) return `${minutos} minutos`;
  if (minutos === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${minutos}min`;
});

const tiempoEstimadoTexto = (tarjeta) => {
  const totalMinutos = (tarjeta.horasEstimadas * 60) + (tarjeta.minutosEstimados || 0);
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  
  if (totalMinutos === 0) return 'Sin especificar';
  if (horas === 0) return `${minutos} minutos`;
  if (minutos === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${minutos}min`;
};

const tiempoRealTexto = (tarjeta) => {
  const totalMinutos = (tarjeta.horasTotalesReales * 60) + (tarjeta.minutosTotalesReales || 0);
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  
  if (totalMinutos === 0) return '0 minutos';
  if (horas === 0) return `${minutos} minutos`;
  if (minutos === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${minutos}min`;
};

const handleSubmit = async () => {
  const tiempoTotalMinutos = (form.value.horasTrabajadas * 60) + form.value.minutosTrabajados;
  
  if (tiempoTotalMinutos <= 0) {
    alert('Debe ingresar tiempo trabajado mayor a 0');
    return;
  }
  
  loading.value = true;
  try {
    const dataToSend = {
      horasTrabajadas: form.value.horasTrabajadas,
      minutosTrabajados: form.value.minutosTrabajados,
      porcentajeAvance: form.value.porcentajeAvance,
      comentario: form.value.comentario,
      inicioTrabajo: form.value.inicioTrabajo,
      finTrabajo: form.value.finTrabajo,
      cruzoMedianoche: form.value.cruzoMedianoche,
      esHoraExtra: form.value.esHoraExtra
    };
    
    await tarjetasStore.registrarProgreso(props.tarjeta._id, dataToSend);
    emit('updated');
    emit('close');
  } catch (error) {
    console.error('❌ Error registrando progreso:', error);
    alert('Error al registrar el progreso: ' + (error.message || 'Error desconocido'));
  } finally {
    loading.value = false;
  }
};
</script>