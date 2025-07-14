import React from 'react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Ups! Algo salió mal
        </h1>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-red-800 font-medium mb-2">Detalles del error:</p>
          <p className="text-xs text-red-700 font-mono break-all">
            {error.message}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorFallback 