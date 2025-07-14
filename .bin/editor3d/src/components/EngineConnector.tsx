/**
 * EngineConnector.tsx - Conector del Motor 3D
 * Integra el motor 3D con la interfaz de usuario React
 * 
 * Líneas: 1-250 (Primera instancia)
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { engineCore } from '../core/engine/EngineCore';
import { advancedEngineCore } from '../core/engine/EngineCore.2';
import { EngineState, EngineConfig } from '../core/engine/EngineCore';
import { Scene, SceneObject } from '../core/engine/EngineCore.2';

// Tipos para el componente
interface EngineConnectorProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  config?: Partial<EngineConfig>;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

interface EngineContextType {
  // Estado del motor
  engineState: EngineState;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Escenas
  activeScene: Scene | null;
  scenes: Scene[];
  
  // Objetos seleccionados
  selectedObjects: string[];
  
  // Acciones del motor
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  
  // Acciones de escena
  createScene: (name: string) => Scene;
  setActiveScene: (sceneId: string) => boolean;
  addObject: (object: Omit<SceneObject, 'id'>) => SceneObject | null;
  removeObject: (objectId: string) => boolean;
  updateObject: (objectId: string, updates: Partial<SceneObject>) => boolean;
  
  // Acciones de selección
  selectObjects: (objectIds: string[]) => void;
  clearSelection: () => void;
  
  // Acciones de edición
  duplicateSelected: () => SceneObject[];
  groupSelected: (groupName: string) => SceneObject | null;
  ungroupObjects: (groupId: string) => SceneObject[] | null;
  
  // Acciones de historial
  undo: () => boolean;
  redo: () => boolean;
  canUndo: boolean;
  canRedo: boolean;
  
  // Acciones de archivo
  exportScene: (format: 'json' | 'gltf' | 'obj') => string;
  importScene: (data: string, format: 'json' | 'gltf' | 'obj') => Scene | null;
  
  // Configuración
  updateConfig: (config: Partial<EngineConfig>) => void;
  getConfig: () => EngineConfig;
}

// Contexto del motor
const EngineContext = React.createContext<EngineContextType | null>(null);

// Hook personalizado para usar el motor
export const useEngine = (): EngineContextType => {
  const context = React.useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within an EngineConnector');
  }
  return context;
};

export const EngineConnector: React.FC<EngineConnectorProps> = ({
  children,
  autoConnect = true,
  config = {},
  onConnectionChange,
  onError
}) => {
  // Estado del componente
  const [engineState, setEngineState] = useState<EngineState>(engineCore.getState());
  const [activeScene, setActiveSceneState] = useState<Scene | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Referencias para evitar re-renders innecesarios
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Configurar el motor
  useEffect(() => {
    if (Object.keys(config).length > 0) {
      engineCore.updateConfig(config);
    }
  }, [config]);

  // Configurar event listeners del motor
  useEffect(() => {
    const handleStateChange = (newState: EngineState, oldState: EngineState) => {
      setEngineState(newState);
      
      // Notificar cambio de conexión
      if (newState.connected !== oldState.connected) {
        onConnectionChange?.(newState.connected);
      }
    };

    const handleError = (error: string) => {
      onError?.(error);
    };

    const handleEngineReady = () => {
      console.log('✅ Motor 3D listo');
    };

    const handleSceneCreated = (scene: Scene) => {
      setScenes(prev => [...prev, scene]);
    };

    const handleActiveSceneChanged = (sceneId: string) => {
      const scene = scenes.find(s => s.id === sceneId) || null;
      setActiveSceneState(scene);
    };

    const handleObjectAdded = (object: SceneObject, sceneId: string) => {
      setScenes(prev => prev.map(scene => 
        scene.id === sceneId 
          ? { ...scene, objects: [...scene.objects, object] }
          : scene
      ));
    };

    const handleObjectRemoved = (object: SceneObject, sceneId: string) => {
      setScenes(prev => prev.map(scene => 
        scene.id === sceneId 
          ? { ...scene, objects: scene.objects.filter(obj => obj.id !== object.id) }
          : scene
      ));
      
      // Remover de selección si está seleccionado
      setSelectedObjects(prev => prev.filter(id => id !== object.id));
    };

    const handleObjectUpdated = (object: SceneObject, oldObject: SceneObject, sceneId: string) => {
      setScenes(prev => prev.map(scene => 
        scene.id === sceneId 
          ? { 
              ...scene, 
              objects: scene.objects.map(obj => 
                obj.id === object.id ? object : obj
              )
            }
          : scene
      ));
    };

    const handleObjectsSelected = (objectIds: string[]) => {
      setSelectedObjects(objectIds);
    };

    const handleSelectionCleared = () => {
      setSelectedObjects([]);
    };

    const handleObjectsDuplicated = (objects: SceneObject[]) => {
      if (activeScene) {
        setScenes(prev => prev.map(scene => 
          scene.id === activeScene.id 
            ? { ...scene, objects: [...scene.objects, ...objects] }
            : scene
        ));
      }
    };

    const handleUndo = () => {
      setCanUndo(false);
      setCanRedo(true);
    };

    const handleRedo = () => {
      setCanUndo(true);
      setCanRedo(false);
    };

    // Suscribirse a eventos del motor base
    engineCore.on('stateChanged', handleStateChange);
    engineCore.on('error', handleError);
    engineCore.on('connected', () => {
      reconnectAttemptsRef.current = 0;
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    });

    // Suscribirse a eventos del motor avanzado
    advancedEngineCore.on('engineReady', handleEngineReady);
    advancedEngineCore.on('sceneCreated', handleSceneCreated);
    advancedEngineCore.on('activeSceneChanged', handleActiveSceneChanged);
    advancedEngineCore.on('objectAdded', handleObjectAdded);
    advancedEngineCore.on('objectRemoved', handleObjectRemoved);
    advancedEngineCore.on('objectUpdated', handleObjectUpdated);
    advancedEngineCore.on('objectsSelected', handleObjectsSelected);
    advancedEngineCore.on('selectionCleared', handleSelectionCleared);
    advancedEngineCore.on('objectsDuplicated', handleObjectsDuplicated);
    advancedEngineCore.on('undo', handleUndo);
    advancedEngineCore.on('redo', handleRedo);

    // Limpiar event listeners
    return () => {
      engineCore.removeAllListeners();
      advancedEngineCore.removeAllListeners();
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, [scenes, activeScene, onConnectionChange, onError]);

  // Conectar automáticamente si está habilitado
  useEffect(() => {
    if (autoConnect && !engineState.connected && engineState.status === 'disconnected') {
      connect();
    }
  }, [autoConnect, engineState.connected, engineState.status]);

  // Función de conexión
  const connect = useCallback(async (): Promise<void> => {
    try {
      await engineCore.connect();
    } catch (error) {
      console.error('Error al conectar:', error);
      onError?.(`Error de conexión: ${error}`);
    }
  }, [onError]);

  // Función de desconexión
  const disconnect = useCallback((): void => {
    engineCore.disconnect();
  }, []);

  // Función de reconexión
  const reconnect = useCallback(async (): Promise<void> => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      onError?.('Máximo número de intentos de reconexión alcanzado');
      return;
    }

    reconnectAttemptsRef.current++;
    
    // Backoff exponencial
    const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
    
    connectionTimeoutRef.current = setTimeout(async () => {
      try {
        await connect();
      } catch (error) {
        console.error('Error en reconexión:', error);
      }
    }, delay);
  }, [connect, onError]);

  // Funciones de escena
  const createScene = useCallback((name: string): Scene => {
    return advancedEngineCore.createScene(name);
  }, []);

  const setActiveScene = useCallback((sceneId: string): boolean => {
    return advancedEngineCore.setActiveScene(sceneId);
  }, []);

  const addObject = useCallback((object: Omit<SceneObject, 'id'>): SceneObject | null => {
    if (!activeScene) return null;
    return advancedEngineCore.addObject(activeScene.id, object);
  }, [activeScene]);

  const removeObject = useCallback((objectId: string): boolean => {
    if (!activeScene) return false;
    return advancedEngineCore.removeObject(activeScene.id, objectId);
  }, [activeScene]);

  const updateObject = useCallback((objectId: string, updates: Partial<SceneObject>): boolean => {
    if (!activeScene) return false;
    return advancedEngineCore.updateObject(activeScene.id, objectId, updates);
  }, [activeScene]);

  // Funciones de selección
  const selectObjects = useCallback((objectIds: string[]): void => {
    advancedEngineCore.selectObjects(objectIds);
  }, []);

  const clearSelection = useCallback((): void => {
    advancedEngineCore.clearSelection();
  }, []);

  // Funciones de edición
  const duplicateSelected = useCallback((): SceneObject[] => {
    return advancedEngineCore.duplicateSelectedObjects();
  }, []);

  const groupSelected = useCallback((groupName: string): SceneObject | null => {
    return advancedEngineCore.groupSelectedObjects(groupName);
  }, []);

  const ungroupObjects = useCallback((groupId: string): SceneObject[] | null => {
    return advancedEngineCore.ungroupObjects(groupId);
  }, []);

  // Funciones de historial
  const undo = useCallback((): boolean => {
    return advancedEngineCore.undo();
  }, []);

  const redo = useCallback((): boolean => {
    return advancedEngineCore.redo();
  }, []);

  // Funciones de archivo
  const exportScene = useCallback((format: 'json' | 'gltf' | 'obj'): string => {
    if (!activeScene) return '';
    return advancedEngineCore.exportScene(activeScene.id, format);
  }, [activeScene]);

  const importScene = useCallback((data: string, format: 'json' | 'gltf' | 'obj'): Scene | null => {
    return advancedEngineCore.importScene(data, format);
  }, []);

  // Funciones de configuración
  const updateConfig = useCallback((newConfig: Partial<EngineConfig>): void => {
    engineCore.updateConfig(newConfig);
  }, []);

  const getConfig = useCallback((): EngineConfig => {
    return engineCore.getConfig();
  }, []);

  // Valor del contexto
  const contextValue: EngineContextType = {
    // Estado
    engineState,
    isConnected: engineState.connected,
    isConnecting: engineState.status === 'connecting',
    
    // Escenas
    activeScene,
    scenes,
    
    // Selección
    selectedObjects,
    
    // Acciones del motor
    connect,
    disconnect,
    reconnect,
    
    // Acciones de escena
    createScene,
    setActiveScene,
    addObject,
    removeObject,
    updateObject,
    
    // Acciones de selección
    selectObjects,
    clearSelection,
    
    // Acciones de edición
    duplicateSelected,
    groupSelected,
    ungroupObjects,
    
    // Acciones de historial
    undo,
    redo,
    canUndo,
    canRedo,
    
    // Acciones de archivo
    exportScene,
    importScene,
    
    // Configuración
    updateConfig,
    getConfig
  };

  return (
    <EngineContext.Provider value={contextValue}>
      {children}
    </EngineContext.Provider>
  );
};

// Componente de estado de conexión
export const EngineStatus: React.FC = () => {
  const { engineState, isConnected, isConnecting, connect, disconnect } = useEngine();

  const getStatusColor = () => {
    if (isConnected) return 'text-green-500';
    if (isConnecting) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (isConnected) return 'Conectado';
    if (isConnecting) return 'Conectando...';
    return 'Desconectado';
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      
      {engineState.performance.fps > 0 && (
        <span className="text-xs text-gray-400">
          {engineState.performance.fps} FPS
        </span>
      )}
      
      <div className="flex space-x-1">
        {!isConnected && !isConnecting && (
          <button
            onClick={connect}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded"
          >
            Conectar
          </button>
        )}
        
        {isConnected && (
          <button
            onClick={disconnect}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
          >
            Desconectar
          </button>
        )}
      </div>
    </div>
  );
};

export default EngineConnector; 