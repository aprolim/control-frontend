<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div class="flex justify-end -mt-4 -mr-4">
        <ThemeToggle />
      </div>
      
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white text-xl font-bold">CP</span>
        </div>
        <h2 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Registro deshabilitado
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          El registro de nuevos usuarios se realiza automáticamente al iniciar sesión con Zimbra.
        </p>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Usa tu cuenta de Zimbra para acceder al sistema.
        </p>
      </div>
      
      <div class="mt-6">
        <NuxtLink
          to="/login"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 transition"
        >
          Ir a Iniciar Sesión
        </NuxtLink>
      </div>
      
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <p class="text-xs text-gray-400 dark:text-gray-500">
          🔐 Sistema integrado con Zimbra
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import ThemeToggle from '~/components/ThemeToggle.vue';

definePageMeta({
  middleware: 'guest'
});
</script>