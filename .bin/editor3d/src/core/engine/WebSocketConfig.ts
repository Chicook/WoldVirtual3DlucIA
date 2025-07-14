//! WebSocketConfig.ts - Configuración Avanzada de WebSocket
//! 
//! Este archivo proporciona configuraciones optimizadas para WebSocket
//! que solucionan los problemas de conexión y recursos insuficientes.

/// Configuración de WebSocket para diferentes entornos
export interface WebSocketEnvironmentConfig {
  /// Configuración de desarrollo
  development: WebSocketConfig;
  
  /// Configuración de producción
  production: WebSocketConfig;
  
  /// Configuración de testing
  testing: WebSocketConfig;
  
  /// Configuración de staging
  staging: WebSocketConfig;
}

/// Configuración específica de WebSocket
export interface WebSocketConfig {
  /// Configuración de conexión
  connection: {
    url: string;
    port: number;
    protocol: 'ws' | 'wss';
    timeout: number;
    maxRetries: number;
    retryDelay: number;
    keepAlive: boolean;
    keepAliveInterval: number;
    pingInterval: number;
    pongTimeout: number;
  };
  
  /// Configuración de recursos
  resources: {
    maxConnections: number;
    connectionPool: boolean;
    poolSize: number;
    memoryLimit: number;
    cpuLimit: number;
    bandwidthLimit: number;
  };
  
  /// Configuración de seguridad
  security: {
    ssl: boolean;
    sslVerify: boolean;
    authentication: boolean;
    token?: string;
    allowedOrigins: string[];
    rateLimit: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
    };
  };
  
  /// Configuración de rendimiento
  performance: {
    compression: boolean;
    binaryType: 'blob' | 'arraybuffer';
    maxMessageSize: number;
    bufferSize: number;
    autoReconnect: boolean;
    reconnectAttempts: number;
    reconnectInterval: number;
  };
  
  /// Configuración de logging
  logging: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug';
    includeTimestamps: boolean;
    includeStackTraces: boolean;
  };
}

/// Configuraciones predefinidas por entorno
export const WEBSOCKET_ENVIRONMENTS: WebSocketEnvironmentConfig = {
  development: {
    connection: {
      url: 'localhost',
      port: 8080,
      protocol: 'ws',
      timeout: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      keepAlive: true,
      keepAliveInterval: 30000,
      pingInterval: 25000,
      pongTimeout: 10000
    },
    resources: {
      maxConnections: 5,
      connectionPool: false,
      poolSize: 2,
      memoryLimit: 256, // MB
      cpuLimit: 50, // %
      bandwidthLimit: 1024 // KB/s
    },
    security: {
      ssl: false,
      sslVerify: false,
      authentication: false,
      allowedOrigins: ['*'],
      rateLimit: {
        enabled: false,
        maxRequests: 1000,
        windowMs: 60000
      }
    },
    performance: {
      compression: false,
      binaryType: 'blob',
      maxMessageSize: 1024 * 1024, // 1MB
      bufferSize: 8192,
      autoReconnect: true,
      reconnectAttempts: 5,
      reconnectInterval: 2000
    },
    logging: {
      enabled: true,
      level: 'debug',
      includeTimestamps: true,
      includeStackTraces: true
    }
  },
  
  production: {
    connection: {
      url: 'woldvirtual3d.com',
      port: 443,
      protocol: 'wss',
      timeout: 10000,
      maxRetries: 5,
      retryDelay: 2000,
      keepAlive: true,
      keepAliveInterval: 30000,
      pingInterval: 25000,
      pongTimeout: 10000
    },
    resources: {
      maxConnections: 100,
      connectionPool: true,
      poolSize: 20,
      memoryLimit: 2048, // MB
      cpuLimit: 80, // %
      bandwidthLimit: 10240 // KB/s
    },
    security: {
      ssl: true,
      sslVerify: true,
      authentication: true,
      allowedOrigins: ['https://woldvirtual3d.com', 'https://www.woldvirtual3d.com'],
      rateLimit: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000
      }
    },
    performance: {
      compression: true,
      binaryType: 'arraybuffer',
      maxMessageSize: 10 * 1024 * 1024, // 10MB
      bufferSize: 32768,
      autoReconnect: true,
      reconnectAttempts: 10,
      reconnectInterval: 5000
    },
    logging: {
      enabled: true,
      level: 'warn',
      includeTimestamps: true,
      includeStackTraces: false
    }
  },
  
  testing: {
    connection: {
      url: 'localhost',
      port: 8081,
      protocol: 'ws',
      timeout: 2000,
      maxRetries: 2,
      retryDelay: 500,
      keepAlive: false,
      keepAliveInterval: 60000,
      pingInterval: 30000,
      pongTimeout: 5000
    },
    resources: {
      maxConnections: 2,
      connectionPool: false,
      poolSize: 1,
      memoryLimit: 128, // MB
      cpuLimit: 30, // %
      bandwidthLimit: 512 // KB/s
    },
    security: {
      ssl: false,
      sslVerify: false,
      authentication: false,
      allowedOrigins: ['*'],
      rateLimit: {
        enabled: false,
        maxRequests: 10000,
        windowMs: 60000
      }
    },
    performance: {
      compression: false,
      binaryType: 'blob',
      maxMessageSize: 512 * 1024, // 512KB
      bufferSize: 4096,
      autoReconnect: false,
      reconnectAttempts: 1,
      reconnectInterval: 1000
    },
    logging: {
      enabled: false,
      level: 'error',
      includeTimestamps: false,
      includeStackTraces: false
    }
  },
  
  staging: {
    connection: {
      url: 'staging.woldvirtual3d.com',
      port: 443,
      protocol: 'wss',
      timeout: 8000,
      maxRetries: 4,
      retryDelay: 1500,
      keepAlive: true,
      keepAliveInterval: 30000,
      pingInterval: 25000,
      pongTimeout: 10000
    },
    resources: {
      maxConnections: 50,
      connectionPool: true,
      poolSize: 10,
      memoryLimit: 1024, // MB
      cpuLimit: 60, // %
      bandwidthLimit: 5120 // KB/s
    },
    security: {
      ssl: true,
      sslVerify: true,
      authentication: true,
      allowedOrigins: ['https://staging.woldvirtual3d.com'],
      rateLimit: {
        enabled: true,
        maxRequests: 200,
        windowMs: 60000
      }
    },
    performance: {
      compression: true,
      binaryType: 'arraybuffer',
      maxMessageSize: 5 * 1024 * 1024, // 5MB
      bufferSize: 16384,
      autoReconnect: true,
      reconnectAttempts: 7,
      reconnectInterval: 3000
    },
    logging: {
      enabled: true,
      level: 'info',
      includeTimestamps: true,
      includeStackTraces: true
    }
  }
};

/// Clase para gestionar configuraciones de WebSocket
export class WebSocketConfigManager {
  private static instance: WebSocketConfigManager;
  private currentEnvironment: keyof WebSocketEnvironmentConfig = 'development';
  private customConfigs: Map<string, WebSocketConfig> = new Map();

  private constructor() {}

  static getInstance(): WebSocketConfigManager {
    if (!WebSocketConfigManager.instance) {
      WebSocketConfigManager.instance = new WebSocketConfigManager();
    }
    return WebSocketConfigManager.instance;
  }

  /// Obtener configuración para el entorno actual
  getCurrentConfig(): WebSocketConfig {
    return WEBSOCKET_ENVIRONMENTS[this.currentEnvironment];
  }

  /// Cambiar entorno
  setEnvironment(environment: keyof WebSocketEnvironmentConfig): void {
    this.currentEnvironment = environment;
    console.log(`🌍 Cambiando entorno WebSocket a: ${environment}`);
  }

  /// Obtener configuración para un entorno específico
  getConfig(environment: keyof WebSocketEnvironmentConfig): WebSocketConfig {
    return WEBSOCKET_ENVIRONMENTS[environment];
  }

  /// Añadir configuración personalizada
  addCustomConfig(name: string, config: WebSocketConfig): void {
    this.customConfigs.set(name, config);
    console.log(`⚙️ Configuración personalizada añadida: ${name}`);
  }

  /// Obtener configuración personalizada
  getCustomConfig(name: string): WebSocketConfig | undefined {
    return this.customConfigs.get(name);
  }

  /// Validar configuración
  validateConfig(config: WebSocketConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar conexión
    if (config.connection.timeout <= 0) {
      errors.push('Connection timeout must be greater than 0');
    }
    if (config.connection.maxRetries < 0) {
      errors.push('Max retries must be non-negative');
    }
    if (config.connection.keepAliveInterval <= 0) {
      errors.push('Keep alive interval must be greater than 0');
    }

    // Validar recursos
    if (config.resources.maxConnections <= 0) {
      errors.push('Max connections must be greater than 0');
    }
    if (config.resources.memoryLimit <= 0) {
      errors.push('Memory limit must be greater than 0');
    }
    if (config.resources.cpuLimit <= 0 || config.resources.cpuLimit > 100) {
      errors.push('CPU limit must be between 1 and 100');
    }

    // Validar rendimiento
    if (config.performance.maxMessageSize <= 0) {
      errors.push('Max message size must be greater than 0');
    }
    if (config.performance.bufferSize <= 0) {
      errors.push('Buffer size must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /// Optimizar configuración para el sistema actual
  optimizeForSystem(): WebSocketConfig {
    const baseConfig = this.getCurrentConfig();
    const optimizedConfig = { ...baseConfig };

    // Detectar capacidades del sistema
    const systemMemory = this.getSystemMemory();
    const systemCPU = this.getSystemCPU();
    const networkSpeed = this.getNetworkSpeed();

    // Ajustar límites de memoria
    if (systemMemory < 2048) { // Menos de 2GB
      optimizedConfig.resources.memoryLimit = Math.min(256, systemMemory * 0.1);
    } else if (systemMemory < 8192) { // Menos de 8GB
      optimizedConfig.resources.memoryLimit = Math.min(1024, systemMemory * 0.15);
    } else { // 8GB o más
      optimizedConfig.resources.memoryLimit = Math.min(2048, systemMemory * 0.2);
    }

    // Ajustar límites de CPU
    if (systemCPU < 2) {
      optimizedConfig.resources.cpuLimit = 30;
    } else if (systemCPU < 4) {
      optimizedConfig.resources.cpuLimit = 50;
    } else {
      optimizedConfig.resources.cpuLimit = 70;
    }

    // Ajustar configuración de red
    if (networkSpeed < 10) { // Menos de 10 Mbps
      optimizedConfig.performance.compression = true;
      optimizedConfig.resources.bandwidthLimit = 512;
    } else if (networkSpeed < 100) { // Menos de 100 Mbps
      optimizedConfig.resources.bandwidthLimit = 2048;
    } else { // 100 Mbps o más
      optimizedConfig.resources.bandwidthLimit = 10240;
    }

    console.log('🔧 Configuración optimizada para el sistema actual');
    return optimizedConfig;
  }

  /// Detectar memoria del sistema (simulado)
  private getSystemMemory(): number {
    // En un entorno real, esto detectaría la memoria real del sistema
    return 4096; // 4GB por defecto
  }

  /// Detectar CPU del sistema (simulado)
  private getSystemCPU(): number {
    // En un entorno real, esto detectaría los núcleos reales del sistema
    return 4; // 4 núcleos por defecto
  }

  /// Detectar velocidad de red (simulado)
  private getNetworkSpeed(): number {
    // En un entorno real, esto detectaría la velocidad real de la red
    return 100; // 100 Mbps por defecto
  }

  /// Crear URL de conexión
  createConnectionUrl(config: WebSocketConfig): string {
    const { url, port, protocol } = config.connection;
    return `${protocol}://${url}:${port}`;
  }

  /// Crear configuración para desarrollo local
  createLocalConfig(port: number = 8080): WebSocketConfig {
    return {
      connection: {
        url: 'localhost',
        port,
        protocol: 'ws',
        timeout: 5000,
        maxRetries: 3,
        retryDelay: 1000,
        keepAlive: true,
        keepAliveInterval: 30000,
        pingInterval: 25000,
        pongTimeout: 10000
      },
      resources: {
        maxConnections: 5,
        connectionPool: false,
        poolSize: 2,
        memoryLimit: 256,
        cpuLimit: 50,
        bandwidthLimit: 1024
      },
      security: {
        ssl: false,
        sslVerify: false,
        authentication: false,
        allowedOrigins: ['*'],
        rateLimit: {
          enabled: false,
          maxRequests: 1000,
          windowMs: 60000
        }
      },
      performance: {
        compression: false,
        binaryType: 'blob',
        maxMessageSize: 1024 * 1024,
        bufferSize: 8192,
        autoReconnect: true,
        reconnectAttempts: 5,
        reconnectInterval: 2000
      },
      logging: {
        enabled: true,
        level: 'debug',
        includeTimestamps: true,
        includeStackTraces: true
      }
    };
  }

  /// Crear configuración para producción
  createProductionConfig(domain: string): WebSocketConfig {
    return {
      connection: {
        url: domain,
        port: 443,
        protocol: 'wss',
        timeout: 10000,
        maxRetries: 5,
        retryDelay: 2000,
        keepAlive: true,
        keepAliveInterval: 30000,
        pingInterval: 25000,
        pongTimeout: 10000
      },
      resources: {
        maxConnections: 100,
        connectionPool: true,
        poolSize: 20,
        memoryLimit: 2048,
        cpuLimit: 80,
        bandwidthLimit: 10240
      },
      security: {
        ssl: true,
        sslVerify: true,
        authentication: true,
        allowedOrigins: [`https://${domain}`, `https://www.${domain}`],
        rateLimit: {
          enabled: true,
          maxRequests: 100,
          windowMs: 60000
        }
      },
      performance: {
        compression: true,
        binaryType: 'arraybuffer',
        maxMessageSize: 10 * 1024 * 1024,
        bufferSize: 32768,
        autoReconnect: true,
        reconnectAttempts: 10,
        reconnectInterval: 5000
      },
      logging: {
        enabled: true,
        level: 'warn',
        includeTimestamps: true,
        includeStackTraces: false
      }
    };
  }
}

/// Utilidades para WebSocket
export class WebSocketUtils {
  /// Verificar si WebSocket está disponible
  static isWebSocketSupported(): boolean {
    return typeof WebSocket !== 'undefined';
  }

  /// Verificar si la conexión está activa
  static isConnectionActive(ws: WebSocket): boolean {
    return ws.readyState === WebSocket.OPEN;
  }

  /// Obtener estado de la conexión como string
  static getConnectionState(ws: WebSocket): string {
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  /// Crear conexión WebSocket con configuración
  static createConnection(config: WebSocketConfig): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        const url = WebSocketConfigManager.getInstance().createConnectionUrl(config);
        const ws = new WebSocket(url);

        // Configurar timeout
        const timeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            ws.close();
            reject(new Error('Connection timeout'));
          }
        }, config.connection.timeout);

        ws.onopen = () => {
          clearTimeout(timeout);
          
          // Configurar binary type
          ws.binaryType = config.performance.binaryType;
          
          resolve(ws);
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error(`WebSocket error: ${error}`));
        };

      } catch (error) {
        reject(new Error(`Failed to create WebSocket: ${error}`));
      }
    });
  }

  /// Enviar mensaje con retry
  static async sendMessageWithRetry(
    ws: WebSocket, 
    message: string | ArrayBuffer | Blob, 
    maxRetries: number = 3
  ): Promise<void> {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        if (WebSocketUtils.isConnectionActive(ws)) {
          ws.send(message);
          return;
        } else {
          throw new Error('Connection not active');
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          throw new Error(`Failed to send message after ${maxRetries} attempts: ${error}`);
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  /// Crear ping/pong para keep-alive
  static createKeepAlive(ws: WebSocket, interval: number): () => void {
    const pingInterval = setInterval(() => {
      if (WebSocketUtils.isConnectionActive(ws)) {
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, interval);

    return () => clearInterval(pingInterval);
  }

  /// Detectar problemas de conexión
  static detectConnectionIssues(ws: WebSocket): string[] {
    const issues: string[] = [];
    
    if (!WebSocketUtils.isWebSocketSupported()) {
      issues.push('WebSocket not supported in this environment');
    }
    
    if (ws.readyState === WebSocket.CLOSED) {
      issues.push('Connection is closed');
    }
    
    if (ws.readyState === WebSocket.CLOSING) {
      issues.push('Connection is closing');
    }
    
    return issues;
  }

  /// Obtener estadísticas de la conexión
  static getConnectionStats(ws: WebSocket): {
    state: string;
    bufferedAmount: number;
    protocol: string;
    url: string;
  } {
    return {
      state: WebSocketUtils.getConnectionState(ws),
      bufferedAmount: ws.bufferedAmount,
      protocol: ws.protocol,
      url: ws.url
    };
  }
}

/// Configuración por defecto para el editor 3D
export const EDITOR_WEBSOCKET_CONFIG: WebSocketConfig = {
  connection: {
    url: 'localhost',
    port: 8080,
    protocol: 'ws',
    timeout: 8000,
    maxRetries: 5,
    retryDelay: 1500,
    keepAlive: true,
    keepAliveInterval: 30000,
    pingInterval: 25000,
    pongTimeout: 10000
  },
  resources: {
    maxConnections: 10,
    connectionPool: true,
    poolSize: 5,
    memoryLimit: 512,
    cpuLimit: 60,
    bandwidthLimit: 2048
  },
  security: {
    ssl: false,
    sslVerify: false,
    authentication: false,
    allowedOrigins: ['*'],
    rateLimit: {
      enabled: false,
      maxRequests: 1000,
      windowMs: 60000
    }
  },
  performance: {
    compression: true,
    binaryType: 'arraybuffer',
    maxMessageSize: 5 * 1024 * 1024,
    bufferSize: 16384,
    autoReconnect: true,
    reconnectAttempts: 7,
    reconnectInterval: 3000
  },
  logging: {
    enabled: true,
    level: 'info',
    includeTimestamps: true,
    includeStackTraces: true
  }
};

/// Exportar instancia global del config manager
export const webSocketConfigManager = WebSocketConfigManager.getInstance(); 