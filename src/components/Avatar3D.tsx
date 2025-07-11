import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Sphere, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DProps {
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'concentrated' | 'curious';
  onAnimationComplete?: () => void;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({ 
  isSpeaking, 
  emotion, 
  onAnimationComplete 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Mesh>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  
  const [blinkState, setBlinkState] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(0);

  // Configuración del avatar lucIA (35 años, morena española, alta y delgada)
  const avatarConfig = {
    head: {
      radius: 0.8,
      segments: 32,
      skinColor: new THREE.Color(0xf5d0c5), // Piel clara española
      position: [0, 1.7, 0]
    },
    hair: {
      color: new THREE.Color(0x2c1810), // Moreno oscuro
      length: 1.2,
      volume: 0.9
    },
    eyes: {
      color: new THREE.Color(0x4a4a4a), // Marrón oscuro
      size: 0.15,
      spacing: 0.4
    },
    mouth: {
      color: new THREE.Color(0xd4a5a5), // Labios naturales
      size: 0.3
    }
  };

  // Animación de parpadeo
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(prev => !prev);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Animación de respiración
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const breathing = Math.sin(time * 0.5) * 0.02;
      groupRef.current.position.y = avatarConfig.head.position[1] + breathing;
      setBreathingPhase(breathing);
    }

    // Animación de boca durante el habla
    if (isSpeaking && mouthRef.current) {
      const speakCycle = Math.sin(state.clock.getElapsedTime() * 8) * 0.1;
      setMouthOpen(Math.max(0, speakCycle));
    } else {
      setMouthOpen(0);
    }
  });

  // Material de piel realista
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: avatarConfig.head.skinColor,
    roughness: 0.8,
    metalness: 0.1,
    normalScale: new THREE.Vector2(0.5, 0.5)
  });

  // Material de cabello
  const hairMaterial = new THREE.MeshStandardMaterial({
    color: avatarConfig.hair.color,
    roughness: 0.9,
    metalness: 0.0
  });

  // Material de ojos
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: avatarConfig.eyes.color,
    roughness: 0.2,
    metalness: 0.8
  });

  // Material de boca
  const mouthMaterial = new THREE.MeshStandardMaterial({
    color: avatarConfig.mouth.color,
    roughness: 0.7,
    metalness: 0.1
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Cabeza */}
      <Sphere
        ref={headRef}
        args={[avatarConfig.head.radius, avatarConfig.head.segments, avatarConfig.head.segments]}
        position={avatarConfig.head.position as [number, number, number]}
        material={skinMaterial}
      />

      {/* Cabello */}
      <group position={[0, 1.7, 0]}>
        {/* Cabello principal */}
        <Cylinder
          ref={hairRef}
          args={[0.9, 0.7, avatarConfig.hair.length, 16]}
          position={[0, -0.3, 0]}
          material={hairMaterial}
        />
        
        {/* Mechones laterales */}
        <Cylinder
          args={[0.3, 0.2, 0.8, 8]}
          position={[-0.6, -0.2, 0]}
          rotation={[0, 0, 0.3]}
          material={hairMaterial}
        />
        <Cylinder
          args={[0.3, 0.2, 0.8, 8]}
          position={[0.6, -0.2, 0]}
          rotation={[0, 0, -0.3]}
          material={hairMaterial}
        />
      </group>

      {/* Ojos */}
      <group ref={eyesRef} position={[0, 1.8, 0.6]}>
        {/* Ojo izquierdo */}
        <Sphere
          args={[avatarConfig.eyes.size, 16, 16]}
          position={[-avatarConfig.eyes.spacing/2, 0, 0]}
          material={eyeMaterial}
          scale={[1, blinkState ? 0.1 : 1, 1]}
        />
        
        {/* Ojo derecho */}
        <Sphere
          args={[avatarConfig.eyes.size, 16, 16]}
          position={[avatarConfig.eyes.spacing/2, 0, 0]}
          material={eyeMaterial}
          scale={[1, blinkState ? 0.1 : 1, 1]}
        />

        {/* Párpados */}
        <Box
          args={[0.2, 0.05, 0.1]}
          position={[-avatarConfig.eyes.spacing/2, 0, 0.05]}
          material={skinMaterial}
          visible={blinkState}
        />
        <Box
          args={[0.2, 0.05, 0.1]}
          position={[avatarConfig.eyes.spacing/2, 0, 0.05]}
          material={skinMaterial}
          visible={blinkState}
        />
      </group>

      {/* Boca */}
      <Box
        ref={mouthRef}
        args={[avatarConfig.mouth.size, 0.1 + mouthOpen, 0.05]}
        position={[0, 1.4, 0.7]}
        material={mouthMaterial}
      />

      {/* Nariz */}
      <Box
        args={[0.1, 0.3, 0.1]}
        position={[0, 1.6, 0.75]}
        material={skinMaterial}
      />

      {/* Cuerpo básico (sombra) */}
      <Cylinder
        args={[0.3, 0.2, 0.5, 8]}
        position={[0, 1.2, 0]}
        material={new THREE.MeshStandardMaterial({ 
          color: 0x2c1810, 
          transparent: true, 
          opacity: 0.3 
        })}
      />
    </group>
  );
}; 