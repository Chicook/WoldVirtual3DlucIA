import { BinModule, BinModuleStatus } from '../types';
import { InterModuleMessageBus } from './InterModuleMessageBus';

/**
 * CentralModuleCoordinator - Coordinador principal del sistema .bin
 * Gestiona la carga dinámica, registro y comunicación entre módulos
 */
export class CentralModuleCoordinator {
  private static instance: CentralModuleCoordinator;
  private modules = new Map<string, BinModule>();
  private moduleInstances = new Map<string, any>();
  private userSessions = new Map<string, Set<string>>();
  private messageBus: InterModuleMessageBus;
  private loadingQueue: string[] = [];
  private isInitializing = false;

  // Grupos de módulos para carga contextual
  private readonly moduleGroups = {
    CORE: ['automation', 'monitor', 'security'],
    BUILD: ['builder', 'deploy', 'params'],
    BLOCKCHAIN: ['blockchain', 'metaverso'],
    TOOLS: ['toolkit', 'editor3d', 'redpublicacion'],
    DOCS: ['manuals']
  };

  private constructor() {
    this.messageBus = InterModuleMessageBus.getInstance();
    this.setupMessageBusHandlers();
  }

  static getInstance(): CentralModuleCoordinator {
    if (!CentralModuleCoordinator.instance) {
      CentralModuleCoordinator.instance = new CentralModuleCoordinator();
    }
    return CentralModuleCoordinator.instance;
  }

  /**
   * Configura los manejadores del message bus
   */
  private setupMessageBusHandlers(): void {
    // Escuchar solicitudes de carga de módulos
    this.messageBus.subscribe('module-load-request', async (data: {
      moduleName: string;
      userId: string;
      priority?: 'high' | 'normal' | 'low';
    }) => {
      await this.loadModuleForUser(data.moduleName, data.userId, data.priority);
    });

    // Escuchar solicitudes de grupo de módulos
    this.messageBus.subscribe('group-load-request', async (data: {
      groupName: keyof typeof this.moduleGroups;
      userId: string;
    }) => {
      await this.loadModuleGroupForUser(data.groupName, data.userId);
    });

    // Escuchar solicitudes de API de módulos
    this.messageBus.subscribe('module-api-request', (data: {
      moduleName: string;
      apiMethod: string;
      params: any[];
      callback: (result: any) => void;
    }) => {
      const moduleAPI = this.getModulePublicAPI(data.moduleName);
      if (moduleAPI && moduleAPI[data.apiMethod]) {
        const result = moduleAPI[data.apiMethod](...data.params);
        data.callback(result);
      } else {
        data.callback(null);
      }
    });
  }

  /**
   * Registra un módulo en el coordinador
   */
  async registerModule(moduleName: string, moduleDefinition: BinModule): Promise<void> {
    try {
      console.log(`[CentralModuleCoordinator] Registrando módulo: ${moduleName}`);
      
      // Validar el módulo
      if (!this.validateModule(moduleDefinition)) {
        throw new Error(`Módulo ${moduleName} no cumple con la interfaz requerida`);
      }

      this.modules.set(moduleName, moduleDefinition);
      
      // Notificar registro exitoso
      this.messageBus.publish('module-registered', {
        moduleName,
        timestamp: Date.now(),
        dependencies: moduleDefinition.dependencies
      });

      console.log(`[CentralModuleCoordinator] Módulo ${moduleName} registrado exitosamente`);
    } catch (error) {
      console.error(`[CentralModuleCoordinator] Error registrando módulo ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Valida que un módulo cumpla con la interfaz requerida
   */
  private validateModule(module: BinModule): boolean {
    return !!(
      module.name &&
      module.description &&
      module.version &&
      module.dependencies &&
      module.publicAPI &&
      module.initialize &&
      module.cleanup
    );
  }

  /**
   * Carga un módulo específico para un usuario
   */
  async loadModuleForUser(
    moduleName: string, 
    userId: string, 
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    try {
      console.log(`[CentralModuleCoordinator] Cargando módulo ${moduleName} para usuario ${userId}`);

      // Verificar si el módulo ya está cargado para el usuario
      if (this.isModuleLoadedForUser(moduleName, userId)) {
        console.log(`[CentralModuleCoordinator] Módulo ${moduleName} ya está cargado para usuario ${userId}`);
        return;
      }

      // Obtener definición del módulo
      const moduleDefinition = this.modules.get(moduleName);
      if (!moduleDefinition) {
        throw new Error(`Módulo ${moduleName} no encontrado`);
      }

      // Cargar dependencias primero
      await this.loadDependencies(moduleDefinition.dependencies, userId);

      // Inicializar el módulo
      const moduleInstance = await moduleDefinition.initialize(userId);
      
      // Registrar la instancia
      this.moduleInstances.set(`${moduleName}_${userId}`, moduleInstance);
      
      // Actualizar sesión del usuario
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, new Set());
      }
      this.userSessions.get(userId)!.add(moduleName);

      // Notificar carga exitosa
      this.messageBus.publish('module-loaded', {
        moduleName,
        userId,
        timestamp: Date.now(),
        instance: moduleInstance
      });

      console.log(`[CentralModuleCoordinator] Módulo ${moduleName} cargado exitosamente para usuario ${userId}`);
    } catch (error) {
      console.error(`[CentralModuleCoordinator] Error cargando módulo ${moduleName}:`, error);
      
      // Notificar error
      this.messageBus.publish('module-load-error', {
        moduleName,
        userId,
        error: error.message,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }

  /**
   * Carga un grupo de módulos para un usuario
   */
  async loadModuleGroupForUser(
    groupName: keyof typeof this.moduleGroups, 
    userId: string
  ): Promise<void> {
    const modulesToLoad = this.moduleGroups[groupName];
    if (!modulesToLoad) {
      throw new Error(`Grupo de módulos '${groupName}' no definido`);
    }

    console.log(`[CentralModuleCoordinator] Cargando grupo ${groupName} para usuario ${userId}`);

    // Cargar módulos en paralelo con manejo de errores
    const loadPromises = modulesToLoad.map(async (moduleName) => {
      try {
        await this.loadModuleForUser(moduleName, userId, 'normal');
      } catch (error) {
        console.error(`[CentralModuleCoordinator] Error cargando ${moduleName} del grupo ${groupName}:`, error);
        // Continuar con otros módulos aunque uno falle
      }
    });

    await Promise.allSettled(loadPromises);

    // Notificar carga del grupo
    this.messageBus.publish('module-group-loaded', {
      groupName,
      userId,
      timestamp: Date.now(),
      loadedModules: modulesToLoad.filter(module => 
        this.isModuleLoadedForUser(module, userId)
      )
    });
  }

  /**
   * Carga las dependencias de un módulo
   */
  private async loadDependencies(dependencies: string[], userId: string): Promise<void> {
    const dependencyPromises = dependencies.map(async (dep) => {
      if (!this.isModuleLoadedForUser(dep, userId)) {
        await this.loadModuleForUser(dep, userId, 'high');
      }
    });

    await Promise.all(dependencyPromises);
  }

  /**
   * Verifica si un módulo está cargado para un usuario
   */
  private isModuleLoadedForUser(moduleName: string, userId: string): boolean {
    return this.userSessions.get(userId)?.has(moduleName) || false;
  }

  /**
   * Obtiene la API pública de un módulo
   */
  getModulePublicAPI(moduleName: string): any {
    const moduleDefinition = this.modules.get(moduleName);
    return moduleDefinition ? moduleDefinition.publicAPI : null;
  }

  /**
   * Obtiene la instancia de un módulo para un usuario
   */
  getModuleInstance(moduleName: string, userId: string): any {
    return this.moduleInstances.get(`${moduleName}_${userId}`);
  }

  /**
   * Descarga un módulo para un usuario
   */
  async unloadModuleForUser(moduleName: string, userId: string): Promise<void> {
    try {
      console.log(`[CentralModuleCoordinator] Descargando módulo ${moduleName} para usuario ${userId}`);

      const moduleDefinition = this.modules.get(moduleName);
      if (!moduleDefinition) {
        throw new Error(`Módulo ${moduleName} no encontrado`);
      }

      // Limpiar el módulo
      await moduleDefinition.cleanup(userId);

      // Remover de las sesiones
      this.userSessions.get(userId)?.delete(moduleName);
      this.moduleInstances.delete(`${moduleName}_${userId}`);

      // Notificar descarga
      this.messageBus.publish('module-unloaded', {
        moduleName,
        userId,
        timestamp: Date.now()
      });

      console.log(`[CentralModuleCoordinator] Módulo ${moduleName} descargado para usuario ${userId}`);
    } catch (error) {
      console.error(`[CentralModuleCoordinator] Error descargando módulo ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de todos los módulos
   */
  getSystemStatus(): {
    totalModules: number;
    loadedModules: number;
    activeUsers: number;
    moduleStatus: Record<string, BinModuleStatus>;
  } {
    const moduleStatus: Record<string, BinModuleStatus> = {};
    
    for (const [moduleName, moduleDefinition] of this.modules) {
      const loadedUsers = Array.from(this.userSessions.entries())
        .filter(([_, modules]) => modules.has(moduleName))
        .map(([userId, _]) => userId);

      moduleStatus[moduleName] = {
        name: moduleName,
        description: moduleDefinition.description,
        version: moduleDefinition.version,
        status: loadedUsers.length > 0 ? 'active' : 'inactive',
        loadedUsers,
        dependencies: moduleDefinition.dependencies,
        lastActivity: Date.now()
      };
    }

    return {
      totalModules: this.modules.size,
      loadedModules: Array.from(this.userSessions.values())
        .reduce((total, modules) => total + modules.size, 0),
      activeUsers: this.userSessions.size,
      moduleStatus
    };
  }

  /**
   * Limpia todos los módulos para un usuario
   */
  async cleanupUserSession(userId: string): Promise<void> {
    console.log(`[CentralModuleCoordinator] Limpiando sesión para usuario ${userId}`);

    const userModules = this.userSessions.get(userId);
    if (!userModules) {
      return;
    }

    const cleanupPromises = Array.from(userModules).map(async (moduleName) => {
      try {
        await this.unloadModuleForUser(moduleName, userId);
      } catch (error) {
        console.error(`[CentralModuleCoordinator] Error limpiando ${moduleName}:`, error);
      }
    });

    await Promise.allSettled(cleanupPromises);
    this.userSessions.delete(userId);

    console.log(`[CentralModuleCoordinator] Sesión limpiada para usuario ${userId}`);
  }

  /**
   * Reinicia el coordinador
   */
  async restart(): Promise<void> {
    console.log(`[CentralModuleCoordinator] Reiniciando coordinador...`);

    // Limpiar todas las sesiones
    const allUsers = Array.from(this.userSessions.keys());
    for (const userId of allUsers) {
      await this.cleanupUserSession(userId);
    }

    // Limpiar instancias
    this.moduleInstances.clear();
    this.loadingQueue = [];
    this.isInitializing = false;

    console.log(`[CentralModuleCoordinator] Coordinador reiniciado`);
  }
}

// Exportar instancia singleton
export const centralCoordinator = CentralModuleCoordinator.getInstance(); 