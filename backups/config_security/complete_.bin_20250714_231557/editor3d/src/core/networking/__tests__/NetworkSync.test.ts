import React from 'react'
import { motion } from 'framer-motion'

interface LoadingScreenProps {
  message?: string
  progress?: number
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Cargando metaverso...',
  progress = 0
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo animado */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-4xl">🌍</span>
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Metaverso Crypto World
        </motion.h1>

        {/* Mensaje */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-300 mb-8"
        >
          {message}
        </motion.p>

        {/* Barra de progreso */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ delay: 0.6, duration: 1 }}
          className="w-64 h-2 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden"
        >
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
        </motion.div>

        {/* Porcentaje */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-sm text-gray-400"
        >
          {Math.round(progress)}%
        </motion.p>

        {/* Indicador de carga */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mt-6"
        />
      </div>
    </div>
  )
}

export default LoadingScreen 