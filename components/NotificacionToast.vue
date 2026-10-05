<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="notif in notificaciones"
        :key="notif.id"
        class="pointer-events-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-l-4 overflow-hidden max-w-sm w-96 animate-slide-in"
        :class="borderColorClass(notif.tipo)"
      >
        <div class="p-4 flex items-start gap-3">
          <!-- Icono -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="iconBgClass(notif.tipo)"
          >
            <span class="text-xl">{{ iconFor(notif.tipo) }}</span>
          </div>
          
          <!-- Contenido -->
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-800 dark:text-white text-sm">
              {{ notif.titulo }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
              {{ notif.mensaje }}
            </p>
          </div>
          
          <!-- Cerrar -->
          <button
            @click="$emit('cerrar', notif.id)"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 transition"
          >
            ✕
          </button>
        </div>
        
        <!-- Barra de progreso -->
        <div class="h-1 bg-gray-100 dark:bg-gray-700">
          <div
            class="h-full transition-all duration-100 ease-linear"
            :class="progressColorClass(notif.tipo)"
            :style="{ width: progressWidth(notif), animation: `shrink ${notif.duracion}ms linear` }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const props = defineProps({
  notificaciones: {
    type: Array,
    default: () => []
  }
});

defineEmits(['cerrar']);

const iconFor = (tipo) => {
  const map = {
    'info': 'ℹ️',
    'nueva-tarea': '📋',
    'asignada': '📌',
    'pendientes': '⏰',
    'success': '✅',
    'error': '❌',
    'warning': '⚠️'
  };
  return map[tipo] || 'ℹ️';
};

const borderColorClass = (tipo) => {
  const map = {
    'info': 'border-l-blue-500',
    'nueva-tarea': 'border-l-blue-500',
    'asignada': 'border-l-green-500',
    'pendientes': 'border-l-yellow-500',
    'success': 'border-l-emerald-500',
    'error': 'border-l-red-500',
    'warning': 'border-l-orange-500'
  };
  return map[tipo] || 'border-l-blue-500';
};

const iconBgClass = (tipo) => {
  const map = {
    'info': 'bg-blue-100 dark:bg-blue-900/40',
    'nueva-tarea': 'bg-blue-100 dark:bg-blue-900/40',
    'asignada': 'bg-green-100 dark:bg-green-900/40',
    'pendientes': 'bg-yellow-100 dark:bg-yellow-900/40',
    'success': 'bg-emerald-100 dark:bg-emerald-900/40',
    'error': 'bg-red-100 dark:bg-red-900/40',
    'warning': 'bg-orange-100 dark:bg-orange-900/40'
  };
  return map[tipo] || 'bg-blue-100 dark:bg-blue-900/40';
};

const progressColorClass = (tipo) => {
  const map = {
    'info': 'bg-blue-500',
    'nueva-tarea': 'bg-blue-500',
    'asignada': 'bg-green-500',
    'pendientes': 'bg-yellow-500',
    'success': 'bg-emerald-500',
    'error': 'bg-red-500',
    'warning': 'bg-orange-500'
  };
  return map[tipo] || 'bg-blue-500';
};

const progressWidth = (notif) => {
  return '100%';
};
</script>

<style scoped>
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}

@keyframes slide-in {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  transform: translateX(120%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s;
}
</style>