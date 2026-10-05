// composables/useNotificaciones.js
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

export const useNotificaciones = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  
  // ============================================================
  // ESTADO REACTIVO
  // ============================================================
  const configuracion = ref(null);
  const cargando = ref(false);
  const silenciado = ref(false);
  const tiempoSilencio = ref(null);
  const notificacionesActivas = ref([]);
  const audioDesbloqueado = ref(false);
  
  const sonidos = {
    pendienteSuave: null,
    nuevaTarea: null,
    tareaAsignada: null
  };
  
  let intervalRecordatorio = null;
  let timeoutSilencio = null;
  let estaLibreCallback = () => true;
  
  // ============================================================
  // COMPUTED
  // ============================================================
  
  const silencioActivo = computed(() => {
    if (!configuracion.value?.silenciarHasta) return false;
    return new Date(configuracion.value.silenciarHasta) > new Date();
  });
  
  const tiempoRestanteSilencio = computed(() => {
    if (!tiempoSilencio.value) return null;
    const ms = tiempoSilencio.value - Date.now();
    if (ms <= 0) return null;
    const minutos = Math.floor(ms / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);
    return { minutos, segundos };
  });
  
  // ============================================================
  // CARGAR CONFIGURACIÓN
  // ============================================================
  
  const cargarConfiguracion = async () => {
    try {
      cargando.value = true;
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await $fetch(`${config.public.apiBase}/configuracion/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.success) {
        configuracion.value = response.configuracion;
        
        if (configuracion.value.silenciarHasta) {
          const hasta = new Date(configuracion.value.silenciarHasta);
          if (hasta > new Date()) {
            silenciado.value = true;
            tiempoSilencio.value = hasta.getTime();
            programarFinSilencio(hasta);
          } else {
            configuracion.value.silenciarHasta = null;
            silenciado.value = false;
            tiempoSilencio.value = null;
          }
        }
      }
    } catch (error) {
      console.error('❌ [Notificaciones] Error cargando config:', error);
    } finally {
      cargando.value = false;
    }
  };
  
  // ============================================================
  // PRECARGAR SONIDOS
  // ============================================================
  
  const precargarSonidos = () => {
    try {
      sonidos.pendienteSuave = new Audio('/sounds/pendiente-suave.mp3');
      sonidos.pendienteSuave.preload = 'auto';
      sonidos.pendienteSuave.volume = configuracion.value?.volumen ?? 0.5;
      
      sonidos.nuevaTarea = new Audio('/sounds/nueva-tarea.mp3');
      sonidos.nuevaTarea.preload = 'auto';
      sonidos.nuevaTarea.volume = configuracion.value?.volumen ?? 0.5;
      
      sonidos.tareaAsignada = new Audio('/sounds/tarea-asignada.mp3');
      sonidos.tareaAsignada.preload = 'auto';
      sonidos.tareaAsignada.volume = configuracion.value?.volumen ?? 0.5;
      
      console.log('🔊 [Notificaciones] Sonidos precargados');
    } catch (error) {
      console.warn('⚠️ [Notificaciones] Error precargando sonidos:', error);
    }
  };
  
  // ============================================================
  // DESBLOQUEAR AUDIO
  // ============================================================
  
  const desbloquearAudio = () => {
    if (audioDesbloqueado.value) return;
    
    try {
      const silencioso = new Audio();
      silencioso.volume = 0;
      silencioso.play().catch(() => {});
      audioDesbloqueado.value = true;
      console.log('🔊 [Notificaciones] Audio desbloqueado');
    } catch (e) {
      console.warn('⚠️ No se pudo desbloquear audio:', e);
    }
  };
  
  // ============================================================
  // REPRODUCIR SONIDO
  // ============================================================
  
  const reproducirSonido = (tipo) => {
    if (silencioActivo.value) {
      console.log(`🔕 [Notificaciones] Silenciado, no se reproduce ${tipo}`);
      return;
    }
    
    const cfg = configuracion.value;
    if (!cfg) return;
    
    let sonidoHabilitado = false;
    let audio = null;
    
    if (tipo === 'pendienteSuave') {
      sonidoHabilitado = cfg.recordatorioPendientes?.sonidoHabilitado;
      audio = sonidos.pendienteSuave;
    } else if (tipo === 'nuevaTarea') {
      sonidoHabilitado = cfg.nuevaTareaPendiente?.sonidoHabilitado;
      audio = sonidos.nuevaTarea;
    } else if (tipo === 'tareaAsignada') {
      sonidoHabilitado = cfg.tareaAsignada?.sonidoHabilitado;
      audio = sonidos.tareaAsignada;
    }
    
    if (!sonidoHabilitado || !audio) return;
    if (!audio.src || audio.error) return;
    
    audio.volume = cfg.volumen ?? 0.5;
    audio.currentTime = 0;
    
    const p = audio.play();
    if (p !== undefined) p.catch(() => {});
  };
  
  // ============================================================
  // NOTIFICACIÓN VISUAL
  // ============================================================
  
  const mostrarNotificacionVisual = (opciones) => {
    const id = Date.now() + Math.random();
    const notificacion = {
      id,
      tipo: opciones.tipo || 'info',
      titulo: opciones.titulo || '',
      mensaje: opciones.mensaje || '',
      duracion: opciones.duracion || 6000
    };
    
    notificacionesActivas.value.push(notificacion);
    
    setTimeout(() => {
      notificacionesActivas.value = notificacionesActivas.value.filter(n => n.id !== id);
    }, notificacion.duracion);
  };
  
  const cerrarNotificacion = (id) => {
    notificacionesActivas.value = notificacionesActivas.value.filter(n => n.id !== id);
  };
  
  // ============================================================
  // NOTIFICACIONES PARA TÉCNICO
  // ============================================================
  
  const notificarNuevaPendiente = (data) => {
    const cfg = configuracion.value?.nuevaTareaPendiente;
    if (!cfg?.habilitado) return;
    
    reproducirSonido('nuevaTarea');
    
    mostrarNotificacionVisual({
      tipo: 'nueva-tarea',
      titulo: '📋 Nueva tarea disponible',
      mensaje: data.tarea?.titulo || 'Hay una nueva tarea pendiente',
      duracion: 8000
    });
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('📋 Nueva tarea disponible', {
          body: data.tarea?.titulo || 'Nueva tarea pendiente',
          icon: '/favicon.ico'
        });
      } catch (e) {}
    }
  };
  
  const notificarTareaAsignada = (data) => {
    const cfg = configuracion.value?.tareaAsignada;
    if (!cfg?.habilitado) return;
    
    reproducirSonido('tareaAsignada');
    
    mostrarNotificacionVisual({
      tipo: 'asignada',
      titulo: '📌 Tarea asignada',
      mensaje: data.mensaje || `Te asignaron: "${data.tarea?.titulo}"`,
      duracion: 10000
    });
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('📌 Tarea asignada', {
          body: data.mensaje || data.tarea?.titulo,
          icon: '/favicon.ico'
        });
      } catch (e) {}
    }
  };
  
  const reproducirRecordatorioPendientes = async () => {
    const cfg = configuracion.value?.recordatorioPendientes;
    if (!cfg?.habilitado) return;
    if (cfg.soloCuandoLibre && !estaLibreCallback()) return;
    
    let hayPendientes = false;
    try {
      const token = localStorage.getItem('token');
      const response = await $fetch(`${config.public.apiBase}/tarjetas/disponibles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      hayPendientes = response && response.length > 0;
    } catch (error) {
      return;
    }
    
    if (!hayPendientes) return;
    
    reproducirSonido('pendienteSuave');
    
    mostrarNotificacionVisual({
      tipo: 'pendientes',
      titulo: '📋 Tienes tareas pendientes',
      mensaje: 'Hay tareas disponibles esperando ser tomadas',
      duracion: 6000
    });
  };
  
  // ============================================================
  // 🔥 NUEVAS: NOTIFICACIONES PARA USUARIO
  // ============================================================
  
  const notificarTecnicoTomoTarea = (data) => {
    console.log('🔔 [Notificaciones] Técnico tomó tarea');
    
    reproducirSonido('tareaAsignada');
    
    mostrarNotificacionVisual({
      tipo: 'info',
      titulo: '👷 Técnico asignado',
      mensaje: `${data.empleado?.nombre || 'Un técnico'} tomó tu tarea: "${data.tarea?.titulo}"`,
      duracion: 8000
    });
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('👷 Técnico asignado', {
          body: `${data.empleado?.nombre || 'Un técnico'} tomó tu tarea`,
          icon: '/favicon.ico'
        });
      } catch (e) {}
    }
  };
  
  const notificarTecnicoInicio = (data) => {
    console.log('🔔 [Notificaciones] Técnico inició trabajo');
    
    reproducirSonido('nuevaTarea');
    
    mostrarNotificacionVisual({
      tipo: 'success',
      titulo: '▶️ Trabajo iniciado',
      mensaje: `${data.empleado?.nombre || 'El técnico'} comenzó a trabajar en: "${data.tarea?.titulo}"`,
      duracion: 5000
    });
  };
  
  const notificarTecnicoPauso = (data) => {
    console.log('🔔 [Notificaciones] Técnico pausó');
    
    reproducirSonido('pendienteSuave');
    
    mostrarNotificacionVisual({
      tipo: 'warning',
      titulo: '⏸️ Tarea en pausa',
      mensaje: `${data.empleadoNombre || 'El técnico'} pausó tu tarea`,
      duracion: 5000
    });
  };
  
  const notificarTecnicoReanudo = (data) => {
    console.log('🔔 [Notificaciones] Técnico reanudó');
    
    reproducirSonido('nuevaTarea');
    
    mostrarNotificacionVisual({
      tipo: 'info',
      titulo: '▶️ Trabajo reanudado',
      mensaje: `${data.empleadoNombre || 'El técnico'} reanudó tu tarea`,
      duracion: 5000
    });
  };
  
  const notificarTareaFinalizada = (data) => {
    console.log('🔔 [Notificaciones] Tarea finalizada');
    
    reproducirSonido('tareaAsignada');
    
    mostrarNotificacionVisual({
      tipo: 'success',
      titulo: '✅ Tarea completada',
      mensaje: data.mensaje || `Tu tarea "${data.titulo}" ha sido finalizada`,
      duracion: 10000
    });
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('✅ Tarea completada', {
          body: `Puedes calificar: "${data.titulo}"`,
          icon: '/favicon.ico'
        });
      } catch (e) {}
    }
  };
  
  // ============================================================
  // RECORDATORIO PERIÓDICO
  // ============================================================
  
  const iniciarRecordatorioPendientes = () => {
    detenerRecordatorioPendientes();
    
    const cfg = configuracion.value?.recordatorioPendientes;
    if (!cfg?.habilitado) return;
    
    const intervaloMs = (cfg.intervaloMinutos || 2) * 60 * 1000;
    
    intervalRecordatorio = setInterval(() => {
      reproducirRecordatorioPendientes();
    }, intervaloMs);
  };
  
  const detenerRecordatorioPendientes = () => {
    if (intervalRecordatorio) {
      clearInterval(intervalRecordatorio);
      intervalRecordatorio = null;
    }
  };
  
  // ============================================================
  // SILENCIO
  // ============================================================
  
  const silenciarPorMinutos = async (minutos) => {
    try {
      const token = localStorage.getItem('token');
      const response = await $fetch(`${config.public.apiBase}/configuracion/notificaciones/silenciar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { minutos }
      });
      
      if (response.success) {
        const hasta = new Date(response.silenciarHasta);
        silenciado.value = true;
        tiempoSilencio.value = hasta.getTime();
        configuracion.value.silenciarHasta = response.silenciarHasta;
        programarFinSilencio(hasta);
        return true;
      }
    } catch (error) {
      console.error('❌ Error silenciando:', error);
      return false;
    }
  };
  
  const reactivarNotificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      await $fetch(`${config.public.apiBase}/configuracion/notificaciones/reactivar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      silenciado.value = false;
      tiempoSilencio.value = null;
      configuracion.value.silenciarHasta = null;
      
      if (timeoutSilencio) {
        clearTimeout(timeoutSilencio);
        timeoutSilencio = null;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error reactivando:', error);
      return false;
    }
  };
  
  const programarFinSilencio = (fechaFin) => {
    if (timeoutSilencio) clearTimeout(timeoutSilencio);
    
    const ms = fechaFin.getTime() - Date.now();
    if (ms <= 0) {
      silenciado.value = false;
      tiempoSilencio.value = null;
      return;
    }
    
    timeoutSilencio = setTimeout(() => {
      silenciado.value = false;
      tiempoSilencio.value = null;
    }, ms);
  };
  
  // ============================================================
  // INICIALIZAR / DESTRUIR
  // ============================================================
  
  const inicializar = async (opciones = {}) => {
    console.log('🔔 [Notificaciones] Inicializando...');
    
    if (opciones.estaLibre) estaLibreCallback = opciones.estaLibre;
    
    await cargarConfiguracion();
    precargarSonidos();
    iniciarRecordatorioPendientes();
    
    // Pedir permiso de notificaciones del navegador
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {}
    }
    
    // Desbloquear audio en primera interacción
    if (process.client) {
      const desbloquear = () => {
        desbloquearAudio();
        document.removeEventListener('click', desbloquear);
        document.removeEventListener('keydown', desbloquear);
        document.removeEventListener('touchstart', desbloquear);
      };
      document.addEventListener('click', desbloquear, { once: true });
      document.addEventListener('keydown', desbloquear, { once: true });
      document.addEventListener('touchstart', desbloquear, { once: true });
    }
    
    console.log('✅ [Notificaciones] Inicializado');
  };
  
  const destruir = () => {
    detenerRecordatorioPendientes();
    if (timeoutSilencio) {
      clearTimeout(timeoutSilencio);
      timeoutSilencio = null;
    }
  };
  
  const actualizarConfiguracion = (nuevaConfig) => {
    configuracion.value = nuevaConfig;
    if (sonidos.pendienteSuave) sonidos.pendienteSuave.volume = nuevaConfig.volumen ?? 0.5;
    if (sonidos.nuevaTarea) sonidos.nuevaTarea.volume = nuevaConfig.volumen ?? 0.5;
    if (sonidos.tareaAsignada) sonidos.tareaAsignada.volume = nuevaConfig.volumen ?? 0.5;
    iniciarRecordatorioPendientes();
  };
  
  // ============================================================
  // RETURN
  // ============================================================
  
  return {
    configuracion,
    cargando,
    silenciado,
    silencioActivo,
    tiempoSilencio,
    tiempoRestanteSilencio,
    notificacionesActivas,
    
    inicializar,
    destruir,
    cargarConfiguracion,
    actualizarConfiguracion,
    silenciarPorMinutos,
    reactivarNotificaciones,
    desbloquearAudio,
    
    notificarNuevaPendiente,
    notificarTareaAsignada,
    reproducirRecordatorioPendientes,
    
    // 🔥 Para usuario
    notificarTecnicoTomoTarea,
    notificarTecnicoInicio,
    notificarTecnicoPauso,
    notificarTecnicoReanudo,
    notificarTareaFinalizada,
    
    mostrarNotificacionVisual,
    cerrarNotificacion,
    reproducirSonido
  };
};