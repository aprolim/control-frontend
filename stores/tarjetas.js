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
        revision_jefe: [],
        revision_cliente: [],
        finalizada: []
      };
      
      state.tarjetas.forEach(tarjeta => {
        if (grouped[tarjeta.estado] !== undefined) {
          grouped[tarjeta.estado].push(tarjeta);
        }
      });
      
      return {
        'Pendientes': grouped.pendiente,
        'En Progreso': grouped.en_progreso,
        'Revisión Jefe': grouped.revision_jefe,
        'Revisión Cliente': grouped.revision_cliente,
        'Finalizadas': grouped.finalizada
      };
    },
    
    tareasActivas: (state) => {
      return state.tarjetas.filter(t => t.estado !== 'finalizada');
    }
  },
  
  actions: {
    getAuthHeaders() {
      const token = localStorage.getItem('token');
      if (!token) return {};
      return { Authorization: `Bearer ${token}` };
    },
    
    // ============================================================
    // FETCH TARJETAS - CON LOGS MEJORADOS
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
        
        console.log(`   🔑 Token: ${headers.Authorization.substring(0, 30)}...`);
        
        const response = await $fetch(url, { headers });
        
        console.log(`   📊 Tareas recibidas: ${response.length}`);
        if (response.length > 0) {
          const estados = {};
          const roles = {};
          response.forEach(t => {
            estados[t.estado] = (estados[t.estado] || 0) + 1;
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
          registroHoras: tarea.registroHoras || []
        }));
        
        console.log('✅ [Store] fetchTarjetas - Completado');
      } catch (error) {
        console.error('❌ Error fetching tarjetas:', error);
        if (error.statusCode === 401) {
          console.warn('⚠️ Token expirado, redirigiendo a login...');
          const authStore = useAuthStore();
          authStore.logout();
        }
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
    // CREAR SOLICITUD (CLIENTE)
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
    // CREAR SOLICITUD PÚBLICA (SIN LOGIN)
    // ============================================================
    async crearSolicitudPublica(data) {
      console.log('📝 [Store] crearSolicitudPublica - Creando solicitud pública...');
      console.log('   📦 Datos:', data);
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/solicitudes/publicas`;
        console.log(`   📍 URL: ${url}`);
        
        const response = await $fetch(url, {
          method: 'POST',
          body: data
        });
        
        console.log('✅ [Store] crearSolicitudPublica - Creada:', response);
        return response;
      } catch (error) {
        console.error('❌ Error en crearSolicitudPublica:', error);
        throw error;
      }
    },
    
    // ============================================================
    // CREAR TAREA EXTRA (EMPLEADO)
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
    // ASIGNAR POR JEFE (CON LOGS Y MANEJO DE ERRORES MEJORADO)
    // ============================================================
    async asignarPorJefe(id, empleadoId, tiempoSugeridoHoras = 0, tiempoSugeridoMinutos = 0) {
      console.log('👔 [Store] asignarPorJefe - Iniciando...');
      console.log(`   📌 Tarea ID: ${id}`);
      console.log(`   👤 Empleado ID: ${empleadoId}`);
      console.log(`   ⏱️ Tiempo sugerido: ${tiempoSugeridoHoras}h ${tiempoSugeridoMinutos}min`);
      
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/asignar-jefe`;
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
        
        console.log('✅ [Store] asignarPorJefe - Respuesta:', response);
        await this.fetchTarjetas();
        return response;
      } catch (error) {
        console.error('❌ [Store] asignarPorJefe - Error:', error);
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
      console.log(`📊 [Store] registrarProgreso - Tarea: ${id}`);
      console.log('   📦 Datos:', data);
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
        console.error('❌ Error en registrarProgreso:', error);
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
    // CALIFICAR TAREA (CLIENTE)
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