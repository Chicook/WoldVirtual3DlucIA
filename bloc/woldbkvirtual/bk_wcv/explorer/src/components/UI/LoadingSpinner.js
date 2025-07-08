import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'blue', text = 'Cargando...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    yellow: 'border-yellow-500',
    red: 'border-red-500',
    white: 'border-white',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-${color}-500 ${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && (
        <p className="mt-2 text-sm text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 