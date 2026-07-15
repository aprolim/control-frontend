import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  if (process.client) {
    const config = useRuntimeConfig();
    
    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 20; // 🔥 20 intentos máximos (opcional, o Infinity)
    
    try {
      console.log('🔌 [Socket] Iniciando conexión a:', config.public.wsUrl);
      
      socket = io(config.public.wsUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 20,        // 🔥 20 intentos (o Infinity)
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,      // 🔥 Máximo 5 segundos
        timeout: 20000,                  // 🔥 20 segundos de timeout
        autoConnect: true
      });
    } catch (error) {
      console.warn('⚠️ [Socket] No se pudo conectar a Socket.IO:', error.message);
    }
    
    if (socket) {
      const authStore = useAuthStore();
      const tarjetasStore = useTarjetasStore();
      
      let updateEstadoCallback = null;
      let isUserJoined = false;
      
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
      // EVENTOS DE CONEXIÓN
      // ============================================================
      
      socket.on('connect', () => {
        console.log('✅ [Socket] Conectado correctamente');
        console.log(`   📡 Socket ID: ${socket.id}`);
        reconnectAttempts = 0;
        
        setTimeout(() => {
          joinUser();
        }, 500);
      });
      
      socket.on('connect_error', (error) => {
        reconnectAttempts++;
        console.warn(`⚠️ [Socket] Error de conexión (intento ${reconnectAttempts}/20):`, error.message);
        
        if (reconnectAttempts >= 20) {
          console.warn('⚠️ [Socket] 20 intentos fallidos, seguirá intentando...');
        }
      });
      
      socket.on('disconnect', (reason) => {
        console.log(`🔌 [Socket] Desconectado. Razón: ${reason}`);
        isUserJoined = false;
        
        if (reason === 'io server disconnect') {
          console.log('🔄 [Socket] Reconectando manualmente...');
          socket.connect();
        }
      });
      
      socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 [Socket] Reconectado después de ${attemptNumber} intentos`);
        console.log(`   📡 Nuevo Socket ID: ${socket.id}`);
        
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
        console.log('🔄 [Socket] Continuará intentando...');
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
      
      setTimeout(() => {
        if (!isUserJoined && authStore.user?._id) {
          console.log('🔄 [Socket] Intentando join por timeout...');
          joinUser();
        }
      }, 3000);
      
      // ============================================================
      // EVENTOS DE TIEMPO REAL
      // ============================================================
      
      // Nueva tarea disponible
      socket.on('nueva-tarea-disponible', (data) => {
        console.log('========================================');
        console.log('📢 [Socket] NUEVA TAREA DISPONIBLE');
        console.log(`   📌 Título: ${data.tarea?.titulo}`);
        console.log(`   🆔 ID: ${data.tarea?._id}`);
        console.log(`   📝 Mensaje: ${data.mensaje}`);
        console.log('========================================');
        
        tarjetasStore.fetchTarjetas();
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('📋 Nueva tarea disponible', {
            body: `${data.tarea?.titulo || 'Nueva tarea'}`,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Tarea asignada
      socket.on('tarea-asignada', (data) => {
        console.log(`📢 [Socket] Tarea asignada: ${data.tarea?.titulo}`);
        tarjetasStore.fetchTarjetas();
        
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
        console.log(`📢 [Socket] Tarea tomada por: ${data.empleado?.nombre}`);
        tarjetasStore.fetchTarjetas();
      });
      
      // Estado actualizado (progreso)
      socket.on('estado-actualizado', (data) => {
        console.log(`📊 [Socket] Estado actualizado: ${data.porcentaje}% - ${data.estado}`);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback(data);
        }
      });
      
      // Estado general actualizado
      socket.on('estado-general-actualizado', (data) => {
        console.log(`🔄 [Socket] Estado general actualizado: ${data.titulo} -> ${data.estado}`);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback(data);
        }
      });
      
      // Tarea completada automáticamente
      socket.on('tarea-completada-automaticamente', (data) => {
        console.log(`🎉 [Socket] Tarea completada automáticamente: ${data.titulo}`);
        tarjetasStore.fetchTarjetas();
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('✅ Tarea completada', {
            body: `${data.titulo}`,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Tarea iniciada
      socket.on('tarea-iniciada-tiempo-real', (data) => {
        console.log(`🚀 [Socket] Tarea iniciada: ${data.tarea?.titulo}`);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback({
            tipo: 'iniciada',
            ...data
          });
        }
      });
      
      // Tarea pausada
      socket.on('tarea-pausada-tiempo-real', (data) => {
        console.log(`⏸️ [Socket] Tarea pausada: ${data.tareaId}`);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback({
            tipo: 'pausada',
            ...data
          });
        }
      });
      
      // Tarea reanudada
      socket.on('tarea-reanudada-tiempo-real', (data) => {
        console.log(`▶️ [Socket] Tarea reanudada: ${data.tareaId}`);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback({
            tipo: 'reanudada',
            ...data
          });
        }
      });
      
      // Tarea lista para revisión (supervisor)
      socket.on('tarea-lista-para-revision', (data) => {
        console.log(`👔 [Socket] Tarea lista para revisión: ${data.titulo}`);
        console.log(`   👤 Empleado: ${data.empleadoNombre}`);
        tarjetasStore.fetchTarjetas();
        
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
        console.log(`⭐ [Socket] Tarea lista para calificar: ${data.titulo}`);
        tarjetasStore.fetchTarjetas();
        
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
        console.log(`⭐ [Socket] Tarea calificada: ${data.titulo} - ${data.puntaje}★`);
        tarjetasStore.fetchTarjetas();
        
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
        console.log(`✅ [Socket] Tarea finalizada: ${data.titulo}`);
        tarjetasStore.fetchTarjetas();
        
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
        console.log(`⚠️ [Socket] Tarea por expirar: ${data.titulo}`);
        console.log(`   📅 Días restantes: ${data.diasRestantes}`);
        tarjetasStore.fetchTarjetas();
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Tarea por expirar', {
            body: data.mensaje,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Tarea auto-finalizada
      socket.on('tarea-auto-finalizada', (data) => {
        console.log(`🤖 [Socket] Tarea auto-finalizada: ${data.titulo}`);
        console.log(`   📝 Mensaje: ${data.mensaje}`);
        tarjetasStore.fetchTarjetas();
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🤖 Tarea auto-finalizada', {
            body: `"${data.titulo}" - ${data.mensaje}`,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Nueva tarea asignada
      socket.on('nueva-tarea-asignada', (data) => {
        console.log(`📢 [Socket] Nueva tarea asignada: ${data.tarea?.titulo}`);
        tarjetasStore.fetchTarjetas();
      });
      
      // Progreso actualizado
      socket.on('progreso-actualizado', (data) => {
        console.log(`📈 [Socket] Progreso actualizado`);
        tarjetasStore.fetchTarjetas();
      });
      
      // Tarea iniciada (evento antiguo)
      socket.on('tarea-iniciada', () => {
        console.log(`🚀 [Socket] Tarea iniciada (evento antiguo)`);
        tarjetasStore.fetchTarjetas();
      });
      
      // Tarea pausada (evento antiguo)
      socket.on('tarea-pausada', () => {
        console.log(`⏸️ [Socket] Tarea pausada (evento antiguo)`);
        tarjetasStore.fetchTarjetas();
      });
      
      // Tiempo estimado establecido
      socket.on('tiempo-estimado-establecido', (data) => {
        console.log(`⏱️ [Socket] Tiempo estimado establecido: ${data.tareaId}`);
        tarjetasStore.fetchTarjetas();
      });
      
      // Rol actualizado
      socket.on('rol-actualizado', (data) => {
        console.log(`🔄 [Socket] Rol actualizado: ${data.nuevoRol} para usuario ${data.userId}`);
        tarjetasStore.fetchTarjetas();
        
        if (data.userId === authStore.user?._id) {
          console.log(`👤 [Socket] Tu rol ha sido actualizado a: ${data.nuevoRol}`);
          authStore.loadFromStorage();
        }
      });
      
      // ============================================================
      // NOTIFICACIONES
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