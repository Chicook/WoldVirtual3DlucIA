import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// Tipos avanzados para el componente
interface MetaversoWorld3DProps {
  avatarUrl?: string;
  walletAddress?: string;
  onOpenSceneManager?: () => void;
}

interface WorldObject {
  id: string;
  type: 'building' | 'tree' | 'rock' | 'portal' | 'npc';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  interactive?: boolean;
}

// Componente de objeto del mundo avanzado
const WorldObject: React.FC<{
  object: WorldObject;
  onClick?: (objectId: string) => void;
}> = ({ object, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Animación de flotación para objetos interactivos
  useFrame((state: any) => {
    if (meshRef.current && object.interactive) {
      meshRef.current.position.y = object.position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const handlePointerOver = useCallback(() => {
    if (object.interactive) {
      setIsHovered(true);
      document.body.style.cursor = 'pointer';
    }
  }, [object.interactive]);

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  const handleClick = useCallback(() => {
    if (object.interactive && onClick) {
      onClick(object.id);
    }
  }, [object.id, object.interactive, onClick]);

  // Geometría dinámica basada en el tipo de objeto
  const geometry = useMemo(() => {
    switch (object.type) {
      case 'building':
        return <boxGeometry args={[2, 3, 2]} />;
      case 'tree':
        return <cylinderGeometry args={[0.5, 1, 4, 8]} />;
      case 'rock':
        return <dodecahedronGeometry args={[1]} />;
      case 'portal':
        return <ringGeometry args={[1, 2, 16]} />;
      case 'npc':
        return <capsuleGeometry args={[0.5, 2, 8, 16]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [object.type]);

  // Material dinámico con efectos
  const material = useMemo(() => {
    const baseColor = object.color || '#8b5cf6';
    return new THREE.MeshStandardMaterial({
      color: isHovered ? 0x4ade80 : baseColor,
      roughness: 0.3,
      metalness: 0.1,
      emissive: isHovered ? 0x22c55e : 0x000000,
      emissiveIntensity: isHovered ? 0.3 : 0,
      transparent: object.type === 'portal',
      opacity: object.type === 'portal' ? 0.7 : 1
    });
  }, [object.color, object.type, isHovered]);

  return (
    <mesh
      ref={meshRef}
      position={object.position}
      rotation={object.rotation || [0, 0, 0]}
      scale={object.scale || [1, 1, 1]}
      material={material}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {geometry}
    </mesh>
  );
};

// Componente de avatar del usuario
const UserAvatar: React.FC<{ avatarUrl?: string }> = ({ }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animación de respiración
  useFrame((state: any) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]}>
      <capsuleGeometry args={[0.5, 2, 8, 16]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  );
};

// Componente de UI flotante
const FloatingUI: React.FC<{
  walletAddress?: string;
  onOpenSceneManager?: () => void;
}> = ({ walletAddress }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        position={[0, 3, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Metaverso
      </Text>
      
      {walletAddress && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.3}
          color="#9ca3af"
          anchorX="center"
          anchorY="middle"
        >
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </Text>
      )}
    </Float>
  );
};

// Componente principal del mundo 3D
const MetaversoWorld3D: React.FC<MetaversoWorld3DProps> = ({
  avatarUrl,
  walletAddress,
  onOpenSceneManager
}) => {
  const [worldObjects, setWorldObjects] = useState<WorldObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  // Inicialización de objetos del mundo
  useEffect(() => {
    const initialObjects: WorldObject[] = [
      {
        id: 'building-1',
        type: 'building',
        position: [5, 0, 5],
        color: '#ef4444',
        interactive: true
      },
      {
        id: 'tree-1',
        type: 'tree',
        position: [-3, 0, 3],
        color: '#22c55e',
        interactive: false
      },
      {
        id: 'rock-1',
        type: 'rock',
        position: [2, 0, -4],
        color: '#6b7280',
        interactive: false
      },
      {
        id: 'portal-1',
        type: 'portal',
        position: [-5, 0, -5],
        color: '#8b5cf6',
        interactive: true
      },
      {
        id: 'npc-1',
        type: 'npc',
        position: [0, 0, 8],
        color: '#f59e0b',
        interactive: true
      }
    ];
    setWorldObjects(initialObjects);
  }, []);

  // Manejo de clics en objetos
  const handleObjectClick = useCallback((objectId: string) => {
    setSelectedObject(objectId);
    console.log(`Objeto seleccionado: ${objectId}`);
    
    // Lógica específica por tipo de objeto
    const object = worldObjects.find(obj => obj.id === objectId);
    if (object) {
      switch (object.type) {
        case 'building':
          console.log('Entrando al edificio...');
          break;
        case 'portal':
          console.log('Activando portal...');
          break;
        case 'npc':
          console.log('Iniciando conversación con NPC...');
          break;
      }
    }
  }, [worldObjects]);

  // Configuración de iluminación avanzada
  const lighting = useMemo(() => ({
    ambient: { intensity: 0.6, color: 0x404040 },
    directional: { 
      position: [10, 10, 5], 
      intensity: 0.8, 
      color: 0xffffff,
      castShadow: true 
    },
    point: { 
      position: [0, 10, 0], 
      intensity: 0.5, 
      color: 0x4ade80,
      distance: 100 
    }
  }), []);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-900 to-purple-900">
      {/* UI de control */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Metaverso 3D</h2>
        <p className="text-sm mb-4">Explora el mundo virtual</p>
        
        {selectedObject && (
          <div className="mb-4 p-2 bg-blue-600 rounded">
            <p className="text-sm">Seleccionado: {selectedObject}</p>
          </div>
        )}
        
        <button
          onClick={onOpenSceneManager}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Gestor de Escenas
        </button>
      </div>

      {/* Canvas 3D */}
      <Canvas
        camera={{ position: [10, 10, 10], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        {/* Iluminación */}
        <ambientLight 
          intensity={lighting.ambient.intensity} 
          color={lighting.ambient.color} 
        />
        <directionalLight
          position={lighting.directional.position as [number, number, number]}
          intensity={lighting.directional.intensity}
          color={lighting.directional.color}
          castShadow={lighting.directional.castShadow}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight
          position={lighting.point.position as [number, number, number]}
          intensity={lighting.point.intensity}
          color={lighting.point.color}
          distance={lighting.point.distance}
        />

        {/* Cielo y ambiente */}
        <Sky 
          distance={450000} 
          sunPosition={[0, 1, 0]} 
          inclination={0.5} 
          azimuth={0.25} 
        />
        <Environment preset="sunset" />

        {/* Suelo */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>

        {/* Objetos del mundo */}
        {worldObjects.map((object) => (
          <WorldObject
            key={object.id}
            object={object}
            onClick={handleObjectClick}
          />
        ))}

        {/* Avatar del usuario */}
        <UserAvatar avatarUrl={avatarUrl} />

        {/* UI flotante */}
        <FloatingUI 
          walletAddress={walletAddress}
          onOpenSceneManager={onOpenSceneManager}
        />

        {/* Controles de cámara */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={50}
          minDistance={5}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default MetaversoWorld3D; 