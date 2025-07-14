const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const execAsync = promisify(exec);

class RestoreService {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.ready = false;
    this.operations = new Map();
    this.restoreQueue = [];
    this.maxConcurrentOperations = 3;
    this.activeOperations = 0;
    this.init();
  }

  async init() {
    try {
      this.ready = true;
      console.log('✅ RestoreService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando RestoreService:', error);
      this.ready = false;
    }
  }

  isReady() {
    return this.ready;
  }

  // Restauración de todas las dependencias
  async restoreAllDependencies() {
    try {
      console.log('🔄 Iniciando restauración de todas las dependencias...');
      
      const operation = this.createRestoreOperation('ALL', []);
      
      // Obtener todas las dependencias faltantes
      const missingDependencies = await this.getAllMissingDependencies();
      
      if (missingDependencies.length === 0) {
        operation.status = 'COMPLETED';
        operation.completedAt = new Date();
        operation.duration = Date.now() - operation.startedAt.getTime();
        operation.successCount = 0;
        operation.failureCount = 0;
        operation.warnings.push('No se encontraron dependencias faltantes');
        
        this.operations.set(operation.id, operation);
        return operation;
      }

      operation.packages = missingDependencies.map(dep => dep.name);
      operation.modules = [...new Set(missingDependencies.map(dep => dep.module.name))];
      
      this.operations.set(operation.id, operation);
      
      // Ejecutar restauración en segundo plano
      this.executeRestoreOperation(operation, missingDependencies);
      
      return operation;
    } catch (error) {
      console.error('❌ Error iniciando restauración de dependencias:', error);
      throw error;
    }
  }

  // Restauración selectiva de dependencias
  async restoreSelectiveDependencies(packages) {
    try {
      console.log(`🔄 Iniciando restauración selectiva: ${packages.join(', ')}`);
      
      const operation = this.createRestoreOperation('SELECTIVE', packages);
      
      // Obtener información de las dependencias especificadas
      const dependencies = await this.getDependenciesInfo(packages);
      
      operation.modules = [...new Set(dependencies.map(dep => dep.module?.name).filter(Boolean))];
      
      this.operations.set(operation.id, operation);
      
      // Ejecutar restauración en segundo plano
      this.executeRestoreOperation(operation, dependencies);
      
      return operation;
    } catch (error) {
      console.error('❌ Error iniciando restauración selectiva:', error);
      throw error;
    }
  }

  // Restauración por módulo
  async restoreModuleDependencies(moduleId) {
    try {
      console.log(`🔄 Iniciando restauración para módulo: ${moduleId}`);
      
      const operation = this.createRestoreOperation('MODULE', []);
      
      // Obtener dependencias faltantes del módulo
      const moduleDependencies = await this.getModuleMissingDependencies(moduleId);
      
      if (moduleDependencies.length === 0) {
        operation.status = 'COMPLETED';
        operation.completedAt = new Date();
        operation.duration = Date.now() - operation.startedAt.getTime();
        operation.successCount = 0;
        operation.failureCount = 0;
        operation.warnings.push('No se encontraron dependencias faltantes en el módulo');
        
        this.operations.set(operation.id, operation);
        return operation;
      }

      operation.packages = moduleDependencies.map(dep => dep.name);
      operation.modules = [moduleId];
      
      this.operations.set(operation.id, operation);
      
      // Ejecutar restauración en segundo plano
      this.executeRestoreOperation(operation, moduleDependencies);
      
      return operation;
    } catch (error) {
      console.error(`❌ Error restaurando dependencias del módulo ${moduleId}:`, error);
      throw error;
    }
  }

  // Restauración por paquete específico
  async restorePackageDependencies(packageName) {
    try {
      console.log(`🔄 Iniciando restauración para paquete: ${packageName}`);
      
      const operation = this.createRestoreOperation('PACKAGE', [packageName]);
      
      // Obtener información del paquete
      const packageInfo = await this.getPackageInfo(packageName);
      
      if (!packageInfo) {
        operation.status = 'FAILED';
        operation.completedAt = new Date();
        operation.duration = Date.now() - operation.startedAt.getTime();
        operation.successCount = 0;
        operation.failureCount = 1;
        operation.errors.push(`Paquete ${packageName} no encontrado`);
        
        this.operations.set(operation.id, operation);
        return operation;
      }

      operation.modules = await this.getModulesRequiringPackage(packageName);
      
      this.operations.set(operation.id, operation);
      
      // Ejecutar restauración en segundo plano
      this.executeRestoreOperation(operation, [packageInfo]);
      
      return operation;
    } catch (error) {
      console.error(`❌ Error restaurando paquete ${packageName}:`, error);
      throw error;
    }
  }

  // Ejecución de operación de restauración
  async executeRestoreOperation(operation, dependencies) {
    try {
      operation.status = 'IN_PROGRESS';
      this.activeOperations++;
      
      console.log(`🔄 Ejecutando operación ${operation.id}: ${dependencies.length} dependencias`);
      
      let successCount = 0;
      let failureCount = 0;
      const errors = [];
      const warnings = [];
      
      // Procesar dependencias en lotes para evitar sobrecarga
      const batchSize = 5;
      for (let i = 0; i < dependencies.length; i += batchSize) {
        const batch = dependencies.slice(i, i + batchSize);
        
        console.log(`📦 Procesando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(dependencies.length / batchSize)}`);
        
        for (const dependency of batch) {
          try {
            await this.restoreSingleDependency(dependency);
            successCount++;
            console.log(`✅ Dependencia restaurada: ${dependency.name}`);
          } catch (error) {
            failureCount++;
            errors.push(`Error restaurando ${dependency.name}: ${error.message}`);
            console.error(`❌ Error restaurando ${dependency.name}:`, error.message);
          }
        }
        
        // Pequeña pausa entre lotes
        await this.sleep(1000);
      }
      
      // Actualizar operación
      operation.status = failureCount === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS';
      operation.completedAt = new Date();
      operation.duration = Date.now() - operation.startedAt.getTime();
      operation.successCount = successCount;
      operation.failureCount = failureCount;
      operation.errors = errors;
      operation.warnings = warnings;
      
      this.activeOperations--;
      
      console.log(`✅ Operación ${operation.id} completada: ${successCount} exitosas, ${failureCount} fallidas`);
      
    } catch (error) {
      operation.status = 'FAILED';
      operation.completedAt = new Date();
      operation.duration = Date.now() - operation.startedAt.getTime();
      operation.errors.push(`Error general: ${error.message}`);
      this.activeOperations--;
      
      console.error(`❌ Error ejecutando operación ${operation.id}:`, error);
    }
  }

  // Restauración de una dependencia individual
  async restoreSingleDependency(dependency) {
    try {
      const modulePath = dependency.module?.path || this.projectRoot;
      
      // Verificar si ya está instalada
      if (await this.isDependencyInstalled(dependency.name, modulePath)) {
        console.log(`ℹ️  Dependencia ya instalada: ${dependency.name}`);
        return;
      }
      
      // Instalar dependencia
      const command = `npm install ${dependency.name}@${dependency.version || 'latest'}`;
      const { stdout, stderr } = await execAsync(command, { cwd: modulePath });
      
      if (stderr && !stderr.includes('npm WARN')) {
        throw new Error(stderr);
      }
      
      console.log(`✅ Dependencia instalada: ${dependency.name} en ${modulePath}`);
      
    } catch (error) {
      throw new Error(`Error instalando ${dependency.name}: ${error.message}`);
    }
  }

  // Crear operación de restauración
  createRestoreOperation(type, packages) {
    return {
      id: uuidv4(),
      type,
      status: 'PENDING',
      packages,
      modules: [],
      startedAt: new Date(),
      completedAt: null,
      duration: null,
      successCount: 0,
      failureCount: 0,
      errors: [],
      warnings: []
    };
  }

  // Obtener todas las dependencias faltantes
  async getAllMissingDependencies() {
    try {
      const modules = await this.getAllModules();
      const missingDependencies = [];
      
      for (const module of modules) {
        if (module.packageJson) {
          const dependencies = {
            ...module.packageJson.dependencies,
            ...module.packageJson.devDependencies,
            ...module.packageJson.peerDependencies,
            ...module.packageJson.optionalDependencies
          };
          
          for (const [name, version] of Object.entries(dependencies)) {
            const isInstalled = await this.isDependencyInstalled(name, module.path);
            if (!isInstalled) {
              missingDependencies.push({
                name,
                version,
                module: {
                  id: module.id,
                  name: module.name,
                  path: module.path
                }
              });
            }
          }
        }
      }
      
      return missingDependencies;
    } catch (error) {
      console.error('❌ Error obteniendo dependencias faltantes:', error);
      return [];
    }
  }

  // Obtener información de dependencias específicas
  async getDependenciesInfo(packages) {
    const dependencies = [];
    
    for (const packageName of packages) {
      const packageInfo = await this.getPackageInfo(packageName);
      if (packageInfo) {
        dependencies.push(packageInfo);
      }
    }
    
    return dependencies;
  }

  // Obtener dependencias faltantes de un módulo
  async getModuleMissingDependencies(moduleId) {
    try {
      const modules = await this.getAllModules();
      const module = modules.find(m => m.id === moduleId);
      
      if (!module) {
        throw new Error(`Módulo ${moduleId} no encontrado`);
      }
      
      const missingDependencies = [];
      
      if (module.packageJson) {
        const dependencies = {
          ...module.packageJson.dependencies,
          ...module.packageJson.devDependencies,
          ...module.packageJson.peerDependencies,
          ...module.packageJson.optionalDependencies
        };
        
        for (const [name, version] of Object.entries(dependencies)) {
          const isInstalled = await this.isDependencyInstalled(name, module.path);
          if (!isInstalled) {
            missingDependencies.push({
              name,
              version,
              module: {
                id: module.id,
                name: module.name,
                path: module.path
              }
            });
          }
        }
      }
      
      return missingDependencies;
    } catch (error) {
      console.error(`❌ Error obteniendo dependencias del módulo ${moduleId}:`, error);
      return [];
    }
  }

  // Obtener información de un paquete
  async getPackageInfo(packageName) {
    try {
      const command = `npm view ${packageName} --json`;
      const { stdout } = await execAsync(command);
      const packageInfo = JSON.parse(stdout);
      
      return {
        name: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,
        homepage: packageInfo.homepage,
        repository: packageInfo.repository?.url,
        license: packageInfo.license,
        author: packageInfo.author?.name
      };
    } catch (error) {
      console.error(`❌ Error obteniendo información del paquete ${packageName}:`, error);
      return null;
    }
  }

  // Obtener módulos que requieren un paquete
  async getModulesRequiringPackage(packageName) {
    const modules = await this.getAllModules();
    const requiringModules = [];
    
    for (const module of modules) {
      if (module.packageJson) {
        const dependencies = {
          ...module.packageJson.dependencies,
          ...module.packageJson.devDependencies,
          ...module.packageJson.peerDependencies,
          ...module.packageJson.optionalDependencies
        };
        
        if (dependencies[packageName]) {
          requiringModules.push({
            id: module.id,
            name: module.name,
            path: module.path,
            version: dependencies[packageName]
          });
        }
      }
    }
    
    return requiringModules;
  }

  // Verificar si una dependencia está instalada
  async isDependencyInstalled(name, modulePath) {
    try {
      const packageJsonPath = path.join(modulePath, 'node_modules', name, 'package.json');
      await fs.access(packageJsonPath);
      return true;
    } catch {
      return false;
    }
  }

  // Obtener todos los módulos
  async getAllModules() {
    const modules = [];
    const moduleDirs = [
      'client', 'backend', 'assets', 'components', 'services',
      'entities', 'fonts', 'helpers', 'image', 'languages',
      'lib', 'middlewares', 'models', 'pages', 'public',
      'scripts', 'src', 'test', 'web', 'coverage', 'package'
    ];
    
    for (const dir of moduleDirs) {
      const modulePath = path.join(this.projectRoot, dir);
      
      try {
        await fs.access(modulePath);
        const packageJsonPath = path.join(modulePath, 'package.json');
        
        try {
          const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
          const packageJson = JSON.parse(packageJsonContent);
          
          modules.push({
            id: uuidv4(),
            name: dir,
            path: modulePath,
            packageJson
          });
        } catch (error) {
          // Módulo sin package.json
          modules.push({
            id: uuidv4(),
            name: dir,
            path: modulePath,
            packageJson: null
          });
        }
      } catch (error) {
        // Directorio no existe
        continue;
      }
    }
    
    return modules;
  }

  // Cancelar operación de restauración
  async cancelRestore(operationId) {
    try {
      const operation = this.operations.get(operationId);
      if (!operation) {
        throw new Error(`Operación ${operationId} no encontrada`);
      }
      
      if (operation.status === 'IN_PROGRESS') {
        operation.status = 'CANCELLED';
        operation.completedAt = new Date();
        operation.duration = Date.now() - operation.startedAt.getTime();
        operation.warnings.push('Operación cancelada por el usuario');
        
        console.log(`🛑 Operación ${operationId} cancelada`);
      } else {
        throw new Error(`No se puede cancelar una operación en estado: ${operation.status}`);
      }
      
      return operation;
    } catch (error) {
      console.error(`❌ Error cancelando operación ${operationId}:`, error);
      throw error;
    }
  }

  // Obtener operaciones de restauración
  getRestoreOperations() {
    return Array.from(this.operations.values());
  }

  // Obtener operación específica
  getRestoreOperation(operationId) {
    return this.operations.get(operationId);
  }

  // Utilidades
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Limpiar operaciones antiguas
  cleanupOldOperations(maxAge = 24 * 60 * 60 * 1000) { // 24 horas por defecto
    const now = Date.now();
    const toDelete = [];
    
    for (const [id, operation] of this.operations.entries()) {
      if (operation.completedAt && (now - operation.completedAt.getTime()) > maxAge) {
        toDelete.push(id);
      }
    }
    
    for (const id of toDelete) {
      this.operations.delete(id);
    }
    
    console.log(`🧹 Limpiadas ${toDelete.length} operaciones antiguas`);
  }
}

module.exports = RestoreService; 