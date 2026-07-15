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
      // 🔥 CORREGIDO: Puerto 3000
      apiBase: process.env.API_BASE || 'http://172.16.30.212:5000/api',
      wsUrl: process.env.WS_URL || 'http://172.16.30.212:5000'
    }
  },
  
  devServer: {
    host: '0.0.0.0',
    port: 3001
  },
  
  plugins: ['~/plugins/socket.client.js'],
  
  ssr: false,
  
  nitro: {
    routeRules: {
      // Tus reglas de ruta si las tienes
    }
  },
  
  router: {
    options: {
      middleware: {
        'manifest-route-rule': { override: true }
      }
    }
  },
  
  vite: {
    server: {
      ws: false,
      hmr: false,
      fs: {
        strict: false
      }
    },
    optimizeDeps: {
      include: ['chart.js', 'vue-chartjs', 'socket.io-client']
    },
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
  
  compatibilityDate: '2026-07-01'
});