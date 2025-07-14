import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Cargando Metaverso...' 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo animado */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
        </div>
        
        {/* Spinner */}
        <div className="mb-6">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        
        {/* Mensaje */}
        <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
        <p className="text-blue-200 text-sm">Preparando tu experiencia virtual...</p>
        
        {/* Barra de progreso */}
        <div className="w-64 h-2 bg-blue-900 rounded-full mt-6 mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}; 