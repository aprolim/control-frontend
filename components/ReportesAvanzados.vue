<template>
  <div class="space-y-6">
    
    <!-- HEADER + FILTROS -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-base font-semibold text-gray-900 dark:text-white">Reportes</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">Análisis detallado de rendimiento</p>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="exportarExcel"
            :disabled="exportandoExcel"
            class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ exportandoExcel ? 'Exportando...' : 'Excel' }}
          </button>
          <button
            @click="exportarPDF"
            :disabled="exportandoPDF"
            class="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ exportandoPDF ? 'Exportando...' : 'PDF' }}
          </button>
        </div>
      </div>
      
      <!-- Filtros -->
      <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Período:</span>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="p in periodos"
            :key="p.valor"
            @click="periodoSeleccionado = p.valor"
            :class="periodoSeleccionado === p.valor
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'"
            class="px-3 py-1 rounded-lg text-xs font-medium border transition"
          >
            {{ p.label }}
          </button>
        </div>
        
        <div class="flex items-center gap-2 ml-auto">
          <input
            v-model="fechaInicio"
            type="date"
            class="px-2.5 py-1 border border-gray-300 dark:border-gray-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <span class="text-xs text-gray-500 dark:text-gray-400">a</span>
          <input
            v-model="fechaFin"
            type="date"
            class="px-2.5 py-1 border border-gray-300 dark:border-gray-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <button
            @click="aplicarFechasPersonalizadas"
            class="px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
    
    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase">
            {{ resumen.porcentajeCompletadas }}%
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ resumen.tareasCompletadas }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tareas completadas</p>
      </div>
      
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ resumen.totalHoras }}h</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total horas trabajadas</p>
        <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Promedio {{ resumen.promedioHorasPorDia }}h/día</p>
      </div>
      
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ resumen.eficiencia }}%</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Eficiencia</p>
        <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{{ resumen.mensajeEficiencia }}</p>
      </div>
      
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span class="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full uppercase">
            {{ resumen.totalCalificaciones }} calif.
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ resumen.calificacionPromedio }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Satisfacción</p>
      </div>
    </div>
    
    <!-- GRÁFICOS -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Tareas creadas por día</h3>
        <div class="h-56">
          <canvas ref="tareasPorDiaChart"></canvas>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Horas trabajadas por día</h3>
        <div class="h-56">
          <canvas ref="horasPorDiaChart"></canvas>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Productividad por técnico</h3>
        <div class="h-56">
          <canvas ref="productividadChart"></canvas>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Distribución por tipo</h3>
        <div class="h-56">
          <canvas ref="distribucionChart"></canvas>
        </div>
      </div>
    </div>
    
    <!-- TABLA DETALLE -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Detalle de tareas</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ tareasFiltradas.length }} registros en el período</p>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
            <tr>
              <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Título</th>
              <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Empleado</th>
              <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</th>
              <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Horas</th>
              <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Progreso</th>
              <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Calificación</th>
              <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-if="tareasFiltradas.length === 0">
              <td colspan="7" class="px-4 py-10 text-center text-gray-400 dark:text-gray-500 text-xs">
                Sin tareas en el período seleccionado
              </td>
            </tr>
            <tr v-for="tarea in tareasFiltradas" :key="tarea._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
              <td class="px-4 py-2.5 text-gray-900 dark:text-white font-medium max-w-[200px] truncate">{{ tarea.titulo }}</td>
              <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-xs">{{ tarea.asignadoA?.nombre || '—' }}</td>
              <td class="px-4 py-2.5">
                <span :class="estadoColorClass(tarea.estado)" class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                  {{ estadoTextoLabel(tarea.estado) }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-xs font-mono tabular-nums">{{ formatHoras(tarea) }}</td>
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2">
                  <div class="w-14 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div class="bg-blue-500 rounded-full h-1" :style="{ width: `${tarea.porcentajeCompletado || 0}%` }"></div>
                  </div>
                  <span class="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">{{ tarea.porcentajeCompletado || 0 }}%</span>
                </div>
              </td>
              <td class="px-4 py-2.5">
                <div v-if="tarea.calificacion?.puntaje" class="flex items-center gap-1">
                  <svg class="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="text-xs font-bold text-gray-900 dark:text-white">{{ tarea.calificacion.puntaje }}</span>
                </div>
                <span v-else-if="tarea.calificacion?.autoFinalizada" class="text-[10px] text-orange-600 dark:text-orange-400 font-semibold uppercase">Auto</span>
                <span v-else class="text-gray-400 dark:text-gray-500 text-xs">—</span>
              </td>
              <td class="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs tabular-nums">{{ formatFecha(tarea.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useTarjetasStore } from '~/stores/tarjetas';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(...registerables);

const tarjetasStore = useTarjetasStore();

// ============================================================
// FILTROS
// ============================================================

const periodos = [
  { valor: 'dia', label: 'Hoy' },
  { valor: 'semana', label: 'Semana' },
  { valor: 'mes', label: 'Mes' },
  { valor: 'trimestre', label: 'Trimestre' },
  { valor: 'anio', label: 'Año' }
];

const periodoSeleccionado = ref('semana');
const fechaInicio = ref('');
const fechaFin = ref('');
const tareasFiltradas = ref([]);
const exportandoExcel = ref(false);
const exportandoPDF = ref(false);

const resumen = ref({
  tareasCompletadas: 0,
  totalTareas: 0,
  porcentajeCompletadas: 0,
  totalHoras: '0',
  promedioHorasPorDia: '0',
  eficiencia: 0,
  mensajeEficiencia: '',
  calificacionPromedio: '0',
  totalCalificaciones: 0
});

// ============================================================
// GRÁFICOS
// ============================================================

const tareasPorDiaChart = ref(null);
const horasPorDiaChart = ref(null);
const productividadChart = ref(null);
const distribucionChart = ref(null);
const charts = {};

// ============================================================
// CÁLCULOS
// ============================================================

const calcularMinutosReales = (tarea) => {
  let totalMinutos = 0;
  if (tarea.tiempoAcumulado && tarea.tiempoAcumulado > 0) {
    totalMinutos = tarea.tiempoAcumulado;
  }
  if (totalMinutos === 0 && (tarea.horasTotalesReales || tarea.minutosTotalesReales)) {
    totalMinutos = (tarea.horasTotalesReales || 0) * 60 + (tarea.minutosTotalesReales || 0);
  }
  if (totalMinutos === 0 && tarea.registroHoras?.length) {
    totalMinutos = tarea.registroHoras.reduce((sum, reg) => 
      sum + (reg.horasTrabajadas * 60) + (reg.minutosTrabajados || 0), 0);
  }
  return totalMinutos;
};

const formatHoras = (tarea) => {
  const minutos = calcularMinutosReales(tarea);
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0 && m === 0) return '0h';
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

const formatHorasDecimal = (tarea) => {
  return (calcularMinutosReales(tarea) / 60).toFixed(1);
};

const formatFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

const formatFechaHora = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleString('es-ES');
};

const estadoColorClass = (estado) => {
  const map = {
    pendiente: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    en_progreso: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    revision_cliente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    revision_supervisor: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    finalizada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
  };
  return map[estado] || 'bg-gray-100 text-gray-700';
};

const estadoTextoLabel = (estado) => {
  const map = {
    pendiente: 'Pendiente',
    en_progreso: 'En progreso',
    revision_cliente: 'Revisión',
    revision_supervisor: 'Revisión',
    finalizada: 'Finalizada'
  };
  return map[estado] || estado;
};

const calcularRangoFechas = () => {
  const ahora = new Date();
  let inicio = new Date();
  let fin = new Date();
  
  switch (periodoSeleccionado.value) {
    case 'dia':
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(23, 59, 59, 999);
      break;
    case 'semana': {
      const diaSemana = ahora.getDay();
      inicio.setDate(ahora.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
      inicio.setHours(0, 0, 0, 0);
      fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
      break;
    }
    case 'mes':
      inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
      fin.setHours(23, 59, 59, 999);
      break;
    case 'trimestre': {
      const trimestre = Math.floor(ahora.getMonth() / 3);
      inicio = new Date(ahora.getFullYear(), trimestre * 3, 1);
      fin = new Date(ahora.getFullYear(), (trimestre + 1) * 3, 0);
      fin.setHours(23, 59, 59, 999);
      break;
    }
    case 'anio':
      inicio = new Date(ahora.getFullYear(), 0, 1);
      fin = new Date(ahora.getFullYear(), 11, 31);
      fin.setHours(23, 59, 59, 999);
      break;
  }
  
  fechaInicio.value = inicio.toISOString().split('T')[0];
  fechaFin.value = fin.toISOString().split('T')[0];
};

const aplicarFechasPersonalizadas = () => {
  periodoSeleccionado.value = 'personalizado';
  filtrarTareas();
};

const filtrarTareas = () => {
  if (!tarjetasStore.tarjetas.length) return;
  
  const inicio = new Date(fechaInicio.value);
  const fin = new Date(fechaFin.value);
  fin.setHours(23, 59, 59, 999);
  
  tareasFiltradas.value = tarjetasStore.tarjetas.filter(tarea => {
    const fecha = new Date(tarea.createdAt);
    return fecha >= inicio && fecha <= fin;
  });
  
  calcularResumen();
  renderizarGraficos();
};

const calcularResumen = () => {
  const totalTareas = tareasFiltradas.value.length;
  
  const completadas = tareasFiltradas.value.filter(t => 
    t.estado === 'finalizada' || t.estado === 'revision_cliente'
  );
  const tareasCompletadasCount = completadas.length;
  
  let totalHorasNum = 0;
  tareasFiltradas.value.forEach(t => {
    totalHorasNum += parseFloat(formatHorasDecimal(t));
  });
  
  let eficiencia = 0;
  let mensajeEficiencia = 'Sin datos';
  if (totalTareas > 0) {
    eficiencia = Math.round((tareasCompletadasCount / totalTareas) * 100);
    if (eficiencia >= 80) mensajeEficiencia = 'Excelente';
    else if (eficiencia >= 60) mensajeEficiencia = 'Bueno';
    else if (eficiencia >= 40) mensajeEficiencia = 'Regular';
    else mensajeEficiencia = 'Requiere mejora';
  }
  
  const calificadas = completadas.filter(t => t.calificacion?.puntaje);
  const calificacionPromedioNum = calificadas.length > 0
    ? calificadas.reduce((sum, t) => sum + t.calificacion.puntaje, 0) / calificadas.length
    : 0;
  
  const diasEnRango = Math.max(1, Math.ceil(
    (new Date(fechaFin.value) - new Date(fechaInicio.value)) / (1000 * 60 * 60 * 24)
  ));
  
  resumen.value = {
    tareasCompletadas: tareasCompletadasCount,
    totalTareas,
    porcentajeCompletadas: totalTareas > 0 ? Math.round((tareasCompletadasCount / totalTareas) * 100) : 0,
    totalHoras: totalHorasNum.toFixed(1),
    promedioHorasPorDia: (totalHorasNum / diasEnRango).toFixed(1),
    eficiencia,
    mensajeEficiencia,
    calificacionPromedio: calificacionPromedioNum.toFixed(1),
    totalCalificaciones: calificadas.length
  };
};

const renderizarGraficos = () => {
  // Destruir gráficos previos
  Object.values(charts).forEach(chart => chart?.destroy());
  
  const tareasPorFecha = {};
  const horasPorFecha = {};
  
  tareasFiltradas.value.forEach(tarea => {
    const fecha = new Date(tarea.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    tareasPorFecha[fecha] = (tareasPorFecha[fecha] || 0) + 1;
    horasPorFecha[fecha] = (horasPorFecha[fecha] || 0) + parseFloat(formatHorasDecimal(tarea));
  });
  
  const fechas = Object.keys(tareasPorFecha).sort();
  
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 10,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { font: { size: 10 }, color: '#9CA3AF' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#9CA3AF' }
      }
    }
  };
  
  // 1. Tareas por día
  if (tareasPorDiaChart.value) {
    charts.tareasPorDia = new Chart(tareasPorDiaChart.value.getContext('2d'), {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          data: fechas.map(f => tareasPorFecha[f]),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: commonOptions
    });
  }
  
  // 2. Horas por día
  if (horasPorDiaChart.value) {
    charts.horasPorDia = new Chart(horasPorDiaChart.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: fechas,
        datasets: [{
          data: fechas.map(f => horasPorFecha[f]),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderRadius: 6
        }]
      },
      options: commonOptions
    });
  }
  
  // 3. Productividad por técnico
  const empleados = {};
  tareasFiltradas.value.forEach(t => {
    if (t.asignadoA?.nombre) {
      if (!empleados[t.asignadoA.nombre]) {
        empleados[t.asignadoA.nombre] = { completadas: 0, horas: 0 };
      }
      if (t.estado === 'finalizada') empleados[t.asignadoA.nombre].completadas++;
      empleados[t.asignadoA.nombre].horas += parseFloat(formatHorasDecimal(t));
    }
  });
  
  if (productividadChart.value && Object.keys(empleados).length) {
    charts.productividad = new Chart(productividadChart.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(empleados),
        datasets: [
          {
            label: 'Completadas',
            data: Object.values(empleados).map(e => e.completadas),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 6
          },
          {
            label: 'Horas',
            data: Object.values(empleados).map(e => e.horas),
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderRadius: 6
          }
        ]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 10 } } }
        }
      }
    });
  }
  
  // 4. Distribución por tipo
  const tipos = { solicitud_cliente: 0, tarea_extra: 0, asignacion_supervisor: 0 };
  tareasFiltradas.value.forEach(t => {
    tipos[t.tipo] = (tipos[t.tipo] || 0) + 1;
  });
  
  if (distribucionChart.value) {
    charts.distribucion = new Chart(distribucionChart.value.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Solicitudes', 'Tareas extra', 'Asignaciones'],
        datasets: [{
          data: [tipos.solicitud_cliente, tipos.tarea_extra, tipos.asignacion_supervisor],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 }, padding: 12 } }
        }
      }
    });
  }
};

// ============================================================
// EXPORTAR
// ============================================================

const exportarExcel = async () => {
  exportandoExcel.value = true;
  try {
    const excelData = tareasFiltradas.value.map(t => ({
      'Título': t.titulo,
      'Descripción': t.descripcion || '',
      'Empleado': t.asignadoA?.nombre || 'Sin asignar',
      'Estado': estadoTextoLabel(t.estado),
      'Horas trabajadas': formatHorasDecimal(t) + 'h',
      'Progreso': `${t.porcentajeCompletado || 0}%`,
      'Calificación': t.calificacion?.puntaje || 'Sin calificar',
      'Fecha creación': formatFecha(t.createdAt)
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 }];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tareas');
    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `reporte_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    alert('✅ Excel exportado');
  } catch (error) {
    console.error(error);
    alert('❌ Error al exportar Excel');
  } finally {
    exportandoExcel.value = false;
  }
};

const exportarPDF = async () => {
  exportandoPDF.value = true;
  try {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Reporte de Tareas', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text(`Período: ${fechaInicio.value} al ${fechaFin.value}`, 15, 35);
    pdf.text(`Total tareas: ${tareasFiltradas.value.length}`, 15, 40);
    
    const data = tareasFiltradas.value.map(t => [
      t.titulo.substring(0, 30),
      t.asignadoA?.nombre || '—',
      estadoTextoLabel(t.estado),
      formatHorasDecimal(t) + 'h',
      `${t.porcentajeCompletado || 0}%`,
      t.calificacion?.puntaje || '—',
      formatFecha(t.createdAt)
    ]);
    
    autoTable(pdf, {
      startY: 48,
      head: [['Título', 'Empleado', 'Estado', 'Horas', 'Progreso', 'Calif.', 'Fecha']],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 }
    });
    
    pdf.save(`reporte_${new Date().toISOString().split('T')[0]}.pdf`);
    alert('✅ PDF exportado');
  } catch (error) {
    console.error(error);
    alert('❌ Error al exportar PDF');
  } finally {
    exportandoPDF.value = false;
  }
};

// ============================================================
// WATCHERS
// ============================================================

watch(periodoSeleccionado, () => {
  if (periodoSeleccionado.value !== 'personalizado') {
    calcularRangoFechas();
    filtrarTareas();
  }
});

watch(() => tarjetasStore.tarjetas, () => {
  if (tarjetasStore.tarjetas.length) filtrarTareas();
}, { deep: true });

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(() => {
  calcularRangoFechas();
  if (tarjetasStore.tarjetas.length) filtrarTareas();
});

onUnmounted(() => {
  Object.values(charts).forEach(chart => chart?.destroy());
});
</script>