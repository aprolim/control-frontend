<template>
  <div class="space-y-6">
    
    <!-- ============================================================ -->
    <!-- HEADER                                                        -->
    <!-- ============================================================ -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Resumen general del sistema · Últimos 30 días
        </p>
      </div>
      
      <button
        @click="cargarDatos"
        :disabled="cargando"
        class="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition shadow-sm"
      >
        <svg class="w-4 h-4" :class="{ 'animate-spin': cargando }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ cargando ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>
    
    <!-- ============================================================ -->
    <!-- KPIs PRINCIPALES                                              -->
    <!-- ============================================================ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- KPI 1: Tareas activas -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Ahora
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ kpis.tareasActivas }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tareas activas</p>
      </div>
      
      <!-- KPI 2: Tareas pendientes -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span v-if="kpis.tareasPendientes > 0" class="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Sin asignar
          </span>
          <span v-else class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Al día
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ kpis.tareasPendientes }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tareas pendientes</p>
      </div>
      
      <!-- KPI 3: Eficiencia promedio -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span 
            class="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
            :class="eficienciaBadgeClass"
          >
            {{ eficienciaLabel }}
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ kpis.eficiencia }}%</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Eficiencia promedio</p>
      </div>
      
      <!-- KPI 4: Calificación -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
            {{ kpis.totalCalificaciones }} calif.
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ kpis.calificacionPromedio }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Calificación promedio</p>
      </div>
    </div>
    
    <!-- ============================================================ -->
    <!-- GRÁFICOS                                                      -->
    <!-- ============================================================ -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      
      <!-- Distribución por estado (barras horizontales) -->
      <div class="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Distribución por estado</h3>
          <span class="text-xs text-gray-500 dark:text-gray-400 tabular-nums">{{ totalDistribucion }} total</span>
        </div>
        
        <div class="space-y-3">
          <div v-for="item in distribucionEstados" :key="item.key">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :class="item.dotClass"></span>
                <span class="text-gray-700 dark:text-gray-300 font-medium">{{ item.label }}</span>
              </div>
              <span class="text-gray-900 dark:text-white font-bold tabular-nums">
                {{ item.value }}
                <span class="text-gray-400 dark:text-gray-500 font-normal">/ {{ item.porcentaje }}%</span>
              </span>
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div 
                class="h-1.5 rounded-full transition-all duration-700"
                :class="item.barClass"
                :style="{ width: `${item.porcentaje}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- Mensaje si no hay datos -->
        <div v-if="totalDistribucion === 0" class="text-center py-8">
          <p class="text-xs text-gray-400 dark:text-gray-500">Sin tareas registradas</p>
        </div>
      </div>
      
      <!-- Horas trabajadas últimos 7 días -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Horas trabajadas</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Últimos 7 días</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-gray-900 dark:text-white tabular-nums">{{ totalHorasSemana }}h</p>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
          </div>
        </div>
        
        <div class="h-48">
          <canvas ref="horasChart"></canvas>
        </div>
        
        <div v-if="horasPorDia.length === 0" class="text-center py-12">
          <p class="text-xs text-gray-400 dark:text-gray-500">Sin datos de horas</p>
        </div>
      </div>
    </div>
    
    <!-- ============================================================ -->
    <!-- PRODUCTIVIDAD POR TÉCNICO                                     -->
    <!-- ============================================================ -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Productividad por técnico</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tareas completadas y tiempo promedio</p>
        </div>
        <span class="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {{ productividadTecnicos.length }} {{ productividadTecnicos.length === 1 ? 'técnico' : 'técnicos' }}
        </span>
      </div>
      
      <!-- Sin técnicos -->
      <div v-if="productividadTecnicos.length === 0" class="text-center py-10">
        <div class="w-14 h-14 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Sin datos de productividad</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Los datos aparecerán cuando haya tareas completadas</p>
      </div>
      
      <!-- Grid de técnicos -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div 
          v-for="tec in productividadTecnicos" 
          :key="tec._id"
          class="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span class="text-xs font-semibold text-white">{{ tec.nombre?.charAt(0) || '?' }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-sm text-gray-900 dark:text-white truncate">{{ tec.nombre }}</p>
              <p class="text-[10px] text-gray-500 dark:text-gray-400">{{ tec.rol }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
              <p class="text-lg font-bold text-gray-900 dark:text-white tabular-nums">{{ tec.tareasCompletadas }}</p>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Completadas</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
              <p class="text-lg font-bold text-gray-900 dark:text-white tabular-nums">{{ tec.promedioMinutos }}<span class="text-xs font-normal text-gray-500 dark:text-gray-400">m</span></p>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Promedio</p>
            </div>
          </div>
          
          <!-- Barra de progreso de eficiencia -->
          <div class="mt-3">
            <div class="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
              <span class="uppercase tracking-wide font-semibold">Eficiencia</span>
              <span class="font-bold tabular-nums" :class="getEficienciaColorClass(tec.eficiencia)">
                {{ tec.eficiencia }}%
              </span>
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div 
                class="h-1.5 rounded-full transition-all duration-700"
                :class="getEficienciaBarClass(tec.eficiencia)"
                :style="{ width: `${Math.min(100, tec.eficiencia)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ============================================================ -->
    <!-- ALERTAS                                                       -->
    <!-- ============================================================ -->
    <div v-if="kpis.tareasPendientes > 3" 
         class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
      <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <p class="font-semibold text-amber-800 dark:text-amber-200 text-sm">
          Hay {{ kpis.tareasPendientes }} tareas pendientes sin asignar
        </p>
        <p class="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
          Considera asignarlas a un técnico para reducir la carga acumulada.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useTarjetasStore } from '~/stores/tarjetas';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const tarjetasStore = useTarjetasStore();
const cargando = ref(false);
const ahora = ref(Date.now());

let horasChartInstance = null;
let intervaloTiempo = null;

// ============================================================
// COMPUTED - KPIs
// ============================================================

const kpis = computed(() => {
  const tarjetas = tarjetasStore.tarjetas || [];
  
  const tareasActivas = tarjetas.filter(t => 
    t.estado === 'en_progreso' && t.estadoProgreso === 'activa'
  ).length;
  
  const tareasPendientes = tarjetas.filter(t => t.estado === 'pendiente').length;
  
  const completadas = tarjetas.filter(t => 
    t.estado === 'finalizada' || 
    t.estado === 'revision_cliente' ||
    t.estado === 'revision_supervisor'
  );
  
  const calificadas = completadas.filter(t => t.calificacion?.puntaje);
  const calificacionPromedio = calificadas.length > 0 
    ? (calificadas.reduce((sum, t) => sum + t.calificacion.puntaje, 0) / calificadas.length).toFixed(1)
    : '—';
  
  // Eficiencia: % de tareas completadas sobre el total de tareas no pendientes
  const tareasEnSistema = tarjetas.filter(t => t.estado !== 'pendiente').length;
  const eficiencia = tareasEnSistema > 0 
    ? Math.round((completadas.length / tareasEnSistema) * 100) 
    : 0;
  
  return {
    tareasActivas,
    tareasPendientes,
    eficiencia,
    calificacionPromedio,
    totalCalificaciones: calificadas.length
  };
});

const eficienciaLabel = computed(() => {
  const e = kpis.value.eficiencia;
  if (e >= 80) return 'Excelente';
  if (e >= 60) return 'Buena';
  if (e >= 40) return 'Regular';
  return 'Baja';
});

const eficienciaBadgeClass = computed(() => {
  const e = kpis.value.eficiencia;
  if (e >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30';
  if (e >= 60) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
  if (e >= 40) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30';
  return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
});

// ============================================================
// COMPUTED - Distribución por estado
// ============================================================

const distribucionEstados = computed(() => {
  const tarjetas = tarjetasStore.tarjetas || [];
  const total = tarjetas.length;
  
  const cuenta = (filterFn) => tarjetas.filter(filterFn).length;
  
  const items = [
    {
      key: 'pendiente',
      label: 'Pendientes',
      value: cuenta(t => t.estado === 'pendiente'),
      dotClass: 'bg-gray-400',
      barClass: 'bg-gray-400'
    },
    {
      key: 'asignado',
      label: 'Asignados',
      value: cuenta(t => t.estado === 'en_progreso' && t.estadoProgreso !== 'activa'),
      dotClass: 'bg-purple-500',
      barClass: 'bg-purple-500'
    },
    {
      key: 'activa',
      label: 'En progreso',
      value: cuenta(t => t.estado === 'en_progreso' && t.estadoProgreso === 'activa'),
      dotClass: 'bg-blue-500',
      barClass: 'bg-blue-500'
    },
    {
      key: 'finalizada',
      label: 'Finalizadas',
      value: cuenta(t => 
        t.estado === 'finalizada' || 
        t.estado === 'revision_cliente' ||
        t.estado === 'revision_supervisor'
      ),
      dotClass: 'bg-emerald-500',
      barClass: 'bg-emerald-500'
    }
  ];
  
  return items.map(item => ({
    ...item,
    porcentaje: total > 0 ? Math.round((item.value / total) * 100) : 0
  }));
});

const totalDistribucion = computed(() => {
  return distribucionEstados.value.reduce((sum, i) => sum + i.value, 0);
});

// ============================================================
// COMPUTED - Horas por día
// ============================================================

const horasPorDia = computed(() => {
  const tarjetas = tarjetasStore.tarjetas || [];
  const hoy = new Date();
  const hace7Dias = new Date(hoy);
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  
  const dias = {};
  
  // Inicializar últimos 7 días en 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dias[key] = 0;
  }
  
  // Sumar horas de cada tarea finalizada
  tarjetas.forEach(t => {
    if (t.estado === 'finalizada' && t.fechaFinalizada) {
      const fecha = new Date(t.fechaFinalizada).toISOString().split('T')[0];
      if (dias[fecha] !== undefined) {
        const minutos = (t.horasTotalesReales || 0) * 60 + (t.minutosTotalesReales || 0);
        dias[fecha] += minutos / 60;
      }
    }
  });
  
  return Object.entries(dias).map(([fecha, horas]) => ({
    fecha,
    horas: parseFloat(horas.toFixed(1))
  }));
});

const totalHorasSemana = computed(() => {
  return horasPorDia.value.reduce((sum, d) => sum + d.horas, 0).toFixed(1);
});

// ============================================================
// COMPUTED - Productividad por técnico
// ============================================================

const productividadTecnicos = computed(() => {
  const tarjetas = tarjetasStore.tarjetas || [];
  const porTecnico = {};
  
  tarjetas.forEach(t => {
    if (t.estado === 'finalizada' && t.asignadoA) {
      const id = t.asignadoA._id || t.asignadoA;
      const nombre = t.asignadoA.nombre || 'Sin nombre';
      const rol = t.asignadoA.rol || 'tecnico';
      
      if (!porTecnico[id]) {
        porTecnico[id] = {
          _id: id,
          nombre,
          rol,
          tareasCompletadas: 0,
          totalMinutos: 0,
          tiempoEstimadoTotal: 0
        };
      }
      
      porTecnico[id].tareasCompletadas++;
      
      const minutos = (t.horasTotalesReales || 0) * 60 + (t.minutosTotalesReales || 0);
      porTecnico[id].totalMinutos += minutos;
      porTecnico[id].tiempoEstimadoTotal += t.tiempoEstimadoEmpleado || 0;
    }
  });
  
  return Object.values(porTecnico)
    .map(tec => {
      const promedioMinutos = tec.tareasCompletadas > 0 
        ? Math.round(tec.totalMinutos / tec.tareasCompletadas) 
        : 0;
      
      // Eficiencia: qué tan cerca estuvo el tiempo real del estimado
      // 100% = trabajó exactamente el tiempo estimado
      // >100% = se pasó del tiempo (menos eficiente)
      // <100% = fue más rápido (más eficiente)
      const eficiencia = tec.tiempoEstimadoTotal > 0
        ? Math.round((tec.tiempoEstimadoTotal / tec.totalMinutos) * 100)
        : 100;
      
      return {
        ...tec,
        promedioMinutos,
        eficiencia: Math.max(0, Math.min(200, eficiencia))
      };
    })
    .sort((a, b) => b.tareasCompletadas - a.tareasCompletadas);
});

const getEficienciaColorClass = (eficiencia) => {
  if (eficiencia >= 100) return 'text-emerald-600 dark:text-emerald-400';
  if (eficiencia >= 80) return 'text-blue-600 dark:text-blue-400';
  if (eficiencia >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const getEficienciaBarClass = (eficiencia) => {
  if (eficiencia >= 100) return 'bg-emerald-500';
  if (eficiencia >= 80) return 'bg-blue-500';
  if (eficiencia >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

// ============================================================
// GRÁFICO: Horas por día
// ============================================================

const horasChart = ref(null);

const renderHorasChart = () => {
  if (!horasChart.value) return;
  
  const ctx = horasChart.value.getContext('2d');
  if (!ctx) return;
  
  if (horasChartInstance) {
    horasChartInstance.destroy();
  }
  
  const labels = horasPorDia.value.map(d => {
    const fecha = new Date(d.fecha + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit' });
  });
  
  const data = horasPorDia.value.map(d => d.horas);
  
  horasChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Horas',
        data,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 'flex',
        maxBarThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          padding: 10,
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 12 },
          displayColors: false,
          callbacks: {
            label: (context) => `${context.parsed.y} horas`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(156, 163, 175, 0.15)',
            drawBorder: false
          },
          ticks: {
            font: { size: 10 },
            color: '#9CA3AF',
            callback: (value) => `${value}h`
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 10 },
            color: '#9CA3AF'
          }
        }
      }
    }
  });
};

// ============================================================
// ACCIONES
// ============================================================

const cargarDatos = async () => {
  cargando.value = true;
  try {
    await tarjetasStore.fetchTarjetas();
    await tarjetasStore.fetchEstadisticas();
  } catch (error) {
    console.error('❌ Error cargando datos:', error);
  } finally {
    cargando.value = false;
  }
};

// ============================================================
// WATCHERS
// ============================================================

watch(horasPorDia, () => {
  setTimeout(renderHorasChart, 100);
}, { deep: true });

watch(() => tarjetasStore.tarjetas, () => {
  setTimeout(renderHorasChart, 100);
}, { deep: true });

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  await cargarDatos();
  setTimeout(renderHorasChart, 200);
  
  // Actualizar cada 30s (por si hay cambios en tareas)
  intervaloTiempo = setInterval(() => {
    ahora.value = Date.now();
  }, 30000);
});

onUnmounted(() => {
  if (horasChartInstance) {
    horasChartInstance.destroy();
    horasChartInstance = null;
  }
  if (intervaloTiempo) {
    clearInterval(intervaloTiempo);
    intervaloTiempo = null;
  }
});
</script>

<style scoped>
/* Ajuste para el canvas */
canvas {
  max-height: 100%;
}
</style>