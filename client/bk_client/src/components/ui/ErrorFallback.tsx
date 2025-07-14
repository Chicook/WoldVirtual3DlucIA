import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Algo salió mal
        </h1>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado en el Metaverso.
        </p>
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Ver detalles del error
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    </div>
  );
}; 