import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import { SceneProps, ThreeComponentProps } from '../types';

// ============================================================================
// 🎮 COMPONENTE SCENE - Escena 3D Principal
// ============================================================================

interface SceneState {
  isLoaded: boolean;
  error: Error | null;
  performance: {
    fps: number;
    memory: number;
    drawCalls: number;
  };
}

/**
 * Componente principal de escena 3D para el metaverso
 * Maneja la configuración básica de Three.js y el renderizado
 */
export const Scene: React.FC<SceneProps> = ({
  background = '#000000',
  fog,
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  visible = true,
  userData = {},
  ...props
}) => {
  const [state, setState] = useState<SceneState>({
    isLoaded: false,
    error: null,
    performance: {
      fps: 0,
      memory: 0,
      drawCalls: 0
    }
  });

  // Configuración de la escena
  const sceneConfig = {
    background: typeof background === 'string' ? background : background.getHexString(),
    fog: fog ? {
      color: typeof fog.color === 'string' ? fog.color : fog.color.getHexString(),
      near: fog.near,
      far: fog.far
    } : undefined,
    position,
    rotation,
    scale,
    visible,
    userData
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(sceneConfig.background);
          if (sceneConfig.fog) {
            scene.fog = new THREE.Fog(
              sceneConfig.fog.color,
              sceneConfig.fog.near,
              sceneConfig.fog.far
            );
          }
          setState(prev => ({ ...prev, isLoaded: true }));
        }}
        onError={(error) => {
          setState(prev => ({ ...prev, error }));
          console.error('Scene error:', error);
        }}
      >
        {/* Controles de cámara */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={100}
          minDistance={1}
        />

        {/* Iluminación ambiental */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Entorno */}
        <Environment preset="sunset" />

        {/* Componentes de la escena */}
        <SceneContent 
          config={sceneConfig}
          onPerformanceUpdate={(metrics) => {
            setState(prev => ({
              ...prev,
              performance: metrics
            }));
          }}
        >
          {children}
        </SceneContent>

        {/* Estadísticas de rendimiento (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <Stats />
        )}
      </Canvas>

      {/* Overlay de estado */}
      <SceneOverlay state={state} />
    </div>
  );
};

// ============================================================================
// 🎯 COMPONENTE INTERNO - Contenido de la Escena
// ============================================================================

interface SceneContentProps {
  config: any;
  children: React.ReactNode;
  onPerformanceUpdate: (metrics: any) => void;
}

const SceneContent: React.FC<SceneContentProps> = ({ 
  config, 
  children, 
  onPerformanceUpdate 
}) => {
  const { scene, gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  // Actualizar métricas de rendimiento
  useFrame((state) => {
    frameCount.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      const memory = (gl.info.memory as any)?.geometries || 0;
      const drawCalls = gl.info.render?.calls || 0;

      onPerformanceUpdate({
        fps,
        memory,
        drawCalls
      });

      frameCount.current = 0;
      lastTime.current = currentTime;
    }
  });

  // Configurar la escena
  useEffect(() => {
    if (scene) {
      scene.position.set(...config.position);
      scene.rotation.set(...config.rotation);
      scene.scale.set(...config.scale);
      scene.visible = config.visible;
      scene.userData = { ...scene.userData, ...config.userData };
    }
  }, [scene, config]);

  return <>{children}</>;
};

// ============================================================================
// 🎨 COMPONENTE OVERLAY - Información de Estado
// ============================================================================

interface SceneOverlayProps {
  state: SceneState;
}

const SceneOverlay: React.FC<SceneOverlayProps> = ({ state }) => {
  if (!state.isLoaded && !state.error) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '18px',
        zIndex: 1000
      }}>
        Cargando escena...
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000
      }}>
        Error: {state.error.message}
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <div>FPS: {state.performance.fps}</div>
      <div>Memoria: {state.performance.memory}</div>
      <div>Draw Calls: {state.performance.drawCalls}</div>
    </div>
  );
};

// ============================================================================
// 🎯 COMPONENTE SCENE SIMPLE - Versión Simplificada
// ============================================================================

/**
 * Versión simplificada de Scene para casos básicos
 */
export const SimpleScene: React.FC<Omit<SceneProps, 'background' | 'fog'>> = ({
  children,
  ...props
}) => {
  return (
    <Scene
      background="#87CEEB"
      {...props}
    >
      {children}
    </Scene>
  );
};

// ============================================================================
// 🎮 COMPONENTE SCENE CON FÍSICA - Versión con Motor Físico
// ============================================================================

/**
 * Versión de Scene con motor de física integrado
 */
export const PhysicsScene: React.FC<SceneProps> = ({
  children,
  ...props
}) => {
  return (
    <Scene {...props}>
      <Physics gravity={[0, -9.81, 0]}>
        {children}
      </Physics>
    </Scene>
  );
};

// ============================================================================
// 📦 EXPORTACIONES
// ============================================================================

export default Scene;
export { SimpleScene, PhysicsScene }; 