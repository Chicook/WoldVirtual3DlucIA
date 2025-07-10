/**
 * Configuración del Motor 3D
 * Permite desactivar la conexión WebSocket en modo desarrollo
 */

export interface EngineConfig {
  // Configuración de conexión
  connection: {
    enabled: boolean;
    autoConnect: boolean;
    retryOnError: boolean;
    maxRetries: number;
    retryDelay: number;
  };
  
  // Configuración del servidor
  server: {
    url: string;
    port: number;
    protocol: 'ws' | 'wss';
    timeout: number;
  };
  
  // Configuración de desarrollo
  development: {
    offlineMode: boolean;
    mockResponses: boolean;
    debugLogging: boolean;
  };
}

// Configuración por defecto para desarrollo
export const defaultEngineConfig: EngineConfig = {
  connection: {
    enabled: false, // Desactivado en desarrollo
    autoConnect: false,
    retryOnError: false,
    maxRetries: 0,
    retryDelay: 1000,
  },
  
  server: {
    url: 'localhost',
    port: 8080,
    protocol: 'ws',
    timeout: 3000,
  },
  
  development: {
    offlineMode: true, // Modo offline activado
    mockResponses: true,
    debugLogging: false,
  },
};

// Configuración para producción
export const productionEngineConfig: EngineConfig = {
  connection: {
    enabled: true,
    autoConnect: true,
    retryOnError: true,
    maxRetries: 5,
    retryDelay: 2000,
  },
  
  server: {
    url: 'localhost',
    port: 8080,
    protocol: 'ws',
    timeout: 10000,
  },
  
  development: {
    offlineMode: false,
    mockResponses: false,
    debugLogging: false,
  },
};

// Obtener configuración según el entorno
export function getEngineConfig(): EngineConfig {
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.NODE_ENV === 'dev' ||
                       !process.env.NODE_ENV;
  
  return isDevelopment ? defaultEngineConfig : productionEngineConfig;
}

// Función para verificar si la conexión está habilitada
export function isConnectionEnabled(): boolean {
  const config = getEngineConfig();
  return config.connection.enabled && !config.development.offlineMode;
}

// Función para verificar si estamos en modo offline
export function isOfflineMode(): boolean {
  const config = getEngineConfig();
  return config.development.offlineMode || !config.connection.enabled;
} 