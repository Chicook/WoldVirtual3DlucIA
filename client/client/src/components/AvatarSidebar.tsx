import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AvatarSidebarProps {
  selectedAvatar: any
  currentAnimation: string
  onAnimationChange: (animation: 'idle' | 'walk' | 'wave') => void
  onToggleSidebar: () => void
  isOpen: boolean
}

export const AvatarSidebar: React.FC<AvatarSidebarProps> = ({
  selectedAvatar,
  currentAnimation,
  onAnimationChange,
  onToggleSidebar,
  isOpen
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'animations' | 'controls'>('info')

  const animations = [
    { id: 'idle', name: 'Reposo', icon: '😴', description: 'Animación de respiración' },
    { id: 'walk', name: 'Caminar', icon: '🚶', description: 'Movimiento de brazos y piernas' },
    { id: 'wave', name: 'Saludar', icon: '👋', description: 'Saludo con brazo derecho' }
  ]

  const controls = [
    { key: 'WASD', action: 'Mover avatar', icon: '🎮' },
    { key: 'H', action: 'Saludar', icon: '👋' },
    { key: 'Espacio', action: 'Saltar', icon: '⬆️' },
    { key: 'Shift', action: 'Agacharse', icon: '⬇️' }
  ]

  return (
    <>
      {/* Botón para abrir/cerrar sidebar */}
      <motion.button
        onClick={onToggleSidebar}
        className="fixed top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? '✕' : '👤'}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-gray-900 bg-opacity-95 backdrop-blur-lg border-r border-gray-700 z-40 shadow-2xl"
          >
            <div className="p-6 h-full flex flex-col">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Tu Avatar</h2>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${selectedAvatar?.type === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                  <span className="text-gray-300 font-medium">{selectedAvatar?.name || 'Sin nombre'}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'info'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Info
                </button>
                <button
                  onClick={() => setActiveTab('animations')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'animations'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Animaciones
                </button>
                <button
                  onClick={() => setActiveTab('controls')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'controls'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Controles
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'info' && (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      {/* Avatar Info */}
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Información del Avatar</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tipo:</span>
                            <span className="text-white capitalize">{selectedAvatar?.type || 'No seleccionado'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Nombre:</span>
                            <span className="text-white">{selectedAvatar?.name || 'Sin nombre'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Altura:</span>
                            <span className="text-white">
                              {selectedAvatar?.type === 'male' ? '1.80m' : '1.65m'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Color:</span>
                            <span className="text-white">
                              {selectedAvatar?.type === 'male' ? 'Azul' : 'Rosa'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Estadísticas</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">3</div>
                            <div className="text-sm text-gray-400">Animaciones</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">100%</div>
                            <div className="text-sm text-gray-400">Salud</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'animations' && (
                    <motion.div
                      key="animations"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3">Animaciones Disponibles</h3>
                      <div className="space-y-3">
                        {animations.map((animation) => (
                          <motion.button
                            key={animation.id}
                            onClick={() => onAnimationChange(animation.id as 'idle' | 'walk' | 'wave')}
                            className={`w-full p-4 rounded-lg border-2 transition-all ${
                              currentAnimation === animation.id
                                ? 'border-blue-400 bg-blue-600 bg-opacity-20'
                                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{animation.icon}</span>
                              <div className="text-left">
                                <div className="font-medium text-white">{animation.name}</div>
                                <div className="text-sm text-gray-400">{animation.description}</div>
                              </div>
                              {currentAnimation === animation.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="ml-auto w-3 h-3 bg-blue-400 rounded-full"
                                />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Current Animation Status */}
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-white mb-2">Animación Actual</h4>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-white capitalize">{currentAnimation}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'controls' && (
                    <motion.div
                      key="controls"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3">Controles</h3>
                      <div className="space-y-3">
                        {controls.map((control, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{control.icon}</span>
                              <span className="text-white">{control.action}</span>
                            </div>
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded font-mono">
                              {control.key}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Tips */}
                      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-blue-300 mb-2">💡 Consejos</h4>
                        <ul className="text-sm text-blue-200 space-y-1">
                          <li>• Usa WASD para moverte por el mundo</li>
                          <li>• Presiona H para saludar a otros usuarios</li>
                          <li>• Experimenta con diferentes animaciones</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="text-center text-sm text-gray-400">
                  <p>Metaverso Crypto World</p>
                  <p className="text-xs mt-1">Tu avatar, tu mundo</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AvatarSidebar 