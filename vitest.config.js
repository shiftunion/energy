import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Include our test files with test_ prefix
    include: ['tests/**/*.js'],
    // Setup DOM environment for component tests
    environment: 'jsdom',
    // Global test setup
    globals: true,
    // Coverage reporting
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'vite.config.js',
        'vitest.config.js'
      ]
    }
  },
  // Handle WASM files for sql.js
  define: {
    'global': 'globalThis',
  },
  optimizeDeps: {
    exclude: ['sql.js']
  },
  assetsInclude: ['**/*.wasm']
})