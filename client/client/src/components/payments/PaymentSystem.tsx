import React, { useState } from 'react'

interface PaymentSystemProps {
  isOpen: boolean
  onToggle: () => void
  amount: number
  currency: string
  description: string
}

export const PaymentSystem: React.FC<PaymentSystemProps> = ({ 
  isOpen, 
  onToggle, 
  amount, 
  currency, 
  description 
}) => {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      alert('Por favor completa todos los campos')
      return
    }

    setIsProcessing(true)
    
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Pago procesado:', { 
        amount, 
        currency, 
        description,
        cardNumber: cardNumber.slice(-4),
        cardholderName 
      })
      
      alert('Pago procesado exitosamente')
      onToggle()
      
      // Limpiar formulario
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setCardholderName('')
    } catch (error) {
      console.error('Error procesando pago:', error)
      alert('Error procesando el pago')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pago Seguro</h2>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Resumen del pago */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Resumen del Pago</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{description}</span>
            <span className="text-xl font-bold text-blue-600">
              {amount} {currency}
            </span>
          </div>
        </div>

        {/* Formulario de pago */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Tarjeta
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Titular
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Estado de procesamiento */}
          {isProcessing && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-gray-600">Procesando pago...</span>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={onToggle}
              disabled={isProcessing}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing || !cardNumber || !expiryDate || !cvv || !cardholderName}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Procesando...' : `Pagar ${amount} ${currency}`}
            </button>
          </div>
        </div>

        {/* Nota de seguridad */}
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-sm text-green-700">
            <span className="mr-2">🔒</span>
            <span>Pago seguro con encriptación SSL</span>
          </div>
        </div>
      </div>
    </div>
  )
}
