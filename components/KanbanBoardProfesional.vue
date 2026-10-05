<template>
  <div class="kanban-profesional">
    <!-- Header con estadísticas rápidas -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div>
            <h1 class="text-base font-semibold text-gray-900 dark:text-white">Tablero Kanban</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">Arrastra las tareas entre columnas para actualizar su estado</p>
          </div>
        </div>
        
        <!-- Estadísticas en pills -->
        <div class="flex gap-2 flex-wrap">
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gray-400"></span>
            <span class="text-gray-600 dark:text-gray-400">Total</span>
            <span class="font-bold text-gray-900 dark:text-white tabular-nums">{{ totalTareas }}</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gray-500"></span>
            <span class="text-gray-600 dark:text-gray-400">Pendientes</span>
            <span class="font-bold text-gray-900 dark:text-white tabular-nums">{{ tareasPendientes }}</span>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-purple-500"></span>
            <span class="text-purple-700 dark:text-purple-300">Asignados</span>
            <span class="font-bold text-purple-900 dark:text-purple-200 tabular-nums">{{ tareasAsignadas }}</span>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span class="text-blue-700 dark:text-blue-300">En progreso</span>
            <span class="font-bold text-blue-900 dark:text-blue-200 tabular-nums">{{ tareasEnProgreso }}</span>
          </div>
          <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="text-emerald-700 dark:text-emerald-300">Completadas</span>
            <span class="font-bold text-emerald-900 dark:text-emerald-200 tabular-nums">{{ tareasCompletadas }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Columnas Kanban -->
    <div class="flex gap-4 overflow-x-auto pb-4 min-h-[70vh] kanban-container">
      <div
        v-for="column in columnas"
        :key="column.id"
        class="kanban-column flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col"
      >
        <!-- Header de columna -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div :class="column.color" class="w-2 h-2 rounded-full"></div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ column.titulo }}</h3>
          </div>
          <span class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-2 py-0.5 rounded-full text-xs text-gray-600 dark:text-gray-400 font-medium tabular-nums">
            {{ column.tareas.length }}
          </span>
        </div>
        
        <!-- Contenido de columna -->
        <div class="p-3 flex-1 min-h-[400px]">
          <draggable
            :list="column.tareas"
            group="tarjetas"
            item-key="_id"
            class="space-y-2.5"
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
          <div v-if="column.tareas.length === 0" class="text-center py-12">
            <div class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg class="w-5 h-5 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p class="text-[11px] text-gray-400 dark:text-gray-500">Sin tareas</p>
          </div>
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

const tarjetasStore = useTarjetasStore();

// Columnas del Kanban
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
    titulo: 'Finalizadas', 
    color: 'bg-emerald-500',
    tareas: []
  }
]);

// ============================================================
// ESTADÍSTICAS DEL HEADER
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

const tareasCompletadas = computed(() => 
  tarjetasStore.tarjetas.filter(t => 
    t.estado === 'finalizada' || 
    t.estado === 'revision_supervisor' || 
    t.estado === 'revision_cliente' ||
    t.estado === 'revision_jefe' ||
    t.estado === 'completada'
  ).length
);

// ============================================================
// ESTADO LOCAL
// ============================================================

const selectedTarjeta = ref(null);

// ============================================================
// ORGANIZAR TAREAS EN COLUMNAS
// ============================================================

const organizarTareas = () => {
  const mapa = {
    pendiente: [],
    asignado: [],
    en_progreso: [],
    finalizada: []
  };
  
  tarjetasStore.tarjetas.forEach(tarjeta => {
    let estado = tarjeta.estado;
    
    if (estado === 'revision_jefe' || estado === 'revision_supervisor') {
      estado = 'finalizada';
    }
    if (estado === 'revision_cliente' || estado === 'completada') {
      estado = 'finalizada';
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
// DRAG & DROP (solo permite movimientos válidos por supervisor)
// ============================================================

const onDragEnd = async (event, nuevoEstado) => {
  const tarjetaId = event.item.__draggable_context.element._id;
  const tarjeta = tarjetasStore.tarjetas.find(t => t._id === tarjetaId);
  
  if (!tarjeta) return;
  
  // Las columnas "Asignados", "En progreso" y "Finalizadas" NO aceptan drag&drop
  // (esas las controlan los técnicos con sus botones Iniciar/Pausar)
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
.kanban-container {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.kanban-container::-webkit-scrollbar {
  height: 8px;
}

.kanban-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.kanban-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.kanban-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.kanban-column {
  transition: all 0.2s ease;
}

.dragging-ghost {
  opacity: 0.4;
}

.dragging {
  cursor: grabbing;
}
</style>