

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { useMetaverso } from '@/contexts/MetaversoContext';
import { Position, Avatar } from '@/types/metaverso';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorFallback } from './ui/ErrorFallback';

// --- Terreno procedural ---
const ProceduralTerrain: React.FC<{ size?: number; resolution?: number }> = ({ size = 100, resolution = 128 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      const vertices = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i] / size;
        const z = vertices[i + 2] / size;
        vertices[i + 1] = Math.sin(x * 10) * Math.cos(z * 10) * 2;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  }, [size, resolution]);
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size, resolution, resolution]} />
      <meshStandardMaterial color="#4a7c59" roughness={0.8} metalness={0.1} />
    </mesh>
  );
};

// --- Avatar 3D simple ---
const Avatar3D: React.FC<{ avatar: Avatar; position: Position; onSelect?: (avatar: Avatar) => void }> = ({ avatar, position, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = position.y + Math.sin(Date.now() * 0.001) * 0.1;
    }
  });
  return (
    <mesh ref={meshRef} position={[position.x, position.y, position.z]} onClick={() => onSelect?.(avatar)}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color={avatar.customization?.skinColor || '#ffdbac'} />
    </mesh>
  );
};

// --- UI de controles y overlays ---
const WorldControlsOverlay: React.FC<{
  onTeleport: (pos: Position) => void;
  onToggleInventory: () => void;
  onToggleChat: () => void;
  showInventory: boolean;
  showChat: boolean;
}> = ({ onTeleport, onToggleInventory, onToggleChat, showInventory, showChat }) => (
  <div className="absolute top-4 left-4 bg-black bg-opacity-60 p-4 rounded-lg text-white z-20">
    <div className="mb-2 font-bold">Controles</div>
    <button className="mr-2 bg-blue-600 px-2 py-1 rounded" onClick={() => onTeleport({ x: 0, y: 0, z: 0 })}>Spawn</button>
    <button className="mr-2 bg-green-600 px-2 py-1 rounded" onClick={onToggleInventory}>{showInventory ? 'Cerrar Inventario' : 'Inventario'}</button>
    <button className="bg-purple-600 px-2 py-1 rounded" onClick={onToggleChat}>{showChat ? 'Cerrar Chat' : 'Chat'}</button>
  </div>
);

const PlayerStatsOverlay: React.FC<{ avatar: Avatar }> = ({ avatar }) => (
  <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 p-4 rounded-lg text-white z-20">
    <div className="font-bold mb-2">Estadísticas</div>
    <div>Nivel: {avatar.level}</div>
    <div>Salud: {avatar.health}/100</div>
    <div>Energía: {avatar.energy}/100</div>
  </div>
);

// --- Componente principal ---
const MetaversoWorld: React.FC = () => {
  const { state, dispatch } = useMetaverso();
  const [showInventory, setShowInventory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [cameraPos] = useState<Position>({ x: 0, y: 10, z: 10 });
  const [userPos, setUserPos] = useState<Position>({ x: 0, y: 0, z: 0 });

  // Teletransporte rápido
  const handleTeleport = useCallback((pos: Position) => {
    setUserPos(pos);
    if (state.userAvatar) {
      dispatch({ type: 'UPDATE_AVATAR', payload: { ...state.userAvatar, position: pos } });
    }
  }, [dispatch, state.userAvatar]);

  // Teclado: movimiento y UI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newPos = { ...userPos };
      switch (e.key.toLowerCase()) {
        case 'w': newPos.z -= 1; break;
        case 's': newPos.z += 1; break;
        case 'a': newPos.x -= 1; break;
        case 'd': newPos.x += 1; break;
        case 'i': setShowInventory(v => !v); break;
        case 'c': setShowChat(v => !v); break;
        default: break;
      }
      setUserPos(newPos);
      if (state.userAvatar) {
        dispatch({ type: 'UPDATE_AVATAR', payload: { ...state.userAvatar, position: newPos } });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userPos, state.userAvatar, dispatch]);

  // Carga y errores
  if (!state.currentWorld) return <LoadingSpinner />;
  if (state.error) return <ErrorFallback error={new Error(state.error)} resetErrorBoundary={() => window.location.reload()} />;

  return (
    <div className="relative w-full h-full">
      {/* Canvas 3D */}
      <Canvas shadows camera={{ position: [cameraPos.x, cameraPos.y, cameraPos.z], fov: 75 }}>
        {/* Iluminación avanzada */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        {/* Cielo y ambiente */}
        <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0.5} azimuth={0.25} />
        <Cloud opacity={0.5} speed={0.4} segments={20} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        {/* Terreno y avatar */}
        <ProceduralTerrain size={100} resolution={128} />
        {state.userAvatar && <Avatar3D avatar={state.userAvatar} position={userPos} />}
        {/* Controles de cámara */}
        <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI / 2} minDistance={2} maxDistance={50} />
      </Canvas>
      {/* Overlays y UI contextual */}
      <WorldControlsOverlay
        onTeleport={handleTeleport}
        onToggleInventory={() => setShowInventory(v => !v)}
        onToggleChat={() => setShowChat(v => !v)}
        showInventory={showInventory}
        showChat={showChat}
      />
      {state.userAvatar && <PlayerStatsOverlay avatar={state.userAvatar} />}
      {/* Inventario y chat (placeholders avanzados) */}
      {showInventory && <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 p-6 rounded-lg shadow-lg z-30">INVENTARIO AVANZADO</div>}
      {showChat && <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 p-6 rounded-lg shadow-lg z-30">CHAT AVANZADO</div>}
    </div>
  );
};

export default MetaversoWorld;

import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sky, Stars, Environment } from '@react-three/drei'
import { useMetaverso } from '@/contexts/MetaversoContext'
import { useWeb3 } from '@/hooks/useWeb3'
import ChatSystem from './chat/ChatSystem'
import { InventorySystem } from './inventory/InventorySystem'
import { Avatar3D } from './AvatarSelection'
import AvatarSidebar from './AvatarSidebar'
import MovementControls from './MovementControls'
import * as THREE from 'three'

// --- Terreno procedural ---
const ProceduralTerrain: React.FC<{ size?: number; resolution?: number }> = ({ size = 100, resolution = 128 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      const vertices = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i] / size;
        const z = vertices[i + 2] / size;
        vertices[i + 1] = Math.sin(x * 10) * Math.cos(z * 10) * 2;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  }, [size, resolution]);
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size, resolution, resolution]} />
      <meshStandardMaterial color="#4a7c59" roughness={0.8} metalness={0.1} />
    </mesh>
  );
};

// --- Avatar 3D simple ---
const Avatar3D: React.FC<{ avatar: Avatar; position: Position; onSelect?: (avatar: Avatar) => void }> = ({ avatar, position, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = position.y + Math.sin(Date.now() * 0.001) * 0.1;
    }
  });
  return (
    <mesh ref={meshRef} position={[position.x, position.y, position.z]} onClick={() => onSelect?.(avatar)}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color={avatar.customization?.skinColor || '#ffdbac'} />
    </mesh>
  );
};

// --- UI de controles y overlays ---
const WorldControlsOverlay: React.FC<{
  onTeleport: (pos: Position) => void;
  onToggleInventory: () => void;
  onToggleChat: () => void;
  showInventory: boolean;
  showChat: boolean;
}> = ({ onTeleport, onToggleInventory, onToggleChat, showInventory, showChat }) => (
  <div className="absolute top-4 left-4 bg-black bg-opacity-60 p-4 rounded-lg text-white z-20">
    <div className="mb-2 font-bold">Controles</div>
    <button className="mr-2 bg-blue-600 px-2 py-1 rounded" onClick={() => onTeleport({ x: 0, y: 0, z: 0 })}>Spawn</button>
    <button className="mr-2 bg-green-600 px-2 py-1 rounded" onClick={onToggleInventory}>{showInventory ? 'Cerrar Inventario' : 'Inventario'}</button>
    <button className="bg-purple-600 px-2 py-1 rounded" onClick={onToggleChat}>{showChat ? 'Cerrar Chat' : 'Chat'}</button>
  </div>
);

const PlayerStatsOverlay: React.FC<{ avatar: Avatar }> = ({ avatar }) => (
  <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 p-4 rounded-lg text-white z-20">
    <div className="font-bold mb-2">Estadísticas</div>
    <div>Nivel: {avatar.level}</div>
    <div>Salud: {avatar.health}/100</div>
    <div>Energía: {avatar.energy}/100</div>
  </div>
);

// --- Componente principal ---
const MetaversoWorld: React.FC = () => {
  const { state, dispatch } = useMetaverso();
  const [showInventory, setShowInventory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [cameraPos] = useState<Position>({ x: 0, y: 10, z: 10 });
  const [userPos, setUserPos] = useState<Position>({ x: 0, y: 0, z: 0 });

  // Teletransporte rápido
  const handleTeleport = useCallback((pos: Position) => {
    setUserPos(pos);
    if (state.userAvatar) {
      dispatch({ type: 'UPDATE_AVATAR', payload: { ...state.userAvatar, position: pos } });
    }
  }, [dispatch, state.userAvatar]);

  // Teclado: movimiento y UI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newPos = { ...userPos };
      switch (e.key.toLowerCase()) {
        case 'w': newPos.z -= 1; break;
        case 's': newPos.z += 1; break;
        case 'a': newPos.x -= 1; break;
        case 'd': newPos.x += 1; break;
        case 'i': setShowInventory(v => !v); break;
        case 'c': setShowChat(v => !v); break;
        default: break;
      }
      setUserPos(newPos);
      if (state.userAvatar) {
        dispatch({ type: 'UPDATE_AVATAR', payload: { ...state.userAvatar, position: newPos } });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userPos, state.userAvatar, dispatch]);

  // Carga y errores
  if (!state.currentWorld) return <LoadingSpinner />;
  if (state.error) return <ErrorFallback error={new Error(state.error)} resetErrorBoundary={() => window.location.reload()} />;

  return (
    <div className="relative w-full h-full">
      {/* Canvas 3D */}
      <Canvas shadows camera={{ position: [cameraPos.x, cameraPos.y, cameraPos.z], fov: 75 }}>
        {/* Iluminación avanzada */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        {/* Cielo y ambiente */}
        <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0.5} azimuth={0.25} />
        <Cloud opacity={0.5} speed={0.4} segments={20} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        {/* Terreno y avatar */}
        <ProceduralTerrain size={100} resolution={128} />
        {state.userAvatar && <Avatar3D avatar={state.userAvatar} position={userPos} />}
        {/* Controles de cámara */}
        <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI / 2} minDistance={2} maxDistance={50} />
      </Canvas>
      {/* Overlays y UI contextual */}
      <WorldControlsOverlay
        onTeleport={handleTeleport}
        onToggleInventory={() => setShowInventory(v => !v)}
        onToggleChat={() => setShowChat(v => !v)}
        showInventory={showInventory}
        showChat={showChat}
      />
      {state.userAvatar && <PlayerStatsOverlay avatar={state.userAvatar} />}
      {/* Inventario y chat (placeholders avanzados) */}
      {showInventory && <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 p-6 rounded-lg shadow-lg z-30">INVENTARIO AVANZADO</div>}
      {showChat && <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 p-6 rounded-lg shadow-lg z-30">CHAT AVANZADO</div>}
    </div>
  );
};

export default MetaversoWorld;

export default MetaversoWorld
