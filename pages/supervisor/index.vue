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
      
      <div v-if="activeTab === 'configuracion'">
        <ConfiguracionAutoCierre />
      </div>
      
      <div v-if="activeTab === 'solicitudes'">
        <GestionSolicitudesPredefinidas />
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

// Verificar que sea supervisor
if (!isSupervisor.value) {
  console.warn('⚠️ [Supervisor] Usuario no es supervisor, redirigiendo...');
  navigateTo('/');
}

console.log('✅ [Supervisor] Usuario verificado como supervisor');

const tabs = ref([
  { key: 'kanban', label: 'Kanban', icon: '📌' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'reportes', label: 'Reportes', icon: '📈' },
  { key: 'configuracion', label: 'Configuración', icon: '⚙️' },
  { key: 'solicitudes', label: 'Solicitudes Rápidas', icon: '⚡' }
]);

const activeTab = ref('kanban');
const modalSolicitud = ref(false);
const kanbanBoardRef = ref(null);

// Variables para Sockets
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
  
  console.log('✅ [Supervisor] Socket disponible para actualizaciones en tiempo real');
  console.log('🔌 [Supervisor] Socket ID:', socket.value.id);
  
  // EVENTO CRÍTICO: Nueva tarea disponible
  socket.value.on('nueva-tarea-disponible', (data) => {
    console.log('========================================');
    console.log('📢 [Supervisor][SOCKET] ✅ EVENTO RECIBIDO!');
    console.log('📢 [Supervisor][SOCKET] Datos completos:', JSON.stringify(data, null, 2));
    console.log('📢 [Supervisor][SOCKET] Tarea:', data.tarea?.titulo);
    console.log('========================================');
    
    recargarDatos();
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📋 Nueva tarea disponible', {
        body: `${data.tarea?.titulo || 'Nueva tarea'}`,
        icon: '/favicon.ico'
      });
    }
  });
  
  // EVENTO: Tarea tomada por un técnico
  socket.value.on('tarea-tomada', (data) => {
    console.log('========================================');
    console.log('📢 [Supervisor][SOCKET] Tarea tomada por:', data.empleado?.nombre);
    console.log('📢 [Supervisor][SOCKET] Tarea:', data.tarea?.titulo);
    console.log('========================================');
    recargarDatos();
  });
  
  // EVENTO: Tarea lista para revisión
  socket.value.on('tarea-lista-para-revision', (data) => {
    console.log('========================================');
    console.log('👔 [Supervisor][SOCKET] Tarea lista para revisión:', data);
    console.log('📢 [Supervisor][SOCKET] Tarea:', data.titulo);
    console.log('📢 [Supervisor][SOCKET] Empleado:', data.empleadoNombre);
    console.log('========================================');
    recargarDatos();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📋 Tarea lista para revisión', {
        body: `"${data.titulo}" - ${data.empleadoNombre}`,
        icon: '/favicon.ico'
      });
    }
  });
  
  // Evento: Estado actualizado (progreso)
  socket.value.on('estado-actualizado', (data) => {
    console.log('📊 [Supervisor][SOCKET] Estado actualizado:', data);
    recargarDatos();
  });
  
  // Evento: Estado general actualizado
  socket.value.on('estado-general-actualizado', (data) => {
    console.log('🔄 [Supervisor][SOCKET] Estado general actualizado:', data);
    recargarDatos();
  });
  
  // Evento: Tarea iniciada
  socket.value.on('tarea-iniciada-tiempo-real', (data) => {
    console.log('🚀 [Supervisor][SOCKET] Tarea iniciada:', data);
    recargarDatos();
  });
  
  // Evento: Tarea pausada
  socket.value.on('tarea-pausada-tiempo-real', (data) => {
    console.log('⏸️ [Supervisor][SOCKET] Tarea pausada:', data);
    recargarDatos();
  });
  
  // Evento: Tarea reanudada
  socket.value.on('tarea-reanudada-tiempo-real', (data) => {
    console.log('▶️ [Supervisor][SOCKET] Tarea reanudada:', data);
    recargarDatos();
  });
  
  // Evento: Progreso actualizado
  socket.value.on('progreso-actualizado', (data) => {
    console.log('📈 [Supervisor][SOCKET] Progreso actualizado:', data);
    recargarDatos();
  });
  
  // Evento: Tarea completada automáticamente
  socket.value.on('tarea-completada-automaticamente', (data) => {
    console.log('🎉 [Supervisor][SOCKET] Tarea completada automáticamente:', data);
    recargarDatos();
  });
  
  // Evento: Tarea lista para calificar
  socket.value.on('tarea-lista-para-calificar', (data) => {
    console.log('⭐ [Supervisor][SOCKET] Tarea lista para calificar:', data);
    recargarDatos();
  });
  
  // Evento: Tarea calificada
  socket.value.on('tarea-calificada', (data) => {
    console.log('⭐ [Supervisor][SOCKET] Tarea calificada:', data);
    recargarDatos();
  });
  
  // Evento: Tarea aprobada y enviada al cliente
  socket.value.on('tarea-aprobada-enviada-cliente', (data) => {
    console.log('✅ [Supervisor][SOCKET] Tarea aprobada y enviada al cliente:', data);
    recargarDatos();
  });
  
  // Evento: Tarea enviada a cliente
  socket.value.on('tarea-enviada-a-cliente', (data) => {
    console.log('📤 [Supervisor][SOCKET] Tarea enviada a cliente:', data);
    recargarDatos();
  });
  
  // Evento: Nueva tarea asignada
  socket.value.on('nueva-tarea-asignada', (data) => {
    console.log('📢 [Supervisor][SOCKET] Nueva tarea asignada:', data);
    recargarDatos();
  });
  
  // Evento: Rol actualizado
  socket.value.on('rol-actualizado', (data) => {
    console.log('🔄 [Supervisor][SOCKET] Rol actualizado:', data);
    recargarDatos();
  });
  
  // Evento: Tarea finalizada sin cliente
  socket.value.on('tarea-finalizada-sin-cliente', (data) => {
    console.log('✅ [Supervisor][SOCKET] Tarea finalizada sin cliente:', data);
    recargarDatos();
  });
  
  // Evento: Tarea por expirar
  socket.value.on('tarea-por-expirar', (data) => {
    console.log('⚠️ [Supervisor][SOCKET] Tarea por expirar:', data);
    recargarDatos();
  });
  
  // Evento: Tarea auto-finalizada
  socket.value.on('tarea-auto-finalizada', (data) => {
    console.log('🤖 [Supervisor][SOCKET] Tarea auto-finalizada:', data);
    recargarDatos();
  });
  
  console.log('✅ [Supervisor] Todos los eventos de socket configurados');
};

// ============================================================
// FALLBACK - POLLING (si no hay sockets)
// ============================================================

const iniciarPollingFallback = () => {
  console.warn('⚠️ [Supervisor] Usando polling como fallback (sin sockets)');
  console.log('🔄 [Supervisor] Polling cada 10 segundos');
  pollingInterval = setInterval(async () => {
    console.log('🔄 [Supervisor] Polling ejecutado');
    await recargarDatos();
  }, 10000);
};

// ============================================================
// ACCIONES
// ============================================================

const recargarDatos = async () => {
  console.log('========================================');
  console.log('🔄 [Supervisor] 🔥 recargarDatos() llamado');
  console.log('🔄 [Supervisor] Timestamp:', new Date().toISOString());
  console.log('🔄 [Supervisor] Estado actual del store:', {
    tarjetas: tarjetasStore.tarjetas.length,
    loading: tarjetasStore.loading,
    estadisticas: tarjetasStore.estadisticas ? '✅ Presentes' : '❌ Vacías'
  });
  
  try {
    console.log('📤 [Supervisor] Fetching tarjetas...');
    await tarjetasStore.fetchTarjetas();
    console.log('📤 [Supervisor] Fetching estadisticas...');
    await tarjetasStore.fetchEstadisticas();
    
    console.log('🔄 [Supervisor] Después de fetch:');
    console.log('   - Tarjetas:', tarjetasStore.tarjetas.length);
    console.log('   - Estadisticas:', tarjetasStore.estadisticas ? '✅ Presentes' : '❌ Vacías');
    
    if (kanbanBoardRef.value) {
      console.log('🔄 [Supervisor] Actualizando Kanban...');
      kanbanBoardRef.value.organizarTareas();
      console.log('✅ [Supervisor] Kanban actualizado');
    } else {
      console.warn('⚠️ [Supervisor] kanbanBoardRef no está disponible');
    }
    
    console.log('✅ [Supervisor] Datos recargados exitosamente');
  } catch (error) {
    console.error('❌ [Supervisor] Error en recargarDatos:', error);
  }
  console.log('========================================');
};

const logout = () => {
  console.log('👤 [Supervisor] Cerrando sesión...');
  authStore.logout();
};

const abrirModalSolicitud = () => {
  console.log('📝 [Supervisor] Abriendo modal de solicitud');
  modalSolicitud.value = true;
};

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  console.log('========================================');
  console.log('🔄 [Supervisor] onMounted - Iniciando...');
  console.log('========================================');
  
  // Cargar usuario del storage
  const loaded = authStore.loadFromStorage();
  console.log('🔍 [Supervisor] authStore.loadFromStorage():', loaded);
  console.log('🔍 [Supervisor] Usuario:', authStore.user);
  console.log('🔍 [Supervisor] Rol:', authStore.user?.rol);
  
  // Cargar datos iniciales
  console.log('📤 [Supervisor] Cargando datos iniciales...');
  await recargarDatos();
  
  // Configurar sockets después de cargar los datos iniciales
  console.log('🔌 [Supervisor] Configurando sockets...');
  configurarSockets();
  
  console.log('✅ [Supervisor] Inicialización completada');
  console.log('========================================');
});

onUnmounted(() => {
  console.log('🛑 [Supervisor] onUnmounted - Limpiando...');
  
  // Limpiar intervalos
  if (pollingInterval) {
    console.log('🛑 [Supervisor] Limpiando polling interval');
    clearInterval(pollingInterval);
  }
  
  // Desconectar eventos de socket
  if (socket.value) {
    console.log('🛑 [Supervisor] Desconectando eventos de socket');
    socket.value.off('nueva-tarea-disponible');
    socket.value.off('tarea-tomada');
    socket.value.off('tarea-lista-para-revision');
    socket.value.off('estado-actualizado');
    socket.value.off('estado-general-actualizado');
    socket.value.off('tarea-iniciada-tiempo-real');
    socket.value.off('tarea-pausada-tiempo-real');
    socket.value.off('tarea-reanudada-tiempo-real');
    socket.value.off('progreso-actualizado');
    socket.value.off('tarea-completada-automaticamente');
    socket.value.off('tarea-lista-para-calificar');
    socket.value.off('tarea-calificada');
    socket.value.off('tarea-aprobada-enviada-cliente');
    socket.value.off('tarea-enviada-a-cliente');
    socket.value.off('nueva-tarea-asignada');
    socket.value.off('rol-actualizado');
    socket.value.off('tarea-finalizada-sin-cliente');
    socket.value.off('tarea-por-expirar');
    socket.value.off('tarea-auto-finalizada');
    console.log('✅ [Supervisor] Eventos desconectados');
  }
  
  console.log('✅ [Supervisor] Limpieza completada');
});
</script>