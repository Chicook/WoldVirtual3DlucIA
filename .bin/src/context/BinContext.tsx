import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { BinModule } from '../types';
import { binSystem } from '../core/BinSystem';

// Tipos para el contexto
// (Eliminada la definición local de BinModule)

interface BinState {
  modules: BinModule[];
  selectedModule: BinModule | null;
  isLoading: boolean;
  error: string | null;
  systemStatus: {
    isInitialized: boolean;
    totalModules: number;
    activeUsers: number;
  };
}

type BinAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MODULES'; payload: BinModule[] }
  | { type: 'SELECT_MODULE'; payload: BinModule | null }
  | { type: 'UPDATE_MODULE_STATUS'; payload: { id: string; status: BinModule['status'] } }
  | { type: 'UPDATE_SYSTEM_STATUS'; payload: { isInitialized: boolean; totalModules: number; activeUsers: number } }
  | { type: 'LOAD_MODULE_FOR_USER'; payload: { moduleName: string; userId: string } };

// Estado inicial
const initialState: BinState = {
  systemStatus: {
    isInitialized: false,
    totalModules: 0,
    activeUsers: 0
  },
  modules: [
    {
      id: 'automation',
      name: 'Automation',
      description: 'Sistema de automatización y workflows',
      status: 'active',
      version: '1.0.0',
      dependencies: ['security', 'monitor'],
      lastUpdated: new Date()
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Auditoría de seguridad y protección',
      status: 'active',
      version: '1.0.0',
      dependencies: [],
      lastUpdated: new Date()
    },
    {
      id: 'blockchain',
      name: 'Blockchain',
      description: 'Gestión de blockchain y smart contracts',
      status: 'active',
      version: '1.0.0',
      dependencies: ['security'],
      lastUpdated: new Date()
    },
    {
      id: 'metaverso',
      name: 'Metaverso',
      description: 'Generación procedural de mundos virtuales',
      status: 'active',
      version: '1.0.0',
      dependencies: ['blockchain', 'assets'],
      lastUpdated: new Date()
    },
    {
      id: 'monitor',
      name: 'Monitor',
      description: 'Monitoreo de sistema y métricas',
      status: 'active',
      version: '1.0.0',
      dependencies: [],
      lastUpdated: new Date()
    },
    {
      id: 'deploy',
      name: 'Deploy',
      description: 'Despliegue automático y CI/CD',
      status: 'active',
      version: '1.0.0',
      dependencies: ['security', 'monitor'],
      lastUpdated: new Date()
    },
    {
      id: 'builder',
      name: 'Builder',
      description: 'Compilación y construcción de aplicaciones',
      status: 'active',
      version: '1.0.0',
      dependencies: ['deploy'],
      lastUpdated: new Date()
    },
    {
      id: 'editor3d',
      name: 'Editor 3D',
      description: 'Editor tridimensional y modelado',
      status: 'active',
      version: '1.0.0',
      dependencies: ['metaverso'],
      lastUpdated: new Date()
    },
    {
      id: 'params',
      name: 'Params',
      description: 'Gestión de parámetros y configuraciones',
      status: 'active',
      version: '1.0.0',
      dependencies: [],
      lastUpdated: new Date()
    },
    {
      id: 'redpublicacion',
      name: 'Red Publicación',
      description: 'Red de distribución de contenido',
      status: 'active',
      version: '1.0.0',
      dependencies: ['blockchain'],
      lastUpdated: new Date()
    },
    {
      id: 'toolkit',
      name: 'Toolkit',
      description: 'Herramientas y utilidades del sistema',
      status: 'active',
      version: '1.0.0',
      dependencies: [],
      lastUpdated: new Date()
    },
    {
      id: 'manuals',
      name: 'Manuals',
      description: 'Documentación y manuales del sistema',
      status: 'active',
      version: '1.0.0',
      dependencies: [],
      lastUpdated: new Date()
    }
  ],
  selectedModule: null,
  isLoading: false,
  error: null
};

// Reducer
function binReducer(state: BinState, action: BinAction): BinState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MODULES':
      return { ...state, modules: action.payload };
    case 'SELECT_MODULE':
      return { ...state, selectedModule: action.payload };
    case 'UPDATE_MODULE_STATUS':
      return {
        ...state,
        modules: state.modules.map(module =>
          module.id === action.payload.id
            ? { ...module, status: action.payload.status }
            : module
        )
      };
    case 'UPDATE_SYSTEM_STATUS':
      return {
        ...state,
        systemStatus: action.payload
      };
    case 'LOAD_MODULE_FOR_USER':
      return {
        ...state,
        modules: state.modules.map(module =>
          module.id === action.payload.moduleName
            ? { ...module, status: 'loading' as const }
            : module
        )
      };
    default:
      return state;
  }
}

// Contexto
interface BinContextType {
  state: BinState;
  dispatch: React.Dispatch<BinAction>;
  selectModule: (module: BinModule | null) => void;
  updateModuleStatus: (id: string, status: BinModule['status']) => void;
  getModuleById: (id: string) => BinModule | undefined;
  loadModuleForUser: (moduleName: string, userId: string) => Promise<void>;
  loadModuleGroup: (groupName: string, userId: string) => Promise<void>;
  executeModuleAction: (moduleName: string, action: string, params: any[], userId: string) => Promise<any>;
  refreshSystemStatus: () => Promise<void>;
}

const BinContext = createContext<BinContextType | undefined>(undefined);

// Provider
interface BinProviderProps {
  children: ReactNode;
}

export function BinProvider({ children }: BinProviderProps) {
  const [state, dispatch] = useReducer(binReducer, initialState);

  const selectModule = (module: BinModule | null) => {
    dispatch({ type: 'SELECT_MODULE', payload: module });
  };

  const updateModuleStatus = (id: string, status: BinModule['status']) => {
    dispatch({ type: 'UPDATE_MODULE_STATUS', payload: { id, status } });
  };

  const getModuleById = (id: string) => {
    return state.modules.find(module => module.id === id);
  };

  const loadModuleForUser = async (moduleName: string, userId: string) => {
    try {
      dispatch({ type: 'LOAD_MODULE_FOR_USER', payload: { moduleName, userId } });
      await binSystem.loadModuleForUser(moduleName, userId);
      updateModuleStatus(moduleName, 'active');
    } catch (error) {
      updateModuleStatus(moduleName, 'error');
      throw error;
    }
  };

  const loadModuleGroup = async (groupName: string, userId: string) => {
    try {
      await binSystem.loadModuleGroupForUser(groupName, userId);
    } catch (error) {
      throw error;
    }
  };

  const executeModuleAction = async (moduleName: string, action: string, params: any[], userId: string) => {
    try {
      return await binSystem.executeModuleAction(moduleName, action, params, userId);
    } catch (error) {
      throw error;
    }
  };

  const refreshSystemStatus = async () => {
    try {
      const status = binSystem.getSystemStatus();
      dispatch({
        type: 'UPDATE_SYSTEM_STATUS',
        payload: {
          isInitialized: status.isInitialized,
          totalModules: status.centralCoordinator.totalModules,
          activeUsers: status.centralCoordinator.activeUsers
        }
      });
    } catch (error) {
      console.error('Error refreshing system status:', error);
    }
  };

  // Efecto para inicializar y monitorear el sistema
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await refreshSystemStatus();
        
        // Configurar actualización periódica del estado
        const interval = setInterval(refreshSystemStatus, 5000);
        
        return () => clearInterval(interval);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeSystem();
  }, []);

  const value: BinContextType = {
    state,
    dispatch,
    selectModule,
    updateModuleStatus,
    getModuleById,
    loadModuleForUser,
    loadModuleGroup,
    executeModuleAction,
    refreshSystemStatus
  };

  return (
    <BinContext.Provider value={value}>
      {children}
    </BinContext.Provider>
  );
}

// Hook personalizado
export function useBinContext() {
  const context = useContext(BinContext);
  if (context === undefined) {
    throw new Error('useBinContext must be used within a BinProvider');
  }
  return context;
} 