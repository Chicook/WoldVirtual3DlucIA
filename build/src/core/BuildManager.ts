import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { Logger } from '../utils/Logger';
import { ProjectProgress, ModuleProgress } from './ProjectProgress';

export interface BuildConfig {
  environment: 'development' | 'staging' | 'production';
  parallel: boolean;
  maxConcurrency: number;
  optimize: boolean;
  compress: boolean;
  sign: boolean;
  verify: boolean;
  clean: boolean;
  watch: boolean;
  modules: string[];
  excludeModules: string[];
}

export interface BuildResult {
  success: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  stats: BuildStats;
}

export interface BuildStats {
  totalFiles: number;
  totalSize: number;
  compressedSize: number;
  optimizationRatio: number;
  buildTime: number;
  modulesBuilt: number;
  modulesFailed: number;
}

export class BuildManager extends EventEmitter {
  private logger: Logger;
  private progress: ProjectProgress;
  private config: BuildConfig;
  private spinner: ora.Ora;
  private startTime: Date;
  private buildQueue: string[] = [];
  private activeBuilds: Set<string> = new Set();
  private results: Map<string, BuildResult> = new Map();

  constructor(config: Partial<BuildConfig> = {}) {
    super();
    this.logger = new Logger('BuildManager');
    this.progress = new ProjectProgress();
    this.config = this.mergeDefaultConfig(config);
    this.spinner = ora('Inicializando sistema de build...').start();
    this.startTime = new Date();
    
    this.setupEventListeners();
  }

  private mergeDefaultConfig(config: Partial<BuildConfig>): BuildConfig {
    return {
      environment: 'development',
      parallel: true,
      maxConcurrency: 4,
      optimize: true,
      compress: true,
      sign: false,
      verify: true,
      clean: true,
      watch: false,
      modules: [],
      excludeModules: [],
      ...config
    };
  }

  private setupEventListeners(): void {
    this.progress.on('module-started', (moduleName: string) => {
      this.logger.info(`Build iniciado: ${moduleName}`);
      this.emit('module-started', moduleName);
    });

    this.progress.on('module-completed', (moduleName: string) => {
      this.logger.success(`Build completado: ${moduleName}`);
      this.emit('module-completed', moduleName);
      this.processNextInQueue();
    });

    this.progress.on('module-error', (moduleName: string, error: string) => {
      this.logger.error(`Error en build: ${moduleName} - ${error}`);
      this.emit('module-error', moduleName, error);
      this.processNextInQueue();
    });

    this.progress.on('module-progress', (moduleName: string, progress: number) => {
      this.updateSpinner(moduleName, progress);
      this.emit('module-progress', moduleName, progress);
    });
  }

  public async build(): Promise<BuildResult> {
    try {
      this.spinner.succeed('Sistema de build inicializado');
      
      if (this.config.clean) {
        await this.cleanBuild();
      }

      const modules = this.getModulesToBuild();
      this.buildQueue = [...modules];
      
      this.logger.info(`Iniciando build de ${modules.length} módulos`);
      this.logger.info(`Configuración: ${JSON.stringify(this.config, null, 2)}`);

      if (this.config.parallel) {
        await this.buildParallel();
      } else {
        await this.buildSequential();
      }

      const result = this.generateBuildResult();
      this.displayBuildSummary(result);
      
      return result;
    } catch (error) {
      this.logger.error(`Error en build: ${error}`);
      return {
        success: false,
        duration: Date.now() - this.startTime.getTime(),
        errors: [error.toString()],
        warnings: [],
        stats: this.generateEmptyStats()
      };
    }
  }

  private async buildParallel(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < Math.min(this.config.maxConcurrency, this.buildQueue.length); i++) {
      promises.push(this.processNextInQueue());
    }

    await Promise.all(promises);
  }

  private async buildSequential(): Promise<void> {
    while (this.buildQueue.length > 0) {
      await this.processNextInQueue();
    }
  }

  private async processNextInQueue(): Promise<void> {
    if (this.buildQueue.length === 0) return;

    const moduleName = this.buildQueue.shift()!;
    if (this.activeBuilds.has(moduleName)) return;

    this.activeBuilds.add(moduleName);
    
    try {
      await this.buildModule(moduleName);
    } catch (error) {
      this.logger.error(`Error construyendo módulo ${moduleName}: ${error}`);
      this.progress.setModuleError(moduleName, error.toString());
    } finally {
      this.activeBuilds.delete(moduleName);
    }

    // Si hay más módulos en la cola y estamos en modo paralelo, procesar el siguiente
    if (this.config.parallel && this.buildQueue.length > 0 && this.activeBuilds.size < this.config.maxConcurrency) {
      this.processNextInQueue();
    }
  }

  private async buildModule(moduleName: string): Promise<void> {
    const moduleStartTime = Date.now();
    this.progress.startModule(moduleName);

    try {
      // Simular progreso del build
      for (let progress = 0; progress <= 100; progress += 10) {
        this.progress.updateModuleProgress(moduleName, progress);
        await this.simulateBuildStep(moduleName, progress);
      }

      // Aplicar optimizaciones si están habilitadas
      if (this.config.optimize) {
        await this.optimizeModule(moduleName);
      }

      // Aplicar compresión si está habilitada
      if (this.config.compress) {
        await this.compressModule(moduleName);
      }

      // Verificar build si está habilitado
      if (this.config.verify) {
        await this.verifyModule(moduleName);
      }

      // Firmar build si está habilitado
      if (this.config.sign) {
        await this.signModule(moduleName);
      }

      const duration = Date.now() - moduleStartTime;
      this.progress.completeModule(moduleName);
      
      this.results.set(moduleName, {
        success: true,
        duration,
        errors: [],
        warnings: [],
        stats: this.generateModuleStats(moduleName, duration)
      });

    } catch (error) {
      const duration = Date.now() - moduleStartTime;
      this.progress.setModuleError(moduleName, error.toString());
      
      this.results.set(moduleName, {
        success: false,
        duration,
        errors: [error.toString()],
        warnings: [],
        stats: this.generateModuleStats(moduleName, duration)
      });
      
      throw error;
    }
  }

  private async simulateBuildStep(moduleName: string, progress: number): Promise<void> {
    // Simular diferentes pasos del build según el módulo
    const steps = [
      'Analizando dependencias...',
      'Compilando código...',
      'Optimizando assets...',
      'Generando bundles...',
      'Aplicando transformaciones...',
      'Validando build...',
      'Generando documentación...',
      'Ejecutando tests...',
      'Optimizando tamaño...',
      'Finalizando build...'
    ];

    const stepIndex = Math.floor(progress / 10);
    if (stepIndex < steps.length) {
      this.updateSpinner(moduleName, progress, steps[stepIndex]);
    }

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  }

  private async optimizeModule(moduleName: string): Promise<void> {
    this.logger.info(`Optimizando módulo: ${moduleName}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async compressModule(moduleName: string): Promise<void> {
    this.logger.info(`Comprimiendo módulo: ${moduleName}`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private async verifyModule(moduleName: string): Promise<void> {
    this.logger.info(`Verificando módulo: ${moduleName}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async signModule(moduleName: string): Promise<void> {
    this.logger.info(`Firmando módulo: ${moduleName}`);
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  private async cleanBuild(): Promise<void> {
    this.logger.info('Limpiando directorios de build...');
    const dirsToClean = ['dist', 'build', 'out', 'target', '.cache'];
    
    for (const dir of dirsToClean) {
      if (await fs.pathExists(dir)) {
        await fs.remove(dir);
      }
    }
  }

  private getModulesToBuild(): string[] {
    const allModules = Array.from(this.progress['modules'].keys());
    
    if (this.config.modules.length > 0) {
      return allModules.filter(module => this.config.modules.includes(module));
    }
    
    if (this.config.excludeModules.length > 0) {
      return allModules.filter(module => !this.config.excludeModules.includes(module));
    }
    
    return allModules;
  }

  private updateSpinner(moduleName: string, progress: number, step?: string): void {
    const stepText = step ? ` - ${step}` : '';
    this.spinner.text = `Construyendo ${moduleName} (${progress}%)${stepText}`;
  }

  private generateModuleStats(moduleName: string, duration: number): BuildStats {
    return {
      totalFiles: Math.floor(Math.random() * 100) + 10,
      totalSize: Math.floor(Math.random() * 1000000) + 100000,
      compressedSize: Math.floor(Math.random() * 500000) + 50000,
      optimizationRatio: Math.random() * 0.5 + 0.3,
      buildTime: duration,
      modulesBuilt: 1,
      modulesFailed: 0
    };
  }

  private generateEmptyStats(): BuildStats {
    return {
      totalFiles: 0,
      totalSize: 0,
      compressedSize: 0,
      optimizationRatio: 0,
      buildTime: 0,
      modulesBuilt: 0,
      modulesFailed: 0
    };
  }

  private generateBuildResult(): BuildResult {
    const duration = Date.now() - this.startTime.getTime();
    const allResults = Array.from(this.results.values());
    
    const totalErrors = allResults.flatMap(r => r.errors);
    const totalWarnings = allResults.flatMap(r => r.warnings);
    const successfulBuilds = allResults.filter(r => r.success);
    const failedBuilds = allResults.filter(r => !r.success);

    const stats: BuildStats = {
      totalFiles: allResults.reduce((sum, r) => sum + r.stats.totalFiles, 0),
      totalSize: allResults.reduce((sum, r) => sum + r.stats.totalSize, 0),
      compressedSize: allResults.reduce((sum, r) => sum + r.stats.compressedSize, 0),
      optimizationRatio: allResults.length > 0 ? 
        allResults.reduce((sum, r) => sum + r.stats.optimizationRatio, 0) / allResults.length : 0,
      buildTime: duration,
      modulesBuilt: successfulBuilds.length,
      modulesFailed: failedBuilds.length
    };

    return {
      success: failedBuilds.length === 0,
      duration,
      errors: totalErrors,
      warnings: totalWarnings,
      stats
    };
  }

  private displayBuildSummary(result: BuildResult): void {
    this.spinner.stop();
    
    console.log('\n' + chalk.bold.blue('🏗️ RESUMEN DEL BUILD') + '\n');
    
    if (result.success) {
      console.log(chalk.green('✅ Build completado exitosamente'));
    } else {
      console.log(chalk.red('❌ Build completado con errores'));
    }
    
    console.log(chalk.gray(`Tiempo total: ${(result.duration / 1000).toFixed(2)}s`));
    console.log(chalk.gray(`Módulos construidos: ${result.stats.modulesBuilt}`));
    console.log(chalk.gray(`Módulos fallidos: ${result.stats.modulesFailed}`));
    console.log(chalk.gray(`Archivos totales: ${result.stats.totalFiles}`));
    console.log(chalk.gray(`Tamaño total: ${(result.stats.totalSize / 1024 / 1024).toFixed(2)}MB`));
    console.log(chalk.gray(`Tamaño comprimido: ${(result.stats.compressedSize / 1024 / 1024).toFixed(2)}MB`));
    console.log(chalk.gray(`Ratio de optimización: ${(result.stats.optimizationRatio * 100).toFixed(1)}%`));
    
    if (result.errors.length > 0) {
      console.log('\n' + chalk.red('❌ Errores:'));
      result.errors.forEach(error => {
        console.log(chalk.red(`  - ${error}`));
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n' + chalk.yellow('⚠️ Advertencias:'));
      result.warnings.forEach(warning => {
        console.log(chalk.yellow(`  - ${warning}`));
      });
    }
    
    console.log('\n' + chalk.bold('📊 PROGRESO DEL PROYECTO:'));
    this.progress.displayStatus();
  }

  public getProgress(): ProjectProgress {
    return this.progress;
  }

  public getConfig(): BuildConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<BuildConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async watch(): Promise<void> {
    if (!this.config.watch) return;
    
    this.logger.info('Iniciando modo watch...');
    // Implementar lógica de watch
  }

  public async stop(): Promise<void> {
    this.spinner.stop();
    this.logger.info('Deteniendo sistema de build...');
  }
} 