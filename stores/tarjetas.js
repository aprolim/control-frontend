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
    
    async fetchTarjetas() {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas`;
        const headers = this.getAuthHeaders();
        if (!headers.Authorization) throw new Error('No autenticado');
        
        this.tarjetas = await $fetch(url, { headers });
      } catch (error) {
        console.error('Error fetching tarjetas:', error);
        if (error.statusCode === 401) {
          const authStore = useAuthStore();
          authStore.logout();
        }
      } finally {
        this.loading = false;
      }
    },
    
    async obtenerTareasDisponibles() {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/disponibles`;
        const headers = this.getAuthHeaders();
        return await $fetch(url, { headers });
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },
    
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
        console.error('Error:', error);
        throw error;
      }
    },
    
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
        console.error('Error:', error);
        throw error;
      }
    },
    
    async crearSolicitud(data) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas`;
        const headers = this.getAuthHeaders();
        await $fetch(url, {
          method: 'POST',
          body: data,
          headers
        });
        await this.fetchTarjetas();
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    
    async crearSolicitudPublica(data) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/solicitudes/publicas`;
        console.log('📤 Enviando solicitud pública a:', url);
        await $fetch(url, {
          method: 'POST',
          body: data
        });
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    
    async crearTareaExtra(data) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/tarea-extra`;
        const headers = this.getAuthHeaders();
        await $fetch(url, {
          method: 'POST',
          body: data,
          headers
        });
        await this.fetchTarjetas();
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    
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
        console.error('Error:', error);
        throw error;
      }
    },
    
    async asignarPorJefe(id, empleadoId, tiempoSugeridoHoras = 0, tiempoSugeridoMinutos = 0) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/asignar-jefe`;
        const headers = this.getAuthHeaders();
        await $fetch(url, {
          method: 'PUT',
          body: { empleadoId, tiempoSugeridoHoras, tiempoSugeridoMinutos },
          headers
        });
        await this.fetchTarjetas();
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    
    async registrarProgreso(id, data) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/progreso`;
        const headers = this.getAuthHeaders();
        await $fetch(url, {
          method: 'PUT',
          body: data,
          headers
        });
        await this.fetchTarjetas();
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    
    async obtenerTarjeta(id) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}`;
        const headers = this.getAuthHeaders();
        return await $fetch(url, { headers });
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    
    async calificarTarea(id, puntaje, comentario) {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/tarjetas/${id}/calificar`;
        const headers = this.getAuthHeaders();
        await $fetch(url, {
          method: 'PUT',
          body: { puntaje, comentario },
          headers
        });
        await this.fetchTarjetas();
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    
    async fetchEstadisticas() {
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/estadisticas`;
        const headers = this.getAuthHeaders();
        this.estadisticas = await $fetch(url, { headers });
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }
});