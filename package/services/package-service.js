const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const execAsync = promisify(exec);

class PackageService {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.cacheDir = path.join(__dirname, '../cache');
    this.ready = false;
    this.packageCache = new Map();
    this.init();
  }

  async init() {
    try {
      await this.ensureDirectories();
      await this.loadPackageCache();
      this.ready = true;
      console.log('✅ PackageService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando PackageService:', error);
      this.ready = false;
    }
  }

  async ensureDirectories() {
    const directories = [this.cacheDir];
    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  isReady() {
    return this.ready;
  }

  // Gestión de paquetes
  async installPackage(input) {
    try {
      console.log(`📦 Instalando paquete: ${input.name}@${input.version}`);
      
      const command = `npm install ${input.name}@${input.version}`;
      const { stdout, stderr } = await execAsync(command, { cwd: this.projectRoot });
      
      if (stderr && !stderr.includes('npm WARN')) {
        throw new Error(`Error instalando paquete: ${stderr}`);
      }

      const packageInfo = await this.getPackageInfo(input.name);
      await this.updatePackageCache(input.name, packageInfo);
      
      console.log(`✅ Paquete instalado: ${input.name}@${input.version}`);
      return packageInfo;
    } catch (error) {
      console.error(`❌ Error instalando paquete ${input.name}:`, error);
      throw error;
    }
  }

  async updatePackage(name, version) {
    try {
      console.log(`🔄 Actualizando paquete: ${name}@${version}`);
      
      const command = `npm install ${name}@${version}`;
      const { stdout, stderr } = await execAsync(command, { cwd: this.projectRoot });
      
      if (stderr && !stderr.includes('npm WARN')) {
        throw new Error(`Error actualizando paquete: ${stderr}`);
      }

      const packageInfo = await this.getPackageInfo(name);
      await this.updatePackageCache(name, packageInfo);
      
      console.log(`✅ Paquete actualizado: ${name}@${version}`);
      return packageInfo;
    } catch (error) {
      console.error(`❌ Error actualizando paquete ${name}:`, error);
      throw error;
    }
  }

  async removePackage(name) {
    try {
      console.log(`🗑️  Eliminando paquete: ${name}`);
      
      const command = `npm uninstall ${name}`;
      const { stdout, stderr } = await execAsync(command, { cwd: this.projectRoot });
      
      if (stderr && !stderr.includes('npm WARN')) {
        throw new Error(`Error eliminando paquete: ${stderr}`);
      }

      this.packageCache.delete(name);
      await this.savePackageCache();
      
      console.log(`✅ Paquete eliminado: ${name}`);
      return true;
    } catch (error) {
      console.error(`❌ Error eliminando paquete ${name}:`, error);
      throw error;
    }
  }

  // Análisis de paquetes
  async getPackageInfo(name) {
    try {
      const command = `npm view ${name} --json`;
      const { stdout } = await execAsync(command);
      const packageInfo = JSON.parse(stdout);
      
      return {
        id: uuidv4(),
        name: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,
        homepage: packageInfo.homepage,
        repository: packageInfo.repository?.url,
        license: packageInfo.license,
        author: packageInfo.author?.name,
        dependencies: await this.getPackageDependencies(name),
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: [],
        scripts: packageInfo.scripts,
        keywords: packageInfo.keywords,
        engines: packageInfo.engines,
        os: packageInfo.os,
        cpu: packageInfo.cpu,
        status: await this.getPackageStatus(name),
        lastUpdated: new Date(),
        size: packageInfo.dist?.size,
        vulnerabilities: await this.getPackageVulnerabilities(name)
      };
    } catch (error) {
      console.error(`❌ Error obteniendo información del paquete ${name}:`, error);
      return null;
    }
  }

  async getPackageDependencies(name) {
    try {
      const command = `npm view ${name} dependencies --json`;
      const { stdout } = await execAsync(command);
      const dependencies = JSON.parse(stdout || '{}');
      
      return Object.entries(dependencies).map(([depName, version]) => ({
        id: uuidv4(),
        name: depName,
        version: version,
        requiredVersion: version,
        installedVersion: null,
        isInstalled: false,
        isMissing: true,
        isOutdated: false,
        isVulnerable: false,
        type: 'PRODUCTION',
        status: 'MISSING',
        lastChecked: new Date()
      }));
    } catch (error) {
      return [];
    }
  }

  async getPackageStatus(name) {
    try {
      // Verificar si el paquete está instalado
      const packageJsonPath = path.join(this.projectRoot, 'node_modules', name, 'package.json');
      await fs.access(packageJsonPath);
      
      // Verificar si hay vulnerabilidades
      const vulnerabilities = await this.getPackageVulnerabilities(name);
      if (vulnerabilities.length > 0) {
        return 'VULNERABLE';
      }
      
      // Verificar si está desactualizado
      const isOutdated = await this.isPackageOutdated(name);
      if (isOutdated) {
        return 'OUTDATED';
      }
      
      return 'ACTIVE';
    } catch (error) {
      return 'MISSING';
    }
  }

  async getPackageVulnerabilities(name) {
    try {
      const command = `npm audit --json --package-lock-only`;
      const { stdout } = await execAsync(command, { cwd: this.projectRoot });
      const audit = JSON.parse(stdout);
      
      const vulnerabilities = [];
      if (audit.vulnerabilities) {
        Object.values(audit.vulnerabilities).forEach(vuln => {
          if (vuln.name === name) {
            vulnerabilities.push({
              id: uuidv4(),
              packageName: vuln.name,
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
        });
      }
      
      return vulnerabilities;
    } catch (error) {
      return [];
    }
  }

  async isPackageOutdated(name) {
    try {
      const command = `npm outdated ${name} --json`;
      const { stdout } = await execAsync(command, { cwd: this.projectRoot });
      const outdated = JSON.parse(stdout || '{}');
      
      return Object.keys(outdated).length > 0;
    } catch (error) {
      return false;
    }
  }

  // Gestión de paquetes faltantes
  async getMissingPackages() {
    try {
      const modules = await this.getAllModules();
      const missingPackages = new Set();
      
      for (const module of modules) {
        if (module.packageJson) {
          const dependencies = {
            ...module.packageJson.dependencies,
            ...module.packageJson.devDependencies,
            ...module.packageJson.peerDependencies,
            ...module.packageJson.optionalDependencies
          };
          
          for (const [packageName, version] of Object.entries(dependencies)) {
            const isInstalled = await this.isPackageInstalled(packageName, module.path);
            if (!isInstalled) {
              missingPackages.add(packageName);
            }
          }
        }
      }
      
      return Array.from(missingPackages).map(name => ({
        name,
        requiredBy: await this.getModulesRequiringPackage(name),
        status: 'MISSING'
      }));
    } catch (error) {
      console.error('❌ Error obteniendo paquetes faltantes:', error);
      return [];
    }
  }

  async isPackageInstalled(packageName, modulePath) {
    try {
      const packageJsonPath = path.join(modulePath, 'node_modules', packageName, 'package.json');
      await fs.access(packageJsonPath);
      return true;
    } catch {
      return false;
    }
  }

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
            name: module.name,
            path: module.path,
            version: dependencies[packageName]
          });
        }
      }
    }
    
    return requiringModules;
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
            type: this.getModuleType(dir),
            packageJson,
            dependencies: [],
            devDependencies: [],
            peerDependencies: [],
            optionalDependencies: [],
            missingDependencies: [],
            outdatedDependencies: [],
            vulnerableDependencies: [],
            status: 'UNKNOWN',
            lastAnalyzed: new Date(),
            size: await this.getModuleSize(modulePath),
            fileCount: await this.getModuleFileCount(modulePath)
          });
        } catch (error) {
          // Módulo sin package.json
          modules.push({
            id: uuidv4(),
            name: dir,
            path: modulePath,
            type: this.getModuleType(dir),
            packageJson: null,
            dependencies: [],
            devDependencies: [],
            peerDependencies: [],
            optionalDependencies: [],
            missingDependencies: [],
            outdatedDependencies: [],
            vulnerableDependencies: [],
            status: 'UNKNOWN',
            lastAnalyzed: new Date(),
            size: await this.getModuleSize(modulePath),
            fileCount: await this.getModuleFileCount(modulePath)
          });
        }
      } catch (error) {
        // Directorio no existe
        continue;
      }
    }
    
    return modules;
  }

  getModuleType(dirName) {
    const typeMap = {
      'client': 'REACT_COMPONENT',
      'backend': 'NODE_MODULE',
      'components': 'REACT_COMPONENT',
      'services': 'NODE_MODULE',
      'entities': 'NODE_MODULE',
      'fonts': 'OTHER',
      'helpers': 'NODE_MODULE',
      'image': 'OTHER',
      'languages': 'OTHER',
      'lib': 'NODE_MODULE',
      'middlewares': 'NODE_MODULE',
      'models': 'NODE_MODULE',
      'pages': 'OTHER',
      'public': 'OTHER',
      'scripts': 'NODE_MODULE',
      'src': 'NODE_MODULE',
      'test': 'NODE_MODULE',
      'web': 'OTHER',
      'coverage': 'NODE_MODULE',
      'package': 'NODE_MODULE'
    };
    
    return typeMap[dirName] || 'OTHER';
  }

  async getModuleSize(modulePath) {
    try {
      const { stdout } = await execAsync(`du -sb "${modulePath}" | cut -f1`);
      return parseInt(stdout.trim());
    } catch {
      return 0;
    }
  }

  async getModuleFileCount(modulePath) {
    try {
      const { stdout } = await execAsync(`find "${modulePath}" -type f | wc -l`);
      return parseInt(stdout.trim());
    } catch {
      return 0;
    }
  }

  // Gestión de cache
  async loadPackageCache() {
    try {
      const cachePath = path.join(this.cacheDir, 'package-cache.json');
      const cacheContent = await fs.readFile(cachePath, 'utf8');
      const cache = JSON.parse(cacheContent);
      
      this.packageCache = new Map(Object.entries(cache));
    } catch (error) {
      this.packageCache = new Map();
    }
  }

  async savePackageCache() {
    try {
      const cachePath = path.join(this.cacheDir, 'package-cache.json');
      const cache = Object.fromEntries(this.packageCache);
      await fs.writeFile(cachePath, JSON.stringify(cache, null, 2));
    } catch (error) {
      console.error('❌ Error guardando cache de paquetes:', error);
    }
  }

  async updatePackageCache(name, packageInfo) {
    this.packageCache.set(name, packageInfo);
    await this.savePackageCache();
  }

  // Operaciones de limpieza
  async cleanupCache() {
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      await this.ensureDirectories();
      this.packageCache.clear();
      console.log('✅ Cache limpiado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
      throw error;
    }
  }

  async cleanupNodeModules() {
    try {
      const modules = await this.getAllModules();
      
      for (const module of modules) {
        const nodeModulesPath = path.join(module.path, 'node_modules');
        try {
          await fs.rm(nodeModulesPath, { recursive: true, force: true });
          console.log(`🗑️  node_modules eliminado en: ${module.name}`);
        } catch (error) {
          // Ignorar errores si no existe
        }
      }
      
      console.log('✅ node_modules limpiados correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando node_modules:', error);
      throw error;
    }
  }

  async cleanupLockFiles() {
    try {
      const modules = await this.getAllModules();
      
      for (const module of modules) {
        const lockFiles = [
          'package-lock.json',
          'yarn.lock',
          'pnpm-lock.yaml'
        ];
        
        for (const lockFile of lockFiles) {
          const lockFilePath = path.join(module.path, lockFile);
          try {
            await fs.unlink(lockFilePath);
            console.log(`🗑️  ${lockFile} eliminado en: ${module.name}`);
          } catch (error) {
            // Ignorar errores si no existe
          }
        }
      }
      
      console.log('✅ Archivos de lock limpiados correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando archivos de lock:', error);
      throw error;
    }
  }

  // Generación de reportes
  async generateDependencyReport() {
    try {
      const modules = await this.getAllModules();
      const missingPackages = await this.getMissingPackages();
      const vulnerabilities = await this.getAllVulnerabilities();
      
      const report = {
        id: uuidv4(),
        generatedAt: new Date(),
        summary: await this.generateSummary(modules, missingPackages, vulnerabilities),
        modules: modules.map(module => this.generateModuleReport(module)),
        packages: await this.generatePackageReports(),
        vulnerabilities: this.generateVulnerabilityReports(vulnerabilities),
        recommendations: await this.generateRecommendations(modules, missingPackages, vulnerabilities)
      };
      
      return report;
    } catch (error) {
      console.error('❌ Error generando reporte de dependencias:', error);
      throw error;
    }
  }

  async generateSummary(modules, missingPackages, vulnerabilities) {
    const totalModules = modules.length;
    const totalPackages = modules.reduce((sum, module) => {
      if (module.packageJson) {
        return sum + Object.keys({
          ...module.packageJson.dependencies,
          ...module.packageJson.devDependencies,
          ...module.packageJson.peerDependencies,
          ...module.packageJson.optionalDependencies
        }).length;
      }
      return sum;
    }, 0);
    
    const missingDependencies = missingPackages.length;
    const vulnerableDependencies = vulnerabilities.length;
    
    const overallHealth = Math.max(0, 100 - (missingDependencies * 10) - (vulnerableDependencies * 5));
    
    let riskLevel = 'LOW';
    if (overallHealth < 50) riskLevel = 'CRITICAL';
    else if (overallHealth < 70) riskLevel = 'HIGH';
    else if (overallHealth < 85) riskLevel = 'MEDIUM';
    
    return {
      totalModules,
      totalPackages,
      totalDependencies: totalPackages,
      missingDependencies,
      outdatedDependencies: 0, // TODO: Implementar
      vulnerableDependencies,
      overallHealth,
      riskLevel
    };
  }

  generateModuleReport(module) {
    const dependencyCount = module.packageJson ? Object.keys({
      ...module.packageJson.dependencies,
      ...module.packageJson.devDependencies,
      ...module.packageJson.peerDependencies,
      ...module.packageJson.optionalDependencies
    }).length : 0;
    
    return {
      moduleId: module.id,
      moduleName: module.name,
      modulePath: module.path,
      dependencyCount,
      missingCount: module.missingDependencies.length,
      outdatedCount: module.outdatedDependencies.length,
      vulnerableCount: module.vulnerableDependencies.length,
      healthScore: Math.max(0, 100 - (module.missingDependencies.length * 20) - (module.vulnerableDependencies.length * 10)),
      status: module.status
    };
  }

  async generatePackageReports() {
    const packages = [];
    const modules = await this.getAllModules();
    
    for (const module of modules) {
      if (module.packageJson) {
        const allDeps = {
          ...module.packageJson.dependencies,
          ...module.packageJson.devDependencies,
          ...module.packageJson.peerDependencies,
          ...module.packageJson.optionalDependencies
        };
        
        for (const [packageName, version] of Object.entries(allDeps)) {
          const packageInfo = await this.getPackageInfo(packageName);
          if (packageInfo) {
            packages.push({
              packageName,
              currentVersion: version,
              latestVersion: packageInfo.version,
              isOutdated: version !== packageInfo.version,
              vulnerabilityCount: packageInfo.vulnerabilities.length,
              downloadCount: 0, // TODO: Implementar
              lastUpdated: packageInfo.lastUpdated,
              status: packageInfo.status
            });
          }
        }
      }
    }
    
    return packages;
  }

  generateVulnerabilityReports(vulnerabilities) {
    const reports = new Map();
    
    for (const vuln of vulnerabilities) {
      if (!reports.has(vuln.packageName)) {
        reports.set(vuln.packageName, {
          packageName: vuln.packageName,
          severity: vuln.severity,
          count: 0,
          affectedModules: [],
          recommendations: []
        });
      }
      
      const report = reports.get(vuln.packageName);
      report.count++;
      report.recommendations.push(`Actualizar a versión ${vuln.fixedVersions.join(' o ')}`);
    }
    
    return Array.from(reports.values());
  }

  async generateRecommendations(modules, missingPackages, vulnerabilities) {
    const recommendations = [];
    
    // Recomendaciones para paquetes faltantes
    for (const missingPackage of missingPackages) {
      recommendations.push({
        id: uuidv4(),
        type: 'ADD_PACKAGE',
        priority: 'HIGH',
        title: `Instalar paquete faltante: ${missingPackage.name}`,
        description: `El paquete ${missingPackage.name} es requerido por ${missingPackage.requiredBy.length} módulos pero no está instalado.`,
        action: `npm install ${missingPackage.name}`,
        affectedPackages: [missingPackage.name],
        estimatedTime: 5,
        impact: 'HIGH'
      });
    }
    
    // Recomendaciones para vulnerabilidades
    for (const vuln of vulnerabilities) {
      recommendations.push({
        id: uuidv4(),
        type: 'FIX_VULNERABILITY',
        priority: vuln.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        title: `Corregir vulnerabilidad en ${vuln.packageName}`,
        description: vuln.description,
        action: `Actualizar ${vuln.packageName} a una versión segura`,
        affectedPackages: [vuln.packageName],
        estimatedTime: 10,
        impact: vuln.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
      });
    }
    
    return recommendations;
  }

  async getAllVulnerabilities() {
    const vulnerabilities = [];
    const modules = await this.getAllModules();
    
    for (const module of modules) {
      if (module.packageJson) {
        const allDeps = {
          ...module.packageJson.dependencies,
          ...module.packageJson.devDependencies,
          ...module.packageJson.peerDependencies,
          ...module.packageJson.optionalDependencies
        };
        
        for (const packageName of Object.keys(allDeps)) {
          const packageVulns = await this.getPackageVulnerabilities(packageName);
          vulnerabilities.push(...packageVulns);
        }
      }
    }
    
    return vulnerabilities;
  }
}

module.exports = PackageService; 