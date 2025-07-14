import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Text } from '@react-three/drei'
import * as THREE from 'three'
import { User } from '@/types/metaverso'

interface UserAvatarsProps {
  users: User[]
}

export const UserAvatars: React.FC<UserAvatarsProps> = ({ users }) => {
  const avatarsRef = useRef<THREE.Group>(null)
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null)

  // Animación de avatares
  useFrame((state) => {
    if (avatarsRef.current) {
      const time = state.clock.getElapsedTime()
      
      avatarsRef.current.children.forEach((child) => {
        // Efecto de flotación suave
        child.position.y = Math.sin(time * 2 + child.position.x) * 0.1 + 1
        
        // Rotación suave para avatares
        child.rotation.y = time * 0.1
      })
    }
  })

  // Renderizar avatar individual
  const renderAvatar = (user: User) => {

    const position: [number, number, number] = [user.position.x, user.position.y, user.position.z]

    const position: [number, number, number] = [user.avatar?.position?.x || 0, user.avatar?.position?.y || 0, user.avatar?.position?.z || 0]

    const position: [number, number, number] = [user.avatar?.position?.x || 0, user.avatar?.position?.y || 0, user.avatar?.position?.z || 0]

    const position: [number, number, number] = [user.position.x, user.position.y, user.position.z]
    const rotation: [number, number, number] = [0, 0, 0]
    const scale: [number, number, number] = [1, 1, 1]

    return (
      <group key={user.id} userData={{ user }}>
        {/* Cuerpo del avatar */}
        <Box
          args={[0.8, 1.5, 0.4]}
          position={position}
          rotation={rotation}
          scale={scale}
          castShadow
          onPointerOver={() => setHoveredAvatar(user.id)}
          onPointerOut={() => setHoveredAvatar(null)}
        >
          <meshStandardMaterial
            color="#FFB6C1"
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Cabeza */}
        <Box
          args={[0.6, 0.6, 0.6]}
          position={[position[0], position[1] + 1.2, position[2]]}
          rotation={rotation}
          scale={scale}
          castShadow
        >
          <meshStandardMaterial
            color="#FFB6C1"
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Brazos */}
        <Box
          args={[0.3, 1.2, 0.3]}
          position={[position[0] - 0.6, position[1] + 0.3, position[2]]}
          rotation={rotation}
          scale={scale}
          castShadow
        >
          <meshStandardMaterial
            color="#FFB6C1"
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        <Box
          args={[0.3, 1.2, 0.3]}
          position={[position[0] + 0.6, position[1] + 0.3, position[2]]}
          rotation={rotation}
          scale={scale}
          castShadow
        >
          <meshStandardMaterial
            color="#FFB6C1"
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Piernas */}
        <Box
          args={[0.3, 1.2, 0.3]}
          position={[position[0] - 0.2, position[1] - 1.2, position[2]]}
          rotation={rotation}
          scale={scale}
          castShadow
        >
          <meshStandardMaterial
            color="#000080"
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        <Box
          args={[0.3, 1.2, 0.3]}
          position={[position[0] + 0.2, position[1] - 1.2, position[2]]}
          rotation={rotation}
          scale={scale}
          castShadow
        >
          <meshStandardMaterial
            color="#000080"
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Ropa superior */}
        <Box
          args={[0.8, 0.8, 0.4]}
          position={[position[0], position[1] + 0.3, position[2]]}
          rotation={rotation}
          scale={scale}
          castShadow
        >
          <meshStandardMaterial
            color="#FF0000"
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Nombre del usuario */}
        <Text
          position={[position[0], position[1] + 2, position[2]]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {user.username}
        </Text>

        {/* Efecto de hover */}
        {hoveredAvatar === user.id && (
          <Box
            args={[1.2, 2.5, 0.6]}
            position={position}
            rotation={rotation}
            scale={scale}
          >
            <meshBasicMaterial
              color="#00ff00"
              transparent
              opacity={0.2}
              wireframe
            />
          </Box>
        )}

        {/* Indicador de estado */}
        <Box
          args={[0.2, 0.2, 0.2]}
          position={[position[0] + 0.5, position[1] + 1.5, position[2]]}
          rotation={rotation}
          scale={scale}
        >
          <meshBasicMaterial

            color={user.isOnline ? '#00ff00' : '#ff0000'}

            color={user.status === 'online' ? '#00ff00' : '#ff0000'}

            color={user.status === 'online' ? '#00ff00' : '#ff0000'}

            color={user.isOnline ? '#00ff00' : '#ff0000'}
          />
        </Box>
      </group>
    )
  }

  return (
    <group ref={avatarsRef}>
      {users.map(renderAvatar)}
    </group>
  )
}

export default UserAvatars 