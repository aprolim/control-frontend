<template>
  <button
    @click="toggleTheme"
    class="theme-toggle p-2 rounded-lg transition-all duration-300"
    :class="buttonClass"
    :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
  >
    <span v-if="isDark" class="text-yellow-400 text-lg">☀️</span>
    <span v-else class="text-gray-600 text-lg">🌙</span>
  </button>
</template>

<script setup>
console.log('🌓 [ThemeToggle] Componente cargado')

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

console.log('🌓 [ThemeToggle] Modo actual:', colorMode.value)

const buttonClass = computed(() => {
  if (isDark.value) {
    return 'bg-gray-700 hover:bg-gray-600'
  }
  return 'bg-gray-100 hover:bg-gray-200'
})

const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark'
  console.log(`🌓 [ThemeToggle] Cambiando tema de ${colorMode.value} a ${newTheme}`)
  colorMode.preference = newTheme
  localStorage.setItem('theme', newTheme)
  console.log('✅ [ThemeToggle] Tema guardado')
}

// Cargar tema guardado
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && savedTheme !== colorMode.value) {
    console.log(`🌓 [ThemeToggle] Cargando tema guardado: ${savedTheme}`)
    colorMode.preference = savedTheme
  }
  console.log('✅ [ThemeToggle] Inicializado, tema:', colorMode.value)
})
</script>

<style scoped>
.theme-toggle {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.theme-toggle:hover {
  transform: scale(1.05);
}
.theme-toggle:active {
  transform: scale(0.95);
}
</style>