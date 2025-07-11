import React, { ComponentType, LazyExoticComponent } from 'react';

// Interfaces fundamentales
export interface ModulePublicAPI {
  getComponent?: (name: string) => LazyExoticComponent<ComponentType<any>> | null;
  getStatus?: () => { status: string; details: any };
  getMetrics?: () => { performance: number; errors: number; uptime: number };
}

export interface ModuleWrapper {
  name: string;
  dependencies: string[];
  publicAPI: ModulePublicAPI;
  initialize: (userId: string) => Promise<void>;
  cleanup?: (userId: string) => Promise<void>;
  status: 'idle' | 'loading' | 'active' | 'error';
  lastActivity: Date;
}

// Grupos de módulos por funcionalidad
export const ModuleGroups = {
  CORE: ['config', 'data', 'models', 'services', 'middlewares'],
  FRONTEND: ['web', 'pages', 'components', 'css', 'fonts', 'public'],
  BLOCKCHAIN: ['bloc', 'assets', 'entities'],
  AI: ['ini', 'js', 'test'],
  UTILITIES: ['helpers', 'cli', 'scripts', 'lib', 'languages'],
  MEDIA: ['image', 'fonts', 'css', 'public'],
  EDITOR: ['.bin', 'client', 'src'],
  INFRASTRUCTURE: ['build', 'dist', 'coverage', 'docs', 'Include']
};

// Coordinador central de módulos
export class CentralModuleCoordinator {
  private static instance: CentralModuleCoordinator;
  private modules = new Map<string, ModuleWrapper>();
  private componentRegistry = new Map<string, LazyExoticComponent<ComponentType<any>>>();
  private userActiveModules = new Map<string, Set<string>>();
  private moduleLoaders = new Map<string, () => Promise<any>>();

  // Singleton pattern
  static getInstance(): CentralModuleCoordinator {
    if (!CentralModuleCoordinator.instance) {
      CentralModuleCoordinator.instance = new CentralModuleCoordinator();
    }
    return CentralModuleCoordinator.instance;
  }

  constructor() {
    this.initializeModuleLoaders();
  }

  // Inicializar cargadores de módulos
  private initializeModuleLoaders(): void {
    const loaders = {
      // Módulos que existen o pueden existir
      'assets': () => import('../modules/AssetsModule'),
      'bloc': () => import('../modules/BlockchainModule'),
      'client': () => import('../modules/ClientModule'),
      'components': () => import('../modules/ComponentsModule'),
      'config': () => import('../modules/ConfigModule'),
      'entities': () => import('../modules/EntitiesModule'),
      'fonts': () => import('../modules/FontsModule'),
      'helpers': () => import('../modules/HelpersModule'),
      'image': () => import('../modules/ImageModule'),
      'ini': () => import('../modules/IniModule'),
      'web': () => import('../modules/WebModule')
    };

    Object.entries(loaders).forEach(([name, loader]) => {
      this.moduleLoaders.set(name, loader);
    });
  }

  // Cargar un módulo específico
  async loadModule(moduleName: string, userId: string): Promise<ModuleWrapper | null> {
    try {
      console.log(`[CentralModuleCoordinator] Cargando módulo: ${moduleName}`);
      
      if (this.modules.has(moduleName)) {
        const module = this.modules.get(moduleName)!;
        if (module.status === 'active') {
          return module;
        }
      }

      const loader = this.moduleLoaders.get(moduleName);
      if (!loader) {
        console.warn(`[CentralModuleCoordinator] No se encontró cargador para: ${moduleName}, creando stub`);
        
        // Crear un módulo stub para módulos no implementados
        const stubModule: ModuleWrapper = {
          name: moduleName,
          dependencies: [],
          publicAPI: {
            getStatus: () => ({ status: 'stub', details: { message: 'Módulo no implementado' } }),
            getMetrics: () => ({ performance: 0, errors: 0, uptime: 0 })
          },
          initialize: async () => {
            console.log(`[CentralModuleCoordinator] Inicializando stub para: ${moduleName}`);
          },
          status: 'active',
          lastActivity: new Date()
        };
        
        this.modules.set(moduleName, stubModule);
        
        // Registrar módulo activo para el usuario
        if (!this.userActiveModules.has(userId)) {
          this.userActiveModules.set(userId, new Set());
        }
        this.userActiveModules.get(userId)!.add(moduleName);
        
        return stubModule;
      }

      // Marcar como cargando
      const tempModule: ModuleWrapper = {
        name: moduleName,
        dependencies: [],
        publicAPI: {},
        initialize: async () => {},
        status: 'loading',
        lastActivity: new Date()
      };
      this.modules.set(moduleName, tempModule);

      // Cargar el módulo
      const moduleData = await loader();
      const module = moduleData.default || moduleData;

      if (!module || typeof module !== 'object') {
        throw new Error(`Módulo ${moduleName} no exporta correctamente`);
      }

      // Actualizar el módulo con datos reales
      const finalModule: ModuleWrapper = {
        ...tempModule,
        ...module,
        status: 'active',
        lastActivity: new Date()
      };

      this.modules.set(moduleName, finalModule);

      // Inicializar el módulo
      await finalModule.initialize(userId);

      // Registrar módulo activo para el usuario
      if (!this.userActiveModules.has(userId)) {
        this.userActiveModules.set(userId, new Set());
      }
      this.userActiveModules.get(userId)!.add(moduleName);

      console.log(`[CentralModuleCoordinator] Módulo ${moduleName} cargado exitosamente`);
      return finalModule;

    } catch (error) {
      console.error(`[CentralModuleCoordinator] Error cargando módulo ${moduleName}:`, error);
      
      // Marcar como error
      const errorModule: ModuleWrapper = {
        name: moduleName,
        dependencies: [],
        publicAPI: {
          getStatus: () => ({ status: 'error', details: { error: error instanceof Error ? error.message : 'Unknown error' } }),
          getMetrics: () => ({ performance: 0, errors: 1, uptime: 0 })
        },
        initialize: async () => {},
        status: 'error',
        lastActivity: new Date()
      };
      this.modules.set(moduleName, errorModule);
      
      return null;
    }
  }

  // Cargar grupo de módulos
  async loadModuleGroup(groupName: keyof typeof ModuleGroups, userId: string): Promise<void> {
    const moduleNames = ModuleGroups[groupName];
    if (!moduleNames) {
      console.warn(`[CentralModuleCoordinator] Grupo de módulos '${groupName}' no definido`);
      return;
    }

    console.log(`[CentralModuleCoordinator] Cargando grupo: ${groupName}`);
    
    const loadPromises = moduleNames.map(moduleName => 
      this.loadModule(moduleName, userId)
    );

    await Promise.allSettled(loadPromises);
    
    console.log(`[CentralModuleCoordinator] Grupo ${groupName} procesado`);
  }

  // Obtener API pública de un módulo
  getModulePublicAPI(moduleName: string): ModulePublicAPI | undefined {
    const module = this.modules.get(moduleName);
    return module?.publicAPI;
  }

  // Registrar componente
  registerComponent(name: string, component: LazyExoticComponent<ComponentType<any>>): void {
    this.componentRegistry.set(name, component);
  }

  // Obtener componente
  getComponent(name: string): LazyExoticComponent<ComponentType<any>> | null {
    return this.componentRegistry.get(name) || null;
  }

  // Obtener estado de todos los módulos
  getAllModulesStatus(): Record<string, { status: string; lastActivity: Date }> {
    const status: Record<string, { status: string; lastActivity: Date }> = {};
    
    this.modules.forEach((module, name) => {
      status[name] = {
        status: module.status,
        lastActivity: module.lastActivity
      };
    });

    return status;
  }

  // Limpiar módulos de un usuario
  async cleanupUserModules(userId: string): Promise<void> {
    const userModules = this.userActiveModules.get(userId);
    if (!userModules) return;

    for (const moduleName of userModules) {
      const module = this.modules.get(moduleName);
      if (module?.cleanup) {
        try {
          await module.cleanup(userId);
        } catch (error) {
          console.error(`Error limpiando módulo ${moduleName}:`, error);
        }
      }
    }

    this.userActiveModules.delete(userId);
  }

  // Obtener módulos activos de un usuario
  getUserActiveModules(userId: string): string[] {
    const userModules = this.userActiveModules.get(userId);
    return userModules ? Array.from(userModules) : [];
  }

  // Obtener estadísticas del sistema
  getSystemStats(): { totalModules: number; activeModules: number; errorModules: number } {
    let active = 0;
    let errors = 0;
    
    this.modules.forEach(module => {
      if (module.status === 'active') active++;
      if (module.status === 'error') errors++;
    });

    return {
      totalModules: this.modules.size,
      activeModules: active,
      errorModules: errors
    };
  }
}

// Instancia global
export const centralCoordinator = CentralModuleCoordinator.getInstance(); 