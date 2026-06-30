<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
      <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Calificar servicio</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
      </div>
      
      <div class="p-4 space-y-4">
        <p class="text-sm text-gray-700 dark:text-gray-300">Tarea: <strong>{{ tarjeta.titulo }}</strong></p>
        <p class="text-sm text-gray-700 dark:text-gray-300">Realizada por: <strong>{{ tarjeta.asignadoA?.nombre }}</strong></p>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Puntaje</label>
          <div class="flex gap-2">
            <button
              v-for="star in 5"
              :key="star"
              @click="puntaje = star"
              type="button"
              class="text-2xl focus:outline-none"
            >
              <span :class="star <= puntaje ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'">★</span>
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentario</label>
          <textarea
            v-model="comentario"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
            placeholder="¿Cómo fue el servicio?"
          ></textarea>
        </div>
        
        <button
          @click="calificar"
          :disabled="!puntaje || loading"
          class="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition dark:bg-yellow-600 dark:hover:bg-yellow-700"
        >
          {{ loading ? 'Enviando...' : 'Enviar calificación' }}
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

const emit = defineEmits(['close', 'calificado']);

const tarjetasStore = useTarjetasStore();
const puntaje = ref(0);
const comentario = ref('');
const loading = ref(false);

const calificar = async () => {
  if (!puntaje.value) {
    alert('Selecciona un puntaje');
    return;
  }
  
  loading.value = true;
  try {
    await tarjetasStore.calificarTarea(props.tarjeta._id, puntaje.value, comentario.value);
    emit('calificado');
    emit('close');
  } catch (error) {
    console.error('Error:', error);
    alert('Error al calificar: ' + (error.message || 'Error desconocido'));
  } finally {
    loading.value = false;
  }
};
</script>