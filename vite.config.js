import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 5173,
    open: true
  },
  define: {
    // SQLite configuration for browser
    'global': 'globalThis',
  },
  optimizeDeps: {
    exclude: ['sql.js']
  },
  assetsInclude: ['**/*.wasm']
})