import React from 'react';
import { motion } from 'framer-motion';

interface WorldUIProps {
  onMove: (direction: string) => void;
  onInteract: (objectId: string, action: string) => void;
  onSendMessage: (message: string, channel: string) => void;
}

export const WorldUI: React.FC<WorldUIProps> = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Controles de movimiento */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border border-gray-600">
          <h3 className="text-white font-semibold mb-3">Controles</h3>
          
          <div className="grid grid-cols-3 gap-2">
            <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center">
              ↑
            </button>
            <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center">
              ↓
            </button>
            <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center">
              ←
            </button>
            <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center">
              →
            </button>
            <button className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center">
              ⬆
            </button>
            <button className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center">
              ⬇
            </button>
          </div>
        </div>
      </div>

      {/* Información del mundo */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border border-gray-600"
        >
          <h3 className="text-white font-semibold mb-2">Mundo Actual</h3>
          <p className="text-gray-300 text-sm mb-2">Metaverso Principal</p>
          <p className="text-gray-400 text-xs">Usuarios: 42/100</p>
        </motion.div>
      </div>

      {/* Chat rápido */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border border-gray-600"
        >
          <h3 className="text-white font-semibold mb-3">Chat Rápido</h3>
          
          <div className="space-y-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm">
              👋 Hola a todos
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm">
              🎮 ¿Jugamos?
            </button>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm">
              💰 Trading
            </button>
          </div>
        </motion.div>
      </div>

      {/* Información del jugador */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border border-gray-600"
        >
          <h3 className="text-white font-semibold mb-2">Mi Avatar</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Nivel:</span>
              <span className="text-white">15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">XP:</span>
              <span className="text-white">1,250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Salud:</span>
              <span className="text-green-400">100/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Energía:</span>
              <span className="text-blue-400">85/100</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Coordenadas */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
          <div className="flex space-x-4 text-sm">
            <div>X: 125.3</div>
            <div>Y: 45.7</div>
            <div>Z: -89.2</div>
          </div>
        </div>
      </div>

      {/* Lista de usuarios cercanos */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border border-gray-600 max-h-64 overflow-y-auto"
        >
          <h3 className="text-white font-semibold mb-3">Usuarios Cercanos</h3>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white text-sm">Usuario1</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white text-sm">Usuario2</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-white text-sm">Usuario3</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 