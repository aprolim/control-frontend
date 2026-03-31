<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">{{ extra ? 'Crear Tarea Extra' : 'Nueva Solicitud' }}</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            v-model="form.titulo"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
            :placeholder="extra ? 'Ej: Revisar documentación' : 'Ej: Reparación de computadora'"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            v-model="form.descripcion"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
            :placeholder="extra ? 'Describa la tarea a realizar...' : 'Describa detalladamente el servicio que necesita...'"
          ></textarea>
        </div>
        
        <div v-if="extra">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tiempo estimado (para tu planificación)</label>
          <div class="flex gap-2">
            <div class="flex-1">
              <input
                v-model.number="form.horasEstimadas"
                type="number"
                step="0.5"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Horas"
              />
              <p class="text-xs text-gray-400 mt-1">Horas</p>
            </div>
            <div class="flex-1">
              <input
                v-model.number="form.minutosEstimados"
                type="number"
                step="5"
                min="0"
                max="55"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Minutos"
              />
              <p class="text-xs text-gray-400 mt-1">Minutos</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            📊 Tiempo total estimado: {{ tiempoEstimadoFormateado }}
          </p>
        </div>
        
        <div v-else class="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p class="text-sm text-gray-600">
            ⏱️ El tiempo de la tarea será estimado por el empleado asignado.
          </p>
        </div>
        
        <div v-if="!extra && !authStore.isAuthenticated" class="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.logueado" class="rounded text-primary-600" />
            <span class="text-sm text-gray-700">Solicitar como usuario registrado (obtén prioridad alta)</span>
          </label>
        </div>
        
        <div v-if="!extra && form.logueado && !authStore.isAuthenticated" class="space-y-3">
          <input
            v-model="form.nombre"
            placeholder="Nombre completo"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <input
            v-model="form.email"
            type="email"
            placeholder="Correo electrónico"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <input
            v-model="form.telefono"
            placeholder="Teléfono"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p class="text-xs text-gray-500">✨ Regístrate después para ver el estado de tu solicitud</p>
        </div>
        
        <div v-if="extra" class="bg-green-50 p-3 rounded-lg border border-green-200">
          <p class="text-sm text-green-700">
            ✅ La tarea se creará automáticamente asignada a ti y pasará a "En Progreso".
          </p>
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
        >
          {{ loading ? 'Creando...' : (extra ? 'Crear Tarea' : 'Enviar Solicitud') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useTarjetasStore } from '~/stores/tarjetas';

const props = defineProps({
  extra: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'created']);

const authStore = useAuthStore();
const tarjetasStore = useTarjetasStore();

const loading = ref(false);
const form = ref({
  titulo: '',
  descripcion: '',
  horasEstimadas: 0,
  minutosEstimados: 0,
  logueado: false,
  nombre: '',
  email: '',
  telefono: ''
});

const tiempoTotalMinutos = computed(() => {
  return ((form.value.horasEstimadas || 0) * 60) + (form.value.minutosEstimados || 0);
});

const tiempoEstimadoFormateado = computed(() => {
  const totalMinutos = tiempoTotalMinutos.value;
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  
  if (totalMinutos === 0) return 'Sin especificar';
  if (horas === 0) return `${minutos} minutos`;
  if (minutos === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas} ${horas === 1 ? 'hora' : 'horas'} y ${minutos} minutos`;
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    if (props.extra) {
      await tarjetasStore.crearTareaExtra({
        titulo: form.value.titulo,
        descripcion: form.value.descripcion,
        horasEstimadas: form.value.horasEstimadas,
        minutosEstimados: form.value.minutosEstimados
      });
      alert('✅ Tarea extra creada exitosamente.');
    } else {
      await tarjetasStore.crearSolicitud({
        titulo: form.value.titulo,
        descripcion: form.value.descripcion,
        horasEstimadas: 0,
        minutosEstimados: 0,
        clienteInfo: {
          logueado: form.value.logueado || authStore.isAuthenticated,
          nombre: form.value.nombre || authStore.user?.nombre,
          email: form.value.email || authStore.user?.email,
          telefono: form.value.telefono
        }
      });
      alert('✅ Solicitud enviada exitosamente.');
    }
    
    // ✅ CERRAR MODAL DESPUÉS DE CREAR
    emit('close');
    // ✅ NOTIFICAR AL PADRE QUE SE CREÓ
    emit('created');
    
    // Limpiar formulario para la próxima vez
    form.value = {
      titulo: '',
      descripcion: '',
      horasEstimadas: 0,
      minutosEstimados: 0,
      logueado: false,
      nombre: '',
      email: '',
      telefono: ''
    };
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al crear: ' + (error.message || 'Error desconocido'));
  } finally {
    loading.value = false;
  }
};
</script>