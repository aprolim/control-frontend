// stores/auth.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    zimbraToken: null,
    loading: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isJefe: (state) => state.user?.rol === 'jefe',
    isEmpleado: (state) => state.user?.rol === 'empleado',
    isCliente: (state) => state.user?.rol === 'cliente'
  },
  
  actions: {
    // ============================================================
    // LOGIN CON ZIMBRA (ÚNICO MÉTODO)
    // ============================================================
    async login(email, password) {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const url = `${config.public.apiBase}/auth/login`;
        console.log('🔐 Login con Zimbra:', url);
        
        const response = await $fetch(url, {
          method: 'POST',
          body: { usuario: email, password }
        });
        
        if (!response.success) {
          throw new Error(response.error || 'Error en login');
        }
        
        console.log('✅ Login exitoso:', response);
        
        this.user = {
          _id: response._id,
          nombre: response.nombre,
          email: response.email,
          rol: response.rol,
          telefono: response.telefono || '',
          zimbraUid: response.zimbraUid
        };
        this.token = response.token;
        this.zimbraToken = response.zimbraToken || null;
        
        if (process.client) {
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(this.user));
          if (this.zimbraToken) {
            localStorage.setItem('zimbraToken', this.zimbraToken);
          }
          console.log('💾 Datos guardados en localStorage');
        }
        
        return true;
      } catch (error) {
        console.error('❌ Login error:', error);
        const msg = error.data?.error || error.message || 'Error de conexión con Zimbra';
        alert(msg);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // ============================================================
    // REGISTRO (DESHABILITADO)
    // ============================================================
    async register() {
      console.warn('⚠️ Registro deshabilitado. Usa login con Zimbra.');
      return false;
    },
    
    // ============================================================
    // CERRAR SESIÓN
    // ============================================================
    logout() {
      this.user = null;
      this.token = null;
      this.zimbraToken = null;
      
      if (process.client) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('zimbraToken');
      }
      
      navigateTo('/login');
    },
    
    // ============================================================
    // CARGAR DESDE STORAGE
    // ============================================================
    loadFromStorage() {
      if (process.client) {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const zimbraToken = localStorage.getItem('zimbraToken');
        
        if (token && user) {
          this.token = token;
          this.user = JSON.parse(user);
          this.zimbraToken = zimbraToken || null;
          return true;
        }
      }
      return false;
    }
  }
});