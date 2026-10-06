<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <!-- ============================================================ -->
    <!-- NAVBAR                                                        -->
    <!-- ============================================================ -->
    <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <span class="text-white text-sm font-bold">CP</span>
            </div>
            <div>
              <h1 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Control de Actividades</h1>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Panel de Técnico</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button
              v-if="!silencioActivo"
              @click="menuSilencioAbierto = !menuSilencioAbierto"
              class="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition"
              title="Notificaciones activas"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span
                v-if="tareasDisponibles.length > 0"
                class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
              >
                {{ tareasDisponibles.length }}
              </span>
            </button>
            <button
              v-else
              @click="reactivarNotificaciones"
              class="relative p-2 rounded-lg text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition flex items-center gap-1.5"
              :title="`Silenciado (${tiempoRestanteSilencio?.minutos} min restantes)`"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              <span class="text-xs font-semibold">{{ tiempoRestanteSilencio?.minutos }}m</span>
            </button>
            
            <ThemeToggle />
            
            <div class="flex items-center gap-2 pl-3 ml-1 border-l border-gray-200 dark:border-gray-800">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span class="text-xs font-semibold text-white">{{ authStore.user?.nombre?.charAt(0) || '?' }}</span>
              </div>
              <div class="hidden sm:block">
                <p class="text-xs font-medium text-gray-900 dark:text-white leading-tight">{{ authStore.user?.nombre || 'Usuario' }}</p>
                <p class="text-[10px] text-blue-600 dark:text-blue-400 leading-tight font-medium">Técnico</p>
              </div>
            </div>
            
            <button
              @click="logout"
              class="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition"
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
    
    <!-- Menú de silencio (popover) -->
    <div v-if="menuSilencioAbierto" class="fixed inset-0 z-50" @click="menuSilencioAbierto = false">
      <div class="absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 w-56">
        <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">Silenciar notificaciones</p>
        <button
          v-for="opcion in opcionesSilencio"
          :key="opcion.minutos"
          @click="silencioSeleccionado(opcion.minutos)"
          class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm text-gray-700 dark:text-gray-300"
        >
          {{ opcion.label }}
        </button>
      </div>
    </div>
    
    <!-- ============================================================ -->
    <!-- CONTENIDO PRINCIPAL                                           -->
    <!-- ============================================================ -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <!-- Barra de acciones superiores -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">Panel de trabajo</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Gestiona tus tareas y monitorea tu rendimiento</p>
        </div>
        
        <div class="flex items-center gap-2">
          <button
            @click="cargarTareasDisponibles"
            :disabled="cargandoDisponibles"
            class="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition shadow-sm"
          >
            <svg class="w-4 h-4" :class="{ 'animate-spin': cargandoDisponibles }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
          
          <button
            @click="abrirModalTareaExtra"
            class="inline-flex items-center gap-2 px-3.5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tarea extra
          </button>
        </div>
      </div>
      
      <!-- Estado de técnicos -->
      <EstadoEmpleados />
      
      <!-- ============================================================ -->
      <!-- TAREAS DISPONIBLES                                            -->
      <!-- ============================================================ -->
      <section
        class="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden transition-all duration-300 shadow-sm"
        :class="tareasDisponibles.length > 0 
          ? 'border-blue-300 dark:border-blue-700 ring-1 ring-blue-100 dark:ring-blue-900/30' 
          : 'border-gray-200 dark:border-gray-800'"
      >
        <header class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Tareas disponibles
                <span v-if="tareasDisponibles.length > 0" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  {{ tareasDisponibles.length }}
                </span>
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Selecciona una tarea para comenzar</p>
            </div>
          </div>
          
          <button 
            @click="tomarSiguienteTarea" 
            :disabled="cargandoTarea || tareasDisponibles.length === 0"
            class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            <svg v-if="!cargandoTarea" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ cargandoTarea ? 'Tomando...' : 'Tomar siguiente' }}
          </button>
        </header>
        
        <div class="p-5">
          <div v-if="cargandoDisponibles" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="i in 3" :key="i" class="animate-pulse border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
          
          <div v-else-if="tareasDisponibles.length === 0" class="text-center py-10">
            <div class="w-14 h-14 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">No hay tareas disponibles</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Vuelve a intentar más tarde</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <article 
              v-for="tarea in tareasDisponibles" 
              :key="tarea._id"
              @click="tomarTareaEspecifica(tarea._id)"
              class="group border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 flex-1">{{ tarea.titulo }}</h3>
                <span :class="prioridadColorClass(tarea.prioridad)" class="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                  {{ prioridadTextoLabel(tarea.prioridad) }}
                </span>
              </div>
              
              <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">{{ tarea.descripcion || 'Sin descripción' }}</p>
              
              <div class="space-y-1 text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                <div v-if="tarea.clienteInfo" class="flex items-center gap-1.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="truncate">{{ tarea.clienteInfo.nombre || 'Anónimo' }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ new Date(tarea.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) }}</span>
                </div>
              </div>
              
              <button 
                class="w-full inline-flex items-center justify-center gap-1.5 bg-green-600 text-white py-1.5 rounded-md text-xs font-medium hover:bg-green-700 transition"
                @click.stop="tomarTareaEspecifica(tarea._id)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Tomar tarea
              </button>
            </article>
          </div>
        </div>
      </section>
      
      <!-- ============================================================ -->
      <!-- MIS TAREAS                                                    -->
      <!-- ============================================================ -->
      <section class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <header class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Mis tareas</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tareas asignadas actualmente</p>
            </div>
          </div>
        </header>
        
        <div class="p-5">
          <div v-if="tareasEnProgreso.length === 0 && !tareaActiva" class="text-center py-10">
            <div class="w-14 h-14 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">No tienes tareas asignadas</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Toma una tarea disponible para comenzar</p>
          </div>
          
          <div v-else class="space-y-4">
            <!-- ============================================================ -->
            <!-- TAREA ACTIVA (compacta con descripción del usuario)           -->
            <!-- ============================================================ -->
            <article v-if="tareaActiva" class="relative bg-white dark:bg-gray-900 border-2 border-emerald-500 rounded-xl overflow-hidden shadow-lg ring-4 ring-emerald-100 dark:ring-emerald-900/20">
              
              <!-- Barra superior delgada con estado + hora -->
              <div 
                class="px-4 py-1 flex items-center justify-between transition-colors duration-500"
                :class="{
                  'bg-emerald-600': tiempoRestanteActivo > 10,
                  'bg-amber-500': tiempoRestanteActivo <= 10 && tiempoRestanteActivo > 5,
                  'bg-red-600': tiempoRestanteActivo <= 5
                }"
              >
                <div class="flex items-center gap-1.5 text-white">
                  <span class="relative flex h-1.5 w-1.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  </span>
                  <span class="text-[10px] font-bold uppercase tracking-widest">
                    {{ tiempoRestanteActivo <= 5 ? '¡Últimos minutos!' : 'En curso' }}
                  </span>
                </div>
                <span class="text-[10px] font-medium text-white/80 tabular-nums">
                  {{ new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }}
                </span>
              </div>
              
              <!-- Contenido compacto -->
              <div class="p-4 space-y-3">
                
                <!-- Fila 1: Título + Prioridad -->
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-base font-bold text-gray-900 dark:text-white flex-1 leading-snug">
                    {{ tareaActiva.titulo }}
                  </h3>
                  <span :class="prioridadColorClass(tareaActiva.prioridad)" class="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                    {{ prioridadTextoLabel(tareaActiva.prioridad) }}
                  </span>
                </div>
                
                <!-- 🔥 NUEVO: Descripción del usuario -->
                <div v-if="tareaActiva.descripcion" class="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border-l-2 border-blue-400 dark:border-blue-600">
                  <p class="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
                    📝 Descripción del usuario
                  </p>
                  <p class="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                    {{ tareaActiva.descripcion }}
                  </p>
                </div>
                
                <!-- 🔥 NUEVO: Info ampliada del cliente -->
                <div v-if="tareaActiva.tipo === 'solicitud_cliente' && tareaActiva.clienteInfo" 
                     class="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <div class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ tareaActiva.clienteInfo.nombre || 'Anónimo' }}</span>
                  </div>
                  <div v-if="tareaActiva.clienteInfo.telefono" class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300">{{ tareaActiva.clienteInfo.telefono }}</span>
                  </div>
                  <div v-if="tareaActiva.clienteInfo.email" class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{{ tareaActiva.clienteInfo.email }}</span>
                  </div>
                </div>
                
                <!-- Fila 3: Tiempos en grid horizontal compacto -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                    <p class="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Trabajado</p>
                    <div class="flex items-center gap-1.5">
                      <span class="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-mono tabular-nums leading-none">
                        {{ formatTiempo(tiempoTranscurridoActivo) }}
                      </span>
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                  </div>
                  
                  <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                    <p class="text-[9px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-0.5">Estimado</p>
                    <span class="text-lg font-bold text-blue-700 dark:text-blue-300 font-mono tabular-nums leading-none">
                      {{ formatTiempo(tareaActiva.tiempoEstimadoEmpleado) }}
                    </span>
                  </div>
                  
                  <div 
                    class="rounded-lg px-3 py-2"
                    :class="tiempoRestanteActivo > 0 
                      ? 'bg-orange-50 dark:bg-orange-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'"
                  >
                    <p class="text-[9px] font-semibold uppercase tracking-wider mb-0.5"
                      :class="tiempoRestanteActivo > 0 ? 'text-orange-700 dark:text-orange-400' : 'text-red-700 dark:text-red-400'">
                      Restante
                    </p>
                    <span 
                      class="text-lg font-bold font-mono tabular-nums leading-none"
                      :class="tiempoRestanteActivo > 0 ? 'text-orange-700 dark:text-orange-300' : 'text-red-700 dark:text-red-300'"
                    >
                      {{ tiempoRestanteActivo > 0 ? formatTiempo(tiempoRestanteActivo) : 'Excedido' }}
                    </span>
                  </div>
                </div>
                
                <!-- Fila 4: Progreso compacto con % integrado -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progreso</span>
                    <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{{ progresoRealActivo }}%</span>
                  </div>
                  <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      class="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full h-1.5 transition-all duration-1000 ease-linear" 
                      :style="{ width: `${progresoRealActivo}%` }"
                    ></div>
                  </div>
                </div>
                
                <!-- Fila 5: Botones compactos a la derecha -->
                <div class="flex items-center justify-end gap-2 pt-1">
                  <button 
                    @click="pausarTarea(tareaActiva._id)"
                    class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition shadow-sm"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pausar
                  </button>
                  <button 
                    @click="abrirModalProgreso(tareaActiva)"
                    class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Finalizar
                  </button>
                </div>
              </div>
            </article>
            
            <!-- ============================================================ -->
            <!-- TAREAS PAUSADAS / POR INICIAR (en grid de 2 columnas)        -->
            <!-- ============================================================ -->
            <div 
              v-if="tareasPausadas.length > 0" 
              class="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              <article 
                v-for="tarea in tareasPausadas" 
                :key="tarea._id" 
                class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-900 flex flex-col"
              >
                <div class="p-4 border-b border-gray-100 dark:border-gray-800">
                  <div class="flex items-start justify-between gap-4 mb-2">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {{ tarea.titulo }}
                      </h3>
                      <span class="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold uppercase tracking-wide">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" />
                        </svg>
                        Pausada
                      </span>
                    </div>
                    <span :class="prioridadColorClass(tarea.prioridad)" class="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                      {{ prioridadTextoLabel(tarea.prioridad) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {{ tarea.descripcion || 'Sin descripción' }}
                  </p>
                </div>
                
                <div class="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
                  <div class="p-3 text-center">
                    <p class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Trabajado</p>
                    <p class="text-base font-bold text-gray-700 dark:text-gray-300 font-mono tabular-nums">
                      {{ formatTiempo(tarea.tiempoAcumulado || 0) }}
                    </p>
                  </div>
                  <div class="p-3 text-center">
                    <p class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Estimado</p>
                    <p class="text-base font-bold font-mono tabular-nums"
                       :class="tarea.tiempoEstimadoEmpleado > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'">
                      {{ tarea.tiempoEstimadoEmpleado > 0 ? formatTiempo(tarea.tiempoEstimadoEmpleado) : 'Sin definir' }}
                    </p>
                  </div>
                </div>
                
                <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progreso</span>
                    <span class="text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums">{{ calcularProgresoReal(tarea) }}%</span>
                  </div>
                  <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      class="bg-blue-500 rounded-full h-1.5 transition-all duration-500" 
                      :style="{ width: `${calcularProgresoReal(tarea)}%` }"
                    ></div>
                  </div>
                </div>
                
                <div class="p-4 flex gap-2 mt-auto">
                  <button 
                    v-if="tarea.tiempoEstimadoEmpleado === 0"
                    @click="abrirModalTiempo(tarea)"
                    class="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Establecer tiempo
                  </button>
                  <button 
                    v-else
                    @click="reanudarTarea(tarea._id)"
                    class="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reanudar
                  </button>
                  <button 
                    v-if="tarea.tiempoEstimadoEmpleado > 0"
                    @click="abrirModalProgreso(tarea)"
                    class="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    title="Finalizar tarea"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      
      <!-- ============================================================ -->
      <!-- TAREAS COMPLETADAS                                            -->
      <!-- ============================================================ -->
      <section class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <header class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Tareas completadas</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Historial de tareas finalizadas</p>
            </div>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            {{ tareasCompletadas.length }} {{ tareasCompletadas.length === 1 ? 'tarea' : 'tareas' }}
          </span>
        </header>
        
        <div class="p-5">
          <div v-if="tareasCompletadas.length === 0" class="text-center py-10">
            <div class="w-14 h-14 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Aún no has completado tareas</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Tus logros aparecerán aquí</p>
          </div>
          
          <div v-else class="space-y-2.5">
            <article 
              v-for="tarea in tareasCompletadas" 
              :key="tarea._id" 
              class="border border-gray-200 dark:border-gray-800 rounded-lg p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {{ tarea.titulo }}
                    </h3>
                  </div>
                  
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ new Date(tarea.fechaFinalizada || tarea.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-emerald-600 dark:text-emerald-400 font-semibold">{{ formatTiempo(calcularTiempoTotalReal(tarea)) }}</span>
                      <span v-if="tarea.tiempoEstimadoEmpleado > 0" class="text-gray-400">
                        / {{ formatTiempo(tarea.tiempoEstimadoEmpleado) }}
                      </span>
                    </span>
                  </div>
                  
                  <p v-if="tarea.calificacion?.comentario" class="mt-2 text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2">
                    "{{ tarea.calificacion.comentario }}"
                  </p>
                </div>
                
                <div class="flex-shrink-0">
                  <div v-if="tarea.calificacion?.puntaje" 
                       class="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                    <svg class="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span class="text-xs font-bold text-amber-700 dark:text-amber-400">{{ tarea.calificacion.puntaje }}</span>
                  </div>
                  <span v-else-if="tarea.calificacion?.autoFinalizada" 
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-[10px] font-semibold uppercase">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Auto
                  </span>
                  <span v-else 
                        class="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-medium uppercase">
                    Sin calificar
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
    
    <!-- ============================================================ -->
    <!-- MODALES                                                       -->
    <!-- ============================================================ -->
    <ModalTiempoEstimado
      v-if="tareaParaTiempo"
      :tarjeta="tareaParaTiempo"
      @tiempo-establecido="handleTiempoEstablecido"
    />
    
    <RegistrarProgresoModal
      v-if="tareaParaProgreso"
      :tarjeta="tareaParaProgreso"
      @close="tareaParaProgreso = null"
      @updated="handleTareaFinalizada"
    />
    
    <SolicitudModal
      v-if="modalTareaExtra"
      :extra="true"
      @close="modalTareaExtra = false"
      @created="recargarDatos"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useTarjetasStore } from '~/stores/tarjetas';
import { useRoles } from '~/composables/useRoles';
import { useNotificaciones } from '~/composables/useNotificaciones';
import ModalTiempoEstimado from '~/components/ModalTiempoEstimado.vue';
import RegistrarProgresoModal from '~/components/RegistrarProgresoModal.vue';

definePageMeta({
  middleware: 'auth'
});

console.log('========================================');
console.log('🔧 [Tecnico] Página cargada');
console.log('========================================');

const authStore = useAuthStore();
const tarjetasStore = useTarjetasStore();
const { isTecnico } = useRoles();

if (!isTecnico.value) {
  console.warn('⚠️ [Tecnico] Usuario no es técnico, redirigiendo...');
  navigateTo('/');
}

const config = useRuntimeConfig();

// Estado
const tareasDisponibles = ref([]);
const cargandoDisponibles = ref(false);
const cargandoTarea = ref(false);
const tareaParaTiempo = ref(null);
const tareaParaProgreso = ref(null);
const modalTareaExtra = ref(false);
const menuSilencioAbierto = ref(false);

const opcionesSilencio = [
  { minutos: 15, label: '🔕 15 minutos' },
  { minutos: 30, label: '🔕 30 minutos' },
  { minutos: 60, label: '🔕 1 hora' },
  { minutos: 120, label: '🔕 2 horas' },
  { minutos: 480, label: '🔕 8 horas' }
];

// Variables para Sockets
const socket = ref(null);
let intervaloTiempoReal = null;
let pollingInterval = null;

// Ref reactivo para tiempo en vivo
const ahora = ref(Date.now());

// ============================================================
// 🔔 NOTIFICACIONES
// ============================================================

const {
  configuracion: notifConfig,
  silencioActivo,
  tiempoRestanteSilencio,
  inicializar: inicializarNotificaciones,
  destruir: destruirNotificaciones,
  silenciarPorMinutos,
  reactivarNotificaciones: reactivarNotifComposable,
  notificarNuevaPendiente,
  notificarTareaAsignada
} = useNotificaciones();

// ============================================================
// COMPUTED
// ============================================================

const tareasEnProgreso = computed(() => {
  return tarjetasStore.tarjetas.filter(t => t.estado === 'en_progreso');
});

const tareasCompletadas = computed(() => {
  return tarjetasStore.tarjetas.filter(t => t.estado === 'finalizada' || t.estado === 'revision_cliente');
});

const tareaActiva = computed(() => {
  return tarjetasStore.tarjetas.find(t => t.estadoProgreso === 'activa' && t.estado === 'en_progreso');
});

const tareasPausadas = computed(() => {
  if (!tareaActiva.value) {
    return tareasEnProgreso.value;
  }
  return tareasEnProgreso.value.filter(t => t._id !== tareaActiva.value._id);
});

// Computed de tiempo en vivo
const tiempoTranscurridoActivo = computed(() => {
  if (!tareaActiva.value) return 0;
  return calcularTiempoTranscurrido(tareaActiva.value);
});

const tiempoRestanteActivo = computed(() => {
  if (!tareaActiva.value) return 0;
  return calcularTiempoRestante(tareaActiva.value);
});

const progresoRealActivo = computed(() => {
  if (!tareaActiva.value) return 0;
  return calcularProgresoReal(tareaActiva.value);
});

// ============================================================
// FUNCIONES DE CÁLCULO
// ============================================================

const calcularProgresoReal = (tarea) => {
  if (!tarea?.tiempoEstimadoEmpleado || tarea.tiempoEstimadoEmpleado <= 0) {
    return tarea?.porcentajeCompletado || 0;
  }
  
  let tiempoTotal = tarea.tiempoAcumulado || 0;
  
  if (tarea.estadoProgreso === 'activa' && tarea.fechaUltimaReanudacion) {
    const inicio = new Date(tarea.fechaUltimaReanudacion).getTime();
    const minutosDesdeReanudacion = Math.floor((ahora.value - inicio) / 1000 / 60);
    tiempoTotal += minutosDesdeReanudacion;
  }
  
  const tiempoEstimado = tarea.tiempoEstimadoEmpleado;
  let progreso = Math.min(100, Math.floor((tiempoTotal / tiempoEstimado) * 100));
  progreso = Math.max(progreso, tarea.porcentajeCompletado || 0);
  
  return Math.min(100, progreso);
};

const calcularTiempoTranscurrido = (tarea) => {
  if (!tarea) return 0;
  
  let tiempoTotal = tarea.tiempoAcumulado || 0;
  
  if (tarea.estadoProgreso === 'activa' && tarea.fechaUltimaReanudacion) {
    const inicio = new Date(tarea.fechaUltimaReanudacion).getTime();
    const minutosDesdeReanudacion = Math.floor((ahora.value - inicio) / 1000 / 60);
    tiempoTotal += minutosDesdeReanudacion;
  }
  
  return tiempoTotal;
};

const calcularTiempoRestante = (tarea) => {
  if (!tarea) return 0;
  const estimado = tarea.tiempoEstimadoEmpleado || 0;
  const transcurrido = calcularTiempoTranscurrido(tarea);
  return Math.max(0, estimado - transcurrido);
};

const calcularTiempoTotalReal = (tarea) => {
  if (!tarea) return 0;
  
  if (tarea.tiempoAcumulado && tarea.tiempoAcumulado > 0) {
    return tarea.tiempoAcumulado;
  }
  
  if (tarea.horasTotalesReales || tarea.minutosTotalesReales) {
    return ((tarea.horasTotalesReales || 0) * 60) + (tarea.minutosTotalesReales || 0);
  }
  
  if (tarea.registroHoras?.length) {
    return tarea.registroHoras.reduce((sum, reg) => {
      return sum + ((reg.horasTrabajadas || 0) * 60) + (reg.minutosTrabajados || 0);
    }, 0);
  }
  
  return 0;
};

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

const formatTiempo = (minutos) => {
  if (!minutos && minutos !== 0) return '0 min';
  if (minutos === 0) return '0 min';
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h ${mins}min`;
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
  const map = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    urgente: 'Urgente'
  };
  return map[prioridad] || 'Media';
};

// ============================================================
// 🔔 ACCIONES DE SILENCIO
// ============================================================

const silencioSeleccionado = async (minutos) => {
  menuSilencioAbierto.value = false;
  const ok = await silenciarPorMinutos(minutos);
  if (ok) {
    console.log(`🔕 Notificaciones silenciadas por ${minutos} min`);
  }
};

const reactivarNotificaciones = async () => {
  const ok = await reactivarNotifComposable();
  if (ok) {
    console.log('🔔 Notificaciones reactivadas');
  }
};

// ============================================================
// CONFIGURAR SOCKETS
// ============================================================

const configurarSockets = () => {
  console.log('🔌 [Tecnico] Configurando sockets...');
  
  const nuxtApp = useNuxtApp();
  socket.value = nuxtApp.$socket;
  
  if (!socket.value) {
    console.warn('⚠️ [Tecnico] Socket no disponible, usando polling como fallback');
    iniciarPollingFallback();
    return;
  }
  
  console.log('✅ [Tecnico] Socket disponible');
  console.log('🔌 [Tecnico] Socket ID:', socket.value.id);
  
  socket.value.on('notificacion-nueva-pendiente', (data) => {
    notificarNuevaPendiente(data);
    recargarDatos();
  });
  
  socket.value.on('notificacion-tarea-asignada', (data) => {
    notificarTareaAsignada(data);
    recargarDatos();
  });
  
  socket.value.on('nueva-tarea-disponible', () => recargarDatos());
  socket.value.on('tarea-tomada', () => recargarDatos());
  socket.value.on('tarea-asignada', (data) => {
    if (data.tarea?.asignadoA?._id === authStore.user?._id) recargarDatos();
  });
  socket.value.on('nueva-tarea-asignada', () => recargarDatos());
  socket.value.on('estado-actualizado', (data) => {
    if (data.empleadoId === authStore.user?._id) recargarDatos();
  });
  socket.value.on('estado-general-actualizado', (data) => {
    const tarea = tarjetasStore.tarjetas.find(t => t._id === data.tareaId);
    if (tarea && tarea.asignadoA?._id === authStore.user?._id) recargarDatos();
  });
  socket.value.on('tarea-iniciada-tiempo-real', (data) => {
    if (data.empleado?.id === authStore.user?._id) recargarDatos();
  });
  socket.value.on('tarea-pausada-tiempo-real', (data) => {
    if (data.empleadoId === authStore.user?._id) recargarDatos();
  });
  socket.value.on('tarea-reanudada-tiempo-real', (data) => {
    if (data.empleadoId === authStore.user?._id) recargarDatos();
  });
  socket.value.on('progreso-actualizado', () => recargarDatos());
  socket.value.on('tarea-completada-automaticamente', () => recargarDatos());
  socket.value.on('tarea-calificada', () => recargarDatos());
  socket.value.on('tarea-auto-finalizada', () => recargarDatos());
  socket.value.on('tiempo-estimado-establecido', () => recargarDatos());
  socket.value.on('tarea-finalizada-por-ti', () => recargarDatos());
  socket.value.on('tarea-reasignada', () => recargarDatos());
  socket.value.on('rol-actualizado', (data) => {
    if (data.userId === authStore.user?._id) {
      authStore.user.rol = data.nuevoRol;
      localStorage.setItem('user', JSON.stringify(authStore.user));
      alert(`✅ Tu rol ha sido actualizado a: ${data.nuevoRol}`);
      setTimeout(() => window.location.reload(), 1500);
    }
  });
  socket.value.on('notificaciones-actualizadas', () => {
    console.log('🔔 Config actualizada');
  });
  
  console.log('✅ [Tecnico] Todos los eventos configurados');
};

const iniciarPollingFallback = () => {
  pollingInterval = setInterval(async () => {
    await recargarDatos();
  }, 15000);
};

// ============================================================
// ACCIONES
// ============================================================

const cargarTareasDisponibles = async () => {
  cargandoDisponibles.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/disponibles`;
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 🔥 Comparar firmas antes de reemplazar (anti-parpadeo)
    const firmaActual = tareasDisponibles.value.map(t => t._id).sort().join('|');
    const firmaNueva = response.map(t => t._id).sort().join('|');
    
    if (firmaActual === firmaNueva && tareasDisponibles.value.length === response.length) {
      return;
    }
    
    tareasDisponibles.value = response;
  } catch (error) {
    console.error('❌ [Tecnico] Error cargando tareas disponibles:', error);
  } finally {
    cargandoDisponibles.value = false;
  }
};

const recargarDatos = async () => {
  await tarjetasStore.fetchTarjetas();
  await cargarTareasDisponibles();
};

const tomarSiguienteTarea = async () => {
  cargandoTarea.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/tomar-siguiente`;
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.success) {
      await recargarDatos();
      alert('✅ Tarea asignada exitosamente');
    }
  } catch (error) {
    console.error('❌ [Tecnico] Error:', error);
    alert(error.data?.message || 'Error al tomar la tarea');
  } finally {
    cargandoTarea.value = false;
  }
};

const tomarTareaEspecifica = async (id) => {
  cargandoTarea.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${id}/tomar`;
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.success) {
      await recargarDatos();
      alert('✅ Tarea asignada exitosamente');
    }
  } catch (error) {
    console.error('❌ [Tecnico] Error:', error);
    alert(error.data?.message || 'Error al tomar la tarea');
  } finally {
    cargandoTarea.value = false;
  }
};

const pausarTarea = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${id}/pausar`;
    await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    await recargarDatos();
    alert('⏸️ Tarea pausada');
  } catch (error) {
    console.error('❌ [Tecnico] Error al pausar:', error);
    alert('Error al pausar');
  }
};

const reanudarTarea = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${id}/reanudar`;
    const response = await $fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.success) {
      await recargarDatos();
      alert('▶️ Tarea reanudada');
    }
  } catch (error) {
    console.error('❌ [Tecnico] Error al reanudar:', error);
    alert('Error al reanudar la tarea');
  }
};

const abrirModalTiempo = (tarea) => {
  tareaParaTiempo.value = tarea;
};

const abrirModalProgreso = (tarea) => {
  tareaParaProgreso.value = tarea;
};

const handleTiempoEstablecido = async () => {
  tareaParaTiempo.value = null;
  await recargarDatos();
};

const handleTareaFinalizada = async () => {
  tareaParaProgreso.value = null;
  await recargarDatos();
  setTimeout(recargarDatos, 800);
};

const logout = () => {
  authStore.logout();
};

const abrirModalTareaExtra = () => {
  modalTareaExtra.value = true;
};

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  console.log('========================================');
  console.log('🔄 [Tecnico] onMounted - Iniciando...');
  console.log('========================================');
  
  authStore.loadFromStorage();
  console.log('🔍 [Tecnico] Usuario:', authStore.user);
  console.log('🔍 [Tecnico] Rol:', authStore.user?.rol);
  
  await recargarDatos();
  configurarSockets();
  
  await inicializarNotificaciones({
    estaLibre: () => !tareaActiva.value
  });
  
  setTimeout(() => {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.$socket && authStore.user?._id) {
      console.log('🔄 [Tecnico] Forzando join al socket...');
      nuxtApp.$socket.emit('join', authStore.user._id);
    }
  }, 1000);
  
  // Tiempo en vivo cada 1s
  if (intervaloTiempoReal) clearInterval(intervaloTiempoReal);
  intervaloTiempoReal = setInterval(() => {
    ahora.value = Date.now();
  }, 1000);
  
  // 🔥 Anti-parpadeo: polling cada 30s, solo si el socket está caído
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    const nuxtApp = useNuxtApp();
    const socketActivo = nuxtApp.$socket;
    if (!socketActivo || !socketActivo.connected) {
      console.log('🔄 [Tecnico] Polling de respaldo (socket caído)');
      await recargarDatos();
    }
  }, 30000);
  
  console.log('✅ [Tecnico] Inicialización completada');
  console.log('========================================');
});

onUnmounted(() => {
  console.log('🛑 [Tecnico] onUnmounted - Limpiando...');
  
  if (intervaloTiempoReal) {
    clearInterval(intervaloTiempoReal);
    intervaloTiempoReal = null;
  }
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  destruirNotificaciones();
  
  if (socket.value) {
    socket.value.off('notificacion-nueva-pendiente');
    socket.value.off('notificacion-tarea-asignada');
    socket.value.off('nueva-tarea-disponible');
    socket.value.off('tarea-tomada');
    socket.value.off('tarea-asignada');
    socket.value.off('nueva-tarea-asignada');
    socket.value.off('estado-actualizado');
    socket.value.off('estado-general-actualizado');
    socket.value.off('tarea-iniciada-tiempo-real');
    socket.value.off('tarea-pausada-tiempo-real');
    socket.value.off('tarea-reanudada-tiempo-real');
    socket.value.off('progreso-actualizado');
    socket.value.off('tarea-completada-automaticamente');
    socket.value.off('tarea-calificada');
    socket.value.off('tarea-auto-finalizada');
    socket.value.off('tiempo-estimado-establecido');
    socket.value.off('tarea-finalizada-por-ti');
    socket.value.off('tarea-reasignada');
    socket.value.off('rol-actualizado');
    socket.value.off('notificaciones-actualizadas');
  }
  
  console.log('✅ [Tecnico] Limpieza completada');
});
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>