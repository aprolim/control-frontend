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
    
    isSupervisor: (state) => state.user?.rol === 'supervisor',
    isTecnico: (state) => state.user?.rol === 'tecnico',
    isUsuario: (state) => state.user?.rol === 'usuario',
    
    canAssignTasks: (state) => state.user?.rol === 'supervisor',
    canTakeTasks: (state) => state.user?.rol === 'tecnico' || state.user?.rol === 'supervisor',
    canCreateRequests: (state) => state.user?.rol === 'usuario' || state.user?.rol === 'tecnico' || state.user?.rol === 'supervisor',
    canApproveTasks: (state) => state.user?.rol === 'supervisor',
    canViewAllTasks: (state) => state.user?.rol === 'supervisor',
    canConfigureAutoClose: (state) => state.user?.rol === 'supervisor',
    canViewReports: (state) => state.user?.rol === 'supervisor',
    canManageUsers: (state) => state.user?.rol === 'supervisor',
    
    roleLabel: (state) => {
      const labels = {
        supervisor: 'Supervisor',
        tecnico: 'Técnico',
        usuario: 'Usuario'
      };
      return labels[state.user?.rol] || 'Usuario';
    },
    
    roleBadgeClass: (state) => {
      const classes = {
        supervisor: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        tecnico: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        usuario: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      };
      return classes[state.user?.rol] || 'bg-gray-100 text-gray-700';
    },
    
    roleIcon: (state) => {
      const icons = {
        supervisor: '👔',
        tecnico: '🔧',
        usuario: '👤'
      };
      return icons[state.user?.rol] || '❓';
    }
  },
  
  actions: {
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
        
        // 🔥 Mejorar el manejo de errores
        const errorData = error.data || error;
        const statusCode = error.status || error.statusCode || 0;
        
        let errorMessage = 'Error de conexión con Zimbra';
        let errorDetail = '';
        
        if (statusCode === 401) {
          errorMessage = errorData?.mensaje || 'Usuario o contraseña incorrectos';
          errorDetail = errorData?.detalle || 'Verifica tus credenciales de Zimbra';
        } else if (statusCode === 400) {
          errorMessage = errorData?.mensaje || 'Datos inválidos';
          errorDetail = errorData?.detalle || '';
        } else if (statusCode === 500) {
          errorMessage = errorData?.mensaje || 'Error del servidor';
          errorDetail = errorData?.detalle || 'Intenta nuevamente más tarde';
        } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('ECONNREFUSED')) {
          errorMessage = 'No se pudo conectar con el servidor Zimbra';
          errorDetail = 'Verifica tu conexión de red';
        }
        
        // Crear un error enriquecido
        const enhancedError = new Error(errorMessage);
        enhancedError.data = {
          mensaje: errorMessage,
          detalle: errorDetail,
          status: statusCode
        };
        enhancedError.status = statusCode;
        
        throw enhancedError;
      } finally {
        this.loading = false;
      }
    },
    
    async register() {
      console.warn('⚠️ Registro deshabilitado. Usa login con Zimbra.');
      return false;
    },
    
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