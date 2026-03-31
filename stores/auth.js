import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isJefe: (state) => state.user?.rol === 'jefe',
    isEmpleado: (state) => state.user?.rol === 'empleado',
    isCliente: (state) => state.user?.rol === 'cliente'
  },
  
  actions: {
    async login(email, password) {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/auth/login`;
        console.log('🔐 Intentando login a:', url);
        
        const response = await $fetch(url, {
          method: 'POST',
          body: { email, password }
        });
        
        console.log('✅ Login exitoso:', response);
        
        this.user = {
          _id: response._id,
          nombre: response.nombre,
          email: response.email,
          rol: response.rol,
          telefono: response.telefono || ''
        };
        this.token = response.token;
        
        if (process.client) {
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(this.user));
          console.log('💾 Token guardado en localStorage');
        }
        
        return true;
      } catch (error) {
        console.error('❌ Login error:', error);
        alert(error.data?.message || 'Error de conexión');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData) {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/auth/register`;
        
        const response = await $fetch(url, {
          method: 'POST',
          body: userData
        });
        
        this.user = {
          _id: response._id,
          nombre: response.nombre,
          email: response.email,
          rol: response.rol,
          telefono: response.telefono || ''
        };
        this.token = response.token;
        
        if (process.client) {
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(this.user));
        }
        
        return true;
      } catch (error) {
        console.error('Register error:', error);
        alert(error.data?.message || 'Error al registrar');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      this.user = null;
      this.token = null;
      
      if (process.client) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      navigateTo('/login');
    },
    
    loadFromStorage() {
      if (process.client) {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          this.token = token;
          this.user = JSON.parse(user);
          return true;
        }
      }
      return false;
    }
  }
});