<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Historial de actividades finalizadas</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ tareasFiltradas.length }} de {{ totalFinalizadas }} actividades · Ordenadas por fecha
            </p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Filtros -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
        <!-- Filtros de período -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mr-1">Período:</span>
          <button
            v-for="f in filtrosPeriodo"
            :key="f.valor"
            @click="periodoSeleccionado = f.valor"
            :class="periodoSeleccionado === f.valor
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border transition"
          >
            {{ f.label }}
          </button>
        </div>
        
        <!-- Rango personalizado -->
        <div v-if="periodoSeleccionado === 'personalizado'" class="flex flex-wrap items-center gap-2 pl-16">
          <input
            v-model="fechaDesde"
            type="date"
            class="px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <span class="text-xs text-gray-500">a</span>
          <input
            v-model="fechaHasta"
            type="date"
            class="px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <button
            @click="aplicarFechasPersonalizadas"
            class="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
          >
            Aplicar
          </button>
        </div>
        
        <!-- Búsqueda + filtro técnico -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar por título o descripción..."
              class="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <select
            v-model="tecnicoFiltro"
            class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todos los técnicos</option>
            <option v-for="tec in tecnicosUnicos" :key="tec._id" :value="tec._id">
              {{ tec.nombre }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Lista scrollable -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="tareasFiltradas.length === 0" class="text-center py-16">
          <div class="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
            <svg class="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Sin actividades finalizadas en este período</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Prueba con otro rango de fechas</p>
        </div>
        
        <div v-else class="space-y-2.5">
          <article
            v-for="tarea in tareasFiltradas"
            :key="tarea._id"
            class="border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition bg-white dark:bg-gray-900"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Info principal -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1.5">
                  <h4 class="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {{ tarea.titulo }}
                  </h4>
                  <span :class="prioridadColorClass(tarea.prioridad)" class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                    {{ prioridadTextoLabel(tarea.prioridad) }}
                  </span>
                </div>
                
                <p v-if="tarea.descripcion" class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {{ tarea.descripcion }}
                </p>
                
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <!-- Técnico -->
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ tarea.asignadoA?.nombre || 'Sin asignar' }}
                  </span>
                  
                  <!-- Horas -->
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-emerald-600 dark:text-emerald-400 font-semibold">{{ formatHoras(tarea) }}</span>
                    <span v-if="tarea.tiempoEstimadoEmpleado > 0" class="text-gray-400">
                      / {{ formatMinutos(tarea.tiempoEstimadoEmpleado) }}
                    </span>
                  </span>
                  
                  <!-- Fecha finalización -->
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatFechaHora(tarea.fechaFinalizada) }}
                  </span>
                </div>
              </div>
              
              <!-- Calificación -->
              <div class="flex-shrink-0 text-right">
                <div v-if="tarea.calificacion?.puntaje" class="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  <span class="text-amber-500 text-xs">★</span>
                  <span class="text-xs font-bold text-amber-700 dark:text-amber-400">{{ tarea.calificacion.puntaje }}/5</span>
                </div>
                <div v-else-if="tarea.calificacion?.autoFinalizada" class="inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-full">
                  <span class="text-[10px] text-orange-600 dark:text-orange-400 font-semibold uppercase">Auto</span>
                </div>
                <div v-else class="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium">
                  Sin calificar
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          Mostrando {{ tareasFiltradas.length }} de {{ totalFinalizadas }} actividades
        </span>
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTarjetasStore } from '~/stores/tarjetas';

defineEmits(['close']);

const tarjetasStore = useTarjetasStore();

const periodoSeleccionado = ref('hoy');
const fechaDesde = ref('');
const fechaHasta = ref('');
const busqueda = ref('');
const tecnicoFiltro = ref('');
const ahora = ref(Date.now());

// ============================================================
// FILTROS DE PERÍODO
// ============================================================

const filtrosPeriodo = [
  { valor: 'hoy', label: 'Hoy' },
  { valor: 'semana', label: 'Esta semana' },
  { valor: 'mes', label: 'Este mes' },
  { valor: 'anio', label: 'Este año' },
  { valor: 'todas', label: 'Todas' },
  { valor: 'personalizado', label: 'Personalizado' }
];

const parseFechaLocalInicio = (fechaStr) => {
  if (!fechaStr) return new Date();
  const [year, month, day] = fechaStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const parseFechaLocalFin = (fechaStr) => {
  if (!fechaStr) return new Date();
  const [year, month, day] = fechaStr.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
};

const formatearFechaLocal = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const rangoFechas = computed(() => {
  const ahora_ = new Date();
  let inicio, fin;
  
  switch (periodoSeleccionado.value) {
    case 'hoy':
      inicio = new Date(ahora_.getFullYear(), ahora_.getMonth(), ahora_.getDate(), 0, 0, 0, 0);
      fin = new Date(ahora_.getFullYear(), ahora_.getMonth(), ahora_.getDate(), 23, 59, 59, 999);
      break;
    case 'semana': {
      const diaSemana = ahora_.getDay();
      const diasAtras = diaSemana === 0 ? 6 : diaSemana - 1;
      inicio = new Date(ahora_.getFullYear(), ahora_.getMonth(), ahora_.getDate() - diasAtras, 0, 0, 0, 0);
      fin = new Date(ahora_.getFullYear(), ahora_.getMonth(), ahora_.getDate(), 23, 59, 59, 999);
      break;
    }
    case 'mes':
      inicio = new Date(ahora_.getFullYear(), ahora_.getMonth(), 1, 0, 0, 0, 0);
      fin = new Date(ahora_.getFullYear(), ahora_.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'anio':
      inicio = new Date(ahora_.getFullYear(), 0, 1, 0, 0, 0, 0);
      fin = new Date(ahora_.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'todas':
      return { inicio: new Date(0), fin: new Date(9999, 11, 31) };
    case 'personalizado':
      if (!fechaDesde.value || !fechaHasta.value) {
        return { inicio: new Date(0), fin: new Date(9999, 11, 31) };
      }
      return { 
        inicio: parseFechaLocalInicio(fechaDesde.value), 
        fin: parseFechaLocalFin(fechaHasta.value) 
      };
    default:
      return { inicio: new Date(0), fin: new Date(9999, 11, 31) };
  }
  
  return { inicio, fin };
});

// ============================================================
// TAREAS FINALIZADAS
// ============================================================

const todasFinalizadas = computed(() => {
  return tarjetasStore.tarjetas
    .filter(t => t.estado === 'finalizada' || t.estado === 'revision_cliente')
    .sort((a, b) => new Date(b.fechaFinalizada || b.updatedAt) - new Date(a.fechaFinalizada || a.updatedAt));
});

const totalFinalizadas = computed(() => todasFinalizadas.value.length);

const tareasFiltradas = computed(() => {
  const { inicio, fin } = rangoFechas.value;
  
  return todasFinalizadas.value.filter(t => {
    // Filtro por fecha de finalización
    if (!t.fechaFinalizada) return false;
    const fecha = new Date(t.fechaFinalizada);
    if (fecha < inicio || fecha > fin) return false;
    
    // Filtro por técnico
    if (tecnicoFiltro.value) {
      const idTecnico = t.asignadoA?._id || t.asignadoA;
      if (String(idTecnico) !== String(tecnicoFiltro.value)) return false;
    }
    
    // Filtro por búsqueda
    if (busqueda.value.trim()) {
      const query = busqueda.value.toLowerCase().trim();
      const titulo = (t.titulo || '').toLowerCase();
      const descripcion = (t.descripcion || '').toLowerCase();
      if (!titulo.includes(query) && !descripcion.includes(query)) return false;
    }
    
    return true;
  });
});

// Técnicos únicos para el filtro
const tecnicosUnicos = computed(() => {
  const tecnicos = new Map();
  todasFinalizadas.value.forEach(t => {
    if (t.asignadoA?._id) {
      tecnicos.set(t.asignadoA._id, { _id: t.asignadoA._id, nombre: t.asignadoA.nombre });
    }
  });
  return Array.from(tecnicos.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
});

// ============================================================
// CÁLCULOS Y UTILIDADES
// ============================================================

const calcularMinutosReales = (tarea) => {
  if (!tarea) return 0;
  if (tarea.tiempoAcumulado && tarea.tiempoAcumulado > 0) return tarea.tiempoAcumulado;
  if (tarea.horasTotalesReales || tarea.minutosTotalesReales) {
    return (tarea.horasTotalesReales || 0) * 60 + (tarea.minutosTotalesReales || 0);
  }
  if (tarea.registroHoras?.length) {
    return tarea.registroHoras.reduce((sum, reg) => {
      return sum + (reg.horasTrabajadas * 60) + (reg.minutosTrabajados || 0);
    }, 0);
  }
  return 0;
};

const formatMinutos = (minutos) => {
  if (!minutos || minutos === 0) return '0h';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

const formatHoras = (tarea) => formatMinutos(calcularMinutosReales(tarea));

const formatFechaHora = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleString('es-ES', { 
    day: '2-digit', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
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
  const map = { baja: 'Baja', media: 'Media', alta: 'Alta', urgente: 'Urgente' };
  return map[prioridad] || 'Media';
};

const aplicarFechasPersonalizadas = () => {
  // Forzar reactividad
  periodoSeleccionado.value = 'personalizado';
};

// Inicializar fechas si es personalizado
onMounted(() => {
  const hoy = new Date();
  const hace30dias = new Date();
  hace30dias.setDate(hace30dias.getDate() - 30);
  fechaDesde.value = formatearFechaLocal(hace30dias);
  fechaHasta.value = formatearFechaLocal(hoy);
});
</script>