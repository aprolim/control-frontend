<template>
  <div class="p-8 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Prueba Simple de Solicitud</h1>
    
    <div class="bg-yellow-100 p-4 rounded mb-4">
      <p class="text-sm">URL de prueba: <strong class="break-all">http://localhost:5000/api/solicitudes/publicas</strong></p>
    </div>
    
    <form @submit.prevent="enviarSolicitud" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Nombre</label>
        <input v-model="form.nombre" type="text" required class="w-full border rounded p-2" />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Teléfono</label>
        <input v-model="form.telefono" type="tel" required class="w-full border rounded p-2" />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input v-model="form.email" type="email" class="w-full border rounded p-2" />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Título</label>
        <input v-model="form.titulo" type="text" required class="w-full border rounded p-2" />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Descripción</label>
        <textarea v-model="form.descripcion" rows="3" required class="w-full border rounded p-2"></textarea>
      </div>
      
      <button type="submit" :disabled="loading" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        {{ loading ? 'Enviando...' : 'Enviar Solicitud' }}
      </button>
    </form>
    
    <div v-if="respuesta" class="mt-4 p-3 rounded" :class="respuestaError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
      <pre class="text-sm whitespace-pre-wrap">{{ respuesta }}</pre>
    </div>
  </div>
</template>

<script setup>
const form = ref({
  nombre: '',
  telefono: '',
  email: '',
  titulo: '',
  descripcion: ''
});

const loading = ref(false);
const respuesta = ref('');
const respuestaError = ref(false);

const enviarSolicitud = async () => {
  loading.value = true;
  respuesta.value = '';
  
  const url = 'http://localhost:5000/api/solicitudes/publicas';
  const payload = {
    titulo: form.value.titulo,
    descripcion: form.value.descripcion,
    horasEstimadas: 0,
    minutosEstimados: 0,
    clienteInfo: {
      logueado: false,
      nombre: form.value.nombre,
      telefono: form.value.telefono,
      email: form.value.email
    }
  };
  
  console.log('📤 URL:', url);
  console.log('📦 Payload:', payload);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', response.headers);
    
    const text = await response.text();
    console.log('📄 Respuesta texto:', text);
    
    try {
      const json = JSON.parse(text);
      respuesta.value = JSON.stringify(json, null, 2);
      respuestaError.value = !response.ok;
      if (response.ok) {
        form.value = { nombre: '', telefono: '', email: '', titulo: '', descripcion: '' };
      }
    } catch (e) {
      respuesta.value = `Error: No es JSON válido\n\n${text.substring(0, 500)}`;
      respuestaError.value = true;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    respuesta.value = 'Error de conexión: ' + error.message;
    respuestaError.value = true;
  } finally {
    loading.value = false;
  }
};
</script>