const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const execAsync = promisify(exec);

class ModuleService {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.ready = false;
    this.moduleCache = new Map();
    this.analysisCache = new Map();
    this.init();
  }

  async init() {
    try {
      this.ready = true;
      console.log('✅ ModuleService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando ModuleService:', error);
      this.ready = false;
    }
  }

  isReady() {
    return this.ready;
  }

  // Análisis de módulos
  async analyzeAllModules() {
    try {
      console.log('🔍 Analizando todos los módulos...');
      
      const modules = await this.discoverModules();
      const analyzedModules = [];
      
      for (const module of modules) {
        const analyzedModule = await this.analyzeModule(module);
        analyzedModules.push(analyzedModule);
      }
      
      // Actualizar cache
      this.moduleCache.clear();
      for (const module of analyzedModules) {
        this.moduleCache.set(module.id, module);
      }
      
      console.log(`✅ Análisis completado: ${analyzedModules.length} módulos analizados`);
      return analyzedModules;
    } catch (error) {
      console.error('❌ Error analizando módulos:', error);
      throw error;
    }
  }

  async analyzeModule(module) {
    try {
      console.log(`🔍 Analizando módulo: ${module.name}`);
      
      const analysis = {
        ...module,
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: [],
        missingDependencies: [],
        outdatedDependencies: [],
        vulnerableDependencies: [],
        status: 'UNKNOWN',
        lastAnalyzed: new Date(),
        size: await this.calculateModuleSize(module.path),
        fileCount: await this.countModuleFiles(module.path),
        complexity: await this.calculateModuleComplexity(module.path),
        healthScore: 0
      };

      // Analizar dependencias si existe package.json
      if (module.packageJson) {
        const dependencyAnalysis = await this.analyzeModuleDependencies(module);
        Object.assign(analysis, dependencyAnalysis);
      }

      // Calcular estado y puntuación de salud
      analysis.status = this.calculateModuleStatus(analysis);
      analysis.healthScore = this.calculateModuleHealthScore(analysis);

      // Guardar en cache
      this.analysisCache.set(module.id, analysis);

      console.log(`✅ Módulo analizado: ${module.name} (${analysis.status})`);
      return analysis;
    } catch (error) {
      console.error(`❌ Error analizando módulo ${module.name}:`, error);
      return {
        ...module,
        status: 'ERROR',
        healthScore: 0,
        lastAnalyzed: new Date()
      };
    }
  }

  async discoverModules() {
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
        
        // Verificar si es un directorio
        const stats = await fs.stat(modulePath);
        if (!stats.isDirectory()) continue;

        const packageJsonPath = path.join(modulePath, 'package.json');
        let packageJson = null;

        try {
          const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
          packageJson = JSON.parse(packageJsonContent);
        } catch (error) {
          // Módulo sin package.json
        }

        modules.push({
          id: uuidv4(),
          name: dir,
          path: modulePath,
          type: this.determineModuleType(dir, packageJson),
          packageJson,
          discoveredAt: new Date()
        });

      } catch (error) {
        // Directorio no existe o no accesible
        continue;
      }
    }

    return modules;
  }

  determineModuleType(dirName, packageJson) {
    // Determinar tipo basado en nombre del directorio y contenido
    const typeMap = {
      'client': 'REACT_COMPONENT',
      'backend': 'NODE_MODULE',
      'components': 'REACT_COMPONENT',
      'services': 'NODE_MODULE',
      'entities': 'NODE_MODULE',
      'fonts': 'ASSET_MODULE',
      'helpers': 'NODE_MODULE',
      'image': 'ASSET_MODULE',
      'languages': 'LOCALIZATION_MODULE',
      'lib': 'NODE_MODULE',
      'middlewares': 'NODE_MODULE',
      'models': 'NODE_MODULE',
      'pages': 'PAGE_MODULE',
      'public': 'STATIC_MODULE',
      'scripts': 'NODE_MODULE',
      'src': 'NODE_MODULE',
      'test': 'TEST_MODULE',
      'web': 'WEB_MODULE',
      'coverage': 'COVERAGE_MODULE',
      'package': 'PACKAGE_MODULE'
    };

    // Si hay package.json, intentar determinar tipo por dependencias
    if (packageJson) {
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      if (dependencies.react || dependencies['react-dom']) {
        return 'REACT_COMPONENT';
      }
      if (dependencies.angular) {
        return 'ANGULAR_MODULE';
      }
      if (dependencies.vue) {
        return 'VUE_COMPONENT';
      }
      if (dependencies.express || dependencies.koa) {
        return 'NODE_MODULE';
      }
    }

    return typeMap[dirName] || 'OTHER';
  }

  async analyzeModuleDependencies(module) {
    const analysis = {
      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
      optionalDependencies: [],
      missingDependencies: [],
      outdatedDependencies: [],
      vulnerableDependencies: []
    };

    const dependencyTypes = [
      { key: 'dependencies', type: 'PRODUCTION' },
      { key: 'devDependencies', type: 'DEVELOPMENT' },
      { key: 'peerDependencies', type: 'PEER' },
      { key: 'optionalDependencies', type: 'OPTIONAL' }
    ];

    for (const { key, type } of dependencyTypes) {
      const deps = module.packageJson[key] || {};
      
      for (const [name, version] of Object.entries(deps)) {
        const dependency = await this.createDependencyObject(name, version, type, module);
        
        // Agregar a la lista correspondiente
        switch (type) {
          case 'PRODUCTION':
            analysis.dependencies.push(dependency);
            break;
          case 'DEVELOPMENT':
            analysis.devDependencies.push(dependency);
            break;
          case 'PEER':
            analysis.peerDependencies.push(dependency);
            break;
          case 'OPTIONAL':
            analysis.optionalDependencies.push(dependency);
            break;
        }

        // Verificar estado
        if (dependency.isMissing) {
          analysis.missingDependencies.push(dependency);
        }
        if (dependency.isOutdated) {
          analysis.outdatedDependencies.push(dependency);
        }
        if (dependency.isVulnerable) {
          analysis.vulnerableDependencies.push(dependency);
        }
      }
    }

    return analysis;
  }

  async createDependencyObject(name, version, type, module) {
    const isInstalled = await this.isDependencyInstalled(name, module.path);
    const installedVersion = isInstalled ? await this.getInstalledVersion(name, module.path) : null;
    const isOutdated = isInstalled ? await this.isDependencyOutdated(name, version, module.path) : false;
    const isVulnerable = await this.isDependencyVulnerable(name, installedVersion || version);
    
    let status = 'INSTALLED';
    if (!isInstalled) status = 'MISSING';
    else if (isVulnerable) status = 'VULNERABLE';
    else if (isOutdated) status = 'OUTDATED';

    return {
      id: uuidv4(),
      name,
      version,
      requiredVersion: version,
      installedVersion,
      isInstalled,
      isMissing: !isInstalled,
      isOutdated,
      isVulnerable,
      type,
      status,
      lastChecked: new Date()
    };
  }

  async isDependencyInstalled(name, modulePath) {
    try {
      const packageJsonPath = path.join(modulePath, 'node_modules', name, 'package.json');
      await fs.access(packageJsonPath);
      return true;
    } catch {
      return false;
    }
  }

  async getInstalledVersion(name, modulePath) {
    try {
      const packageJsonPath = path.join(modulePath, 'node_modules', name, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      return packageJson.version;
    } catch {
      return null;
    }
  }

  async isDependencyOutdated(name, requiredVersion, modulePath) {
    try {
      const command = `npm outdated ${name} --json`;
      const { stdout } = await execAsync(command, { cwd: modulePath });
      const outdated = JSON.parse(stdout || '{}');
      
      return Object.keys(outdated).length > 0;
    } catch {
      return false;
    }
  }

  async isDependencyVulnerable(name, version) {
    try {
      const command = `npm audit --json --package-lock-only`;
      const { stdout } = await execAsync(command, { cwd: this.projectRoot });
      const audit = JSON.parse(stdout);
      
      if (audit.vulnerabilities) {
        return Object.values(audit.vulnerabilities).some(vuln => 
          vuln.name === name && vuln.range && this.isVersionInRange(version, vuln.range)
        );
      }
      
      return false;
    } catch {
      return false;
    }
  }

  isVersionInRange(version, range) {
    // Implementación básica de verificación de rango de versiones
    return true; // TODO: Implementar lógica de rangos
  }

  // Cálculos de métricas
  async calculateModuleSize(modulePath) {
    try {
      const { stdout } = await execAsync(`du -sb "${modulePath}" | cut -f1`);
      return parseInt(stdout.trim());
    } catch {
      return 0;
    }
  }

  async countModuleFiles(modulePath) {
    try {
      const { stdout } = await execAsync(`find "${modulePath}" -type f | wc -l`);
      return parseInt(stdout.trim());
    } catch {
      return 0;
    }
  }

  async calculateModuleComplexity(modulePath) {
    try {
      // Contar líneas de código
      const { stdout } = await execAsync(`find "${modulePath}" -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | xargs wc -l | tail -1`);
      const lines = parseInt(stdout.trim().split(' ')[0]) || 0;
      
      // Contar funciones
      const { stdout: funcStdout } = await execAsync(`find "${modulePath}" -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | xargs grep -c "function\\|=>" | awk '{sum+=$1} END {print sum}'`);
      const functions = parseInt(funcStdout.trim()) || 0;
      
      return {
        linesOfCode: lines,
        functionCount: functions,
        complexityScore: Math.max(1, Math.floor(lines / 100) + Math.floor(functions / 10))
      };
    } catch {
      return {
        linesOfCode: 0,
        functionCount: 0,
        complexityScore: 1
      };
    }
  }

  calculateModuleStatus(analysis) {
    const missingCount = analysis.missingDependencies.length;
    const vulnerableCount = analysis.vulnerableDependencies.length;
    const outdatedCount = analysis.outdatedDependencies.length;

    if (missingCount > 5 || vulnerableCount > 3) return 'CRITICAL';
    if (missingCount > 2 || vulnerableCount > 1 || outdatedCount > 5) return 'WARNING';
    if (missingCount === 0 && vulnerableCount === 0 && outdatedCount === 0) return 'HEALTHY';
    return 'UNKNOWN';
  }

  calculateModuleHealthScore(analysis) {
    let score = 100;
    
    // Penalizar dependencias faltantes
    score -= analysis.missingDependencies.length * 20;
    
    // Penalizar dependencias vulnerables
    score -= analysis.vulnerableDependencies.length * 15;
    
    // Penalizar dependencias desactualizadas
    score -= analysis.outdatedDependencies.length * 5;
    
    // Penalizar alta complejidad
    if (analysis.complexity && analysis.complexity.complexityScore > 10) {
      score -= (analysis.complexity.complexityScore - 10) * 2;
    }
    
    return Math.max(0, score);
  }

  // Gestión de módulos
  async getModule(id) {
    return this.moduleCache.get(id) || this.analysisCache.get(id);
  }

  async getModuleByPath(modulePath) {
    const modules = Array.from(this.moduleCache.values());
    return modules.find(module => module.path === modulePath);
  }

  async getAllModules() {
    if (this.moduleCache.size === 0) {
      await this.analyzeAllModules();
    }
    return Array.from(this.moduleCache.values());
  }

  // Operaciones de módulos
  async addModule(input) {
    try {
      const modulePath = path.join(this.projectRoot, input.name);
      
      // Verificar si el módulo ya existe
      try {
        await fs.access(modulePath);
        throw new Error(`El módulo ${input.name} ya existe`);
      } catch (error) {
        if (error.message.includes('ya existe')) throw error;
      }

      // Crear directorio del módulo
      await fs.mkdir(modulePath, { recursive: true });

      // Crear package.json básico si se especifica
      if (input.createPackageJson) {
        const packageJson = {
          name: input.name,
          version: '1.0.0',
          description: input.description || '',
          main: 'index.js',
          scripts: {
            test: 'echo "Error: no test specified" && exit 1'
          },
          keywords: [],
          author: '',
          license: 'ISC'
        };

        const packageJsonPath = path.join(modulePath, 'package.json');
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }

      // Crear README básico
      const readmePath = path.join(modulePath, 'README.md');
      const readmeContent = `# ${input.name}\n\n${input.description || 'Descripción del módulo'}\n`;
      await fs.writeFile(readmePath, readmeContent);

      console.log(`✅ Módulo creado: ${input.name}`);
      
      // Analizar el nuevo módulo
      const newModule = {
        id: uuidv4(),
        name: input.name,
        path: modulePath,
        type: input.type || 'OTHER',
        packageJson: input.createPackageJson ? await this.loadPackageJson(modulePath) : null,
        discoveredAt: new Date()
      };

      return await this.analyzeModule(newModule);
    } catch (error) {
      console.error(`❌ Error creando módulo ${input.name}:`, error);
      throw error;
    }
  }

  async updateModule(id, input) {
    try {
      const module = await this.getModule(id);
      if (!module) {
        throw new Error(`Módulo con ID ${id} no encontrado`);
      }

      // Actualizar propiedades del módulo
      if (input.name) {
        const newPath = path.join(this.projectRoot, input.name);
        await fs.rename(module.path, newPath);
        module.path = newPath;
        module.name = input.name;
      }

      if (input.type) {
        module.type = input.type;
      }

      // Re-analizar el módulo
      const updatedModule = await this.analyzeModule(module);
      
      console.log(`✅ Módulo actualizado: ${updatedModule.name}`);
      return updatedModule;
    } catch (error) {
      console.error(`❌ Error actualizando módulo ${id}:`, error);
      throw error;
    }
  }

  async removeModule(id) {
    try {
      const module = await this.getModule(id);
      if (!module) {
        throw new Error(`Módulo con ID ${id} no encontrado`);
      }

      // Eliminar directorio del módulo
      await fs.rm(module.path, { recursive: true, force: true });

      // Remover de cache
      this.moduleCache.delete(id);
      this.analysisCache.delete(id);

      console.log(`✅ Módulo eliminado: ${module.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Error eliminando módulo ${id}:`, error);
      throw error;
    }
  }

  async loadPackageJson(modulePath) {
    try {
      const packageJsonPath = path.join(modulePath, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
      return JSON.parse(packageJsonContent);
    } catch {
      return null;
    }
  }

  // Análisis forzado
  async forceAnalyzeModules() {
    console.log('🔄 Forzando análisis de módulos...');
    
    // Limpiar cache
    this.moduleCache.clear();
    this.analysisCache.clear();
    
    // Re-analizar todos los módulos
    return await this.analyzeAllModules();
  }
}

module.exports = ModuleService; 