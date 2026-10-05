<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <!-- NAVBAR -->
    <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <span class="text-white text-sm font-bold">CP</span>
            </div>
            <div>
              <h1 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Control de Personal</h1>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Panel de Usuario</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <ThemeToggle />
            <div class="flex items-center gap-2 pl-3 ml-1 border-l border-gray-200 dark:border-gray-800">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span class="text-xs font-semibold text-white">{{ authStore.user?.nombre?.charAt(0) || '?' }}</span>
              </div>
              <div class="hidden sm:block">
                <p class="text-xs font-medium text-gray-900 dark:text-white leading-tight">{{ authStore.user?.nombre || 'Usuario' }}</p>
                <p class="text-[10px] text-green-600 dark:text-green-400 leading-tight font-medium">Usuario</p>
              </div>
            </div>
            <button @click="logout" class="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Barra de acciones -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">Mis solicitudes</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ misSolicitudes.length }} {{ misSolicitudes.length === 1 ? 'solicitud' : 'solicitudes' }}
            <span v-if="tareasParaCalificar.length > 0" class="text-amber-600 dark:text-amber-400 font-medium ml-2">
              · {{ tareasParaCalificar.length }} por calificar
            </span>
          </p>
        </div>
        
        <button @click="abrirModalSolicitud" class="inline-flex items-center gap-2 px-3.5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva solicitud
        </button>
      </div>
      
      <section class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <header class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Seguimiento</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Estado en tiempo real</p>
            </div>
          </div>
        </header>
        
        <div class="p-5">
          <div v-if="cargando && misSolicitudes.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="i in 4" :key="i" class="animate-pulse border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            </div>
          </div>
          
          <div v-else-if="misSolicitudes.length === 0" class="text-center py-12">
            <div class="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <svg class="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">No tienes solicitudes aún</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Crea una nueva solicitud para comenzar</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <article 
              v-for="tarea in misSolicitudes" 
              :key="tarea._id"
              class="border rounded-xl overflow-hidden transition-all duration-300 bg-white dark:bg-gray-900"
              :class="[
                tarea.estado === 'revision_cliente' && !tarea.calificacion 
                  ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-100 dark:ring-amber-900/30' 
                  : tarea.estado === 'en_progreso' && tarea.estadoProgreso === 'activa'
                    ? 'border-emerald-400 dark:border-emerald-600'
                    : tarea.estado === 'en_progreso' && tarea.estadoProgreso === 'pausada'
                      ? 'border-amber-300 dark:border-amber-700'
                      : tarea.asignadoA
                        ? 'border-blue-300 dark:border-blue-700'
                        : 'border-gray-200 dark:border-gray-800'
              ]"
            >
              <div class="p-4 border-b border-gray-100 dark:border-gray-800">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">{{ tarea.titulo }}</h3>
                  <span :class="prioridadColorClass(tarea.prioridad)" class="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                    {{ prioridadTextoLabel(tarea.prioridad) }}
                  </span>
                </div>
                
                <div class="flex items-center gap-2 flex-wrap">
                  <span :class="estadoBadgeClass(tarea)" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                    <span class="w-1.5 h-1.5 rounded-full" :class="estadoDotClass(tarea)"></span>
                    {{ estadoTextoLabel(tarea) }}
                  </span>
                  
                  <span v-if="tarea.asignadoA && !tarea.calificacion" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-medium">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="truncate max-w-[100px]">{{ tarea.asignadoA.nombre }}</span>
                  </span>
                </div>
              </div>
              
              <div v-if="tarea.asignadoA" class="px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 border-b border-gray-100 dark:border-gray-800">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span class="text-[10px] font-semibold text-white">{{ tarea.asignadoA.nombre?.charAt(0) || '?' }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wide font-semibold">Técnico asignado</p>
                    <p class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ tarea.asignadoA.nombre }}</p>
                  </div>
                  <span v-if="tarea.estadoProgreso === 'activa'" class="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Trabajando
                  </span>
                  <span v-else-if="tarea.estado === 'en_progreso' && tarea.estadoProgreso === 'pausada'" class="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                    ⏸️ Pausada
                  </span>
                </div>
              </div>
              
              <div v-else class="px-4 py-3 bg-gray-50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Técnico asignado</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Esperando asignación...</p>
                  </div>
                </div>
              </div>
              
              <div v-if="tarea.estado === 'en_progreso'" class="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progreso</span>
                  <span class="text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums">{{ tarea.porcentajeCompletado || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-blue-500 rounded-full h-1.5 transition-all duration-500" :style="{ width: `${tarea.porcentajeCompletado || 0}%` }"></div>
                </div>
              </div>
              
              <div class="px-4 py-3">
                <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{{ tarea.descripcion || 'Sin descripción' }}</p>
              </div>
              
              <div v-if="tarea.calificacion?.puntaje" class="px-4 py-3 bg-amber-50/50 dark:bg-amber-900/10 border-t border-gray-100 dark:border-gray-800">
                <div class="flex items-center gap-2">
                  <div class="flex">
                    <svg v-for="star in 5" :key="star" 
                         class="w-3.5 h-3.5" 
                         :class="star <= tarea.calificacion.puntaje ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'" 
                         fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ tarea.calificacion.puntaje }}/5</span>
                </div>
                <p v-if="tarea.calificacion.comentario" class="text-[11px] text-gray-500 dark:text-gray-400 italic mt-1 line-clamp-2">
                  "{{ tarea.calificacion.comentario }}"
                </p>
              </div>
              
              <div v-if="tarea.estado === 'revision_cliente' && !tarea.calificacion && !tarea.calificacion?.autoFinalizada" class="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <button @click="abrirModalCalificar(tarea)" class="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-amber-700 transition shadow-sm">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Calificar servicio
                </button>
              </div>
              
              <div v-if="tarea.calificacion?.autoFinalizada" class="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-[10px] text-orange-700 dark:text-orange-400 font-medium">Auto-finalizada por falta de revisión</span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
    
    <SolicitudModal v-if="modalSolicitud" :extra="false" @close="modalSolicitud = false" @created="handleSolicitudCreada" />
    <CalificarModal v-if="tareaParaCalificar" :tarjeta="tareaParaCalificar" @close="tareaParaCalificar = null" @calificado="handleCalificado" />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useTarjetasStore } from '~/stores/tarjetas';
import { useRoles } from '~/composables/useRoles';
import { useNotificaciones } from '~/composables/useNotificaciones';
import CalificarModal from '~/components/CalificarModal.vue';

definePageMeta({ middleware: 'auth' });

const authStore = useAuthStore();
const tarjetasStore = useTarjetasStore();
const { isUsuario } = useRoles();

if (!isUsuario.value) {
  navigateTo('/');
}

const config = useRuntimeConfig();

const modalSolicitud = ref(false);
const tareaParaCalificar = ref(null);
const cargando = ref(false);

const socket = ref(null);
let pollingInterval = null;

// 🔔 NOTIFICACIONES con sonidos
const {
  notificacionesActivas,
  cerrarNotificacion,
  inicializar: inicializarNotificaciones,
  destruir: destruirNotificaciones,
  mostrarNotificacionVisual,
  reproducirSonido,
  notificarTecnicoTomoTarea,
  notificarTecnicoInicio,
  notificarTecnicoPauso,
  notificarTecnicoReanudo,
  notificarTareaFinalizada
} = useNotificaciones();

// ============================================================
// COMPUTED
// ============================================================

const misSolicitudes = computed(() => {
  return tarjetasStore.tarjetas.filter(t => 
    t.clienteInfo?.userId === authStore.user?._id
  );
});

const tareasParaCalificar = computed(() => {
  return misSolicitudes.value.filter(t => 
    t.estado === 'revision_cliente' && 
    !t.calificacion?.puntaje && 
    !t.calificacion?.autoFinalizada
  );
});

// ============================================================
// HELPERS DE ESTADO (CORREGIDOS)
// ============================================================

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
  const map = { baja: 'Baja', media: 'Media', alta: 'Alta', urgente: 'Urgente' };
  return map[prioridad] || 'Media';
};

const estadoTextoLabel = (tarea) => {
  const estado = tarea.estado;
  const progreso = tarea.estadoProgreso;
  
  if (estado === 'pendiente') return 'Pendiente';
  
  if (estado === 'en_progreso') {
    if (!tarea.asignadoA) return 'Pendiente';
    if (progreso === 'activa') return 'En progreso';
    return 'Pausada';  // 🔥 CORREGIDO
  }
  
  if (estado === 'revision_cliente') return 'Lista para calificar';
  if (estado === 'finalizada') return 'Finalizada';
  return estado;
};

const estadoBadgeClass = (tarea) => {
  const estado = tarea.estado;
  const progreso = tarea.estadoProgreso;
  
  if (estado === 'pendiente') {
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  }
  
  if (estado === 'en_progreso') {
    if (progreso === 'activa') {
      return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
    }
    // 🔥 Pausada con color ámbar
    return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
  }
  
  if (estado === 'revision_cliente') {
    return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
  }
  if (estado === 'finalizada') {
    return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
  }
  return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
};

const estadoDotClass = (tarea) => {
  const estado = tarea.estado;
  const progreso = tarea.estadoProgreso;
  
  if (estado === 'pendiente') return 'bg-gray-400';
  
  if (estado === 'en_progreso') {
    if (progreso === 'activa') return 'bg-emerald-500 animate-pulse';
    return 'bg-amber-500';  // 🔥 Pausada = ámbar estático
  }
  
  if (estado === 'revision_cliente') return 'bg-amber-500 animate-pulse';
  if (estado === 'finalizada') return 'bg-emerald-500';
  return 'bg-gray-400';
};

// ============================================================
// SOCKETS
// ============================================================

const configurarSockets = () => {
  const nuxtApp = useNuxtApp();
  socket.value = nuxtApp.$socket;
  
  if (!socket.value) {
    console.warn('⚠️ [Usuario] Socket no disponible');
    iniciarPollingFallback();
    return;
  }
  
  console.log('✅ [Usuario] Socket disponible');
  
  // 🔥 Tarea tomada por técnico
  socket.value.on('tarea-tomada', (data) => {
    console.log('📢 [Usuario][SOCKET] Tarea tomada:', data.tarea?.titulo);
    const esMia = data.tarea?.clienteInfo?.userId === authStore.user?._id ||
                  misSolicitudes.value.some(t => t._id === data.tarea?._id);
    if (esMia) {
      notificarTecnicoTomoTarea(data);  // 🔥 Sonido + Toast + Notif navegador
      recargarDatos();
    }
  });
  
  // 🔥 Nueva tarea asignada específicamente
  socket.value.on('nueva-tarea-asignada', (data) => {
    const esMia = data.tarea?.clienteInfo?.userId === authStore.user?._id ||
                  misSolicitudes.value.some(t => t._id === data.tarea?._id);
    if (esMia) {
      notificarTecnicoTomoTarea(data);
      recargarDatos();
    }
  });
  
  // 🔥 Tarea iniciada
  socket.value.on('tarea-iniciada-tiempo-real', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tarea?.id);
    if (esMia) {
      notificarTecnicoInicio(data);
      recargarDatos();
    }
  });
  
  // 🔥 Tarea pausada
  socket.value.on('tarea-pausada-tiempo-real', (data) => {
    console.log('📢 [Usuario][SOCKET] Tarea pausada');
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      notificarTecnicoPauso(data);
      recargarDatos();
    }
  });
  
  // 🔥 Tarea reanudada
  socket.value.on('tarea-reanudada-tiempo-real', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      notificarTecnicoReanudo(data);
      recargarDatos();
    }
  });
  
  // 🔥 Tarea reasignada
  socket.value.on('tarea-reasignada', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      reproducirSonido('pendienteSuave');
      mostrarNotificacionVisual({
        tipo: 'warning',
        titulo: '🔄 Tarea reasignada',
        mensaje: data.mensaje || 'Tu tarea fue reasignada',
        duracion: 6000
      });
      recargarDatos();
    }
  });
  
  // 🔥 Lista para calificar
  socket.value.on('tarea-lista-para-calificar', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      notificarTareaFinalizada(data);
      recargarDatos();
    }
  });
  
  // 🔥 Finalizada
  socket.value.on('tarea-finalizada-por-ti', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      notificarTareaFinalizada(data);
      recargarDatos();
    }
  });
  
  // 🔥 Auto-finalizada
  socket.value.on('tarea-auto-finalizada', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      reproducirSonido('tareaAsignada');
      mostrarNotificacionVisual({
        tipo: 'info',
        titulo: '🤖 Auto-finalizada',
        mensaje: `Tu tarea "${data.titulo}" fue finalizada automáticamente`,
        duracion: 8000
      });
      recargarDatos();
    }
  });
  
  // Progreso
  socket.value.on('estado-actualizado', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) recargarDatos();
  });
  
  socket.value.on('estado-general-actualizado', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) recargarDatos();
  });
  
  // Tarea por expirar
  socket.value.on('tarea-por-expirar', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      reproducirSonido('pendienteSuave');
      mostrarNotificacionVisual({
        tipo: 'warning',
        titulo: '⚠️ Tarea por vencer',
        mensaje: data.mensaje || 'Tu tarea está por expirar',
        duracion: 8000
      });
    }
  });
  
  // Rol actualizado
  socket.value.on('rol-actualizado', (data) => {
    if (data.userId === authStore.user?._id) {
      authStore.user.rol = data.nuevoRol;
      localStorage.setItem('user', JSON.stringify(authStore.user));
      alert(`✅ Tu rol ha sido actualizado a: ${data.nuevoRol}`);
      setTimeout(() => window.location.reload(), 1500);
    }
  });
  
  socket.value.on('notificaciones-actualizadas', () => {
    console.log('🔔 [Usuario] Config de notificaciones actualizada');
  });
  
  console.log('✅ [Usuario] Eventos configurados');
};

const iniciarPollingFallback = () => {
  pollingInterval = setInterval(async () => {
    await recargarDatos();
  }, 15000);
};

// ============================================================
// ACCIONES
// ============================================================

const recargarDatos = async () => {
  cargando.value = true;
  try {
    await tarjetasStore.fetchTarjetas();
  } catch (error) {
    console.error('❌ [Usuario] Error:', error);
  } finally {
    cargando.value = false;
  }
};

const logout = () => authStore.logout();
const abrirModalSolicitud = () => modalSolicitud.value = true;
const abrirModalCalificar = (tarea) => tareaParaCalificar.value = tarea;

const handleSolicitudCreada = () => {
  modalSolicitud.value = false;
  reproducirSonido('tareaAsignada');
  mostrarNotificacionVisual({
    tipo: 'success',
    titulo: '✅ Solicitud enviada',
    mensaje: 'Tu solicitud ha sido registrada',
    duracion: 5000
  });
  recargarDatos();
};

const handleCalificado = async () => {
  tareaParaCalificar.value = null;
  await recargarDatos();
  reproducirSonido('tareaAsignada');
  mostrarNotificacionVisual({
    tipo: 'success',
    titulo: '⭐ ¡Gracias!',
    mensaje: 'Tu calificación ha sido registrada',
    duracion: 5000
  });
};

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  console.log('🔄 [Usuario] onMounted');
  
  authStore.loadFromStorage();
  await recargarDatos();
  configurarSockets();
  await inicializarNotificaciones();
  
  // 🔥 Desbloquear audio en primera interacción (crítico para que suene)
  if (process.client) {
    const desbloquear = () => {
      console.log('🔊 [Usuario] Desbloqueando audio...');
      // Reproducir un sonido silencioso para desbloquear el contexto de audio
      try {
        const a = new Audio('/sounds/tarea-asignada.mp3');
        a.volume = 0;
        a.play().catch(() => {});
      } catch (e) {}
      
      document.removeEventListener('click', desbloquear);
      document.removeEventListener('keydown', desbloquear);
      document.removeEventListener('touchstart', desbloquear);
    };
    document.addEventListener('click', desbloquear, { once: true });
    document.addEventListener('keydown', desbloquear, { once: true });
    document.addEventListener('touchstart', desbloquear, { once: true });
  }
  
  setTimeout(() => {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.$socket && authStore.user?._id) {
      nuxtApp.$socket.emit('join', authStore.user._id);
    }
  }, 1000);
  
  pollingInterval = setInterval(recargarDatos, 20000);
  
  // Si ya hay tareas para calificar al cargar, avisar
  if (tareasParaCalificar.value.length > 0) {
    setTimeout(() => {
      mostrarNotificacionVisual({
        tipo: 'info',
        titulo: '⭐ Tareas por calificar',
        mensaje: `Tienes ${tareasParaCalificar.value.length} tarea(s) lista(s)`,
        duracion: 8000
      });
    }, 2000);
  }
  
  console.log('✅ [Usuario] Inicialización completada');
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
  destruirNotificaciones();
  
  if (socket.value) {
    socket.value.off('tarea-tomada');
    socket.value.off('nueva-tarea-asignada');
    socket.value.off('tarea-iniciada-tiempo-real');
    socket.value.off('tarea-pausada-tiempo-real');
    socket.value.off('tarea-reanudada-tiempo-real');
    socket.value.off('tarea-reasignada');
    socket.value.off('tarea-lista-para-calificar');
    socket.value.off('tarea-finalizada-por-ti');
    socket.value.off('tarea-auto-finalizada');
    socket.value.off('estado-actualizado');
    socket.value.off('estado-general-actualizado');
    socket.value.off('tarea-por-expirar');
    socket.value.off('rol-actualizado');
    socket.value.off('notificaciones-actualizadas');
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>