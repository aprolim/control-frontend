export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  // Solo cargar del storage en el cliente
  if (process.client) {
    authStore.loadFromStorage();
  }
  
  // No bloquear la página principal, solo rutas protegidas
  const protectedRoutes = ['/dashboard', '/kanban', '/reportes'];
  
  if (protectedRoutes.some(route => to.path.startsWith(route))) {
    if (!authStore.isAuthenticated) {
      return navigateTo('/login');
    }
  }
});