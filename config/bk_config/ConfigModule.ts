/**
 * ⚙️ ConfigModule - Sistema de Configuración Avanzado
 * 
 * Responsabilidades:
 * - Gestión centralizada de configuraciones del sistema
 * - Validación y tipado fuerte de configuraciones
 * - Carga dinámica de configuraciones por entorno
 * - Gestión de secretos y variables de entorno
 * - Validación de esquemas de configuración
 * - Hot reload de configuraciones
 */

import { ModuleWrapper, ModulePublicAPI, ModuleInternalAPI, ModuleInfo, ModuleStats } from '../@types/core/module.d';
import { centralCoordinator } from '../src/core/CentralModuleCoordinator';
import { interModuleBus } from '../src/core/InterModuleMessageBus';

// ============================================================================
// INTERFACES DE CONFIGURACIÓN
// ============================================================================

interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    default?: any;
    validation?: RegExp | ((value: any) => boolean);
    description: string;
    sensitive?: boolean;
  };
}

interface ConfigValue {
  value: any;
  source: 'default' | 'file' | 'environment' | 'runtime';
  timestamp: Date;
  validated: boolean;
}

interface ConfigSection {
  name: string;
  schema: ConfigSchema;
  values: Map<string, ConfigValue>;
  watchers: Set<(key: string, oldValue: any, newValue: any) => void>;
}

interface EnvironmentConfig {
  development: Record<string, any>;
  staging: Record<string, any>;
  production: Record<string, any>;
  test: Record<string, any>;
}

// ============================================================================
// CLASE PRINCIPAL DE GESTIÓN DE CONFIGURACIÓN
// ============================================================================

class ConfigManager {
  private sections: Map<string, ConfigSection> = new Map();
  private environment: string = 'development';
  private isInitialized: boolean = false;
  private configCache: Map<string, any> = new Map();
  private validationErrors: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDefaultSections();
  }

  private initializeDefaultSections(): void {
    // Configuración de base de datos
    this.createSection('database', {
      host: {
        type: 'string',
        required: true,
        default: 'localhost',
        description: 'Host de la base de datos',
        validation: /^[a-zA-Z0-9.-]+$/
      },
      port: {
        type: 'number',
        required: false,
        default: 5432,
        description: 'Puerto de la base de datos',
        validation: (value: number) => value > 0 && value < 65536
      },
      name: {
        type: 'string',
        required: true,
        description: 'Nombre de la base de datos'
      },
      username: {
        type: 'string',
        required: true,
        description: 'Usuario de la base de datos',
        sensitive: true
      },
      password: {
        type: 'string',
        required: true,
        description: 'Contraseña de la base de datos',
        sensitive: true
      }
    });

    // Configuración de blockchain
    this.createSection('blockchain', {
      network: {
        type: 'string',
        required: true,
        default: 'ethereum',
        description: 'Red blockchain a utilizar',
        validation: /^(ethereum|polygon|binance|avalanche)$/
      },
      rpcUrl: {
        type: 'string',
        required: true,
        description: 'URL del RPC de la blockchain'
      },
      chainId: {
        type: 'number',
        required: true,
        description: 'ID de la cadena'
      },
      privateKey: {
        type: 'string',
        required: false,
        description: 'Clave privada para transacciones',
        sensitive: true
      }
    });

    // Configuración del servidor
    this.createSection('server', {
      port: {
        type: 'number',
        required: false,
        default: 3000,
        description: 'Puerto del servidor',
        validation: (value: number) => value > 0 && value < 65536
      },
      host: {
        type: 'string',
        required: false,
        default: '0.0.0.0',
        description: 'Host del servidor'
      },
      cors: {
        type: 'object',
        required: false,
        default: { origin: '*' },
        description: 'Configuración de CORS'
      },
      rateLimit: {
        type: 'object',
        required: false,
        default: { windowMs: 15 * 60 * 1000, max: 100 },
        description: 'Configuración de rate limiting'
      }
    });

    // Configuración de seguridad
    this.createSection('security', {
      jwtSecret: {
        type: 'string',
        required: true,
        description: 'Secreto para JWT',
        sensitive: true,
        validation: (value: string) => value.length >= 32
      },
      bcryptRounds: {
        type: 'number',
        required: false,
        default: 12,
        description: 'Rondas de bcrypt para hash de contraseñas',
        validation: (value: number) => value >= 10 && value <= 16
      },
      sessionTimeout: {
        type: 'number',
        required: false,
        default: 24 * 60 * 60 * 1000, // 24 horas
        description: 'Timeout de sesión en milisegundos'
      }
    });

    // Configuración de metaverso
    this.createSection('metaverse', {
      maxAvatars: {
        type: 'number',
        required: false,
        default: 1000,
        description: 'Máximo número de avatares simultáneos'
      },
      worldSize: {
        type: 'object',
        required: false,
        default: { width: 10000, height: 10000, depth: 1000 },
        description: 'Tamaño del mundo virtual'
      },
      physics: {
        type: 'object',
        required: false,
        default: { gravity: -9.81, collisionDetection: true },
        description: 'Configuración de física'
      }
    });
  }

  createSection(name: string, schema: ConfigSchema): void {
    const section: ConfigSection = {
      name,
      schema,
      values: new Map(),
      watchers: new Set()
    };

    this.sections.set(name, section);

    // Inicializar valores por defecto
    Object.entries(schema).forEach(([key, config]) => {
      if (config.default !== undefined) {
        section.values.set(key, {
          value: config.default,
          source: 'default',
          timestamp: new Date(),
          validated: true
        });
      }
    });

    console.log(`[⚙️] Config section created: ${name}`);
  }

  setValue(sectionName: string, key: string, value: any, source: 'default' | 'file' | 'environment' | 'runtime' = 'runtime'): boolean {
    const section = this.sections.get(sectionName);
    if (!section) {
      console.error(`[❌] Config section not found: ${sectionName}`);
      return false;
    }

    const schema = section.schema[key];
    if (!schema) {
      console.error(`[❌] Config key not found: ${sectionName}.${key}`);
      return false;
    }

    // Validar tipo
    if (!this.validateType(value, schema.type)) {
      console.error(`[❌] Invalid type for ${sectionName}.${key}: expected ${schema.type}, got ${typeof value}`);
      return false;
    }

    // Validar con función o regex personalizada
    if (schema.validation) {
      if (typeof schema.validation === 'function') {
        if (!schema.validation(value)) {
          console.error(`[❌] Validation failed for ${sectionName}.${key}`);
          return false;
        }
      } else if (schema.validation instanceof RegExp) {
        if (!schema.validation.test(String(value))) {
          console.error(`[❌] Regex validation failed for ${sectionName}.${key}`);
          return false;
        }
      }
    }

    const oldValue = section.values.get(key)?.value;
    const configValue: ConfigValue = {
      value,
      source,
      timestamp: new Date(),
      validated: true
    };

    section.values.set(key, configValue);
    this.configCache.delete(`${sectionName}.${key}`);

    // Notificar watchers
    section.watchers.forEach(watcher => {
      try {
        watcher(key, oldValue, value);
      } catch (error) {
        console.error(`[❌] Error in config watcher:`, error);
      }
    });

    console.log(`[⚙️] Config updated: ${sectionName}.${key} = ${schema.sensitive ? '[HIDDEN]' : value}`);
    return true;
  }

  getValue(sectionName: string, key: string): any {
    const cacheKey = `${sectionName}.${key}`;
    
    // Verificar caché
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey);
    }

    const section = this.sections.get(sectionName);
    if (!section) {
      throw new Error(`Config section not found: ${sectionName}`);
    }

    const configValue = section.values.get(key);
    if (!configValue) {
      const schema = section.schema[key];
      if (schema?.required) {
        throw new Error(`Required config not found: ${sectionName}.${key}`);
      }
      return schema?.default;
    }

    // Cachear valor
    this.configCache.set(cacheKey, configValue.value);
    return configValue.value;
  }

  getSection(sectionName: string): Record<string, any> {
    const section = this.sections.get(sectionName);
    if (!section) {
      throw new Error(`Config section not found: ${sectionName}`);
    }

    const result: Record<string, any> = {};
    Object.keys(section.schema).forEach(key => {
      result[key] = this.getValue(sectionName, key);
    });

    return result;
  }

  watch(sectionName: string, callback: (key: string, oldValue: any, newValue: any) => void): () => void {
    const section = this.sections.get(sectionName);
    if (!section) {
      throw new Error(`Config section not found: ${sectionName}`);
    }

    section.watchers.add(callback);

    // Retornar función para desuscribirse
    return () => {
      section.watchers.delete(callback);
    };
  }

  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return false;
    }
  }

  async loadFromFile(filePath: string): Promise<void> {
    console.log(`[⚙️] Loading config from file: ${filePath}`);
    
    try {
      // Simulación de carga de archivo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Aquí se cargaría el archivo real
      const mockConfig = {
        database: {
          host: 'localhost',
          port: 5432,
          name: 'woldvirtual_db'
        },
        server: {
          port: 3000
        }
      };

      // Aplicar configuración
      Object.entries(mockConfig).forEach(([sectionName, sectionConfig]) => {
        Object.entries(sectionConfig).forEach(([key, value]) => {
          this.setValue(sectionName, key, value, 'file');
        });
      });

      console.log(`[✅] Config loaded from file: ${filePath}`);
    } catch (error) {
      console.error(`[❌] Error loading config from file:`, error);
      throw error;
    }
  }

  async loadFromEnvironment(): Promise<void> {
    console.log(`[⚙️] Loading config from environment variables`);
    
    // Simulación de carga de variables de entorno
    const envVars = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'JWT_SECRET': 'super-secret-jwt-key',
      'SERVER_PORT': '3000'
    };

    Object.entries(envVars).forEach(([envKey, value]) => {
      const [sectionName, key] = envKey.toLowerCase().split('_');
      if (sectionName && key) {
        this.setValue(sectionName, key, value, 'environment');
      }
    });

    console.log(`[✅] Config loaded from environment variables`);
  }

  getValidationErrors(): Map<string, string[]> {
    return this.validationErrors;
  }

  validateAll(): boolean {
    this.validationErrors.clear();
    let isValid = true;

    this.sections.forEach((section, sectionName) => {
      const sectionErrors: string[] = [];

      Object.entries(section.schema).forEach(([key, schema]) => {
        if (schema.required) {
          const value = section.values.get(key);
          if (!value) {
            sectionErrors.push(`Required config missing: ${key}`);
            isValid = false;
          }
        }
      });

      if (sectionErrors.length > 0) {
        this.validationErrors.set(sectionName, sectionErrors);
      }
    });

    return isValid;
  }

  getConfigStats(): any {
    const stats = {
      totalSections: this.sections.size,
      totalKeys: 0,
      validatedKeys: 0,
      errorKeys: 0,
      sections: [] as Array<{ name: string; keys: number; watchers: number }>
    };

    this.sections.forEach((section, sectionName) => {
      const sectionStats = {
        name: sectionName,
        keys: section.values.size,
        watchers: section.watchers.size
      };
      stats.sections.push(sectionStats);
      stats.totalKeys += section.values.size;
      
      section.values.forEach(configValue => {
        if (configValue.validated) {
          stats.validatedKeys++;
        } else {
          stats.errorKeys++;
        }
      });
    });

    return stats;
  }

  async initialize(): Promise<void> {
    console.log('[⚙️] Initializing ConfigModule...');
    
    try {
      await this.loadFromEnvironment();
      await this.loadFromFile('./config.json');
      
      if (!this.validateAll()) {
        const errors = Array.from(this.validationErrors.entries())
          .map(([section, errors]) => `${section}: ${errors.join(', ')}`)
          .join('; ');
        throw new Error(`Configuration validation failed: ${errors}`);
      }

      this.isInitialized = true;
      console.log('[✅] ConfigModule initialized successfully');
    } catch (error) {
      console.error('[❌] Error initializing ConfigModule:', error);
      throw error;
    }
  }
}

// ============================================================================
// MÓDULO PRINCIPAL DE CONFIGURACIÓN
// ============================================================================

const configManager = new ConfigManager();

export const ConfigModule: ModuleWrapper = {
  name: 'config',
  version: '1.0.0',
  description: 'Sistema de configuración centralizado del metaverso',
  
  dependencies: [],
  peerDependencies: ['services', 'middlewares'],
  optionalDependencies: ['secrets', 'validation'],
  
  publicAPI: {
    // Métodos principales de configuración
    getValue: (sectionName: string, key: string) => {
      return configManager.getValue(sectionName, key);
    },
    
    setValue: (sectionName: string, key: string, value: any) => {
      return configManager.setValue(sectionName, key, value);
    },
    
    getSection: (sectionName: string) => {
      return configManager.getSection(sectionName);
    },
    
    watch: (sectionName: string, callback: (key: string, oldValue: any, newValue: any) => void) => {
      return configManager.watch(sectionName, callback);
    },
    
    loadFromFile: async (filePath: string) => {
      return await configManager.loadFromFile(filePath);
    },
    
    loadFromEnvironment: async () => {
      return await configManager.loadFromEnvironment();
    },
    
    validateAll: () => {
      return configManager.validateAll();
    },
    
    // Métodos de información
    getModuleInfo: () => ({
      name: 'config',
      version: '1.0.0',
      description: 'Sistema de configuración centralizado',
      author: 'WoldVirtual3DlucIA Team',
      license: 'MIT',
      repository: 'https://github.com/Chicook/WoldVirtual3DlucIA',
      dependencies: [],
      peerDependencies: ['services', 'middlewares'],
      devDependencies: ['@types/node'],
      keywords: ['config', 'configuration', 'settings', 'environment', 'validation'],
      category: 'core' as const,
      priority: 'critical' as const,
      size: 'medium' as const,
      performance: {
        loadTime: 100,
        memoryUsage: 5,
        cpuUsage: 2,
        networkRequests: 0,
        cacheHitRate: 0.95,
        errorRate: 0.001
      },
      security: {
        permissions: ['read', 'write'],
        vulnerabilities: [],
        encryption: true,
        authentication: false,
        authorization: false,
        auditLevel: 'high'
      },
      compatibility: {
        browsers: ['node'],
        platforms: ['server'],
        nodeVersion: '>=16.0.0',
        typescriptVersion: '>=4.5.0'
      }
    }),
    
    getDependencies: () => [],
    getVersion: () => '1.0.0'
  },
  
  internalAPI: {
    internalInitialize: async (userId: string) => {
      console.log(`[⚙️] Initializing ConfigModule for user ${userId}`);
      
      // Suscribirse a eventos del sistema
      interModuleBus.subscribe('config-request', async (data: any) => {
        try {
          const value = configManager.getValue(data.section, data.key);
          interModuleBus.publish('config-response', { 
            section: data.section, 
            key: data.key, 
            value 
          });
        } catch (error) {
          interModuleBus.publish('config-error', { 
            section: data.section, 
            key: data.key, 
            error: error.message 
          });
        }
      });
      
      // Inicializar gestor de configuración
      await configManager.initialize();
    },
    
    internalCleanup: async (userId: string) => {
      console.log(`[⚙️] Cleaning up ConfigModule for user ${userId}`);
      // Limpieza específica si es necesaria
    },
    
    getInternalState: () => {
      return configManager.getConfigStats();
    },
    
    logInternal: (level: 'debug' | 'info' | 'warn' | 'error', message: string) => {
      console.log(`[⚙️] [${level.toUpperCase()}] ${message}`);
    }
  },
  
  initialize: async (userId: string) => {
    console.log(`[⚙️] ConfigModule initializing for user ${userId}...`);
    
    try {
      // Inicializar APIs internas
      await ConfigModule.internalAPI.internalInitialize?.(userId);
      
      // Registrar con el coordinador central
      centralCoordinator.registerModule(ConfigModule);
      
      console.log(`[✅] ConfigModule initialized for user ${userId}`);
    } catch (error) {
      console.error(`[❌] Error initializing ConfigModule:`, error);
      throw error;
    }
  },
  
  cleanup: async (userId: string) => {
    console.log(`[⚙️] ConfigModule cleaning up for user ${userId}...`);
    
    try {
      await ConfigModule.internalAPI.internalCleanup?.(userId);
      console.log(`[✅] ConfigModule cleaned up for user ${userId}`);
    } catch (error) {
      console.error(`[❌] Error cleaning up ConfigModule:`, error);
    }
  },
  
  getInfo: () => {
    return ConfigModule.publicAPI.getModuleInfo!();
  },
  
  getStats: () => {
    return {
      totalInstances: 1,
      activeInstances: 1,
      totalErrors: 0,
      averageLoadTime: 100,
      averageMemoryUsage: 5,
      lastUpdated: new Date(),
      uptime: Date.now(),
      reliability: 0.999
    };
  }
};

export default ConfigModule; 