import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface WorldControlsProps {
  onMove: (position: { x: number; y: number; z: number }) => void
  onInteract: (objectId: string, action: string) => void
  onSendMessage: (message: string) => void
}

export const WorldControls: React.FC<WorldControlsProps> = ({
  onMove,
  onInteract,
  onSendMessage
}) => {
  const [isMoving, setIsMoving] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  })

  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0, z: 0 })

  // Manejar teclas de movimiento
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const step = 0.5
      let newPosition = { ...currentPosition }

      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setIsMoving(prev => ({ ...prev, forward: true }))
          newPosition.z -= step
          break
        case 's':
        case 'arrowdown':
          setIsMoving(prev => ({ ...prev, backward: true }))
          newPosition.z += step
          break
        case 'a':
        case 'arrowleft':
          setIsMoving(prev => ({ ...prev, left: true }))
          newPosition.x -= step
          break
        case 'd':
        case 'arrowright':
          setIsMoving(prev => ({ ...prev, right: true }))
          newPosition.x += step
          break
        case ' ':
          setIsMoving(prev => ({ ...prev, up: true }))
          newPosition.y += step
          break
        case 'shift':
          setIsMoving(prev => ({ ...prev, down: true }))
          newPosition.y -= step
          break
        case 'enter':
          // Abrir chat
          const message = prompt('Escribe un mensaje:')
          if (message) {
            onSendMessage(message)
          }
          break
        case 'e':
          // Interacción
          onInteract('nearest', 'interact')
          break
      }

      if (newPosition.x !== currentPosition.x || 
          newPosition.y !== currentPosition.y || 
          newPosition.z !== currentPosition.z) {
        setCurrentPosition(newPosition)
        onMove(newPosition)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setIsMoving(prev => ({ ...prev, forward: false }))
          break
        case 's':
        case 'arrowdown':
          setIsMoving(prev => ({ ...prev, backward: false }))
          break
        case 'a':
        case 'arrowleft':
          setIsMoving(prev => ({ ...prev, left: false }))
          break
        case 'd':
        case 'arrowright':
          setIsMoving(prev => ({ ...prev, right: false }))
          break
        case ' ':
          setIsMoving(prev => ({ ...prev, up: false }))
          break
        case 'shift':
          setIsMoving(prev => ({ ...prev, down: false }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [currentPosition, onMove, onInteract, onSendMessage])

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
      {/* Controles táctiles para móviles */}
      <div className="grid grid-cols-3 gap-2">
        {/* Fila superior */}
        <div></div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
            isMoving.forward ? 'bg-blue-600' : 'bg-blue-500'
          }`}
          onClick={() => {
            const newPos = { ...currentPosition, z: currentPosition.z - 0.5 }
            setCurrentPosition(newPos)
            onMove(newPos)
          }}
        >
          ↑
        </motion.button>
        <div></div>

        {/* Fila central */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
            isMoving.left ? 'bg-blue-600' : 'bg-blue-500'
          }`}
          onClick={() => {
            const newPos = { ...currentPosition, x: currentPosition.x - 0.5 }
            setCurrentPosition(newPos)
            onMove(newPos)
          }}
        >
          ←
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold"
          onClick={() => onInteract('nearest', 'interact')}
        >
          E
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
            isMoving.right ? 'bg-blue-600' : 'bg-blue-500'
          }`}
          onClick={() => {
            const newPos = { ...currentPosition, x: currentPosition.x + 0.5 }
            setCurrentPosition(newPos)
            onMove(newPos)
          }}
        >
          →
        </motion.button>

        {/* Fila inferior */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
            isMoving.down ? 'bg-blue-600' : 'bg-blue-500'
          }`}
          onClick={() => {
            const newPos = { ...currentPosition, y: currentPosition.y - 0.5 }
            setCurrentPosition(newPos)
            onMove(newPos)
          }}
        >
          ↓
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
            isMoving.backward ? 'bg-blue-600' : 'bg-blue-500'
          }`}
          onClick={() => {
            const newPos = { ...currentPosition, z: currentPosition.z + 0.5 }
            setCurrentPosition(newPos)
            onMove(newPos)
          }}
        >
          ↓
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
            isMoving.up ? 'bg-blue-600' : 'bg-blue-500'
          }`}
          onClick={() => {
            const newPos = { ...currentPosition, y: currentPosition.y + 0.5 }
            setCurrentPosition(newPos)
            onMove(newPos)
          }}
        >
          ↑
        </motion.button>
      </div>

      {/* Instrucciones */}
      <div className="mt-4 text-center text-white text-xs opacity-75">
        <div>WASD: Mover | Espacio: Subir | Shift: Bajar</div>
        <div>E: Interactuar | Enter: Chat</div>
      </div>
    </div>
  )
}

export default WorldControls 