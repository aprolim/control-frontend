<template>
  <div class="kanban-profesional">
    <!-- Header con estadísticas rápidas -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-lg">📌</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800 dark:text-white">Tablero Kanban</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Arrastra las tareas entre columnas para actualizar su estado</p>
          </div>
        </div>
        
        <div class="flex gap-3">
          <div class="flex gap-2">
            <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-1.5 text-sm">
              <span class="text-blue-600 dark:text-blue-400">Total:</span>
              <span class="font-semibold ml-1 text-blue-700 dark:text-blue-300">{{ totalTareas }}</span>
            </div>
            <div class="bg-green-50 dark:bg-green-900/30 rounded-lg px-3 py-1.5 text-sm">
              <span class="text-green-600 dark:text-green-400">Completadas:</span>
              <span class="font-semibold ml-1 text-green-700 dark:text-green-300">{{ tareasCompletadas }}</span>
            </div>
            <div class="bg-orange-50 dark:bg-orange-900/30 rounded-lg px-3 py-1.5 text-sm">
              <span class="text-orange-600 dark:text-orange-400">En progreso:</span>
              <span class="font-semibold ml-1 text-orange-700 dark:text-orange-300">{{ tareasEnProgreso }}</span>
            </div>
          </div>
          <button
            @click="abrirModalTareaRapida"
            class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-1.5 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition shadow-sm flex items-center gap-2 dark:from-blue-700 dark:to-blue-800"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Tarea
          </button>
        </div>
      </div>
    </div>
    
    <!-- Columnas Kanban -->
    <div class="flex gap-5 overflow-x-auto pb-6 min-h-[70vh] kanban-container">
      <div
        v-for="column in columnas"
        :key="column.id"
        class="kanban-column flex-shrink-0 w-96 bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col"
      >
        <!-- Header de columna -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div :class="column.color" class="w-2.5 h-2.5 rounded-full"></div>
              <h3 class="font-semibold text-gray-800 dark:text-white">{{ column.titulo }}</h3>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs text-gray-600 dark:text-gray-300 font-medium">
                {{ column.tareas.length }}
              </span>
              <button
                v-if="column.permiteAgregar"
                @click="abrirModalTareaRapida"
                class="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Contenido de columna -->
        <div class="p-3 flex-1 min-h-[400px]">
          <draggable
            :list="column.tareas"
            group="tarjetas"
            item-key="_id"
            class="space-y-3"
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
            <div class="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl">{{ column.iconoVacio }}</span>
            </div>
            <p class="text-xs text-gray-400 dark:text-gray-500">Arrastra tareas aquí</p>
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
    
    <SolicitudModal
      v-if="modalTareaRapida"
      :extra="false"
      @close="modalTareaRapida = false"
      @created="handleTareaCreada"
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

// 🔥 Columnas con IDs actualizados (revision_supervisor en lugar de revision_jefe)
const columnas = ref([
  { 
    id: 'pendiente', 
    titulo: '📋 Pendientes', 
    color: 'bg-gray-400 dark:bg-gray-500',
    iconoVacio: '📋',
    permiteAgregar: true,
    tareas: []
  },
  { 
    id: 'en_progreso', 
    titulo: '⚙️ En Progreso', 
    color: 'bg-blue-500 dark:bg-blue-600',
    iconoVacio: '⚙️',
    permiteAgregar: false,
    tareas: []
  },
  { 
    id: 'revision_supervisor',  // 🔥 Cambiado de 'revision_jefe'
    titulo: '👔 Revisión Supervisor', 
    color: 'bg-orange-500 dark:bg-orange-600',
    iconoVacio: '👔',
    permiteAgregar: false,
    tareas: []
  },
  { 
    id: 'revision_cliente', 
    titulo: '⭐ Revisión Usuario', 
    color: 'bg-yellow-500 dark:bg-yellow-600',
    iconoVacio: '⭐',
    permiteAgregar: false,
    tareas: []
  },
  { 
    id: 'finalizada', 
    titulo: '✅ Finalizadas', 
    color: 'bg-green-500 dark:bg-green-600',
    iconoVacio: '✅',
    permiteAgregar: false,
    tareas: []
  }
]);

const totalTareas = computed(() => tarjetasStore.tarjetas.length);
const tareasCompletadas = computed(() => tarjetasStore.tarjetas.filter(t => t.estado === 'finalizada' || t.estado === 'revision_cliente').length);
const tareasEnProgreso = computed(() => tarjetasStore.tarjetas.filter(t => t.estado === 'en_progreso').length);

const selectedTarjeta = ref(null);
const modalTareaRapida = ref(false);

// ============================================================
// 🔥 FUNCIÓN PRINCIPAL: Organizar tareas en columnas
// ============================================================

const organizarTareas = () => {
  console.log('🔄 [Kanban] Organizando tareas...');
  
  // Mapeo de estados a IDs de columnas
  const mapa = {
    pendiente: [],
    en_progreso: [],
    revision_supervisor: [],  // 🔥 Cambiado de revision_jefe
    revision_cliente: [],
    finalizada: []
  };
  
  tarjetasStore.tarjetas.forEach(tarjeta => {
    let estado = tarjeta.estado;
    
    // 🔥 Mapear estados antiguos a nuevos si vienen de la base de datos
    if (estado === 'revision_jefe') {
      estado = 'revision_supervisor';
    }
    if (estado === 'completada') {
      estado = 'finalizada';
    }
    
    if (mapa[estado] !== undefined) {
      mapa[estado].push(tarjeta);
    } else {
      // Si el estado no está en el mapa, asignar a pendiente por defecto
      console.warn(`⚠️ [Kanban] Estado desconocido: ${estado}, asignando a pendiente`);
      mapa.pendiente.push(tarjeta);
    }
  });
  
  // Asignar tareas a cada columna
  columnas.value.forEach(col => {
    let id = col.id;
    // Mapear IDs de columnas antiguos a nuevos
    if (id === 'revision_jefe') {
      id = 'revision_supervisor';
    }
    col.tareas = mapa[id] || [];
  });
  
  console.log(`📊 [Kanban] Tareas organizadas:`, {
    pendiente: mapa.pendiente.length,
    en_progreso: mapa.en_progreso.length,
    revision_supervisor: mapa.revision_supervisor.length,
    revision_cliente: mapa.revision_cliente.length,
    finalizada: mapa.finalizada.length
  });
};

// ============================================================
// DRAG & DROP
// ============================================================

const onDragEnd = async (event, nuevoEstado) => {
  const tarjetaId = event.item.__draggable_context.element._id;
  const tarjeta = tarjetasStore.tarjetas.find(t => t._id === tarjetaId);
  
  if (!tarjeta || tarjeta.estado === nuevoEstado) return;
  
  // 🔥 Mapear estados para compatibilidad
  let estadoDestino = nuevoEstado;
  if (estadoDestino === 'revision_supervisor') estadoDestino = 'revision_jefe';
  
  const transicionesValidas = {
    pendiente: ['en_progreso'],
    en_progreso: ['revision_jefe', 'revision_supervisor'],
    revision_jefe: ['finalizada'],
    revision_supervisor: ['finalizada'],
    revision_cliente: ['finalizada']
  };
  
  // Normalizar estado actual para validación
  let estadoActual = tarjeta.estado;
  if (estadoActual === 'revision_jefe') estadoActual = 'revision_supervisor';
  
  if (!transicionesValidas[estadoActual]?.includes(estadoDestino)) {
    alert(`⚠️ No se puede mover de "${tarjeta.estado}" a "${nuevoEstado}"`);
    organizarTareas();
    return;
  }
  
  if ((estadoDestino === 'revision_jefe' || estadoDestino === 'revision_supervisor') && tarjeta.porcentajeCompletado < 100) {
    alert('⚠️ La tarea debe estar 100% completada para enviar a revisión');
    organizarTareas();
    return;
  }
  
  try {
    // Registrar el movimiento como progreso
    await tarjetasStore.registrarProgreso(tarjetaId, {
      porcentajeAvance: tarjeta.porcentajeCompletado || 0,
      horasTrabajadas: 0,
      comentario: `Movido de ${tarjeta.estado} a ${nuevoEstado}`
    });
    
    // Esperar a que se recarguen los datos y luego reorganizar
    await tarjetasStore.fetchTarjetas();
    organizarTareas();
  } catch (error) {
    console.error('❌ [Kanban] Error al mover tarea:', error);
    alert('Error al mover la tarea');
    organizarTareas();
  }
};

// ============================================================
// MODALES
// ============================================================

const openTarjetaModal = (tarjeta) => {
  selectedTarjeta.value = tarjeta;
};

const abrirModalTareaRapida = () => {
  modalTareaRapida.value = true;
};

const handleTareaCreada = () => {
  modalTareaRapida.value = false;
  fetchTarjetas();
};

// ============================================================
// FETCH Y EXPOSICIÓN DE MÉTODOS
// ============================================================

const fetchTarjetas = async () => {
  console.log('🔄 [Kanban] fetchTarjetas...');
  await tarjetasStore.fetchTarjetas();
  organizarTareas();
};

// 🔥 Exponer métodos al padre
defineExpose({ 
  fetchTarjetas,
  organizarTareas
});

// ============================================================
// WATCHERS Y LIFECYCLE
// ============================================================

// Organizar tareas cuando cambien en el store
watch(() => tarjetasStore.tarjetas, () => {
  organizarTareas();
}, { deep: true });

// Organizar tareas al montar
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

.kanban-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.08);
}

.dragging-ghost {
  opacity: 0.5;
  background: #e5e7eb;
  border: 2px dashed #9ca3af;
  transform: rotate(2deg);
}

.dragging {
  cursor: grabbing;
}
</style>