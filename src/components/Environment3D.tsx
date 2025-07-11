import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface Environment3DProps {
  timeOfDay: 'day' | 'night' | 'digital';
}

export const Environment3D: React.FC<Environment3DProps> = ({ timeOfDay }) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const lightsRef = useRef<THREE.Group>(null);

  // Configuración del entorno digital
  const environmentConfig = {
    floor: {
      size: 20,
      color: new THREE.Color(0x1a1a2e), // Azul oscuro digital
      gridColor: new THREE.Color(0x16213e)
    },
    walls: {
      height: 8,
      color: new THREE.Color(0x0f3460), // Azul medio
      transparency: 0.3
    },
    particles: {
      count: 1000,
      color: new THREE.Color(0x00d4ff), // Azul brillante
      size: 0.02
    },
    lighting: {
      ambient: new THREE.Color(0x404040),
      directional: new THREE.Color(0xffffff),
      point: new THREE.Color(0x00d4ff)
    }
  };

  // Animación de partículas digitales
  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.getElapsedTime();
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + i) * 0.001; // Movimiento vertical
        positions[i] += Math.cos(time + i) * 0.001; // Movimiento horizontal
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animación de luces
    if (lightsRef.current) {
      const time = state.clock.getElapsedTime();
      lightsRef.current.rotation.y = time * 0.1;
    }
  });

  // Crear geometría de partículas
  const createParticles = () => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(environmentConfig.particles.count * 3);
    const colors = new Float32Array(environmentConfig.particles.count * 3);

    for (let i = 0; i < environmentConfig.particles.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40; // X
      positions[i * 3 + 1] = Math.random() * 10; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // Z

      colors[i * 3] = environmentConfig.particles.color.r;
      colors[i * 3 + 1] = environmentConfig.particles.color.g;
      colors[i * 3 + 2] = environmentConfig.particles.color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geometry;
  };

  // Material de partículas
  const particleMaterial = new THREE.PointsMaterial({
    size: environmentConfig.particles.size,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  // Material del suelo con grid
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: environmentConfig.floor.color,
    roughness: 0.8,
    metalness: 0.2
  });

  // Material de paredes transparentes
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: environmentConfig.walls.color,
    transparent: true,
    opacity: environmentConfig.walls.transparency,
    roughness: 0.5,
    metalness: 0.3
  });

  return (
    <group ref={groupRef}>
      {/* Suelo digital con grid */}
      <Plane
        args={[environmentConfig.floor.size, environmentConfig.floor.size]}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={floorMaterial}
      />

      {/* Grid digital en el suelo */}
      <gridHelper
        args={[environmentConfig.floor.size, 20, environmentConfig.gridColor, environmentConfig.gridColor]}
        position={[0, 0.01, 0]}
      />

      {/* Paredes transparentes */}
      <Box
        args={[environmentConfig.floor.size, environmentConfig.walls.height, 0.1]}
        position={[0, environmentConfig.walls.height / 2, -environmentConfig.floor.size / 2]}
        material={wallMaterial}
      />
      <Box
        args={[environmentConfig.floor.size, environmentConfig.walls.height, 0.1]}
        position={[0, environmentConfig.walls.height / 2, environmentConfig.floor.size / 2]}
        material={wallMaterial}
      />
      <Box
        args={[0.1, environmentConfig.walls.height, environmentConfig.floor.size]}
        position={[-environmentConfig.floor.size / 2, environmentConfig.walls.height / 2, 0]}
        material={wallMaterial}
      />
      <Box
        args={[0.1, environmentConfig.walls.height, environmentConfig.floor.size]}
        position={[environmentConfig.floor.size / 2, environmentConfig.walls.height / 2, 0]}
        material={wallMaterial}
      />

      {/* Partículas digitales flotantes */}
      <points ref={particlesRef} geometry={createParticles()} material={particleMaterial} />

      {/* Elementos decorativos digitales */}
      <group position={[5, 2, 5]}>
        {/* Holograma flotante */}
        <Cylinder
          args={[0.5, 0.5, 2, 8]}
          material={new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.3,
            wireframe: true
          })}
        />
      </group>

      <group position={[-5, 3, -5]}>
        {/* Esfera de datos */}
        <Sphere
          args={[0.8, 16, 16]}
          material={new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.4,
            wireframe: true
          })}
        />
      </group>

      {/* Luces del entorno */}
      <group ref={lightsRef}>
        {/* Luz ambiental */}
        <ambientLight
          intensity={0.3}
          color={environmentConfig.lighting.ambient}
        />

        {/* Luz direccional principal */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          color={environmentConfig.lighting.directional}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Luces puntuales digitales */}
        <pointLight
          position={[5, 5, 5]}
          intensity={0.5}
          color={environmentConfig.lighting.point}
          distance={20}
        />
        <pointLight
          position={[-5, 5, -5]}
          intensity={0.5}
          color={environmentConfig.lighting.point}
          distance={20}
        />
        <pointLight
          position={[0, 8, 0]}
          intensity={0.3}
          color={environmentConfig.lighting.point}
          distance={15}
        />
      </group>

      {/* Efectos de neblina digital */}
      <fog attach="fog" args={[environmentConfig.floor.color, 5, 30]} />
    </group>
  );
}; 