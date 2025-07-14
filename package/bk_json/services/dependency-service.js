const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const execAsync = promisify(exec);

class DependencyService {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.ready = false;
    this.dependencyCache = new Map();
    this.conflictCache = new Map();
    this.init();
  }

  async init() {
    try {
      this.ready = true;
      console.log('✅ DependencyService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando DependencyService:', error);
      this.ready = false;
    }
  }

  isReady() {
    return this.ready;
  }

  // Escaneo de dependencias
  async scanAllDependencies() {
    try {
      console.log('🔍 Escaneando todas las dependencias...');
      
      const modules = await this.getAllModules();
      const allDependencies = [];
      
      for (const module of modules) {
        const moduleDependencies = await this.scanModuleDependencies(module);
        allDependencies.push(...moduleDependencies);
      }
      
      // Analizar conflictos
      await this.analyzeConflicts(allDependencies);
      
      console.log(`✅ Escaneo completado: ${allDependencies.length} dependencias encontradas`);
      return allDependencies;
    } catch (error) {
      console.error('❌ Error escaneando dependencias:', error);
      throw error;
    }
  }

  async scanModuleDependencies(module) {
    const dependencies = [];
    
    if (!module.packageJson) {
      return dependencies;
    }

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
        dependencies.push(dependency);
      }
    }

    return dependencies;
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
      package: null, // TODO: Cargar información del paquete
      module: {
        id: module.id,
        name: module.name,
        path: module.path
      },
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
    // En producción, usar una librería como semver
    return true; // TODO: Implementar lógica de rangos
  }

  // Análisis de conflictos
  async analyzeConflicts(dependencies) {
    console.log('🔍 Analizando conflictos de dependencias...');
    
    const conflicts = new Map();
    
    // Agrupar dependencias por nombre
    const dependencyGroups = new Map();
    for (const dep of dependencies) {
      if (!dependencyGroups.has(dep.name)) {
        dependencyGroups.set(dep.name, []);
      }
      dependencyGroups.get(dep.name).push(dep);
    }
    
    // Buscar conflictos
    for (const [name, deps] of dependencyGroups) {
      if (deps.length > 1) {
        const versions = [...new Set(deps.map(d => d.requiredVersion))];
        if (versions.length > 1) {
          conflicts.set(name, {
            packageName: name,
            versions: versions,
            dependencies: deps,
            severity: this.calculateConflictSeverity(versions),
            resolution: await this.suggestConflictResolution(name, versions)
          });
        }
      }
    }
    
    this.conflictCache = conflicts;
    console.log(`✅ Análisis de conflictos completado: ${conflicts.size} conflictos encontrados`);
    
    return Array.from(conflicts.values());
  }

  calculateConflictSeverity(versions) {
    // Lógica para calcular la severidad del conflicto
    const majorVersions = new Set(versions.map(v => v.split('.')[0]));
    const minorVersions = new Set(versions.map(v => v.split('.')[1]));
    
    if (majorVersions.size > 1) return 'CRITICAL';
    if (minorVersions.size > 1) return 'HIGH';
    return 'MEDIUM';
  }

  async suggestConflictResolution(packageName, versions) {
    try {
      // Obtener la versión más reciente
      const command = `npm view ${packageName} version --json`;
      const { stdout } = await execAsync(command);
      const latestVersion = JSON.parse(stdout);
      
      return {
        recommendedVersion: latestVersion,
        action: `Actualizar todas las dependencias de ${packageName} a la versión ${latestVersion}`,
        steps: [
          `Identificar todos los módulos que usan ${packageName}`,
          `Actualizar package.json en cada módulo`,
          `Ejecutar npm install en cada módulo`,
          `Verificar que no hay regresiones`
        ]
      };
    } catch (error) {
      return {
        recommendedVersion: versions[0],
        action: `Usar la versión ${versions[0]} como estándar`,
        steps: [
          `Actualizar todas las dependencias a la versión ${versions[0]}`,
          `Verificar compatibilidad`
        ]
      };
    }
  }

  // Estado de dependencias
  async getDependencyStatus() {
    try {
      const dependencies = await this.scanAllDependencies();
      
      const status = {
        total: dependencies.length,
        installed: dependencies.filter(d => d.isInstalled).length,
        missing: dependencies.filter(d => d.isMissing).length,
        outdated: dependencies.filter(d => d.isOutdated).length,
        vulnerable: dependencies.filter(d => d.isVulnerable).length,
        conflicts: this.conflictCache.size,
        healthScore: this.calculateHealthScore(dependencies),
        riskLevel: this.calculateRiskLevel(dependencies),
        lastUpdated: new Date()
      };
      
      return status;
    } catch (error) {
      console.error('❌ Error obteniendo estado de dependencias:', error);
      throw error;
    }
  }

  calculateHealthScore(dependencies) {
    if (dependencies.length === 0) return 100;
    
    const total = dependencies.length;
    const missing = dependencies.filter(d => d.isMissing).length;
    const vulnerable = dependencies.filter(d => d.isVulnerable).length;
    const outdated = dependencies.filter(d => d.isOutdated).length;
    
    const score = 100 - (missing * 20) - (vulnerable * 15) - (outdated * 5);
    return Math.max(0, score);
  }

  calculateRiskLevel(dependencies) {
    const healthScore = this.calculateHealthScore(dependencies);
    
    if (healthScore < 50) return 'CRITICAL';
    if (healthScore < 70) return 'HIGH';
    if (healthScore < 85) return 'MEDIUM';
    return 'LOW';
  }

  // Métricas de dependencias
  async getDependencyMetrics() {
    try {
      const dependencies = await this.scanAllDependencies();
      const modules = await this.getAllModules();
      
      const metrics = {
        id: uuidv4(),
        timestamp: new Date(),
        totalPackages: new Set(dependencies.map(d => d.name)).size,
        totalDependencies: dependencies.length,
        missingDependencies: dependencies.filter(d => d.isMissing).length,
        outdatedDependencies: dependencies.filter(d => d.isOutdated).length,
        vulnerableDependencies: dependencies.filter(d => d.isVulnerable).length,
        averageHealthScore: this.calculateHealthScore(dependencies),
        topVulnerablePackages: await this.getTopVulnerablePackages(),
        mostOutdatedPackages: await this.getMostOutdatedPackages(),
        dependencyGrowth: await this.getDependencyGrowth()
      };
      
      return metrics;
    } catch (error) {
      console.error('❌ Error obteniendo métricas de dependencias:', error);
      throw error;
    }
  }

  async getTopVulnerablePackages() {
    const dependencies = await this.scanAllDependencies();
    const vulnerableDeps = dependencies.filter(d => d.isVulnerable);
    
    const packageCounts = new Map();
    for (const dep of vulnerableDeps) {
      const count = packageCounts.get(dep.name) || 0;
      packageCounts.set(dep.name, count + 1);
    }
    
    return Array.from(packageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  async getMostOutdatedPackages() {
    const dependencies = await this.scanAllDependencies();
    const outdatedDeps = dependencies.filter(d => d.isOutdated);
    
    const packageCounts = new Map();
    for (const dep of outdatedDeps) {
      const count = packageCounts.get(dep.name) || 0;
      packageCounts.set(dep.name, count + 1);
    }
    
    return Array.from(packageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  async getDependencyGrowth() {
    // Simular datos de crecimiento de dependencias
    const growth = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      growth.push({
        date,
        totalDependencies: Math.floor(Math.random() * 100) + 200,
        newDependencies: Math.floor(Math.random() * 5),
        removedDependencies: Math.floor(Math.random() * 3)
      });
    }
    
    return growth;
  }

  // Gestión de módulos
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

  // Verificación de vulnerabilidades
  async checkVulnerabilities() {
    try {
      console.log('🔍 Verificando vulnerabilidades...');
      
      const command = `npm audit --json`;
      const { stdout } = await execAsync(command, { cwd: this.projectRoot });
      const audit = JSON.parse(stdout);
      
      const vulnerabilities = [];
      
      if (audit.vulnerabilities) {
        for (const [name, vuln] of Object.entries(audit.vulnerabilities)) {
          vulnerabilities.push({
            id: uuidv4(),
            packageName: name,
            severity: vuln.severity.toUpperCase(),
            title: vuln.title,
            description: vuln.description,
            cve: vuln.cve,
            cvss: vuln.cvss?.score,
            affectedVersions: vuln.range ? [vuln.range] : [],
            fixedVersions: vuln.fixAvailable ? [vuln.fixAvailable] : [],
            publishedDate: new Date(vuln.published),
            lastUpdated: new Date(),
            references: vuln.references || []
          });
        }
      }
      
      console.log(`✅ Verificación completada: ${vulnerabilities.length} vulnerabilidades encontradas`);
      return vulnerabilities;
    } catch (error) {
      console.error('❌ Error verificando vulnerabilidades:', error);
      throw error;
    }
  }

  // Resolución de conflictos
  async resolveConflict(packageName, targetVersion) {
    try {
      console.log(`🔧 Resolviendo conflicto para ${packageName}@${targetVersion}`);
      
      const modules = await this.getAllModules();
      const updatedModules = [];
      
      for (const module of modules) {
        if (module.packageJson) {
          let updated = false;
          
          // Actualizar en todos los tipos de dependencias
          const dependencyTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
          
          for (const type of dependencyTypes) {
            if (module.packageJson[type] && module.packageJson[type][packageName]) {
              module.packageJson[type][packageName] = targetVersion;
              updated = true;
            }
          }
          
          if (updated) {
            // Guardar package.json actualizado
            const packageJsonPath = path.join(module.path, 'package.json');
            await fs.writeFile(packageJsonPath, JSON.stringify(module.packageJson, null, 2));
            
            // Instalar dependencias actualizadas
            const { stdout, stderr } = await execAsync('npm install', { cwd: module.path });
            
            if (stderr && !stderr.includes('npm WARN')) {
              console.error(`❌ Error instalando dependencias en ${module.name}:`, stderr);
            } else {
              console.log(`✅ Dependencias actualizadas en ${module.name}`);
              updatedModules.push(module.name);
            }
          }
        }
      }
      
      console.log(`✅ Conflicto resuelto: ${updatedModules.length} módulos actualizados`);
      return {
        packageName,
        targetVersion,
        updatedModules,
        success: true
      };
    } catch (error) {
      console.error(`❌ Error resolviendo conflicto para ${packageName}:`, error);
      throw error;
    }
  }
}

module.exports = DependencyService; 