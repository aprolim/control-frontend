<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
      <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Asignar técnico</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
      </div>
      
      <div class="p-4">
        <p class="mb-4 text-gray-700 dark:text-gray-300">Tarea: <strong class="text-gray-900 dark:text-white">{{ tarjeta.titulo }}</strong></p>
        
        <div v-if="cargandoTecnicos" class="text-center py-4">
          <div class="animate-pulse text-gray-500 dark:text-gray-400">Cargando técnicos...</div>
        </div>
        
        <div v-else-if="tecnicos.length === 0" class="text-center py-4">
          <div class="text-yellow-600 dark:text-yellow-400">⚠️ No hay técnicos disponibles</div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Registra técnicos en el sistema primero</p>
        </div>
        
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seleccionar técnico</label>
          <select v-model="tecnicoId" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4">
            <option value="">-- Seleccionar técnico --</option>
            <option v-for="tec in tecnicos" :key="tec._id" :value="tec._id">
              {{ tec.nombre }} - {{ tec.email }}
            </option>
          </select>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tiempo sugerido <span class="text-gray-400 text-xs">(opcional - solo referencia)</span>
            </label>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Horas (0-23)</label>
                <input
                  v-model.number="tiempoSugeridoHoras"
                  type="number"
                  step="1"
                  min="0"
                  max="23"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                  @input="validarHorasSugeridas"
                />
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Horas (0-23)</p>
              </div>
              <div class="flex-1">
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minutos (0-59)</label>
                <input
                  v-model.number="tiempoSugeridoMinutos"
                  type="number"
                  step="1"
                  min="0"
                  max="59"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                  @input="validarMinutosSugeridos"
                />
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Minutos (0-59)</p>
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">El técnico verá esta sugerencia</p>
          </div>
          
          <div class="flex gap-2">
            <button 
              @click="asignar" 
              :disabled="!tecnicoId || loading" 
              class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {{ loading ? 'Asignando...' : 'Asignar tarea' }}
            </button>
            <button 
              @click="$emit('close')" 
              class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
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

console.log('👥 [AsignarEmpleadoModal] Componente cargado');
console.log(`📋 Tarea: ${props.tarjeta.titulo}`);

const tarjetasStore = useTarjetasStore();
const config = useRuntimeConfig();
const tecnicos = ref([]);
const tecnicoId = ref('');
const loading = ref(false);
const cargandoTecnicos = ref(false);
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

const cargarTecnicos = async () => {
  console.log('📤 [AsignarEmpleadoModal] Cargando técnicos...');
  cargandoTecnicos.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/empleados`;
    console.log(`   📍 URL: ${url}`);
    
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`   📊 Técnicos recibidos: ${response.length}`);
    
    const tecnicosFiltrados = response.filter(emp => emp.rol === 'tecnico');
    console.log(`   ✅ Técnicos válidos: ${tecnicosFiltrados.length}`);
    
    if (tecnicosFiltrados.length === 0) {
      console.warn('⚠️ No hay técnicos disponibles en el sistema');
    } else {
      tecnicosFiltrados.forEach(tec => {
        console.log(`      - ${tec.nombre} (${tec.email}) - ${tec.rol}`);
      });
    }
    
    tecnicos.value = tecnicosFiltrados;
  } catch (error) {
    console.error('❌ Error cargando técnicos:', error);
    alert('Error al cargar la lista de técnicos');
  } finally {
    cargandoTecnicos.value = false;
  }
};

// ============================================================
// 🔥 CORREGIDO: asignarPorSupervisor en lugar de asignarPorJefe
// ============================================================
const asignar = async () => {
  if (!tecnicoId.value) {
    console.warn('⚠️ No se seleccionó técnico');
    alert('Selecciona un técnico');
    return;
  }
  
  console.log('📤 [AsignarEmpleadoModal] Asignando tarea...');
  console.log(`   - Técnico ID: ${tecnicoId.value}`);
  console.log(`   - Tarea ID: ${props.tarjeta._id}`);
  console.log(`   - Tiempo sugerido: ${tiempoSugeridoHoras.value}h ${tiempoSugeridoMinutos.value}min`);
  
  loading.value = true;
  try {
    // 🔥 CAMBIADO: asignarPorSupervisor en lugar de asignarPorJefe
    const resultado = await tarjetasStore.asignarPorSupervisor(
      props.tarjeta._id, 
      tecnicoId.value,
      tiempoSugeridoHoras.value,
      tiempoSugeridoMinutos.value
    );
    
    console.log('✅ Tarea asignada exitosamente:', resultado);
    emit('asignado');
  } catch (error) {
    console.error('❌ Error asignando tarea:', error);
    console.error('   Detalles:', error.data);
    
    let mensajeError = 'Error al asignar la tarea';
    if (error.data?.message) {
      mensajeError = error.data.message;
    } else if (error.message) {
      mensajeError = error.message;
    }
    alert(`❌ ${mensajeError}`);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log('✅ [AsignarEmpleadoModal] Montado, cargando técnicos...');
  cargarTecnicos();
});
</script>