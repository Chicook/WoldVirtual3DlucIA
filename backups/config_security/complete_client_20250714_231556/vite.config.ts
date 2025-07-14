import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/assets': resolve(__dirname, 'src/assets'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/constants': resolve(__dirname, 'src/constants'),
      // Polyfills para Node.js
      'util': 'util',
      'process': 'process/browser',
      'stream': 'stream-browserify',
      // Forzar una sola instancia de three
      'three': resolve(__dirname, 'node_modules/three')
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          web3: ['ethers', 'walletconnect'],
          ui: ['framer-motion', '@headlessui/react', '@heroicons/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'ethers',
      'walletconnect',
      'zustand',
      'immer',
      'framer-motion'
    ]
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.VITE_APP_TITLE': JSON.stringify('Metaverso Web3'),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8000'),
    'process.env.VITE_WS_URL': JSON.stringify(process.env.VITE_WS_URL || 'ws://localhost:8000'),
    'process.env.VITE_CHAIN_ID': JSON.stringify(process.env.VITE_CHAIN_ID || '1'),
    'process.env.VITE_CONTRACT_ADDRESS': JSON.stringify(process.env.VITE_CONTRACT_ADDRESS || '')
  }
}) 