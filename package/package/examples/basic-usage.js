/**
 * Ejemplo de uso básico del Apollo Package Manager
 * 
 * Este ejemplo muestra cómo usar las funcionalidades básicas
 * del sistema de gestión de paquetes.
 */

const { ApolloClient, InMemoryCache, gql } = require('@apollo/client');
const fetch = require('node-fetch');

// Configuración del cliente Apollo
const client = new ApolloClient({
  uri: 'http://localhost:4001/graphql',
  cache: new InMemoryCache(),
  fetch: fetch
});

// Queries GraphQL
const ANALYZE_MODULES = gql`
  query AnalyzeModules {
    analyzeAllModules {
      id
      name
      type
      status
      healthScore
      missingDependencies {
        name
        version
      }
      outdatedDependencies {
        name
        version
      }
      vulnerableDependencies {
        name
        version
      }
    }
  }
`;

const SCAN_DEPENDENCIES = gql`
  query ScanDependencies {
    scanDependencies {
      id
      name
      version
      requiredVersion
      installedVersion
      isInstalled
      isMissing
      isOutdated
      isVulnerable
      type
      status
      module {
        name
        path
      }
    }
  }
`;

const GET_MISSING_DEPENDENCIES = gql`
  query GetMissingDependencies {
    missingDependencies {
      name
      requiredBy {
        name
        path
        version
      }
    }
  }
`;

const RESTORE_DEPENDENCIES = gql`
  mutation RestoreDependencies($input: RestoreInput!) {
    restoreDependencies(input: $input) {
      id
      type
      status
      packages
      modules
      startedAt
      successCount
      failureCount
      errors
      warnings
    }
  }
`;

const GENERATE_REPORT = gql`
  query GenerateReport {
    dependencyReport {
      id
      generatedAt
      summary {
        totalModules
        totalPackages
        totalDependencies
        missingDependencies
        outdatedDependencies
        vulnerableDependencies
        overallHealth
        riskLevel
      }
      recommendations {
        id
        type
        priority
        title
        description
        action
        affectedPackages
        estimatedTime
        impact
      }
    }
  }
`;

const GET_SYSTEM_HEALTH = gql`
  query GetSystemHealth {
    systemHealth {
      status
      uptime
      memoryUsage
      activeOperations
      services {
        packageService
        dependencyService
        moduleService
        restoreService
      }
    }
  }
`;

/**
 * Clase principal para el ejemplo de uso básico
 */
class BasicUsageExample {
  constructor() {
    this.client = client;
  }

  /**
   * Ejecutar análisis completo del proyecto
   */
  async analyzeProject() {
    console.log('🔍 Analizando proyecto...');
    
    try {
      const { data } = await this.client.query({
        query: ANALYZE_MODULES
      });

      console.log(`✅ Análisis completado: ${data.analyzeAllModules.length} módulos analizados`);
      
      // Mostrar resumen por módulo
      data.analyzeAllModules.forEach(module => {
        console.log(`\n📦 Módulo: ${module.name}`);
        console.log(`   Tipo: ${module.type}`);
        console.log(`   Estado: ${module.status}`);
        console.log(`   Salud: ${module.healthScore}%`);
        console.log(`   Dependencias faltantes: ${module.missingDependencies.length}`);
        console.log(`   Dependencias desactualizadas: ${module.outdatedDependencies.length}`);
        console.log(`   Dependencias vulnerables: ${module.vulnerableDependencies.length}`);
      });

      return data.analyzeAllModules;
    } catch (error) {
      console.error('❌ Error analizando proyecto:', error);
      throw error;
    }
  }

  /**
   * Escanear dependencias del proyecto
   */
  async scanDependencies() {
    console.log('🔍 Escaneando dependencias...');
    
    try {
      const { data } = await this.client.query({
        query: SCAN_DEPENDENCIES
      });

      const dependencies = data.scanDependencies;
      console.log(`✅ Escaneo completado: ${dependencies.length} dependencias encontradas`);

      // Estadísticas
      const missing = dependencies.filter(d => d.isMissing);
      const outdated = dependencies.filter(d => d.isOutdated);
      const vulnerable = dependencies.filter(d => d.isVulnerable);

      console.log(`\n📊 Estadísticas:`);
      console.log(`   Total: ${dependencies.length}`);
      console.log(`   Faltantes: ${missing.length}`);
      console.log(`   Desactualizadas: ${outdated.length}`);
      console.log(`   Vulnerables: ${vulnerable.length}`);

      // Mostrar dependencias faltantes
      if (missing.length > 0) {
        console.log(`\n❌ Dependencias faltantes:`);
        missing.forEach(dep => {
          console.log(`   - ${dep.name}@${dep.version} (${dep.module.name})`);
        });
      }

      // Mostrar dependencias vulnerables
      if (vulnerable.length > 0) {
        console.log(`\n⚠️  Dependencias vulnerables:`);
        vulnerable.forEach(dep => {
          console.log(`   - ${dep.name}@${dep.version} (${dep.module.name})`);
        });
      }

      return dependencies;
    } catch (error) {
      console.error('❌ Error escaneando dependencias:', error);
      throw error;
    }
  }

  /**
   * Obtener dependencias faltantes
   */
  async getMissingDependencies() {
    console.log('🔍 Obteniendo dependencias faltantes...');
    
    try {
      const { data } = await this.client.query({
        query: GET_MISSING_DEPENDENCIES
      });

      const missing = data.missingDependencies;
      console.log(`✅ Dependencias faltantes encontradas: ${missing.length}`);

      missing.forEach(dep => {
        console.log(`\n📦 ${dep.name}:`);
        dep.requiredBy.forEach(module => {
          console.log(`   - Requerido por: ${module.name} (${module.version})`);
        });
      });

      return missing;
    } catch (error) {
      console.error('❌ Error obteniendo dependencias faltantes:', error);
      throw error;
    }
  }

  /**
   * Restaurar dependencias faltantes
   */
  async restoreDependencies(type = 'ALL', packages = []) {
    console.log(`🔄 Iniciando restauración de dependencias (tipo: ${type})...`);
    
    try {
      const { data } = await this.client.mutate({
        mutation: RESTORE_DEPENDENCIES,
        variables: {
          input: {
            type,
            packages
          }
        }
      });

      const operation = data.restoreDependencies;
      console.log(`✅ Operación de restauración iniciada: ${operation.id}`);
      console.log(`   Estado: ${operation.status}`);
      console.log(`   Paquetes: ${operation.packages.length}`);
      console.log(`   Módulos: ${operation.modules.length}`);

      // Monitorear progreso
      await this.monitorRestoreOperation(operation.id);

      return operation;
    } catch (error) {
      console.error('❌ Error restaurando dependencias:', error);
      throw error;
    }
  }

  /**
   * Monitorear operación de restauración
   */
  async monitorRestoreOperation(operationId) {
    console.log(`📊 Monitoreando operación: ${operationId}`);
    
    const maxAttempts = 30; // 5 minutos máximo
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`http://localhost:4001/api/health`);
        const health = await response.json();
        
        // Buscar la operación en el estado del sistema
        if (health.activeOperations === 0) {
          console.log('✅ Operación de restauración completada');
          break;
        }

        console.log(`⏳ Operación en progreso... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 segundos
        attempts++;
      } catch (error) {
        console.error('❌ Error monitoreando operación:', error);
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.log('⚠️  Tiempo de espera agotado para la operación');
    }
  }

  /**
   * Generar reporte de dependencias
   */
  async generateReport() {
    console.log('📊 Generando reporte de dependencias...');
    
    try {
      const { data } = await this.client.query({
        query: GENERATE_REPORT
      });

      const report = data.dependencyReport;
      console.log(`✅ Reporte generado: ${report.id}`);

      // Mostrar resumen
      const summary = report.summary;
      console.log(`\n📋 Resumen del Reporte:`);
      console.log(`   Módulos totales: ${summary.totalModules}`);
      console.log(`   Paquetes totales: ${summary.totalPackages}`);
      console.log(`   Dependencias totales: ${summary.totalDependencies}`);
      console.log(`   Dependencias faltantes: ${summary.missingDependencies}`);
      console.log(`   Dependencias desactualizadas: ${summary.outdatedDependencies}`);
      console.log(`   Dependencias vulnerables: ${summary.vulnerableDependencies}`);
      console.log(`   Salud general: ${summary.overallHealth}%`);
      console.log(`   Nivel de riesgo: ${summary.riskLevel}`);

      // Mostrar recomendaciones
      if (report.recommendations.length > 0) {
        console.log(`\n💡 Recomendaciones:`);
        report.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec.title}`);
          console.log(`      Prioridad: ${rec.priority}`);
          console.log(`      Acción: ${rec.action}`);
          console.log(`      Tiempo estimado: ${rec.estimatedTime} minutos`);
        });
      }

      return report;
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      throw error;
    }
  }

  /**
   * Verificar salud del sistema
   */
  async checkSystemHealth() {
    console.log('🏥 Verificando salud del sistema...');
    
    try {
      const { data } = await this.client.query({
        query: GET_SYSTEM_HEALTH
      });

      const health = data.systemHealth;
      console.log(`✅ Estado del sistema: ${health.status}`);
      console.log(`   Uptime: ${Math.floor(health.uptime / 60)} minutos`);
      console.log(`   Uso de memoria: ${health.memoryUsage.toFixed(2)}%`);
      console.log(`   Operaciones activas: ${health.activeOperations}`);

      // Verificar servicios
      console.log(`\n🔧 Estado de servicios:`);
      Object.entries(health.services).forEach(([service, status]) => {
        const icon = status ? '✅' : '❌';
        console.log(`   ${icon} ${service}: ${status ? 'Activo' : 'Inactivo'}`);
      });

      return health;
    } catch (error) {
      console.error('❌ Error verificando salud del sistema:', error);
      throw error;
    }
  }

  /**
   * Ejecutar flujo completo de análisis y restauración
   */
  async runCompleteWorkflow() {
    console.log('🚀 Iniciando flujo completo de análisis y restauración...\n');

    try {
      // 1. Verificar salud del sistema
      await this.checkSystemHealth();
      console.log('\n' + '='.repeat(50) + '\n');

      // 2. Analizar proyecto
      await this.analyzeProject();
      console.log('\n' + '='.repeat(50) + '\n');

      // 3. Escanear dependencias
      await this.scanDependencies();
      console.log('\n' + '='.repeat(50) + '\n');

      // 4. Obtener dependencias faltantes
      const missing = await this.getMissingDependencies();
      console.log('\n' + '='.repeat(50) + '\n');

      // 5. Restaurar dependencias si es necesario
      if (missing.length > 0) {
        console.log(`🔄 Restaurando ${missing.length} dependencias faltantes...`);
        await this.restoreDependencies('ALL');
        console.log('\n' + '='.repeat(50) + '\n');
      } else {
        console.log('✅ No hay dependencias faltantes para restaurar');
        console.log('\n' + '='.repeat(50) + '\n');
      }

      // 6. Generar reporte final
      await this.generateReport();
      console.log('\n' + '='.repeat(50) + '\n');

      console.log('🎉 Flujo completo ejecutado exitosamente!');

    } catch (error) {
      console.error('❌ Error en el flujo completo:', error);
      throw error;
    }
  }

  /**
   * Ejemplo de uso interactivo
   */
  async interactiveExample() {
    console.log('🎯 Ejemplo Interactivo del Apollo Package Manager\n');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    try {
      console.log('Opciones disponibles:');
      console.log('1. Analizar proyecto');
      console.log('2. Escanear dependencias');
      console.log('3. Ver dependencias faltantes');
      console.log('4. Restaurar dependencias');
      console.log('5. Generar reporte');
      console.log('6. Verificar salud del sistema');
      console.log('7. Ejecutar flujo completo');
      console.log('8. Salir');

      const choice = await question('\nSelecciona una opción (1-8): ');

      switch (choice) {
        case '1':
          await this.analyzeProject();
          break;
        case '2':
          await this.scanDependencies();
          break;
        case '3':
          await this.getMissingDependencies();
          break;
        case '4':
          await this.restoreDependencies();
          break;
        case '5':
          await this.generateReport();
          break;
        case '6':
          await this.checkSystemHealth();
          break;
        case '7':
          await this.runCompleteWorkflow();
          break;
        case '8':
          console.log('👋 ¡Hasta luego!');
          break;
        default:
          console.log('❌ Opción no válida');
      }
    } catch (error) {
      console.error('❌ Error en ejemplo interactivo:', error);
    } finally {
      rl.close();
    }
  }
}

// Ejemplo de uso
async function main() {
  const example = new BasicUsageExample();

  // Verificar si el servidor está ejecutándose
  try {
    await example.checkSystemHealth();
  } catch (error) {
    console.error('❌ El servidor Apollo Package Manager no está ejecutándose');
    console.error('   Ejecuta: npm start en el directorio package/');
    process.exit(1);
  }

  // Ejecutar ejemplo interactivo
  await example.interactiveExample();
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = BasicUsageExample; 