// stores/empleados.js
import { defineStore } from 'pinia';

export const useEmpleadosStore = defineStore('empleados', {
  state: () => ({
    estadosTecnicos: [],
    cargando: false,
    ultimaActualizacion: null,
    listenersRegistrados: false,
    eventosRecibidos: 0,
    ultimoEvento: null,
    socketId: null,
    _intervaloPolling: null
  }),
  
  getters: {
    tecnicosOcupados: (state) => {
      return state.estadosTecnicos.filter(t => t.tarea !== null);
    },
    tecnicosDisponibles: (state) => {
      return state.estadosTecnicos.filter(t => t.tarea === null);
    },
    totalTecnicos: (state) => state.estadosTecnicos.length
  },
  
  actions: {
    // ============================================================
    // Cargar el estado de los técnicos desde el backend
    // ============================================================
    async cargarEstadoTecnicos(motivo = 'manual') {
      try {
        const config = useRuntimeConfig();
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('⚠️ [EmpleadosStore] No hay token, abortando');
          return;
        }
        
        const url = `${config.public.apiBase}/tarjetas/estado-empleados`;
        console.log(`👥 [EmpleadosStore] 📤 Cargando estado (motivo: ${motivo})...`);
        
        this.cargando = true;
        const response = await $fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.estadosTecnicos = response;
        this.ultimaActualizacion = new Date();
        console.log(`✅ [EmpleadosStore] ${response.length} técnicos cargados (motivo: ${motivo})`);
        console.log(`   📊 Ocupados: ${response.filter(t => t.tarea).length} | Disponibles: ${response.filter(t => !t.tarea).length}`);
      } catch (error) {
        console.error('❌ [EmpleadosStore] Error cargando estado:', error);
      } finally {
        this.cargando = false;
      }
    },
    
    // ============================================================
    // Registrar listeners de Socket.IO (SOLO UNA VEZ)
    // ============================================================
    registrarListenersSocket() {
      console.log('========================================');
      console.log('🔌 [EmpleadosStore] registrarListenersSocket() llamado');
      console.log(`   📊 listenersRegistrados: ${this.listenersRegistrados}`);
      console.log(`   📊 isClient: ${process.client}`);
      
      if (!process.client) {
        console.log('ℹ️ [EmpleadosStore] No es cliente, omitiendo');
        console.log('========================================');
        return;
      }
      
      const nuxtApp = useNuxtApp();
      const socket = nuxtApp.$socket;
      
      console.log(`   📊 socket disponible: ${!!socket}`);
      console.log(`   📊 socket.connected: ${socket?.connected}`);
      console.log(`   📊 socket.id: ${socket?.id}`);
      
      if (!socket) {
        console.warn('⚠️ [EmpleadosStore] ❌ Socket NO disponible, activando polling de respaldo');
        this._iniciarPollingRespaldo();
        console.log('========================================');
        return;
      }
      
      // 🔥 Si el socket cambió (reconexión), limpiar los listeners viejos
      // antes de registrar los nuevos
      if (this.listenersRegistrados && this.socketId && this.socketId !== socket.id) {
        console.log(`🔄 [EmpleadosStore] Socket cambió (${this.socketId} → ${socket.id}), re-registrando listeners`);
        this.limpiarListenersSocket();
      }
      
      if (this.listenersRegistrados) {
        console.log('ℹ️ [EmpleadosStore] Ya registrados en este socket, omitiendo');
        console.log('========================================');
        return;
      }
      
      this.socketId = socket.id;
      
      // Lista de eventos que afectan el estado de los técnicos
      const eventos = [
        'nueva-tarea-disponible',
        'tarea-tomada',
        'tarea-asignada',
        'nueva-tarea-asignada',
        'tarea-iniciada-tiempo-real',
        'tarea-pausada-tiempo-real',
        'tarea-reanudada-tiempo-real',
        'tarea-lista-para-revision',
        'tarea-auto-finalizada',
        'tarea-completada-automaticamente',
        'tarea-aprobada-por-supervisor',
        'tarea-aprobada-enviada-cliente',
        'tarea-enviada-a-cliente',
        'tarea-finalizada-sin-cliente',
        'tarea-calificada',
        'tarea-reasignada',
        'estado-actualizado',
        'estado-general-actualizado',
        'tarea-finalizada-por-ti',
        'tiempo-estimado-establecido',
        'progreso-actualizado',
        'tarea-por-expirar',
        'kanban-actualizar'
      ];
      
      // Debounce con logs (reducido a 100ms para mayor responsividad)
      let timeoutDebounce = null;
      const recargarConDebounce = (evento, data) => {
        this.eventosRecibidos++;
        this.ultimoEvento = { evento, timestamp: new Date(), data };
        
        console.log('========================================');
        console.log(`📢 [EmpleadosStore] ✅ EVENTO RECIBIDO: "${evento}"`);
        console.log(`   📊 Total eventos: ${this.eventosRecibidos}`);
        console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
        console.log(`   ⏱️ Programando recarga en 100ms...`);
        
        if (timeoutDebounce) {
          console.log('   ⏱️ Debounce cancelado (nuevo evento entrante)');
          clearTimeout(timeoutDebounce);
        }
        
        timeoutDebounce = setTimeout(() => {
          console.log(`🔄 [EmpleadosStore] Ejecutando recarga por evento "${evento}"`);
          this.cargarEstadoTecnicos(`socket:${evento}`);
        }, 100);
      };
      
      eventos.forEach(evento => {
        socket.on(evento, (data) => recargarConDebounce(evento, data));
      });
      
      this.listenersRegistrados = true;
      console.log(`✅ [EmpleadosStore] ${eventos.length} listeners registrados en socket ${socket.id}`);
      console.log('========================================');
      
      // Activar polling de respaldo (solo si no hay socket o por si acaso)
      this._iniciarPollingRespaldo();
    },
    
    // ============================================================
    // 🔥 Polling de respaldo cada 30s (por si un evento se pierde)
    // ============================================================
    _iniciarPollingRespaldo() {
      if (!process.client) return;
      if (this._intervaloPolling) {
        return; // ya está activo
      }
      
      console.log('⏱️ [EmpleadosStore] Activando polling de respaldo cada 30s');
      
      this._intervaloPolling = setInterval(() => {
        console.log('🔄 [EmpleadosStore] Polling de respaldo (30s)');
        this.cargarEstadoTecnicos('polling-respaldo');
      }, 30000);
    },
    
    // ============================================================
    // Detener polling
    // ============================================================
    detenerPolling() {
      if (this._intervaloPolling) {
        clearInterval(this._intervaloPolling);
        this._intervaloPolling = null;
        console.log('🛑 [EmpleadosStore] Polling de respaldo detenido');
      }
    },
    
    // ============================================================
    // Limpiar listeners
    // ============================================================
    limpiarListenersSocket() {
      if (!process.client || !this.listenersRegistrados) return;
      
      const nuxtApp = useNuxtApp();
      const socket = nuxtApp.$socket;
      if (!socket) return;
      
      const eventos = [
        'nueva-tarea-disponible',
        'tarea-tomada',
        'tarea-asignada',
        'nueva-tarea-asignada',
        'tarea-iniciada-tiempo-real',
        'tarea-pausada-tiempo-real',
        'tarea-reanudada-tiempo-real',
        'tarea-lista-para-revision',
        'tarea-auto-finalizada',
        'tarea-completada-automaticamente',
        'tarea-aprobada-por-supervisor',
        'tarea-aprobada-enviada-cliente',
        'tarea-enviada-a-cliente',
        'tarea-finalizada-sin-cliente',
        'tarea-calificada',
        'tarea-reasignada',
        'estado-actualizado',
        'estado-general-actualizado',
        'tarea-finalizada-por-ti',
        'tiempo-estimado-establecido',
        'progreso-actualizado',
        'tarea-por-expirar',
        'kanban-actualizar'
      ];
      
      eventos.forEach(evento => socket.off(evento));
      this.listenersRegistrados = false;
      this.socketId = null;
      console.log('🧹 [EmpleadosStore] Listeners removidos');
    }
  }
});