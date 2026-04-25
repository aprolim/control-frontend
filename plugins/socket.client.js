import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  if (process.client) {
    const config = useRuntimeConfig();
    
    let socket = null;
    try {
      socket = io(config.public.wsUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
    } catch (error) {
      console.warn('⚠️ No se pudo conectar a Socket.IO:', error.message);
    }
    
    if (socket) {
      const authStore = useAuthStore();
      const tarjetasStore = useTarjetasStore();
      
      let updateEstadoCallback = null;
      
      socket.on('connect', () => {
        console.log('✅ Socket.IO conectado');
        if (authStore.user?._id) {
          socket.emit('join', authStore.user._id);
        }
      });
      
      socket.on('connect_error', (error) => {
        console.warn('⚠️ Error de conexión Socket.IO:', error.message);
      });
      
      socket.on('connected', (data) => {
        console.log('✅ Conectado, usuario:', data.userId);
      });
      
      // Evento para nueva tarea disponible
      socket.on('nueva-tarea-disponible', (data) => {
        console.log('📢 Nueva tarea disponible:', data.tarea?.titulo);
        if (authStore.isEmpleado || authStore.isJefe) {
          if (window.refreshTareasDisponibles) {
            window.refreshTareasDisponibles();
          }
        }
        if (authStore.isJefe) {
          tarjetasStore.fetchTarjetas();
        }
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nueva tarea disponible', {
            body: `${data.tarea.titulo}\n${data.mensaje}`,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Evento para tarea asignada
      socket.on('tarea-asignada', (data) => {
        console.log('📢 Tarea asignada:', data.tarea?.titulo);
        tarjetasStore.fetchTarjetas();
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Tarea asignada', {
            body: `${data.tarea.titulo}\n${data.mensaje}`,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Evento para tarea tomada por otro empleado
      socket.on('tarea-tomada', (data) => {
        console.log('📢 Tarea tomada por:', data.empleado?.nombre);
        if (authStore.isJefe) {
          tarjetasStore.fetchTarjetas();
        }
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Tarea tomada', {
            body: `${data.empleado.nombre} tomó: ${data.tarea.titulo}`,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Evento para estado actualizado (progreso)
      socket.on('estado-actualizado', (data) => {
        console.log('📊 Estado actualizado:', data);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback(data);
        }
      });
      
      // Evento para estado general actualizado (cuando cambia de estado)
      socket.on('estado-general-actualizado', (data) => {
        console.log('🔄 Estado general actualizado:', data);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback(data);
        }
      });
      
      // Evento para tarea completada automáticamente
      socket.on('tarea-completada-automaticamente', (data) => {
        console.log('🎉 Tarea completada automáticamente:', data);
        tarjetasStore.fetchTarjetas();
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Tarea completada', {
            body: `${data.titulo}\n${data.mensaje}`,
            icon: '/favicon.ico'
          });
        }
      });
      
      // Evento para tiempo estimado actualizado
      socket.on('tiempo-estimado-actualizado', (data) => {
        console.log('⏱️ Tiempo estimado actualizado:', data);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback({
            tipo: 'tiempo',
            ...data
          });
        }
      });
      
      // Evento para tarea iniciada
      socket.on('tarea-iniciada-tiempo-real', (data) => {
        console.log('🚀 Tarea iniciada:', data);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback({
            tipo: 'iniciada',
            ...data
          });
        }
      });
      
      // Evento para tarea pausada
      socket.on('tarea-pausada-tiempo-real', (data) => {
        console.log('⏸️ Tarea pausada:', data);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback({
            tipo: 'pausada',
            ...data
          });
        }
      });
      
      // Evento para tarea reanudada
      socket.on('tarea-reanudada-tiempo-real', (data) => {
        console.log('▶️ Tarea reanudada:', data);
        tarjetasStore.fetchTarjetas();
        
        if (updateEstadoCallback) {
          updateEstadoCallback({
            tipo: 'reanudada',
            ...data
          });
        }
      });
      
      // Evento para tarea lista para revisión
      socket.on('tarea-lista-para-revision', (data) => {
        console.log('👔 Tarea lista para revisión:', data);
        tarjetasStore.fetchTarjetas();
        
        if (authStore.isJefe) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Tarea lista para revisión', {
              body: `La tarea "${data.titulo}" completada por ${data.empleadoNombre} está lista para revisión`,
              icon: '/favicon.ico'
            });
          }
        }
      });
      
      // Evento para tarea lista para calificar
      socket.on('tarea-lista-para-calificar', (data) => {
        console.log('⭐ Tarea lista para calificar:', data);
        tarjetasStore.fetchTarjetas();
        
        if (authStore.isCliente) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Tarea lista para calificar', {
              body: `La tarea "${data.titulo}" está lista para ser calificada`,
              icon: '/favicon.ico'
            });
          }
        }
      });
      
      // Evento para tarea calificada
      socket.on('tarea-calificada', (data) => {
        console.log('⭐ Tarea calificada:', data);
        tarjetasStore.fetchTarjetas();
        
        if (authStore.isEmpleado) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Calificación recibida', {
              body: `Recibiste ${data.puntaje} estrellas en: ${data.titulo}`,
              icon: '/favicon.ico'
            });
          }
        }
      });
      
      // Eventos existentes
      socket.on('nueva-tarea-asignada', (data) => {
        console.log('📢 Nueva tarea asignada:', data.tarea?.titulo);
        tarjetasStore.fetchTarjetas();
        
        if (data.tarea?.asignadoA?._id === authStore.user?._id) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nueva tarea asignada', {
              body: `${data.tarea.titulo}\n${data.mensaje}`,
              icon: '/favicon.ico'
            });
          }
        }
      });
      
      socket.on('progreso-actualizado', () => {
        tarjetasStore.fetchTarjetas();
      });
      
      socket.on('tarea-iniciada', () => {
        tarjetasStore.fetchTarjetas();
      });
      
      socket.on('tarea-pausada', () => {
        tarjetasStore.fetchTarjetas();
      });
      
      socket.on('siguiente-tarea-disponible', (data) => {
        tarjetasStore.fetchTarjetas();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Tarea disponible', {
            body: `La tarea "${data.titulo}" está lista para comenzar`,
            icon: '/favicon.ico'
          });
        }
      });
      
      socket.on('tiempo-estimado-establecido', () => {
        tarjetasStore.fetchTarjetas();
      });
      
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      window.registerEstadoUpdateCallback = (callback) => {
        updateEstadoCallback = callback;
      };
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