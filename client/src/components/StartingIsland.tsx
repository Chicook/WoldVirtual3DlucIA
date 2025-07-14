import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';

// Componente para el mar alrededor de la isla
const Ocean: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (waterRef.current) {
      // Animación simple del agua
      waterRef.current.rotation.z += 0.001;
    }
  });

  return (
    <mesh
      ref={waterRef}
      position={[0, -0.5, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#006994" transparent opacity={0.8} />
    </mesh>
  );
};

// Componente para la isla de inicio
const Island: React.FC<{
  onClick: () => void;
  isSelected: boolean;
}> = ({ onClick, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current && isSelected) {
      // Efecto de rotación cuando está seleccionada
      meshRef.current.rotation.y += 0.01;
    }
  });

  const handleClick = () => {
    console.log("Entrando a la Isla de Inicio");
    onClick();
  };

  const handlePointerOver = () => {
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group>
      {/* Base de la isla (cubo cuadrado) */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[8, 1, 8]} />
        <meshStandardMaterial 
          color={isSelected ? "#4ade80" : isHovered ? "#22c55e" : "#8B4513"} 
        />
      </mesh>
      
      {/* Vegetación en la parte superior */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[6, 1, 6]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      
      {/* Árboles decorativos */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 2, 1, Math.sin(i * Math.PI / 2) * 2]}>
          <sphereGeometry args={[0.5, 8, 6]} />
          <meshStandardMaterial color="#006400" />
        </mesh>
      ))}
      
      {/* Efecto de selección */}
      {isSelected && (
        <mesh position={[0, 1.5, 0]}>
          <ringGeometry args={[4.5, 5, 8]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      )}
    </group>
  );
};

// Componente para el cielo
const SkyBox: React.FC = () => {
  return (
    <Sky
      distance={450000}
      sunPosition={[0, 1, 0]}
      inclination={0}
      azimuth={0.25}
      rayleigh={0.5}
      turbidity={10}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
    />
  );
};

// Escena principal de la isla
const StartingIslandScene: React.FC<{
  onIslandClick: () => void;
  isSelected: boolean;
}> = ({ onIslandClick, isSelected }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <SkyBox />
      <Ocean />
      <Island onClick={onIslandClick} isSelected={isSelected} />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={15}
        maxDistance={50}
        target={[0, 0, 0]}
      />
    </>
  );
};

// Componente principal de la isla de inicio
const StartingIsland: React.FC = () => {
  const [isSelected, setIsSelected] = useState(false);

  const handleIslandClick = () => {
    setIsSelected(true);
    
    // Resetear la selección después de 2 segundos
    setTimeout(() => {
      setIsSelected(false);
    }, 2000);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-900 to-blue-700">
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Isla de Inicio</h2>
        <p className="text-sm">Haz clic en la isla para interactuar</p>
        {isSelected && (
          <p className="text-green-400 text-sm mt-2">¡Isla seleccionada!</p>
        )}
      </div>
      
      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <StartingIslandScene
          onIslandClick={handleIslandClick}
          isSelected={isSelected}
        />
      </Canvas>
    </div>
  );
};

export default StartingIsland; 