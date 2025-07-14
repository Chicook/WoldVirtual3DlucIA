import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface AvatarSelectionProps {
  onAvatarSelected: (avatarType: 'male' | 'female', avatarData: any) => void
}

interface AvatarData {
  type: 'male' | 'female'
  name: string
  color: string
  height: number
  animations: {
    idle: boolean
    walk: boolean
    wave: boolean
  }
}

export const AvatarSelection: React.FC<AvatarSelectionProps> = ({ onAvatarSelected }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<'male' | 'female'>('male')
  const [avatarName, setAvatarName] = useState('')
  const [currentAnimation, setCurrentAnimation] = useState<'idle' | 'walk' | 'wave'>('idle')
  const [isAnimating, setIsAnimating] = useState(false)

  const handleAvatarSelect = (type: 'male' | 'female') => {
    setSelectedAvatar(type)
    setAvatarName(type === 'male' ? 'Alex' : 'Luna')
  }

  const handleAnimationChange = (animation: 'idle' | 'walk' | 'wave') => {
    setCurrentAnimation(animation)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  const handleConfirmSelection = () => {
    if (!avatarName.trim()) {
      alert('Por favor ingresa un nombre para tu avatar')
      return
    }

    const avatarData: AvatarData = {
      type: selectedAvatar,
      name: avatarName,
      color: selectedAvatar === 'male' ? '#4A90E2' : '#E91E63',
      height: selectedAvatar === 'male' ? 1.8 : 1.65,
      animations: {
        idle: true,
        walk: true,
        wave: true
      }
    }

    onAvatarSelected(selectedAvatar, avatarData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Crea tu Avatar</h1>
          <p className="text-gray-300">Elige tu personaje y personalízalo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vista 3D del Avatar */}
          <div className="bg-black bg-opacity-30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4 text-center">Vista Previa</h3>
            <div className="h-96 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 1.5, 3], fov: 60 }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <pointLight position={[-5, 5, 5]} intensity={0.3} />
                
                <Avatar3D 
                  type={selectedAvatar} 
                  animation={currentAnimation}
                  isAnimating={isAnimating}
                />
                
                <OrbitControls 
                  enablePan={false}
                  enableZoom={true}
                  enableRotate={true}
                  maxPolarAngle={Math.PI / 2}
                  minPolarAngle={0}
                  maxDistance={5}
                  minDistance={2}
                />
              </Canvas>
            </div>

            {/* Controles de Animación */}
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => handleAnimationChange('idle')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentAnimation === 'idle' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Reposo
              </button>
              <button
                onClick={() => handleAnimationChange('walk')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentAnimation === 'walk' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Caminar
              </button>
              <button
                onClick={() => handleAnimationChange('wave')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentAnimation === 'wave' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Saludar
              </button>
            </div>
          </div>

          {/* Panel de Selección */}
          <div className="space-y-6">
            {/* Selección de Género */}
            <div>
              <h3 className="text-white font-semibold mb-4">Elige tu Avatar</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAvatarSelect('male')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedAvatar === 'male'
                      ? 'border-blue-400 bg-blue-600 bg-opacity-20'
                      : 'border-gray-600 bg-gray-800 bg-opacity-20 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">
                      👨
                    </div>
                    <p className="text-white font-medium">Hombre</p>
                    <p className="text-gray-400 text-sm">Avatar Masculino</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAvatarSelect('female')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedAvatar === 'female'
                      ? 'border-pink-400 bg-pink-600 bg-opacity-20'
                      : 'border-gray-600 bg-gray-800 bg-opacity-20 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-pink-500 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">
                      👩
                    </div>
                    <p className="text-white font-medium">Mujer</p>
                    <p className="text-gray-400 text-sm">Avatar Femenino</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Nombre del Avatar */}
            <div>
              <label className="block text-white font-medium mb-2">
                Nombre de tu Avatar
              </label>
              <input
                type="text"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                placeholder="Ingresa el nombre de tu avatar"
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
              />
            </div>

            {/* Información del Avatar */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Información del Avatar</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Tipo:</span>
                  <span className="text-white capitalize">{selectedAvatar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Altura:</span>
                  <span className="text-white">
                    {selectedAvatar === 'male' ? '1.80m' : '1.65m'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Color:</span>
                  <span className="text-white">
                    {selectedAvatar === 'male' ? 'Azul' : 'Rosa'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Animaciones:</span>
                  <span className="text-white">3 disponibles</span>
                </div>
              </div>
            </div>

            {/* Botón de Confirmación */}
            <button
              onClick={handleConfirmSelection}
              disabled={!avatarName.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Selección
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente 3D del Avatar
interface Avatar3DProps {
  type: 'male' | 'female'
  animation: 'idle' | 'walk' | 'wave'
  isAnimating: boolean
  position?: [number, number, number]
}

export const Avatar3D: React.FC<Avatar3DProps> = ({ type, animation, position = [0, 0, 0] }) => {
  const groupRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!groupRef.current) return

    const animate = () => {
      if (!groupRef.current) return

      const time = Date.now() * 0.001

      if (animation === 'walk') {
        // Animación de caminar
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(time * 4) * 0.3
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = Math.sin(time * 4 + Math.PI) * 0.3
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(time * 4 + Math.PI) * 0.2
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(time * 4) * 0.2
        }
      } else if (animation === 'wave') {
        // Animación de saludar
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = Math.sin(time * 3) * 0.5
          rightArmRef.current.rotation.x = Math.sin(time * 3) * 0.3
        }
      } else {
        // Animación de reposo (respiración sutil)
        if (groupRef.current) {
          groupRef.current.position.y = Math.sin(time * 2) * 0.02
        }
      }
    }

    const interval = setInterval(animate, 16) // 60 FPS
    return () => clearInterval(interval)
  }, [animation])

  const avatarColor = type === 'male' ? '#4A90E2' : '#E91E63'
  const height = type === 'male' ? 1.8 : 1.65

  return (
    <group ref={groupRef} position={position}>
      {/* Cabeza */}
      <mesh position={[0, height - 0.2, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={avatarColor} />
      </mesh>

      {/* Cuerpo */}
      <mesh position={[0, height - 0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.6, 8]} />
        <meshStandardMaterial color={avatarColor} />
      </mesh>

      {/* Brazos */}
      <group ref={leftArmRef} position={[-0.25, height - 0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color={avatarColor} />
        </mesh>
        {/* Mano izquierda */}
        <mesh position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={avatarColor} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.25, height - 0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color={avatarColor} />
        </mesh>
        {/* Mano derecha */}
        <mesh position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={avatarColor} />
        </mesh>
      </group>

      {/* Piernas */}
      <group ref={leftLegRef} position={[-0.08, height - 1.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
          <meshStandardMaterial color={avatarColor} />
        </mesh>
        {/* Pie izquierdo */}
        <mesh position={[0, -0.3, 0.05]}>
          <boxGeometry args={[0.12, 0.08, 0.2]} />
          <meshStandardMaterial color={avatarColor} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.08, height - 1.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
          <meshStandardMaterial color={avatarColor} />
        </mesh>
        {/* Pie derecho */}
        <mesh position={[0, -0.3, 0.05]}>
          <boxGeometry args={[0.12, 0.08, 0.2]} />
          <meshStandardMaterial color={avatarColor} />
        </mesh>
      </group>

      {/* Suelo */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
    </group>
  )
}

export default AvatarSelection 