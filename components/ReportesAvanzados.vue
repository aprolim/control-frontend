<template>
  <div class="reportes-avanzados space-y-6">
    <!-- ============================================================ -->
    <!-- HEADER CON FILTROS                                            -->
    <!-- ============================================================ -->
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Reportes y Estadísticas</h1>
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
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            ]"
          >
            {{ periodo.label }}
          </button>
        </div>
      </div>
      
      <div class="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Desde:</span>
            <input
              v-model="fechaInicio"
              type="date"
              class="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Hasta:</span>
            <input
              v-model="fechaFin"
              type="date"
              class="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            @click="aplicarFechasPersonalizadas"
            class="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
          >
            Aplicar
          </button>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="exportarExcel"
            :disabled="exportandoExcel"
            class="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ exportandoExcel ? 'Exportando...' : 'Excel' }}
          </button>
          <button
            @click="exportarPDF"
            :disabled="exportandoPDF"
            class="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ exportandoPDF ? 'Exportando...' : 'PDF' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- MÉTRICAS DE HOY (DASHBOARD DEL DÍA)                           -->
    <!-- ============================================================ -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">📅 Hoy</h2>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ fechaHoy }}</span>
      </div>
      
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Tareas creadas hoy -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span class="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Nuevas
            </span>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ metricasHoy.creadas }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tareas creadas hoy</p>
        </div>
        
        <!-- Tareas completadas hoy -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span 
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
              :class="metricasHoy.completadas > 0 
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
                : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'"
            >
              {{ metricasHoy.completadas > 0 ? 'Activo' : 'Sin actividad' }}
            </span>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ metricasHoy.completadas }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tareas completadas hoy</p>
        </div>
        
        <!-- Horas trabajadas hoy -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ metricasHoy.horasFormateadas }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Horas trabajadas hoy</p>
        </div>
        
        <!-- Eficiencia de hoy -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span 
              v-if="metricasHoy.eficiencia !== null"
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
              :class="getEficienciaBadgeClass(metricasHoy.eficiencia)"
            >
              {{ getEficienciaLabel(metricasHoy.eficiencia) }}
            </span>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {{ metricasHoy.eficiencia !== null ? metricasHoy.eficiencia + '%' : '—' }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Eficiencia de tiempo hoy</p>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- MÉTRICAS DEL RANGO SELECCIONADO                               -->
    <!-- ============================================================ -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">📊 Período</h2>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ fechaInicio }} → {{ fechaFin }} ({{ diasEnRango }} días)
        </span>
      </div>
      
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-blue-100 text-xs">Total tareas</p>
              <p class="text-3xl font-bold mt-1 tabular-nums">{{ resumen.totalTareas }}</p>
            </div>
            <div class="text-3xl opacity-80">📋</div>
          </div>
          <p class="text-blue-100 text-[10px] mt-2">
            {{ resumen.tareasCompletadas }} completadas · {{ resumen.tareasPendientes }} pendientes
          </p>
        </div>
        
        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-emerald-100 text-xs">Horas trabajadas</p>
              <p class="text-3xl font-bold mt-1 tabular-nums">{{ resumen.totalHorasFormateado }}</p>
            </div>
            <div class="text-3xl opacity-80">⏱️</div>
          </div>
          <p class="text-emerald-100 text-[10px] mt-2">
            Promedio: {{ resumen.promedioHorasPorDia }} por día
          </p>
        </div>
        
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-purple-100 text-xs">Eficiencia de tiempo</p>
              <p class="text-3xl font-bold mt-1 tabular-nums">
                {{ resumen.eficienciaTiempo !== null ? resumen.eficienciaTiempo + '%' : '—' }}
              </p>
            </div>
            <div class="text-3xl opacity-80">📈</div>
          </div>
          <p class="text-purple-100 text-[10px] mt-2">{{ resumen.mensajeEficiencia }}</p>
        </div>
        
        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-lg">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-amber-100 text-xs">Satisfacción</p>
              <p class="text-3xl font-bold mt-1 tabular-nums">{{ resumen.calificacionPromedio }}</p>
            </div>
            <div class="text-3xl opacity-80">⭐</div>
          </div>
          <p class="text-amber-100 text-[10px] mt-2">
            Basado en {{ resumen.totalCalificaciones }} calificación(es)
          </p>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- TOP TÉCNICOS (NUEVO SISTEMA DE SCORE)                         -->
    <!-- ============================================================ -->
    <div v-if="topTecnicos.length > 0">
      <div class="flex items-center gap-2 mb-3">
        <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">🏆 Ranking de técnicos</h2>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          Score = dificultad × eficiencia (pondera tareas complejas)
        </span>
      </div>
      
      <!-- Ranking principal por SCORE -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div 
          v-for="(tec, index) in topTecnicos" 
          :key="tec._id"
          class="border rounded-lg p-4 hover:shadow-md transition relative"
          :class="index === 0 
            ? 'border-amber-400 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-900' 
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'"
        >
          <!-- Badge MVP -->
          <div v-if="index === 0" class="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
            🏆 MVP
          </div>
          
          <div class="flex items-center gap-3 mb-3">
            <div 
              class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-base"
              :class="index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'"
            >
              {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1 }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-sm text-gray-900 dark:text-white truncate">{{ tec.nombre }}</p>
              <p class="text-[10px] text-gray-500 dark:text-gray-400">
                {{ tec.tareasCompletadas }} tarea(s) · Score: <strong class="text-gray-900 dark:text-white">{{ tec.puntajeRedondeado }}</strong>
              </p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
              <p class="text-base font-bold text-gray-900 dark:text-white tabular-nums">{{ tec.horasFormateadas }}</p>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Horas</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
              <p 
                class="text-base font-bold tabular-nums"
                :class="tec.eficiencia === null ? 'text-gray-400' : tec.eficiencia >= 110 ? 'text-emerald-600 dark:text-emerald-400' : tec.eficiencia >= 90 ? 'text-blue-600 dark:text-blue-400' : tec.eficiencia >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'"
              >
                {{ tec.eficiencia !== null ? tec.eficiencia + '%' : '—' }}
              </p>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Eficiencia</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mini-rankings por categoría -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Más tareas completadas -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-base">🎯</span>
            <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Más tareas</h3>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(tec, i) in topPorTareas" 
              :key="tec._id" 
              class="flex items-center gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <span 
                class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                :class="i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
              >
                {{ i + 1 }}
              </span>
              <span class="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{{ tec.nombre }}</span>
              <span class="text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums">{{ tec.tareasCompletadas }}</span>
            </div>
          </div>
        </div>
        
        <!-- Más horas trabajadas -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-base">🕐</span>
            <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Más horas</h3>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(tec, i) in topPorHoras" 
              :key="tec._id" 
              class="flex items-center gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <span 
                class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                :class="i === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
              >
                {{ i + 1 }}
              </span>
              <span class="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{{ tec.nombre }}</span>
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{{ tec.horasFormateadas }}</span>
            </div>
          </div>
        </div>
        
        <!-- Más eficiente -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-base">⚡</span>
            <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Más eficiente</h3>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(tec, i) in topPorEficiencia" 
              :key="tec._id" 
              class="flex items-center gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <span 
                class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                :class="i === 0 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
              >
                {{ i + 1 }}
              </span>
              <span class="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{{ tec.nombre }}</span>
              <span class="text-xs font-bold text-purple-600 dark:text-purple-400 tabular-nums">{{ tec.eficiencia }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- GRÁFICOS                                                      -->
    <!-- ============================================================ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Flujo de tareas</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Creadas vs completadas por día</p>
          </div>
        </div>
        <div class="h-56">
          <canvas ref="tareasPorDiaChart"></canvas>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Horas trabajadas por día</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Distribución diaria de esfuerzo</p>
          </div>
        </div>
        <div class="h-56">
          <canvas ref="horasPorDiaChart"></canvas>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Productividad por técnico</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tareas completadas y horas trabajadas</p>
          </div>
        </div>
        <div class="h-56">
          <canvas ref="productividadChart"></canvas>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Distribución por tipo</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">De dónde vienen las tareas</p>
          </div>
        </div>
        <div class="h-56">
          <canvas ref="distribucionChart"></canvas>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- TABLA DE DETALLE                                              -->
    <!-- ============================================================ -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          📋 Detalle de tareas
          <span class="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">({{ tareasFiltradas.length }} registros)</span>
        </h3>
      </div>
      <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 text-left text-[11px] text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Título</th>
              <th class="px-4 py-3 text-left text-[11px] text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Empleado</th>
              <th class="px-4 py-3 text-left text-[11px] text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Estado</th>
              <th class="px-4 py-3 text-left text-[11px] text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Horas</th>
              <th class="px-4 py-3 text-left text-[11px] text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Progreso</th>
              <th class="px-4 py-3 text-left text-[11px] text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Calif.</th>
              <th class="px-4 py-3 text-left text-[11px] text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Fecha</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-if="tareasFiltradas.length === 0">
              <td colspan="7" class="px-4 py-10 text-center text-gray-400 dark:text-gray-500 text-xs">
                Sin tareas en el período
              </td>
            </tr>
            <tr v-for="tarea in tareasFiltradas" :key="tarea._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
              <td class="px-4 py-2.5 text-gray-900 dark:text-white text-xs font-medium max-w-[200px] truncate">{{ tarea.titulo }}</td>
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
                    <div 
                      class="rounded-full h-1 transition-all duration-500"
                      :class="tarea.estadoProgreso === 'activa' ? 'bg-emerald-500' : (tarea.estado === 'finalizada' ? 'bg-emerald-500' : 'bg-blue-500')"
                      :style="{ width: `${calcularProgresoEnVivo(tarea)}%` }"
                    ></div>
                  </div>
                  <span 
                    class="text-[10px] font-medium tabular-nums"
                    :class="tarea.estadoProgreso === 'activa' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'"
                  >
                    {{ calcularProgresoEnVivo(tarea) }}%
                  </span>
                </div>
              </td>
              <td class="px-4 py-2.5">
                <span v-if="tarea.calificacion?.puntaje" class="flex items-center gap-1">
                  <span class="text-amber-500 text-xs">★</span>
                  <span class="text-xs font-bold text-gray-900 dark:text-white">{{ tarea.calificacion.puntaje }}</span>
                </span>
                <span v-else-if="tarea.calificacion?.autoFinalizada" class="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">Auto</span>
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
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useTarjetasStore } from '~/stores/tarjetas';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(...registerables);

const tarjetasStore = useTarjetasStore();

// ============================================================
// REF REACTIVO PARA RECÁLCULO EN VIVO
// ============================================================
const ahora = ref(Date.now());
let intervaloTick = null;

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

// ============================================================
// MÉTRICAS
// ============================================================

const resumen = ref({
  tareasCompletadas: 0,
  tareasPendientes: 0,
  totalTareas: 0,
  totalHorasFormateado: '0h',
  promedioHorasPorDia: '0h',
  eficienciaTiempo: null,
  mensajeEficiencia: 'Sin datos',
  calificacionPromedio: '0.0',
  totalCalificaciones: 0
});

const metricasHoy = ref({
  creadas: 0,
  completadas: 0,
  horasFormateadas: '0h',
  eficiencia: null
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
// UTILIDADES DE FECHAS
// ============================================================

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

const fechaHoy = computed(() => {
  return new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
});

const diasEnRango = computed(() => {
  const inicioDate = parseFechaLocalInicio(fechaInicio.value);
  const finDate = parseFechaLocalFin(fechaFin.value);
  return Math.max(1, Math.round((finDate - inicioDate) / (1000 * 60 * 60 * 24)) + 1);
});

// ============================================================
// FORMATO DE HORAS
// ============================================================

const formatMinutos = (minutos) => {
  if (!minutos || minutos === 0) return '0h';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

const formatHoras = (tarea) => {
  const totalMinutos = calcularMinutosReales(tarea);
  return formatMinutos(totalMinutos);
};

const formatFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

// ============================================================
// CÁLCULO DE PROGRESO Y MINUTOS EN VIVO
// ============================================================

const calcularProgresoEnVivo = (tarea) => {
  if (!tarea) return 0;
  
  if (tarea.estado === 'finalizada' || tarea.estado === 'revision_cliente') {
    return 100;
  }
  
  if (!tarea.tiempoEstimadoEmpleado || tarea.tiempoEstimadoEmpleado <= 0) {
    return tarea.porcentajeCompletado || 0;
  }
  
  const tiempoEstimado = tarea.tiempoEstimadoEmpleado;
  let tiempoTotal = tarea.tiempoAcumulado || 0;
  
  if (tarea.estadoProgreso === 'activa' && tarea.fechaUltimaReanudacion) {
    const inicio = new Date(tarea.fechaUltimaReanudacion).getTime();
    const minutosDesdeReanudacion = Math.floor((ahora.value - inicio) / 1000 / 60);
    tiempoTotal += minutosDesdeReanudacion;
  }
  
  let progreso = Math.min(100, Math.floor((tiempoTotal / tiempoEstimado) * 100));
  progreso = Math.max(progreso, tarea.porcentajeCompletado || 0);
  
  return Math.min(100, progreso);
};

const calcularMinutosReales = (tarea) => {
  if (!tarea) return 0;
  
  if (tarea.estadoProgreso === 'activa' && tarea.fechaUltimaReanudacion) {
    let tiempoTotal = tarea.tiempoAcumulado || 0;
    const inicio = new Date(tarea.fechaUltimaReanudacion).getTime();
    const minutosDesdeReanudacion = Math.floor((ahora.value - inicio) / 1000 / 60);
    return tiempoTotal + minutosDesdeReanudacion;
  }
  
  if (tarea.estado === 'finalizada' || tarea.estado === 'revision_cliente') {
    if (tarea.tiempoAcumulado && tarea.tiempoAcumulado > 0) return tarea.tiempoAcumulado;
    if (tarea.horasTotalesReales || tarea.minutosTotalesReales) {
      return (tarea.horasTotalesReales || 0) * 60 + (tarea.minutosTotalesReales || 0);
    }
    if (tarea.registroHoras?.length) {
      return tarea.registroHoras.reduce((sum, reg) => {
        return sum + (reg.horasTrabajadas * 60) + (reg.minutosTrabajados || 0);
      }, 0);
    }
  }
  
  if (tarea.tiempoAcumulado && tarea.tiempoAcumulado > 0) return tarea.tiempoAcumulado;
  if (tarea.tiempoEstimadoEmpleado > 0 && tarea.porcentajeCompletado > 0) {
    return Math.round((tarea.tiempoEstimadoEmpleado * tarea.porcentajeCompletado) / 100);
  }
  
  return 0;
};

// ============================================================
// CÁLCULO DE EFICIENCIA
// ============================================================

const calcularEficienciaTiempo = (tareas) => {
  const validas = tareas.filter(t => {
    if (t.estado !== 'finalizada' && t.estado !== 'revision_cliente') return false;
    if (!t.tiempoEstimadoEmpleado || t.tiempoEstimadoEmpleado <= 0) return false;
    const tiempoReal = calcularMinutosReales(t);
    return tiempoReal > 0;
  });
  
  if (validas.length === 0) return null;
  
  const suma = validas.reduce((sum, t) => {
    const tiempoEstimado = t.tiempoEstimadoEmpleado;
    const tiempoReal = calcularMinutosReales(t);
    return sum + (tiempoEstimado / tiempoReal);
  }, 0);
  
  return Math.round((suma / validas.length) * 100);
};

const getEficienciaLabel = (eficiencia) => {
  if (eficiencia === null) return 'Sin datos';
  if (eficiencia >= 110) return 'Rápido';
  if (eficiencia >= 90) return 'En tiempo';
  if (eficiencia >= 70) return 'Algo lento';
  return 'Lento';
};

const getEficienciaBadgeClass = (eficiencia) => {
  if (eficiencia === null) return 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
  if (eficiencia >= 110) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30';
  if (eficiencia >= 90) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
  if (eficiencia >= 70) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30';
  return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
};

// ============================================================
// TOP TÉCNICOS CON SCORE PONDERADO POR DIFICULTAD
// ============================================================

const tecnicosProcesados = computed(() => {
  const porTecnico = {};
  
  tareasFiltradas.value.forEach(t => {
    if (!t.asignadoA) return;
    const id = t.asignadoA._id || t.asignadoA;
    const nombre = t.asignadoA.nombre || 'Sin nombre';
    
    if (!porTecnico[id]) {
      porTecnico[id] = {
        _id: id,
        nombre,
        tareasCompletadas: 0,
        totalMinutos: 0,
        puntajeTotal: 0,
        tareasParaEficiencia: []
      };
    }
    
    if (t.estado === 'finalizada' || t.estado === 'revision_cliente') {
      porTecnico[id].tareasCompletadas++;
      porTecnico[id].tareasParaEficiencia.push(t);
      
      // 🔥 SCORE = tiempoEstimado × factor de eficiencia
      const tiempoEstimado = t.tiempoEstimadoEmpleado || 0;
      const tiempoReal = calcularMinutosReales(t);
      
      if (tiempoEstimado > 0 && tiempoReal > 0) {
        const eficienciaRatio = tiempoEstimado / tiempoReal;
        // Factor limitado entre 0.5 y 1.5 para no distorsionar
        const factor = Math.min(1.5, Math.max(0.5, eficienciaRatio));
        porTecnico[id].puntajeTotal += tiempoEstimado * factor;
      } else {
        // Sin estimación: usar tiempo real como base
        porTecnico[id].puntajeTotal += tiempoReal;
      }
    }
    
    porTecnico[id].totalMinutos += calcularMinutosReales(t);
  });
  
  return Object.values(porTecnico)
    .map(tec => ({
      ...tec,
      horasFormateadas: formatMinutos(tec.totalMinutos),
      eficiencia: calcularEficienciaTiempo(tec.tareasParaEficiencia),
      puntajeRedondeado: Math.round(tec.puntajeTotal)
    }))
    .filter(tec => tec.tareasCompletadas > 0);
});

// Ranking principal por SCORE
const topTecnicos = computed(() => {
  return [...tecnicosProcesados.value]
    .sort((a, b) => b.puntajeTotal - a.puntajeTotal)
    .slice(0, 6);
});

// Ranking por cantidad de tareas
const topPorTareas = computed(() => {
  return [...tecnicosProcesados.value]
    .sort((a, b) => b.tareasCompletadas - a.tareasCompletadas)
    .slice(0, 5);
});

// Ranking por horas trabajadas
const topPorHoras = computed(() => {
  return [...tecnicosProcesados.value]
    .sort((a, b) => b.totalMinutos - a.totalMinutos)
    .slice(0, 5);
});

// Ranking por eficiencia
const topPorEficiencia = computed(() => {
  return [...tecnicosProcesados.value]
    .filter(t => t.eficiencia !== null)
    .sort((a, b) => b.eficiencia - a.eficiencia)
    .slice(0, 5);
});

// ============================================================
// ESTADO Y COLORES
// ============================================================

const estadoColorClass = (estado) => {
  const map = {
    pendiente: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    en_progreso: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    revision_cliente: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    revision_jefe: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    finalizada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
  };
  return map[estado] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

const estadoTextoLabel = (estado) => {
  const map = {
    pendiente: 'Pendiente',
    en_progreso: 'En Progreso',
    revision_cliente: 'Revisión',
    revision_jefe: 'Revisión',
    finalizada: 'Finalizada'
  };
  return map[estado] || estado;
};

// ============================================================
// CÁLCULO DEL RANGO DE FECHAS
// ============================================================

const calcularRangoFechas = () => {
  const ahora_ = new Date();
  let inicio = new Date();
  let fin = new Date();
  
  switch (periodoSeleccionado.value) {
    case 'dia':
      inicio = new Date(ahora_.getFullYear(), ahora_.getMonth(), ahora_.getDate(), 0, 0, 0, 0);
      fin = new Date(ahora_.getFullYear(), ahora_.getMonth(), ahora_.getDate(), 23, 59, 59, 999);
      break;
    case 'semana': {
      const diaSemana = ahora_.getDay();
      const diasAtras = diaSemana === 0 ? 6 : diaSemana - 1;
      inicio = new Date(ahora_.getFullYear(), ahora_.getMonth(), ahora_.getDate() - diasAtras, 0, 0, 0, 0);
      fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
      break;
    }
    case 'mes':
      inicio = new Date(ahora_.getFullYear(), ahora_.getMonth(), 1, 0, 0, 0, 0);
      fin = new Date(ahora_.getFullYear(), ahora_.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'trimestre': {
      const trimestre = Math.floor(ahora_.getMonth() / 3);
      inicio = new Date(ahora_.getFullYear(), trimestre * 3, 1, 0, 0, 0, 0);
      fin = new Date(ahora_.getFullYear(), (trimestre + 1) * 3, 0, 23, 59, 59, 999);
      break;
    }
    case 'anio':
      inicio = new Date(ahora_.getFullYear(), 0, 1, 0, 0, 0, 0);
      fin = new Date(ahora_.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      return;
  }
  
  fechaInicio.value = formatearFechaLocal(inicio);
  fechaFin.value = formatearFechaLocal(fin);
};

const aplicarFechasPersonalizadas = () => {
  periodoSeleccionado.value = 'personalizado';
  filtrarTareas();
};

// ============================================================
// FILTRAR Y CALCULAR
// ============================================================

const filtrarTareas = () => {
  if (!tarjetasStore.tarjetas.length) return;
  
  const inicio = parseFechaLocalInicio(fechaInicio.value);
  const fin = parseFechaLocalFin(fechaFin.value);
  
  tareasFiltradas.value = tarjetasStore.tarjetas.filter(tarea => {
    const fecha = new Date(tarea.createdAt);
    return fecha >= inicio && fecha <= fin;
  });
  
  calcularResumen();
  calcularMetricasHoy();
  renderizarGraficos();
};

const calcularResumen = () => {
  const totalTareas = tareasFiltradas.value.length;
  
  const completadas = tareasFiltradas.value.filter(t => 
    t.estado === 'finalizada' || t.estado === 'revision_cliente'
  );
  const tareasCompletadasCount = completadas.length;
  const tareasPendientes = totalTareas - tareasCompletadasCount;
  
  let totalMinutos = 0;
  tareasFiltradas.value.forEach(t => {
    totalMinutos += calcularMinutosReales(t);
  });
  
  const eficienciaTiempo = calcularEficienciaTiempo(tareasFiltradas.value);
  
  let mensajeEficiencia = 'Sin datos suficientes';
  if (eficienciaTiempo !== null) {
    if (eficienciaTiempo >= 110) mensajeEficiencia = 'Equipo muy rápido';
    else if (eficienciaTiempo >= 90) mensajeEficiencia = 'En tiempo esperado';
    else if (eficienciaTiempo >= 70) mensajeEficiencia = 'Algo por debajo';
    else mensajeEficiencia = 'Requiere mejora';
  }
  
  const calificadas = completadas.filter(t => t.calificacion?.puntaje);
  const calificacionPromedioNum = calificadas.length > 0
    ? calificadas.reduce((sum, t) => sum + t.calificacion.puntaje, 0) / calificadas.length
    : 0;
  
  const dias = diasEnRango.value;
  
  resumen.value = {
    tareasCompletadas: tareasCompletadasCount,
    tareasPendientes,
    totalTareas,
    totalHorasFormateado: formatMinutos(totalMinutos),
    promedioHorasPorDia: formatMinutos(Math.round(totalMinutos / dias)),
    eficienciaTiempo,
    mensajeEficiencia,
    calificacionPromedio: calificacionPromedioNum.toFixed(1),
    totalCalificaciones: calificadas.length
  };
};

const calcularMetricasHoy = () => {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
  const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
  
  const creadasHoy = tarjetasStore.tarjetas.filter(t => {
    const fecha = new Date(t.createdAt);
    return fecha >= inicioHoy && fecha <= finHoy;
  });
  
  const completadasHoy = tarjetasStore.tarjetas.filter(t => {
    if (t.estado !== 'finalizada' && t.estado !== 'revision_cliente') return false;
    const fecha = t.fechaFinalizada ? new Date(t.fechaFinalizada) : null;
    if (!fecha) return false;
    return fecha >= inicioHoy && fecha <= finHoy;
  });
  
  let minutosHoy = 0;
  creadasHoy.forEach(t => {
    minutosHoy += calcularMinutosReales(t);
  });
  
  const eficiencia = calcularEficienciaTiempo(creadasHoy);
  
  metricasHoy.value = {
    creadas: creadasHoy.length,
    completadas: completadasHoy.length,
    horasFormateadas: formatMinutos(minutosHoy),
    eficiencia
  };
};

// ============================================================
// GRÁFICOS
// ============================================================

const renderizarGraficos = () => {
  Object.values(charts).forEach(chart => chart?.destroy());
  
  const datosPorFecha = {};
  
  tareasFiltradas.value.forEach(tarea => {
    const fecha = new Date(tarea.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    if (!datosPorFecha[fecha]) {
      datosPorFecha[fecha] = { creadas: 0, completadas: 0, horas: 0 };
    }
    datosPorFecha[fecha].creadas += 1;
    datosPorFecha[fecha].horas += calcularMinutosReales(tarea) / 60;
    if (tarea.estado === 'finalizada' || tarea.estado === 'revision_cliente') {
      datosPorFecha[fecha].completadas += 1;
    }
  });
  
  const fechas = Object.keys(datosPorFecha).sort();
  
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 10 }, padding: 12 } },
      tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.95)', padding: 10, titleFont: { size: 12, weight: 'bold' }, bodyFont: { size: 12 } }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' }, ticks: { font: { size: 10 }, color: '#9CA3AF' } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9CA3AF' } }
    }
  };
  
  if (tareasPorDiaChart.value && fechas.length) {
    charts.tareasPorDia = new Chart(tareasPorDiaChart.value.getContext('2d'), {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [
          {
            label: 'Creadas',
            data: fechas.map(f => datosPorFecha[f].creadas),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Completadas',
            data: fechas.map(f => datosPorFecha[f].completadas),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: commonOptions
    });
  }
  
  if (horasPorDiaChart.value && fechas.length) {
    charts.horasPorDia = new Chart(horasPorDiaChart.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Horas',
          data: fechas.map(f => datosPorFecha[f].horas.toFixed(1)),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          hoverBackgroundColor: 'rgba(245, 158, 11, 1)',
          borderRadius: 6
        }]
      },
      options: { ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } }
    });
  }
  
  const empleados = {};
  tareasFiltradas.value.forEach(t => {
    if (t.asignadoA?.nombre) {
      if (!empleados[t.asignadoA.nombre]) {
        empleados[t.asignadoA.nombre] = { completadas: 0, horas: 0 };
      }
      if (t.estado === 'finalizada') empleados[t.asignadoA.nombre].completadas++;
      empleados[t.asignadoA.nombre].horas += calcularMinutosReales(t) / 60;
    }
  });
  
  if (productividadChart.value && Object.keys(empleados).length) {
    charts.productividad = new Chart(productividadChart.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(empleados),
        datasets: [
          { label: 'Tareas completadas', data: Object.values(empleados).map(e => e.completadas), backgroundColor: 'rgba(59, 130, 246, 0.8)', borderRadius: 6, yAxisID: 'y' },
          { label: 'Horas trabajadas', data: Object.values(empleados).map(e => parseFloat(e.horas.toFixed(1))), backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 6, yAxisID: 'y1' }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          y: { type: 'linear', display: true, position: 'left', beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' }, ticks: { font: { size: 10 }, color: '#9CA3AF' } },
          y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, ticks: { font: { size: 10 }, color: '#9CA3AF' } },
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9CA3AF' } }
        }
      }
    });
  }
  
  const tipos = { solicitud_cliente: 0, tarea_extra: 0, asignacion_supervisor: 0 };
  tareasFiltradas.value.forEach(t => {
    tipos[t.tipo] = (tipos[t.tipo] || 0) + 1;
  });
  
  if (distribucionChart.value) {
    charts.distribucion = new Chart(distribucionChart.value.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Solicitudes cliente', 'Tareas extra', 'Asignaciones supervisor'],
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
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 }, padding: 12 } } }
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
      'Horas trabajadas': formatHoras(t),
      'Progreso': `${calcularProgresoEnVivo(t)}%`,
      'Calificación': t.calificacion?.puntaje || 'Sin calificar',
      'Fecha creación': formatFecha(t.createdAt)
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];
    
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
      formatHoras(t),
      `${calcularProgresoEnVivo(t)}%`,
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

watch(periodoSeleccionado, (nuevo) => {
  if (nuevo !== 'personalizado') {
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
  if (tarjetasStore.tarjetas.length) {
    filtrarTareas();
  } else {
    setTimeout(() => {
      if (tarjetasStore.tarjetas.length) filtrarTareas();
    }, 1500);
  }
  
  intervaloTick = setInterval(() => {
    ahora.value = Date.now();
    if (tarjetasStore.tarjetas.some(t => t.estadoProgreso === 'activa')) {
      calcularMetricasHoy();
      calcularResumen();
    }
  }, 5000);
});

onUnmounted(() => {
  if (intervaloTick) {
    clearInterval(intervaloTick);
    intervaloTick = null;
  }
  Object.values(charts).forEach(chart => chart?.destroy());
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