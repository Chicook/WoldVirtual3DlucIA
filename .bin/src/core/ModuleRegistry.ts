import { BinModule } from '../types';
import { centralCoordinator } from './CentralModuleCoordinator';
import { messageBus } from './InterModuleMessageBus';

/**
 * ModuleRegistry - Registro automático de módulos del sistema .bin
 * Descubre y registra automáticamente todos los módulos TypeScript
 */
export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private discoveredModules = new Map<string, string>();
  private moduleLoaders = new Map<string, () => Promise<any>>();
  private isInitialized = false;

  private constructor() {
    this.setupModuleLoaders();
  }

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  /**
   * Configura los loaders para cada módulo del sistema
   */
  private setupModuleLoaders(): void {
    // Módulos del sistema .bin
    this.moduleLoaders.set('automation', () => 
      import('../../.automation/automation_ts/AutomationModule')
    );
    
    this.moduleLoaders.set('metaverso', () => 
      import('../../metaverso/metaverso_ts/MetaversoModule')
    );
    
    this.moduleLoaders.set('security', () => 
      import('../../security/security_ts/SecurityModule')
    );
    
    this.moduleLoaders.set('monitor', () => 
      import('../../monitor/monitor_ts/MonitorModule')
    );
    
    this.moduleLoaders.set('blockchain', () => 
      import('../../blockchain/blockchain_ts/BlockchainModule')
    );
    
    this.moduleLoaders.set('toolkit', () => 
      import('../../toolkit/toolkit_ts/ToolkitModule')
    );
    
    this.moduleLoaders.set('editor3d', () => 
      import('../../editor3d/editor3d_ts/Editor3DModule')
    );
    
    this.moduleLoaders.set('redpublicacion', () => 
      import('../../redpublicacion/redpublicacion_ts/RedPublicacionModule')
    );
    
    this.moduleLoaders.set('manuals', () => 
      import('../../manuals/manuals_ts/ManualsModule')
    );
    
    this.moduleLoaders.set('deploy', () => 
      import('../../deploy/deploy_ts/DeployModule')
    );
    
    this.moduleLoaders.set('builder', () => 
      import('../../builder/builder_ts/BuilderModule')
    );
    
    this.moduleLoaders.set('params', () => 
      import('../../params/params_ts/ParamsModule')
    );
  }

  /**
   * Inicializa el registro de módulos
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[ModuleRegistry] Ya está inicializado');
      return;
    }

    console.log('[ModuleRegistry] Inicializando registro de módulos...');

    try {
      // Descubrir módulos disponibles
      await this.discoverModules();
      
      // Registrar módulos en el coordinador central
      await this.registerAllModules();
      
      this.isInitialized = true;
      
      // Notificar inicialización completa
      messageBus.notifySystemEvent('module-registry-initialized', {
        totalModules: this.discoveredModules.size,
        modules: Array.from(this.discoveredModules.keys())
      });

      console.log(`[ModuleRegistry] Inicialización completada. ${this.discoveredModules.size} módulos registrados`);
    } catch (error) {
      console.error('[ModuleRegistry] Error durante la inicialización:', error);
      messageBus.notifySystemError(error as Error, 'ModuleRegistry.initialize');
      throw error;
    }
  }

  /**
   * Descubre módulos disponibles en el sistema
   */
  private async discoverModules(): Promise<void> {
    console.log('[ModuleRegistry] Descubriendo módulos...');

    for (const [moduleName, loader] of this.moduleLoaders) {
      try {
        // Verificar que el módulo existe y es cargable
        const modulePath = this.getModulePath(moduleName);
        this.discoveredModules.set(moduleName, modulePath);
        
        console.log(`[ModuleRegistry] Módulo descubierto: ${moduleName} en ${modulePath}`);
      } catch (error) {
        console.warn(`[ModuleRegistry] No se pudo descubrir el módulo ${moduleName}:`, error);
      }
    }
  }

  /**
   * Registra todos los módulos descubiertos en el coordinador central
   */
  private async registerAllModules(): Promise<void> {
    console.log('[ModuleRegistry] Registrando módulos en el coordinador central...');

    const registrationPromises = Array.from(this.discoveredModules.keys()).map(async (moduleName) => {
      try {
        await this.registerModule(moduleName);
      } catch (error) {
        console.error(`[ModuleRegistry] Error registrando módulo ${moduleName}:`, error);
        // Continuar con otros módulos aunque uno falle
      }
    });

    await Promise.allSettled(registrationPromises);
  }

  /**
   * Registra un módulo específico
   */
  async registerModule(moduleName: string): Promise<void> {
    const loader = this.moduleLoaders.get(moduleName);
    if (!loader) {
      throw new Error(`Loader no encontrado para el módulo ${moduleName}`);
    }

    try {
      console.log(`[ModuleRegistry] Cargando módulo: ${moduleName}`);
      
      // Cargar el módulo dinámicamente
      const moduleModule = await loader();
      const moduleDefinition = moduleModule.default || moduleModule;

      if (!moduleDefinition || typeof moduleDefinition !== 'object') {
        throw new Error(`Módulo ${moduleName} no exporta una definición válida`);
      }

      // Validar que tenga las propiedades requeridas
      if (!this.validateModuleDefinition(moduleDefinition)) {
        throw new Error(`Módulo ${moduleName} no cumple con la interfaz BinModule`);
      }

      // Registrar en el coordinador central
      await centralCoordinator.registerModule(moduleName, moduleDefinition);

      console.log(`[ModuleRegistry] Módulo ${moduleName} registrado exitosamente`);
    } catch (error) {
      console.error(`[ModuleRegistry] Error registrando módulo ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Valida que un módulo cumpla con la interfaz BinModule
   */
  private validateModuleDefinition(module: any): module is BinModule {
    return !!(
      module &&
      typeof module === 'object' &&
      typeof module.name === 'string' &&
      typeof module.description === 'string' &&
      typeof module.version === 'string' &&
      Array.isArray(module.dependencies) &&
      typeof module.publicAPI === 'object' &&
      typeof module.initialize === 'function' &&
      typeof module.cleanup === 'function'
    );
  }

  /**
   * Obtiene la ruta de un módulo
   */
  private getModulePath(moduleName: string): string {
    const modulePaths: Record<string, string> = {
      automation: '../../.automation/automation_ts/AutomationModule',
      metaverso: '../../metaverso/metaverso_ts/MetaversoModule',
      security: '../../security/security_ts/SecurityModule',
      monitor: '../../monitor/monitor_ts/MonitorModule',
      blockchain: '../../blockchain/blockchain_ts/BlockchainModule',
      toolkit: '../../toolkit/toolkit_ts/ToolkitModule',
      editor3d: '../../editor3d/editor3d_ts/Editor3DModule',
      redpublicacion: '../../redpublicacion/redpublicacion_ts/RedPublicacionModule',
      manuals: '../../manuals/manuals_ts/ManualsModule',
      deploy: '../../deploy/deploy_ts/DeployModule',
      builder: '../../builder/builder_ts/BuilderModule',
      params: '../../params/params_ts/ParamsModule'
    };

    return modulePaths[moduleName] || `../../${moduleName}/${moduleName}_ts/${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`;
  }

  /**
   * Obtiene la lista de módulos descubiertos
   */
  getDiscoveredModules(): string[] {
    return Array.from(this.discoveredModules.keys());
  }

  /**
   * Verifica si un módulo está disponible
   */
  isModuleAvailable(moduleName: string): boolean {
    return this.discoveredModules.has(moduleName);
  }

  /**
   * Obtiene información de un módulo específico
   */
  getModuleInfo(moduleName: string): { name: string; path: string; available: boolean } | null {
    const path = this.discoveredModules.get(moduleName);
    if (!path) {
      return null;
    }

    return {
      name: moduleName,
      path,
      available: true
    };
  }

  /**
   * Recarga un módulo específico
   */
  async reloadModule(moduleName: string): Promise<void> {
    console.log(`[ModuleRegistry] Recargando módulo: ${moduleName}`);

    try {
      // Remover del coordinador central si ya está registrado
      // (esto requeriría un método en CentralModuleCoordinator)
      
      // Registrar nuevamente
      await this.registerModule(moduleName);

      messageBus.notifySystemEvent('module-reloaded', {
        moduleName,
        timestamp: Date.now()
      });

      console.log(`[ModuleRegistry] Módulo ${moduleName} recargado exitosamente`);
    } catch (error) {
      console.error(`[ModuleRegistry] Error recargando módulo ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas del registro
   */
  getStats(): {
    totalModules: number;
    discoveredModules: number;
    availableModules: number;
    isInitialized: boolean;
  } {
    return {
      totalModules: this.moduleLoaders.size,
      discoveredModules: this.discoveredModules.size,
      availableModules: this.discoveredModules.size,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Limpia el registro
   */
  clear(): void {
    this.discoveredModules.clear();
    this.isInitialized = false;
    console.log('[ModuleRegistry] Registro limpiado');
  }
}

// Exportar instancia singleton
export const moduleRegistry = ModuleRegistry.getInstance(); 