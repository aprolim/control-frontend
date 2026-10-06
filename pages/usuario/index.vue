<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20 transition-colors duration-300">
    
    <!-- ============================================================ -->
    <!-- NAVBAR                                                        -->
    <!-- ============================================================ -->
    <nav class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          
          <!-- Logo + título -->
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span class="text-white text-sm font-bold tracking-tight">CP</span>
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            <div>
              <h1 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight tracking-tight">Control de Actividades</h1>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 leading-tight font-medium uppercase tracking-wider">Portal de Usuario</p>
            </div>
          </div>
          
          <!-- Acciones -->
          <div class="flex items-center gap-2">
            <ThemeToggle />
            
            <div class="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l border-gray-200 dark:border-gray-800">
              <div class="w-9 h-9 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-md">
                <span class="text-xs font-bold text-white">{{ authStore.user?.nombre?.charAt(0) || '?' }}</span>
              </div>
              <div class="max-w-[140px]">
                <p class="text-xs font-semibold text-gray-900 dark:text-white leading-tight truncate">{{ authStore.user?.nombre || 'Usuario' }}</p>
                <p class="text-[10px] text-emerald-600 dark:text-emerald-400 leading-tight font-medium uppercase tracking-wide">Cliente</p>
              </div>
            </div>
            
            <button
              @click="logout"
              class="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
              title="Cerrar sesión"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- ============================================================ -->
    <!-- HERO SECTION (BIENVENIDA)                                     -->
    <!-- ============================================================ -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <!-- Saludo -->
        <div class="lg:col-span-2">
          <p class="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            {{ getSaludo() }}
          </p>
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
            {{ authStore.user?.nombre?.split(' ')[0] || 'Bienvenido' }} 👋
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Aquí puedes ver el estado de tus solicitudes en tiempo real.
          </p>
        </div>
        
        <!-- Stats del usuario -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
            <p class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ misSolicitudes.length }}</p>
            <p class="text-[10px] text-gray-400 dark:text-gray-500">solicitudes</p>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
            <p class="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Por calificar</p>
            <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{{ tareasParaCalificar.length }}</p>
            <p class="text-[10px] text-gray-400 dark:text-gray-500">pendientes</p>
          </div>
        </div>
      </div>
      
      <!-- CTA principal -->
      <div class="mt-6 flex flex-wrap gap-3">
        <button
          @click="abrirModalSolicitud"
          class="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg class="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Nueva solicitud
        </button>
        
        <button
          @click="recargarDatos"
          :disabled="cargando"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': cargando }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>
    </section>
    
    <!-- ============================================================ -->
    <!-- ALERTA PARA CALIFICAR                                         -->
    <!-- ============================================================ -->
    <section v-if="tareasParaCalificar.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div class="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
            {{ tareasParaCalificar.length }} {{ tareasParaCalificar.length === 1 ? 'tarea lista' : 'tareas listas' }} para calificar
          </h3>
          <p class="text-xs text-amber-700 dark:text-amber-300 mb-3">
            Tu opinión nos ayuda a mejorar el servicio. Cuéntanos cómo fue tu experiencia.
          </p>
          <button
            @click="abrirModalCalificar(tareasParaCalificar[0])"
            class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition shadow-sm"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Calificar ahora
          </button>
        </div>
      </div>
    </section>
    
    <!-- ============================================================ -->
    <!-- FILTROS                                                       -->
    <!-- ============================================================ -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-for="filtro in filtros"
            :key="filtro.key"
            @click="filtroActivo = filtro.key"
            :class="filtroActivo === filtro.key
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          >
            <span>{{ filtro.icon }}</span>
            <span>{{ filtro.label }}</span>
            <span 
              v-if="filtro.count() > 0"
              :class="filtroActivo === filtro.key ? 'bg-white/20 dark:bg-gray-900/20' : 'bg-gray-100 dark:bg-gray-800'"
              class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums"
            >
              {{ filtro.count() }}
            </span>
          </button>
        </div>
        
        <div v-if="filtroActivo !== 'todas'" class="text-xs text-gray-500 dark:text-gray-400">
          Mostrando {{ solicitudesFiltradas.length }} de {{ misSolicitudes.length }}
        </div>
      </div>
    </section>
    
    <!-- ============================================================ -->
    <!-- LISTA DE SOLICITUDES                                          -->
    <!-- ============================================================ -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      
      <!-- Cargando -->
      <div v-if="cargando && misSolicitudes.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="animate-pulse bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      
      <!-- Vacío -->
      <div v-else-if="solicitudesFiltradas.length === 0" class="text-center py-16">
        <div class="w-24 h-24 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
          <svg class="w-12 h-12 text-blue-400 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {{ filtroActivo === 'todas' ? 'Aún no tienes solicitudes' : 'No hay solicitudes en esta categoría' }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          {{ filtroActivo === 'todas' 
            ? 'Crea tu primera solicitud y te notificaremos cuando el equipo la tome.' 
            : 'Prueba con otro filtro para ver tus otras solicitudes.' }}
        </p>
        <button
          v-if="filtroActivo === 'todas'"
          @click="abrirModalSolicitud"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear mi primera solicitud
        </button>
      </div>
      
      <!-- Grid de tarjetas -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <article 
          v-for="tarea in solicitudesFiltradas" 
          :key="tarea._id"
          class="group relative bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-default"
          :class="getCardBorderClass(tarea)"
        >
          <!-- Banda superior de color según estado -->
          <div :class="getCardTopBarClass(tarea)" class="h-1 w-full"></div>
          
          <div class="p-5">
            
            <!-- Header: Título + Prioridad -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                  {{ tarea.titulo }}
                </h3>
                <p class="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-1">
                  #{{ tarea._id?.slice(-8) }}
                </p>
              </div>
              <span :class="prioridadColorClass(tarea.prioridad)" class="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {{ prioridadTextoLabel(tarea.prioridad) }}
              </span>
            </div>
            
            <!-- Descripción -->
            <p v-if="tarea.descripcion" class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
              {{ tarea.descripcion }}
            </p>
            
            <!-- Badge de estado -->
            <div class="flex items-center gap-2 mb-4 flex-wrap">
              <span :class="estadoBadgeClass(tarea)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                <span class="w-1.5 h-1.5 rounded-full" :class="estadoDotClass(tarea)"></span>
                {{ estadoTextoLabel(tarea) }}
              </span>
              <span v-if="tarea.calificacion?.puntaje" class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {{ tarea.calificacion.puntaje }}/5
              </span>
            </div>
            
            <!-- Info del técnico (si está asignado) -->
            <div v-if="tarea.asignadoA" class="mb-4 p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span class="text-xs font-bold text-white">
                    {{ tarea.asignadoA.nombre?.charAt(0) || '?' }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-[10px] text-blue-700 dark:text-blue-300 uppercase tracking-wider font-bold">Técnico asignado</p>
                  <p class="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {{ tarea.asignadoA.nombre }}
                  </p>
                </div>
                <span v-if="tarea.estadoProgreso === 'activa'" class="flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Trabajando
                </span>
                <span v-else-if="tarea.estado === 'finalizada' || tarea.estado === 'revision_cliente'" class="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  ✓ Completada
                </span>
                <span v-else-if="tarea.estadoProgreso === 'pausada'" class="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                  ⏸ Pausada
                </span>
              </div>
            </div>
            
            <!-- Sin asignar -->
            <div v-else class="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Técnico asignado</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 italic">Esperando asignación...</p>
                </div>
              </div>
            </div>
            
            <!-- Progreso en vivo -->
            <div v-if="tarea.estado === 'en_progreso'" class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progreso</span>
                <span 
                  class="text-xs font-bold tabular-nums"
                  :class="tarea.estadoProgreso === 'activa' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'"
                >
                  {{ calcularProgresoLocal(tarea) }}%
                </span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  class="rounded-full h-2 transition-all duration-1000 ease-linear" 
                  :class="tarea.estadoProgreso === 'activa' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'"
                  :style="{ width: `${calcularProgresoLocal(tarea)}%` }"
                ></div>
              </div>
            </div>
            
            <!-- Comentario de calificación -->
            <div v-if="tarea.calificacion?.comentario" class="mb-4 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <p class="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed">
                "{{ tarea.calificacion.comentario }}"
              </p>
            </div>
            
            <!-- Footer: fecha + botón calificar -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ formatFechaRelativa(tarea.createdAt) }}</span>
              </div>
              
              <button 
                v-if="(tarea.estado === 'finalizada' || tarea.estado === 'revision_cliente') 
                      && !tarea.calificacion?.puntaje 
                      && !tarea.calificacion?.autoFinalizada"
                @click="abrirModalCalificar(tarea)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-[11px] font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Calificar
              </button>
              <span v-else-if="tarea.calificacion?.autoFinalizada" class="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                Auto-finalizada
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
    
    <!-- ============================================================ -->
    <!-- MODALES                                                       -->
    <!-- ============================================================ -->
    <SolicitudModal
      v-if="modalSolicitud"
      :extra="false"
      @close="modalSolicitud = false"
      @created="handleSolicitudCreada"
    />
    
    <CalificarModal
      v-if="tareaParaCalificar"
      :tarjeta="tareaParaCalificar"
      @close="tareaParaCalificar = null"
      @calificado="handleCalificado"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useTarjetasStore } from '~/stores/tarjetas';
import { useRoles } from '~/composables/useRoles';
import { useNotificaciones } from '~/composables/useNotificaciones';
import CalificarModal from '~/components/CalificarModal.vue';

definePageMeta({ middleware: 'auth' });

console.log('========================================');
console.log('👤 [Usuario] Página cargada');
console.log('========================================');

const authStore = useAuthStore();
const tarjetasStore = useTarjetasStore();
const { isUsuario } = useRoles();

if (!isUsuario.value) {
  console.warn('⚠️ [Usuario] Usuario no tiene rol usuario, redirigiendo...');
  navigateTo('/');
}

const config = useRuntimeConfig();

// Estado
const modalSolicitud = ref(false);
const tareaParaCalificar = ref(null);
const cargando = ref(false);
const filtroActivo = ref('todas');

// 🔥 Ref reactivo para tiempo en vivo
const ahora = ref(Date.now());
let intervaloActualizacion = null;

const socket = ref(null);
let pollingInterval = null;

// ============================================================
// 🔔 NOTIFICACIONES
// ============================================================

const {
  inicializar: inicializarNotificaciones,
  destruir: destruirNotificaciones,
  mostrarNotificacionVisual,
  reproducirSonido,
  notificarTecnicoTomoTarea,
  notificarTecnicoInicio,
  notificarTecnicoPauso,
  notificarTecnicoReanudo,
  notificarTareaFinalizada
} = useNotificaciones();

// ============================================================
// COMPUTED
// ============================================================

const misSolicitudes = computed(() => {
  return tarjetasStore.tarjetas.filter(t => 
    t.clienteInfo?.userId === authStore.user?._id
  );
});

const tareasParaCalificar = computed(() => {
  return misSolicitudes.value.filter(t => 
    (t.estado === 'finalizada' || t.estado === 'revision_cliente') && 
    !t.calificacion?.puntaje && 
    !t.calificacion?.autoFinalizada
  );
});

// Filtros
const filtros = computed(() => [
  { 
    key: 'todas', 
    label: 'Todas', 
    icon: '📋',
    count: () => misSolicitudes.value.length
  },
  { 
    key: 'pendientes', 
    label: 'Pendientes', 
    icon: '⏳',
    count: () => misSolicitudes.value.filter(t => t.estado === 'pendiente' || (t.estado === 'en_progreso' && t.estadoProgreso === 'pausada')).length
  },
  { 
    key: 'en_progreso', 
    label: 'En progreso', 
    icon: '⚙️',
    count: () => misSolicitudes.value.filter(t => t.estado === 'en_progreso' && t.estadoProgreso === 'activa').length
  },
  { 
    key: 'finalizadas', 
    label: 'Finalizadas', 
    icon: '✅',
    count: () => misSolicitudes.value.filter(t => t.estado === 'finalizada' || t.estado === 'revision_cliente').length
  }
]);

const solicitudesFiltradas = computed(() => {
  const todas = misSolicitudes.value;
  
  switch (filtroActivo.value) {
    case 'pendientes':
      return todas.filter(t => t.estado === 'pendiente' || (t.estado === 'en_progreso' && t.estadoProgreso === 'pausada'));
    case 'en_progreso':
      return todas.filter(t => t.estado === 'en_progreso' && t.estadoProgreso === 'activa');
    case 'finalizadas':
      return todas.filter(t => t.estado === 'finalizada' || t.estado === 'revision_cliente');
    default:
      return todas;
  }
});

// ============================================================
// HELPERS
// ============================================================

const getSaludo = () => {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const formatFechaRelativa = (fecha) => {
  if (!fecha) return '';
  const ahora_ = new Date();
  const d = new Date(fecha);
  const diffMs = ahora_ - d;
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);
  
  if (diffMin < 1) return 'Hace un momento';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHoras < 24) return `Hace ${diffHoras}h`;
  if (diffDias < 7) return `Hace ${diffDias}d`;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

// ============================================================
// CÁLCULO DE PROGRESO EN VIVO
// ============================================================

const calcularProgresoLocal = (tarea) => {
  if (!tarea) return 0;
  
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

// ============================================================
// ESTILOS DINÁMICOS
// ============================================================

const prioridadColorClass = (prioridad) => {
  const map = {
    baja: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    media: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    urgente: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  };
  return map[prioridad] || 'bg-gray-100 text-gray-700';
};

const prioridadTextoLabel = (prioridad) => {
  const map = { baja: 'Baja', media: 'Media', alta: 'Alta', urgente: 'Urgente' };
  return map[prioridad] || 'Media';
};

const estadoTextoLabel = (tarea) => {
  const estado = tarea.estado;
  const progreso = tarea.estadoProgreso;
  
  if (estado === 'pendiente') return 'Pendiente';
  if (estado === 'en_progreso') {
    if (!tarea.asignadoA) return 'Pendiente';
    if (progreso === 'activa') return 'En progreso';
    return 'Pausada';
  }
  if (estado === 'revision_cliente') return 'Calificar';
  if (estado === 'finalizada') return 'Finalizada';
  return estado;
};

const estadoBadgeClass = (tarea) => {
  const estado = tarea.estado;
  const progreso = tarea.estadoProgreso;
  
  if (estado === 'pendiente') return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  if (estado === 'en_progreso') {
    if (progreso === 'activa') return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
    return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
  }
  if (estado === 'revision_cliente') return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
  if (estado === 'finalizada') return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
  return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
};

const estadoDotClass = (tarea) => {
  const estado = tarea.estado;
  const progreso = tarea.estadoProgreso;
  
  if (estado === 'pendiente') return 'bg-gray-400';
  if (estado === 'en_progreso') {
    if (progreso === 'activa') return 'bg-emerald-500 animate-pulse';
    return 'bg-amber-500';
  }
  if (estado === 'revision_cliente') return 'bg-amber-500 animate-pulse';
  if (estado === 'finalizada') return 'bg-emerald-500';
  return 'bg-gray-400';
};

const getCardBorderClass = (tarea) => {
  const esParaCalificar = (tarea.estado === 'finalizada' || tarea.estado === 'revision_cliente') 
    && !tarea.calificacion?.puntaje 
    && !tarea.calificacion?.autoFinalizada;
  
  if (esParaCalificar) return 'border-amber-300 dark:border-amber-700 ring-2 ring-amber-100 dark:ring-amber-900/30';
  if (tarea.estado === 'en_progreso' && tarea.estadoProgreso === 'activa') return 'border-emerald-200 dark:border-emerald-800';
  if (tarea.estado === 'en_progreso' && tarea.estadoProgreso === 'pausada') return 'border-amber-200 dark:border-amber-800';
  if (tarea.estado === 'finalizada' || tarea.estado === 'revision_cliente') return 'border-emerald-200 dark:border-emerald-800';
  return 'border-gray-200 dark:border-gray-800';
};

const getCardTopBarClass = (tarea) => {
  const esParaCalificar = (tarea.estado === 'finalizada' || tarea.estado === 'revision_cliente') 
    && !tarea.calificacion?.puntaje 
    && !tarea.calificacion?.autoFinalizada;
  
  if (esParaCalificar) return 'bg-gradient-to-r from-amber-400 to-orange-500';
  if (tarea.estado === 'en_progreso' && tarea.estadoProgreso === 'activa') return 'bg-gradient-to-r from-emerald-400 to-teal-500';
  if (tarea.estado === 'en_progreso' && tarea.estadoProgreso === 'pausada') return 'bg-gradient-to-r from-amber-400 to-yellow-500';
  if (tarea.estado === 'finalizada' || tarea.estado === 'revision_cliente') return 'bg-gradient-to-r from-emerald-400 to-green-500';
  return 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600';
};

// ============================================================
// SOCKETS
// ============================================================

const configurarSockets = () => {
  console.log('🔌 [Usuario] Configurando sockets...');
  
  const nuxtApp = useNuxtApp();
  socket.value = nuxtApp.$socket;
  
  if (!socket.value) {
    console.warn('⚠️ [Usuario] Socket no disponible, usando polling');
    iniciarPollingFallback();
    return;
  }
  
  console.log('✅ [Usuario] Socket disponible');
  
  socket.value.on('tarea-tomada', (data) => {
    const esMia = data.tarea?.clienteInfo?.userId === authStore.user?._id ||
                  misSolicitudes.value.some(t => t._id === data.tarea?._id);
    if (esMia) {
      notificarTecnicoTomoTarea(data);
      recargarDatos();
    }
  });
  
  socket.value.on('nueva-tarea-asignada', (data) => {
    const esMia = data.tarea?.clienteInfo?.userId === authStore.user?._id ||
                  misSolicitudes.value.some(t => t._id === data.tarea?._id);
    if (esMia) {
      notificarTecnicoTomoTarea(data);
      recargarDatos();
    }
  });
  
  socket.value.on('tarea-iniciada-tiempo-real', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tarea?.id);
    if (esMia) {
      notificarTecnicoInicio(data);
      recargarDatos();
    }
  });
  
  socket.value.on('tarea-pausada-tiempo-real', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      notificarTecnicoPauso(data);
      recargarDatos();
    }
  });
  
  socket.value.on('tarea-reanudada-tiempo-real', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      notificarTecnicoReanudo(data);
      recargarDatos();
    }
  });
  
  socket.value.on('tarea-reasignada', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      reproducirSonido('pendienteSuave');
      mostrarNotificacionVisual({
        tipo: 'warning',
        titulo: '🔄 Tarea reasignada',
        mensaje: data.mensaje || 'Tu tarea fue reasignada',
        duracion: 6000
      });
      recargarDatos();
    }
  });
  
  socket.value.on('tarea-lista-para-calificar', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      notificarTareaFinalizada(data);
      recargarDatos();
    }
  });
  
  socket.value.on('tarea-finalizada-por-ti', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      notificarTareaFinalizada(data);
      recargarDatos();
    }
  });
  
  socket.value.on('tarea-auto-finalizada', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      reproducirSonido('tareaAsignada');
      mostrarNotificacionVisual({
        tipo: 'info',
        titulo: '🤖 Auto-finalizada',
        mensaje: `Tu tarea "${data.titulo}" fue finalizada automáticamente`,
        duracion: 8000
      });
      recargarDatos();
    }
  });
  
  socket.value.on('estado-actualizado', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) recargarDatos();
  });
  
  socket.value.on('estado-general-actualizado', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) recargarDatos();
  });
  
  socket.value.on('tarea-por-expirar', (data) => {
    const esMia = misSolicitudes.value.some(t => t._id === data.tareaId);
    if (esMia) {
      reproducirSonido('pendienteSuave');
      mostrarNotificacionVisual({
        tipo: 'warning',
        titulo: '⚠️ Tarea por vencer',
        mensaje: data.mensaje || 'Tu tarea está por expirar',
        duracion: 8000
      });
    }
  });
  
  socket.value.on('rol-actualizado', (data) => {
    if (data.userId === authStore.user?._id) {
      authStore.user.rol = data.nuevoRol;
      localStorage.setItem('user', JSON.stringify(authStore.user));
      alert(`✅ Tu rol ha sido actualizado a: ${data.nuevoRol}`);
      setTimeout(() => window.location.reload(), 1500);
    }
  });
  
  console.log('✅ [Usuario] Eventos configurados');
};

const iniciarPollingFallback = () => {
  pollingInterval = setInterval(async () => {
    await recargarDatos();
  }, 15000);
};

// ============================================================
// ACCIONES
// ============================================================

const recargarDatos = async () => {
  cargando.value = true;
  try {
    await tarjetasStore.fetchTarjetas();
  } catch (error) {
    console.error('❌ [Usuario] Error:', error);
  } finally {
    cargando.value = false;
  }
};

const logout = () => authStore.logout();
const abrirModalSolicitud = () => modalSolicitud.value = true;
const abrirModalCalificar = (tarea) => tareaParaCalificar.value = tarea;

const handleSolicitudCreada = () => {
  modalSolicitud.value = false;
  reproducirSonido('tareaAsignada');
  mostrarNotificacionVisual({
    tipo: 'success',
    titulo: '✅ Solicitud enviada',
    mensaje: 'Tu solicitud ha sido registrada correctamente',
    duracion: 5000
  });
  recargarDatos();
};

const handleCalificado = async () => {
  tareaParaCalificar.value = null;
  await recargarDatos();
  reproducirSonido('tareaAsignada');
  mostrarNotificacionVisual({
    tipo: 'success',
    titulo: '⭐ ¡Gracias!',
    mensaje: 'Tu calificación ha sido registrada',
    duracion: 5000
  });
};

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  console.log('🔄 [Usuario] onMounted');
  
  authStore.loadFromStorage();
  await recargarDatos();
  configurarSockets();
  await inicializarNotificaciones();
  
  if (process.client) {
    const desbloquear = () => {
      try {
        const a = new Audio('/sounds/tarea-asignada.mp3');
        a.volume = 0;
        a.play().catch(() => {});
      } catch (e) {}
      document.removeEventListener('click', desbloquear);
      document.removeEventListener('keydown', desbloquear);
      document.removeEventListener('touchstart', desbloquear);
    };
    document.addEventListener('click', desbloquear, { once: true });
    document.addEventListener('keydown', desbloquear, { once: true });
    document.addEventListener('touchstart', desbloquear, { once: true });
  }
  
  intervaloActualizacion = setInterval(() => {
    ahora.value = Date.now();
  }, 1000);
  
  setTimeout(() => {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.$socket && authStore.user?._id) {
      nuxtApp.$socket.emit('join', authStore.user._id);
    }
  }, 1000);
  
  pollingInterval = setInterval(async () => {
    await recargarDatos();
  }, 20000);
  
  if (tareasParaCalificar.value.length > 0) {
    setTimeout(() => {
      mostrarNotificacionVisual({
        tipo: 'info',
        titulo: '⭐ Tareas por calificar',
        mensaje: `Tienes ${tareasParaCalificar.value.length} tarea(s) lista(s) para calificar`,
        duracion: 8000
      });
    }, 2000);
  }
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
  if (intervaloActualizacion) clearInterval(intervaloActualizacion);
  destruirNotificaciones();
  
  if (socket.value) {
    socket.value.off('tarea-tomada');
    socket.value.off('nueva-tarea-asignada');
    socket.value.off('tarea-iniciada-tiempo-real');
    socket.value.off('tarea-pausada-tiempo-real');
    socket.value.off('tarea-reanudada-tiempo-real');
    socket.value.off('tarea-reasignada');
    socket.value.off('tarea-lista-para-calificar');
    socket.value.off('tarea-finalizada-por-ti');
    socket.value.off('tarea-auto-finalizada');
    socket.value.off('estado-actualizado');
    socket.value.off('estado-general-actualizado');
    socket.value.off('tarea-por-expirar');
    socket.value.off('rol-actualizado');
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>