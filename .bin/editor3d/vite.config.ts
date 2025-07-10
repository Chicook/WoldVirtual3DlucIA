import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // JSX runtime automático
      jsxRuntime: 'automatic'
    })
  ],
  
  // Configuración del servidor de desarrollo
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: false,
      interval: 100
    },
    // Configuración de headers para desarrollo
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: wss:;"
    }
  },
  
  // Configuración de preview
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
    open: true
  },
  
  // Resolución de módulos
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@test': resolve(__dirname, './src/test'),
      '@types': resolve(__dirname, './src/types'),
      '@assets': resolve(__dirname, './src/assets'),
      '@styles': resolve(__dirname, './src/styles'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@store': resolve(__dirname, './src/store'),
      '@threejs': resolve(__dirname, './src/threejs-utils'),
      '@server': resolve(__dirname, './src/server'),
      '@config': resolve(__dirname, './config')
    }
  },
  
  // Configuración de build
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        editor: resolve(__dirname, 'src/editor.html')
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three'],
          'ui-vendor': ['clsx', 'tailwind-merge', 'zustand'],
          'utils-vendor': ['lodash', 'date-fns', 'nanoid', 'uuid']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset';
          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true
  },
  
  // Optimizaciones
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      'clsx',
      'tailwind-merge',
      'zustand',
      'lodash',
      'date-fns',
      'nanoid',
      'uuid',
      'ws'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  
  // Configuración de CSS
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // Configuración de assets
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.fbx', '**/*.obj', '**/*.stl'],
  
  // Configuración de worker
  worker: {
    format: 'es'
  },
  
  // Configuración de define
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  
  // Configuración de esbuild
  esbuild: {
    jsxInject: `import React from 'react'`,
    target: 'esnext'
  }
});
