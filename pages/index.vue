<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navbar para usuarios autenticados -->
    <nav v-if="authStore.isAuthenticated" class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white text-sm font-bold">CP</span>
            </div>
            <h1 class="text-base font-semibold text-gray-800">Control de Personal</h1>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-xs font-medium text-blue-700">{{ authStore.user?.nombre?.charAt(0) }}</span>
              </div>
              <span class="text-sm text-gray-700 hidden sm:inline">{{ authStore.user?.nombre?.split(' ')[0] }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="rolBadgeClass">{{ rolTexto }}</span>
            </div>
            <button
              @click="logout"
              class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Header público -->
    <div v-else class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white text-sm font-bold">CP</span>
            </div>
            <h1 class="text-base font-semibold text-gray-800">Control de Personal</h1>
          </div>
          <div class="flex gap-2">
            <NuxtLink to="/login" class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Iniciar Sesión
            </NuxtLink>
            <NuxtLink to="/register" class="px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
              Registrarse
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Contenido para JEFE -->
      <div v-if="authStore.isAuthenticated && isJefe">
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="tab in tabsJefe"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'"
            class="px-3 py-1.5 rounded-md transition flex items-center gap-1.5 text-sm shadow-sm"
          >
            <span class="text-base">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
          
          <button
            @click="abrirModalSolicitud"
            class="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-1.5 ml-auto text-sm shadow-sm"
          >
            <span class="text-base">+</span>
            <span>Nueva Solicitud (Cliente)</span>
          </button>
        </div>
        
        <div class="mb-6">
          <EstadoEmpleados />
        </div>
        
        <div v-if="activeTab === 'kanban'">
          <KanbanBoard ref="kanbanBoardRef" />
        </div>
        
        <div v-if="activeTab === 'dashboard'">
          <DashboardEstadisticas />
        </div>
        
        <div v-if="activeTab === 'reportes'">
          <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 class="text-lg font-bold mb-3 text-gray-800">📈 Reportes Avanzados</h2>
            <p class="text-sm text-gray-500">Próximamente: Exportar a Excel, PDF, reportes personalizados</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h3 class="text-sm font-semibold text-gray-800">📊 Productividad</h3>
                <p class="text-xl font-bold text-blue-600">{{ eficienciaGeneral }}%</p>
                <p class="text-xs text-gray-500">Eficiencia del equipo</p>
              </div>
              <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h3 class="text-sm font-semibold text-gray-800">⏱️ Horas Extras</h3>
                <p class="text-xl font-bold text-blue-600">{{ totalHorasExtras }}h</p>
                <p class="text-xs text-gray-500">Últimos 30 días</p>
              </div>
              <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h3 class="text-sm font-semibold text-gray-800">⭐ Satisfacción</h3>
                <p class="text-xl font-bold text-blue-600">{{ calificacionGeneral }}</p>
                <p class="text-xs text-gray-500">Promedio clientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Contenido para EMPLEADO (y JEFE cuando ve su vista personal) -->
      <div v-else-if="authStore.isAuthenticated && (isEmpleado || isJefe)">
        <div class="mb-4 flex justify-end gap-2">
          <button
            @click="cargarTareasDisponibles"
            class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-1.5 text-sm shadow-sm"
          >
            <span class="text-base">🔄</span>
            <span>Actualizar</span>
          </button>
          <button
            @click="abrirModalTareaExtra"
            class="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center gap-1.5 text-sm shadow-sm"
          >
            <span class="text-base">📝</span>
            <span>Mi Tarea Extra</span>
          </button>
        </div>
        
        <!-- Estado de Empleados (solo empleados) -->
        <div v-if="isEmpleado" class="mb-6">
          <EstadoEmpleados />
        </div>
        
        <!-- ========== TAREA ACTIVA DESTACADA CON TIEMPO REAL ========== -->
        <div v-if="tareaActiva" class="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500 rounded-lg p-6 mb-6 shadow-lg">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
                  <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  ▶️ ACTIVA AHORA
                </span>
                <span class="text-sm text-gray-500">Tarea en ejecución</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800">{{ tareaActiva.titulo }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ tareaActiva.descripcion || 'Sin descripción' }}</p>
              <div class="mt-2 text-xs text-gray-500">
                <span>👤 Asignada a: {{ tareaActiva.asignadoA?.nombre || 'Ti mismo' }}</span>
              </div>
            </div>
            <button 
              @click="pausarTareaActiva"
              class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
            >
              <span>⏸️</span> Pausar
            </button>
          </div>
          
          <!-- TIMER EN TIEMPO REAL - VISIBLE Y GRANDE -->
          <div class="mt-4 pt-4 border-t border-green-300">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <div class="text-xs text-gray-500 uppercase tracking-wide">Tiempo Estimado</div>
                <div class="text-2xl font-bold text-blue-600">{{ formatTiempo(tareaActiva.tiempoEstimadoEmpleado) }}</div>
              </div>
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <div class="text-xs text-gray-500 uppercase tracking-wide">Tiempo Transcurrido</div>
                <div class="text-2xl font-bold text-green-600" id="timer-transcurrido">
                  {{ formatTiempo(tiempoTranscurrido) }}
                </div>
              </div>
              <div class="bg-white rounded-lg p-3 shadow-sm">
                <div class="text-xs text-gray-500 uppercase tracking-wide">Tiempo Restante</div>
                <div class="text-2xl font-bold" :class="tiempoRestante < 60 ? 'text-red-600 animate-pulse' : 'text-orange-600'">
                  {{ formatTiempo(tiempoRestante) }}
                </div>
              </div>
            </div>
            
            <!-- Barra de progreso con porcentaje -->
            <div class="mt-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium">Progreso Automático</span>
                <span class="font-bold text-green-600">{{ porcentajeAutomatico }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div 
                  class="bg-green-500 rounded-full h-4 transition-all duration-500"
                  :style="{ width: `${porcentajeAutomatico}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-400 text-center mt-2">
                Actualización cada 5 segundos
              </p>
            </div>
          </div>
        </div>
        
        <!-- Tareas disponibles -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">📋 Tareas Disponibles</h2>
            <button 
              @click="tomarSiguienteTarea" 
              :disabled="cargandoTarea || tareasDisponibles.length === 0"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              <span>🎯</span>
              {{ cargandoTarea ? 'Tomando...' : 'Tomar Siguiente Tarea' }}
            </button>
          </div>
          
          <div v-if="cargandoDisponibles" class="text-center py-8 text-gray-500">
            <div class="animate-pulse">Cargando tareas disponibles...</div>
          </div>
          
          <div v-else-if="tareasDisponibles.length === 0" class="text-center py-8 text-gray-500">
            No hay tareas disponibles en este momento
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="tarea in tareasDisponibles" 
              :key="tarea._id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-green-300"
              @click="tomarTareaEspecifica(tarea._id)"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-gray-800">{{ tarea.titulo }}</h3>
                <span :class="prioridadColorClass(tarea.prioridad)" class="px-2 py-0.5 rounded-full text-xs">
                  {{ prioridadTextoLabel(tarea.prioridad) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ tarea.descripcion || 'Sin descripción' }}</p>
              <div class="text-xs text-gray-500">
                <div v-if="tarea.clienteInfo">
                  <span>👤 {{ tarea.clienteInfo.nombre || 'Anónimo' }}</span>
                  <span v-if="tarea.clienteInfo.telefono" class="ml-2">📞 {{ tarea.clienteInfo.telefono }}</span>
                </div>
                <div class="mt-1">📅 Creada: {{ new Date(tarea.createdAt).toLocaleDateString() }}</div>
              </div>
              <button 
                class="mt-3 w-full bg-green-500 text-white py-1.5 rounded text-sm hover:bg-green-600 transition"
                @click.stop="tomarTareaEspecifica(tarea._id)"
              >
                Tomar tarea
              </button>
            </div>
          </div>
        </div>
        
        <!-- Mis Tareas en Progreso (pausadas) -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">⚙️ Mis Tareas en Progreso (Pausadas)</h2>
          
          <div v-if="tareasPausadas.length === 0" class="text-center py-8 text-gray-500">
            No tienes tareas pausadas
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="tarea in tareasPausadas" :key="tarea._id" 
                 class="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-800">{{ tarea.titulo }}</h3>
                  <span class="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                    <span>⏸️</span> Pausada
                  </span>
                </div>
                <span :class="prioridadColorClass(tarea.prioridad)" class="px-2 py-0.5 rounded-full text-xs">
                  {{ prioridadTextoLabel(tarea.prioridad) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ tarea.descripcion || 'Sin descripción' }}</p>
              
              <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span class="text-gray-500">Progreso:</span>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div class="bg-blue-600 rounded-full h-2" :style="{ width: `${tarea.porcentajeCompletado}%` }"></div>
                  </div>
                  <span class="text-xs">{{ tarea.porcentajeCompletado }}%</span>
                </div>
                <div>
                  <span class="text-gray-500">Tiempo estimado:</span>
                  <span class="font-medium ml-1">{{ formatTiempo(tarea.tiempoEstimadoEmpleado) }}</span>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button 
                  v-if="tarea.tiempoEstimadoEmpleado === 0"
                  @click="abrirModalTiempo(tarea)"
                  class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  🚀 Establecer tiempo
                </button>
                <button 
                  v-else
                  @click="reanudarTarea(tarea._id)"
                  class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  ▶️ Reanudar
                </button>
                <button 
                  @click="abrirModalProgreso(tarea)"
                  class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  📊 Registrar progreso
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tareas completadas -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">✅ Tareas Completadas</h2>
          
          <div v-if="tareasCompletadas.length === 0" class="text-center py-8 text-gray-500">
            Aún no has completado ninguna tarea
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="tarea in tareasCompletadas" :key="tarea._id" class="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-gray-800">{{ tarea.titulo }}</h3>
                  <p class="text-xs text-gray-500 mt-1">Completada: {{ new Date(tarea.fechaFinalizada || tarea.updatedAt).toLocaleDateString() }}</p>
                </div>
                <div v-if="tarea.calificacion?.puntaje" class="flex items-center gap-1">
                  <span class="text-yellow-500">★</span>
                  <span class="font-medium">{{ tarea.calificacion.puntaje }}/5</span>
                </div>
                <span v-else class="text-xs text-gray-400">Sin calificar</span>
              </div>
              <div v-if="tarea.calificacion?.comentario" class="mt-2 text-sm text-gray-600 italic">
                "{{ tarea.calificacion.comentario }}"
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Contenido para CLIENTE -->
      <div v-else-if="authStore.isAuthenticated && isCliente">
        <div class="mb-4 flex justify-end">
          <button
            @click="abrirModalSolicitud"
            class="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-1.5 text-sm shadow-sm"
          >
            <span class="text-base">+</span>
            <span>Nueva Solicitud</span>
          </button>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">📋 Mis Solicitudes</h2>
          
          <div v-if="misSolicitudes.length === 0" class="text-center py-8 text-gray-500">
            No tienes solicitudes. Crea una nueva solicitud.
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="tarea in misSolicitudes" :key="tarea._id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-gray-800">{{ tarea.titulo }}</h3>
                <span :class="estadoColorClass(tarea.estado)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ estadoTextoLabel(tarea.estado) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ tarea.descripcion || 'Sin descripción' }}</p>
              
              <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span class="text-gray-500">Empleado asignado:</span>
                  <span class="font-medium ml-1">{{ tarea.asignadoA?.nombre || 'Sin asignar' }}</span>
                </div>
                <div v-if="tarea.porcentajeCompletado > 0">
                  <span class="text-gray-500">Progreso:</span>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div class="bg-blue-600 rounded-full h-2" :style="{ width: `${tarea.porcentajeCompletado}%` }"></div>
                  </div>
                  <span class="text-xs">{{ tarea.porcentajeCompletado }}%</span>
                </div>
              </div>
              
              <button 
                v-if="tarea.estado === 'revision_cliente' && !tarea.calificacion"
                @click="abrirModalCalificar(tarea)"
                class="mt-2 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition text-sm w-full"
              >
                ⭐ Calificar servicio
              </button>
              
              <div v-if="tarea.calificacion?.puntaje" class="mt-3 pt-3 border-t border-gray-200">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">Tu calificación:</span>
                  <span class="text-yellow-500">{{ '★'.repeat(tarea.calificacion.puntaje) }}{{ '☆'.repeat(5 - tarea.calificacion.puntaje) }}</span>
                  <span class="text-xs text-gray-500">({{ tarea.calificacion.puntaje }}/5)</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ tarea.calificacion.comentario }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sección pública -->
      <div v-else>
        <div class="max-w-2xl mx-auto">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-6 text-white">
            <h2 class="text-2xl font-bold mb-2">Bienvenido a Control de Personal</h2>
            <p class="text-blue-100">Sistema de gestión de tareas y servicios</p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl">📝</span>
              </div>
              <h2 class="text-xl font-bold text-gray-800">Solicitar Servicio</h2>
              <p class="text-sm text-gray-600 mt-1">
                Complete el formulario para solicitar un servicio.
                <NuxtLink to="/register" class="text-blue-600 hover:underline font-medium">Regístrese</NuxtLink>
                para obtener prioridad y seguimiento.
              </p>
            </div>
            
            <form @submit="handleSolicitudPublica" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="solicitudPublica.nombre"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Juan Pérez"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="solicitudPublica.telefono"
                    type="tel"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="555-1234"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Email <span class="text-gray-400">(opcional)</span>
                </label>
                <input
                  v-model="solicitudPublica.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Título del servicio <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="solicitudPublica.titulo"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Reparación de computadora"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="solicitudPublica.descripcion"
                  rows="4"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describa detalladamente el servicio que necesita..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                :disabled="loadingPublica"
                class="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                {{ loadingPublica ? 'Enviando...' : 'Enviar Solicitud' }}
              </button>
            </form>
            
            <div v-if="mensajePublico" class="mt-4 p-3 rounded-lg" :class="mensajePublicoError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ mensajePublicoError ? '⚠️' : '✅' }}</span>
                <span class="text-sm">{{ mensajePublico }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div class="text-2xl mb-2">🔧</div>
              <h3 class="font-semibold text-gray-800">Servicios Rápidos</h3>
              <p class="text-xs text-gray-500 mt-1">Respuesta en menos de 24h</p>
            </div>
            <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div class="text-2xl mb-2">⭐</div>
              <h3 class="font-semibold text-gray-800">Prioridad Alta</h3>
              <p class="text-xs text-gray-500 mt-1">Regístrate para obtener prioridad</p>
            </div>
            <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div class="text-2xl mb-2">📊</div>
              <h3 class="font-semibold text-gray-800">Seguimiento</h3>
              <p class="text-xs text-gray-500 mt-1">Sigue el estado de tu solicitud</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modales -->
    <ModalTiempoEstimado
      v-if="tareaParaTiempo"
      :tarjeta="tareaParaTiempo"
      @tiempo-establecido="handleTiempoEstablecido"
    />
    
    <RegistrarProgresoModal
      v-if="tareaParaProgreso"
      :tarjeta="tareaParaProgreso"
      @close="tareaParaProgreso = null"
      @updated="recargarDatos"
    />
    
    <CalificarModal
      v-if="tareaParaCalificar"
      :tarjeta="tareaParaCalificar"
      @close="tareaParaCalificar = null"
      @calificado="recargarDatos"
    />
    
    <SolicitudModal
      v-if="modalSolicitud"
      :extra="false"
      @close="modalSolicitud = false"
      @created="recargarDatos"
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
import ModalTiempoEstimado from '~/components/ModalTiempoEstimado.vue';
import RegistrarProgresoModal from '~/components/RegistrarProgresoModal.vue';
import CalificarModal from '~/components/CalificarModal.vue';
import EstadoEmpleados from '~/components/EstadoEmpleados.vue';

const authStore = useAuthStore();
const tarjetasStore = useTarjetasStore();
const config = useRuntimeConfig();

const isJefe = computed(() => authStore.isJefe);
const isEmpleado = computed(() => authStore.isEmpleado);
const isCliente = computed(() => authStore.isCliente);

const rolTexto = computed(() => {
  const map = { jefe: 'Jefe', empleado: 'Empleado', cliente: 'Cliente' };
  return map[authStore.user?.rol] || '';
});

const rolBadgeClass = computed(() => {
  const map = { 
    jefe: 'bg-red-100 text-red-700', 
    empleado: 'bg-blue-100 text-blue-700', 
    cliente: 'bg-green-100 text-green-700' 
  };
  return map[authStore.user?.rol] || '';
});

const tabsJefe = ref([
  { key: 'kanban', label: 'Kanban', icon: '📌' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'reportes', label: 'Reportes', icon: '📈' }
]);

const activeTab = ref('kanban');

// Modales
const modalSolicitud = ref(false);
const modalTareaExtra = ref(false);
const tareaParaTiempo = ref(null);
const tareaParaProgreso = ref(null);
const tareaParaCalificar = ref(null);
const kanbanBoardRef = ref(null);

// Formulario público
const solicitudPublica = ref({
  nombre: '',
  telefono: '',
  email: '',
  titulo: '',
  descripcion: ''
});

const loadingPublica = ref(false);
const mensajePublico = ref('');
const mensajePublicoError = ref(false);

// Tareas disponibles
const tareasDisponibles = ref([]);
const cargandoDisponibles = ref(false);
const cargandoTarea = ref(false);

// Estado de tiempo real para tarea activa
const tiempoTranscurrido = ref(0);
const tiempoRestante = ref(0);
const porcentajeAutomatico = ref(0);
let intervaloTiempo = null;

// Computed
const tareasEnProgreso = computed(() => {
  return tarjetasStore.tarjetas.filter(t => 
    t.estado === 'en_progreso'
  );
});

const tareasPausadas = computed(() => {
  return tarjetasStore.tarjetas.filter(t => 
    t.estado === 'en_progreso' && t.estadoProgreso !== 'activa'
  );
});

const tareasCompletadas = computed(() => {
  return tarjetasStore.tarjetas.filter(t => 
    t.estado === 'finalizada' || t.estado === 'revision_cliente'
  );
});

const tareaActiva = computed(() => {
  return tarjetasStore.tarjetas.find(t => 
    t.estadoProgreso === 'activa' && 
    t.estado === 'en_progreso'
  );
});

const misSolicitudes = computed(() => {
  return tarjetasStore.tarjetas;
});

// Métricas jefe
const eficienciaGeneral = ref(0);
const totalHorasExtras = ref(0);
const calificacionGeneral = ref(0);

// Funciones de utilidad
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
    baja: 'bg-gray-100 text-gray-700',
    media: 'bg-blue-100 text-blue-700',
    alta: 'bg-orange-100 text-orange-700',
    urgente: 'bg-red-100 text-red-700'
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

const estadoTextoLabel = (estado) => {
  const map = {
    pendiente: '📋 Pendiente',
    en_progreso: '⚙️ En Progreso',
    revision_jefe: '👔 En Revisión',
    revision_cliente: '⭐ Esperando Calificación',
    finalizada: '🏁 Finalizada'
  };
  return map[estado] || estado;
};

const estadoColorClass = (estado) => {
  const map = {
    pendiente: 'bg-gray-100 text-gray-700',
    en_progreso: 'bg-blue-100 text-blue-700',
    revision_jefe: 'bg-orange-100 text-orange-700',
    revision_cliente: 'bg-yellow-100 text-yellow-700',
    finalizada: 'bg-green-100 text-green-700'
  };
  return map[estado] || 'bg-gray-100 text-gray-700';
};

// Actualizar tiempo real de la tarea activa
const actualizarTiempoReal = async () => {
  if (!tareaActiva.value) return;
  
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/${tareaActiva.value._id}/progreso-automatico`;
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.estaActiva) {
      tiempoTranscurrido.value = response.tiempoTranscurrido;
      tiempoRestante.value = response.tiempoRestante;
      porcentajeAutomatico.value = response.porcentajeCalculado;
      
      // Actualizar el progreso en el store
      if (response.porcentajeCalculado > tareaActiva.value.porcentajeCompletado) {
        tareaActiva.value.porcentajeCompletado = response.porcentajeCalculado;
      }
    }
  } catch (error) {
    console.error('Error actualizando tiempo real:', error);
  }
};

// Iniciar intervalo de tiempo real
const iniciarIntervaloTiempoReal = () => {
  if (intervaloTiempo) clearInterval(intervaloTiempo);
  intervaloTiempo = setInterval(() => {
    actualizarTiempoReal();
  }, 5000); // Cada 5 segundos
};

// Detener intervalo
const detenerIntervaloTiempoReal = () => {
  if (intervaloTiempo) {
    clearInterval(intervaloTiempo);
    intervaloTiempo = null;
  }
};

// Recargar datos
const recargarDatos = async () => {
  await tarjetasStore.fetchTarjetas();
  if (isJefe.value) {
    await tarjetasStore.fetchEstadisticas();
    cargarMetricas();
  }
  if (isEmpleado.value || isJefe.value) {
    await cargarTareasDisponibles();
  }
  
  // Gestionar intervalo según tarea activa
  if (tareaActiva.value) {
    iniciarIntervaloTiempoReal();
    await actualizarTiempoReal();
  } else {
    detenerIntervaloTiempoReal();
    tiempoTranscurrido.value = 0;
    tiempoRestante.value = 0;
    porcentajeAutomatico.value = 0;
  }
};

const cargarTareasDisponibles = async () => {
  cargandoDisponibles.value = true;
  try {
    const token = localStorage.getItem('token');
    const url = `${config.public.apiBase}/tarjetas/disponibles`;
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    tareasDisponibles.value = response;
  } catch (error) {
    console.error('Error cargando tareas disponibles:', error);
  } finally {
    cargandoDisponibles.value = false;
  }
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
    console.error('Error:', error);
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
    console.error('Error:', error);
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
    alert('Error al pausar');
  }
};

const pausarTareaActiva = async () => {
  if (tareaActiva.value) {
    await pausarTarea(tareaActiva.value._id);
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
    console.error('Error:', error);
    alert('Error al reanudar la tarea');
  }
};

const abrirModalTiempo = (tarea) => {
  tareaParaTiempo.value = tarea;
};

const abrirModalProgreso = (tarea) => {
  tareaParaProgreso.value = tarea;
};

const abrirModalCalificar = (tarea) => {
  tareaParaCalificar.value = tarea;
};

const handleTiempoEstablecido = async () => {
  tareaParaTiempo.value = null;
  await recargarDatos();
};

const cargarMetricas = () => {
  const tarjetas = tarjetasStore.tarjetas;
  const completadas = tarjetas.filter(t => t.estado === 'finalizada');
  const conHorasExtras = tarjetas.filter(t => t.registroHoras?.some(r => r.esHoraExtra));
  const calificadas = tarjetas.filter(t => t.calificacion?.puntaje);
  
  eficienciaGeneral.value = completadas.length ? Math.round((completadas.length / (tarjetas.length || 1)) * 100) : 0;
  totalHorasExtras.value = conHorasExtras.reduce((sum, t) => {
    return sum + (t.registroHoras?.filter(r => r.esHoraExtra).reduce((s, r) => s + (r.horasTrabajadas || 0), 0) || 0);
  }, 0);
  calificacionGeneral.value = calificadas.length ? (calificadas.reduce((sum, t) => sum + (t.calificacion?.puntaje || 0), 0) / calificadas.length).toFixed(1) : '0.0';
};

// Solicitud pública
const handleSolicitudPublica = async (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  loadingPublica.value = true;
  mensajePublico.value = '';
  mensajePublicoError.value = false;
  
  try {
    const url = 'http://localhost:5000/api/solicitudes/publicas';
    const payload = {
      titulo: solicitudPublica.value.titulo,
      descripcion: solicitudPublica.value.descripcion,
      horasEstimadas: 0,
      minutosEstimados: 0,
      clienteInfo: {
        logueado: false,
        nombre: solicitudPublica.value.nombre,
        telefono: solicitudPublica.value.telefono,
        email: solicitudPublica.value.email || ''
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      mensajePublico.value = '✅ ¡Solicitud enviada exitosamente! Un empleado se asignará a tu solicitud.';
      mensajePublicoError.value = false;
      
      solicitudPublica.value = {
        nombre: '',
        telefono: '',
        email: '',
        titulo: '',
        descripcion: ''
      };
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      throw new Error(data.message || 'Error al enviar la solicitud');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    mensajePublico.value = '❌ Error al enviar la solicitud. Por favor intente nuevamente.';
    mensajePublicoError.value = true;
  } finally {
    loadingPublica.value = false;
  }
};

const refreshTareasDisponibles = async () => {
  await cargarTareasDisponibles();
};

if (process.client) {
  window.refreshTareasDisponibles = refreshTareasDisponibles;
}

// Polling
let pollingInterval = null;

onMounted(async () => {
  authStore.loadFromStorage();
  
  if (authStore.isAuthenticated) {
    await recargarDatos();
  }
  
  pollingInterval = setInterval(async () => {
    if (authStore.isAuthenticated) {
      await recargarDatos();
    }
  }, 30000);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
  detenerIntervaloTiempoReal();
});

const logout = () => {
  authStore.logout();
};

const abrirModalSolicitud = () => {
  modalSolicitud.value = true;
};

const abrirModalTareaExtra = () => {
  modalTareaExtra.value = true;
};
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>