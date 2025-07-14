import React from 'react'
import { motion } from 'framer-motion'

interface MovementControlsProps {
  onMove: (direction: 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down') => void
  onAction: (action: 'jump' | 'wave' | 'interact') => void
}

export const MovementControls: React.FC<MovementControlsProps> = ({ onMove, onAction }) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-black bg-opacity-50 backdrop-blur-lg rounded-2xl p-4 border border-gray-600">
        {/* Controles de movimiento */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Fila superior */}
          <div></div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMove('forward')}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
          >
            ↑
          </motion.button>
          <div></div>

          {/* Fila central */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMove('left')}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
          >
            ←
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAction('wave')}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
          >
            👋
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMove('right')}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
          >
            →
          </motion.button>

          {/* Fila inferior */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMove('down')}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
          >
            ↓
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMove('backward')}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
          >
            ↓
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMove('up')}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
          >
            ↑
          </motion.button>
        </div>

        {/* Controles adicionales */}
        <div className="flex justify-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction('jump')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-lg"
          >
            ⬆️ Saltar
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction('interact')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium shadow-lg"
          >
            🔧 Interactuar
          </motion.button>
        </div>

        {/* Instrucciones */}
        <div className="mt-3 text-center text-xs text-gray-300 opacity-75">
          <div>WASD: Mover | Espacio: Saltar | H: Saludar</div>
          <div>Shift: Agacharse | E: Interactuar</div>
        </div>
      </div>
    </div>
  )
}

export default MovementControls 