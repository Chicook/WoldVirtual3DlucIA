import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WorldObject } from '@/types/metaverso'

interface WorldObjectsProps {
  objects: WorldObject[]
  onObjectClick?: (object: WorldObject) => void
  onObjectHover?: (object: WorldObject | null) => void
}

export const WorldObjects: React.FC<WorldObjectsProps> = ({
  objects,
  onObjectClick,
  onObjectHover
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const hoveredObject = useRef<WorldObject | null>(null)

  // Animación de objetos
  useFrame((state: any) => {
    if (!groupRef.current) return

    groupRef.current.children.forEach((child: any, index: number) => {
      const object = objects[index]
      if (!object) return

      // Rotación suave para objetos dinámicos
      if (object.type === 'dynamic') {
        child.rotation.y += 0.01
      }

      // Flotación para objetos interactivos
      if (object.type === 'interactive') {
        child.position.y = Math.sin(state.clock.elapsedTime + index) * 0.1 + object.position.y
      }
    })
  })

  // Manejar hover
  const handlePointerOver = (object: WorldObject) => {
    hoveredObject.current = object
    onObjectHover?.(object)
  }

  const handlePointerOut = () => {
    hoveredObject.current = null
    onObjectHover?.(null)
  }

  // Manejar click
  const handleClick = (object: WorldObject) => {
    onObjectClick?.(object)
  }

  // Obtener el tipo de objeto basado en el modelo
  const getObjectType = (object: WorldObject) => {
    const modelName = object.model.toLowerCase()
    if (modelName.includes('tree')) return 'tree'
    if (modelName.includes('rock')) return 'rock'
    if (modelName.includes('crystal')) return 'crystal'
    if (modelName.includes('portal')) return 'portal'
    if (modelName.includes('chest')) return 'chest'
    if (modelName.includes('fountain')) return 'fountain'
    return 'default'
  }

  // Obtener color del objeto
  const getObjectColor = (object: WorldObject) => {
    return object.properties?.color || '#888888'
  }

  return (
    <group ref={groupRef}>
      {objects.map((object) => {
        const objectType = getObjectType(object)
        const objectColor = getObjectColor(object)
        
        return (
          <group
            key={object.id}
            position={[object.position.x, object.position.y, object.position.z]}
            rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
            scale={[object.scale.x, object.scale.y, object.scale.z]}
            onClick={() => handleClick(object)}
            onPointerOver={() => handlePointerOver(object)}
            onPointerOut={handlePointerOut}
          >
            {/* Renderizar geometría básica según el tipo */}
            {objectType === 'tree' && (
              <mesh>
                <cylinderGeometry args={[0.5, 1, 3]} />
                <meshStandardMaterial color="#4a7c59" />
              </mesh>
            )}
            
            {objectType === 'rock' && (
              <mesh>
                <dodecahedronGeometry args={[1]} />
                <meshStandardMaterial color="#6b7280" />
              </mesh>
            )}
            
            {objectType === 'crystal' && (
              <mesh>
                <octahedronGeometry args={[0.8]} />
                <meshStandardMaterial 
                  color={objectColor} 
                  transparent 
                  opacity={0.8}
                />
              </mesh>
            )}
            
            {objectType === 'portal' && (
              <mesh>
                <ringGeometry args={[1, 1.5, 32]} />
                <meshStandardMaterial 
                  color="#8b5cf6" 
                  transparent 
                  opacity={0.6}
                />
              </mesh>
            )}
            
            {objectType === 'chest' && (
              <mesh>
                <boxGeometry args={[1, 0.8, 0.6]} />
                <meshStandardMaterial color="#d97706" />
              </mesh>
            )}
            
            {objectType === 'fountain' && (
              <group>
                <mesh>
                  <cylinderGeometry args={[1, 1, 0.5]} />
                  <meshStandardMaterial color="#6b7280" />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                  <cylinderGeometry args={[0.3, 0.3, 1]} />
                  <meshStandardMaterial color="#3b82f6" />
                </mesh>
              </group>
            )}
            
            {/* Geometría por defecto */}
            {objectType === 'default' && (
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={objectColor} />
              </mesh>
            )}
            
            {/* Efectos especiales para objetos interactivos */}
            {object.type === 'interactive' && (
              <pointLight
                color={objectColor}
                intensity={0.5}
                distance={5}
              />
            )}
            
            {/* Indicador visual para objetos interactivos */}
            {object.type === 'interactive' && (
              <mesh>
                <sphereGeometry args={[1.2]} />
                <meshStandardMaterial 
                  color="#10b981" 
                  transparent 
                  opacity={0.1}
                  wireframe
                />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

export default WorldObjects 