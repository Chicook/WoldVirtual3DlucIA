import React, { useState } from 'react'
import { useMetaverso } from '@/hooks/useMetaverso'
import { useWeb3 } from '@/hooks/useWeb3'
import { motion } from 'framer-motion'

const MetaversoLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: metaversoState } = useMetaverso()
  const { account } = useWeb3()

  const [showChat, setShowChat] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [showMinimap, setShowMinimap] = useState(true)

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Contenido principal */}
      <div className="w-full h-full">
        {children}
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center space-x-4">
            <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
              <span className="text-sm font-medium">
                {metaversoState.currentWorld?.name || 'Sin mundo'}
              </span>
            </div>
            
            <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
              <span className="text-sm">
                Usuarios: {metaversoState.nearbyUsers.length}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
              <span className="text-sm">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Controles laterales */}
        <div className="absolute right-4 top-20 bottom-4 flex flex-col space-y-2 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChat(!showChat)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg"
          >
            💬
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowInventory(!showInventory)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg shadow-lg"
          >
            🎒
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMinimap(!showMinimap)}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg shadow-lg"
          >
            🗺️
          </motion.button>
        </div>

        {/* Chat */}
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-20 top-4 bottom-4 w-80 bg-white rounded-lg shadow-xl pointer-events-auto"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Chat</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4 h-64 overflow-y-auto">
                <div className="text-sm text-gray-600">
                  Sistema: Bienvenido al metaverso!
                </div>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                  Enviar
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Inventario */}
        {showInventory && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-20 top-4 bottom-4 w-80 bg-white rounded-lg shadow-xl pointer-events-auto"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Inventario</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {metaversoState.inventory.slice(0, 16).map((item, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl border-2 border-gray-200"
                  >
                    {item.item?.icon || '📦'}
                    {item.item?.icon || '📦'}
                    {item.icon || '📦'}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Minimapa */}
        {showMinimap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-4 left-4 w-48 h-48 bg-white rounded-lg shadow-xl pointer-events-auto"
          >
            <div className="p-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 text-sm">Minimapa</h3>
            </div>
            <div className="p-2">
              <div className="w-full h-32 bg-gray-100 rounded border-2 border-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Mapa del mundo</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MetaversoLayout 