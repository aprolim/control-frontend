// plugins/socket.client.js
import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  if (process.client) {
    const config = useRuntimeConfig();
    
    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 20;
    
    try {
      console.log('🔌 [Socket] Iniciando conexión a:', config.public.wsUrl);
      
      socket = io(config.public.wsUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true
      });
    } catch (error) {
      console.warn('⚠️ [Socket] No se pudo conectar a Socket.IO:', error.message);
    }
    
    if (socket) {
      const authStore = useAuthStore();
      const tarjetasStore = useTarjetasStore();
      const empleadosStore = useEmpleadosStore();
      
      let updateEstadoCallback = null;
      let isUserJoined = false;
      let joinRetries = 0;
      const maxJoinRetries = 10;
      
      // ============================================================
      // FUNCIÓN PARA UNIR USUARIO
      // ============================================================
      
      const joinUser = () => {
        if (authStore.user?._id && socket && socket.connected) {
          console.log(`👤 [Socket] Enviando join para usuario: ${authStore.user._id}`);
          socket.emit('join', authStore.user._id);
          isUserJoined = true;
          return true;
        } else {
          console.warn('⚠️ [Socket] No se puede enviar join:', {
            hasUser: !!authStore.user,
            userId: authStore.user?._id,
            socketConnected: socket?.connected
          });
          return false;
        }
      };
      
      // ============================================================
      // 🔥 HELPER: Actualizar ambos stores
      // ============================================================
      
      const actualizarAmbosStores = (nombreEvento) => {
        console.log(`🔄 [Socket] Recargando stores por "${nombreEvento}"...`);
        
        tarjetasStore.fetchTarjetas()
          .then(() => console.log(`   ✅ [Socket] Tarjetas OK`))
          .catch(err => console.error(`   ❌ [Socket] Error tarjetas:`, err));
        
        empleadosStore.cargarEstadoTecnicos(`socket:${nombreEvento}`)
          .then(() => console.log(`   ✅ [Socket] Empleados OK`))
          .catch(err => console.error(`   ❌ [Socket] Error empleados:`, err));
      };
      
      // ============================================================
      // EVENTOS DE CONEXIÓN
      // ============================================================
      
      socket.on('connect', () => {
        console.log('✅ [Socket] Conectado correctamente');
        console.log(`   📡 Socket ID: ${socket.id}`);
        reconnectAttempts = 0;
        isUserJoined = false;
        joinRetries = 0;
        
        setTimeout(() => {
          joinUser();
        }, 500);
      });
      
      socket.on('connect_error', (error) => {
        reconnectAttempts++;
        console.warn(`⚠️ [Socket] Error de conexión (intento ${reconnectAttempts}/20):`, error.message);
      });
      
      socket.on('disconnect', (reason) => {
        console.log(`🔌 [Socket] Desconectado. Razón: ${reason}`);
        isUserJoined = false;
        joinRetries = 0;
        
        if (reason === 'io server disconnect') {
          console.log('🔄 [Socket] Reconectando manualmente...');
          socket.connect();
        }
      });
      
      socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 [Socket] Reconectado después de ${attemptNumber} intentos`);
        console.log(`   📡 Nuevo Socket ID: ${socket.id}`);
        isUserJoined = false;
        joinRetries = 0;
        
        setTimeout(() => {
          joinUser();
        }, 500);
      });
      
      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 [Socket] Intentando reconexión ${attemptNumber}/20...`);
      });
      
      socket.on('reconnect_error', (error) => {
        console.warn(`⚠️ [Socket] Error en reconexión:`, error.message);
      });
      
      socket.on('reconnect_failed', () => {
        console.warn('⚠️ [Socket] Falló la reconexión después de 20 intentos');
      });
      
      socket.on('connected', (data) => {
        console.log('✅ [Socket] Usuario unido correctamente:', data);
        console.log(`   👤 UserId: ${data.userId}`);
        console.log(`   📡 Socket ID: ${socket.id}`);
        isUserJoined = true;
      });
      
      // ============================================================
      // ESCUCHAR CAMBIOS EN EL STORE DE AUTENTICACIÓN
      // ============================================================
      
      authStore.$subscribe((mutation, state) => {
        if (state.user?._id && socket && socket.connected && !isUserJoined) {
          console.log(`👤 [Socket] Detectado usuario autenticado: ${state.user._id}`);
          joinUser();
        }
      });
      
      // 🔥 Sistema de reintentos de join más robusto
      const intentarJoinConReintentos = () => {
        if (isUserJoined) {
          console.log('✅ [Socket] Ya unido, no se reintenta');
          return;
        }
        
        if (joinRetries >= maxJoinRetries) {
          console.warn('⚠️ [Socket] Máximo de reintentos de join alcanzado');
          return;
        }
        
        joinRetries++;
        
        if (authStore.user?._id && socket && socket.connected) {
          console.log(`👤 [Socket] Intento de join #${joinRetries} para usuario: ${authStore.user._id}`);
          joinUser();
        } else {
          console.log(`⏳ [Socket] Intento #${joinRetries}: esperando (user: ${!!authStore.user?._id}, socket: ${socket?.connected})`);
          setTimeout(intentarJoinConReintentos, 500);
        }
      };
      
      // Iniciar el ciclo de reintentos
      setTimeout(intentarJoinConReintentos, 500);
      
      // ============================================================
      // 🔔 EVENTOS DE NOTIFICACIÓN SONORA (NUEVOS)
      // ============================================================
      
      // 🔥 Notificación 1: Nueva tarea pendiente (sonido + visual)
      socket.on('notificacion-nueva-pendiente', (data) => {
        console.log('========================================');
        console.log('🔔 [Socket] NOTIFICACIÓN: nueva tarea pendiente');
        console.log(`   📌 Tarea: ${data.tarea?.titulo}`);
        console.log(`   📝 Mensaje: ${data.mensaje}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        // Emitir evento global para que la página lo capture
        if (window.$nuxt) {
          window.$nuxt.$emit?.('notificacion-nueva-pendiente', data);
        }
        
        // También emitir con CustomEvent por si acaso
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('notificacion-nueva-pendiente', { detail: data }));
        }
      });
      
      // 🔥 Notificación 2: Tarea asignada por supervisor (sonido distinto + visual)
      socket.on('notificacion-tarea-asignada', (data) => {
        console.log('========================================');
        console.log('🔔 [Socket] NOTIFICACIÓN: tarea asignada');
        console.log(`   📌 Tarea: ${data.tarea?.titulo}`);
        console.log(`   👤 Por: ${data.asignadaPor}`);
        console.log(`   📝 Mensaje: ${data.mensaje}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        if (window.$nuxt) {
          window.$nuxt.$emit?.('notificacion-tarea-asignada', data);
        }
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('notificacion-tarea-asignada', { detail: data }));
        }
      });
      
      // 🔥 Notificación 3: Configuración de notificaciones actualizada
      socket.on('notificaciones-actualizadas', (data) => {
        console.log('========================================');
        console.log('🔔 [Socket] CONFIGURACIÓN DE NOTIFICACIONES ACTUALIZADA');
        console.log(`   📝 ${JSON.stringify(data.configuracion, null, 2)}`);
        console.log('========================================');
        
        if (window.$nuxt) {
          window.$nuxt.$emit?.('notificaciones-actualizadas', data);
        }
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('notificaciones-actualizadas', { detail: data }));
        }
      });
      
      // ============================================================
      // EVENTOS DE TIEMPO REAL (con recarga de AMBOS stores)
      // ============================================================
      
      // Nueva tarea disponible
      socket.on('nueva-tarea-disponible', (data) => {
        console.log('========================================');
        console.log('📢 [Socket] NUEVA TAREA DISPONIBLE');
        console.log(`   📌 Título: ${data.tarea?.titulo}`);
        console.log(`   🆔 ID: ${data.tarea?._id}`);
        console.log(`   📝 Mensaje: ${data.mensaje}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('nueva-tarea-disponible');
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('📋 Nueva tarea disponible', {
            body: `${data.tarea?.titulo || 'Nueva tarea'}`,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Tarea asignada
      socket.on('tarea-asignada', (data) => {
        console.log('========================================');
        console.log(`📢 [Socket] TAREA ASIGNADA: ${data.tarea?.titulo}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-asignada');
        
        if (data.tarea?.asignadoA?._id === authStore.user?._id) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📋 Tarea asignada', {
              body: `${data.tarea.titulo}`,
              icon: '/favicon.ico'
            });
          }
        }
      });
      
      // Tarea tomada por otro empleado
      socket.on('tarea-tomada', (data) => {
        console.log('========================================');
        console.log(`📢 [Socket] TAREA TOMADA por: ${data.empleado?.nombre}`);
        console.log(`   📌 Tarea: ${data.tarea?.titulo}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-tomada');
      });
      
      // Evento específico para actualizar el Kanban del supervisor
      socket.on('kanban-actualizar', (data) => {
        console.log('========================================');
        console.log(`📋 [Socket] KANBAN ACTUALIZAR: ${data.mensaje}`);
        console.log(`   🆔 Tarea: ${data.tareaId}`);
        console.log(`   🔄 Acción: ${data.accion}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('kanban-actualizar');
      });
      
      // Estado actualizado (progreso)
      socket.on('estado-actualizado', (data) => {
        console.log('========================================');
        console.log(`📊 [Socket] ESTADO ACTUALIZADO: ${data.porcentaje}%`);
        console.log(`   🆔 Tarea ID: ${data.tareaId}`);
        console.log(`   👤 Empleado: ${data.empleadoNombre}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('estado-actualizado');
        
        if (updateEstadoCallback) {
          updateEstadoCallback(data);
        }
      });
      
      // Estado general actualizado
      socket.on('estado-general-actualizado', (data) => {
        console.log('========================================');
        console.log(`🔄 [Socket] ESTADO GENERAL ACTUALIZADO`);
        console.log(`   📌 Tarea: ${data.titulo}`);
        console.log(`   🔄 Estado: ${data.estado}`);
        console.log(`   📊 Porcentaje: ${data.porcentaje}%`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('estado-general-actualizado');
        
        if (updateEstadoCallback) {
          updateEstadoCallback(data);
        }
      });
      
      // Tarea completada automáticamente
      socket.on('tarea-completada-automaticamente', (data) => {
        console.log('========================================');
        console.log(`🎉 [Socket] TAREA COMPLETADA AUTOMÁTICAMENTE: ${data.titulo}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-completada-automaticamente');
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('✅ Tarea completada', {
            body: `${data.titulo}`,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Tarea iniciada
      socket.on('tarea-iniciada-tiempo-real', (data) => {
        console.log('========================================');
        console.log(`🚀 [Socket] TAREA INICIADA: ${data.tarea?.titulo}`);
        console.log(`   👤 Empleado: ${data.empleado?.nombre}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-iniciada-tiempo-real');
        
        if (updateEstadoCallback) {
          updateEstadoCallback({ tipo: 'iniciada', ...data });
        }
      });
      
      // Tarea pausada
      socket.on('tarea-pausada-tiempo-real', (data) => {
        console.log('========================================');
        console.log(`⏸️ [Socket] TAREA PAUSADA: ${data.tareaId}`);
        console.log(`   👤 Empleado: ${data.empleadoNombre}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-pausada-tiempo-real');
        
        if (updateEstadoCallback) {
          updateEstadoCallback({ tipo: 'pausada', ...data });
        }
      });
      
      // Tarea reanudada
      socket.on('tarea-reanudada-tiempo-real', (data) => {
        console.log('========================================');
        console.log(`▶️ [Socket] TAREA REANUDADA: ${data.tareaId}`);
        console.log(`   👤 Empleado: ${data.empleadoNombre}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-reanudada-tiempo-real');
        
        if (updateEstadoCallback) {
          updateEstadoCallback({ tipo: 'reanudada', ...data });
        }
      });
      
      // Tarea lista para revisión (supervisor)
      socket.on('tarea-lista-para-revision', (data) => {
        console.log('========================================');
        console.log(`👔 [Socket] TAREA LISTA PARA REVISIÓN: ${data.titulo}`);
        console.log(`   👤 Empleado: ${data.empleadoNombre}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-lista-para-revision');
        
        if (authStore.isSupervisor) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📋 Tarea lista para revisión', {
              body: `"${data.titulo}" - ${data.empleadoNombre}`,
              icon: '/favicon.ico'
            });
          }
        }
      });
      
      // Tarea lista para calificar (usuario)
      socket.on('tarea-lista-para-calificar', (data) => {
        console.log('========================================');
        console.log(`⭐ [Socket] TAREA LISTA PARA CALIFICAR: ${data.titulo}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-lista-para-calificar');
        
        if (authStore.isUsuario) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⭐ Tarea lista para calificar', {
              body: `"${data.titulo}" está lista para tu calificación`,
              icon: '/favicon.ico'
            });
          }
        }
      });
      
      // Tarea calificada
      socket.on('tarea-calificada', (data) => {
        console.log('========================================');
        console.log(`⭐ [Socket] TAREA CALIFICADA: ${data.titulo}`);
        console.log(`   ⭐ Puntaje: ${data.puntaje}★`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-calificada');
        
        if (authStore.isTecnico) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⭐ Calificación recibida', {
              body: `Recibiste ${data.puntaje} estrellas en: ${data.titulo}`,
              icon: '/favicon.ico'
            });
          }
        }
      });
      
      // Tarea finalizada sin cliente
      socket.on('tarea-finalizada-sin-cliente', (data) => {
        console.log('========================================');
        console.log(`✅ [Socket] TAREA FINALIZADA SIN CLIENTE: ${data.titulo}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-finalizada-sin-cliente');
        
        if (authStore.isUsuario) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('✅ Tarea finalizada', {
              body: `"${data.titulo}" - ${data.mensaje}`,
              icon: '/favicon.ico'
            });
          }
        }
      });
      
      // Tarea por expirar
      socket.on('tarea-por-expirar', (data) => {
        console.log('========================================');
        console.log(`⚠️ [Socket] TAREA POR EXPIRAR: ${data.titulo}`);
        console.log(`   📅 Días restantes: ${data.diasRestantes}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-por-expirar');
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Tarea por expirar', {
            body: data.mensaje,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Tarea auto-finalizada
      socket.on('tarea-auto-finalizada', (data) => {
        console.log('========================================');
        console.log(`🤖 [Socket] TAREA AUTO-FINALIZADA: ${data.titulo}`);
        console.log(`   📝 Mensaje: ${data.mensaje}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-auto-finalizada');
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🤖 Tarea auto-finalizada', {
            body: `"${data.titulo}" - ${data.mensaje}`,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Nueva tarea asignada
      socket.on('nueva-tarea-asignada', (data) => {
        console.log('========================================');
        console.log(`📢 [Socket] NUEVA TAREA ASIGNADA: ${data.tarea?.titulo}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('nueva-tarea-asignada');
      });
      
      // Progreso actualizado
      socket.on('progreso-actualizado', (data) => {
        console.log('========================================');
        console.log(`📈 [Socket] PROGRESO ACTUALIZADO`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('progreso-actualizado');
      });
      
      // Tiempo estimado establecido
      socket.on('tiempo-estimado-establecido', (data) => {
        console.log('========================================');
        console.log(`⏱️ [Socket] TIEMPO ESTIMADO ESTABLECIDO: ${data.tareaId}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tiempo-estimado-establecido');
      });
      
      // Tarea reasignada
      socket.on('tarea-reasignada', (data) => {
        console.log('========================================');
        console.log(`🔄 [Socket] TAREA REASIGNADA: ${data.titulo}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-reasignada');
      });
      
      // Tarea finalizada por ti mismo (técnico que finalizó)
      socket.on('tarea-finalizada-por-ti', (data) => {
        console.log('========================================');
        console.log(`✅ [Socket] TAREA FINALIZADA POR TI: ${data.titulo}`);
        console.log(`   📝 Mensaje: ${data.mensaje}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('tarea-finalizada-por-ti');
      });
      
      // Alerta de progreso crítico
      socket.on('alerta-progreso-critico', (data) => {
        console.log('========================================');
        console.log(`⚠️ [Socket] ALERTA CRÍTICA: ${data.titulo}`);
        console.log(`   👤 Técnico: ${data.tecnico}`);
        console.log(`   📊 Progreso: ${data.progreso}%`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('alerta-progreso-critico');
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Alerta de progreso crítico', {
            body: data.mensaje,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Rol actualizado
      socket.on('rol-actualizado', (data) => {
        console.log('========================================');
        console.log(`🔄 [Socket] ROL ACTUALIZADO: ${data.nuevoRol}`);
        console.log(`   👤 Usuario: ${data.userId}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log('========================================');
        
        actualizarAmbosStores('rol-actualizado');
        
        if (data.userId === authStore.user?._id) {
          console.log(`👤 [Socket] Tu rol ha sido actualizado a: ${data.nuevoRol}`);
          authStore.loadFromStorage();
        }
      });
      
      // ============================================================
      // NOTIFICACIONES DEL NAVEGADOR
      // ============================================================
      
      if ('Notification' in window && Notification.permission === 'default') {
        console.log('🔔 [Socket] Solicitando permiso para notificaciones...');
        Notification.requestPermission().then(permission => {
          console.log(`🔔 [Socket] Permiso de notificaciones: ${permission}`);
        });
      }
      
      // ============================================================
      // REGISTRO DE CALLBACKS
      // ============================================================
      
      window.registerEstadoUpdateCallback = (callback) => {
        console.log('📋 [Socket] Callback de estado registrado');
        updateEstadoCallback = callback;
      };
      
      // ============================================================
      // DIAGNÓSTICO DE CONEXIÓN
      // ============================================================
      
      console.log('✅ [Socket] Plugin inicializado correctamente');
      console.log(`   📡 Estado inicial: ${socket.connected ? 'Conectado' : 'Desconectado'}`);
      console.log(`   🔔 3 eventos de notificación registrados:`);
      console.log(`      - notificacion-nueva-pendiente`);
      console.log(`      - notificacion-tarea-asignada`);
      console.log(`      - notificaciones-actualizadas`);
    }
    
    return {
      provide: {
        socket
      }
    };
  }
  
  return {
    provide: {
      socket: null
    }
  };
});