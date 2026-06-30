<template>
  <div class="reportes-avanzados">
    <!-- Header con filtros -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-lg">📊</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800 dark:text-white">Reportes y Estadísticas</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Análisis detallado de rendimiento</p>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button
            v-for="periodo in periodos"
            :key="periodo.valor"
            @click="periodoSeleccionado = periodo.valor"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              periodoSeleccionado === periodo.valor
                ? 'bg-blue-600 text-white shadow-md dark:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ periodo.label }}
          </button>
        </div>
      </div>
      
      <div class="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Desde:</span>
            <input
              v-model="fechaInicio"
              type="date"
              class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Hasta:</span>
            <input
              v-model="fechaFin"
              type="date"
              class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            @click="aplicarFechasPersonalizadas"
            class="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition dark:bg-green-700 dark:hover:bg-green-800"
          >
            Aplicar
          </button>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="exportarExcel"
            :disabled="exportandoExcel"
            class="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ exportandoExcel ? 'Exportando...' : '📊 Excel' }}
          </button>
          <button
            @click="exportarPDF"
            :disabled="exportandoPDF"
            class="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ exportandoPDF ? 'Exportando...' : '📄 PDF' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tarjetas de resumen -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-blue-100 text-sm">Tareas Completadas</p>
            <p class="text-3xl font-bold mt-1">{{ resumen.tareasCompletadas }}</p>
          </div>
          <div class="text-3xl">✅</div>
        </div>
        <p class="text-blue-100 text-xs mt-2">{{ resumen.porcentajeCompletadas }}% del total</p>
      </div>
      
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-green-100 text-sm">Horas Trabajadas</p>
            <p class="text-3xl font-bold mt-1">{{ resumen.totalHoras }}</p>
          </div>
          <div class="text-3xl">⏱️</div>
        </div>
        <p class="text-green-100 text-xs mt-2">Promedio: {{ resumen.promedioHorasPorDia }}h/día</p>
      </div>
      
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-purple-100 text-sm">Eficiencia</p>
            <p class="text-3xl font-bold mt-1">{{ resumen.eficiencia }}%</p>
          </div>
          <div class="text-3xl">📈</div>
        </div>
        <p class="text-purple-100 text-xs mt-2">{{ resumen.mensajeEficiencia }}</p>
      </div>
      
      <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-yellow-100 text-sm">Satisfacción</p>
            <p class="text-3xl font-bold mt-1">{{ resumen.calificacionPromedio }}</p>
          </div>
          <div class="text-3xl">⭐</div>
        </div>
        <p class="text-yellow-100 text-xs mt-2">Basado en {{ resumen.totalCalificaciones }} calificación(es)</p>
      </div>
    </div>
    
    <!-- Tabla de datos detallados -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          📋 Detalle de tareas
          <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">({{ tareasFiltradas.length }} registros)</span>
        </h3>
      </div>
      <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0">
            <tr>
              <th class="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-semibold">Título</th>
              <th class="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-semibold">Empleado</th>
              <th class="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-semibold">Estado</th>
              <th class="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-semibold">Horas</th>
              <th class="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-semibold">Progreso</th>
              <th class="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-semibold">Calificación</th>
              <th class="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tarea in tareasFiltradas" :key="tarea._id" class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <td class="px-4 py-3 text-gray-800 dark:text-gray-200">{{ tarea.titulo }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ tarea.asignadoA?.nombre || 'Sin asignar' }}</td>
              <td class="px-4 py-3">
                <span :class="estadoColorClass(tarea.estado)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ estadoTextoLabel(tarea.estado) }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono">{{ formatHoras(tarea) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div class="bg-blue-500 rounded-full h-1.5" :style="{ width: `${tarea.porcentajeCompletado || 0}%` }"></div>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ tarea.porcentajeCompletado || 0 }}%</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span v-if="tarea.calificacion?.puntaje" class="flex items-center gap-1">
                  <span class="text-yellow-500">★</span>
                  <span class="font-medium text-gray-800 dark:text-gray-200">{{ tarea.calificacion.puntaje }}/5</span>
                </span>
                <span v-else-if="tarea.calificacion?.autoFinalizada" class="text-xs text-orange-500 dark:text-orange-400">Auto-finalizada</span>
                <span v-else class="text-gray-400 dark:text-gray-500">—</span>
              </td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{{ formatFecha(tarea.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useTarjetasStore } from '~/stores/tarjetas';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(...registerables);

const tarjetasStore = useTarjetasStore();

const periodos = [
  { valor: 'dia', label: '📅 Hoy' },
  { valor: 'semana', label: '📆 Esta semana' },
  { valor: 'mes', label: '📅 Este mes' },
  { valor: 'trimestre', label: '📊 Este trimestre' },
  { valor: 'anio', label: '🎯 Este año' }
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

// Gráficos
const tareasPorDiaChart = ref(null);
const horasPorDiaChart = ref(null);
const productividadChart = ref(null);
const distribucionChart = ref(null);
let charts = {};

// ============================================================
// FUNCIONES DE CÁLCULO DE HORAS
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
    totalMinutos = tarea.registroHoras.reduce((sum, reg) => {
      return sum + (reg.horasTrabajadas * 60) + (reg.minutosTrabajados || 0);
    }, 0);
  }
  
  if (totalMinutos === 0 && tarea.tiempoEstimadoEmpleado > 0 && tarea.porcentajeCompletado > 0) {
    totalMinutos = Math.round((tarea.tiempoEstimadoEmpleado * tarea.porcentajeCompletado) / 100);
  }
  
  if (totalMinutos === 0 && tarea.tiempoEstimadoEmpleado > 0 && tarea.estado === 'finalizada') {
    totalMinutos = tarea.tiempoEstimadoEmpleado;
  }
  
  return totalMinutos;
};

const formatHoras = (tarea) => {
  const totalMinutos = calcularMinutosReales(tarea);
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  
  if (horas === 0 && minutos === 0) return '0h';
  if (horas === 0) return `${minutos}min`;
  if (minutos === 0) return `${horas}h`;
  return `${horas}h ${minutos}min`;
};

const formatHorasDecimal = (tarea) => {
  const totalMinutos = calcularMinutosReales(tarea);
  return (totalMinutos / 60).toFixed(1);
};

const formatFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES');
};

const formatFechaHora = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleString('es-ES');
};

const estadoColorClass = (estado) => {
  const map = {
    pendiente: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    en_progreso: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    revision_jefe: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    revision_cliente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    finalizada: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  };
  return map[estado] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

const estadoTextoLabel = (estado) => {
  const map = {
    pendiente: 'Pendiente',
    en_progreso: 'En Progreso',
    revision_jefe: 'Revisión Jefe',
    revision_cliente: 'Revisión Cliente',
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
    case 'semana':
      const diaSemana = ahora.getDay();
      inicio.setDate(ahora.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
      inicio.setHours(0, 0, 0, 0);
      fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
      break;
    case 'mes':
      inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
      fin.setHours(23, 59, 59, 999);
      break;
    case 'trimestre':
      const trimestre = Math.floor(ahora.getMonth() / 3);
      inicio = new Date(ahora.getFullYear(), trimestre * 3, 1);
      fin = new Date(ahora.getFullYear(), (trimestre + 1) * 3, 0);
      fin.setHours(23, 59, 59, 999);
      break;
    case 'anio':
      inicio = new Date(ahora.getFullYear(), 0, 1);
      fin = new Date(ahora.getFullYear(), 11, 31);
      fin.setHours(23, 59, 59, 999);
      break;
    default:
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
  tareasFiltradas.value.forEach(tarea => {
    totalHorasNum += parseFloat(formatHorasDecimal(tarea));
  });
  
  let eficiencia = 0;
  let mensajeEficiencia = '';
  if (totalTareas > 0) {
    eficiencia = Math.round((tareasCompletadasCount / totalTareas) * 100);
    if (eficiencia >= 80) mensajeEficiencia = 'Excelente';
    else if (eficiencia >= 60) mensajeEficiencia = 'Bueno';
    else if (eficiencia >= 40) mensajeEficiencia = 'Regular';
    else mensajeEficiencia = 'Requiere mejora';
  } else {
    mensajeEficiencia = 'Sin datos';
  }
  
  const calificadas = completadas.filter(t => t.calificacion?.puntaje);
  let calificacionPromedioNum = 0;
  if (calificadas.length > 0) {
    calificacionPromedioNum = calificadas.reduce((sum, t) => sum + t.calificacion.puntaje, 0) / calificadas.length;
  }
  
  const diasEnRango = Math.max(1, Math.ceil((new Date(fechaFin.value) - new Date(fechaInicio.value)) / (1000 * 60 * 60 * 24)));
  
  resumen.value = {
    tareasCompletadas: tareasCompletadasCount,
    totalTareas: totalTareas,
    porcentajeCompletadas: totalTareas > 0 ? Math.round((tareasCompletadasCount / totalTareas) * 100) : 0,
    totalHoras: totalHorasNum.toFixed(1),
    promedioHorasPorDia: (totalHorasNum / diasEnRango).toFixed(1),
    eficiencia: eficiencia,
    mensajeEficiencia: mensajeEficiencia,
    calificacionPromedio: calificacionPromedioNum.toFixed(1),
    totalCalificaciones: calificadas.length
  };
};

const renderizarGraficos = () => {
  const tareasPorFecha = {};
  const horasPorFecha = {};
  
  tareasFiltradas.value.forEach(tarea => {
    const fecha = new Date(tarea.createdAt).toLocaleDateString('es-ES');
    tareasPorFecha[fecha] = (tareasPorFecha[fecha] || 0) + 1;
    horasPorFecha[fecha] = (horasPorFecha[fecha] || 0) + parseFloat(formatHorasDecimal(tarea));
  });
  
  const fechas = Object.keys(tareasPorFecha).sort();
  
  Object.values(charts).forEach(chart => {
    if (chart) chart.destroy();
  });
  
  if (tareasPorDiaChart.value && fechas.length) {
    charts.tareasPorDia = new Chart(tareasPorDiaChart.value.getContext('2d'), {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Tareas creadas',
          data: fechas.map(f => tareasPorFecha[f]),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }
  
  if (horasPorDiaChart.value && fechas.length) {
    charts.horasPorDia = new Chart(horasPorDiaChart.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Horas trabajadas',
          data: fechas.map(f => horasPorFecha[f]),
          backgroundColor: '#10b981',
          borderRadius: 8
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }
  
  const empleados = {};
  tareasFiltradas.value.forEach(tarea => {
    if (tarea.asignadoA?.nombre) {
      if (!empleados[tarea.asignadoA.nombre]) {
        empleados[tarea.asignadoA.nombre] = { completadas: 0, horas: 0 };
      }
      if (tarea.estado === 'finalizada') empleados[tarea.asignadoA.nombre].completadas++;
      empleados[tarea.asignadoA.nombre].horas += parseFloat(formatHorasDecimal(tarea));
    }
  });
  
  if (productividadChart.value && Object.keys(empleados).length) {
    charts.productividad = new Chart(productividadChart.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(empleados),
        datasets: [
          { label: 'Tareas completadas', data: Object.values(empleados).map(e => e.completadas), backgroundColor: '#3b82f6', borderRadius: 8 },
          { label: 'Horas trabajadas', data: Object.values(empleados).map(e => e.horas), backgroundColor: '#f59e0b', borderRadius: 8 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }
  
  const tipos = { solicitud_cliente: 0, tarea_extra: 0, asignacion_jefe: 0 };
  tareasFiltradas.value.forEach(tarea => {
    tipos[tarea.tipo] = (tipos[tarea.tipo] || 0) + 1;
  });
  
  if (distribucionChart.value) {
    charts.distribucion = new Chart(distribucionChart.value.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Clientes', 'Tareas Extra', 'Asignaciones'],
        datasets: [{ data: [tipos.solicitud_cliente, tipos.tarea_extra, tipos.asignacion_jefe], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'] }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }
};

const exportarExcel = async () => {
  exportandoExcel.value = true;
  try {
    const excelData = tareasFiltradas.value.map(tarea => ({
      'ID': tarea._id,
      'Título': tarea.titulo,
      'Descripción': tarea.descripcion || '',
      'Empleado': tarea.asignadoA?.nombre || 'Sin asignar',
      'Estado': estadoTextoLabel(tarea.estado),
      'Horas Trabajadas': formatHorasDecimal(tarea) + 'h',
      'Horas Estimadas': tarea.tiempoEstimadoEmpleado ? (tarea.tiempoEstimadoEmpleado / 60).toFixed(1) + 'h' : 'No estimado',
      'Progreso': `${tarea.porcentajeCompletado || 0}%`,
      'Calificación': tarea.calificacion?.puntaje || 'Sin calificar',
      'Comentario': tarea.calificacion?.comentario || '',
      'Fecha Creación': formatFecha(tarea.createdAt),
      'Fecha Finalización': tarea.fechaFinalizada ? formatFecha(tarea.fechaFinalizada) : ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 45 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 15 }];
    
    const resumenData = [
      { 'Métrica': 'Período', 'Valor': `${fechaInicio.value} al ${fechaFin.value}` },
      { 'Métrica': 'Fecha Exportación', 'Valor': formatFechaHora(new Date()) },
      { 'Métrica': '', 'Valor': '' },
      { 'Métrica': 'TAREAS COMPLETADAS', 'Valor': `${resumen.value.tareasCompletadas} de ${resumen.value.totalTareas} (${resumen.value.porcentajeCompletadas}%)` },
      { 'Métrica': 'Total Horas Trabajadas', 'Valor': `${resumen.value.totalHoras} horas` },
      { 'Métrica': 'Promedio Horas/Día', 'Valor': `${resumen.value.promedioHorasPorDia} horas/día` },
      { 'Métrica': 'Eficiencia del Equipo', 'Valor': `${resumen.value.eficiencia}% - ${resumen.value.mensajeEficiencia}` },
      { 'Métrica': 'Calificación Promedio', 'Valor': `${resumen.value.calificacionPromedio} ⭐` }
    ];
    const resumenWorksheet = XLSX.utils.json_to_sheet(resumenData);
    resumenWorksheet['!cols'] = [{ wch: 30 }, { wch: 40 }];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalle Tareas');
    XLSX.utils.book_append_sheet(workbook, resumenWorksheet, 'Resumen');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `reporte_tareas_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    alert('✅ Reporte exportado a Excel exitosamente');
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al exportar a Excel: ' + error.message);
  } finally {
    exportandoExcel.value = false;
  }
};

const exportarPDF = async () => {
  exportandoPDF.value = true;
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    let currentPage = 1;
    
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Reporte de Tareas', pageWidth / 2, 18, { align: 'center' });
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Control de Personal', pageWidth / 2, 28, { align: 'center' });
    
    pdf.setTextColor(0, 0, 0);
    let yPosition = 45;
    
    pdf.setFillColor(249, 250, 251);
    pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
    pdf.setFontSize(9);
    pdf.text(`Período: ${fechaInicio.value} al ${fechaFin.value}`, 20, yPosition);
    pdf.text(`Generado: ${formatFechaHora(new Date())}`, 20, yPosition + 6);
    pdf.text(`Total tareas: ${tareasFiltradas.value.length}`, 20, yPosition + 12);
    yPosition += 28;
    
    const cardWidth = (pageWidth - 40) / 4;
    const cardX = [15, 15 + cardWidth + 5, 15 + (cardWidth + 5) * 2, 15 + (cardWidth + 5) * 3];
    
    const metrics = [
      { label: 'Completadas', value: resumen.value.tareasCompletadas, sub: `${resumen.value.porcentajeCompletadas}%`, color: [59, 130, 246] },
      { label: 'Horas', value: resumen.value.totalHoras, sub: `${resumen.value.promedioHorasPorDia}h/día`, color: [16, 185, 129] },
      { label: 'Eficiencia', value: `${resumen.value.eficiencia}%`, sub: resumen.value.mensajeEficiencia, color: [139, 92, 246] },
      { label: 'Satisfacción', value: resumen.value.calificacionPromedio, sub: `${resumen.value.totalCalificaciones} calif.`, color: [245, 158, 11] }
    ];
    
    metrics.forEach((metric, i) => {
      pdf.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
      pdf.roundedRect(cardX[i], yPosition, cardWidth, 32, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.text(metric.label, cardX[i] + 4, yPosition + 8);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(metric.value), cardX[i] + 4, yPosition + 22);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(metric.sub, cardX[i] + 4, yPosition + 29);
    });
    
    yPosition += 42;
    pdf.setTextColor(0, 0, 0);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detalle de Tareas', 15, yPosition);
    yPosition += 7;
    
    const headers = [['Título', 'Empleado', 'Estado', 'Horas', 'Progreso', 'Calif.', 'Fecha']];
    const data = tareasFiltradas.value.slice(0, 25).map(tarea => [
      tarea.titulo.length > 25 ? tarea.titulo.substring(0, 22) + '...' : tarea.titulo,
      tarea.asignadoA?.nombre?.split(' ')[0] || 'N/A',
      estadoTextoLabel(tarea.estado),
      formatHorasDecimal(tarea) + 'h',
      `${tarea.porcentajeCompletado || 0}%`,
      tarea.calificacion?.puntaje ? `${tarea.calificacion.puntaje}★` : '—',
      formatFecha(tarea.createdAt)
    ]);
    
    autoTable(pdf, {
      startY: yPosition,
      head: headers,
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 28 },
        2: { cellWidth: 25 },
        3: { cellWidth: 18 },
        4: { cellWidth: 20 },
        5: { cellWidth: 16 },
        6: { cellWidth: 25 }
      },
      margin: { left: 15, right: 15 },
      didDrawPage: () => {
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Página ${currentPage}`, pageWidth - 20, pdf.internal.pageSize.getHeight() - 10);
        currentPage++;
      }
    });
    
    if (tareasFiltradas.value.length > 25) {
      const finalY = pdf.lastAutoTable.finalY + 5;
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`* Mostrando 25 de ${tareasFiltradas.value.length} tareas. Exporte a Excel para ver el listado completo.`, 15, finalY);
    }
    
    pdf.save(`reporte_tareas_${new Date().toISOString().split('T')[0]}.pdf`);
    alert('✅ Reporte exportado a PDF exitosamente');
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al exportar a PDF: ' + error.message);
  } finally {
    exportandoPDF.value = false;
  }
};

watch(periodoSeleccionado, () => {
  calcularRangoFechas();
  filtrarTareas();
});

watch(() => tarjetasStore.tarjetas, () => {
  if (tarjetasStore.tarjetas.length) {
    filtrarTareas();
  }
}, { deep: true });

onMounted(() => {
  calcularRangoFechas();
  if (tarjetasStore.tarjetas.length) {
    filtrarTareas();
  }
});
</script>

<style scoped>
.reportes-avanzados {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>