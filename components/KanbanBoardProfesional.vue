<template>
  <div class="kanban-profesional w-full">
    <!-- Header con estadísticas -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm w-full">
      <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div>
            <h1 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Tablero Kanban</h1>
            <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Arrastra las tareas entre columnas para actualizar su estado</p>
          </div>
        </div>
        
        <!-- Estadísticas en pills -->
        <div class="flex gap-1.5 sm:gap-2 flex-wrap">
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2">
            <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400"></span>
            <span class="text-gray-600 dark:text-gray-400 hidden sm:inline">Total</span>
            <span class="font-bold text-gray-900 dark:text-white tabular-nums">{{ totalTareas }}</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2">
            <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500"></span>
            <span class="text-gray-600 dark:text-gray-400 hidden sm:inline">Pendientes</span>
            <span class="font-bold text-gray-900 dark:text-white tabular-nums">{{ tareasPendientes }}</span>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2">
            <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500"></span>
            <span class="text-purple-700 dark:text-purple-300 hidden sm:inline">Asignados</span>
            <span class="font-bold text-purple-900 dark:text-purple-200 tabular-nums">{{ tareasAsignadas }}</span>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2">
            <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></span>
            <span class="text-blue-700 dark:text-blue-300 hidden sm:inline">En progreso</span>
            <span class="font-bold text-blue-900 dark:text-blue-200 tabular-nums">{{ tareasEnProgreso }}</span>
          </div>
          <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2">
            <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500"></span>
            <span class="text-emerald-700 dark:text-emerald-300 hidden sm:inline">Completadas hoy</span>
            <span class="font-bold text-emerald-900 dark:text-emerald-200 tabular-nums">{{ tareasCompletadasHoy }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Columnas Kanban (grid responsive sin scroll) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 pb-4 w-full">
      <div
        v-for="column in columnas"
        :key="column.id"
        class="kanban-column bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col w-full"
        :style="{ minHeight: 'min(70vh, 500px)' }"
      >
        <!-- Header de columna -->
        <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div :class="column.color" class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"></div>
            <h3 class="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">{{ column.titulo }}</h3>
          </div>
          <span class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium tabular-nums flex-shrink-0">
            {{ column.tareas.length }}
          </span>
        </div>
        
        <!-- Contenido de columna -->
        <div class="p-2 sm:p-3 flex-1 flex flex-col overflow-hidden">
          <draggable
            :list="column.tareas"
            group="tarjetas"
            item-key="_id"
            class="space-y-2 sm:space-y-2.5 flex-1 overflow-y-auto pr-0.5 sm:pr-1"
            ghost-class="dragging-ghost"
            drag-class="dragging"
            @end="(evt) => onDragEnd(evt, column.id)"
          >
            <template #item="{ element }">
              <TarjetaCardProfesional
                :tarjeta="element"
                @click="openTarjetaModal(element)"
              />
            </template>
          </draggable>
          
          <!-- Placeholder cuando está vacío -->
          <div v-if="column.tareas.length === 0" class="text-center py-8 sm:py-12 my-auto">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p class="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500">Sin tareas</p>
          </div>
          
          <!-- Botón "Ver historial completo" solo en columna finalizadas -->
          <button
            v-if="column.id === 'finalizada' && totalFinalizadasArchivadas > 0"
            @click="$emit('abrir-historial')"
            class="mt-2 sm:mt-3 w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition group flex-shrink-0"
          >
            <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ver historial</span>
            <span class="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[9px] sm:text-[10px] font-bold tabular-nums group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
              {{ totalFinalizadasArchivadas }}
            </span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modales -->
    <TarjetaModalProfesional
      v-if="selectedTarjeta"
      :tarjeta="selectedTarjeta"
      @close="selectedTarjeta = null"
      @update="fetchTarjetas"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useTarjetasStore } from '~/stores/tarjetas';
import draggable from 'vuedraggable';
import TarjetaCardProfesional from './TarjetaCardProfesional.vue';
import TarjetaModalProfesional from './TarjetaModalProfesional.vue';

defineEmits(['abrir-historial']);

const tarjetasStore = useTarjetasStore();

// ============================================================
// COLUMNAS DEL KANBAN
// ============================================================
const columnas = ref([
  { 
    id: 'pendiente', 
    titulo: 'Pendientes', 
    color: 'bg-gray-400',
    tareas: []
  },
  { 
    id: 'asignado', 
    titulo: 'Asignados', 
    color: 'bg-purple-500',
    tareas: []
  }, 
  { 
    id: 'en_progreso', 
    titulo: 'En progreso', 
    color: 'bg-blue-500',
    tareas: []
  },
  { 
    id: 'finalizada', 
    titulo: 'Finalizadas hoy', 
    color: 'bg-emerald-500',
    tareas: []
  }
]);

// ============================================================
// ESTADÍSTICAS
// ============================================================

const totalTareas = computed(() => tarjetasStore.tarjetas.length);

const tareasPendientes = computed(() => 
  tarjetasStore.tarjetas.filter(t => t.estado === 'pendiente').length
);

const tareasAsignadas = computed(() => 
  tarjetasStore.tarjetas.filter(t => 
    t.estado === 'en_progreso' && t.estadoProgreso !== 'activa'
  ).length
);

const tareasEnProgreso = computed(() => 
  tarjetasStore.tarjetas.filter(t => 
    t.estado === 'en_progreso' && t.estadoProgreso === 'activa'
  ).length
);

const tareasCompletadasHoy = computed(() => {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
  const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
  
  return tarjetasStore.tarjetas.filter(t => {
    if (t.estado !== 'finalizada' && t.estado !== 'revision_cliente') return false;
    if (!t.fechaFinalizada) return false;
    const fecha = new Date(t.fechaFinalizada);
    return fecha >= inicioHoy && fecha <= finHoy;
  }).length;
});

const totalFinalizadasArchivadas = computed(() => {
  return tarjetasStore.tarjetas.filter(t => 
    t.estado === 'finalizada' || t.estado === 'revision_cliente'
  ).length;
});

// ============================================================
// ESTADO LOCAL
// ============================================================

const selectedTarjeta = ref(null);

// ============================================================
// ORGANIZAR TAREAS
// ============================================================

const organizarTareas = () => {
  const mapa = {
    pendiente: [],
    asignado: [],
    en_progreso: [],
    finalizada: []
  };
  
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
  const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
  
  tarjetasStore.tarjetas.forEach(tarjeta => {
    let estado = tarjeta.estado;
    
    if (estado === 'revision_jefe' || estado === 'revision_supervisor') {
      estado = 'finalizada';
    }
    if (estado === 'revision_cliente' || estado === 'completada') {
      estado = 'finalizada';
    }
    
    if (estado === 'finalizada') {
      const fechaFin = tarjeta.fechaFinalizada ? new Date(tarjeta.fechaFinalizada) : null;
      if (fechaFin && fechaFin >= inicioHoy && fechaFin <= finHoy) {
        mapa.finalizada.push(tarjeta);
      }
      return;
    }
    
    if (estado === 'en_progreso') {
      if (tarjeta.estadoProgreso === 'activa') {
        mapa.en_progreso.push(tarjeta);
      } else {
        mapa.asignado.push(tarjeta);
      }
    } else if (mapa[estado] !== undefined) {
      mapa[estado].push(tarjeta);
    } else {
      mapa.pendiente.push(tarjeta);
    }
  });
  
  columnas.value.forEach(col => {
    col.tareas = mapa[col.id] || [];
  });
};

// ============================================================
// DRAG & DROP
// ============================================================

const onDragEnd = async (event, nuevoEstado) => {
  const tarjetaId = event.item.__draggable_context.element._id;
  const tarjeta = tarjetasStore.tarjetas.find(t => t._id === tarjetaId);
  
  if (!tarjeta) return;
  
  if (nuevoEstado === 'asignado' || nuevoEstado === 'en_progreso' || nuevoEstado === 'finalizada') {
    organizarTareas();
    return;
  }
  
  organizarTareas();
};

// ============================================================
// MODALES
// ============================================================

const openTarjetaModal = (tarjeta) => {
  selectedTarjeta.value = tarjeta;
};

// ============================================================
// FETCH
// ============================================================

const fetchTarjetas = async () => {
  await tarjetasStore.fetchTarjetas();
  organizarTareas();
};

defineExpose({ 
  fetchTarjetas,
  organizarTareas
});

// ============================================================
// WATCHERS Y LIFECYCLE
// ============================================================

watch(() => tarjetasStore.tarjetas, () => {
  organizarTareas();
}, { deep: true });

onMounted(() => {
  organizarTareas();
});
</script>

<style scoped>
.kanban-column {
  transition: all 0.2s ease;
}

.kanban-column:hover {
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05);
}

.dragging-ghost {
  opacity: 0.4;
}

.dragging {
  cursor: grabbing;
}

/* Scroll fino para las columnas */
.kanban-column :deep(.overflow-y-auto) {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.kanban-column :deep(.overflow-y-auto)::-webkit-scrollbar {
  width: 4px;
}

.kanban-column :deep(.overflow-y-auto)::-webkit-scrollbar-track {
  background: transparent;
}

.kanban-column :deep(.overflow-y-auto)::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.kanban-column :deep(.overflow-y-auto)::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>