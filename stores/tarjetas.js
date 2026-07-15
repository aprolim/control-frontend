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
        revision_supervisor: [], // 🔥 Cambiado de revision_jefe
        revision_cliente: [],
        finalizada: []
      };
      
      state.tarjetas.forEach(tarjeta => {
        // Mapear estados antiguos a nuevos
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
      console.log(`🔑 [Store] Token presente: ${token.substring(0, 30)}...`);
      return { Authorization: `Bearer ${token}` };
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
        if (response.length > 0) {
          const estados = {};
          const roles = {};
          response.forEach(t => {
            // Normalizar estados para el log
            let estado = t.estado;
            if (estado === 'revision_jefe') estado = 'revision_supervisor';
            estados[estado] = (estados[estado] || 0) + 1;
            
            if (t.asignadoA?.nombre) {
              roles[t.asignadoA.nombre] = (roles[t.asignadoA.nombre] || 0) + 1;
            }
          });
          console.log('   📋 Distribución por estado:', estados);
          if (Object.keys(roles).length > 0) {
            console.log('   👤 Asignados a:', roles);
          }
        }
        
        this.tarjetas = response.map(tarea => ({
          ...tarea,
          tiempoAcumulado: tarea.tiempoAcumulado || 0,
          horasTotalesReales: tarea.horasTotalesReales || 0,
          minutosTotalesReales: tarea.minutosTotalesReales || 0,
          tiempoEstimadoEmpleado: tarea.tiempoEstimadoEmpleado || 0,
          porcentajeCompletado: tarea.porcentajeCompletado || 0,
          registroHoras: tarea.registroHoras || [],
          // Normalizar estado para el frontend
          estado: tarea.estado === 'revision_jefe' ? 'revision_supervisor' : tarea.estado
        }));
        
        console.log('✅ [Store] fetchTarjetas - Completado');
        console.log(`   📊 Total en store: ${this.tarjetas.length}`);
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
        console.log(`   📍 URL: ${url}`);
        
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
      console.log('🎯 [Store] tomarSiguienteTarea - Iniciando...');
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/tomar-siguiente`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        const result = await $fetch(url, {
          method: 'PUT',
          headers
        });
        
        console.log('✅ [Store] tomarSiguienteTarea - Respuesta:', result);
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
      console.log(`🎯 [Store] tomarTareaEspecifica - Tarea: ${id}`);
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/tomar`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        const result = await $fetch(url, {
          method: 'PUT',
          headers
        });
        
        console.log('✅ [Store] tomarTareaEspecifica - Respuesta:', result);
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
      console.log('📝 [Store] crearSolicitud - Creando solicitud...');
      console.log('   📦 Datos:', data);
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, {
          method: 'POST',
          body: data,
          headers
        });
        
        console.log('✅ [Store] crearSolicitud - Creada:', response);
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
      console.log('📝 [Store] crearTareaExtra - Creando tarea extra...');
      console.log('   📦 Datos:', data);
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/tarea-extra`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, {
          method: 'POST',
          body: data,
          headers
        });
        
        console.log('✅ [Store] crearTareaExtra - Creada:', response);
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
      console.log(`🎯 [Store] autoAsignar - Tarea: ${id}`);
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/auto-asignar`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        const result = await $fetch(url, {
          method: 'PUT',
          headers
        });
        
        console.log('✅ [Store] autoAsignar - Respuesta:', result);
        await this.fetchTarjetas();
        return result;
      } catch (error) {
        console.error('❌ Error en autoAsignar:', error);
        throw error;
      }
    },
    
    // ============================================================
    // 🔥 ASIGNAR POR SUPERVISOR (CORREGIDO)
    // ============================================================
    async asignarPorSupervisor(id, empleadoId, tiempoSugeridoHoras = 0, tiempoSugeridoMinutos = 0) {
      console.log('👔 [Store] asignarPorSupervisor - Iniciando...');
      console.log(`   📌 Tarea ID: ${id}`);
      console.log(`   👤 Empleado ID: ${empleadoId}`);
      console.log(`   ⏱️ Tiempo sugerido: ${tiempoSugeridoHoras}h ${tiempoSugeridoMinutos}min`);
      
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/asignar-supervisor`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        const body = { 
          empleadoId, 
          tiempoSugeridoHoras, 
          tiempoSugeridoMinutos 
        };
        console.log('   📦 Body:', body);
        
        const response = await $fetch(url, {
          method: 'PUT',
          body,
          headers
        });
        
        console.log('✅ [Store] asignarPorSupervisor - Respuesta:', response);
        await this.fetchTarjetas();
        return response;
      } catch (error) {
        console.error('❌ [Store] asignarPorSupervisor - Error:', error);
        console.error('   Detalles:', error.data);
        
        let mensajeError = 'Error al asignar la tarea';
        if (error.data?.message) {
          mensajeError = error.data.message;
        } else if (error.data?.error) {
          mensajeError = error.data.error;
        } else if (error.message) {
          mensajeError = error.message;
        }
        
        throw new Error(mensajeError);
      }
    },
    
    // ============================================================
    // REGISTRAR PROGRESO
    // ============================================================
    async registrarProgreso(id, data) {
      console.log('📤 [Store] registrarProgreso - Iniciando...');
      console.log(`   📌 Tarea ID: ${id}`);
      console.log(`   📦 Datos:`, data);
      
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/progreso`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        
        const response = await $fetch(url, {
          method: 'PUT',
          body: data,
          headers
        });
        
        console.log('✅ [Store] registrarProgreso - Respuesta:', response);
        await this.fetchTarjetas();
        return response;
      } catch (error) {
        console.error('❌ [Store] Error en registrarProgreso:', error);
        console.error('   Detalles:', error.data);
        throw error;
      }
    },
    
    // ============================================================
    // OBTENER TARJETA ESPECÍFICA
    // ============================================================
    async obtenerTarjeta(id) {
      console.log(`📋 [Store] obtenerTarjeta - ID: ${id}`);
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, { headers });
        
        console.log('✅ [Store] obtenerTarjeta - Encontrada:', response?.titulo);
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
      console.log(`⭐ [Store] calificarTarea - Tarea: ${id}`);
      console.log(`   - Puntaje: ${puntaje}`);
      console.log(`   - Comentario: ${comentario}`);
      
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/calificar`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        const response = await $fetch(url, {
          method: 'PUT',
          body: { puntaje, comentario },
          headers
        });
        
        console.log('✅ [Store] calificarTarea - Respuesta:', response);
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
      console.log('📊 [Store] fetchEstadisticas - Obteniendo estadísticas...');
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/estadisticas`;
        console.log(`   📍 URL: ${url}`);
        
        const headers = this.getAuthHeaders();
        this.estadisticas = await $fetch(url, { headers });
        
        console.log('✅ [Store] fetchEstadisticas - Completado');
        return this.estadisticas;
      } catch (error) {
        console.error('❌ Error en fetchEstadisticas:', error);
        throw error;
      }
    }
  }
});