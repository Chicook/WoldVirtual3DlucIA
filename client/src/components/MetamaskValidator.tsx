import React, { useState, useEffect } from 'react'
import { useWeb3 } from '@/hooks/useWeb3'

interface MetamaskValidatorProps {
  onValidationComplete?: (isValid: boolean) => void
}

const MetamaskValidator: React.FC<MetamaskValidatorProps> = ({ onValidationComplete }) => {
  const { connect, disconnect, isConnected, account, error } = useWeb3()
  const [isValidating, setIsValidating] = useState(false)
  const [validationStep, setValidationStep] = useState<'checking' | 'connecting' | 'validating' | 'complete'>('checking')

  useEffect(() => {
    validateMetamask()
  }, [])

  const validateMetamask = async () => {
    setIsValidating(true)
    setValidationStep('checking')

    try {
      // Verificar si MetaMask está instalado
      if (typeof window !== 'undefined' && window.ethereum) {
        setValidationStep('connecting')
        
        // Intentar conectar
        await connect()
        setValidationStep('validating')
        
        // Verificar si la conexión fue exitosa
        if (isConnected && account) {
          setValidationStep('complete')
          onValidationComplete?.(true)
        } else {
          onValidationComplete?.(false)
        }
      } else {
        console.error('MetaMask no está instalado')
        onValidationComplete?.(false)
      }
    } catch (error) {
      console.error('Error validando MetaMask:', error)
      onValidationComplete?.(false)
    } finally {
      setIsValidating(false)
    }
  }

  const handleConnect = async () => {
    try {
      setValidationStep('connecting')
      await connect()
      setValidationStep('validating')
      
      if (isConnected && account) {
        setValidationStep('complete')
        onValidationComplete?.(true)
      }
    } catch (error) {
      console.error('Error conectando:', error)
      onValidationComplete?.(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setValidationStep('checking')
      onValidationComplete?.(false)
    } catch (error) {
      console.error('Error desconectando:', error)
    }
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'checking':
        return '🔍'
      case 'connecting':
        return '🔗'
      case 'validating':
        return '✅'
      case 'complete':
        return '🎉'
      default:
        return '❓'
    }
  }

  const getStepText = (step: string) => {
    switch (step) {
      case 'checking':
        return 'Verificando MetaMask...'
      case 'connecting':
        return 'Conectando wallet...'
      case 'validating':
        return 'Validando conexión...'
      case 'complete':
        return '¡Conectado exitosamente!'
      default:
        return 'Paso desconocido'
    }
  }

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">
              {getStepIcon(validationStep)}
            </div>
            <h2 className="text-xl font-semibold mb-2">Validación de MetaMask</h2>
            <p className="text-gray-600 mb-4">{getStepText(validationStep)}</p>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: validationStep === 'checking' ? '25%' : 
                         validationStep === 'connecting' ? '50%' : 
                         validationStep === 'validating' ? '75%' : '100%' 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">MetaMask Conectado</h2>
            <p className="text-gray-600 mb-4">
              Wallet conectada exitosamente
            </p>
            
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p className="text-sm font-mono text-gray-700 break-all">
                {account}
              </p>
            </div>
            
            <button
              onClick={handleDisconnect}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Desconectar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🦊</div>
          <h2 className="text-xl font-semibold mb-2">MetaMask Requerido</h2>
          <p className="text-gray-600 mb-6">
            Para acceder al metaverso, necesitas tener MetaMask instalado y conectado.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleConnect}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Conectar MetaMask
            </button>
            
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Descargar MetaMask
            </a>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>¿No tienes MetaMask?</p>
            <p>Descárgalo desde el sitio oficial</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetamaskValidator 