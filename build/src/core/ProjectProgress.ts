import { EventEmitter } from 'events';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { Logger } from '../utils/Logger';

export interface ModuleProgress {
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'error' | 'blocked';
  progress: number; // 0-100
  tasks: TaskProgress[];
  dependencies: string[];
  estimatedTime?: number; // en minutos
  actualTime?: number; // en minutos
  lastUpdated: Date;
  errors?: string[];
  warnings?: string[];
}

export interface TaskProgress {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'skipped';
  progress: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  duration?: number; // en segundos
  errors?: string[];
  warnings?: string[];
}

export interface ProjectStatus {
  totalProgress: number;
  completedModules: number;
  totalModules: number;
  inProgressModules: number;
  blockedModules: number;
  errorModules: number;
  estimatedCompletionTime?: Date;
  lastUpdated: Date;
  modules: ModuleProgress[];
}

export class ProjectProgress extends EventEmitter {
  private logger: Logger;
  private modules: Map<string, ModuleProgress> = new Map();
  private tasks: Map<string, TaskProgress> = new Map();
  private statusFile: string;
  private spinner: ora.Ora;

  constructor(statusFile: string = 'project-status.json') {
    super();
    this.logger = new Logger('ProjectProgress');
    this.statusFile = path.resolve(statusFile);
    this.spinner = ora('Inicializando sistema de progreso...').start();
    this.initializeModules();
  }

  private initializeModules(): void {
    // Módulos principales del proyecto
    const moduleDefinitions = [
      {
        name: 'blockchain',
        description: 'Sistema de blockchain personalizado con consenso PoS',
        dependencies: [],
        estimatedTime: 120
      },
      {
        name: 'smart-contracts',
        description: 'Contratos inteligentes para assets, usuarios y metaversos',
        dependencies: ['blockchain'],
        estimatedTime: 90
      },
      {
        name: 'bridge-bsc',
        description: 'Puente entre BSC y blockchain personalizada',
        dependencies: ['blockchain', 'smart-contracts'],
        estimatedTime: 60
      },
      {
        name: 'gas-abstraction',
        description: 'Sistema de abstracción de gas fees',
        dependencies: ['smart-contracts'],
        estimatedTime: 45
      },
      {
        name: 'frontend',
        description: 'Interfaz de usuario con Three.js y React',
        dependencies: ['smart-contracts'],
        estimatedTime: 180
      },
      {
        name: 'backend',
        description: 'API y servicios backend',
        dependencies: ['smart-contracts'],
        estimatedTime: 120
      },
      {
        name: 'assets',
        description: 'Sistema de gestión de assets multimedia',
        dependencies: ['smart-contracts'],
        estimatedTime: 90
      },
      {
        name: 'metaverso',
        description: 'Motor del metaverso y mundos virtuales',
        dependencies: ['frontend', 'backend', 'assets'],
        estimatedTime: 150
      },
      {
        name: 'avatars',
        description: 'Sistema de avatares personalizables',
        dependencies: ['metaverso'],
        estimatedTime: 75
      },
      {
        name: 'nfts',
        description: 'Sistema de NFTs y marketplace',
        dependencies: ['smart-contracts', 'assets'],
        estimatedTime: 60
      },
      {
        name: 'defi',
        description: 'Protocolos DeFi y staking',
        dependencies: ['smart-contracts'],
        estimatedTime: 90
      },
      {
        name: 'governance',
        description: 'Sistema de gobernanza descentralizada',
        dependencies: ['smart-contracts', 'defi'],
        estimatedTime: 45
      },
      {
        name: 'monitoring',
        description: 'Sistema de monitoreo y métricas',
        dependencies: ['backend'],
        estimatedTime: 60
      },
      {
        name: 'security',
        description: 'Auditorías de seguridad y validaciones',
        dependencies: ['smart-contracts'],
        estimatedTime: 120
      },
      {
        name: 'deployment',
        description: 'Sistema de despliegue y CI/CD',
        dependencies: ['monitoring'],
        estimatedTime: 90
      },
      {
        name: 'documentation',
        description: 'Documentación completa del proyecto',
        dependencies: [],
        estimatedTime: 60
      },
      {
        name: 'testing',
        description: 'Suite completa de pruebas',
        dependencies: ['smart-contracts', 'frontend', 'backend'],
        estimatedTime: 120
      },
      {
        name: 'optimization',
        description: 'Optimización de rendimiento y gas',
        dependencies: ['smart-contracts', 'frontend'],
        estimatedTime: 90
      }
    ];

    moduleDefinitions.forEach(moduleDef => {
      this.modules.set(moduleDef.name, {
        name: moduleDef.name,
        description: moduleDef.description,
        status: 'not-started',
        progress: 0,
        tasks: [],
        dependencies: moduleDef.dependencies,
        estimatedTime: moduleDef.estimatedTime,
        lastUpdated: new Date()
      });
    });

    this.spinner.succeed('Sistema de progreso inicializado');
    this.saveStatus();
  }

  public startModule(moduleName: string): void {
    const module = this.modules.get(moduleName);
    if (!module) {
      this.logger.error(`Módulo ${moduleName} no encontrado`);
      return;
    }

    // Verificar dependencias
    const blockedDependencies = module.dependencies.filter(dep => {
      const depModule = this.modules.get(dep);
      return depModule && depModule.status !== 'completed';
    });

    if (blockedDependencies.length > 0) {
      module.status = 'blocked';
      module.errors = [`Dependencias bloqueadas: ${blockedDependencies.join(', ')}`];
      this.logger.warn(`Módulo ${moduleName} bloqueado por dependencias: ${blockedDependencies.join(', ')}`);
      this.saveStatus();
      return;
    }

    module.status = 'in-progress';
    module.lastUpdated = new Date();
    this.logger.info(`Iniciando módulo: ${moduleName}`);
    this.emit('module-started', moduleName);
    this.saveStatus();
  }

  public completeModule(moduleName: string): void {
    const module = this.modules.get(moduleName);
    if (!module) {
      this.logger.error(`Módulo ${moduleName} no encontrado`);
      return;
    }

    module.status = 'completed';
    module.progress = 100;
    module.lastUpdated = new Date();
    module.actualTime = this.calculateActualTime(module);

    this.logger.success(`Módulo completado: ${moduleName}`);
    this.emit('module-completed', moduleName);
    this.saveStatus();

    // Verificar si otros módulos pueden iniciar
    this.checkBlockedModules();
  }

  public updateModuleProgress(moduleName: string, progress: number, taskName?: string): void {
    const module = this.modules.get(moduleName);
    if (!module) {
      this.logger.error(`Módulo ${moduleName} no encontrado`);
      return;
    }

    module.progress = Math.min(100, Math.max(0, progress));
    module.lastUpdated = new Date();

    if (taskName) {
      this.updateTaskProgress(moduleName, taskName, progress);
    }

    this.logger.info(`Progreso actualizado: ${moduleName} - ${progress}%`);
    this.emit('module-progress', moduleName, progress);
    this.saveStatus();
  }

  public addTask(moduleName: string, task: TaskProgress): void {
    const module = this.modules.get(moduleName);
    if (!module) {
      this.logger.error(`Módulo ${moduleName} no encontrado`);
      return;
    }

    module.tasks.push(task);
    this.tasks.set(task.id, task);
    this.logger.info(`Tarea agregada: ${moduleName} - ${task.name}`);
    this.saveStatus();
  }

  public updateTaskProgress(moduleName: string, taskName: string, progress: number): void {
    const module = this.modules.get(moduleName);
    if (!module) return;

    const task = module.tasks.find(t => t.name === taskName);
    if (!task) return;

    task.progress = Math.min(100, Math.max(0, progress));
    task.status = progress === 100 ? 'completed' : 'in-progress';

    if (progress === 100 && !task.endTime) {
      task.endTime = new Date();
      task.duration = task.startTime ? 
        (task.endTime.getTime() - task.startTime.getTime()) / 1000 : 0;
    }

    this.logger.info(`Progreso de tarea actualizado: ${moduleName} - ${taskName} - ${progress}%`);
    this.saveStatus();
  }

  public setModuleError(moduleName: string, error: string): void {
    const module = this.modules.get(moduleName);
    if (!module) return;

    module.status = 'error';
    module.errors = module.errors || [];
    module.errors.push(error);
    module.lastUpdated = new Date();

    this.logger.error(`Error en módulo ${moduleName}: ${error}`);
    this.emit('module-error', moduleName, error);
    this.saveStatus();
  }

  public setModuleWarning(moduleName: string, warning: string): void {
    const module = this.modules.get(moduleName);
    if (!module) return;

    module.warnings = module.warnings || [];
    module.warnings.push(warning);
    module.lastUpdated = new Date();

    this.logger.warn(`Advertencia en módulo ${moduleName}: ${warning}`);
    this.emit('module-warning', moduleName, warning);
    this.saveStatus();
  }

  private checkBlockedModules(): void {
    this.modules.forEach((module, moduleName) => {
      if (module.status === 'blocked') {
        const canStart = module.dependencies.every(dep => {
          const depModule = this.modules.get(dep);
          return depModule && depModule.status === 'completed';
        });

        if (canStart) {
          module.status = 'not-started';
          module.errors = undefined;
          this.logger.info(`Módulo ${moduleName} desbloqueado`);
          this.emit('module-unblocked', moduleName);
        }
      }
    });
  }

  private calculateActualTime(module: ModuleProgress): number {
    if (!module.startTime) return 0;
    
    const endTime = module.lastUpdated;
    return (endTime.getTime() - module.startTime.getTime()) / (1000 * 60); // en minutos
  }

  public getStatus(): ProjectStatus {
    const modules = Array.from(this.modules.values());
    const completedModules = modules.filter(m => m.status === 'completed').length;
    const inProgressModules = modules.filter(m => m.status === 'in-progress').length;
    const blockedModules = modules.filter(m => m.status === 'blocked').length;
    const errorModules = modules.filter(m => m.status === 'error').length;

    const totalProgress = modules.reduce((sum, module) => sum + module.progress, 0) / modules.length;

    return {
      totalProgress: Math.round(totalProgress * 100) / 100,
      completedModules,
      totalModules: modules.length,
      inProgressModules,
      blockedModules,
      errorModules,
      lastUpdated: new Date(),
      modules
    };
  }

  public displayStatus(): void {
    const status = this.getStatus();
    
    console.log('\n' + chalk.bold.blue('📊 ESTADO DEL PROYECTO WOLDVIRTUAL3D') + '\n');
    console.log(chalk.bold(`Progreso General: ${chalk.green(status.totalProgress.toFixed(1))}%`));
    console.log(chalk.gray(`Módulos completados: ${status.completedModules}/${status.totalModules}`));
    console.log(chalk.gray(`En progreso: ${status.inProgressModules} | Bloqueados: ${status.blockedModules} | Errores: ${status.errorModules}`));
    
    if (status.estimatedCompletionTime) {
      console.log(chalk.gray(`Tiempo estimado de finalización: ${status.estimatedCompletionTime.toLocaleString()}`));
    }
    
    console.log('\n' + chalk.bold('📋 MÓDULOS:') + '\n');

    status.modules.forEach(module => {
      const statusIcon = this.getStatusIcon(module.status);
      const progressBar = this.createProgressBar(module.progress);
      const timeInfo = module.actualTime ? 
        `(${module.actualTime.toFixed(1)}m)` : 
        module.estimatedTime ? `(estimado: ${module.estimatedTime}m)` : '';

      console.log(`${statusIcon} ${chalk.bold(module.name)} ${chalk.gray(timeInfo)}`);
      console.log(`   ${chalk.gray(module.description)}`);
      console.log(`   ${progressBar} ${module.progress.toFixed(1)}%`);
      
      if (module.errors && module.errors.length > 0) {
        module.errors.forEach(error => {
          console.log(`   ${chalk.red('❌')} ${chalk.red(error)}`);
        });
      }
      
      if (module.warnings && module.warnings.length > 0) {
        module.warnings.forEach(warning => {
          console.log(`   ${chalk.yellow('⚠️')} ${chalk.yellow(warning)}`);
        });
      }
      
      console.log('');
    });
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return chalk.green('✅');
      case 'in-progress': return chalk.blue('🔄');
      case 'blocked': return chalk.red('🚫');
      case 'error': return chalk.red('❌');
      default: return chalk.gray('⏳');
    }
  }

  private createProgressBar(progress: number): string {
    const width = 20;
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    
    const filledBar = chalk.green('█'.repeat(filled));
    const emptyBar = chalk.gray('░'.repeat(empty));
    
    return filledBar + emptyBar;
  }

  private saveStatus(): void {
    try {
      const status = this.getStatus();
      fs.writeJsonSync(this.statusFile, status, { spaces: 2 });
    } catch (error) {
      this.logger.error(`Error guardando estado: ${error}`);
    }
  }

  public loadStatus(): void {
    try {
      if (fs.existsSync(this.statusFile)) {
        const status = fs.readJsonSync(this.statusFile);
        status.modules.forEach((module: ModuleProgress) => {
          this.modules.set(module.name, module);
        });
        this.logger.info('Estado del proyecto cargado');
      }
    } catch (error) {
      this.logger.error(`Error cargando estado: ${error}`);
    }
  }

  public exportReport(format: 'json' | 'html' | 'markdown' = 'json'): string {
    const status = this.getStatus();
    
    switch (format) {
      case 'json':
        return JSON.stringify(status, null, 2);
      case 'html':
        return this.generateHtmlReport(status);
      case 'markdown':
        return this.generateMarkdownReport(status);
      default:
        return JSON.stringify(status, null, 2);
    }
  }

  private generateHtmlReport(status: ProjectStatus): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>WoldVirtual3D - Reporte de Progreso</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .module { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .progress-bar { background: #eee; height: 20px; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: #4CAF50; transition: width 0.3s; }
        .completed { border-left: 5px solid #4CAF50; }
        .in-progress { border-left: 5px solid #2196F3; }
        .blocked { border-left: 5px solid #f44336; }
        .error { border-left: 5px solid #ff9800; }
    </style>
</head>
<body>
    <div class="header">
        <h1>WoldVirtual3D - Reporte de Progreso</h1>
        <p>Progreso General: ${status.totalProgress.toFixed(1)}%</p>
        <p>Módulos completados: ${status.completedModules}/${status.totalModules}</p>
    </div>
    
    ${status.modules.map(module => `
        <div class="module ${module.status}">
            <h3>${module.name}</h3>
            <p>${module.description}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${module.progress}%"></div>
            </div>
            <p>${module.progress.toFixed(1)}% - ${module.status}</p>
        </div>
    `).join('')}
</body>
</html>`;
  }

  private generateMarkdownReport(status: ProjectStatus): string {
    return `# WoldVirtual3D - Reporte de Progreso

## Resumen General
- **Progreso Total**: ${status.totalProgress.toFixed(1)}%
- **Módulos Completados**: ${status.completedModules}/${status.totalModules}
- **En Progreso**: ${status.inProgressModules}
- **Bloqueados**: ${status.blockedModules}
- **Con Errores**: ${status.errorModules}

## Módulos

${status.modules.map(module => `
### ${module.name}
- **Descripción**: ${module.description}
- **Estado**: ${module.status}
- **Progreso**: ${module.progress.toFixed(1)}%
- **Tiempo Estimado**: ${module.estimatedTime || 'N/A'} minutos
${module.actualTime ? `- **Tiempo Real**: ${module.actualTime.toFixed(1)} minutos` : ''}
${module.errors && module.errors.length > 0 ? `- **Errores**: ${module.errors.join(', ')}` : ''}
${module.warnings && module.warnings.length > 0 ? `- **Advertencias**: ${module.warnings.join(', ')}` : ''}
`).join('\n')}`;
  }
} 