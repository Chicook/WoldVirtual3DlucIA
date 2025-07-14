import React, { useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Avatar, AvatarCustomization } from '@/types/metaverso';
import { toast } from 'react-hot-toast';

interface AvatarCreatorProps {
  onAvatarCreated: (avatar: Avatar) => void;
  initialAvatar?: Partial<Avatar>;
}

// Componente avanzado de previsualización de avatar
const AvatarPreview: React.FC<{ avatar: Avatar }> = ({ avatar }) => {
  const { scene } = useGLTF(avatar.model);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child: any) => {
      if (child.isMesh) {
        // Aplicar personalización avanzada
        if (child.material) {
          if (avatar.customization.skinColor) {
            child.material.color.setHex(parseInt(avatar.customization.skinColor.replace('#', ''), 16));
          }
        }
      }
    });
    return clone;
  }, [scene, avatar.customization]);

  return <primitive object={clonedScene} />;
};

// Sistema avanzado de personalización
const CustomizationPanel: React.FC<{
  customization: AvatarCustomization;
  onCustomizationChange: (customization: AvatarCustomization) => void;
}> = ({ customization, onCustomizationChange }) => {
  const skinColors = [
    '#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524',
    '#ffb6c1', '#ffa07a', '#ff7f50', '#ff6347', '#ff4500'
  ];

  const hairColors = [
    '#8b4513', '#654321', '#3e2723', '#1b1b1b', '#ffffff',
    '#ffd700', '#ff69b4', '#ff1493', '#00ff00', '#4169e1'
  ];

  const hairStyles = [
    'short', 'long', 'curly', 'straight', 'wavy', 'spiky', 'bald'
  ];

  const eyeColors = [
    '#000000', '#8b4513', '#4169e1', '#32cd32', '#ff69b4',
    '#ffd700', '#ff6347', '#9370db', '#20b2aa', '#f0e68c'
  ];

  const updateCustomization = useCallback((key: keyof AvatarCustomization, value: any) => {
    onCustomizationChange({
      ...customization,
      [key]: value
    });
  }, [customization, onCustomizationChange]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Personalización Avanzada</h3>
      
      {/* Color de piel */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color de Piel
        </label>
        <div className="grid grid-cols-5 gap-2">
          {skinColors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 ${
                customization.skinColor === color ? 'border-white' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => updateCustomization('skinColor', color)}
            />
          ))}
        </div>
      </div>

      {/* Estilo de pelo */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Estilo de Pelo
        </label>
        <select
          value={customization.hairStyle}
          onChange={(e) => updateCustomization('hairStyle', e.target.value)}
          className="w-full bg-gray-700 text-white rounded px-3 py-2"
        >
          {hairStyles.map((style) => (
            <option key={style} value={style}>
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Color de pelo */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color de Pelo
        </label>
        <div className="grid grid-cols-5 gap-2">
          {hairColors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 ${
                customization.hairColor === color ? 'border-white' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => updateCustomization('hairColor', color)}
            />
          ))}
        </div>
      </div>

      {/* Color de ojos */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color de Ojos
        </label>
        <div className="grid grid-cols-5 gap-2">
          {eyeColors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 ${
                customization.eyeColor === color ? 'border-white' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => updateCustomization('eyeColor', color)}
            />
          ))}
        </div>
      </div>

      {/* Características faciales */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Características Faciales
        </label>
        <div className="space-y-2">
          {['bigote', 'barba', 'cicatriz', 'lunar', 'tatuaje'].map((feature) => (
            <label key={feature} className="flex items-center">
              <input
                type="checkbox"
                checked={customization.facialFeatures.includes(feature)}
                onChange={(e) => {
                  const newFeatures = e.target.checked
                    ? [...customization.facialFeatures, feature]
                    : customization.facialFeatures.filter(f => f !== feature);
                  updateCustomization('facialFeatures', newFeatures);
                }}
                className="mr-2"
              />
              <span className="text-gray-300 capitalize">{feature}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Accesorios */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Accesorios
        </label>
        <div className="space-y-2">
          {['gafas', 'sombrero', 'collar', 'piercing', 'máscara'].map((accessory) => (
            <label key={accessory} className="flex items-center">
              <input
                type="checkbox"
                checked={customization.accessories.includes(accessory)}
                onChange={(e) => {
                  const newAccessories = e.target.checked
                    ? [...customization.accessories, accessory]
                    : customization.accessories.filter(a => a !== accessory);
                  updateCustomization('accessories', newAccessories);
                }}
                className="mr-2"
              />
              <span className="text-gray-300 capitalize">{accessory}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente principal avanzado
export const AvatarCreator: React.FC<AvatarCreatorProps> = ({ 
  onAvatarCreated, 
  initialAvatar 
}) => {
  const [customization, setCustomization] = useState<AvatarCustomization>(
    initialAvatar?.customization || {
      skinColor: '#ffdbac',
      hairStyle: 'short',
      hairColor: '#8b4513',
      eyeColor: '#000000',
      facialFeatures: [],
      tattoos: [],
      scars: [],
      accessories: []
    }
  );

  const [avatarName, setAvatarName] = useState(initialAvatar?.name || '');
  const [selectedModel, setSelectedModel] = useState(initialAvatar?.model || 'default-avatar.glb');

  const availableModels = [
    { id: 'default-avatar.glb', name: 'Humano Básico' },
    { id: 'fantasy-avatar.glb', name: 'Fantasy' },
    { id: 'robot-avatar.glb', name: 'Robot' },
    { id: 'animal-avatar.glb', name: 'Animal' },
    { id: 'alien-avatar.glb', name: 'Alien' }
  ];

  const handleCreateAvatar = useCallback(() => {
    if (!avatarName.trim()) {
      toast.error('Por favor ingresa un nombre para tu avatar');
      return;
    }

    const newAvatar: Avatar = {
      id: `avatar-${Date.now()}`,
      name: avatarName,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      model: selectedModel,
      texture: 'default-texture.jpg',
      animations: ['idle', 'walk', 'run', 'jump', 'dance'],
      currentAnimation: 'idle',
      health: 100,
      energy: 100,
      level: 1,
      experience: 0,
      skills: [],
      equipment: {},
      customization: customization
    };

    onAvatarCreated(newAvatar);
  }, [avatarName, selectedModel, customization, onAvatarCreated]);

  const previewAvatar: Avatar = useMemo(() => ({
    id: 'preview',
    name: avatarName || 'Preview',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    model: selectedModel,
    texture: 'default-texture.jpg',
    animations: [],
    currentAnimation: 'idle',
    health: 100,
    energy: 100,
    level: 1,
    experience: 0,
    skills: [],
    equipment: {},
    customization: customization
  }), [avatarName, selectedModel, customization]);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Panel de previsualización */}
      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 1.6, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
          <AvatarPreview avatar={previewAvatar} />
          <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5}
            minDistance={2}
            maxDistance={5}
          />
          <Environment preset="studio" />
        </Canvas>
        
        {/* Controles de cámara */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 p-2 rounded">
          <p className="text-white text-sm">Usa el ratón para rotar la vista</p>
        </div>
      </div>

      {/* Panel de configuración */}
      <div className="w-96 bg-gray-800 overflow-y-auto">
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-white">Creador de Avatar</h2>
          
          {/* Nombre del avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Avatar
            </label>
            <input
              type="text"
              value={avatarName}
              onChange={(e) => setAvatarName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              placeholder="Ingresa el nombre de tu avatar"
              maxLength={20}
            />
          </div>

          {/* Selección de modelo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Avatar
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Panel de personalización */}
          <CustomizationPanel
            customization={customization}
            onCustomizationChange={setCustomization}
          />

          {/* Botón de creación */}
          <button
            onClick={handleCreateAvatar}
            disabled={!avatarName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            Crear Avatar
          </button>

          {/* Información adicional */}
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="text-white font-semibold mb-2">Información</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Tu avatar se guardará automáticamente</li>
              <li>• Puedes personalizarlo más tarde</li>
              <li>• Los cambios son permanentes</li>
              <li>• Compatible con todos los mundos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCreator; 