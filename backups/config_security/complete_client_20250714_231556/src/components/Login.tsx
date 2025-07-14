import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useWeb3 } from '@/hooks/useWeb3'

export const Login: React.FC = () => {
  const { connect, isConnecting, error } = useWeb3()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  const handleWalletConnect = async () => {
    await connect()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">🌍</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Metaverso Crypto World</h1>
            <p className="text-gray-300 text-sm">Conecta tu wallet y comienza la aventura</p>
          </div>

          {/* Formulario de login */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-white border-opacity-20"></div>
            <span className="px-4 text-gray-300 text-sm">o</span>
            <div className="flex-1 border-t border-white border-opacity-20"></div>
          </div>

          {/* Botón de wallet */}
          <button
            onClick={handleWalletConnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>🔗</span>
            <span>{isConnecting ? 'Conectando...' : 'Conectar Wallet'}</span>
          </button>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center space-y-2">
            <a href="#" className="text-gray-300 text-sm hover:text-white transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
            <div className="text-gray-300 text-sm">
              ¿No tienes cuenta?{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                Regístrate aquí
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login 