/**
 * Ejemplo de uso avanzado del Apollo Package Manager
 * 
 * Este ejemplo muestra funcionalidades avanzadas como:
 * - Gestión de conflictos de dependencias
 * - Análisis de vulnerabilidades
 * - Métricas personalizadas
 * - Automatización de procesos
 * - Integración con CI/CD
 */

const { ApolloClient, InMemoryCache, gql } = require('@apollo/client');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

// Configuración del cliente Apollo
const client = new ApolloClient({
  uri: 'http://localhost:4001/graphql',
  cache: new InMemoryCache(),
  fetch: fetch
});

// Queries y Mutations avanzadas
const GET_DEPENDENCY_CONFLICTS = gql`
  query GetDependencyConflicts {
    dependencies(filter: { status: CONFLICTING }) {
      id
      name
      version
      requiredVersion
      installedVersion
      type
      status
      module {
        name
        path
      }
    }
  }
`;

const GET_VULNERABILITIES = gql`
  query GetVulnerabilities {
    vulnerabilities {
      id
      packageName
      severity
      title
      description
      cve
      cvss
      affectedVersions
      fixedVersions
      publishedDate
      references
    }
  }
`;

const FIX_VULNERABILITY = gql`
  mutation FixVulnerability($vulnerabilityId: ID!) {
    fixVulnerability(vulnerabilityId: $vulnerabilityId) {
      id
      packageName
      severity
      title
      description
      fixedVersions
    }
  }
`;

const GET_DEPENDENCY_METRICS = gql`
  query GetDependencyMetrics {
    dependencyMetrics {
      id
      timestamp
      totalPackages
      totalDependencies
      missingDependencies
      outdatedDependencies
      vulnerableDependencies
      averageHealthScore
      topVulnerablePackages
      mostOutdatedPackages
      dependencyGrowth {
        date
        totalDependencies
        newDependencies
        removedDependencies
      }
    }
  }
`;

const FORCE_ANALYZE_MODULES = gql`
  mutation ForceAnalyzeModules {
    forceAnalyzeModules {
      id
      name
      type
      status
      healthScore
      lastAnalyzed
    }
  }
`;

const CLEANUP_CACHE = gql`
  mutation CleanupCache {
    cleanupCache
  }
`;

/**
 * Clase para uso avanzado del Apollo Package Manager
 */
class AdvancedUsageExample {
  constructor() {
    this.client = client;
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      timeout: 30000,
      batchSize: 10
    };
  }

  /**
   * Analizar y resolver conflictos de dependencias
   */
  async analyzeAndResolveConflicts() {
    console.log('🔍 Analizando conflictos de dependencias...');
    
    try {
      const { data } = await this.client.query({
        query: GET_DEPENDENCY_CONFLICTS
      });

      const conflicts = data.dependencies;
      console.log(`✅ Conflictos encontrados: ${conflicts.length}`);

      if (conflicts.length === 0) {
        console.log('✅ No se encontraron conflictos de dependencias');
        return [];
      }

      // Agrupar conflictos por paquete
      const conflictGroups = this.groupConflictsByPackage(conflicts);
      
      console.log('\n📊 Análisis de conflictos:');
      for (const [packageName, packageConflicts] of conflictGroups) {
        console.log(`\n📦 ${packageName}:`);
        const versions = [...new Set(packageConflicts.map(c => c.requiredVersion))];
        console.log(`   Versiones requeridas: ${versions.join(', ')}`);
        console.log(`   Módulos afectados: ${packageConflicts.length}`);
        
        // Sugerir resolución
        const recommendedVersion = await this.suggestConflictResolution(packageName, versions);
        console.log(`   Versión recomendada: ${recommendedVersion}`);
      }

      // Resolver conflictos automáticamente
      const resolvedConflicts = await this.resolveConflictsAutomatically(conflictGroups);
      
      return resolvedConflicts;
    } catch (error) {
      console.error('❌ Error analizando conflictos:', error);
      throw error;
    }
  }

  /**
   * Agrupar conflictos por paquete
   */
  groupConflictsByPackage(conflicts) {
    const groups = new Map();
    
    conflicts.forEach(conflict => {
      if (!groups.has(conflict.name)) {
        groups.set(conflict.name, []);
      }
      groups.get(conflict.name).push(conflict);
    });
    
    return groups;
  }

  /**
   * Sugerir resolución de conflicto
   */
  async suggestConflictResolution(packageName, versions) {
    try {
      // Obtener la versión más reciente
      const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
      const latest = await response.json();
      
      return latest.version;
    } catch (error) {
      // Si no se puede obtener la versión más reciente, usar la primera
      return versions[0];
    }
  }

  /**
   * Resolver conflictos automáticamente
   */
  async resolveConflictsAutomatically(conflictGroups) {
    console.log('\n🔄 Resolviendo conflictos automáticamente...');
    
    const resolved = [];
    
    for (const [packageName, conflicts] of conflictGroups) {
      try {
        const versions = [...new Set(conflicts.map(c => c.requiredVersion))];
        const recommendedVersion = await this.suggestConflictResolution(packageName, versions);
        
        // Actualizar todas las dependencias del paquete
        const modules = [...new Set(conflicts.map(c => c.module.name))];
        
        for (const moduleName of modules) {
          await this.updatePackageInModule(moduleName, packageName, recommendedVersion);
        }
        
        resolved.push({
          packageName,
          recommendedVersion,
          modules,
          success: true
        });
        
        console.log(`✅ ${packageName} actualizado a ${recommendedVersion} en ${modules.length} módulos`);
      } catch (error) {
        console.error(`❌ Error resolviendo conflicto para ${packageName}:`, error);
        resolved.push({
          packageName,
          success: false,
          error: error.message
        });
      }
    }
    
    return resolved;
  }

  /**
   * Actualizar paquete en un módulo específico
   */
  async updatePackageInModule(moduleName, packageName, version) {
    const modulePath = path.join(process.cwd(), '..', moduleName);
    const packageJsonPath = path.join(modulePath, 'package.json');
    
    try {
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      
      // Actualizar en todos los tipos de dependencias
      const dependencyTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
      
      let updated = false;
      for (const type of dependencyTypes) {
        if (packageJson[type] && packageJson[type][packageName]) {
          packageJson[type][packageName] = version;
          updated = true;
        }
      }
      
      if (updated) {
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        
        // Instalar dependencias actualizadas
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        await execAsync('npm install', { cwd: modulePath });
      }
    } catch (error) {
      throw new Error(`Error actualizando ${packageName} en ${moduleName}: ${error.message}`);
    }
  }

  /**
   * Análisis completo de vulnerabilidades
   */
  async analyzeVulnerabilities() {
    console.log('🔍 Analizando vulnerabilidades de seguridad...');
    
    try {
      const { data } = await this.client.query({
        query: GET_VULNERABILITIES
      });

      const vulnerabilities = data.vulnerabilities;
      console.log(`✅ Vulnerabilidades encontradas: ${vulnerabilities.length}`);

      if (vulnerabilities.length === 0) {
        console.log('✅ No se encontraron vulnerabilidades');
        return [];
      }

      // Agrupar por severidad
      const bySeverity = this.groupVulnerabilitiesBySeverity(vulnerabilities);
      
      console.log('\n📊 Vulnerabilidades por severidad:');
      for (const [severity, vulns] of bySeverity) {
        console.log(`   ${severity}: ${vulns.length}`);
      }

      // Mostrar vulnerabilidades críticas
      const criticalVulns = bySeverity.get('CRITICAL') || [];
      if (criticalVulns.length > 0) {
        console.log('\n🚨 Vulnerabilidades críticas:');
        criticalVulns.forEach(vuln => {
          console.log(`   - ${vuln.packageName}: ${vuln.title}`);
          console.log(`     CVE: ${vuln.cve || 'N/A'}`);
          console.log(`     CVSS: ${vuln.cvss || 'N/A'}`);
        });
      }

      // Generar reporte de vulnerabilidades
      const report = await this.generateVulnerabilityReport(vulnerabilities);
      
      return {
        vulnerabilities,
        report,
        bySeverity
      };
    } catch (error) {
      console.error('❌ Error analizando vulnerabilidades:', error);
      throw error;
    }
  }

  /**
   * Agrupar vulnerabilidades por severidad
   */
  groupVulnerabilitiesBySeverity(vulnerabilities) {
    const groups = new Map();
    
    vulnerabilities.forEach(vuln => {
      if (!groups.has(vuln.severity)) {
        groups.set(vuln.severity, []);
      }
      groups.get(vuln.severity).push(vuln);
    });
    
    return groups;
  }

  /**
   * Generar reporte de vulnerabilidades
   */
  async generateVulnerabilityReport(vulnerabilities) {
    const report = {
      generatedAt: new Date(),
      totalVulnerabilities: vulnerabilities.length,
      bySeverity: {},
      byPackage: {},
      recommendations: []
    };

    // Agrupar por severidad
    vulnerabilities.forEach(vuln => {
      if (!report.bySeverity[vuln.severity]) {
        report.bySeverity[vuln.severity] = [];
      }
      report.bySeverity[vuln.severity].push(vuln);
    });

    // Agrupar por paquete
    vulnerabilities.forEach(vuln => {
      if (!report.byPackage[vuln.packageName]) {
        report.byPackage[vuln.packageName] = [];
      }
      report.byPackage[vuln.packageName].push(vuln);
    });

    // Generar recomendaciones
    for (const [packageName, packageVulns] of Object.entries(report.byPackage)) {
      const criticalVulns = packageVulns.filter(v => v.severity === 'CRITICAL');
      const highVulns = packageVulns.filter(v => v.severity === 'HIGH');
      
      if (criticalVulns.length > 0) {
        report.recommendations.push({
          type: 'URGENT',
          package: packageName,
          action: 'Actualizar inmediatamente',
          reason: `${criticalVulns.length} vulnerabilidades críticas`,
          estimatedTime: 15
        });
      } else if (highVulns.length > 0) {
        report.recommendations.push({
          type: 'HIGH',
          package: packageName,
          action: 'Actualizar pronto',
          reason: `${highVulns.length} vulnerabilidades altas`,
          estimatedTime: 30
        });
      }
    }

    return report;
  }

  /**
   * Corregir vulnerabilidades automáticamente
   */
  async fixVulnerabilitiesAutomatically() {
    console.log('🔧 Corrigiendo vulnerabilidades automáticamente...');
    
    try {
      const { data } = await this.client.query({
        query: GET_VULNERABILITIES
      });

      const vulnerabilities = data.vulnerabilities;
      const fixed = [];
      const failed = [];

      for (const vuln of vulnerabilities) {
        try {
          // Solo corregir vulnerabilidades críticas y altas
          if (['CRITICAL', 'HIGH'].includes(vuln.severity)) {
            console.log(`🔧 Corrigiendo vulnerabilidad en ${vuln.packageName}...`);
            
            const { data: fixData } = await this.client.mutate({
              mutation: FIX_VULNERABILITY,
              variables: {
                vulnerabilityId: vuln.id
              }
            });

            fixed.push({
              vulnerability: vuln,
              fix: fixData.fixVulnerability
            });
            
            console.log(`✅ Vulnerabilidad corregida: ${vuln.packageName}`);
          }
        } catch (error) {
          console.error(`❌ Error corrigiendo vulnerabilidad en ${vuln.packageName}:`, error);
          failed.push({
            vulnerability: vuln,
            error: error.message
          });
        }
      }

      console.log(`\n📊 Resultado de corrección:`);
      console.log(`   Corregidas: ${fixed.length}`);
      console.log(`   Fallidas: ${failed.length}`);

      return { fixed, failed };
    } catch (error) {
      console.error('❌ Error corrigiendo vulnerabilidades:', error);
      throw error;
    }
  }

  /**
   * Obtener métricas avanzadas de dependencias
   */
  async getAdvancedMetrics() {
    console.log('📊 Obteniendo métricas avanzadas...');
    
    try {
      const { data } = await this.client.query({
        query: GET_DEPENDENCY_METRICS
      });

      const metrics = data.dependencyMetrics;
      console.log(`✅ Métricas obtenidas: ${metrics.id}`);

      // Análisis de tendencias
      const trends = this.analyzeTrends(metrics.dependencyGrowth);
      
      console.log('\n📈 Análisis de tendencias:');
      console.log(`   Crecimiento total: ${trends.totalGrowth} dependencias`);
      console.log(`   Tasa de crecimiento: ${trends.growthRate.toFixed(2)}% por día`);
      console.log(`   Tendencia: ${trends.trend}`);

      // Análisis de paquetes más problemáticos
      console.log('\n⚠️  Paquetes más problemáticos:');
      console.log(`   Más vulnerables: ${metrics.topVulnerablePackages.join(', ')}`);
      console.log(`   Más desactualizados: ${metrics.mostOutdatedPackages.join(', ')}`);

      // Generar alertas
      const alerts = this.generateAlerts(metrics);
      
      if (alerts.length > 0) {
        console.log('\n🚨 Alertas generadas:');
        alerts.forEach(alert => {
          console.log(`   - ${alert.type}: ${alert.message}`);
        });
      }

      return {
        metrics,
        trends,
        alerts
      };
    } catch (error) {
      console.error('❌ Error obteniendo métricas:', error);
      throw error;
    }
  }

  /**
   * Analizar tendencias de crecimiento
   */
  analyzeTrends(growthData) {
    if (growthData.length < 2) {
      return {
        totalGrowth: 0,
        growthRate: 0,
        trend: 'INSUFICIENT_DATA'
      };
    }

    const first = growthData[0];
    const last = growthData[growthData.length - 1];
    const totalGrowth = last.totalDependencies - first.totalDependencies;
    const days = (last.date - first.date) / (1000 * 60 * 60 * 24);
    const growthRate = days > 0 ? (totalGrowth / days) : 0;

    let trend = 'STABLE';
    if (growthRate > 5) trend = 'GROWING';
    else if (growthRate < -5) trend = 'DECLINING';

    return {
      totalGrowth,
      growthRate,
      trend
    };
  }

  /**
   * Generar alertas basadas en métricas
   */
  generateAlerts(metrics) {
    const alerts = [];

    if (metrics.vulnerableDependencies > 10) {
      alerts.push({
        type: 'HIGH_VULNERABILITIES',
        message: `Muchas dependencias vulnerables: ${metrics.vulnerableDependencies}`,
        severity: 'HIGH'
      });
    }

    if (metrics.missingDependencies > 5) {
      alerts.push({
        type: 'MISSING_DEPENDENCIES',
        message: `Dependencias faltantes: ${metrics.missingDependencies}`,
        severity: 'MEDIUM'
      });
    }

    if (metrics.averageHealthScore < 70) {
      alerts.push({
        type: 'LOW_HEALTH_SCORE',
        message: `Puntuación de salud baja: ${metrics.averageHealthScore}%`,
        severity: 'HIGH'
      });
    }

    return alerts;
  }

  /**
   * Automatización para CI/CD
   */
  async ciCdAutomation() {
    console.log('🤖 Ejecutando automatización CI/CD...');
    
    try {
      const results = {
        startTime: new Date(),
        checks: [],
        passed: true,
        summary: {}
      };

      // 1. Verificar salud del sistema
      console.log('1️⃣ Verificando salud del sistema...');
      const health = await this.checkSystemHealth();
      results.checks.push({
        name: 'System Health',
        status: health.status === 'OK' ? 'PASSED' : 'FAILED',
        details: health
      });

      // 2. Análisis forzado de módulos
      console.log('2️⃣ Análisis forzado de módulos...');
      const { data } = await this.client.mutate({
        mutation: FORCE_ANALYZE_MODULES
      });
      const modules = data.forceAnalyzeModules;
      const unhealthyModules = modules.filter(m => m.status !== 'HEALTHY');
      
      results.checks.push({
        name: 'Module Analysis',
        status: unhealthyModules.length === 0 ? 'PASSED' : 'FAILED',
        details: {
          total: modules.length,
          unhealthy: unhealthyModules.length,
          modules: unhealthyModules.map(m => m.name)
        }
      });

      // 3. Verificar vulnerabilidades
      console.log('3️⃣ Verificando vulnerabilidades...');
      const vulnResult = await this.analyzeVulnerabilities();
      const criticalVulns = vulnResult.bySeverity.get('CRITICAL') || [];
      
      results.checks.push({
        name: 'Vulnerability Check',
        status: criticalVulns.length === 0 ? 'PASSED' : 'FAILED',
        details: {
          total: vulnResult.vulnerabilities.length,
          critical: criticalVulns.length,
          high: (vulnResult.bySeverity.get('HIGH') || []).length
        }
      });

      // 4. Verificar dependencias faltantes
      console.log('4️⃣ Verificando dependencias faltantes...');
      const missing = await this.getMissingDependencies();
      
      results.checks.push({
        name: 'Missing Dependencies',
        status: missing.length === 0 ? 'PASSED' : 'FAILED',
        details: {
          count: missing.length,
          packages: missing.map(m => m.name)
        }
      });

      // 5. Limpiar cache
      console.log('5️⃣ Limpiando cache...');
      await this.client.mutate({
        mutation: CLEANUP_CACHE
      });
      results.checks.push({
        name: 'Cache Cleanup',
        status: 'PASSED',
        details: { message: 'Cache limpiado exitosamente' }
      });

      // Generar resumen
      results.endTime = new Date();
      results.duration = results.endTime - results.startTime;
      
      const failedChecks = results.checks.filter(c => c.status === 'FAILED');
      results.passed = failedChecks.length === 0;
      
      results.summary = {
        totalChecks: results.checks.length,
        passedChecks: results.checks.filter(c => c.status === 'PASSED').length,
        failedChecks: failedChecks.length,
        duration: results.duration
      };

      // Mostrar resultados
      console.log('\n📊 Resultados de CI/CD:');
      console.log(`   Estado general: ${results.passed ? '✅ PASÓ' : '❌ FALLÓ'}`);
      console.log(`   Duración: ${results.duration}ms`);
      console.log(`   Checks: ${results.summary.passedChecks}/${results.summary.totalChecks} pasaron`);

      if (failedChecks.length > 0) {
        console.log('\n❌ Checks fallidos:');
        failedChecks.forEach(check => {
          console.log(`   - ${check.name}: ${JSON.stringify(check.details)}`);
        });
      }

      return results;
    } catch (error) {
      console.error('❌ Error en automatización CI/CD:', error);
      throw error;
    }
  }

  /**
   * Verificar salud del sistema
   */
  async checkSystemHealth() {
    const response = await fetch('http://localhost:4001/api/health');
    return await response.json();
  }

  /**
   * Ejecutar flujo avanzado completo
   */
  async runAdvancedWorkflow() {
    console.log('🚀 Ejecutando flujo avanzado completo...\n');

    try {
      // 1. Análisis de conflictos
      console.log('1️⃣ Análisis de conflictos de dependencias');
      await this.analyzeAndResolveConflicts();
      console.log('\n' + '='.repeat(60) + '\n');

      // 2. Análisis de vulnerabilidades
      console.log('2️⃣ Análisis de vulnerabilidades');
      await this.analyzeVulnerabilities();
      console.log('\n' + '='.repeat(60) + '\n');

      // 3. Corrección automática de vulnerabilidades
      console.log('3️⃣ Corrección automática de vulnerabilidades');
      await this.fixVulnerabilitiesAutomatically();
      console.log('\n' + '='.repeat(60) + '\n');

      // 4. Métricas avanzadas
      console.log('4️⃣ Métricas avanzadas');
      await this.getAdvancedMetrics();
      console.log('\n' + '='.repeat(60) + '\n');

      // 5. Automatización CI/CD
      console.log('5️⃣ Automatización CI/CD');
      await this.ciCdAutomation();
      console.log('\n' + '='.repeat(60) + '\n');

      console.log('🎉 Flujo avanzado completado exitosamente!');

    } catch (error) {
      console.error('❌ Error en flujo avanzado:', error);
      throw error;
    }
  }
}

// Ejemplo de uso
async function main() {
  const example = new AdvancedUsageExample();

  // Verificar si el servidor está ejecutándose
  try {
    await example.checkSystemHealth();
  } catch (error) {
    console.error('❌ El servidor Apollo Package Manager no está ejecutándose');
    console.error('   Ejecuta: npm start en el directorio package/');
    process.exit(1);
  }

  // Ejecutar flujo avanzado
  await example.runAdvancedWorkflow();
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AdvancedUsageExample; 