/**
 * CentralModuleCoordinator - Sistema de Coordinación Central
 * Gestiona la carga dinámica de módulos multi-lenguaje en WoldVirtual3DlucIA
 * 
 * Responsabilidades:
 * - Registro automático de módulos desde carpetas especializadas
 * - Carga bajo demanda por grupos funcionales
 * - Gestión de dependencias inter-módulo
 * - Comunicación entre diferentes lenguajes de programación
 * - Optimización de recursos y memoria
 */

import { ModuleWrapper, ModulePublicAPI, ModuleGroups } from './types/core';
import { InterModuleMessageBus } from './InterModuleMessageBus';
import { ModuleLoader } from './ModuleLoader';
import { DependencyResolver } from './DependencyResolver';
import { PerformanceMonitor } from './PerformanceMonitor';

export class CentralModuleCoordinator {
  private static instance: CentralModuleCoordinator;
  private modules = new Map<string, ModuleWrapper>();
  private componentRegistry = new Map<string, any>();
  private userActiveModules = new Map<string, Set<string>>();
  private moduleLoaders = new Map<string, ModuleLoader>();
  private messageBus: InterModuleMessageBus;
  private dependencyResolver: DependencyResolver;
  private performanceMonitor: PerformanceMonitor;
  private isInitialized = false;

  private constructor() {
    this.messageBus = InterModuleMessageBus.getInstance();
    this.dependencyResolver = new DependencyResolver();
    this.performanceMonitor = new PerformanceMonitor();
    this.initializeModuleLoaders();
  }

  static getInstance(): CentralModuleCoordinator {
    if (!CentralModuleCoordinator.instance) {
      CentralModuleCoordinator.instance = new CentralModuleCoordinator();
    }
    return CentralModuleCoordinator.instance;
  }

  /**
   * Inicializa los cargadores de módulos para diferentes lenguajes
   */
  private initializeModuleLoaders(): void {
    // Cargador para módulos TypeScript/JavaScript
    this.moduleLoaders.set('typescript', new ModuleLoader({
      language: 'typescript',
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      loader: this.loadTypeScriptModule.bind(this)
    }));

    // Cargador para módulos Python
    this.moduleLoaders.set('python', new ModuleLoader({
      language: 'python',
      extensions: ['.py'],
      loader: this.loadPythonModule.bind(this)
    }));

    // Cargador para módulos Go
    this.moduleLoaders.set('go', new ModuleLoader({
      language: 'go',
      extensions: ['.go'],
      loader: this.loadGoModule.bind(this)
    }));

    // Cargador para módulos Rust (futuro)
    this.moduleLoaders.set('rust', new ModuleLoader({
      language: 'rust',
      extensions: ['.rs'],
      loader: this.loadRustModule.bind(this)
    }));
  }

  /**
   * Descubre automáticamente módulos en todas las carpetas especializadas
   */
  async autoDiscoverModules(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Definir carpetas especializadas según prioridad
      const specializedFolders = [
        '.bin', '.github', '@types', 'assets', 'bloc', 'build',
        'cli', 'client', 'components', 'config', 'coverage',
        'css', 'data', 'docs', 'entities', 'fonts', 'helpers',
        'image', 'Include', 'ini', 'js', 'languages', 'lib',
        'middlewares', 'models', 'node_modules', 'package',
        'pages', 'public', 'scripts', 'services', 'src',
        'test', 'web'
      ];

      for (const folder of specializedFolders) {
        await this.discoverModulesInFolder(folder);
      }

      const discoveryTime = performance.now() - startTime;
      this.performanceMonitor.recordMetric('module_discovery_time', discoveryTime);
      
      console.log(`✅ Descubrimiento automático completado en ${discoveryTime.toFixed(2)}ms`);
      console.log(`📦 Módulos registrados: ${this.modules.size}`);
      
    } catch (error) {
      console.error('❌ Error en descubrimiento automático:', error);
      throw error;
    }
  }

  /**
   * Descubre módulos en una carpeta específica
   */
  private async discoverModulesInFolder(folderPath: string): Promise<void> {
    try {
      const moduleFiles = await this.findModuleFiles(folderPath);
      
      for (const filePath of moduleFiles) {
        const language = this.detectLanguage(filePath);
        const loader = this.moduleLoaders.get(language);
        
        if (loader) {
          try {
            const module = await loader.load(filePath);
            if (module) {
              this.registerModule(module);
              console.log(`📦 Módulo registrado: ${module.name} (${language})`);
            }
          } catch (error) {
            console.warn(`⚠️ Error cargando módulo ${filePath}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error explorando carpeta ${folderPath}:`, error);
    }
  }

  /**
   * Encuentra archivos de módulos en una carpeta
   */
  private async findModuleFiles(folderPath: string): Promise<string[]> {
    const moduleFiles: string[] = [];
    const supportedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs'];
    
    try {
      // Implementar búsqueda recursiva de archivos
      // Por simplicidad, asumimos que los archivos están en subdirectorios
      const modulePatterns = [
        `${folderPath}/**/*Module.*`,
        `${folderPath}/**/*.module.*`,
        `${folderPath}/**/index.*`
      ];
      
      // En una implementación real, usaríamos fs.readdir recursivo
      // Por ahora, simulamos la búsqueda
      return moduleFiles;
    } catch (error) {
      return [];
    }
  }

  /**
   * Detecta el lenguaje de programación basado en la extensión del archivo
   */
  private detectLanguage(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop() || '';
    
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'typescript',
      'jsx': 'typescript',
      'py': 'python',
      'go': 'go',
      'rs': 'rust'
    };
    
    return languageMap[ext] || 'unknown';
  }

  /**
   * Carga un módulo TypeScript/JavaScript
   */
  private async loadTypeScriptModule(filePath: string): Promise<ModuleWrapper | null> {
    try {
      // En un entorno real, usaríamos import() dinámico
      const module = await import(filePath);
      
      if (module.default && typeof module.default === 'object') {
        return {
          name: module.default.name || this.extractModuleName(filePath),
          dependencies: module.default.dependencies || [],
          publicAPI: module.default.publicAPI || {},
          internalAPI: module.default.internalAPI || {},
          initialize: module.default.initialize || (() => Promise.resolve()),
          cleanup: module.default.cleanup || (() => Promise.resolve()),
          language: 'typescript',
          filePath
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error cargando módulo TypeScript ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Carga un módulo Python (simulado para TypeScript)
   */
  private async loadPythonModule(filePath: string): Promise<ModuleWrapper | null> {
    try {
      // En un entorno real, usaríamos child_process para ejecutar Python
      // Por ahora, simulamos la carga
      const moduleName = this.extractModuleName(filePath);
      
      return {
        name: moduleName,
        dependencies: [],
        publicAPI: {},
        internalAPI: {},
        initialize: async () => {
          console.log(`🐍 Inicializando módulo Python: ${moduleName}`);
        },
        cleanup: async () => {
          console.log(`🐍 Limpiando módulo Python: ${moduleName}`);
        },
        language: 'python',
        filePath
      };
    } catch (error) {
      console.error(`Error cargando módulo Python ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Carga un módulo Go (simulado para TypeScript)
   */
  private async loadGoModule(filePath: string): Promise<ModuleWrapper | null> {
    try {
      const moduleName = this.extractModuleName(filePath);
      
      return {
        name: moduleName,
        dependencies: [],
        publicAPI: {},
        internalAPI: {},
        initialize: async () => {
          console.log(`🚀 Inicializando módulo Go: ${moduleName}`);
        },
        cleanup: async () => {
          console.log(`🚀 Limpiando módulo Go: ${moduleName}`);
        },
        language: 'go',
        filePath
      };
    } catch (error) {
      console.error(`Error cargando módulo Go ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Carga un módulo Rust (futuro)
   */
  private async loadRustModule(filePath: string): Promise<ModuleWrapper | null> {
    // Implementación futura para Rust
    return null;
  }

  /**
   * Extrae el nombre del módulo desde la ruta del archivo
   */
  private extractModuleName(filePath: string): string {
    const fileName = filePath.split('/').pop() || '';
    return fileName.replace(/\.(ts|tsx|js|jsx|py|go|rs)$/, '');
  }

  /**
   * Registra un módulo en el coordinador
   */
  registerModule(module: ModuleWrapper): void {
    if (this.modules.has(module.name)) {
      console.warn(`⚠️ Módulo ${module.name} ya registrado, sobrescribiendo`);
    }
    
    this.modules.set(module.name, module);
    this.messageBus.publish('module-registered', { moduleName: module.name, language: module.language });
  }

  /**
   * Carga un grupo de módulos para un usuario específico
   */
  async loadModuleGroupForUser(groupName: keyof typeof ModuleGroups, userId: string): Promise<void> {
    const startTime = performance.now();
    
    try {
      const moduleNames = ModuleGroups[groupName];
      if (!moduleNames) {
        throw new Error(`Grupo de módulos '${groupName}' no definido`);
      }

      console.log(`🔄 Cargando grupo '${groupName}' para usuario ${userId}...`);
      
      // Resolver dependencias
      const loadOrder = this.dependencyResolver.resolveLoadOrder(moduleNames, this.modules);
      
      // Cargar módulos en orden
      for (const moduleName of loadOrder) {
        await this.loadModuleForUser(moduleName, userId);
      }

      const loadTime = performance.now() - startTime;
      this.performanceMonitor.recordMetric(`group_load_time_${groupName}`, loadTime);
      
      console.log(`✅ Grupo '${groupName}' cargado en ${loadTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error(`❌ Error cargando grupo '${groupName}':`, error);
      throw error;
    }
  }

  /**
   * Carga un módulo específico para un usuario
   */
  private async loadModuleForUser(moduleName: string, userId: string): Promise<void> {
    const module = this.modules.get(moduleName);
    if (!module) {
      throw new Error(`Módulo '${moduleName}' no encontrado`);
    }

    // Verificar si ya está activo para el usuario
    if (this.userActiveModules.get(userId)?.has(moduleName)) {
      return;
    }

    try {
      await module.initialize(userId);
      
      // Registrar como activo para el usuario
      if (!this.userActiveModules.has(userId)) {
        this.userActiveModules.set(userId, new Set());
      }
      this.userActiveModules.get(userId)!.add(moduleName);
      
      console.log(`✅ Módulo '${moduleName}' inicializado para usuario ${userId}`);
      
    } catch (error) {
      console.error(`❌ Error inicializando módulo '${moduleName}':`, error);
      throw error;
    }
  }

  /**
   * Obtiene la API pública de un módulo
   */
  getModulePublicAPI(moduleName: string): ModulePublicAPI | undefined {
    const module = this.modules.get(moduleName);
    return module?.publicAPI;
  }

  /**
   * Registra un componente React
   */
  registerComponent(name: string, component: any): void {
    this.componentRegistry.set(name, component);
    this.messageBus.publish('component-registered', { componentName: name });
  }

  /**
   * Obtiene un componente registrado
   */
  getComponent(name: string): any {
    return this.componentRegistry.get(name);
  }

  /**
   * Obtiene estadísticas del coordinador
   */
  getStats(): any {
    return {
      totalModules: this.modules.size,
      activeUsers: this.userActiveModules.size,
      registeredComponents: this.componentRegistry.size,
      languages: this.getLanguageStats(),
      performance: this.performanceMonitor.getStats()
    };
  }

  /**
   * Obtiene estadísticas por lenguaje
   */
  private getLanguageStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const module of this.modules.values()) {
      const lang = module.language || 'unknown';
      stats[lang] = (stats[lang] || 0) + 1;
    }
    
    return stats;
  }

  /**
   * Limpia recursos para un usuario
   */
  async cleanupUser(userId: string): Promise<void> {
    const activeModules = this.userActiveModules.get(userId);
    if (!activeModules) return;

    for (const moduleName of activeModules) {
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
    console.log(`🧹 Recursos limpiados para usuario ${userId}`);
  }

  /**
   * Inicializa el coordinador
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Inicializando CentralModuleCoordinator...');
      
      await this.autoDiscoverModules();
      await this.messageBus.initialize();
      
      this.isInitialized = true;
      console.log('✅ CentralModuleCoordinator inicializado');
      
    } catch (error) {
      console.error('❌ Error inicializando CentralModuleCoordinator:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const centralCoordinator = CentralModuleCoordinator.getInstance(); 