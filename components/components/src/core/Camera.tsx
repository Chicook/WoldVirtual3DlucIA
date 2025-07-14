import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { CameraProps } from '../types';

// ============================================================================
// 📷 COMPONENTE CAMERA - Controles de Cámara
// ============================================================================

interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  isMoving: boolean;
  currentMode: 'orbit' | 'first-person' | 'follow' | 'cinematic';
}

/**
 * Componente principal de cámara para el metaverso
 * Maneja diferentes modos de cámara y controles
 */
export const Camera: React.FC<CameraProps> = ({
  type = 'perspective',
  fov = 75,
  aspect = window.innerWidth / window.innerHeight,
  near = 0.1,
  far = 1000,
  position = [0, 5, 10],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  visible = true,
  controls = true,
  userData = {},
  ...props
}) => {
  const cameraRef = useRef<THREE.Camera>(null);
  const controlsRef = useRef<any>(null);
  const [state, setState] = useState<CameraState>({
    position: new THREE.Vector3(...position),
    target: new THREE.Vector3(0, 0, 0),
    isMoving: false,
    currentMode: 'orbit'
  });

  const { set } = useThree();

  // Configurar la cámara
  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
      
      // Configurar posición y rotación
      cameraRef.current.position.set(...position);
      cameraRef.current.rotation.set(...rotation);
      cameraRef.current.scale.set(...scale);
      cameraRef.current.visible = visible;
      cameraRef.current.userData = { ...cameraRef.current.userData, ...userData };
    }
  }, [position, rotation, scale, visible, userData, set]);

  // Animación de la cámara
  useFrame((state, delta) => {
    if (cameraRef.current && userData.animate) {
      const { animationType, speed = 1, target } = userData.animate;
      
      switch (animationType) {
        case 'orbit':
          const time = state.clock.elapsedTime * speed;
          const radius = 10;
          cameraRef.current.position.x = Math.cos(time) * radius;
          cameraRef.current.position.z = Math.sin(time) * radius;
          cameraRef.current.position.y = 5;
          cameraRef.current.lookAt(target || new THREE.Vector3(0, 0, 0));
          break;
          
        case 'dolly':
          const dollySpeed = speed * delta;
          cameraRef.current.position.z += dollySpeed;
          break;
          
        case 'pan':
          const panSpeed = speed * delta;
          cameraRef.current.position.x += panSpeed;
          break;
      }
    }
  });

  // Renderizar según el tipo de cámara
  if (type === 'perspective') {
    return (
      <group>
        <PerspectiveCamera
          ref={cameraRef}
          fov={fov}
          aspect={aspect}
          near={near}
          far={far}
          makeDefault
          {...props}
        />
        {controls && (
          <OrbitControls
            ref={controlsRef}
            enablePan={userData.enablePan !== false}
            enableZoom={userData.enableZoom !== false}
            enableRotate={userData.enableRotate !== false}
            maxDistance={userData.maxDistance || 100}
            minDistance={userData.minDistance || 1}
            maxPolarAngle={userData.maxPolarAngle || Math.PI}
            minPolarAngle={userData.minPolarAngle || 0}
            onStart={() => setState(prev => ({ ...prev, isMoving: true }))}
            onEnd={() => setState(prev => ({ ...prev, isMoving: false }))}
            onChange={(e) => {
              if (e.target) {
                setState(prev => ({ 
                  ...prev, 
                  position: e.target.object.position.clone(),
                  target: e.target.target.clone()
                }));
              }
            }}
          />
        )}
      </group>
    );
  }

  return (
    <group>
      <OrthographicCamera
        ref={cameraRef}
        left={-10}
        right={10}
        top={10}
        bottom={-10}
        near={near}
        far={far}
        makeDefault
        {...props}
      />
      {controls && (
        <OrbitControls
          ref={controlsRef}
          enablePan={userData.enablePan !== false}
          enableZoom={userData.enableZoom !== false}
          enableRotate={userData.enableRotate !== false}
        />
      )}
    </group>
  );
};

// ============================================================================
// 📷 COMPONENTES ESPECÍFICOS DE CÁMARA
// ============================================================================

/**
 * Cámara en primera persona
 */
export const FirstPersonCamera: React.FC<Omit<CameraProps, 'type' | 'controls'> & {
  sensitivity?: number;
  onMove?: (position: THREE.Vector3) => void;
}> = ({
  sensitivity = 1,
  onMove,
  position = [0, 2, 0],
  ...props
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isPointerLocked && cameraRef.current) {
        const movementX = event.movementX * sensitivity * 0.002;
        const movementY = event.movementY * sensitivity * 0.002;

        cameraRef.current.rotation.y -= movementX;
        cameraRef.current.rotation.x -= movementY;
        cameraRef.current.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRef.current.rotation.x));

        onMove?.(cameraRef.current.position);
      }
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === cameraRef.current?.domElement);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [isPointerLocked, sensitivity, onMove]);

  const handleClick = () => {
    if (cameraRef.current) {
      cameraRef.current.domElement.requestPointerLock();
    }
  };

  return (
    <PerspectiveCamera
      ref={cameraRef}
      position={position}
      fov={75}
      makeDefault
      onClick={handleClick}
      {...props}
    />
  );
};

/**
 * Cámara que sigue a un objeto
 */
export const FollowCamera: React.FC<Omit<CameraProps, 'type' | 'controls'> & {
  target: THREE.Object3D;
  offset?: THREE.Vector3;
  smoothness?: number;
}> = ({
  target,
  offset = new THREE.Vector3(0, 5, 10),
  smoothness = 0.1,
  ...props
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (cameraRef.current && target) {
      const targetPosition = target.position.clone().add(offset);
      cameraRef.current.position.lerp(targetPosition, smoothness);
      cameraRef.current.lookAt(target.position);
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      fov={75}
      makeDefault
      {...props}
    />
  );
};

/**
 * Cámara cinematográfica con rutas predefinidas
 */
export const CinematicCamera: React.FC<Omit<CameraProps, 'type' | 'controls'> & {
  path: THREE.Vector3[];
  duration?: number;
  loop?: boolean;
  onPathComplete?: () => void;
}> = ({
  path,
  duration = 10,
  loop = true,
  onPathComplete,
  ...props
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useFrame((state) => {
    if (cameraRef.current && path.length > 1) {
      const progress = (state.clock.elapsedTime % duration) / duration;
      const pathIndex = progress * (path.length - 1);
      const index1 = Math.floor(pathIndex);
      const index2 = Math.min(index1 + 1, path.length - 1);
      const t = pathIndex - index1;

      const position = path[index1].clone().lerp(path[index2], t);
      cameraRef.current.position.copy(position);

      // Mirar al siguiente punto en la ruta
      const nextIndex = (index2 + 1) % path.length;
      cameraRef.current.lookAt(path[nextIndex]);

      setCurrentTime(progress);
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      fov={60}
      makeDefault
      {...props}
    />
  );
};

// ============================================================================
// 🎮 COMPONENTES DE CONTROL DE CÁMARA
// ============================================================================

/**
 * Controlador de cámara con múltiples modos
 */
export const CameraController: React.FC<{
  modes: Array<{
    id: string;
    name: string;
    component: React.ReactNode;
  }>;
  defaultMode?: string;
  onModeChange?: (modeId: string) => void;
}> = ({
  modes,
  defaultMode = modes[0]?.id,
  onModeChange
}) => {
  const [currentMode, setCurrentMode] = useState(defaultMode);

  const handleModeChange = (modeId: string) => {
    setCurrentMode(modeId);
    onModeChange?.(modeId);
  };

  const currentComponent = modes.find(m => m.id === currentMode)?.component;

  return (
    <group>
      {currentComponent}
      
      {/* UI de control de cámara */}
      <Html position={[0, 10, 0]}>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white'
        }}>
          <h4>Cámara</h4>
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              style={{
                background: currentMode === mode.id ? '#4a90e2' : '#333',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                margin: '2px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {mode.name}
            </button>
          ))}
        </div>
      </Html>
    </group>
  );
};

/**
 * Cámara con transiciones suaves
 */
export const SmoothCamera: React.FC<CameraProps & {
  transitionDuration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}> = ({
  transitionDuration = 1,
  easing = 'ease-out',
  ...props
}) => {
  const cameraRef = useRef<THREE.Camera>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = (newPosition: THREE.Vector3, newTarget: THREE.Vector3) => {
    if (cameraRef.current) {
      setIsTransitioning(true);
      
      // Implementar transición suave aquí
      // Usar TWEEN.js o una implementación personalizada
      
      setTimeout(() => setIsTransitioning(false), transitionDuration * 1000);
    }
  };

  return (
    <Camera
      ref={cameraRef}
      {...props}
      userData={{
        ...props.userData,
        transitionTo,
        isTransitioning
      }}
    />
  );
};

// ============================================================================
// 📦 EXPORTACIONES
// ============================================================================

export default Camera;
export {
  FirstPersonCamera,
  FollowCamera,
  CinematicCamera,
  CameraController,
  SmoothCamera
}; 