import React from 'react'
import ReactDOM from 'react-dom/client'
<<<<<<< HEAD
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'
import { MetaversoProvider } from './contexts/MetaversoContext'
import { Web3Provider } from './contexts/Web3Context'
import App from './App'
import ErrorFallback from './components/ErrorFallback'
import './styles/globals.css'
=======
<<<<<<< HEAD
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'

import App from './App'
// import { ErrorFallback } from './components/ErrorFallback' // Eliminado

import './styles/tailwind.css'
>>>>>>> ReactVite

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
    mutations: {
      retry: 1,
    },
  },
})

<<<<<<< HEAD
=======
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
        }}
      />
    </QueryClientProvider>
=======
import { ErrorBoundary } from 'react-error-boundary'
import { MetaversoProvider } from './contexts/MetaversoContext'
import { Web3Provider } from './contexts/Web3Context'
import App from './App'
import ErrorFallback from './components/ErrorFallback'
import './styles/globals.css'

>>>>>>> ReactVite
const ErrorHandler = (error: Error, info: any) => {
  console.error('Error caught by boundary:', error, info)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={ErrorHandler}
    >
      <Web3Provider>
        <MetaversoProvider>
          <App />
        </MetaversoProvider>
      </Web3Provider>
<<<<<<< HEAD
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <MetaversoProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  border: '1px solid #374151',
                },
              }}
            />
          </MetaversoProvider>
        </Web3Provider>
      </QueryClientProvider>
    </ErrorBoundary>
=======
    </ErrorBoundary>
>>>>>>> MetaversoCryptoWoldVirtual
>>>>>>> ReactVite
  </React.StrictMode>
) 