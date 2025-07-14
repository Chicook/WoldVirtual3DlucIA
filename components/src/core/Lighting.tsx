import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LightingProps } from '../types';

// ============================================================================
// 💡 COMPONENTE LIGHTING - Sistema de Iluminación
// ============================================================================

interface LightingState {
  intensity: number;
  color: THREE.Color;
  isOn: boolean;
}

/**
 * Componente base para iluminación en el metaverso
 * Soporta diferentes tipos de luces y efectos
 */
export const Lighting: React.FC<LightingProps> = ({
  type = 'ambient',
  intensity = 1,
  color = '#ffffff',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  visible = true,
  castShadow = false,
  receiveShadow = false,
  userData = {},
  ...props
}) => {
  const lightRef = useRef<THREE.Light>(null);
  const [state, setState] = React.useState<LightingState>({
    intensity,
    color: new THREE.Color(color),
    isOn: visible
  });

  // Configurar sombras
  useEffect(() => {
    if (lightRef.current && castShadow) {
      lightRef.current.castShadow = true;
      if (lightRef.current.shadow) {
        lightRef.current.shadow.mapSize.width = 2048;
        lightRef.current.shadow.mapSize.height = 2048;
        lightRef.current.shadow.camera.near = 0.5;
        lightRef.current.shadow.camera.far = 500;
      }
    }
  }, [castShadow]);

  // Animación de la luz
  useFrame((state) => {
    if (lightRef.current && userData.animate) {
      const { animationType, speed = 1 } = userData.animate;
      
      switch (animationType) {
        case 'flicker':
          const flicker = Math.sin(state.clock.elapsedTime * speed * 10) * 0.1 + 0.9;
          lightRef.current.intensity = state.intensity * flicker;
          break;
        case 'pulse':
          const pulse = Math.sin(state.clock.elapsedTime * speed) * 0.3 + 0.7;
          lightRef.current.intensity = state.intensity * pulse;
          break;
        case 'colorCycle':
          const hue = (state.clock.elapsedTime * speed * 50) % 360;
          lightRef.current.color.setHSL(hue / 360, 1, 0.5);
          break;
      }
    }
  });

  // Renderizar según el tipo de luz
  switch (type) {
    case 'ambient':
      return (
        <ambientLight
          ref={lightRef}
          intensity={intensity}
          color={color}
          visible={visible}
          userData={userData}
          {...props}
        />
      );

    case 'directional':
      return (
        <directionalLight
          ref={lightRef}
          intensity={intensity}
          color={color}
          position={position}
          rotation={rotation}
          scale={scale}
          visible={visible}
          castShadow={castShadow}
          userData={userData}
          {...props}
        />
      );

    case 'point':
      return (
        <pointLight
          ref={lightRef}
          intensity={intensity}
          color={color}
          position={position}
          rotation={rotation}
          scale={scale}
          visible={visible}
          castShadow={castShadow}
          distance={userData.distance || 0}
          decay={userData.decay || 2}
          userData={userData}
          {...props}
        />
      );

    case 'spot':
      return (
        <spotLight
          ref={lightRef}
          intensity={intensity}
          color={color}
          position={position}
          rotation={rotation}
          scale={scale}
          visible={visible}
          castShadow={castShadow}
          angle={userData.angle || Math.PI / 3}
          penumbra={userData.penumbra || 0}
          distance={userData.distance || 0}
          decay={userData.decay || 2}
          userData={userData}
          {...props}
        />
      );

    case 'hemisphere':
      return (
        <hemisphereLight
          ref={lightRef}
          intensity={intensity}
          color={color}
          groundColor={userData.groundColor || '#444444'}
          position={position}
          rotation={rotation}
          scale={scale}
          visible={visible}
          userData={userData}
          {...props}
        />
      );

    default:
      return null;
  }
};

// ============================================================================
// 💡 COMPONENTES ESPECÍFICOS DE ILUMINACIÓN
// ============================================================================

/**
 * Luz ambiental para iluminación general
 */
export const AmbientLight: React.FC<Omit<LightingProps, 'type'>> = (props) => {
  return <Lighting type="ambient" {...props} />;
};

/**
 * Luz direccional (como el sol)
 */
export const DirectionalLight: React.FC<Omit<LightingProps, 'type'>> = (props) => {
  return <Lighting type="directional" {...props} />;
};

/**
 * Luz puntual (como una bombilla)
 */
export const PointLight: React.FC<Omit<LightingProps, 'type'>> = (props) => {
  return <Lighting type="point" {...props} />;
};

/**
 * Luz de foco (como una linterna)
 */
export const SpotLight: React.FC<Omit<LightingProps, 'type'>> = (props) => {
  return <Lighting type="spot" {...props} />;
};

/**
 * Luz hemisférica (cielo y suelo)
 */
export const HemisphereLight: React.FC<Omit<LightingProps, 'type'>> = (props) => {
  return <Lighting type="hemisphere" {...props} />;
};

// ============================================================================
// 🎨 COMPONENTES DE ILUMINACIÓN TEMÁTICA
// ============================================================================

/**
 * Iluminación de día
 */
export const DayLighting: React.FC = () => {
  return (
    <group>
      <HemisphereLight
        intensity={0.6}
        color="#87CEEB"
        groundColor="#8B4513"
        position={[0, 50, 0]}
      />
      <DirectionalLight
        intensity={1}
        color="#FFFFFF"
        position={[50, 50, 50]}
        castShadow
        userData={{
          shadow: {
            mapSize: { width: 2048, height: 2048 },
            camera: { near: 0.5, far: 500 }
          }
        }}
      />
    </group>
  );
};

/**
 * Iluminación de noche
 */
export const NightLighting: React.FC = () => {
  return (
    <group>
      <HemisphereLight
        intensity={0.1}
        color="#1a1a2e"
        groundColor="#16213e"
        position={[0, 50, 0]}
      />
      <PointLight
        intensity={0.8}
        color="#4a90e2"
        position={[0, 10, 0]}
        castShadow
        userData={{
          distance: 20,
          decay: 2
        }}
      />
    </group>
  );
};

/**
 * Iluminación de interior
 */
export const InteriorLighting: React.FC = () => {
  return (
    <group>
      <AmbientLight intensity={0.3} color="#ffffff" />
      <PointLight
        intensity={1}
        color="#ffd700"
        position={[0, 5, 0]}
        castShadow
        userData={{
          distance: 15,
          decay: 1.5
        }}
      />
    </group>
  );
};

/**
 * Iluminación dramática
 */
export const DramaticLighting: React.FC = () => {
  return (
    <group>
      <AmbientLight intensity={0.1} color="#000000" />
      <SpotLight
        intensity={2}
        color="#ff6b6b"
        position={[10, 10, 10]}
        castShadow
        userData={{
          angle: Math.PI / 6,
          penumbra: 0.1,
          distance: 30
        }}
      />
      <SpotLight
        intensity={1.5}
        color="#4ecdc4"
        position={[-10, 10, -10]}
        castShadow
        userData={{
          angle: Math.PI / 6,
          penumbra: 0.1,
          distance: 30
        }}
      />
    </group>
  );
};

// ============================================================================
// 🎮 COMPONENTES DE EFECTOS DE LUZ
// ============================================================================

/**
 * Luz parpadeante
 */
export const FlickeringLight: React.FC<Omit<LightingProps, 'type'>> = (props) => {
  return (
    <Lighting
      type="point"
      {...props}
      userData={{
        ...props.userData,
        animate: {
          type: 'flicker',
          speed: 1
        }
      }}
    />
  );
};

/**
 * Luz pulsante
 */
export const PulsingLight: React.FC<Omit<LightingProps, 'type'>> = (props) => {
  return (
    <Lighting
      type="point"
      {...props}
      userData={{
        ...props.userData,
        animate: {
          type: 'pulse',
          speed: 2
        }
      }}
    />
  );
};

/**
 * Luz con cambio de color
 */
export const ColorChangingLight: React.FC<Omit<LightingProps, 'type'>> = (props) => {
  return (
    <Lighting
      type="point"
      {...props}
      userData={{
        ...props.userData,
        animate: {
          type: 'colorCycle',
          speed: 1
        }
      }}
    />
  );
};

// ============================================================================
// 🎯 COMPONENTE DE CONTROL DE ILUMINACIÓN
// ============================================================================

/**
 * Controlador de iluminación para múltiples luces
 */
export const LightingController: React.FC<{
  lights: Array<{
    id: string;
    component: React.ReactNode;
    enabled: boolean;
  }>;
  onLightToggle?: (lightId: string, enabled: boolean) => void;
}> = ({
  lights,
  onLightToggle
}) => {
  const [enabledLights, setEnabledLights] = React.useState<Set<string>>(
    new Set(lights.filter(l => l.enabled).map(l => l.id))
  );

  const toggleLight = (lightId: string) => {
    const newEnabled = new Set(enabledLights);
    if (newEnabled.has(lightId)) {
      newEnabled.delete(lightId);
    } else {
      newEnabled.add(lightId);
    }
    setEnabledLights(newEnabled);
    onLightToggle?.(lightId, newEnabled.has(lightId));
  };

  return (
    <group>
      {lights.map(light => (
        <group key={light.id}>
          {enabledLights.has(light.id) && light.component}
        </group>
      ))}
      
      {/* UI de control (opcional) */}
      <Html position={[0, 10, 0]}>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white'
        }}>
          {lights.map(light => (
            <div key={light.id}>
              <label>
                <input
                  type="checkbox"
                  checked={enabledLights.has(light.id)}
                  onChange={() => toggleLight(light.id)}
                />
                {light.id}
              </label>
            </div>
          ))}
        </div>
      </Html>
    </group>
  );
};

// ============================================================================
// 📦 EXPORTACIONES
// ============================================================================

export default Lighting;
export {
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  HemisphereLight,
  DayLighting,
  NightLighting,
  InteriorLighting,
  DramaticLighting,
  FlickeringLight,
  PulsingLight,
  ColorChangingLight,
  LightingController
}; 