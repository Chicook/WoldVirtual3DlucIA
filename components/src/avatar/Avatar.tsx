import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { AvatarProps, ClothingItem, AnimationConfig } from '../types';

// ============================================================================
// 👤 COMPONENTE AVATAR - Sistema de Avatares
// ============================================================================

interface AvatarState {
  isLoaded: boolean;
  currentAnimation: string | null;
  isAnimating: boolean;
  clothing: Map<string, ClothingItem>;
  expressions: Map<string, number>;
}

/**
 * Componente principal de avatar para el metaverso
 * Maneja la personalización, animaciones y expresiones
 */
export const Avatar: React.FC<AvatarProps> = ({
  userId,
  model = '/models/avatar/default.glb',
  skin,
  clothing = [],
  animations = [],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  visible = true,
  userData = {},
  onAnimationComplete,
  ...props
}) => {
  const avatarRef = useRef<THREE.Group>(null);
  const [state, setState] = useState<AvatarState>({
    isLoaded: false,
    currentAnimation: null,
    isAnimating: false,
    clothing: new Map(),
    expressions: new Map()
  });

  // Cargar modelo GLTF
  const { scene, animations: modelAnimations } = useGLTF(model);
  const { actions } = useAnimations(modelAnimations, avatarRef);

  // Configurar avatar
  useEffect(() => {
    if (scene && avatarRef.current) {
      // Clonar la escena para evitar conflictos
      const avatarScene = scene.clone();
      avatarRef.current.add(avatarScene);

      // Aplicar piel si se especifica
      if (skin) {
        applySkin(avatarScene, skin);
      }

      // Aplicar ropa
      clothing.forEach(item => {
        applyClothing(avatarScene, item);
      });

      setState(prev => ({ ...prev, isLoaded: true }));
    }
  }, [scene, skin, clothing]);

  // Manejar animaciones
  useEffect(() => {
    if (actions && animations.length > 0) {
      // Configurar animaciones disponibles
      animations.forEach(anim => {
        if (actions[anim.name]) {
          const action = actions[anim.name];
          action.setLoop(anim.loop ? THREE.LoopRepeat : THREE.LoopOnce);
          action.clampWhenFinished = true;
        }
      });
    }
  }, [actions, animations]);

  // Animación del avatar
  useFrame((state, delta) => {
    if (avatarRef.current && userData.animate) {
      const { animationType, speed = 1 } = userData.animate;
      
      switch (animationType) {
        case 'idle':
          // Animación de respiración sutil
          const breath = Math.sin(state.clock.elapsedTime * speed) * 0.02;
          avatarRef.current.scale.y = 1 + breath;
          break;
          
        case 'walk':
          // Animación de caminar
          const walkCycle = Math.sin(state.clock.elapsedTime * speed * 2) * 0.1;
          avatarRef.current.position.y = Math.abs(walkCycle);
          break;
          
        case 'dance':
          // Animación de baile
          const danceRotation = Math.sin(state.clock.elapsedTime * speed) * 0.1;
          avatarRef.current.rotation.y += danceRotation;
          break;
      }
    }
  });

  // Funciones de control del avatar
  const playAnimation = (animationName: string) => {
    if (actions[animationName]) {
      // Detener animación actual
      if (state.currentAnimation && actions[state.currentAnimation]) {
        actions[state.currentAnimation].stop();
      }

      // Reproducir nueva animación
      const action = actions[animationName];
      action.reset().play();
      
      setState(prev => ({ 
        ...prev, 
        currentAnimation: animationName,
        isAnimating: true 
      }));

      // Configurar callback de finalización
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      
      const onFinished = () => {
        setState(prev => ({ 
          ...prev, 
          isAnimating: false 
        }));
        onAnimationComplete?.(animationName);
        action.removeEventListener('finished', onFinished);
      };
      
      action.addEventListener('finished', onFinished);
    }
  };

  const stopAnimation = () => {
    if (state.currentAnimation && actions[state.currentAnimation]) {
      actions[state.currentAnimation].stop();
      setState(prev => ({ 
        ...prev, 
        currentAnimation: null,
        isAnimating: false 
      }));
    }
  };

  const updateClothing = (newClothing: ClothingItem[]) => {
    if (avatarRef.current) {
      // Remover ropa actual
      state.clothing.forEach(item => {
        removeClothing(avatarRef.current!, item);
      });

      // Aplicar nueva ropa
      newClothing.forEach(item => {
        applyClothing(avatarRef.current!, item);
      });

      setState(prev => ({ 
        ...prev, 
        clothing: new Map(newClothing.map(item => [item.id, item]))
      }));
    }
  };

  const setExpression = (expression: string, intensity: number = 1) => {
    if (avatarRef.current) {
      // Aplicar expresión facial
      applyExpression(avatarRef.current, expression, intensity);
      
      setState(prev => ({
        ...prev,
        expressions: new Map(prev.expressions.set(expression, intensity))
      }));
    }
  };

  return (
    <group
      ref={avatarRef}
      position={position}
      rotation={rotation}
      scale={scale}
      visible={visible}
      userData={{
        ...userData,
        userId,
        isAvatar: true,
        playAnimation,
        stopAnimation,
        updateClothing,
        setExpression
      }}
      {...props}
    />
  );
};

// ============================================================================
// 🛠️ FUNCIONES AUXILIARES
// ============================================================================

/**
 * Aplicar piel al avatar
 */
const applySkin = (avatar: THREE.Object3D, skin: string) => {
  avatar.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      // Aplicar textura de piel
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => {
          if (mat.map) {
            mat.map.image.src = skin;
            mat.map.needsUpdate = true;
          }
        });
      } else {
        if (child.material.map) {
          child.material.map.image.src = skin;
          child.material.map.needsUpdate = true;
        }
      }
    }
  });
};

/**
 * Aplicar ropa al avatar
 */
const applyClothing = (avatar: THREE.Object3D, clothing: ClothingItem) => {
  // Buscar el punto de unión correspondiente
  const attachmentPoint = avatar.getObjectByName(clothing.type);
  
  if (attachmentPoint) {
    // Crear objeto de ropa
    const clothingObject = new THREE.Group();
    
    // Cargar modelo de ropa
    // Aquí se implementaría la carga del modelo GLTF de la ropa
    
    // Configurar posición y rotación
    if (clothing.position) {
      clothingObject.position.copy(clothing.position);
    }
    if (clothing.rotation) {
      clothingObject.rotation.copy(clothing.rotation);
    }
    if (clothing.scale) {
      clothingObject.scale.copy(clothing.scale);
    }
    
    // Aplicar textura si existe
    if (clothing.texture) {
      clothingObject.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Aplicar textura
        }
      });
    }
    
    attachmentPoint.add(clothingObject);
  }
};

/**
 * Remover ropa del avatar
 */
const removeClothing = (avatar: THREE.Object3D, clothing: ClothingItem) => {
  const attachmentPoint = avatar.getObjectByName(clothing.type);
  
  if (attachmentPoint) {
    // Remover objetos de ropa
    const clothingObjects = attachmentPoint.children.filter(child => 
      child.userData.clothingId === clothing.id
    );
    
    clothingObjects.forEach(obj => {
      attachmentPoint.remove(obj);
    });
  }
};

/**
 * Aplicar expresión facial
 */
const applyExpression = (avatar: THREE.Object3D, expression: string, intensity: number) => {
  avatar.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      // Aplicar morph targets para expresiones
      if (child.morphTargetDictionary && child.morphTargetInfluences) {
        const morphIndex = child.morphTargetDictionary[expression];
        if (morphIndex !== undefined) {
          child.morphTargetInfluences[morphIndex] = intensity;
        }
      }
    }
  });
};

// ============================================================================
// 👤 COMPONENTES ESPECIALIZADOS DE AVATAR
// ============================================================================

/**
 * Avatar básico con configuración predeterminada
 */
export const BasicAvatar: React.FC<Omit<AvatarProps, 'model' | 'clothing' | 'animations'> & {
  gender?: 'male' | 'female';
  age?: 'child' | 'teen' | 'adult' | 'elder';
}> = ({
  gender = 'adult',
  age = 'adult',
  ...props
}) => {
  const modelPath = `/models/avatar/${gender}-${age}.glb`;
  
  return (
    <Avatar
      model={modelPath}
      {...props}
    />
  );
};

/**
 * Avatar personalizable con opciones avanzadas
 */
export const CustomizableAvatar: React.FC<AvatarProps & {
  customizationOptions: {
    skins: string[];
    hairStyles: string[];
    eyeColors: string[];
    bodyTypes: string[];
  };
  onCustomizationChange?: (customization: any) => void;
}> = ({
  customizationOptions,
  onCustomizationChange,
  ...props
}) => {
  const [customization, setCustomization] = useState({
    skin: 0,
    hairStyle: 0,
    eyeColor: 0,
    bodyType: 0
  });

  const handleCustomizationChange = (type: string, value: number) => {
    const newCustomization = { ...customization, [type]: value };
    setCustomization(newCustomization);
    onCustomizationChange?.(newCustomization);
  };

  return (
    <Avatar
      {...props}
      skin={customizationOptions.skins[customization.skin]}
      userData={{
        ...props.userData,
        customization,
        onCustomizationChange: handleCustomizationChange
      }}
    />
  );
};

/**
 * Avatar con IA para comportamiento automático
 */
export const AIAvatar: React.FC<AvatarProps & {
  personality: 'friendly' | 'shy' | 'aggressive' | 'neutral';
  behaviorPatterns: string[];
  onBehaviorChange?: (behavior: string) => void;
}> = ({
  personality,
  behaviorPatterns,
  onBehaviorChange,
  ...props
}) => {
  const [currentBehavior, setCurrentBehavior] = useState('idle');

  useEffect(() => {
    // Simular comportamiento de IA
    const behaviorInterval = setInterval(() => {
      const randomBehavior = behaviorPatterns[
        Math.floor(Math.random() * behaviorPatterns.length)
      ];
      setCurrentBehavior(randomBehavior);
      onBehaviorChange?.(randomBehavior);
    }, 5000 + Math.random() * 10000);

    return () => clearInterval(behaviorInterval);
  }, [behaviorPatterns, onBehaviorChange]);

  return (
    <Avatar
      {...props}
      userData={{
        ...props.userData,
        personality,
        currentBehavior,
        isAI: true
      }}
    />
  );
};

// ============================================================================
// 📦 EXPORTACIONES
// ============================================================================

export default Avatar;
export { BasicAvatar, CustomizableAvatar, AIAvatar }; 