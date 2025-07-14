/**
 * @fileoverview Ejemplo de uso básico del sistema de assets
 * @module assets/examples/basic-usage
 */

const { AssetsSystem } = require('../../dist/index');

async function basicUsage() {
  console.log('🎨 Ejemplo de uso básico del Sistema de Assets\n');

  // Crear instancia del sistema
  const assetsSystem = new AssetsSystem();

  try {
    // 1. Inicializar el sistema
    console.log('1️⃣ Inicializando sistema...');
    await assetsSystem.initialize();
    console.log('✅ Sistema inicializado\n');

    // 2. Procesar un asset individual
    console.log('2️⃣ Procesando asset individual...');
    const result = await assetsSystem.processAsset('./example-asset.png', {
      optimization: {
        quality: 80,
        format: 'webp',
        resize: true,
        maxWidth: 1024,
        maxHeight: 1024
      },
      compression: {
        algorithm: 'gzip',
        level: 6
      },
      upload: {
        platform: 'ipfs',
        public: true,
        tags: ['example', 'test']
      }
    });

    if (result.success) {
      console.log('✅ Asset procesado exitosamente');
      console.log(`📊 Reducción: ${result.stats.reduction.toFixed(1)}%`);
      console.log(`🔗 URL: ${result.processedPath}\n`);
    } else {
      console.log('❌ Error procesando asset:', result.error);
    }

    // 3. Procesar múltiples assets
    console.log('3️⃣ Procesando múltiples assets...');
    const filePaths = [
      './assets/models/character.glb',
      './assets/textures/skin.png',
      './assets/audio/ambient.mp3'
    ];

    const batchResults = await assetsSystem.processAssets(filePaths, {
      batchSize: 2,
      optimization: { quality: 85 },
      upload: { platform: 'local' }
    });

    const successCount = batchResults.filter(r => r.success).length;
    console.log(`✅ Procesamiento en lote completado: ${successCount}/${filePaths.length} exitosos\n`);

    // 4. Buscar assets
    console.log('4️⃣ Buscando assets...');
    const searchResults = await assetsSystem.searchAssets({
      type: 'texture',
      size: { min: 1024, max: 1024 * 1024 }, // 1KB - 1MB
      limit: 10
    });

    console.log(`🔍 Encontrados ${searchResults.length} assets de textura\n`);

    // 5. Obtener estadísticas
    console.log('5️⃣ Obteniendo estadísticas...');
    const stats = await assetsSystem.getStats();
    
    console.log('📊 Estadísticas del Sistema:');
    console.log(`- Total de assets: ${stats.totalAssets}`);
    console.log(`- Tamaño total: ${formatSize(stats.totalSize)}`);
    console.log(`- Optimización promedio: ${stats.averageOptimization.toFixed(1)}%`);
    console.log(`- Almacenamiento usado: ${formatSize(stats.storageUsed)}`);
    console.log(`- Total de uploads: ${stats.uploads}\n`);

    // 6. Limpiar archivos temporales
    console.log('6️⃣ Limpiando archivos temporales...');
    await assetsSystem.cleanup();
    console.log('✅ Limpieza completada\n');

    console.log('🎉 Ejemplo completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el ejemplo:', error);
  }
}

// Función auxiliar para formatear tamaños
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Ejecutar ejemplo si se llama directamente
if (require.main === module) {
  basicUsage();
}

module.exports = { basicUsage }; 