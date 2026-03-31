<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">Asignar empleado</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      
      <div class="p-4">
        <p class="mb-4 text-gray-700">Tarea: <strong class="text-gray-900">{{ tarjeta.titulo }}</strong></p>
        
        <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar empleado</label>
        <select v-model="empleadoId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4">
          <option value="">-- Seleccionar empleado --</option>
          <option v-for="emp in empleados" :key="emp._id" :value="emp._id">
            {{ emp.nombre }} - {{ emp.email }}
          </option>
        </select>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tiempo sugerido <span class="text-gray-400 text-xs">(opcional - solo referencia)</span>
          </label>
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-xs text-gray-500 mb-1">Horas (0-23)</label>
              <input
                v-model.number="tiempoSugeridoHoras"
                type="number"
                step="1"
                min="0"
                max="23"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                @input="validarHorasSugeridas"
              />
              <p class="text-xs text-gray-400 mt-1">Horas (0-23)</p>
            </div>
            <div class="flex-1">
              <label class="block text-xs text-gray-500 mb-1">Minutos (0-59)</label>
              <input
                v-model.number="tiempoSugeridoMinutos"
                type="number"
                step="1"
                min="0"
                max="59"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                @input="validarMinutosSugeridos"
              />
              <p class="text-xs text-gray-400 mt-1">Minutos (0-59)</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">El empleado verá esta sugerencia</p>
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="asignar" 
            :disabled="!empleadoId || loading" 
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {{ loading ? 'Asignando...' : 'Asignar tarea' }}
          </button>
          <button 
            @click="$emit('close')" 
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
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

const emit = defineEmits(['close', 'asignado']);

const tarjetasStore = useTarjetasStore();
const config = useRuntimeConfig();
const empleados = ref([]);
const empleadoId = ref('');
const loading = ref(false);
const tiempoSugeridoHoras = ref(0);
const tiempoSugeridoMinutos = ref(0);

const validarHorasSugeridas = () => {
  let horas = parseInt(tiempoSugeridoHoras.value);
  if (isNaN(horas)) horas = 0;
  horas = Math.min(23, Math.max(0, horas));
  tiempoSugeridoHoras.value = horas;
};

const validarMinutosSugeridos = () => {
  let minutos = parseInt(tiempoSugeridoMinutos.value);
  if (isNaN(minutos)) minutos = 0;
  minutos = Math.min(59, Math.max(0, minutos));
  tiempoSugeridoMinutos.value = minutos;
};

const cargarEmpleados = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/empleados`;
    console.log('📤 Cargando empleados desde:', url);
    
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    empleados.value = response;
  } catch (error) {
    console.error('Error cargando empleados:', error);
  }
};

const asignar = async () => {
  if (!empleadoId.value) {
    alert('Selecciona un empleado');
    return;
  }
  
  loading.value = true;
  try {
    await tarjetasStore.asignarPorJefe(
      props.tarjeta._id, 
      empleadoId.value,
      tiempoSugeridoHoras.value,
      tiempoSugeridoMinutos.value
    );
    emit('asignado');
  } catch (error) {
    console.error('Error asignando:', error);
    alert('Error al asignar la tarea');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  cargarEmpleados();
});
</script>