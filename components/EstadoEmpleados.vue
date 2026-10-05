<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
    <!-- ============================================================ -->
    <!-- HEADER                                                        -->
    <!-- ============================================================ -->
    <header class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
          <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Estado de técnicos
            <!-- Badge En vivo / Sin conexión -->
            <span
              v-if="socketConectado"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold uppercase tracking-wide"
              title="Actualizaciones en tiempo real activas"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En vivo
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-semibold uppercase tracking-wide"
              title="Socket desconectado - usando polling"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Sin conexión
            </span>
          </h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ empleadosStore.estadosTecnicos.length }} técnico{{ empleadosStore.estadosTecnicos.length === 1 ? '' : 's' }} · 
            {{ empleadosStore.tecnicosOcupados.length }} ocupado{{ empleadosStore.tecnicosOcupados.length === 1 ? '' : 's' }}
          </p>
        </div>
      </div>

      <button
        @click="refrescar"
        :disabled="empleadosStore.cargando"
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition"
      >
        <svg class="w-3.5 h-3.5" :class="{ 'animate-spin': empleadosStore.cargando }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ empleadosStore.cargando ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </header>

    <!-- ============================================================ -->
    <!-- CONTENIDO                                                     -->
    <!-- ============================================================ -->
    <div class="p-5">
      <!-- Cargando -->
      <div v-if="empleadosStore.cargando && empleadosStore.estadosTecnicos.length === 0" 
           class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="i in 3" :key="i" class="animate-pulse border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Sin técnicos -->
      <div v-else-if="empleadosStore.estadosTecnicos.length === 0" class="text-center py-8">
        <div class="w-14 h-14 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">No hay técnicos registrados</p>
      </div>

      <!-- Grid de técnicos -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <article
          v-for="tec in empleadosStore.estadosTecnicos"
          :key="tec.empleadoId"
          class="border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
          :class="tec.tarea 
            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10' 
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'"
        >
          <!-- Header del técnico -->
          <div class="p-4 border-b border-gray-100 dark:border-gray-800/50">
            <div class="flex items-start justify-between gap-2 mb-1">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <!-- Avatar -->
                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                     :class="tec.tarea 
                       ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                       : 'bg-gradient-to-br from-gray-400 to-gray-500'">
                  <span class="text-xs font-semibold text-white">
                    {{ tec.empleadoNombre?.charAt(0) || '?' }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {{ tec.empleadoNombre }}
                  </h3>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {{ tec.empleadoEmail }}
                  </p>
                </div>
              </div>

              <!-- Badge de rol supervisor -->
              <span v-if="tec.rol === 'supervisor'" 
                    class="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-[10px] font-semibold uppercase">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Supervisor
              </span>
            </div>

            <!-- Estado -->
            <div class="flex items-center gap-2 mt-2">
              <span
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                :class="tec.tarea
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'"
              >
                <span class="w-1.5 h-1.5 rounded-full"
                      :class="tec.tarea ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'"></span>
                {{ tec.tarea ? 'Ocupado' : 'Disponible' }}
              </span>
            </div>
          </div>

          <!-- Contenido: tarea o disponible -->
          <div class="p-4">
            <!-- Con tarea -->
            <div v-if="tec.tarea">
              <!-- Título -->
              <p class="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 mb-2">
                {{ tec.tarea.titulo }}
              </p>

              <!-- Tiempo restante destacado -->
              <div v-if="tec.tarea.tiempoEstimado > 0" class="mb-3">
                <div class="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                  <span class="font-semibold uppercase tracking-wide">Restante</span>
                  <span class="tabular-nums font-bold"
                        :class="tiempoRestanteLocal(tec.tarea) < 5 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'">
                    {{ formatTiempoRestante(tiempoRestanteLocal(tec.tarea)) }}
                  </span>
                </div>
                <!-- Barra de progreso -->
                <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="h-1.5 rounded-full transition-all duration-500"
                    :class="tiempoRestanteLocal(tec.tarea) < 5 
                      ? 'bg-red-500' 
                      : progresoLocal(tec.tarea) >= 80 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'"
                    :style="{ width: `${progresoLocal(tec.tarea)}%` }"
                  ></div>
                </div>
                <div class="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  <span class="tabular-nums">{{ progresoLocal(tec.tarea) }}%</span>
                  <span class="tabular-nums">
                    {{ formatTiempo(transcurridoLocal(tec.tarea)) }} / {{ formatTiempo(tec.tarea.tiempoEstimado) }}
                  </span>
                </div>
              </div>

              <!-- Sin tiempo estimado -->
              <div v-else class="mb-3 text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sin tiempo definido
              </div>

              <!-- Descripción -->
              <p class="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                {{ tec.tarea.descripcion || 'Sin descripción' }}
              </p>
            </div>

            <!-- Sin tarea -->
            <div v-else class="text-center py-2">
              <p class="text-xs text-gray-400 dark:text-gray-500 italic">
                Esperando nueva tarea...
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- DIAGNÓSTICO (colapsable)                                      -->
    <!-- ============================================================ -->
    <details class="border-t border-gray-200 dark:border-gray-800 group">
      <summary class="px-5 py-3 text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition flex items-center gap-2 select-none">
        <svg class="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        Diagnóstico de conexión
      </summary>
      
      <div class="px-5 pb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
          <span class="text-[10px] text-gray-500 dark:text-gray-400 block uppercase tracking-wide font-semibold mb-0.5">Socket</span>
          <span :class="socketConectado ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'" 
                class="text-xs font-bold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full"
                  :class="socketConectado ? 'bg-emerald-500' : 'bg-red-500'"></span>
            {{ socketConectado ? 'Conectado' : 'Desconectado' }}
          </span>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
          <span class="text-[10px] text-gray-500 dark:text-gray-400 block uppercase tracking-wide font-semibold mb-0.5">Socket ID</span>
          <span class="font-mono text-[10px] text-gray-700 dark:text-gray-300 truncate block">
            {{ empleadosStore.socketId || 'N/A' }}
          </span>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
          <span class="text-[10px] text-gray-500 dark:text-gray-400 block uppercase tracking-wide font-semibold mb-0.5">Eventos</span>
          <span class="text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {{ empleadosStore.eventosRecibidos }}
          </span>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
          <span class="text-[10px] text-gray-500 dark:text-gray-400 block uppercase tracking-wide font-semibold mb-0.5">Último evento</span>
          <span class="font-mono text-[10px] text-gray-700 dark:text-gray-300 truncate block"
                :title="empleadosStore.ultimoEvento?.evento">
            {{ empleadosStore.ultimoEvento?.evento || 'Ninguno' }}
          </span>
        </div>
      </div>
      
      <div class="px-5 pb-4 space-y-0.5 text-[10px] text-gray-400 dark:text-gray-500">
        <div v-if="empleadosStore.ultimoEvento">
          ⏱️ Último evento: {{ formatHora(empleadosStore.ultimoEvento.timestamp) }}
        </div>
        <div v-if="empleadosStore.ultimaActualizacion">
          🔄 Última actualización: {{ formatHora(empleadosStore.ultimaActualizacion) }}
        </div>
        <div>
          🎧 Listeners: {{ empleadosStore.listenersRegistrados ? 'Registrados' : 'No registrados' }}
        </div>
        <div>
          ⏰ Ticks locales: {{ tickTiempo }}
        </div>
      </div>
    </details>
  </div>
</template>

<script setup>
import { useEmpleadosStore } from '~/stores/empleados';

console.log('👥 [EstadoEmpleados] Componente cargado');

const empleadosStore = useEmpleadosStore();
const socketConectado = ref(false);
const tickTiempo = ref(0);

let fallbackInterval = null;
let intervaloTiempo = null;
let socketListenerConnect = null;
let socketListenerDisconnect = null;
let visibilityHandler = null;

// ============================================================
// CÁLCULO LOCAL DEL TIEMPO
// ============================================================

const transcurridoLocal = (tarea) => {
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

const tiempoRestanteLocal = (tarea) => {
  if (!tarea) return 0;
  const estimado = tarea.tiempoEstimado || 0;
  const transcurrido = transcurridoLocal(tarea);
  return Math.max(0, estimado - transcurrido);
};

const progresoLocal = (tarea) => {
  if (!tarea) return 0;
  if (!tarea.tiempoEstimado || tarea.tiempoEstimado <= 0) {
    return tarea.porcentajeCompletado || 0;
  }
  const transcurrido = transcurridoLocal(tarea);
  let progreso = Math.min(100, Math.floor((transcurrido / tarea.tiempoEstimado) * 100));
  progreso = Math.max(progreso, tarea.porcentajeCompletado || 0);
  return Math.min(100, progreso);
};

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

const formatTiempoRestante = (minutos) => {
  if (!minutos && minutos !== 0) return 'Calculando...';
  if (minutos <= 0) return 'Tiempo cumplido';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h ${mins}min`;
};

const formatHora = (fecha) => {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const refrescar = async () => {
  console.log('🔄 [EstadoEmpleados] Refrescar manual');
  await empleadosStore.cargarEstadoTecnicos('manual-component');
};

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  console.log('✅ [EstadoEmpleados] onMounted');
  
  await empleadosStore.cargarEstadoTecnicos('mount');
  empleadosStore.registrarListenersSocket();
  
  const nuxtApp = useNuxtApp();
  const socket = nuxtApp.$socket;
  
  if (socket) {
    socketConectado.value = socket.connected;
    
    socketListenerConnect = () => {
      console.log('🔌 [EstadoEmpleados] Socket reconectado');
      socketConectado.value = true;
      empleadosStore.registrarListenersSocket();
      empleadosStore.cargarEstadoTecnicos('socket-reconnect');
    };
    
    socketListenerDisconnect = () => {
      console.log('🔌 [EstadoEmpleados] Socket desconectado');
      socketConectado.value = false;
    };
    
    socket.on('connect', socketListenerConnect);
    socket.on('disconnect', socketListenerDisconnect);
  } else {
    console.warn('⚠️ [EstadoEmpleados] Socket no disponible en onMounted');
  }
  
  fallbackInterval = setInterval(() => {
    if (!socketConectado.value) {
      console.log('🔄 [EstadoEmpleados] Fallback polling (socket desconectado)');
      empleadosStore.cargarEstadoTecnicos('fallback-polling');
    }
  }, 60000);
  
  // Tick local cada 1s para actualizar los cronómetros
  intervaloTiempo = setInterval(() => {
    tickTiempo.value++;
  }, 1000);
  
  visibilityHandler = () => {
    if (!document.hidden) {
      console.log('👁️ [EstadoEmpleados] Pestaña visible, recargando...');
      empleadosStore.cargarEstadoTecnicos('visibility-restored');
      tickTiempo.value++;
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);
});

onUnmounted(() => {
  console.log('🛑 [EstadoEmpleados] onUnmounted');
  
  if (fallbackInterval) {
    clearInterval(fallbackInterval);
    fallbackInterval = null;
  }
  
  if (intervaloTiempo) {
    clearInterval(intervaloTiempo);
    intervaloTiempo = null;
  }
  
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }
  
  const nuxtApp = useNuxtApp();
  const socket = nuxtApp.$socket;
  if (socket && socketListenerConnect) {
    socket.off('connect', socketListenerConnect);
    socket.off('disconnect', socketListenerDisconnect);
  }
});

defineExpose({
  refrescar
});
</script>

<style scoped>
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