<template>
  <div class="kanban-board">
    <div class="flex gap-4 overflow-x-auto p-4 min-h-[70vh]">
      <div
        v-for="(column, columnName) in tarjetasPorEstado"
        :key="columnName"
        class="kanban-column min-w-[320px] bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg text-gray-800">{{ columnName }}</h3>
          <span class="bg-gray-200 px-2 py-1 rounded-full text-sm text-gray-700">
            {{ column.length }}
          </span>
        </div>
        
        <draggable
          :list="column"
          group="tarjetas"
          item-key="_id"
          class="space-y-3"
          @end="(evt) => onDragEnd(evt, columnName)"
        >
          <template #item="{ element }">
            <TarjetaCard
              :tarjeta="element"
              @click="openTarjetaModal(element)"
            />
          </template>
        </draggable>
        
        <button
          @click="abrirModalTareaRapida"
          class="mt-4 w-full py-2 text-gray-500 hover:text-gray-700 border-2 border-dashed border-gray-300 rounded-lg transition"
        >
          + Agregar tarea
        </button>
      </div>
    </div>
    
    <TarjetaModal
      v-if="selectedTarjeta"
      :tarjeta="selectedTarjeta"
      @close="selectedTarjeta = null"
      @update="fetchTarjetas"
    />
    
    <SolicitudModal
      v-if="modalTareaRapida"
      :extra="true"
      @close="modalTareaRapida = false"
      @created="handleTareaCreada"
    />
  </div>
</template>

<script setup>
import { useTarjetasStore } from '~/stores/tarjetas';
import { useAuthStore } from '~/stores/auth';
import draggable from 'vuedraggable';

const tarjetasStore = useTarjetasStore();
const authStore = useAuthStore();

const tarjetasPorEstado = computed(() => {
  const grouped = {
    pendiente: [],
    en_progreso: [],
    revision_jefe: [],
    revision_cliente: [],
    finalizada: []
  };
  
  tarjetasStore.tarjetas.forEach(tarjeta => {
    if (grouped[tarjeta.estado] !== undefined) {
      grouped[tarjeta.estado].push(tarjeta);
    } else if (tarjeta.estado === 'completada') {
      grouped.finalizada.push(tarjeta);
    }
  });
  
  return {
    'Pendientes': grouped.pendiente,
    'En Progreso': grouped.en_progreso,
    'Revisión Jefe': grouped.revision_jefe,
    'Revisión Cliente': grouped.revision_cliente,
    'Finalizadas': grouped.finalizada
  };
});

const selectedTarjeta = ref(null);
const modalTareaRapida = ref(false);

const onDragEnd = async (event, nuevoEstadoNombre) => {
  const tarjetaId = event.item.__draggable_context.element._id;
  const tarjeta = tarjetasStore.tarjetas.find(t => t._id === tarjetaId);
  
  const nuevoEstadoMap = {
    'Pendientes': 'pendiente',
    'En Progreso': 'en_progreso',
    'Revisión Jefe': 'revision_jefe',
    'Revisión Cliente': 'revision_cliente',
    'Finalizadas': 'finalizada'
  };
  const nuevoEstado = nuevoEstadoMap[nuevoEstadoNombre];
  
  if (!tarjeta || tarjeta.estado === nuevoEstado) return;
  
  if (nuevoEstado === 'revision_jefe') {
    if (tarjeta.porcentajeCompletado < 100) {
      alert('⚠️ La tarea debe estar 100% completada para enviar a revisión del jefe');
      await tarjetasStore.fetchTarjetas();
      return;
    }
  }
  
  if (nuevoEstado === 'revision_cliente') {
    if (tarjeta.estado !== 'completada' && tarjeta.revisionJefe !== 'aprobada') {
      alert('⚠️ La tarea debe ser aprobada por el jefe primero');
      await tarjetasStore.fetchTarjetas();
      return;
    }
  }
  
  const estadosValidos = {
    'pendiente': ['en_progreso'],
    'en_progreso': ['revision_jefe'],
    'revision_jefe': ['completada', 'finalizada'],
    'revision_cliente': ['finalizada'],
    'completada': ['revision_cliente', 'finalizada']
  };
  
  if (!estadosValidos[tarjeta.estado]?.includes(nuevoEstado)) {
    alert(`⚠️ No se puede mover de "${tarjeta.estado}" a "${nuevoEstadoNombre}"`);
    await tarjetasStore.fetchTarjetas();
    return;
  }
  
  await tarjetasStore.registrarProgreso(tarjetaId, {
    porcentajeAvance: tarjeta.porcentajeCompletado || 0,
    horasTrabajadas: 0,
    comentario: `Movido de ${tarjeta.estado} a ${nuevoEstadoNombre}`
  });
};

const openTarjetaModal = (tarjeta) => {
  selectedTarjeta.value = tarjeta;
};

const abrirModalTareaRapida = () => {
  modalTareaRapida.value = true;
};

const handleTareaCreada = () => {
  modalTareaRapida.value = false;
  tarjetasStore.fetchTarjetas();
};

const fetchTarjetas = async () => {
  await tarjetasStore.fetchTarjetas();
};

defineExpose({
  fetchTarjetas
});
</script>

<style scoped>
.kanban-board {
  @apply min-h-screen;
}

.kanban-column {
  @apply shadow-sm;
}

:deep(.sortable-drag) {
  @apply opacity-50;
}
</style>