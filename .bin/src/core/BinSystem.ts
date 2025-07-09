import { centralCoordinator } from './CentralModuleCoordinator';
import { messageBus } from './InterModuleMessageBus';
import { moduleRegistry } from './ModuleRegistry';

/**
 * BinSystem - Sistema principal del .bin
 * Coordina la inicialización y gestión de todos los módulos
 */
export class BinSystem {
  private static instance: BinSystem;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): BinSystem {
    if (!BinSystem.instance) {
      BinSystem.instance = new BinSystem();
    }
    return BinSystem.instance;
  }

  /**
   * Inicializa el sistema completo
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[BinSystem] Sistema ya inicializado');
      return;
    }

    if (this.initializationPromise) {
      console.log('[BinSystem] Inicialización en progreso, esperando...');
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
  }

  /**
   * Realiza la inicialización completa del sistema
   */
  private async performInitialization(): Promise<void> {
    try {
      console.log('[BinSystem] Iniciando sistema .bin...');

      // Paso 1: Configurar message bus
      await this.setupMessageBus();

      // Paso 2: Inicializar registro de módulos
      await this.initializeModuleRegistry();

      // Paso 3: Cargar módulos core por defecto
      await this.loadCoreModules();

      // Paso 4: Configurar listeners del sistema
      await this.setupSystemListeners();

      this.isInitialized = true;

      // Notificar inicialización completa
      messageBus.notifySystemEvent('bin-system-initialized', {
        timestamp: Date.now(),
        modules: moduleRegistry.getDiscoveredModules()
      });

      console.log('[BinSystem] Sistema .bin inicializado exitosamente');
    } catch (error) {
      console.error('[BinSystem] Error durante la inicialización:', error);
      messageBus.notifySystemError(error as Error, 'BinSystem.initialize');
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Configura el message bus
   */
  private async setupMessageBus(): Promise<void> {
    console.log('[BinSystem] Configurando message bus...');

    // Habilitar message bus
    messageBus.setEnabled(true);

    // Configurar listeners para eventos del sistema
    messageBus.subscribe('system-event', (event: any) => {
      console.log('[BinSystem] Evento del sistema:', event);
    });

    messageBus.subscribe('system-error', (error: any) => {
      console.error('[BinSystem] Error del sistema:', error);
    });

    console.log('[BinSystem] Message bus configurado');
  }

  /**
   * Inicializa el registro de módulos
   */
  private async initializeModuleRegistry(): Promise<void> {
    console.log('[BinSystem] Inicializando registro de módulos...');

    try {
      await moduleRegistry.initialize();
      console.log('[BinSystem] Registro de módulos inicializado');
    } catch (error) {
      console.error('[BinSystem] Error inicializando registro de módulos:', error);
      throw error;
    }
  }

  /**
   * Carga los módulos core del sistema
   */
  private async loadCoreModules(): Promise<void> {
    console.log('[BinSystem] Cargando módulos core...');

    try {
      // Cargar módulos core para el sistema (usuario 'system')
      await centralCoordinator.loadModuleGroupForUser('CORE', 'system');
      
      console.log('[BinSystem] Módulos core cargados');
    } catch (error) {
      console.error('[BinSystem] Error cargando módulos core:', error);
      // No lanzar error, continuar con la inicialización
    }
  }

  /**
   * Configura listeners del sistema
   */
  private async setupSystemListeners(): Promise<void> {
    console.log('[BinSystem] Configurando listeners del sistema...');

    // Listener para solicitudes de carga de módulos
    messageBus.subscribe('module-load-request', async (request: any) => {
      try {
        await centralCoordinator.loadModuleForUser(
          request.data.moduleName,
          request.data.userId,
          request.data.priority
        );
      } catch (error) {
        console.error('[BinSystem] Error cargando módulo:', error);
      }
    });

    // Listener para solicitudes de carga de grupos
    messageBus.subscribe('group-load-request', async (request: any) => {
      try {
        await centralCoordinator.loadModuleGroupForUser(
          request.data.groupName,
          request.data.userId
        );
      } catch (error) {
        console.error('[BinSystem] Error cargando grupo de módulos:', error);
      }
    });

    // Listener para limpieza de sesiones
    messageBus.subscribe('user-session-cleanup', async (request: any) => {
      try {
        await centralCoordinator.cleanupUserSession(request.data.userId);
      } catch (error) {
        console.error('[BinSystem] Error limpiando sesión:', error);
      }
    });

    console.log('[BinSystem] Listeners del sistema configurados');
  }

  /**
   * Carga un módulo para un usuario específico
   */
  async loadModuleForUser(moduleName: string, userId: string, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Sistema no inicializado. Llame a initialize() primero.');
    }

    try {
      await centralCoordinator.loadModuleForUser(moduleName, userId, priority);
    } catch (error) {
      console.error(`[BinSystem] Error cargando módulo ${moduleName} para usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Carga un grupo de módulos para un usuario
   */
  async loadModuleGroupForUser(groupName: string, userId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Sistema no inicializado. Llame a initialize() primero.');
    }

    try {
      await centralCoordinator.loadModuleGroupForUser(groupName as any, userId);
    } catch (error) {
      console.error(`[BinSystem] Error cargando grupo ${groupName} para usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene la API pública de un módulo
   */
  getModuleAPI(moduleName: string): any {
    if (!this.isInitialized) {
      throw new Error('Sistema no inicializado. Llame a initialize() primero.');
    }

    return centralCoordinator.getModulePublicAPI(moduleName);
  }

  /**
   * Obtiene el estado del sistema
   */
  getSystemStatus(): {
    isInitialized: boolean;
    moduleRegistry: any;
    centralCoordinator: any;
    messageBus: any;
  } {
    return {
      isInitialized: this.isInitialized,
      moduleRegistry: moduleRegistry.getStats(),
      centralCoordinator: centralCoordinator.getSystemStatus(),
      messageBus: messageBus.getStats()
    };
  }

  /**
   * Limpia la sesión de un usuario
   */
  async cleanupUserSession(userId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Sistema no inicializado. Llame a initialize() primero.');
    }

    try {
      await centralCoordinator.cleanupUserSession(userId);
    } catch (error) {
      console.error(`[BinSystem] Error limpiando sesión del usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Reinicia el sistema
   */
  async restart(): Promise<void> {
    console.log('[BinSystem] Reiniciando sistema...');

    try {
      // Limpiar estado
      this.isInitialized = false;
      this.initializationPromise = null;

      // Reiniciar coordinador central
      await centralCoordinator.restart();

      // Limpiar message bus
      messageBus.clearAll();

      // Limpiar registro de módulos
      moduleRegistry.clear();

      // Reinicializar
      await this.initialize();

      console.log('[BinSystem] Sistema reiniciado exitosamente');
    } catch (error) {
      console.error('[BinSystem] Error durante el reinicio:', error);
      throw error;
    }
  }

  /**
   * Cierra el sistema
   */
  async shutdown(): Promise<void> {
    console.log('[BinSystem] Cerrando sistema...');

    try {
      // Limpiar todas las sesiones de usuario
      const systemStatus = centralCoordinator.getSystemStatus();
      for (const userId of Object.keys(systemStatus.moduleStatus)) {
        try {
          await centralCoordinator.cleanupUserSession(userId);
        } catch (error) {
          console.warn(`[BinSystem] Error limpiando sesión de ${userId}:`, error);
        }
      }

      // Deshabilitar message bus
      messageBus.setEnabled(false);

      // Limpiar estado
      this.isInitialized = false;
      this.initializationPromise = null;

      console.log('[BinSystem] Sistema cerrado');
    } catch (error) {
      console.error('[BinSystem] Error durante el cierre:', error);
      throw error;
    }
  }

  /**
   * Ejecuta una acción en un módulo específico
   */
  async executeModuleAction(
    moduleName: string,
    action: string,
    params: any[],
    userId: string
  ): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Sistema no inicializado. Llame a initialize() primero.');
    }

    try {
      // Asegurar que el módulo esté cargado
      await this.loadModuleForUser(moduleName, userId, 'high');

      // Obtener la API del módulo
      const moduleAPI = this.getModuleAPI(moduleName);
      if (!moduleAPI || !moduleAPI[action]) {
        throw new Error(`Acción '${action}' no encontrada en el módulo '${moduleName}'`);
      }

      // Ejecutar la acción
      const result = await moduleAPI[action](...params);
      return result;
    } catch (error) {
      console.error(`[BinSystem] Error ejecutando acción ${action} en módulo ${moduleName}:`, error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const binSystem = BinSystem.getInstance(); 