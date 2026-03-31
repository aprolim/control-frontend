export default defineNuxtConfig({
  devtools: { enabled: false },
  
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt'
  ],
  
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:5000/api',
      wsUrl: process.env.WS_URL || 'http://localhost:5000'
    }
  },
  
  plugins: ['~/plugins/socket.client.js'],
  
  ssr: false,
  
  // Configuración crítica para deshabilitar WebSocket de Vite
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
    // Deshabilitar completamente HMR
    hmr: false,
    // Deshabilitar el middleware de Vite
    clearScreen: false
  },
  
  // Configuración para deshabilitar características de desarrollo
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
  
  compatibilityDate: '2024-01-01'
});