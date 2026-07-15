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
                <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 ml-2">Usuario</span>
              </div>
              <span class="sm:hidden text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Usuario</span>
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
      <!-- Botones -->
      <div class="mb-4 flex justify-between items-center">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          📊 <span class="font-medium">{{ misSolicitudes.length }}</span> solicitudes
          <span v-if="tareasParaCalificar.length > 0" class="ml-3 text-yellow-600 dark:text-yellow-400 font-medium">
            ⭐ {{ tareasParaCalificar.length }} lista(s) para calificar
          </span>
        </div>
        <button
          @click="abrirModalSolicitud"
          class="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-1.5 text-sm shadow-sm"
        >
          <span class="text-base">+</span>
          <span>Nueva Solicitud</span>
        </button>
      </div>
      
      <!-- Mis Solicitudes -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white">📋 Mis Solicitudes</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Seguimiento de tus solicitudes en tiempo real</p>
        </div>
        
        <div class="p-5">
          <div v-if="misSolicitudes.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl">📭</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400">No tienes solicitudes. Crea una nueva solicitud.</p>
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="tarea in misSolicitudes" :key="tarea._id" 
                 class="border rounded-xl p-5 transition-all duration-300"
                 :class="[
                   tarea.estado === 'revision_cliente' && !tarea.calificacion 
                     ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 shadow-md' 
                     : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                 ]">
              <!-- Header con estado -->
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <h3 class="font-bold text-gray-800 dark:text-white text-lg">{{ tarea.titulo }}</h3>
                  <!-- Indicador de "Lista para calificar" -->
                  <span v-if="tarea.estado === 'revision_cliente' && !tarea.calificacion" 
                        class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white animate-pulse flex items-center gap-1">
                    <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    ⭐ ¡Califícame!
                  </span>
                </div>
                <span :class="estadoColorClass(tarea.estado)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ estadoTextoLabel(tarea.estado) }}
                </span>
              </div>
              
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{{ tarea.descripcion || 'Sin descripción' }}</p>
              
              <!-- Información de la tarea -->
              <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
                  <span class="text-gray-500 dark:text-gray-400">👨‍💼 Técnico asignado:</span>
                  <span class="font-medium ml-2 text-gray-800 dark:text-white">{{ tarea.asignadoA?.nombre || 'Sin asignar' }}</span>
                </div>
                <div v-if="tarea.porcentajeCompletado > 0" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
                  <span class="text-gray-500 dark:text-gray-400">📊 Progreso:</span>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div class="bg-blue-500 rounded-full h-2 transition-all duration-500" :style="{ width: `${tarea.porcentajeCompletado}%` }"></div>
                  </div>
                  <span class="text-xs font-medium text-blue-600">{{ tarea.porcentajeCompletado }}%</span>
                </div>
              </div>
              
              <!-- Mostrar el nombre completo del usuario que solicitó -->
              <div class="mt-2 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <span>👤 Solicitado por:</span>
                <span class="font-medium text-gray-600 dark:text-gray-400">{{ tarea.clienteInfo?.nombre || 'Anónimo' }}</span>
              </div>
              
              <!-- Notificación de días restantes -->
              <div v-if="tarea.estado === 'revision_cliente' && !tarea.calificacion && !tarea.calificacion?.autoFinalizada" 
                   class="mb-4 p-3 rounded-lg" 
                   :class="diasRestantes(tarea) <= 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'">
                <div class="flex items-center gap-2">
                  <span class="text-lg">⚠️</span>
                  <span class="text-sm">
                    {{ diasRestantes(tarea) <= 0 ? '¡Tarea por vencer! Revísala pronto.' : `Tienes ${diasRestantes(tarea)} días para revisar esta tarea` }}
                  </span>
                </div>
              </div>
              
              <!-- Botón Calificar (destacado) -->
              <button 
                v-if="tarea.estado === 'revision_cliente' && !tarea.calificacion && !tarea.calificacion?.autoFinalizada"
                @click="abrirModalCalificar(tarea)"
                class="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span class="text-lg">⭐</span>
                Calificar servicio
                <span class="text-xs bg-yellow-700/30 px-2 py-0.5 rounded-full">¡Ahora!</span>
              </button>
              
              <!-- Calificación ya realizada -->
              <div v-if="tarea.calificacion?.puntaje" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Tu calificación:</span>
                  <span class="text-yellow-500 text-lg">{{ '★'.repeat(tarea.calificacion.puntaje) }}{{ '☆'.repeat(5 - tarea.calificacion.puntaje) }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">({{ tarea.calificacion.puntaje }}/5)</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{{ tarea.calificacion.comentario }}</p>
              </div>
              
              <!-- Auto-finalizada -->
              <div v-if="tarea.calificacion?.autoFinalizada" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <span class="text-lg">🤖</span>
                  <span class="text-sm">Esta tarea fue auto-finalizada por falta de revisión</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modales -->
    <SolicitudModal
      v-if="modalSolicitud"
      :extra="false"
      @close="modalSolicitud = false"
      @created="recargarDatos"
    />
    
    <CalificarModal
      v-if="tareaParaCalificar"
      :tarjeta="tareaParaCalificar"
      @close="tareaParaCalificar = null"
      @calificado="handleCalificado"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useTarjetasStore } from '~/stores/tarjetas';
import { useRoles } from '~/composables/useRoles';
import CalificarModal from '~/components/CalificarModal.vue';

definePageMeta({
  middleware: 'auth'
});

const authStore = useAuthStore();
const tarjetasStore = useTarjetasStore();
const { isUsuario } = useRoles();

// Verificar que sea usuario
if (!isUsuario.value) {
  navigateTo('/');
}

const modalSolicitud = ref(false);
const tareaParaCalificar = ref(null);

// Variables para Sockets
const socket = ref(null);
let pollingInterval = null;
let intervaloTiempoReal = null;
const forceUpdate = ref(0);

// ============================================================
// COMPUTED
// ============================================================

const misSolicitudes = computed(() => {
  return tarjetasStore.tarjetas;
});

// Tareas listas para calificar (destacadas)
const tareasParaCalificar = computed(() => {
  return tarjetasStore.tarjetas.filter(t => 
    t.estado === 'revision_cliente' && 
    !t.calificacion && 
    !t.calificacion?.autoFinalizada
  );
});

// ============================================================
// CONFIGURAR SOCKETS
// ============================================================

const configurarSockets = () => {
  const nuxtApp = useNuxtApp();
  socket.value = nuxtApp.$socket;
  
  if (!socket.value) {
    console.warn('⚠️ [Usuario] Socket no disponible, usando polling como fallback');
    iniciarPollingFallback();
    return;
  }
  
  console.log('✅ [Usuario] Socket disponible para actualizaciones en tiempo real');
  
  // EVENTO CRÍTICO: Tarea lista para calificar
  socket.value.on('tarea-lista-para-calificar', (data) => {
    console.log('⭐ [Usuario][SOCKET] ¡Tarea lista para calificar!', data);
    recargarDatos();
    
    // Mostrar notificación de escritorio
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⭐ ¡Tarea lista para calificar!', {
        body: `"${data.titulo}" está lista para tu calificación`,
        icon: '/favicon.ico'
      });
    }
    
    // Reproducir sonido de notificación (opcional)
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (e) {}
  });
  
  // Evento: Estado actualizado
  socket.value.on('estado-actualizado', (data) => {
    console.log('📊 [Usuario][SOCKET] Estado actualizado:', data);
    const tarea = tarjetasStore.tarjetas.find(t => t._id === data.tareaId);
    if (tarea && tarea.clienteInfo?.userId === authStore.user?._id) {
      recargarDatos();
    }
  });
  
  // Evento: Estado general actualizado
  socket.value.on('estado-general-actualizado', (data) => {
    console.log('🔄 [Usuario][SOCKET] Estado general actualizado:', data);
    const tarea = tarjetasStore.tarjetas.find(t => t._id === data.tareaId);
    if (tarea && tarea.clienteInfo?.userId === authStore.user?._id) {
      recargarDatos();
    }
  });
  
  // Evento: Tarea calificada
  socket.value.on('tarea-calificada', (data) => {
    console.log('⭐ [Usuario][SOCKET] Tarea calificada:', data);
    recargarDatos();
  });
  
  // Evento: Tarea finalizada sin cliente
  socket.value.on('tarea-finalizada-sin-cliente', (data) => {
    console.log('✅ [Usuario][SOCKET] Tarea finalizada:', data);
    recargarDatos();
  });
  
  // Evento: Tarea por expirar
  socket.value.on('tarea-por-expirar', (data) => {
    console.log('⚠️ [Usuario][SOCKET] Tarea por expirar:', data);
    recargarDatos();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⚠️ Tarea por expirar', {
        body: data.mensaje,
        icon: '/favicon.ico'
      });
    }
  });
  
  // Evento: Tarea auto-finalizada
  socket.value.on('tarea-auto-finalizada', (data) => {
    console.log('🤖 [Usuario][SOCKET] Tarea auto-finalizada:', data);
    recargarDatos();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🤖 Tarea auto-finalizada', {
        body: `"${data.titulo}" - ${data.mensaje}`,
        icon: '/favicon.ico'
      });
    }
  });
  
  // Evento: Nueva tarea disponible
  socket.value.on('nueva-tarea-disponible', (data) => {
    console.log('📢 [Usuario][SOCKET] Nueva tarea disponible:', data);
    recargarDatos();
  });
  
  // Evento: Tarea asignada
  socket.value.on('tarea-asignada', (data) => {
    console.log('📢 [Usuario][SOCKET] Tarea asignada:', data);
    recargarDatos();
  });
  
  // Evento: Progreso actualizado
  socket.value.on('progreso-actualizado', (data) => {
    console.log('📈 [Usuario][SOCKET] Progreso actualizado:', data);
    recargarDatos();
  });
  
  // Evento: Rol actualizado
  socket.value.on('rol-actualizado', (data) => {
    console.log('🔄 [Usuario][SOCKET] Rol actualizado:', data);
    console.log(`   👤 Usuario: ${data.userId}`);
    console.log(`   🆕 Nuevo rol: ${data.nuevoRol}`);
    
    if (data.userId === authStore.user?._id) {
      console.log(`👤 [Usuario] Tu rol ha cambiado a: ${data.nuevoRol}`);
      authStore.user.rol = data.nuevoRol;
      localStorage.setItem('user', JSON.stringify(authStore.user));
      
      alert(`✅ Tu rol ha sido actualizado a: ${data.nuevoRol}`);
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });
  
  // Intervalo para actualizar la vista (sin peticiones HTTP)
  intervaloTiempoReal = setInterval(() => {
    forceUpdate.value++;
  }, 10000);
};

// ============================================================
// FALLBACK - POLLING (si no hay sockets)
// ============================================================

const iniciarPollingFallback = () => {
  console.warn('⚠️ [Usuario] Usando polling como fallback (sin sockets)');
  pollingInterval = setInterval(async () => {
    await recargarDatos();
  }, 15000); // Cada 15 segundos para que sea más responsivo
};

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

const estadoTextoLabel = (estado) => {
  const map = {
    pendiente: '📋 Pendiente',
    en_progreso: '⚙️ En Progreso',
    revision_supervisor: '👔 En Revisión',
    revision_cliente: '⭐ Esperando Calificación',
    finalizada: '🏁 Finalizada'
  };
  return map[estado] || estado;
};

const estadoColorClass = (estado) => {
  const map = {
    pendiente: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    en_progreso: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    revision_supervisor: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    revision_cliente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    finalizada: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  };
  return map[estado] || 'bg-gray-100 text-gray-700';
};

const diasRestantes = (tarea) => {
  if (!tarea.createdAt) return 0;
  const fechaCreacion = new Date(tarea.createdAt);
  const fechaActual = new Date();
  const diasTranscurridos = Math.floor((fechaActual - fechaCreacion) / (1000 * 60 * 60 * 24));
  const diasMaximos = 5;
  return Math.max(0, diasMaximos - diasTranscurridos);
};

// ============================================================
// ACCIONES
// ============================================================

const recargarDatos = async () => {
  console.log('🔄 [Usuario] Recargando datos...');
  await tarjetasStore.fetchTarjetas();
  forceUpdate.value++;
  console.log('✅ [Usuario] Datos recargados. Tareas para calificar:', tareasParaCalificar.value.length);
};

const logout = () => {
  authStore.logout();
};

const abrirModalSolicitud = () => {
  modalSolicitud.value = true;
};

const abrirModalCalificar = (tarea) => {
  tareaParaCalificar.value = tarea;
};

const handleCalificado = async () => {
  tareaParaCalificar.value = null;
  await recargarDatos();
  alert('✅ ¡Gracias por tu calificación!');
};

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  authStore.loadFromStorage();
  await recargarDatos();
  
  // Configurar sockets después de cargar los datos iniciales
  configurarSockets();
  
  // Mostrar notificación si hay tareas para calificar al cargar
  if (tareasParaCalificar.value.length > 0) {
    console.log(`⭐ [Usuario] ${tareasParaCalificar.value.length} tarea(s) lista(s) para calificar`);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⭐ Tareas para calificar', {
        body: `Tienes ${tareasParaCalificar.value.length} tarea(s) lista(s) para calificar`,
        icon: '/favicon.ico'
      });
    }
  }
});

onUnmounted(() => {
  // Limpiar intervalos
  if (pollingInterval) clearInterval(pollingInterval);
  if (intervaloTiempoReal) clearInterval(intervaloTiempoReal);
  
  // Desconectar eventos de socket
  if (socket.value) {
    socket.value.off('tarea-lista-para-calificar');
    socket.value.off('estado-actualizado');
    socket.value.off('estado-general-actualizado');
    socket.value.off('tarea-calificada');
    socket.value.off('tarea-finalizada-sin-cliente');
    socket.value.off('tarea-por-expirar');
    socket.value.off('tarea-auto-finalizada');
    socket.value.off('nueva-tarea-disponible');
    socket.value.off('tarea-asignada');
    socket.value.off('progreso-actualizado');
    socket.value.off('rol-actualizado');
  }
});
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>