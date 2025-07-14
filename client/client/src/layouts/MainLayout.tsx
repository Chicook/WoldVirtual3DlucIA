import React from 'react'
import { useMetaverso } from '@/hooks/useMetaverso'
import { useWeb3 } from '@/hooks/useWeb3'
import { motion } from 'framer-motion'

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isInitialized } = useMetaverso()
  const { isConnected } = useWeb3()

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Inicializando Metaverso</h2>
          <p className="text-gray-300">Cargando experiencias virtuales...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Conecta tu Wallet</h2>
          <p className="text-gray-300 mb-6">Necesitas conectar tu wallet para acceder al metaverso</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
            Conectar Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default MainLayout 