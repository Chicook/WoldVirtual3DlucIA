import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Object3DProps } from '../types';

// ============================================================================
// 🎮 COMPONENTE OBJECT3D - Objetos 3D Básicos
// ============================================================================

interface ObjectState {
  isLoaded: boolean;
  error: Error | null;
  progress: number;
}

/**
 * Componente base para objetos 3D en el metaverso
 * Soporta geometrías básicas y modelos GLTF/GLB
 */
export const Object3D: React.FC<Object3DProps> = ({
  geometry,
  material,
  model,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  visible = true,
  userData = {},
  onLoad,
  onError,
  ...props
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [state, setState] = useState<ObjectState>({
    isLoaded: false,
    error: null,
    progress: 0
  });

  // Cargar modelo GLTF si se especifica
  const { scene: modelScene } = model ? useGLTF(model) : { scene: null };

  // Cargar texturas si se especifican
  const texture = material?.map ? useTexture(material.map) : null;

  // Manejar carga del modelo
  useEffect(() => {
    if (modelScene) {
      setState(prev => ({ ...prev, isLoaded: true, progress: 100 }));
      onLoad?.(modelScene);
    }
  }, [modelScene, onLoad]);

  // Manejar errores
  useEffect(() => {
    if (state.error) {
      onError?.(state.error);
    }
  }, [state.error, onError]);

  // Animación del objeto
  useFrame((state, delta) => {
    if (meshRef.current && userData.animate) {
      const { animationType, speed = 1 } = userData.animate;
      
      switch (animationType) {
        case 'rotate':
          meshRef.current.rotation.y += delta * speed;
          break;
        case 'bounce':
          meshRef.current.position.y = Math.sin(state.clock.elapsedTime * speed) * 0.5;
          break;
        case 'scale':
          const scale = 1 + Math.sin(state.clock.elapsedTime * speed) * 0.2;
          meshRef.current.scale.setScalar(scale);
          break;
      }
    }
  });

  // Renderizar modelo GLTF
  if (model && modelScene) {
    return (
      <primitive
        object={modelScene}
        position={position}
        rotation={rotation}
        scale={scale}
        visible={visible}
        userData={userData}
        {...props}
      />
    );
  }

  // Renderizar geometría básica
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      visible={visible}
      userData={userData}
      castShadow
      receiveShadow
      {...props}
    >
      {geometry || <boxGeometry args={[1, 1, 1]} />}
      {material ? (
        <primitive object={material} attach="material" />
      ) : (
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.5}
          metalness={0.1}
        />
      )}
    </mesh>
  );
};

// ============================================================================
// 🎯 COMPONENTES ESPECÍFICOS DE GEOMETRÍA
// ============================================================================

/**
 * Cubo 3D básico
 */
export const Cube: React.FC<Omit<Object3DProps, 'geometry'>> = ({
  size = 1,
  ...props
}) => {
  return (
    <Object3D
      geometry={<boxGeometry args={[size, size, size]} />}
      {...props}
    />
  );
};

/**
 * Esfera 3D básica
 */
export const Sphere: React.FC<Omit<Object3DProps, 'geometry'> & {
  radius?: number;
  segments?: number;
}> = ({
  radius = 1,
  segments = 32,
  ...props
}) => {
  return (
    <Object3D
      geometry={<sphereGeometry args={[radius, segments, segments]} />}
      {...props}
    />
  );
};

/**
 * Cilindro 3D básico
 */
export const Cylinder: React.FC<Omit<Object3DProps, 'geometry'> & {
  radius?: number;
  height?: number;
  segments?: number;
}> = ({
  radius = 1,
  height = 2,
  segments = 32,
  ...props
}) => {
  return (
    <Object3D
      geometry={<cylinderGeometry args={[radius, radius, height, segments]} />}
      {...props}
    />
  );
};

/**
 * Plano 3D básico
 */
export const Plane: React.FC<Omit<Object3DProps, 'geometry'> & {
  width?: number;
  height?: number;
  segments?: number;
}> = ({
  width = 1,
  height = 1,
  segments = 1,
  ...props
}) => {
  return (
    <Object3D
      geometry={<planeGeometry args={[width, height, segments, segments]} />}
      {...props}
    />
  );
};

// ============================================================================
// 🎨 COMPONENTES CON MATERIALES ESPECÍFICOS
// ============================================================================

/**
 * Objeto con material metálico
 */
export const MetallicObject: React.FC<Object3DProps> = (props) => {
  return (
    <Object3D
      material={
        <meshStandardMaterial
          color="#888888"
          metalness={0.8}
          roughness={0.2}
        />
      }
      {...props}
    />
  );
};

/**
 * Objeto con material translúcido
 */
export const TranslucentObject: React.FC<Object3DProps> = (props) => {
  return (
    <Object3D
      material={
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
          roughness={0.1}
        />
      }
      {...props}
    />
  );
};

/**
 * Objeto con material emisivo
 */
export const EmissiveObject: React.FC<Object3DProps> = (props) => {
  return (
    <Object3D
      material={
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.5}
        />
      }
      {...props}
    />
  );
};

// ============================================================================
// 🎮 COMPONENTES INTERACTIVOS
// ============================================================================

/**
 * Objeto interactivo con hover
 */
export const InteractiveObject: React.FC<Object3DProps & {
  onHover?: () => void;
  onUnhover?: () => void;
  onClick?: () => void;
}> = ({
  onHover,
  onUnhover,
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const handlePointerOver = () => {
    setIsHovered(true);
    onHover?.();
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    onUnhover?.();
  };

  const handleClick = () => {
    onClick?.();
  };

  return (
    <Object3D
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      userData={{
        ...props.userData,
        isHovered,
        isInteractive: true
      }}
      {...props}
    />
  );
};

// ============================================================================
// 🎯 COMPONENTE DE CARGA
// ============================================================================

/**
 * Componente de carga para objetos 3D
 */
export const ObjectLoader: React.FC<{
  model: string;
  onLoad?: (object: THREE.Object3D) => void;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode;
}> = ({
  model,
  onLoad,
  onError,
  fallback = <Cube size={0.5} />
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleLoad = (object: THREE.Object3D) => {
    setIsLoading(false);
    onLoad?.(object);
  };

  const handleError = (err: Error) => {
    setIsLoading(false);
    setError(err);
    onError?.(err);
  };

  if (error) {
    return (
      <group>
        <Cube size={0.5} />
        <Html position={[0, 1, 0]}>
          <div style={{ color: 'red', fontSize: '12px' }}>
            Error cargando modelo
          </div>
        </Html>
      </group>
    );
  }

  if (isLoading) {
    return <>{fallback}</>;
  }

  return (
    <Object3D
      model={model}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

// ============================================================================
// 📦 EXPORTACIONES
// ============================================================================

export default Object3D;
export {
  Cube,
  Sphere,
  Cylinder,
  Plane,
  MetallicObject,
  TranslucentObject,
  EmissiveObject,
  InteractiveObject,
  ObjectLoader
}; 