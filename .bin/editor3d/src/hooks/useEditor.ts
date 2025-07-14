import { useState, useCallback } from 'react';
import { SceneObject, EditorState, SceneData } from '../types/editor';

export const useEditor = () => {
  const [state, setState] = useState<EditorState>({
    selectedObject: null,
    editMode: 'select',
    sceneObjects: [],
    camera: {
      position: { x: 5, y: 5, z: 5 },
      rotation: { x: 0, y: 0, z: 0 }
    }
  });

  const setSelectedObject = useCallback((object: SceneObject | null) => {
    setState(prev => ({ ...prev, selectedObject: object }));
  }, []);

  const setEditMode = useCallback((mode: EditorState['editMode']) => {
    setState(prev => ({ ...prev, editMode: mode }));
  }, []);

  const addObject = useCallback((object: Omit<SceneObject, 'id'>) => {
    const newObject: SceneObject = {
      ...object,
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setState(prev => ({
      ...prev,
      sceneObjects: [...prev.sceneObjects, newObject]
    }));
    
    return newObject;
  }, []);

  const removeObject = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      sceneObjects: prev.sceneObjects.filter(obj => obj.id !== id),
      selectedObject: prev.selectedObject?.id === id ? null : prev.selectedObject
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

  const duplicateObject = useCallback((id: string) => {
    const originalObject = state.sceneObjects.find(obj => obj.id === id);
    if (!originalObject) return;

    const duplicatedObject: SceneObject = {
      ...originalObject,
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalObject.name}_copy`,
      position: {
        ...originalObject.position,
        x: originalObject.position.x + 1,
        z: originalObject.position.z + 1
      }
    };

    setState(prev => ({
      ...prev,
      sceneObjects: [...prev.sceneObjects, duplicatedObject]
    }));
  }, [state.sceneObjects]);

  const saveScene = useCallback((name: string = 'My Scene') => {
    const sceneData: SceneData = {
      objects: state.sceneObjects,
      metadata: {
        name,
        created: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    try {
      localStorage.setItem('metaverso-scene', JSON.stringify(sceneData));
      return { success: true, message: 'Escena guardada correctamente' };
    } catch (error) {
      return { success: false, message: 'Error al guardar la escena' };
    }
  }, [state.sceneObjects]);

  const loadScene = useCallback(() => {
    try {
      const savedScene = localStorage.getItem('metaverso-scene');
      if (!savedScene) {
        return { success: false, message: 'No hay escena guardada' };
      }

      const sceneData: SceneData = JSON.parse(savedScene);
      setState(prev => ({
        ...prev,
        sceneObjects: sceneData.objects,
        selectedObject: null
      }));

      return { success: true, message: 'Escena cargada correctamente' };
    } catch (error) {
      return { success: false, message: 'Error al cargar la escena' };
    }
  }, []);

  const exportScene = useCallback((name: string = 'metaverso-scene') => {
    const sceneData: SceneData = {
      objects: state.sceneObjects,
      metadata: {
        name,
        created: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    try {
      const blob = new Blob([JSON.stringify(sceneData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      return { success: true, message: 'Escena exportada correctamente' };
    } catch (error) {
      return { success: false, message: 'Error al exportar la escena' };
    }
  }, [state.sceneObjects]);

  const clearScene = useCallback(() => {
    setState(prev => ({
      ...prev,
      sceneObjects: [],
      selectedObject: null
    }));
  }, []);

  return {
    state,
    setSelectedObject,
    setEditMode,
    addObject,
    removeObject,
    updateObject,
    duplicateObject,
    saveScene,
    loadScene,
    exportScene,
    clearScene
  };
}; 