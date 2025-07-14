import React from 'react'
import { useWeb3 } from '@/hooks/useWeb3'
import { useMetaverso } from '@/contexts/MetaversoContext'

const Dashboard: React.FC = () => {
  const { isConnected, balance } = useWeb3()
  const { state } = useMetaverso()
  const { userAvatar, currentWorld } = state

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Conecta tu Wallet</h2>
          <p className="text-gray-300">Necesitas conectar tu wallet para acceder al dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Información del Usuario */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {userAvatar?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {userAvatar?.name || 'Usuario'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Nivel {userAvatar?.level || 1}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance de Wallet */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">₿</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Balance</h3>
                    <p className="text-sm text-gray-500">
                      {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0 ETH'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mundo Actual */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">🌍</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Mundo Actual</h3>
                    <p className="text-sm text-gray-500">
                      {currentWorld?.name || 'No hay mundo seleccionado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                Entrar al Metaverso
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
                Marketplace
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
                Inventario
              </button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium">
                Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 