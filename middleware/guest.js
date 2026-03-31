export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  // Solo cargar del storage en el cliente
  if (process.client) {
    authStore.loadFromStorage();
  }
  
  if (authStore.isAuthenticated) {
    return navigateTo('/');
  }
});