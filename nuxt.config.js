export default defineNuxtConfig({
  devtools: { enabled: false },
  
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode'
  ],
  
  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'nuxt-color-mode'
  },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:5000/api',
      wsUrl: process.env.WS_URL || 'http://localhost:5000'
    }
  },
  
  // ✅ AGREGAR PARA EXPONER EN RED
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },
  
  plugins: ['~/plugins/socket.client.js'],
  
  ssr: false,
  
  vite: {
    server: {
      hmr: false,
      fs: {
        strict: false
      }
    },
    optimizeDeps: {
      include: ['chart.js', 'vue-chartjs', 'socket.io-client']
    },
    hmr: false,
    clearScreen: false
  },
  
  experimental: {
    inlineSSRStyles: false
  },
  
  telemetry: false,
  
  app: {
    head: {
      title: 'Control de Personal',
      meta: [
        { name: 'description', content: 'Sistema de control de personal' }
      ]
    }
  },
  
  compatibilityDate: '2026-06-30'
});