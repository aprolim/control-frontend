<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <!-- Navbar -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span class="text-white text-sm font-bold">CP</span>
            </div>
            <h1 class="text-base font-semibold text-gray-800 dark:text-white">Control de Personal</h1>
          </div>
          
          <div class="flex items-center gap-3">
            <ThemeToggle />
            
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                <span class="text-xs font-medium text-blue-700 dark:text-blue-300">{{ authStore.user?.nombre?.charAt(0) || '?' }}</span>
              </div>
              <div class="hidden sm:block">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ authStore.user?.nombre || 'Usuario' }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 ml-2">Técnico</span>
              </div>
              <span class="sm:hidden text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Técnico</span>
            </div>
            <button
              @click="logout"
              class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Botones de acción -->
      <div class="mb-4 flex flex-wrap justify-end gap-2">
        <button
          @click="cargarTareasDisponibles"
          class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-1.5 text-sm shadow-sm"
        >
          <span class="text-base">🔄</span>
          <span>Actualizar</span>
        </button>
        <button
          @click="abrirModalTareaExtra"
          class="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center gap-1.5 text-sm shadow-sm"
        >
          <span class="text-base">📝</span>
          <span>Mi Tarea Extra</span>
        </button>
      </div>
      
      <!-- Estado de Técnicos -->
      <div class="mb-6">
        <EstadoEmpleados />
      </div>
      
      <!-- Tareas Disponibles -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-bold text-gray-800 dark:text-white">📋 Tareas Disponibles</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Selecciona una tarea para comenzar a trabajar</p>
            </div>
            <button 
              @click="tomarSiguienteTarea" 
              :disabled="cargandoTarea || tareasDisponibles.length === 0"
              class="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition flex items-center gap-2 shadow-sm"
            >
              <span>🎯</span>
              {{ cargandoTarea ? 'Tomando...' : 'Tomar Siguiente Tarea' }}
            </button>
          </div>
        </div>
        
        <div class="p-5">
          <div v-if="cargandoDisponibles" class="text-center py-8">
            <div class="animate-pulse">
              <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3"></div>
              <div class="text-gray-500 dark:text-gray-400">Cargando tareas disponibles...</div>
            </div>
          </div>
          
          <div v-else-if="tareasDisponibles.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl">📭</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400">No hay tareas disponibles en este momento</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="tarea in tareasDisponibles" 
              :key="tarea._id"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-green-300 dark:hover:border-green-700 hover:transform hover:-translate-y-1"
              @click="tomarTareaEspecifica(tarea._id)"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-gray-800 dark:text-white line-clamp-1">{{ tarea.titulo }}</h3>
                <span :class="prioridadColorClass(tarea.prioridad)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ prioridadTextoLabel(tarea.prioridad) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{{ tarea.descripcion || 'Sin descripción' }}</p>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                <div v-if="tarea.clienteInfo" class="flex items-center gap-2 mb-1">
                  <span>👤 {{ tarea.clienteInfo.nombre || 'Anónimo' }}</span>
                  <span v-if="tarea.clienteInfo.telefono" class="text-gray-400">📞 {{ tarea.clienteInfo.telefono }}</span>
                </div>
                <div>📅 {{ new Date(tarea.createdAt).toLocaleDateString() }}</div>
              </div>
              
              <!-- Mostrar progreso si la tarea ya tiene tiempo estimado -->
              <div v-if="tarea.tiempoEstimadoEmpleado > 0" class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Progreso:</span>
                  <span class="font-medium text-blue-600">{{ calcularProgresoReal(tarea) }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                  <div class="bg-blue-500 rounded-full h-1.5 transition-all duration-500" :style="{ width: `${calcularProgresoReal(tarea)}%` }"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>⏱️ {{ formatTiempo(calcularTiempoTranscurrido(tarea)) }}</span>
                  <span>🎯 {{ formatTiempo(tarea.tiempoEstimadoEmpleado) }}</span>
                </div>
              </div>
              
              <button 
                class="mt-3 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-1.5 rounded text-sm hover:from-green-600 hover:to-green-700 transition"
                @click.stop="tomarTareaEspecifica(tarea._id)"
              >
                Tomar tarea
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mis Tareas -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white">⚙️ Mis Tareas</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tareas que tienes asignadas actualmente</p>
        </div>
        
        <div class="p-5">
          <div v-if="tareasEnProgreso.length === 0 && !tareaActiva" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl">📭</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400">No tienes tareas asignadas actualmente</p>
          </div>
          
          <div v-else class="space-y-4">
            <!-- Tarea Activa -->
            <div v-if="tareaActiva" class="border-2 border-green-500 bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 rounded-xl p-5 shadow-md">
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 class="font-bold text-gray-800 dark:text-white text-lg">{{ tareaActiva.titulo }}</h3>
                  <span class="text-xs px-2 py-1 rounded-full bg-green-500 text-white flex items-center gap-1">
                    <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    ACTIVA
                  </span>
                </div>
                <span :class="prioridadColorClass(tareaActiva.prioridad)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ prioridadTextoLabel(tareaActiva.prioridad) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{{ tareaActiva.descripcion || 'Sin descripción' }}</p>
              
              <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Progreso:</span>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div class="bg-green-500 rounded-full h-2 transition-all duration-500" :style="{ width: `${calcularProgresoReal(tareaActiva)}%` }"></div>
                  </div>
                  <span class="text-xs font-medium text-green-600">{{ calcularProgresoReal(tareaActiva) }}%</span>
                  <span class="text-xs text-gray-400 ml-2">({{ formatTiempo(calcularTiempoTranscurrido(tareaActiva)) }} trabajados)</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Tiempo estimado:</span>
                  <span class="font-medium ml-1 text-blue-600">{{ formatTiempo(tareaActiva.tiempoEstimadoEmpleado) }}</span>
                </div>
              </div>
              
              <!-- Mostrar el nombre completo del usuario que solicitó -->
              <div v-if="tareaActiva.tipo === 'solicitud_cliente' && tareaActiva.clienteInfo" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span>👤 Usuario:</span>
                  <span class="font-medium">{{ tareaActiva.clienteInfo.nombre || 'Anónimo' }}</span>
                  <span v-if="tareaActiva.clienteInfo.telefono" class="text-gray-500">📞 {{ tareaActiva.clienteInfo.telefono }}</span>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button 
                  @click="pausarTarea(tareaActiva._id)"
                  class="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition text-sm font-medium"
                >
                  ⏸️ Pausar
                </button>
                <button 
                  @click="abrirModalProgreso(tareaActiva)"
                  class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition text-sm font-medium"
                >
                  📊 Registrar progreso
                </button>
              </div>
            </div>
            
            <!-- Tareas Pausadas -->
            <div v-for="tarea in tareasPausadas" :key="tarea._id" 
                 class="border border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 rounded-xl p-4">
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-800 dark:text-white">{{ tarea.titulo }}</h3>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                    ⏸️ Pausada
                  </span>
                </div>
                <span :class="prioridadColorClass(tarea.prioridad)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ prioridadTextoLabel(tarea.prioridad) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{{ tarea.descripcion || 'Sin descripción' }}</p>
              
              <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Progreso:</span>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div class="bg-blue-500 rounded-full h-2 transition-all duration-500" :style="{ width: `${calcularProgresoReal(tarea)}%` }"></div>
                  </div>
                  <span class="text-xs font-medium text-blue-600">{{ calcularProgresoReal(tarea) }}%</span>
                  <span class="text-xs text-gray-400 ml-2">({{ formatTiempo(calcularTiempoTranscurrido(tarea)) }} trabajados)</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Tiempo estimado:</span>
                  <span class="font-medium ml-1 text-blue-600">{{ formatTiempo(tarea.tiempoEstimadoEmpleado) }}</span>
                </div>
              </div>
              
              <!-- Mostrar el nombre completo del usuario que solicitó -->
              <div v-if="tarea.tipo === 'solicitud_cliente' && tarea.clienteInfo" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span>👤 Usuario:</span>
                  <span class="font-medium">{{ tarea.clienteInfo.nombre || 'Anónimo' }}</span>
                  <span v-if="tarea.clienteInfo.telefono" class="text-gray-500">📞 {{ tarea.clienteInfo.telefono }}</span>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button 
                  v-if="tarea.tiempoEstimadoEmpleado === 0"
                  @click="abrirModalTiempo(tarea)"
                  class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition text-sm font-medium"
                >
                  🚀 Establecer tiempo
                </button>
                <button 
                  v-else
                  @click="reanudarTarea(tarea._id)"
                  class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition text-sm font-medium"
                >
                  ▶️ Reanudar
                </button>
                <button 
                  @click="abrirModalProgreso(tarea)"
                  class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition text-sm font-medium"
                >
                  📊 Registrar progreso
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tareas Completadas -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white">✅ Tareas Completadas</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Historial de tareas finalizadas</p>
        </div>
        
        <div class="p-5">
          <div v-if="tareasCompletadas.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl">🏆</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400">Aún no has completado ninguna tarea</p>
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="tarea in tareasCompletadas" :key="tarea._id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50 hover:shadow-md transition">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800 dark:text-white">{{ tarea.titulo }}</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Completada: {{ new Date(tarea.fechaFinalizada || tarea.updatedAt).toLocaleDateString() }}
                  </p>
                </div>
                <div v-if="tarea.calificacion?.puntaje" class="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                  <span class="text-yellow-500">★</span>
                  <span class="font-medium text-gray-700 dark:text-gray-300">{{ tarea.calificacion.puntaje }}/5</span>
                </div>
                <span v-else-if="tarea.calificacion?.autoFinalizada" class="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                  Auto-finalizada
                </span>
                <span v-else class="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">Sin calificar</span>
              </div>
              <!-- Mostrar el nombre completo del usuario que solicitó -->
              <div v-if="tarea.tipo === 'solicitud_cliente' && tarea.clienteInfo" class="mt-2 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <span>👤 Solicitado por:</span>
                <span class="font-medium text-gray-600 dark:text-gray-400">{{ tarea.clienteInfo.nombre || 'Anónimo' }}</span>
              </div>
              <div v-if="tarea.calificacion?.comentario" class="mt-2 text-sm text-gray-600 dark:text-gray-400 italic bg-white dark:bg-gray-800 p-2 rounded">
                "{{ tarea.calificacion.comentario }}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modales -->
    <ModalTiempoEstimado
      v-if="tareaParaTiempo"
      :tarjeta="tareaParaTiempo"
      @tiempo-establecido="handleTiempoEstablecido"
    />
    
    <RegistrarProgresoModal
      v-if="tareaParaProgreso"
      :tarjeta="tareaParaProgreso"
      @close="tareaParaProgreso = null"
      @updated="recargarDatos"
    />
    
    <SolicitudModal
      v-if="modalTareaExtra"
      :extra="true"
      @close="modalTareaExtra = false"
      @created="recargarDatos"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useTarjetasStore } from '~/stores/tarjetas';
import { useRoles } from '~/composables/useRoles';
import ModalTiempoEstimado from '~/components/ModalTiempoEstimado.vue';
import RegistrarProgresoModal from '~/components/RegistrarProgresoModal.vue';

definePageMeta({
  middleware: 'auth'
});

console.log('========================================');
console.log('🔧 [Tecnico] Página cargada');
console.log('========================================');

const authStore = useAuthStore();
const tarjetasStore = useTarjetasStore();
const { isTecnico } = useRoles();

// Verificar que sea técnico
if (!isTecnico.value) {
  console.warn('⚠️ [Tecnico] Usuario no es técnico, redirigiendo...');
  navigateTo('/');
}

console.log('✅ [Tecnico] Usuario verificado como técnico');

const config = useRuntimeConfig();

// Estado
const tareasDisponibles = ref([]);
const cargandoDisponibles = ref(false);
const cargandoTarea = ref(false);
const tareaParaTiempo = ref(null);
const tareaParaProgreso = ref(null);
const modalTareaExtra = ref(false);

// Variables para Sockets
const socket = ref(null);
let intervaloTiempoReal = null;
let pollingInterval = null;
const forceUpdate = ref(0);

// ============================================================
// FUNCIONES DE CÁLCULO DE PROGRESO EN TIEMPO REAL
// ============================================================

const calcularProgresoReal = (tarea) => {
  if (!tarea?.tiempoEstimadoEmpleado || tarea.tiempoEstimadoEmpleado <= 0) {
    return tarea?.porcentajeCompletado || 0;
  }
  
  let tiempoTotal = tarea.tiempoAcumulado || 0;
  
  if (tarea.estadoProgreso === 'activa' && tarea.fechaUltimaReanudacion) {
    const ahora = new Date();
    const inicio = new Date(tarea.fechaUltimaReanudacion);
    const minutosDesdeReanudacion = Math.floor((ahora - inicio) / 1000 / 60);
    tiempoTotal += minutosDesdeReanudacion;
  }
  
  const tiempoEstimado = tarea.tiempoEstimadoEmpleado;
  let progreso = Math.min(100, Math.floor((tiempoTotal / tiempoEstimado) * 100));
  progreso = Math.max(progreso, tarea.porcentajeCompletado || 0);
  
  return Math.min(100, progreso);
};

const calcularTiempoTranscurrido = (tarea) => {
  if (!tarea) return 0;
  
  let tiempoTotal = tarea.tiempoAcumulado || 0;
  
  if (tarea.estadoProgreso === 'activa' && tarea.fechaUltimaReanudacion) {
    const ahora = new Date();
    const inicio = new Date(tarea.fechaUltimaReanudacion);
    const minutosDesdeReanudacion = Math.floor((ahora - inicio) / 1000 / 60);
    tiempoTotal += minutosDesdeReanudacion;
  }
  
  return tiempoTotal;
};

// ============================================================
// COMPUTED
// ============================================================

const tareasEnProgreso = computed(() => {
  return tarjetasStore.tarjetas.filter(t => t.estado === 'en_progreso');
});

const tareasCompletadas = computed(() => {
  return tarjetasStore.tarjetas.filter(t => t.estado === 'finalizada' || t.estado === 'revision_cliente');
});

const tareaActiva = computed(() => {
  return tarjetasStore.tarjetas.find(t => t.estadoProgreso === 'activa' && t.estado === 'en_progreso');
});

const tareasPausadas = computed(() => {
  if (!tareaActiva.value) {
    return tareasEnProgreso.value;
  }
  return tareasEnProgreso.value.filter(t => t._id !== tareaActiva.value._id);
});

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

const formatTiempo = (minutos) => {
  if (!minutos && minutos !== 0) return '0 min';
  if (minutos === 0) return '0 min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${mins}min`;
};

const prioridadColorClass = (prioridad) => {
  const map = {
    baja: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    media: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    urgente: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  };
  return map[prioridad] || 'bg-gray-100 text-gray-700';
};

const prioridadTextoLabel = (prioridad) => {
  const map = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    urgente: 'Urgente'
  };
  return map[prioridad] || 'Media';
};

// ============================================================
// CONFIGURAR SOCKETS
// ============================================================

const configurarSockets = () => {
  console.log('🔌 [Tecnico] Configurando sockets...');
  
  const nuxtApp = useNuxtApp();
  socket.value = nuxtApp.$socket;
  
  if (!socket.value) {
    console.warn('⚠️ [Tecnico] Socket no disponible, usando polling como fallback');
    iniciarPollingFallback();
    return;
  }
  
  console.log('✅ [Tecnico] Socket disponible para actualizaciones en tiempo real');
  console.log('🔌 [Tecnico] Socket ID:', socket.value.id);
  
  // EVENTO CRÍTICO: Nueva tarea disponible
  socket.value.on('nueva-tarea-disponible', (data) => {
    console.log('========================================');
    console.log('📢 [Tecnico][SOCKET] ✅ NUEVA TAREA DISPONIBLE!');
    console.log(`   📌 Título: ${data.tarea?.titulo}`);
    console.log(`   🆔 ID: ${data.tarea?._id}`);
    console.log('========================================');
    
    // Recargar tareas disponibles y mis tareas
    recargarDatos();
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📋 Nueva tarea disponible', {
        body: `${data.tarea?.titulo || 'Nueva tarea'}`,
        icon: '/favicon.ico'
      });
    }
  });
  
  // Tarea tomada por otro empleado
  socket.value.on('tarea-tomada', (data) => {
    console.log(`📢 [Tecnico][SOCKET] Tarea tomada por: ${data.empleado?.nombre}`);
    recargarDatos();
  });
  
  // Tarea asignada a mí
  socket.value.on('tarea-asignada', (data) => {
    console.log(`📢 [Tecnico][SOCKET] Tarea asignada: ${data.tarea?.titulo}`);
    if (data.tarea?.asignadoA?._id === authStore.user?._id) {
      console.log('🎯 [Tecnico][SOCKET] ¡Esta tarea es para ti!');
      recargarDatos();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('📋 Tarea asignada', {
          body: `${data.tarea.titulo}`,
          icon: '/favicon.ico'
        });
      }
    }
  });
  
  // Estado actualizado (progreso)
  socket.value.on('estado-actualizado', (data) => {
    console.log(`📊 [Tecnico][SOCKET] Estado actualizado: ${data.porcentaje}%`);
    if (data.empleadoId === authStore.user?._id) {
      recargarDatos();
    }
  });
  
  // Estado general actualizado
  socket.value.on('estado-general-actualizado', (data) => {
    console.log(`🔄 [Tecnico][SOCKET] Estado general actualizado`);
    const tarea = tarjetasStore.tarjetas.find(t => t._id === data.tareaId);
    if (tarea && tarea.asignadoA?._id === authStore.user?._id) {
      recargarDatos();
    }
  });
  
  // Tarea iniciada
  socket.value.on('tarea-iniciada-tiempo-real', (data) => {
    console.log(`🚀 [Tecnico][SOCKET] Tarea iniciada`);
    if (data.empleado?.id === authStore.user?._id) {
      recargarDatos();
    }
  });
  
  // Tarea pausada
  socket.value.on('tarea-pausada-tiempo-real', (data) => {
    console.log(`⏸️ [Tecnico][SOCKET] Tarea pausada`);
    if (data.empleadoId === authStore.user?._id) {
      recargarDatos();
    }
  });
  
  // Tarea reanudada
  socket.value.on('tarea-reanudada-tiempo-real', (data) => {
    console.log(`▶️ [Tecnico][SOCKET] Tarea reanudada`);
    if (data.empleadoId === authStore.user?._id) {
      recargarDatos();
    }
  });
  
  // Progreso actualizado
  socket.value.on('progreso-actualizado', (data) => {
    console.log(`📈 [Tecnico][SOCKET] Progreso actualizado`);
    recargarDatos();
  });
  
  // Tarea completada automáticamente
  socket.value.on('tarea-completada-automaticamente', (data) => {
    console.log(`🎉 [Tecnico][SOCKET] Tarea completada automáticamente: ${data.titulo}`);
    recargarDatos();
  });
  
  // Tarea aprobada por supervisor
  socket.value.on('tarea-aprobada-por-supervisor', (data) => {
    console.log(`✅ [Tecnico][SOCKET] Tarea aprobada por supervisor: ${data.titulo}`);
    recargarDatos();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('✅ Tarea aprobada', {
        body: `"${data.titulo}" - ${data.mensaje}`,
        icon: '/favicon.ico'
      });
    }
  });
  
  // Tarea calificada
  socket.value.on('tarea-calificada', (data) => {
    console.log(`⭐ [Tecnico][SOCKET] Tarea calificada: ${data.titulo} - ${data.puntaje}★`);
    recargarDatos();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⭐ Calificación recibida', {
        body: `Recibiste ${data.puntaje} estrellas en: ${data.titulo}`,
        icon: '/favicon.ico'
      });
    }
  });
  
  // Tarea finalizada sin cliente
  socket.value.on('tarea-finalizada-sin-cliente', (data) => {
    console.log(`✅ [Tecnico][SOCKET] Tarea finalizada: ${data.titulo}`);
    recargarDatos();
  });
  
  // Tarea auto-finalizada
  socket.value.on('tarea-auto-finalizada', (data) => {
    console.log(`🤖 [Tecnico][SOCKET] Tarea auto-finalizada: ${data.titulo}`);
    recargarDatos();
  });
  
  // Tiempo estimado establecido
  socket.value.on('tiempo-estimado-establecido', (data) => {
    console.log(`⏱️ [Tecnico][SOCKET] Tiempo estimado establecido`);
    recargarDatos();
  });
  
  // Rol actualizado
  socket.value.on('rol-actualizado', (data) => {
    console.log('🔄 [Tecnico][SOCKET] Rol actualizado:', data);
    console.log(`   👤 Usuario: ${data.userId}`);
    console.log(`   🆕 Nuevo rol: ${data.nuevoRol}`);
    
    if (data.userId === authStore.user?._id) {
      console.log(`👤 [Tecnico] Tu rol ha cambiado a: ${data.nuevoRol}`);
      authStore.user.rol = data.nuevoRol;
      localStorage.setItem('user', JSON.stringify(authStore.user));
      
      alert(`✅ Tu rol ha sido actualizado a: ${data.nuevoRol}`);
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });
  
  // Iniciar intervalo para actualizar el progreso visual
  intervaloTiempoReal = setInterval(() => {
    forceUpdate.value++;
  }, 5000);
  
  console.log('✅ [Tecnico] Todos los eventos de socket configurados');
};

// ============================================================
// FALLBACK - POLLING (si no hay sockets)
// ============================================================

const iniciarPollingFallback = () => {
  console.warn('⚠️ [Tecnico] Usando polling como fallback (sin sockets)');
  pollingInterval = setInterval(async () => {
    await recargarDatos();
  }, 15000);
};

// ============================================================
// ACCIONES
// ============================================================

const cargarTareasDisponibles = async () => {
  console.log('📤 [Tecnico] Cargando tareas disponibles...');
  cargandoDisponibles.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/disponibles`;
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    tareasDisponibles.value = response;
    console.log(`✅ [Tecnico] ${response.length} tareas disponibles`);
  } catch (error) {
    console.error('❌ [Tecnico] Error cargando tareas disponibles:', error);
  } finally {
    cargandoDisponibles.value = false;
  }
};

const recargarDatos = async () => {
  console.log('🔄 [Tecnico] 🔥 recargarDatos() llamado');
  await tarjetasStore.fetchTarjetas();
  await cargarTareasDisponibles();
  forceUpdate.value++;
  console.log('✅ [Tecnico] Datos recargados');
};

const tomarSiguienteTarea = async () => {
  cargandoTarea.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/tomar-siguiente`;
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.success) {
      await recargarDatos();
      alert('✅ Tarea asignada exitosamente');
    }
  } catch (error) {
    console.error('❌ [Tecnico] Error:', error);
    alert(error.data?.message || 'Error al tomar la tarea');
  } finally {
    cargandoTarea.value = false;
  }
};

const tomarTareaEspecifica = async (id) => {
  cargandoTarea.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${id}/tomar`;
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.success) {
      await recargarDatos();
      alert('✅ Tarea asignada exitosamente');
    }
  } catch (error) {
    console.error('❌ [Tecnico] Error:', error);
    alert(error.data?.message || 'Error al tomar la tarea');
  } finally {
    cargandoTarea.value = false;
  }
};

const pausarTarea = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${id}/pausar`;
    await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    await recargarDatos();
    alert('⏸️ Tarea pausada');
  } catch (error) {
    console.error('❌ [Tecnico] Error al pausar:', error);
    alert('Error al pausar');
  }
};

const reanudarTarea = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${id}/reanudar`;
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.success) {
      await recargarDatos();
      alert('▶️ Tarea reanudada');
    }
  } catch (error) {
    console.error('❌ [Tecnico] Error al reanudar:', error);
    alert('Error al reanudar la tarea');
  }
};

const abrirModalTiempo = (tarea) => {
  tareaParaTiempo.value = tarea;
};

const abrirModalProgreso = (tarea) => {
  tareaParaProgreso.value = tarea;
};

const handleTiempoEstablecido = async () => {
  tareaParaTiempo.value = null;
  await recargarDatos();
};

const logout = () => {
  authStore.logout();
};

const abrirModalTareaExtra = () => {
  modalTareaExtra.value = true;
};

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  console.log('========================================');
  console.log('🔄 [Tecnico] onMounted - Iniciando...');
  console.log('========================================');
  
  authStore.loadFromStorage();
  console.log('🔍 [Tecnico] Usuario:', authStore.user);
  console.log('🔍 [Tecnico] Rol:', authStore.user?.rol);
  
  await recargarDatos();
  configurarSockets();
  
  // Asegurar que el usuario se una al socket
  setTimeout(() => {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.$socket && authStore.user?._id) {
      console.log('🔄 [Tecnico] Forzando join al socket...');
      nuxtApp.$socket.emit('join', authStore.user._id);
    }
  }, 1000);
  
  console.log('✅ [Tecnico] Inicialización completada');
  console.log('========================================');
});

onUnmounted(() => {
  console.log('🛑 [Tecnico] onUnmounted - Limpiando...');
  
  if (intervaloTiempoReal) clearInterval(intervaloTiempoReal);
  if (pollingInterval) clearInterval(pollingInterval);
  
  if (socket.value) {
    socket.value.off('nueva-tarea-disponible');
    socket.value.off('tarea-tomada');
    socket.value.off('tarea-asignada');
    socket.value.off('estado-actualizado');
    socket.value.off('estado-general-actualizado');
    socket.value.off('tarea-iniciada-tiempo-real');
    socket.value.off('tarea-pausada-tiempo-real');
    socket.value.off('tarea-reanudada-tiempo-real');
    socket.value.off('progreso-actualizado');
    socket.value.off('tarea-completada-automaticamente');
    socket.value.off('tarea-aprobada-por-supervisor');
    socket.value.off('tarea-calificada');
    socket.value.off('tarea-finalizada-sin-cliente');
    socket.value.off('tarea-auto-finalizada');
    socket.value.off('tiempo-estimado-establecido');
    socket.value.off('rol-actualizado');
  }
  
  console.log('✅ [Tecnico] Limpieza completada');
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
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>