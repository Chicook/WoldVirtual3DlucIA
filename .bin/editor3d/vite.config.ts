import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'three': 'three',
      '@utils': resolve(__dirname, 'src/threejs-utils/funciones_js')
    }
  },

  server: {
    port: 5173,
    host: true,
    headers: {
      // CSP optimizado para desarrollo del editor 3D
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' ws: wss: http: https:",
        "media-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "worker-src 'self' blob:"
      ].join('; ')
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          'three-controls': ['three/examples/jsm/controls/OrbitControls'],
          'three-transform': ['three/examples/jsm/controls/TransformControls'],
          'three-loaders': [
            'three/examples/jsm/loaders/GLTFLoader',
            'three/examples/jsm/loaders/OBJLoader',
            'three/examples/jsm/loaders/FBXLoader'
          ],
          'three-exporters': [
            'three/examples/jsm/exporters/GLTFExporter',
            'three/examples/jsm/exporters/OBJExporter'
          ]
        }
      }
    }
  },

  optimizeDeps: {
    include: [
      'three',
      'three/examples/jsm/controls/OrbitControls',
      'three/examples/jsm/controls/TransformControls',
      'three/examples/jsm/loaders/GLTFLoader',
      'three/examples/jsm/loaders/OBJLoader',
      'three/examples/jsm/exporters/GLTFExporter'
    ],
    exclude: ['@utils']
  },

  define: {
    // Variables globales para Three.js y el editor
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.EDITOR_VERSION': JSON.stringify('2.0.0')
  },

  // Configuración para desarrollo más rápido
  esbuild: {
    target: 'es2020'
  }
});
