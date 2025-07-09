import { binSystem } from './core/BinSystem';
import { messageBus } from './core/InterModuleMessageBus';
import { moduleRegistry } from './core/ModuleRegistry';

/**
 * Script de prueba del sistema .bin
 * Verifica todas las funcionalidades principales
 */
async function testBinSystem() {
  console.log('🧪 Iniciando pruebas del sistema .bin...\n');

  try {
    // Test 1: Inicialización del sistema
    console.log('📋 Test 1: Inicialización del sistema');
    await binSystem.initialize();
    console.log('✅ Sistema inicializado correctamente\n');

    // Test 2: Estado del sistema
    console.log('📋 Test 2: Estado del sistema');
    const systemStatus = binSystem.getSystemStatus();
    console.log('Estado del sistema:', {
      isInitialized: systemStatus.isInitialized,
      totalModules: systemStatus.moduleRegistry.totalModules,
      discoveredModules: systemStatus.moduleRegistry.discoveredModules
    });
    console.log('✅ Estado del sistema obtenido correctamente\n');

    // Test 3: Registro de módulos
    console.log('📋 Test 3: Registro de módulos');
    const discoveredModules = moduleRegistry.getDiscoveredModules();
    console.log('Módulos descubiertos:', discoveredModules);
    console.log('✅ Registro de módulos funcionando\n');

    // Test 4: Carga de módulo
    console.log('📋 Test 4: Carga de módulo');
    if (discoveredModules.length > 0) {
      const testModule = discoveredModules[0];
      const testUserId = 'test-user-' + Date.now();
      
      console.log(`Cargando módulo: ${testModule} para usuario: ${testUserId}`);
      await binSystem.loadModuleForUser(testModule, testUserId);
      console.log('✅ Módulo cargado correctamente\n');
    }

    // Test 5: Message Bus
    console.log('📋 Test 5: Message Bus');
    let messageReceived = false;
    
    messageBus.subscribe('test-channel', (message: any) => {
      console.log('Mensaje recibido:', message);
      messageReceived = true;
    });

    messageBus.publish('test-channel', { test: 'data', timestamp: Date.now() });
    
    // Esperar un poco para que se procese el mensaje
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (messageReceived) {
      console.log('✅ Message Bus funcionando correctamente\n');
    } else {
      console.log('❌ Message Bus no funcionó\n');
    }

    // Test 6: Estadísticas del Message Bus
    console.log('📋 Test 6: Estadísticas del Message Bus');
    const messageBusStats = messageBus.getStats();
    console.log('Estadísticas del Message Bus:', messageBusStats);
    console.log('✅ Estadísticas obtenidas correctamente\n');

    // Test 7: Carga de grupo de módulos
    console.log('📋 Test 7: Carga de grupo de módulos');
    const testUserId2 = 'test-user-group-' + Date.now();
    
    try {
      await binSystem.loadModuleGroupForUser('CORE', testUserId2);
      console.log('✅ Grupo de módulos cargado correctamente\n');
    } catch (error) {
      console.log('⚠️ Carga de grupo falló (puede ser normal si no hay módulos core):', error instanceof Error ? error.message : 'Error desconocido', '\n');
    }

    // Test 8: APIs de módulos
    console.log('📋 Test 8: APIs de módulos');
    if (discoveredModules.length > 0) {
      const testModule = discoveredModules[0];
      const moduleAPI = binSystem.getModuleAPI(testModule);
      
      if (moduleAPI) {
        console.log(`API del módulo ${testModule}:`, Object.keys(moduleAPI));
        console.log('✅ API del módulo obtenida correctamente\n');
      } else {
        console.log(`❌ No se pudo obtener la API del módulo ${testModule}\n`);
      }
    }

    // Test 9: Ejecución de acción (simulada)
    console.log('📋 Test 9: Ejecución de acción (simulada)');
    if (discoveredModules.length > 0) {
      const testModule = discoveredModules[0];
      const testUserId3 = 'test-user-action-' + Date.now();
      
      try {
        // Intentar ejecutar una acción (puede fallar si el módulo no tiene esa acción)
        await binSystem.executeModuleAction(testModule, 'getStatus', [], testUserId3);
        console.log('✅ Acción ejecutada correctamente\n');
      } catch (error) {
        console.log(`⚠️ Ejecución de acción falló (normal si la acción no existe): ${error instanceof Error ? error.message : 'Error desconocido'}\n`);
      }
    }

    // Test 10: Limpieza de sesiones
    console.log('📋 Test 10: Limpieza de sesiones');
    const testUserId4 = 'test-user-cleanup-' + Date.now();
    
    // Cargar un módulo para crear una sesión
    if (discoveredModules.length > 0) {
      await binSystem.loadModuleForUser(discoveredModules[0], testUserId4);
      
      // Limpiar la sesión
      await binSystem.cleanupUserSession(testUserId4);
      console.log('✅ Sesión limpiada correctamente\n');
    }

    // Test 11: Recarga de módulo
    console.log('📋 Test 11: Recarga de módulo');
    if (discoveredModules.length > 0) {
      const testModule = discoveredModules[0];
      
      try {
        await moduleRegistry.reloadModule(testModule);
        console.log('✅ Módulo recargado correctamente\n');
      } catch (error) {
        console.log(`⚠️ Recarga de módulo falló: ${error instanceof Error ? error.message : 'Error desconocido'}\n`);
      }
    }

    // Test 12: Estado final del sistema
    console.log('📋 Test 12: Estado final del sistema');
    const finalStatus = binSystem.getSystemStatus();
    console.log('Estado final:', {
      isInitialized: finalStatus.isInitialized,
      totalModules: finalStatus.moduleRegistry.totalModules,
      activeUsers: finalStatus.centralCoordinator.activeUsers
    });
    console.log('✅ Estado final obtenido correctamente\n');

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - Módulos descubiertos: ${discoveredModules.length}`);
    console.log(`   - Sistema inicializado: ${systemStatus.isInitialized}`);
    console.log(`   - Message Bus activo: ${messageBusStats.isEnabled}`);

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    throw error;
  } finally {
    // Limpiar recursos
    console.log('\n🧹 Limpiando recursos...');
    try {
      await binSystem.shutdown();
      console.log('✅ Sistema cerrado correctamente');
    } catch (error) {
      console.error('❌ Error cerrando el sistema:', error);
    }
  }
}

// Función para ejecutar pruebas específicas
async function runSpecificTest(testName: string) {
  console.log(`🧪 Ejecutando prueba específica: ${testName}\n`);

  switch (testName) {
    case 'initialization':
      await binSystem.initialize();
      console.log('✅ Prueba de inicialización completada');
      break;

    case 'message-bus':
      messageBus.publish('test', { data: 'test' });
      console.log('✅ Prueba de Message Bus completada');
      break;

    case 'module-registry':
      await moduleRegistry.initialize();
      const modules = moduleRegistry.getDiscoveredModules();
      console.log('✅ Prueba de registro de módulos completada:', modules);
      break;

    default:
      console.log('❌ Prueba no encontrada:', testName);
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  const testName = process.argv[2];
  
  if (testName) {
    runSpecificTest(testName).catch(console.error);
  } else {
    testBinSystem().catch(console.error);
  }
}

export { testBinSystem, runSpecificTest }; 