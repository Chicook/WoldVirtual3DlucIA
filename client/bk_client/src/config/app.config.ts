export interface AppConfig {
  // Configuración general
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debug: boolean;
  };

  // Configuración de Web3
  web3: {
    defaultNetwork: string;
    supportedNetworks: string[];
    contractAddresses: Record<string, string>;
    gasLimit: number;
    gasPrice: number;
  };

  // Configuración de Ready Player Me
  readyPlayerMe: {
    subdomain: string;
    apiKey: string;
    enabled: boolean;
  };

  // Configuración de Three.js
  threejs: {
    antialias: boolean;
    shadowMap: boolean;
    pixelRatio: number;
    maxFPS: number;
    enableVR: boolean;
  };

  // Configuración de UI
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    animations: boolean;
    soundEnabled: boolean;
  };

  // Configuración de API
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };

  // Configuración de WebSocket
  websocket: {
    url: string;
    reconnectAttempts: number;
    reconnectInterval: number;
  };
}

// Configuración por defecto
const defaultConfig: AppConfig = {
  app: {
    name: 'Metaverso Crypto World',
    version: '2.0.0',
    environment: (process.env.NODE_ENV as any) || 'development',
    debug: process.env.NODE_ENV === 'development'
  },

  web3: {
    defaultNetwork: process.env.VITE_CHAIN_ID || '1',
    supportedNetworks: ['1', '137', '56', '43114'],
    contractAddresses: {
      '1': process.env.VITE_CONTRACT_ADDRESS || '',
      '137': process.env.VITE_POLYGON_CONTRACT_ADDRESS || '',
      '56': process.env.VITE_BSC_CONTRACT_ADDRESS || '',
      '43114': process.env.VITE_AVALANCHE_CONTRACT_ADDRESS || ''
    },
    gasLimit: 300000,
    gasPrice: 20
  },

  readyPlayerMe: {
    subdomain: process.env.VITE_RPM_SUBDOMAIN || '',
    apiKey: process.env.VITE_RPM_API_KEY || '',
    enabled: !!process.env.VITE_RPM_SUBDOMAIN
  },

  threejs: {
    antialias: true,
    shadowMap: true,
    pixelRatio: window.devicePixelRatio || 1,
    maxFPS: 60,
    enableVR: false
  },

  ui: {
    theme: 'dark',
    language: 'es',
    animations: true,
    soundEnabled: true
  },

  api: {
    baseUrl: process.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 10000,
    retries: 3
  },

  websocket: {
    url: process.env.VITE_WS_URL || 'ws://localhost:8000',
    reconnectAttempts: 5,
    reconnectInterval: 3000
  }
};

// Clase de configuración
class ConfigManager {
  private config: AppConfig;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.config = this.loadConfig();
  }

  // Cargar configuración
  private loadConfig(): AppConfig {
    try {
      // Intentar cargar desde localStorage
      const savedConfig = localStorage.getItem('metaverso_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        return { ...defaultConfig, ...parsed };
      }
    } catch (error) {
      console.warn('Error loading saved config, using default:', error);
    }

    return defaultConfig;
  }

  // Guardar configuración
  private saveConfig(): void {
    try {
      localStorage.setItem('metaverso_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Error saving config:', error);
    }
  }

  // Obtener configuración completa
  get(): AppConfig {
    return { ...this.config };
  }

  // Obtener sección específica
  getSection<K extends keyof AppConfig>(section: K): AppConfig[K] {
    return { ...this.config[section] };
  }

  // Actualizar configuración
  update(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    this.notifyListeners('config', this.config);
  }

  // Actualizar sección específica
  updateSection<K extends keyof AppConfig>(
    section: K, 
    updates: Partial<AppConfig[K]>
  ): void {
    this.config[section] = { ...this.config[section], ...updates };
    this.saveConfig();
    this.notifyListeners(section, this.config[section]);
  }

  // Resetear configuración
  reset(): void {
    this.config = { ...defaultConfig };
    this.saveConfig();
    this.notifyListeners('config', this.config);
  }

  // Suscribirse a cambios
  subscribe(section: string, callback: Function): () => void {
    if (!this.listeners.has(section)) {
      this.listeners.set(section, []);
    }
    
    this.listeners.get(section)!.push(callback);
    
    // Retornar función para desuscribirse
    return () => {
      const callbacks = this.listeners.get(section);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Notificar listeners
  private notifyListeners(section: string, data: any): void {
    const callbacks = this.listeners.get(section);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in config listener:', error);
        }
      });
    }
  }

  // Validar configuración
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar Web3
    if (!this.config.web3.defaultNetwork) {
      errors.push('Red por defecto no configurada');
    }

    // Validar Ready Player Me si está habilitado
    if (this.config.readyPlayerMe.enabled && !this.config.readyPlayerMe.subdomain) {
      errors.push('Subdomain de Ready Player Me no configurado');
    }

    // Validar API
    if (!this.config.api.baseUrl) {
      errors.push('URL de API no configurada');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Obtener configuración para desarrollo
  getDevConfig(): any {
    if (this.config.app.environment !== 'development') {
      return null;
    }

    return {
      config: this.config,
      validation: this.validate(),
      stats: {
        totalSections: Object.keys(this.config).length,
        listeners: Array.from(this.listeners.entries()).map(([section, callbacks]) => ({
          section,
          callbacks: callbacks.length
        }))
      }
    };
  }
}

// Instancia global
export const configManager = new ConfigManager();

// Hook de React para usar configuración
export const useConfig = () => {
  return {
    config: configManager.get(),
    update: configManager.update.bind(configManager),
    updateSection: configManager.updateSection.bind(configManager),
    reset: configManager.reset.bind(configManager),
    subscribe: configManager.subscribe.bind(configManager),
    validate: configManager.validate.bind(configManager)
  };
};

// Exportar configuración por defecto
export { defaultConfig }; 