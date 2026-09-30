<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
      <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">🔄 Reasignar tarea</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
      </div>
      
      <div class="p-4">
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
          Tarea: <strong class="text-gray-800 dark:text-white">{{ tarjeta.titulo }}</strong>
        </p>
        
        <div v-if="tarjeta.asignadoA" class="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
          <p class="text-sm text-yellow-700 dark:text-yellow-300">
            👤 Técnico actual: <strong>{{ tarjeta.asignadoA.nombre }}</strong>
          </p>
          <p class="text-xs text-yellow-600 dark:text-yellow-400">
            Estado: {{ estadoTextoLabel(tarjeta.estado) }} - Progreso: {{ tarjeta.porcentajeCompletado || 0 }}%
          </p>
          <p v-if="tarjeta.tiempoEstimadoEmpleado > 0" class="text-xs text-blue-600 dark:text-blue-400">
            ⏱️ Tiempo estimado: {{ formatTiempo(tarjeta.tiempoEstimadoEmpleado) }}
          </p>
          <p v-else class="text-xs text-orange-600 dark:text-orange-400">
            ⚠️ Tarea sin tiempo estimado establecido
          </p>
        </div>
        
        <div v-if="cargandoTecnicos" class="text-center py-4">
          <div class="animate-pulse text-gray-500 dark:text-gray-400">Cargando técnicos...</div>
        </div>
        
        <div v-else-if="tecnicosDisponibles.length === 0" class="text-center py-4">
          <div class="text-yellow-600 dark:text-yellow-400">⚠️ No hay técnicos disponibles</div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Registra técnicos en el sistema primero</p>
        </div>
        
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seleccionar nuevo técnico
          </label>
          <select v-model="tecnicoSeleccionado" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4">
            <option value="">-- Seleccionar técnico --</option>
            <option v-for="tec in tecnicosDisponibles" :key="tec._id" :value="tec._id">
              {{ tec.nombre }} - {{ tec.email }}
              <span v-if="tec._id === tarjeta.asignadoA?._id" class="text-yellow-500"> (actual)</span>
            </option>
          </select>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Motivo de la reasignación <span class="text-gray-400 text-xs">(opcional)</span>
            </label>
            <textarea
              v-model="motivo"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: El técnico actual no ha iniciado la tarea"
            ></textarea>
          </div>
          
          <div class="flex gap-2">
            <button 
              @click="reasignar" 
              :disabled="!tecnicoSeleccionado || loading || tecnicoSeleccionado === tarjeta.asignadoA?._id" 
              class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {{ loading ? 'Reasignando...' : '🔄 Reasignar tarea' }}
            </button>
            <button 
              @click="$emit('close')" 
              class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
          
          <p v-if="tecnicoSeleccionado === tarjeta.asignadoA?._id" class="text-xs text-yellow-500 mt-2">
            ⚠️ El técnico seleccionado es el mismo que el actual
          </p>
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

const emit = defineEmits(['close', 'reasignado']);

console.log('🔄 [ReasignarModal] Componente cargado');
console.log(`📋 Tarea: ${props.tarjeta.titulo}`);

const tarjetasStore = useTarjetasStore();
const config = useRuntimeConfig();

const tecnicosDisponibles = ref([]);
const tecnicoSeleccionado = ref('');
const motivo = ref('');
const loading = ref(false);
const cargandoTecnicos = ref(false);

const estadoTextoLabel = (estado) => {
  const map = {
    pendiente: 'Pendiente',
    en_progreso: 'En Progreso',
    revision_supervisor: 'Revisión Supervisor',
    revision_cliente: 'Revisión Cliente',
    finalizada: 'Finalizada'
  };
  return map[estado] || estado;
};

const formatTiempo = (minutos) => {
  if (!minutos || minutos === 0) return '0 min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${mins}min`;
};

const cargarTecnicos = async () => {
  console.log('📤 [ReasignarModal] Cargando técnicos...');
  cargandoTecnicos.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/empleados`;
    console.log(`   📍 URL: ${url}`);
    
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`   📊 Técnicos recibidos: ${response.length}`);
    
    const tecnicosFiltrados = response.filter(emp => emp.rol === 'tecnico' && emp.activo !== false);
    console.log(`   ✅ Técnicos válidos: ${tecnicosFiltrados.length}`);
    
    tecnicosDisponibles.value = tecnicosFiltrados;
    
    // Preseleccionar el técnico actual si existe
    if (props.tarjeta.asignadoA?._id) {
      tecnicoSeleccionado.value = props.tarjeta.asignadoA._id;
    }
  } catch (error) {
    console.error('❌ Error cargando técnicos:', error);
    alert('Error al cargar la lista de técnicos');
  } finally {
    cargandoTecnicos.value = false;
  }
};

const reasignar = async () => {
  if (!tecnicoSeleccionado.value) {
    alert('Selecciona un técnico');
    return;
  }
  
  if (tecnicoSeleccionado.value === props.tarjeta.asignadoA?._id) {
    alert('El técnico seleccionado es el mismo que el actual');
    return;
  }
  
  console.log('📤 [ReasignarModal] Reasignando tarea...');
  console.log(`   - Nuevo técnico ID: ${tecnicoSeleccionado.value}`);
  console.log(`   - Tarea ID: ${props.tarjeta._id}`);
  console.log(`   - Motivo: ${motivo.value}`);
  
  loading.value = true;
  try {
    const resultado = await tarjetasStore.reasignarTarea(
      props.tarjeta._id,
      tecnicoSeleccionado.value,
      motivo.value
    );
    
    console.log('✅ Tarea reasignada exitosamente:', resultado);
    alert(`✅ Tarea reasignada exitosamente`);
    emit('reasignado');
    emit('close');
  } catch (error) {
    console.error('❌ Error reasignando tarea:', error);
    alert(`❌ Error al reasignar: ${error.message || 'Error desconocido'}`);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log('✅ [ReasignarModal] Montado, cargando técnicos...');
  cargarTecnicos();
});
</script>