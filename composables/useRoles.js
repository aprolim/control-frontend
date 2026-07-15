// composables/useRoles.js
import { computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

export const useRoles = () => {
  const authStore = useAuthStore();
  
  // Getters básicos
  const isSupervisor = computed(() => authStore.user?.rol === 'supervisor');
  const isTecnico = computed(() => authStore.user?.rol === 'tecnico');
  const isUsuario = computed(() => authStore.user?.rol === 'usuario');
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  
  // Permisos específicos
  const canAssignTasks = computed(() => isSupervisor.value);
  const canTakeTasks = computed(() => isTecnico.value || isSupervisor.value);
  const canCreateRequests = computed(() => isUsuario.value || isTecnico.value || isSupervisor.value);
  const canApproveTasks = computed(() => isSupervisor.value);
  const canViewAllTasks = computed(() => isSupervisor.value);
  const canConfigureAutoClose = computed(() => isSupervisor.value);
  const canViewReports = computed(() => isSupervisor.value);
  const canManageUsers = computed(() => isSupervisor.value);
  
  // Etiquetas y utilidades
  const roleLabel = computed(() => {
    const labels = {
      supervisor: 'Supervisor',
      tecnico: 'Técnico',
      usuario: 'Usuario'
    };
    return labels[authStore.user?.rol] || 'Usuario';
  });
  
  const roleBadgeClass = computed(() => {
    const classes = {
      supervisor: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      tecnico: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      usuario: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    };
    return classes[authStore.user?.rol] || 'bg-gray-100 text-gray-700';
  });
  
  const roleIcon = computed(() => {
    const icons = {
      supervisor: '👔',
      tecnico: '🔧',
      usuario: '👤'
    };
    return icons[authStore.user?.rol] || '❓';
  });
  
  // Helper para verificar múltiples roles
  const hasAnyRole = (roles) => {
    if (!authStore.user?.rol) return false;
    return roles.includes(authStore.user.rol);
  };
  
  // Helper para verificar todos los roles
  const hasAllRoles = (roles) => {
    if (!authStore.user?.rol) return false;
    return roles.every(role => authStore.user.rol === role);
  };
  
  return {
    // Getters básicos
    isSupervisor,
    isTecnico,
    isUsuario,
    isAuthenticated,
    
    // Permisos
    canAssignTasks,
    canTakeTasks,
    canCreateRequests,
    canApproveTasks,
    canViewAllTasks,
    canConfigureAutoClose,
    canViewReports,
    canManageUsers,
    
    // Utilidades
    roleLabel,
    roleBadgeClass,
    roleIcon,
    
    // Helpers
    hasAnyRole,
    hasAllRoles
  };
};