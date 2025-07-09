import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './',
  
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          three: ['three'],
          controls: ['three/examples/jsm/controls/OrbitControls.js', 'three/examples/jsm/controls/TransformControls.js'],
          stats: ['stats.js']
        }
      }
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  },
  
  optimizeDeps: {
    include: ['three', 'stats.js']
  },
  
  css: {
    devSourcemap: true
  }
}); 