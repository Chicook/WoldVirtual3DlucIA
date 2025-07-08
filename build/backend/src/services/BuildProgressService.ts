import { Logger } from '../utils/Logger';
import { cacheManager } from '../cache/CacheManager';
import { databaseManager } from '../database/DatabaseManager';
import { EventEmitter } from 'events';

export interface BuildProgress {
  moduleName: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentStep: string;
  totalSteps: number;
  currentStepNumber: number;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
  warnings: string[];
  metadata: any;
  lastUpdated: Date;
}

export interface BuildStep {
  name: string;
  description: string;
  weight: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
}

export interface ModuleProgress {
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentStep: string;
  totalSteps: number;
  currentStepNumber: number;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
  warnings: string[];
  buildSize?: number;
  compressedSize?: number;
  optimizationRatio?: number;
  lastUpdated: Date;
}

export interface OverallProgress {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  failedModules: number;
  overallProgress: number;
  estimatedTimeRemaining?: number;
  modules: ModuleProgress[];
  lastUpdated: Date;
}

export class BuildProgressService extends EventEmitter {
  private static instance: BuildProgressService;
  private logger: Logger;
  private progressMap: Map<string, BuildProgress> = new Map();
  private stepsMap: Map<string, BuildStep[]> = new Map();

  private constructor() {
    super();
    this.logger = new Logger('BuildProgressService');
    this.initializeDefaultSteps();
  }

  public static getInstance(): BuildProgressService {
    if (!BuildProgressService.instance) {
      BuildProgressService.instance = new BuildProgressService();
    }
    return BuildProgressService.instance;
  }

  public static async initialize(): Promise<void> {
    const instance = BuildProgressService.getInstance();
    await instance.loadProgressFromDatabase();
  }

  private initializeDefaultSteps(): void {
    // Pasos por defecto para cada módulo
    const defaultSteps: BuildStep[] = [
      { name: 'validation', description: 'Validando configuración', weight: 5, status: 'pending' },
      { name: 'dependencies', description: 'Instalando dependencias', weight: 10, status: 'pending' },
      { name: 'compilation', description: 'Compilando código', weight: 30, status: 'pending' },
      { name: 'testing', description: 'Ejecutando tests', weight: 20, status: 'pending' },
      { name: 'optimization', description: 'Optimizando build', weight: 25, status: 'pending' },
      { name: 'packaging', description: 'Empaquetando', weight: 10, status: 'pending' }
    ];

    const modules = [
      'blockchain', 'smart-contracts', 'bridge-bsc', 'gas-abstraction',
      'frontend', 'backend', 'assets', 'metaverso'
    ];

    modules.forEach(module => {
      this.stepsMap.set(module, JSON.parse(JSON.stringify(defaultSteps)));
    });
  }

  private async loadProgressFromDatabase(): Promise<void> {
    try {
      this.logger.info('Cargando progreso desde la base de datos...');
      
      const prisma = databaseManager.getClient();
      const modules = await prisma.buildModule.findMany();
      
      for (const module of modules) {
        const progress: BuildProgress = {
          moduleName: module.name,
          status: module.status as any,
          progress: module.progress,
          currentStep: this.getCurrentStepName(module.name),
          totalSteps: this.getTotalSteps(module.name),
          currentStepNumber: this.getCurrentStepNumber(module.name, module.progress),
          startTime: module.createdAt,
          endTime: module.status === 'completed' ? module.updatedAt : undefined,
          duration: module.status === 'completed' ? 
            module.updatedAt.getTime() - module.createdAt.getTime() : undefined,
          warnings: [],
          metadata: {},
          lastUpdated: module.updatedAt
        };

        this.progressMap.set(module.name, progress);
      }
      
      this.logger.success(`Progreso cargado: ${modules.length} módulos`);
      
    } catch (error) {
      this.logger.error('Error cargando progreso desde la base de datos', error as Error);
    }
  }

  public async startBuild(moduleName: string): Promise<void> {
    try {
      this.logger.info(`Iniciando build para módulo: ${moduleName}`);
      
      const progress: BuildProgress = {
        moduleName,
        status: 'in-progress',
        progress: 0,
        currentStep: 'validation',
        totalSteps: this.getTotalSteps(moduleName),
        currentStepNumber: 1,
        startTime: new Date(),
        warnings: [],
        metadata: {},
        lastUpdated: new Date()
      };

      this.progressMap.set(moduleName, progress);
      await this.saveProgress(moduleName);
      await this.updateCache(moduleName);
      
      this.emit('build-started', { moduleName, progress });
      this.logger.success(`Build iniciado para módulo: ${moduleName}`);
      
    } catch (error) {
      this.logger.error(`Error iniciando build para módulo: ${moduleName}`, error as Error);
      throw error;
    }
  }

  public async updateProgress(moduleName: string, progress: number, step?: string): Promise<void> {
    try {
      const currentProgress = this.progressMap.get(moduleName);
      if (!currentProgress) {
        throw new Error(`No se encontró progreso para el módulo: ${moduleName}`);
      }

      const updatedProgress: BuildProgress = {
        ...currentProgress,
        progress: Math.min(100, Math.max(0, progress)),
        currentStep: step || currentProgress.currentStep,
        currentStepNumber: this.getCurrentStepNumber(moduleName, progress),
        lastUpdated: new Date()
      };

      this.progressMap.set(moduleName, updatedProgress);
      await this.saveProgress(moduleName);
      await this.updateCache(moduleName);
      
      this.emit('progress-updated', { moduleName, progress: updatedProgress });
      
      // Si el progreso llegó al 100%, marcar como completado
      if (progress >= 100) {
        await this.completeBuild(moduleName);
      }
      
    } catch (error) {
      this.logger.error(`Error actualizando progreso para módulo: ${moduleName}`, error as Error);
      throw error;
    }
  }

  public async completeBuild(moduleName: string, metadata?: any): Promise<void> {
    try {
      this.logger.info(`Completando build para módulo: ${moduleName}`);
      
      const currentProgress = this.progressMap.get(moduleName);
      if (!currentProgress) {
        throw new Error(`No se encontró progreso para el módulo: ${moduleName}`);
      }

      const endTime = new Date();
      const duration = currentProgress.startTime ? 
        endTime.getTime() - currentProgress.startTime.getTime() : undefined;

      const completedProgress: BuildProgress = {
        ...currentProgress,
        status: 'completed',
        progress: 100,
        currentStep: 'completed',
        currentStepNumber: this.getTotalSteps(moduleName),
        endTime,
        duration,
        metadata: { ...currentProgress.metadata, ...metadata },
        lastUpdated: endTime
      };

      this.progressMap.set(moduleName, completedProgress);
      await this.saveProgress(moduleName);
      await this.updateCache(moduleName);
      
      this.emit('build-completed', { moduleName, progress: completedProgress });
      this.logger.success(`Build completado para módulo: ${moduleName}`);
      
    } catch (error) {
      this.logger.error(`Error completando build para módulo: ${moduleName}`, error as Error);
      throw error;
    }
  }

  public async failBuild(moduleName: string, error: string): Promise<void> {
    try {
      this.logger.error(`Fallando build para módulo: ${moduleName}`, new Error(error));
      
      const currentProgress = this.progressMap.get(moduleName);
      if (!currentProgress) {
        throw new Error(`No se encontró progreso para el módulo: ${moduleName}`);
      }

      const endTime = new Date();
      const duration = currentProgress.startTime ? 
        endTime.getTime() - currentProgress.startTime.getTime() : undefined;

      const failedProgress: BuildProgress = {
        ...currentProgress,
        status: 'failed',
        error,
        endTime,
        duration,
        lastUpdated: endTime
      };

      this.progressMap.set(moduleName, failedProgress);
      await this.saveProgress(moduleName);
      await this.updateCache(moduleName);
      
      this.emit('build-failed', { moduleName, progress: failedProgress });
      
    } catch (error) {
      this.logger.error(`Error fallando build para módulo: ${moduleName}`, error as Error);
      throw error;
    }
  }

  public async pauseBuild(moduleName: string): Promise<void> {
    try {
      this.logger.info(`Pausando build para módulo: ${moduleName}`);
      
      const currentProgress = this.progressMap.get(moduleName);
      if (!currentProgress) {
        throw new Error(`No se encontró progreso para el módulo: ${moduleName}`);
      }

      const pausedProgress: BuildProgress = {
        ...currentProgress,
        status: 'paused',
        lastUpdated: new Date()
      };

      this.progressMap.set(moduleName, pausedProgress);
      await this.saveProgress(moduleName);
      await this.updateCache(moduleName);
      
      this.emit('build-paused', { moduleName, progress: pausedProgress });
      
    } catch (error) {
      this.logger.error(`Error pausando build para módulo: ${moduleName}`, error as Error);
      throw error;
    }
  }

  public async getProgress(moduleName: string): Promise<BuildProgress | null> {
    try {
      // Intentar obtener del cache primero
      const cachedProgress = await cacheManager.getBuildProgress(moduleName);
      if (cachedProgress) {
        return cachedProgress;
      }

      // Si no está en cache, obtener de memoria
      const progress = this.progressMap.get(moduleName);
      if (progress) {
        await this.updateCache(moduleName);
        return progress;
      }

      return null;
      
    } catch (error) {
      this.logger.error(`Error obteniendo progreso para módulo: ${moduleName}`, error as Error);
      throw error;
    }
  }

  public async getCurrentProgress(): Promise<OverallProgress> {
    try {
      const modules = Array.from(this.progressMap.values());
      const totalModules = modules.length;
      const completedModules = modules.filter(m => m.status === 'completed').length;
      const inProgressModules = modules.filter(m => m.status === 'in-progress').length;
      const failedModules = modules.filter(m => m.status === 'failed').length;
      
      const overallProgress = totalModules > 0 ? 
        (completedModules / totalModules) * 100 : 0;

      const overall: OverallProgress = {
        totalModules,
        completedModules,
        inProgressModules,
        failedModules,
        overallProgress,
        modules: modules.map(m => this.convertToModuleProgress(m)),
        lastUpdated: new Date()
      };

      return overall;
      
    } catch (error) {
      this.logger.error('Error obteniendo progreso actual', error as Error);
      throw error;
    }
  }

  private convertToModuleProgress(buildProgress: BuildProgress): ModuleProgress {
    return {
      name: buildProgress.moduleName,
      description: this.getModuleDescription(buildProgress.moduleName),
      status: buildProgress.status,
      progress: buildProgress.progress,
      currentStep: buildProgress.currentStep,
      totalSteps: buildProgress.totalSteps,
      currentStepNumber: buildProgress.currentStepNumber,
      startTime: buildProgress.startTime,
      endTime: buildProgress.endTime,
      duration: buildProgress.duration,
      error: buildProgress.error,
      warnings: buildProgress.warnings,
      buildSize: buildProgress.metadata?.buildSize,
      compressedSize: buildProgress.metadata?.compressedSize,
      optimizationRatio: buildProgress.metadata?.optimizationRatio,
      lastUpdated: buildProgress.lastUpdated
    };
  }

  private getModuleDescription(moduleName: string): string {
    const descriptions: { [key: string]: string } = {
      'blockchain': 'Sistema de blockchain personalizado con consenso PoS',
      'smart-contracts': 'Contratos inteligentes para assets y metaverso',
      'bridge-bsc': 'Puente entre BSC y blockchain personalizada',
      'gas-abstraction': 'Sistema de abstracción de gas multi-red',
      'frontend': 'Interfaz de usuario del metaverso',
      'backend': 'API y servicios del backend',
      'assets': 'Sistema de gestión de assets 3D',
      'metaverso': 'Motor principal del metaverso'
    };
    
    return descriptions[moduleName] || 'Módulo del sistema';
  }

  private getTotalSteps(moduleName: string): number {
    const steps = this.stepsMap.get(moduleName);
    return steps ? steps.length : 6;
  }

  private getCurrentStepName(moduleName: string): string {
    const steps = this.stepsMap.get(moduleName);
    return steps ? steps[0].name : 'validation';
  }

  private getCurrentStepNumber(moduleName: string, progress: number): number {
    const totalSteps = this.getTotalSteps(moduleName);
    return Math.ceil((progress / 100) * totalSteps);
  }

  private async saveProgress(moduleName: string): Promise<void> {
    try {
      const progress = this.progressMap.get(moduleName);
      if (!progress) return;

      const prisma = databaseManager.getClient();
      await prisma.buildModule.update({
        where: { name: moduleName },
        data: {
          status: progress.status,
          progress: progress.progress,
          updatedAt: new Date()
        }
      });
      
    } catch (error) {
      this.logger.error(`Error guardando progreso para módulo: ${moduleName}`, error as Error);
    }
  }

  private async updateCache(moduleName: string): Promise<void> {
    try {
      const progress = this.progressMap.get(moduleName);
      if (progress) {
        await cacheManager.cacheBuildProgress(moduleName, progress);
      }
    } catch (error) {
      this.logger.error(`Error actualizando cache para módulo: ${moduleName}`, error as Error);
    }
  }

  public async close(): Promise<void> {
    try {
      this.logger.info('Cerrando servicio de progreso...');
      
      // Guardar todo el progreso actual
      for (const [moduleName] of this.progressMap) {
        await this.saveProgress(moduleName);
      }
      
      this.logger.success('Servicio de progreso cerrado');
      
    } catch (error) {
      this.logger.error('Error cerrando servicio de progreso', error as Error);
    }
  }
}

// Exportar instancia singleton
export const buildProgressService = BuildProgressService.getInstance(); 