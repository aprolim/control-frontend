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
            <NuxtLink 
              to="/empleados" 
              class="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              👥 Usuarios
            </NuxtLink>
            
            <ThemeToggle />
            
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                <span class="text-xs font-medium text-blue-700 dark:text-blue-300">{{ authStore.user?.nombre?.charAt(0) || '?' }}</span>
              </div>
              <div class="hidden sm:block">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ authStore.user?.nombre || 'Usuario' }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 ml-2">Supervisor</span>
              </div>
              <span class="sm:hidden text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Supervisor</span>
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
      <!-- Tabs -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="activeTab === tab.key ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'"
          class="px-3 py-1.5 rounded-md transition flex items-center gap-1.5 text-sm"
        >
          <span class="text-base">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
        
        <button
          @click="abrirModalSolicitud"
          class="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-1.5 ml-auto text-sm shadow-sm"
        >
          <span class="text-base">+</span>
          <span>Nueva Solicitud</span>
        </button>
      </div>
      
      <!-- Estado de Técnicos -->
      <div class="mb-6">
        <EstadoEmpleados />
      </div>
      
      <!-- Contenido según tab activo -->
      <div v-if="activeTab === 'kanban'">
        <KanbanBoardProfesional ref="kanbanBoardRef" />
      </div>
      
      <div v-if="activeTab === 'dashboard'">
        <DashboardEstadisticas />
      </div>
      
      <div v-if="activeTab === 'reportes'">
        <ReportesAvanzados />
      </div>
      
      <div v-if="activeTab === 'notificaciones'">
        <ConfiguracionNotificaciones />
      </div>
      

    </div>
    
    <!-- Modales -->
    <SolicitudModal
      v-if="modalSolicitud"
      :extra="false"
      @close="modalSolicitud = false"
      @created="recargarDatos"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useTarjetasStore } from '~/stores/tarjetas';
import { useRoles } from '~/composables/useRoles';

definePageMeta({
  middleware: 'auth'
});

console.log('========================================');
console.log('🚀 [Supervisor] Página cargada');
console.log('========================================');

const authStore = useAuthStore();
const tarjetasStore = useTarjetasStore();
const { isSupervisor } = useRoles();

if (!isSupervisor.value) {
  console.warn('⚠️ [Supervisor] Usuario no es supervisor, redirigiendo...');
  navigateTo('/');
}

console.log('✅ [Supervisor] Usuario verificado como supervisor');

const tabs = ref([
  { key: 'kanban', label: 'Kanban', icon: '📌' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'reportes', label: 'Reportes', icon: '📈' },
  { key: 'notificaciones', label: 'Notificaciones', icon: '🔔' },
]);

const activeTab = ref('kanban');
const modalSolicitud = ref(false);
const kanbanBoardRef = ref(null);

const socket = ref(null);
let pollingInterval = null;

// ============================================================
// CONFIGURAR SOCKETS
// ============================================================

const configurarSockets = () => {
  console.log('🔌 [Supervisor] Configurando sockets...');
  
  const nuxtApp = useNuxtApp();
  socket.value = nuxtApp.$socket;
  
  if (!socket.value) {
    console.warn('⚠️ [Supervisor] Socket no disponible, usando polling como fallback');
    iniciarPollingFallback();
    return;
  }
  
  console.log('✅ [Supervisor] Socket disponible');
  console.log('🔌 [Supervisor] Socket ID:', socket.value.id);
  
  socket.value.on('nueva-tarea-disponible', (data) => {
    console.log('📢 [Supervisor] Nueva tarea disponible:', data.tarea?.titulo);
    recargarDatos();
  });
  
  socket.value.on('tarea-tomada', (data) => {
    console.log('📢 [Supervisor] Tarea tomada por:', data.empleado?.nombre);
    recargarDatos();
  });
  
  socket.value.on('kanban-actualizar', (data) => {
    console.log('📋 [Supervisor] Kanban actualizar:', data.mensaje);
    recargarDatos();
  });
  
  socket.value.on('estado-actualizado', () => recargarDatos());
  socket.value.on('estado-general-actualizado', () => recargarDatos());
  socket.value.on('tarea-iniciada-tiempo-real', () => recargarDatos());
  socket.value.on('tarea-pausada-tiempo-real', () => recargarDatos());
  socket.value.on('tarea-reanudada-tiempo-real', () => recargarDatos());
  socket.value.on('progreso-actualizado', () => recargarDatos());
  socket.value.on('tarea-completada-automaticamente', () => recargarDatos());
  socket.value.on('tarea-calificada', () => recargarDatos());
  socket.value.on('tarea-auto-finalizada', () => recargarDatos());
  socket.value.on('tarea-finalizada-por-ti', () => recargarDatos());
  socket.value.on('tarea-reasignada', () => recargarDatos());
  socket.value.on('nueva-tarea-asignada', () => recargarDatos());
  socket.value.on('rol-actualizado', (data) => {
    console.log('🔄 [Supervisor] Rol actualizado:', data);
    recargarDatos();
  });
  
  console.log('✅ [Supervisor] Eventos configurados');
};

const iniciarPollingFallback = () => {
  pollingInterval = setInterval(async () => {
    await recargarDatos();
  }, 20000);
};

// ============================================================
// ACCIONES
// ============================================================

const recargarDatos = async () => {
  try {
    await tarjetasStore.fetchTarjetas();
    await tarjetasStore.fetchEstadisticas();
    
    if (kanbanBoardRef.value) {
      kanbanBoardRef.value.organizarTareas();
    }
  } catch (error) {
    console.error('❌ [Supervisor] Error:', error);
  }
};

const logout = () => {
  authStore.logout();
};

const abrirModalSolicitud = () => {
  modalSolicitud.value = true;
};

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  console.log('🔄 [Supervisor] onMounted');
  
  authStore.loadFromStorage();
  await recargarDatos();
  configurarSockets();
  
  setTimeout(() => {
    const nuxtApp = useNuxtApp();
    const socket = nuxtApp.$socket;
    if (socket && authStore.user?._id) {
      console.log('🔄 [Supervisor] Forzando join al socket...');
      socket.emit('join', authStore.user._id);
    }
  }, 1000);
  
  setTimeout(() => {
    const nuxtApp = useNuxtApp();
    const socket = nuxtApp.$socket;
    if (socket && socket.connected && authStore.user?._id) {
      socket.emit('join', authStore.user._id);
    }
  }, 3000);
  
  // Polling de respaldo
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    await recargarDatos();
  }, 20000);
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  if (socket.value) {
    socket.value.off('nueva-tarea-disponible');
    socket.value.off('tarea-tomada');
    socket.value.off('kanban-actualizar');
    socket.value.off('estado-actualizado');
    socket.value.off('estado-general-actualizado');
    socket.value.off('tarea-iniciada-tiempo-real');
    socket.value.off('tarea-pausada-tiempo-real');
    socket.value.off('tarea-reanudada-tiempo-real');
    socket.value.off('progreso-actualizado');
    socket.value.off('tarea-completada-automaticamente');
    socket.value.off('tarea-calificada');
    socket.value.off('tarea-auto-finalizada');
    socket.value.off('tarea-finalizada-por-ti');
    socket.value.off('tarea-reasignada');
    socket.value.off('nueva-tarea-asignada');
    socket.value.off('rol-actualizado');
  }
});
</script>