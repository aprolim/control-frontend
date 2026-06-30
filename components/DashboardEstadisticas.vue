<template>
  <div class="dashboard-estadisticas p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
    <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">📊 Dashboard de Métricas</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">Tareas Activas</div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ tareasActivasCount }}</div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">Horas Trabajadas (30d)</div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalHoras30d }}h</div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">Eficiencia Promedio</div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ eficienciaPromedio }}%</div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">Calificación Promedio</div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ calificacionPromedio }} ★</div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold mb-4 text-gray-800 dark:text-white">Tareas por Estado</h3>
        <canvas ref="estadoChart"></canvas>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold mb-4 text-gray-800 dark:text-white">Horas Trabajadas por Día</h3>
        <canvas ref="horasChart"></canvas>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold mb-4 text-gray-800 dark:text-white">Productividad por Empleado</h3>
        <canvas ref="productividadChart"></canvas>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold mb-4 text-gray-800 dark:text-white">Tareas Nocturnas</h3>
        <canvas ref="nocturnasChart"></canvas>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
        <h3 class="font-semibold mb-4 text-gray-800 dark:text-white">Velocidad del Equipo (Burndown)</h3>
        <canvas ref="burndownChart"></canvas>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
        <h3 class="font-semibold mb-4 text-gray-800 dark:text-white">Heatmap de Productividad por Hora</h3>
        <div class="grid grid-cols-24 gap-1">
          <div
            v-for="hora in 24"
            :key="hora"
            class="h-8 rounded transition-all hover:scale-110"
            :style="{ backgroundColor: getHeatmapColor(hora - 1) }"
            :title="`${hora - 1}:00 - ${productividadPorHora[hora - 1] || 0} registros`"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>0:00</span>
          <span>6:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
    
    <div v-if="estadisticas?.toleranciasPendientes > 0" class="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-semibold text-yellow-800 dark:text-yellow-200">Hay {{ estadisticas.toleranciasPendientes }} tolerancias pendientes de aprobación</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTarjetasStore } from '~/stores/tarjetas';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const tarjetasStore = useTarjetasStore();
const estadisticas = computed(() => tarjetasStore.estadisticas);

const tareasActivasCount = computed(() => {
  return tarjetasStore.tarjetas.filter(t => t.estado !== 'completada').length;
});

const totalHoras30d = computed(() => {
  if (!estadisticas.value?.horasPorDia) return 0;
  return estadisticas.value.horasPorDia.reduce((sum, d) => sum + d.totalHoras, 0);
});

const eficienciaPromedio = computed(() => {
  if (!estadisticas.value?.productividadEmpleados?.length) return 0;
  const total = estadisticas.value.productividadEmpleados.reduce((sum, e) => {
    const eficiencia = e.horasTotales > 0 ? (e.tareasCompletadas / (e.horasTotales / 8)) * 100 : 0;
    return sum + eficiencia;
  }, 0);
  return Math.round(total / estadisticas.value.productividadEmpleados.length);
});

const calificacionPromedio = computed(() => {
  const tarjetasCalificadas = tarjetasStore.tarjetas.filter(t => t.calificacion?.puntaje);
  if (!tarjetasCalificadas.length) return 0;
  const total = tarjetasCalificadas.reduce((sum, t) => sum + t.calificacion.puntaje, 0);
  return (total / tarjetasCalificadas.length).toFixed(1);
});

const productividadPorHora = ref({});
const estadoChart = ref(null);
const horasChart = ref(null);
const productividadChart = ref(null);
const nocturnasChart = ref(null);
const burndownChart = ref(null);

const cargarHeatmap = () => {
  const horas = {};
  tarjetasStore.tarjetas.forEach(tarjeta => {
    tarjeta.registroHoras?.forEach(registro => {
      if (registro.inicioTrabajo) {
        const hora = new Date(registro.inicioTrabajo).getHours();
        horas[hora] = (horas[hora] || 0) + 1;
      }
    });
  });
  productividadPorHora.value = horas;
};

const getHeatmapColor = (hora) => {
  const count = productividadPorHora.value[hora] || 0;
  const max = Math.max(...Object.values(productividadPorHora.value), 1);
  const intensity = count / max;
  return `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
};

const renderCharts = () => {
  if (!estadisticas.value) return;
  
  if (estadoChart.value && estadisticas.value.tareasPorEstado?.length) {
    const ctx = estadoChart.value.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: estadisticas.value.tareasPorEstado.map(e => {
            const map = { pendiente: 'Pendientes', en_progreso: 'En Progreso', en_revision: 'En Revisión', completada: 'Completadas' };
            return map[e._id] || e._id;
          }),
          datasets: [{
            data: estadisticas.value.tareasPorEstado.map(e => e.count),
            backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981']
          }]
        }
      });
    }
  }
  
  if (horasChart.value && estadisticas.value.horasPorDia?.length) {
    const ctx = horasChart.value.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: estadisticas.value.horasPorDia.map(h => h._id),
          datasets: [{
            label: 'Horas trabajadas',
            data: estadisticas.value.horasPorDia.map(h => h.totalHoras),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true
        }
      });
    }
  }
  
  if (productividadChart.value && estadisticas.value.productividadEmpleados?.length) {
    const ctx = productividadChart.value.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: estadisticas.value.productividadEmpleados.map(e => e.empleado[0]?.nombre || 'Sin nombre'),
          datasets: [{
            label: 'Tareas completadas',
            data: estadisticas.value.productividadEmpleados.map(e => e.tareasCompletadas),
            backgroundColor: '#10b981'
          }, {
            label: 'Calificación promedio',
            data: estadisticas.value.productividadEmpleados.map(e => e.calificacionPromedio || 0),
            backgroundColor: '#f59e0b',
            type: 'line'
          }]
        }
      });
    }
  }
  
  if (nocturnasChart.value && estadisticas.value.tareasNocturnas?.length) {
    const ctx = nocturnasChart.value.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: estadisticas.value.tareasNocturnas.map(n => n._id),
          datasets: [{
            label: 'Tareas que cruzaron medianoche',
            data: estadisticas.value.tareasNocturnas.map(n => n.count),
            backgroundColor: '#f59e0b'
          }]
        }
      });
    }
  }
  
  if (burndownChart.value && estadisticas.value.burndown?.length) {
    let acumulado = 0;
    const pendientes = [];
    estadisticas.value.burndown.forEach(dia => {
      acumulado += dia.nuevas - dia.completadas;
      pendientes.push(acumulado);
    });
    
    const ctx = burndownChart.value.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: estadisticas.value.burndown.map(b => b._id),
          datasets: [{
            label: 'Tareas pendientes',
            data: pendientes,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true
          }]
        }
      });
    }
  }
};

watch(estadisticas, () => {
  renderCharts();
}, { deep: true });

onMounted(async () => {
  await tarjetasStore.fetchEstadisticas();
  cargarHeatmap();
  renderCharts();
});
</script>

<style scoped>
.grid-cols-24 {
  grid-template-columns: repeat(24, minmax(0, 1fr));
}
</style>