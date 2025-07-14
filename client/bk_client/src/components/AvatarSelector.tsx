import React, { useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Tipos avanzados para el componente
interface AvatarConfig {
  id: string;
  name: string;
  model: string;
  texture: string;
  color: string;
  accessories: string[];
}

interface AvatarSelectorProps {
  onAvatarSelected: (config: AvatarConfig) => void;
}

// Componente de avatar 3D avanzado
const Avatar3D: React.FC<{
  config: AvatarConfig;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ isSelected, onSelect }) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Animación de rotación y hover
  useFrame((state: any) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      if (isHovered) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  const handlePointerOver = useCallback(() => {
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  const handleClick = useCallback(() => {
    onSelect();
  }, [onSelect]);

  // Material dinámico basado en estado
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isSelected ? 0x4ade80 : isHovered ? 0x3b82f6 : 0x6b7280,
      roughness: 0.3,
      metalness: 0.1,
      emissive: isSelected ? 0x22c55e : 0x000000,
      emissiveIntensity: isSelected ? 0.3 : 0
    });
  }, [isSelected, isHovered]);

  return (
    <mesh
      ref={meshRef}
      material={material}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[1, 32, 32]} />
    </mesh>
  );
};

// Componente principal del selector de avatares
const AvatarSelector: React.FC<AvatarSelectorProps> = ({ onAvatarSelected }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [customization, setCustomization] = useState({
    color: '#3b82f6',
    accessories: [] as string[]
  });

  // Configuraciones de avatares predefinidos
  const avatarConfigs = useMemo((): AvatarConfig[] => [
    {
      id: 'avatar-1',
      name: 'Explorador',
      model: 'explorer.glb',
      texture: 'explorer-texture.jpg',
      color: '#3b82f6',
      accessories: ['mochila', 'brújula']
    },
    {
      id: 'avatar-2',
      name: 'Comerciante',
      model: 'merchant.glb',
      texture: 'merchant-texture.jpg',
      color: '#f59e0b',
      accessories: ['bolsa', 'monedas']
    },
    {
      id: 'avatar-3',
      name: 'Aventurero',
      model: 'adventurer.glb',
      texture: 'adventurer-texture.jpg',
      color: '#10b981',
      accessories: ['espada', 'escudo']
    },
    {
      id: 'avatar-4',
      name: 'Mago',
      model: 'wizard.glb',
      texture: 'wizard-texture.jpg',
      color: '#8b5cf6',
      accessories: ['varita', 'libro']
    }
  ], []);

  // Accesorios disponibles
  const availableAccessories = useMemo(() => [
    'mochila', 'brújula', 'bolsa', 'monedas', 'espada', 'escudo', 'varita', 'libro',
    'antorcha', 'mapa', 'poción', 'gema', 'corona', 'capa', 'botas', 'guantes'
  ], []);

  // Colores disponibles
  const availableColors = useMemo(() => [
    '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899',
    '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#f43f5e'
  ], []);

  // Manejo de selección de avatar
  const handleAvatarSelect = useCallback((avatarId: string) => {
    setSelectedAvatar(avatarId);
  }, []);

  // Manejo de cambio de color
  const handleColorChange = useCallback((color: string) => {
    setCustomization(prev => ({ ...prev, color }));
  }, []);

  // Manejo de accesorios
  const handleAccessoryToggle = useCallback((accessory: string) => {
    setCustomization(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessory)
        ? prev.accessories.filter(a => a !== accessory)
        : [...prev.accessories, accessory]
    }));
  }, []);

  // Confirmación de avatar
  const handleConfirmAvatar = useCallback(() => {
    if (!selectedAvatar) return;

    const baseConfig = avatarConfigs.find(avatar => avatar.id === selectedAvatar);
    if (!baseConfig) return;

    const finalConfig: AvatarConfig = {
      ...baseConfig,
      color: customization.color,
      accessories: customization.accessories
    };

    onAvatarSelected(finalConfig);
  }, [selectedAvatar, avatarConfigs, customization, onAvatarSelected]);

  // Avatar seleccionado actual
  const currentAvatar = useMemo(() => 
    avatarConfigs.find(avatar => avatar.id === selectedAvatar),
    [avatarConfigs, selectedAvatar]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Selecciona tu Avatar
          </h1>
          <p className="text-gray-300 text-lg">
            Personaliza tu personaje para el Metaverso
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vista 3D del avatar */}
          <div className="lg:col-span-2">
            <div className="bg-black bg-opacity-50 rounded-lg p-6 h-96">
              <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{ antialias: true }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                
                {currentAvatar && (
                  <Avatar3D
                    config={currentAvatar}
                    isSelected={true}
                    onSelect={() => {}}
                  />
                )}
                
                <OrbitControls enableZoom={true} enablePan={false} />
                <Environment preset="sunset" />
              </Canvas>
            </div>
          </div>

          {/* Panel de personalización */}
          <div className="space-y-6">
            {/* Selección de avatar base */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Tipo de Avatar
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {avatarConfigs.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar.id)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedAvatar === avatar.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {avatar.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de color */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Color
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      customization.color === color
                        ? 'border-white scale-110'
                        : 'border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Selector de accesorios */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Accesorios
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availableAccessories.map((accessory) => (
                  <button
                    key={accessory}
                    onClick={() => handleAccessoryToggle(accessory)}
                    className={`p-2 rounded text-sm transition-colors ${
                      customization.accessories.includes(accessory)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {accessory}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón de confirmación */}
            <button
              onClick={handleConfirmAvatar}
              disabled={!selectedAvatar}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                selectedAvatar
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Confirmar Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector; 