import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { World } from '../types/metaverso';

interface VisualEffectsProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  world: World;
}

// Sistema avanzado de partículas dinámicas
const DynamicParticleSystem: React.FC<{ world: World }> = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 100;
      pos[i + 1] = Math.random() * 50;
      pos[i + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Sistema avanzado de efectos atmosféricos
const AtmosphericEffects: React.FC<{ world: World }> = ({ world }) => {
  const fogRef = useRef<THREE.Fog>(null);

  useEffect(() => {
    if (fogRef.current) {
      // Configurar niebla según el clima
      switch (world.weather.type) {
        case 'fog':
          fogRef.current.near = 1;
          fogRef.current.far = 50;
          break;
        case 'rain':
          fogRef.current.near = 5;
          fogRef.current.far = 100;
          break;
        case 'storm':
          fogRef.current.near = 2;
          fogRef.current.far = 30;
          break;
        default:
          fogRef.current.near = 10;
          fogRef.current.far = 200;
      }
    }
  }, [world.weather.type]);

  return null;
};

// Sistema avanzado de efectos de luz
const LightEffects: React.FC<{ world: World }> = ({ world }) => {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      // Efectos de parpadeo para tormentas
      if (world.weather.type === 'storm') {
        lightRef.current.intensity = Math.random() * 0.5 + 0.1;
      } else {
        lightRef.current.intensity = 0.3;
      }
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 10, 0]}
      color="#ffffff"
      intensity={0.3}
      distance={50}
    />
  );
};

// Componente principal de efectos visuales
const VisualEffects: React.FC<VisualEffectsProps> = ({ world }) => {
  const effectsRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (effectsRef.current) {
      // Limpiar efectos anteriores
      effectsRef.current.clear();
    }
  }, [world]);

  return (
    <group ref={effectsRef}>
      <DynamicParticleSystem world={world} />
      <AtmosphericEffects world={world} />
      <LightEffects world={world} />
    </group>
  );
};

export default VisualEffects; 