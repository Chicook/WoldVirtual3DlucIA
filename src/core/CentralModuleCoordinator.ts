/**
 * 🌐 CentralModuleCoordinator - Cerebro del Sistema de Instanciación Dinámica
 * 
 * Responsabilidades:
 * - Registro automático de módulos desde carpetas especializadas
 * - Carga inteligente por grupos funcionales
 * - Gestión de dependencias entre módulos
 * - Coordinación de comunicación inter-módulo
 * - Optimización de recursos por usuario
 */

import { ModuleWrapper, ModulePublicAPI, ModuleInstance } from '../@types/core/module.d';
import { InterModuleMessageBus } from './InterModuleMessageBus';
import { ModuleGroups } from './ModuleGroups';

export class CentralModuleCoordinator {
  private static instance: CentralModuleCoordinator;
  private modules = new Map<string, ModuleWrapper>();
  private instances = new Map<string, ModuleInstance>();
  private userActiveModules = new Map<string, Set<string>>();
  private messageBus: InterModuleMessageBus;
  private loadingPromises = new Map<string, Promise<void>>();

  private constructor() {
    this.messageBus = InterModuleMessageBus.getInstance();
    this.initializeMessageBus();
  }

  static getInstance(): CentralModuleCoordinator {
    if (!CentralModuleCoordinator.instance) {
      CentralModuleCoordinator.instance = new CentralModuleCoordinator();
    }
    return CentralModuleCoordinator.instance;
  }

  /**
   * Inicializa el sistema de mensajería para comunicación inter-módulo
   */
  private initializeMessageBus(): void {
    // Escuchar solicitudes de carga de módulos
    this.messageBus.subscribe('module-load-request', async (request: {
      groupName: keyof typeof ModuleGroups;
      userId: string;
      callback?: (success: boolean) => void;
    }) => {
      try {
        await this.loadModuleGroupForUser(request.groupName, request.userId);
        request.callback?.(true);
      } catch (error) {
        console.error(`[!] Error loading module group ${request.groupName}:`, error);
        request.callback?.(false);
      }
    });

    // Escuchar solicitudes de componentes
    this.messageBus.subscribe('component-request', async (request: {
      componentName: string;
      callback: (component: any) => void;
    }) => {
      const component = await this.getComponent(request.componentName);
      request.callback(component);
    });
  }

  /**
   * Registro automático de módulos desde carpetas especializadas
   */
  async autoDiscoverModules(): Promise<void> {
    console.log('[🔄] Iniciando descubrimiento automático de módulos...');
    
    const moduleLoaders = {
      'blockchain': () => import('../../bloc/BlockchainModule'),
      'assets': () => import('../../assets/AssetModule'),
      'entities': () => import('../../entities/EntityModule'),
      'helpers': () => import('../../helpers/HelperModule'),
      'lucia-ai': () => import('../../ini/luciaAI/LuciaModule'),
      'components': () => import('../../components/ComponentModule'),
      'services': () => import('../../services/ServiceModule'),
      'pages': () => import('../../pages/PageModule'),
      'cli': () => import('../../cli/CLIModule'),
      'web': () => import('../../web/WebModule'),
      'fonts': () => import('../../fonts/FontModule'),
      'images': () => import('../../images/ImageModule'),
      'languages': () => import('../../languages/LanguageModule'),
      'middlewares': () => import('../../middlewares/MiddlewareModule'),
      'models': () => import('../../models/ModelModule'),
      'config': () => import('../../config/ConfigModule'),
      'data': () => import('../../data/DataModule')
    };

    const loadPromises = Object.entries(moduleLoaders).map(async ([name, loader]) => {
      try {
        const module = await loader();
        if (module?.default && module.default.name) {
          this.registerModule(module.default);
          console.log(`[✅] Módulo ${name} registrado exitosamente`);
        }
      } catch (error) {
        console.warn(`[⚠️] No se pudo cargar el módulo ${name}:`, error);
      }
    });

    await Promise.allSettled(loadPromises);
    console.log(`[🎯] Descubrimiento completado. ${this.modules.size} módulos registrados`);
  }

  /**
   * Registra un módulo en el coordinador
   */
  registerModule(module: ModuleWrapper): void {
    if (this.modules.has(module.name)) {
      console.warn(`[⚠️] Módulo ${module.name} ya está registrado. Sobrescribiendo...`);
    }
    
    this.modules.set(module.name, module);
    console.log(`[📝] Módulo ${module.name} registrado con ${module.dependencies.length} dependencias`);
  }

  /**
   * Carga un grupo de módulos para un usuario específico
   */
  async loadModuleGroupForUser(groupName: keyof typeof ModuleGroups, userId: string): Promise<void> {
    const moduleNames = ModuleGroups[groupName];
    if (!moduleNames) {
      throw new Error(`Grupo de módulos '${groupName}' no definido`);
    }

    console.log(`[🚀] Cargando grupo '${groupName}' para usuario ${userId}...`);

    // Verificar si ya está cargando para evitar duplicados
    const loadingKey = `${groupName}-${userId}`;
    if (this.loadingPromises.has(loadingKey)) {
      await this.loadingPromises.get(loadingKey);
      return;
    }

    const loadPromise = this.executeModuleGroupLoad(moduleNames, userId);
    this.loadingPromises.set(loadingKey, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.loadingPromises.delete(loadingKey);
    }
  }

  /**
   * Ejecuta la carga real de los módulos del grupo
   */
  private async executeModuleGroupLoad(moduleNames: string[], userId: string): Promise<void> {
    const loadPromises = moduleNames.map(async (moduleName) => {
      if (!this.modules.has(moduleName)) {
        console.warn(`[⚠️] Módulo ${moduleName} no encontrado en el registro`);
        return;
      }

      const moduleApi = this.modules.get(moduleName)!;
      const isActive = this.userActiveModules.get(userId)?.has(moduleName);

      if (!isActive) {
        console.log(`[🔄] Inicializando módulo ${moduleName} para usuario ${userId}...`);
        
        try {
          await moduleApi.initialize(userId);
          
          if (!this.userActiveModules.has(userId)) {
            this.userActiveModules.set(userId, new Set());
          }
          this.userActiveModules.get(userId)!.add(moduleName);
          
          console.log(`[✅] Módulo ${moduleName} inicializado para usuario ${userId}`);
        } catch (error) {
          console.error(`[❌] Error inicializando módulo ${moduleName}:`, error);
          throw error;
        }
      }
    });

    await Promise.all(loadPromises);
    console.log(`[🎯] Grupo de módulos cargado para usuario ${userId}`);
  }

  /**
   * Obtiene la API pública de un módulo específico
   */
  getModulePublicAPI(moduleName: string): ModulePublicAPI | undefined {
    const module = this.modules.get(moduleName);
    return module?.publicAPI;
  }

  /**
   * Obtiene un componente específico del sistema
   */
  async getComponent(componentName: string): Promise<any> {
    const componentsModule = this.getModulePublicAPI('components');
    if (componentsModule?.getComponent) {
      return componentsModule.getComponent(componentName);
    }
    
    // Fallback: buscar en todos los módulos
    for (const [moduleName, module] of this.modules) {
      if (module.publicAPI.getComponent) {
        const component = module.publicAPI.getComponent(componentName);
        if (component) return component;
      }
    }
    
    return null;
  }

  /**
   * Limpia los módulos de un usuario específico
   */
  async cleanupUserModules(userId: string): Promise<void> {
    const activeModules = this.userActiveModules.get(userId);
    if (!activeModules) return;

    console.log(`[🧹] Limpiando módulos para usuario ${userId}...`);

    const cleanupPromises = Array.from(activeModules).map(async (moduleName) => {
      const module = this.modules.get(moduleName);
      if (module?.cleanup) {
        try {
          await module.cleanup(userId);
          console.log(`[✅] Módulo ${moduleName} limpiado para usuario ${userId}`);
        } catch (error) {
          console.error(`[❌] Error limpiando módulo ${moduleName}:`, error);
        }
      }
    });

    await Promise.allSettled(cleanupPromises);
    this.userActiveModules.delete(userId);
    console.log(`[🎯] Limpieza completada para usuario ${userId}`);
  }

  /**
   * Obtiene estadísticas del sistema
   */
  getSystemStats(): {
    totalModules: number;
    activeUsers: number;
    totalInstances: number;
  } {
    return {
      totalModules: this.modules.size,
      activeUsers: this.userActiveModules.size,
      totalInstances: this.instances.size
    };
  }

  /**
   * Publica un evento a través del message bus
   */
  publishEvent(event: string, data?: any): void {
    this.messageBus.publish(event, data);
  }

  /**
   * Suscribe a eventos del message bus
   */
  subscribeToEvent(event: string, handler: Function): void {
    this.messageBus.subscribe(event, handler);
  }
}

// Exportar instancia singleton
export const centralCoordinator = CentralModuleCoordinator.getInstance(); 