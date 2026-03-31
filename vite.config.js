import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    strictPort: false,
    hmr: false,
    watch: {
      usePolling: false
    }
  },
  optimizeDeps: {
    include: ['chart.js', 'vue-chartjs', 'socket.io-client']
  },
  build: {
    sourcemap: false
  }
});