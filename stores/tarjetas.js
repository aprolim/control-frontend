import { defineStore } from 'pinia';

export const useTarjetasStore = defineStore('tarjetas', {
  state: () => ({
    tarjetas: [],
    estadisticas: null,
    loading: false
  }),
  
  getters: {
    tarjetasPorEstado: (state) => {
      const grouped = {
        pendiente: [],
        en_progreso: [],
        revision_supervisor: [],
        revision_cliente: [],
        finalizada: []
      };
      
      state.tarjetas.forEach(tarjeta => {
        let estado = tarjeta.estado;
        if (estado === 'revision_jefe') estado = 'revision_supervisor';
        if (estado === 'completada') estado = 'finalizada';
        
        if (grouped[estado] !== undefined) {
          grouped[estado].push(tarjeta);
        }
      });
      
      return {
        'Pendientes': grouped.pendiente,
        'En Progreso': grouped.en_progreso,
        'Revisión Supervisor': grouped.revision_supervisor,
        'Revisión Cliente': grouped.revision_cliente,
        'Finalizadas': grouped.finalizada
      };
    },
    
    tareasActivas: (state) => {
      return state.tarjetas.filter(t => t.estado !== 'finalizada' && t.estado !== 'revision_cliente');
    }
  },
  
  actions: {
    getAuthHeaders() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ [Store] No hay token en localStorage');
        return {};
      }
      return { Authorization: `Bearer ${token}` };
    },
    
    // ============================================================
    // 🔥 FUNCIÓN AUXILIAR: Generar firma de un array de tarjetas
    // Sirve para comparar si los datos cambiaron realmente antes
    // de reemplazar el array (evita re-renders innecesarios)
    // ============================================================
    generarFirma(tarjetas) {
      if (!Array.isArray(tarjetas)) return '';
      return tarjetas
        .map(t => {
          // Incluir los campos que importan visualmente
          const campos = [
            t._id,
            t.estado || '',
            t.estadoProgreso || '',
            t.tiempoAcumulado || 0,
            t.porcentajeCompletado || 0,
            t.tiempoEstimadoEmpleado || 0,
            t.fechaUltimaReanudacion || '',
            t.fechaUltimaPausa || '',
            t.fechaFinalizada || '',
            t.asignadoA?._id || '',
            t.calificacion?.puntaje || ''
          ];
          return campos.join(':');
        })
        .sort()
        .join('|');
    },
    
    // ============================================================
    // FETCH TARJETAS
    // ============================================================
    async fetchTarjetas() {
      console.log('🔄 [Store] fetchTarjetas - Iniciando...');
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        if (!headers.Authorization) {
          console.warn('⚠️ No hay token de autenticación');
          throw new Error('No autenticado');
        }
        
        const response = await $fetch(url, { headers });
        
        console.log(`   📊 Tareas recibidas: ${response.length}`);
        
        // Normalizar
        const nuevasTarjetas = response.map(tarea => ({
          ...tarea,
          tiempoAcumulado: tarea.tiempoAcumulado || 0,
          horasTotalesReales: tarea.horasTotalesReales || 0,
          minutosTotalesReales: tarea.minutosTotalesReales || 0,
          tiempoEstimadoEmpleado: tarea.tiempoEstimadoEmpleado || 0,
          porcentajeCompletado: tarea.porcentajeCompletado || 0,
          registroHoras: tarea.registroHoras || [],
          logTiempos: tarea.logTiempos || [],
          estado: tarea.estado === 'revision_jefe' ? 'revision_supervisor' : tarea.estado
        }));
        
        // 🔥 COMPARAR FIRMAS: solo reemplazar si los datos cambiaron
        const firmaActual = this.generarFirma(this.tarjetas);
        const firmaNueva = this.generarFirma(nuevasTarjetas);
        
        if (firmaActual === firmaNueva && this.tarjetas.length === nuevasTarjetas.length) {
          console.log('   ⏭️ Sin cambios detectados, saltando re-render');
          return this.tarjetas;
        }
        
        console.log(`   🔥 Cambios detectados, actualizando ${nuevasTarjetas.length} tarjetas`);
        this.tarjetas = nuevasTarjetas;
        
        console.log('✅ [Store] fetchTarjetas - Completado');
        return this.tarjetas;
      } catch (error) {
        console.error('❌ Error fetching tarjetas:', error);
        if (error.statusCode === 401) {
          console.warn('⚠️ Token expirado, redirigiendo a login...');
          const authStore = useAuthStore();
          authStore.logout();
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // ============================================================
    // OBTENER TAREAS DISPONIBLES
    // ============================================================
    async obtenerTareasDisponibles() {
      console.log('📋 [Store] obtenerTareasDisponibles - Buscando...');
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/disponibles`;
        
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, { headers });
        
        console.log(`   ✅ Encontradas ${response.length} tareas disponibles`);
        return response;
      } catch (error) {
        console.error('❌ Error en obtenerTareasDisponibles:', error);
        return [];
      }
    },
    
    // ============================================================
    // TOMAR SIGUIENTE TAREA
    // ============================================================
    async tomarSiguienteTarea() {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/tomar-siguiente`;
        const headers = this.getAuthHeaders();
        const result = await $fetch(url, {
          method: 'PUT',
          headers
        });
        
        await this.fetchTarjetas();
        return result;
      } catch (error) {
        console.error('❌ Error en tomarSiguienteTarea:', error);
        throw error;
      }
    },
    
    // ============================================================
    // TOMAR TAREA ESPECÍFICA
    // ============================================================
    async tomarTareaEspecifica(id) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/tomar`;
        const headers = this.getAuthHeaders();
        const result = await $fetch(url, {
          method: 'PUT',
          headers
        });
        
        await this.fetchTarjetas();
        return result;
      } catch (error) {
        console.error('❌ Error en tomarTareaEspecifica:', error);
        throw error;
      }
    },
    
    // ============================================================
    // CREAR SOLICITUD
    // ============================================================
    async crearSolicitud(data) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas`;
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, {
          method: 'POST',
          body: data,
          headers
        });
        
        await this.fetchTarjetas();
        return response;
      } catch (error) {
        console.error('❌ Error en crearSolicitud:', error);
        throw error;
      }
    },
    
    // ============================================================
    // CREAR TAREA EXTRA
    // ============================================================
    async crearTareaExtra(data) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/tarea-extra`;
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, {
          method: 'POST',
          body: data,
          headers
        });
        
        await this.fetchTarjetas();
        return response;
      } catch (error) {
        console.error('❌ Error en crearTareaExtra:', error);
        throw error;
      }
    },
    
    // ============================================================
    // AUTO-ASIGNAR TAREA
    // ============================================================
    async autoAsignar(id) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/auto-asignar`;
        const headers = this.getAuthHeaders();
        const result = await $fetch(url, {
          method: 'PUT',
          headers
        });
        
        await this.fetchTarjetas();
        return result;
      } catch (error) {
        console.error('❌ Error en autoAsignar:', error);
        throw error;
      }
    },
    
    // ============================================================
    // ASIGNAR POR SUPERVISOR
    // ============================================================
    async asignarPorSupervisor(id, empleadoId, tiempoSugeridoHoras = 0, tiempoSugeridoMinutos = 0) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/asignar-supervisor`;
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, {
          method: 'PUT',
          body: { empleadoId, tiempoSugeridoHoras, tiempoSugeridoMinutos },
          headers
        });
        
        await this.fetchTarjetas();
        return response;
      } catch (error) {
        console.error('❌ Error en asignarPorSupervisor:', error);
        
        let mensajeError = 'Error al asignar la tarea';
        if (error.data?.message) mensajeError = error.data.message;
        else if (error.data?.error) mensajeError = error.data.error;
        else if (error.message) mensajeError = error.message;
        
        throw new Error(mensajeError);
      }
    },
    
    // ============================================================
    // DEVOLVER TAREA (Técnico)
    // ============================================================
    async devolverTarea(id, motivo = '') {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/devolver`;
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, {
          method: 'PUT',
          body: { motivo },
          headers
        });
        
        await this.fetchTarjetas();
        return response;
      } catch (error) {
        console.error('❌ Error en devolverTarea:', error);
        throw error;
      }
    },
    
    // ============================================================
    // REASIGNAR TAREA (Supervisor)
    // ============================================================
    async reasignarTarea(id, nuevoEmpleadoId, motivo = '') {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/reasignar`;
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, {
          method: 'PUT',
          body: { nuevoEmpleadoId, motivo },
          headers
        });
        
        await this.fetchTarjetas();
        return response;
      } catch (error) {
        console.error('❌ Error en reasignarTarea:', error);
        throw error;
      }
    },
    
    // ============================================================
    // REGISTRAR PROGRESO
    // ============================================================
    async registrarProgreso(id, data) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/progreso`;
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, {
          method: 'PUT',
          body: data,
          headers
        });
        
        await this.fetchTarjetas();
        return response;
      } catch (error) {
        console.error('❌ Error en registrarProgreso:', error);
        throw error;
      }
    },
    
    // ============================================================
    // OBTENER TARJETA ESPECÍFICA
    // ============================================================
    async obtenerTarjeta(id) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}`;
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, { headers });
        return response;
      } catch (error) {
        console.error('❌ Error en obtenerTarjeta:', error);
        throw error;
      }
    },
    
    // ============================================================
    // CALIFICAR TAREA
    // ============================================================
    async calificarTarea(id, puntaje, comentario) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/calificar`;
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, {
          method: 'PUT',
          body: { puntaje, comentario },
          headers
        });
        
        await this.fetchTarjetas();
        return response;
      } catch (error) {
        console.error('❌ Error en calificarTarea:', error);
        throw error;
      }
    },
    
    // ============================================================
    // FETCH ESTADÍSTICAS
    // ============================================================
    async fetchEstadisticas() {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/estadisticas`;
        const headers = this.getAuthHeaders();
        this.estadisticas = await $fetch(url, { headers });
        return this.estadisticas;
      } catch (error) {
        console.error('❌ Error en fetchEstadisticas:', error);
        throw error;
      }
    }
  }
});