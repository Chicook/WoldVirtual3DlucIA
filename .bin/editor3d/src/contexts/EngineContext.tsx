//! Contexto React para la integración con el Motor 3D
//! 
//! Proporciona estado global y métodos para interactuar con el motor
//! desde cualquier componente del editor.

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { EngineBridge, EngineBridgeConfig, EngineCommands } from '../core/engine/EngineBridge';
import { EngineMessage, EngineEntity, Scene, EngineStats } from '../core/types/engine';

/// Estado del contexto del motor
interface EngineContextState {
  /// Puente del motor
  bridge: EngineBridge | null;
  /// Comandos del motor
  commands: EngineCommands | null;
  /// Estado de conexión
  connected: boolean;
  /// Estado de carga
  loading: boolean;
  /// Error
  error: string | null;
  /// Escena actual
  currentScene: Scene | null;
  /// Entidades
  entities: EngineEntity[];
  /// Estadísticas
  stats: EngineStats | null;
  /// Latencia
  latency: number;
}

/// Métodos del contexto del motor
interface EngineContextMethods {
  /// Conectar al motor
  connect: () => Promise<void>;
  /// Desconectar del motor
  disconnect: () => void;
  /// Crear entidad
  createEntity: (components?: any[]) => Promise<EngineEntity>;
  /// Eliminar entidad
  deleteEntity: (entityId: string) => Promise<void>;
  /// Agregar componente
  addComponent: (entityId: string, componentType: string, componentData: any) => Promise<void>;
  /// Remover componente
  removeComponent: (entityId: string, componentType: string) => Promise<void>;
  /// Actualizar componente
  updateComponent: (entityId: string, componentType: string, componentData: any) => Promise<void>;
  /// Cargar modelo
  loadModel: (path: string) => Promise<any>;
  /// Crear material
  createMaterial: (materialData: any) => Promise<any>;
  /// Crear luz
  createLight: (lightData: any) => Promise<any>;
  /// Crear cámara
  createCamera: (cameraData: any) => Promise<any>;
  /// Cargar escena
  loadScene: (sceneData: any) => Promise<void>;
  /// Guardar escena
  saveScene: (sceneData: any) => Promise<void>;
  /// Obtener estadísticas
  getStats: () => Promise<EngineStats>;
  /// Ejecutar script WASM
  executeWasmScript: (scriptData: any) => Promise<any>;
  /// Enviar transacción blockchain
  sendBlockchainTransaction: (transactionData: any) => Promise<any>;
  /// Sincronizar estado
  syncState: () => Promise<void>;
}

/// Contexto del motor
interface EngineContextType extends EngineContextState, EngineContextMethods {}

/// Configuración por defecto del motor
const defaultEngineConfig: EngineBridgeConfig = {
  motorUrl: 'localhost',
  motorPort: 8080,
  protocol: 'ws',
  connectionTimeout: 5000,
  maxRetries: 5,
  heartbeat: {
    enabled: true,
    interval: 30000,
    timeout: 10000,
  },
  sync: {
    enabled: true,
    interval: 1000,
    autoSync: true,
  },
};

/// Contexto del motor
const EngineContext = createContext<EngineContextType | undefined>(undefined);

/// Props del provider
interface EngineProviderProps {
  children: ReactNode;
  config?: EngineBridgeConfig;
}

/// Provider del contexto del motor
export const EngineProvider: React.FC<EngineProviderProps> = ({ 
  children, 
  config = defaultEngineConfig 
}) => {
  const [state, setState] = useState<EngineContextState>({
    bridge: null,
    commands: null,
    connected: false,
    loading: false,
    error: null,
    currentScene: null,
    entities: [],
    stats: null,
    latency: 0,
  });

  /// Conectar al motor
  const connect = useCallback(async () => {
    if (state.bridge) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const bridge = new EngineBridge(config);
      const commands = new EngineCommands(bridge);

      // Configurar eventos del puente
      bridge.on('connected', () => {
        setState(prev => ({ 
          ...prev, 
          connected: true, 
          loading: false,
          error: null 
        }));
        console.log('✅ Conectado al motor 3D');
      });

      bridge.on('disconnected', () => {
        setState(prev => ({ 
          ...prev, 
          connected: false,
          bridge: null,
          commands: null 
        }));
        console.log('🔌 Desconectado del motor 3D');
      });

      bridge.on('error', (error: string) => {
        setState(prev => ({ 
          ...prev, 
          error, 
          loading: false 
        }));
        console.error('❌ Error del motor:', error);
      });

      bridge.on('stateChanged', (bridgeState) => {
        setState(prev => ({ 
          ...prev, 
          latency: bridgeState.latency 
        }));
      });

      bridge.on('entityCreated', (entity: EngineEntity) => {
        setState(prev => ({
          ...prev,
          entities: [...prev.entities, entity],
        }));
      });

      bridge.on('entityUpdated', (entity: EngineEntity) => {
        setState(prev => ({
          ...prev,
          entities: prev.entities.map(e => 
            e.id === entity.id ? entity : e
          ),
        }));
      });

      bridge.on('entityDeleted', (entityId: string) => {
        setState(prev => ({
          ...prev,
          entities: prev.entities.filter(e => e.id !== entityId),
        }));
      });

      bridge.on('sceneLoaded', (scene: Scene) => {
        setState(prev => ({
          ...prev,
          currentScene: scene,
          entities: scene.entities,
        }));
      });

      bridge.on('sceneSaved', (scene: Scene) => {
        setState(prev => ({
          ...prev,
          currentScene: scene,
        }));
      });

      bridge.on('performanceUpdate', (stats: EngineStats) => {
        setState(prev => ({
          ...prev,
          stats,
        }));
      });

      // Conectar al motor
      await bridge.connect();

      setState(prev => ({ 
        ...prev, 
        bridge, 
        commands 
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false 
      }));
    }
  }, [config, state.bridge]);

  /// Desconectar del motor
  const disconnect = useCallback(() => {
    if (state.bridge) {
      state.bridge.disconnect();
    }
  }, [state.bridge]);

  /// Crear entidad
  const createEntity = useCallback(async (components: any[] = []): Promise<EngineEntity> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    return await state.commands.createEntity(components);
  }, [state.commands]);

  /// Eliminar entidad
  const deleteEntity = useCallback(async (entityId: string): Promise<void> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    await state.commands.deleteEntity(entityId);
  }, [state.commands]);

  /// Agregar componente
  const addComponent = useCallback(async (
    entityId: string, 
    componentType: string, 
    componentData: any
  ): Promise<void> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    await state.commands.addComponent(entityId, componentType, componentData);
  }, [state.commands]);

  /// Remover componente
  const removeComponent = useCallback(async (
    entityId: string, 
    componentType: string
  ): Promise<void> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    await state.commands.removeComponent(entityId, componentType);
  }, [state.commands]);

  /// Actualizar componente
  const updateComponent = useCallback(async (
    entityId: string, 
    componentType: string, 
    componentData: any
  ): Promise<void> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    await state.commands.updateComponent(entityId, componentType, componentData);
  }, [state.commands]);

  /// Cargar modelo
  const loadModel = useCallback(async (path: string): Promise<any> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    return await state.commands.loadModel(path);
  }, [state.commands]);

  /// Crear material
  const createMaterial = useCallback(async (materialData: any): Promise<any> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    return await state.commands.createMaterial(materialData);
  }, [state.commands]);

  /// Crear luz
  const createLight = useCallback(async (lightData: any): Promise<any> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    return await state.commands.createLight(lightData);
  }, [state.commands]);

  /// Crear cámara
  const createCamera = useCallback(async (cameraData: any): Promise<any> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    return await state.commands.createCamera(cameraData);
  }, [state.commands]);

  /// Cargar escena
  const loadScene = useCallback(async (sceneData: any): Promise<void> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    await state.commands.loadScene(sceneData);
  }, [state.commands]);

  /// Guardar escena
  const saveScene = useCallback(async (sceneData: any): Promise<void> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    await state.commands.saveScene(sceneData);
  }, [state.commands]);

  /// Obtener estadísticas
  const getStats = useCallback(async (): Promise<EngineStats> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    return await state.commands.getEngineStats();
  }, [state.commands]);

  /// Ejecutar script WASM
  const executeWasmScript = useCallback(async (scriptData: any): Promise<any> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    return await state.commands.executeWasmScript(scriptData);
  }, [state.commands]);

  /// Enviar transacción blockchain
  const sendBlockchainTransaction = useCallback(async (transactionData: any): Promise<any> => {
    if (!state.commands) {
      throw new Error('Motor no conectado');
    }
    return await state.commands.sendBlockchainTransaction(transactionData);
  }, [state.commands]);

  /// Sincronizar estado
  const syncState = useCallback(async (): Promise<void> => {
    if (!state.bridge) {
      throw new Error('Motor no conectado');
    }
    await state.bridge.syncState();
  }, [state.bridge]);

  /// Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (state.bridge) {
        state.bridge.disconnect();
      }
    };
  }, [state.bridge]);

  /// Conectar automáticamente
  useEffect(() => {
    connect();
  }, [connect]);

  const contextValue: EngineContextType = {
    ...state,
    connect,
    disconnect,
    createEntity,
    deleteEntity,
    addComponent,
    removeComponent,
    updateComponent,
    loadModel,
    createMaterial,
    createLight,
    createCamera,
    loadScene,
    saveScene,
    getStats,
    executeWasmScript,
    sendBlockchainTransaction,
    syncState,
  };

  return (
    <EngineContext.Provider value={contextValue}>
      {children}
    </EngineContext.Provider>
  );
};

/// Hook para usar el contexto del motor
export const useEngine = (): EngineContextType => {
  const context = useContext(EngineContext);
  if (context === undefined) {
    throw new Error('useEngine debe ser usado dentro de un EngineProvider');
  }
  return context;
};

/// Hook para verificar si el motor está conectado
export const useEngineConnection = () => {
  const { connected, loading, error } = useEngine();
  return { connected, loading, error };
};

/// Hook para obtener entidades
export const useEngineEntities = () => {
  const { entities } = useEngine();
  return entities;
};

/// Hook para obtener estadísticas
export const useEngineStats = () => {
  const { stats } = useEngine();
  return stats;
};

/// Hook para obtener la escena actual
export const useEngineScene = () => {
  const { currentScene } = useEngine();
  return currentScene;
}; 