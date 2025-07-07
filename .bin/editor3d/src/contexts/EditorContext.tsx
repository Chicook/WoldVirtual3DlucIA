import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gizmoSystem, GizmoEvent } from '../services/GizmoSystem';
import { materialSystem, MaterialProperties, TextureInfo } from '../services/MaterialSystem';
import { avatarRegistry } from '../services/AvatarRegistry';

// Tipos temporales para que funcione
interface MaterialPreset {
  id: string;
  name: string;
  type: string;
  properties: any;
}

interface ScriptBehavior {
  id: string;
  name: string;
  type: string;
  parameters: any;
  enabled: boolean;
}

export interface SceneObject {
  id: string;
  name: string;
  type: 'mesh' | 'light' | 'camera' | 'group';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  visible: boolean;
  geometry?: string;
  material?: {
    color: string;
    opacity: number;
    transparent: boolean;
  };
  userData?: Record<string, any>;
}

export interface EditorState {
  sceneObjects: SceneObject[];
  selectedObject: SceneObject | null;
  editMode: 'select' | 'move' | 'rotate' | 'scale';
  transformMode: 'translate' | 'rotate' | 'scale';
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
  gizmosEnabled: boolean;
  materials: MaterialProperties[];
  textures: TextureInfo[];
  animations: string[];
  scripts: ScriptBehavior[];
}

interface EditorContextType {
  state: EditorState;
  addObject: (type: string, name?: string) => SceneObject;
  removeObject: (id: string) => void;
  selectObject: (object: SceneObject | null) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  setEditMode: (mode: EditorState['editMode']) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  toggleGizmos: () => void;
  applyMaterial: (objectId: string, materialId: string) => void;
  createMaterial: (properties: MaterialProperties) => void;
  addTexture: (textureInfo: TextureInfo) => Promise<void>;
  addAnimation: (objectId: string, animationType: string) => void;
  addScript: (objectId: string, scriptType: string) => void;
  saveScene: () => void;
  loadScene: () => void;
  exportScene: () => void;
  exportAvatar: (objectId: string) => void;
  clearScene: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

interface EditorProviderProps {
  children: React.ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const [state, setState] = useState<EditorState>({
    sceneObjects: [
      {
        id: '1',
        name: 'Cube',
        type: 'mesh',
        position: { x: 0, y: 0.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        geometry: 'BoxGeometry',
        material: {
          color: '#00ff00',
          opacity: 1,
          transparent: false
        }
      },
      {
        id: '2',
        name: 'Sphere',
        type: 'mesh',
        position: { x: 2, y: 0.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        geometry: 'SphereGeometry',
        material: {
          color: '#ff0000',
          opacity: 1,
          transparent: false
        }
      },
      {
        id: '3',
        name: 'Ground',
        type: 'mesh',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        geometry: 'PlaneGeometry',
        material: {
          color: '#808080',
          opacity: 1,
          transparent: false
        }
      }
    ],
    selectedObject: null,
    editMode: 'select',
    transformMode: 'translate',
    sceneRef,
    cameraRef,
    rendererRef,
    gizmosEnabled: true,
    materials: materialSystem.getAllMaterials(),
    textures: materialSystem.getAllTextures(),
    animations: [],
    scripts: []
  });

  const addObject = useCallback((type: string, name?: string): SceneObject => {
    const newObject: SceneObject = {
      id: `obj_${Date.now()}`,
      name: name || `${type}_${state.sceneObjects.length + 1}`,
      type: 'mesh',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      geometry: type === 'cube' ? 'BoxGeometry' : 
                type === 'sphere' ? 'SphereGeometry' :
                type === 'cylinder' ? 'CylinderGeometry' :
                type === 'plane' ? 'PlaneGeometry' : 'BoxGeometry',
      material: {
        color: type === 'cube' ? '#00ff00' :
               type === 'sphere' ? '#ff0000' :
               type === 'cylinder' ? '#0000ff' :
               type === 'plane' ? '#808080' : '#ffffff',
        opacity: 1,
        transparent: false
      }
    };

    setState(prev => ({
      ...prev,
      sceneObjects: [...prev.sceneObjects, newObject]
    }));

    return newObject;
  }, [state.sceneObjects.length]);

  const removeObject = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      sceneObjects: prev.sceneObjects.filter(obj => obj.id !== id),
      selectedObject: prev.selectedObject?.id === id ? null : prev.selectedObject
    }));
  }, []);

  const selectObject = useCallback((object: SceneObject | null) => {
    setState(prev => ({
      ...prev,
      selectedObject: object
    }));
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<SceneObject>) => {
    setState(prev => ({
      ...prev,
      sceneObjects: prev.sceneObjects.map(obj =>
        obj.id === id ? { ...obj, ...updates } : obj
      ),
      selectedObject: prev.selectedObject?.id === id
        ? { ...prev.selectedObject, ...updates }
        : prev.selectedObject
    }));
  }, []);

  const setEditMode = useCallback((mode: EditorState['editMode']) => {
    setState(prev => ({
      ...prev,
      editMode: mode
    }));
  }, []);

  const saveScene = useCallback(() => {
    const sceneData = {
      objects: state.sceneObjects,
      metadata: {
        name: 'My Scene',
        created: new Date().toISOString(),
        version: '1.0'
      }
    };
    
    localStorage.setItem('metaverso-scene', JSON.stringify(sceneData));
    console.log('Escena guardada:', sceneData);
  }, [state.sceneObjects]);

  const loadScene = useCallback(() => {
    const savedScene = localStorage.getItem('metaverso-scene');
    if (savedScene) {
      const sceneData = JSON.parse(savedScene);
      setState(prev => ({
        ...prev,
        sceneObjects: sceneData.objects
      }));
      console.log('Escena cargada:', sceneData);
    }
  }, []);

  const exportScene = useCallback(() => {
    const sceneData = {
      objects: state.sceneObjects,
      metadata: {
        name: 'My Scene',
        created: new Date().toISOString(),
        version: '1.0'
      }
    };
    
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metaverso-scene.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [state.sceneObjects]);

  const clearScene = useCallback(() => {
    setState(prev => ({
      ...prev,
      sceneObjects: [],
      selectedObject: null
    }));
  }, []);

  // Funciones para sistemas avanzados
  const setTransformMode = useCallback((mode: 'translate' | 'rotate' | 'scale') => {
    setState(prev => ({
      ...prev,
      transformMode: mode
    }));
  }, []);

  const toggleGizmos = useCallback(() => {
    setState(prev => ({
      ...prev,
      gizmosEnabled: !prev.gizmosEnabled
    }));
  }, []);

  const applyMaterial = useCallback((objectId: string, materialId: string) => {
    const material = materialSystem.getMaterial(materialId);
    if (material) {
      updateObject(objectId, { material: material });
      console.log(`Aplicando material ${materialId} al objeto ${objectId}`);
    }
  }, []);

  const createMaterial = useCallback((properties: MaterialProperties) => {
    materialSystem.saveMaterial(properties);
    setState(prev => ({
      ...prev,
      materials: materialSystem.getAllMaterials()
    }));
    console.log('Material creado:', properties);
  }, []);

  const addTexture = useCallback(async (textureInfo: TextureInfo) => {
    try {
      await materialSystem.addTexture(textureInfo);
      setState(prev => ({
        ...prev,
        textures: materialSystem.getAllTextures()
      }));
      console.log('Textura añadida:', textureInfo);
    } catch (error) {
      console.error('Error al añadir textura:', error);
    }
  }, []);

  const addAnimation = useCallback((objectId: string, animationType: string) => {
    // Implementación básica - en el futuro se integrará con AnimationSystem
    console.log(`Añadiendo animación ${animationType} al objeto ${objectId}`);
  }, []);

  const addScript = useCallback((objectId: string, scriptType: string) => {
    // Implementación básica - en el futuro se integrará con AnimationSystem
    console.log(`Añadiendo script ${scriptType} al objeto ${objectId}`);
  }, []);

  const exportAvatar = useCallback((objectId: string) => {
    // Implementación básica - en el futuro se integrará con el sistema de avatares
    const avatarObject = state.sceneObjects.find(obj => obj.id === objectId);
    if (avatarObject) {
      const avatarData = {
        id: avatarObject.id,
        name: avatarObject.name,
        type: avatarObject.type,
        position: avatarObject.position,
        rotation: avatarObject.rotation,
        scale: avatarObject.scale,
        material: avatarObject.material,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0'
        }
      };
      
      const blob = new Blob([JSON.stringify(avatarData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${avatarObject.name}-avatar.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('Avatar exportado:', avatarData);
    }
  }, [state.sceneObjects]);

  const value: EditorContextType = {
    state,
    addObject,
    removeObject,
    selectObject,
    updateObject,
    setEditMode,
    setTransformMode,
    toggleGizmos,
    applyMaterial,
    createMaterial,
    addTexture,
    addAnimation,
    addScript,
    saveScene,
    loadScene,
    exportScene,
    exportAvatar,
    clearScene
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}; 