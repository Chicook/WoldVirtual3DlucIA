/**
 * @fileoverview Ejemplo avanzado de uso del sistema modular de assets
 */

const { AssetsSystemAdvanced } = require('../../dist/AssetsSystemAdvanced');
const { getConfig } = require('../../dist/config/default-config');

async function advancedExample() {
  console.log('🚀 Ejemplo avanzado del sistema modular de assets\n');

  try {
    // 1. Configurar el sistema
    const config = getConfig('development'); // Usar configuración de desarrollo
    const assetsSystem = new AssetsSystemAdvanced(config);

    // 2. Inicializar el sistema
    console.log('📋 Inicializando sistema...');
    await assetsSystem.initialize();
    console.log('✅ Sistema inicializado\n');

    // 3. Procesar un asset individual con configuración avanzada
    console.log('🔄 Procesando asset individual...');
    const result = await assetsSystem.processAsset('./assets/models/character.glb', {
      // Validación
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedFormats: ['glb', 'gltf', 'png', 'jpg'],
      virusScan: false,
      integrityCheck: true,
      metadataValidation: true,
      securityScan: true,
      formatValidation: true,

      // Optimización
      optimize: true,
      quality: 90,
      format: 'auto',
      resize: {
        enabled: true,
        maxWidth: 2048,
        maxHeight: 2048,
        maintainAspectRatio: true
      },
      metadata: {
        preserve: true,
        strip: ['exif', 'icc']
      },
      adaptive: {
        enabled: true,
        targetSize: 5 * 1024 * 1024, // 5MB
        qualityRange: [70, 95]
      },
      parallel: true,

      // Compresión
      compress: true,
      compressionAlgorithm: 'gzip',
      compressionLevel: 9,
      preserveMetadata: true,
      adaptiveCompression: true,
      parallelProcessing: true,
      memoryLimit: 100 * 1024 * 1024, // 100MB

      // Upload
      platform: 'ipfs',
      public: true,
      tags: ['character', '3d', 'metaverso'],
      uploadMetadata: {
        author: 'Metaverso Team',
        license: 'MIT',
        category: 'characters'
      },
      encryption: {
        enabled: false
      },
      retry: {
        attempts: 5,
        delay: 2000,
        backoff: 'exponential'
      },
      progress: (percentage, stage) => {
        console.log(`📊 Progreso: ${percentage}% - ${stage}`);
      }
    });

    if (result.success) {
      console.log('\n✅ Asset procesado exitosamente:');
      console.log(`   ID: ${result.assetId}`);
      console.log(`   URL: ${result.uploadUrl}`);
      console.log(`   Reducción total: ${result.stats.totalSizeReduction.toFixed(1)}%`);
      console.log(`   Tiempo total: ${result.stats.totalTime}ms`);
      console.log(`   Tamaño original: ${(result.metadata.originalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   Tamaño final: ${(result.metadata.processedSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   Score de seguridad: ${result.validation.securityScore}/100`);
    } else {
      console.log('\n❌ Error procesando asset:');
      console.log(`   Errores: ${result.errors.join(', ')}`);
    }

    // 4. Procesar múltiples assets en lote
    console.log('\n🔄 Procesando lote de assets...');
    const filePaths = [
      './assets/textures/skin.png',
      './assets/audio/ambient.mp3',
      './assets/models/building.glb'
    ];

    const batchResults = await assetsSystem.processBatch(filePaths, {
      quality: 85,
      platform: 'ipfs',
      tags: ['batch-process'],
      batchSize: 2
    });

    const successCount = batchResults.filter(r => r.success).length;
    console.log(`\n📊 Resultados del lote: ${successCount}/${filePaths.length} exitosos`);

    // 5. Obtener métricas del sistema
    console.log('\n📈 Métricas del sistema:');
    const metrics = assetsSystem.getMetrics();
    
    console.log('Uploaders:');
    Object.entries(metrics.uploaders).forEach(([name, metric]) => {
      console.log(`   ${name}: ${metric.successfulUploads}/${metric.totalUploads} exitosos`);
    });

    console.log('Compressors:');
    Object.entries(metrics.compressors).forEach(([name, metric]) => {
      console.log(`   ${name}: ${metric.successfulCompressions}/${metric.totalCompressions} exitosos`);
    });

    console.log('Optimizers:');
    Object.entries(metrics.optimizers).forEach(([name, metric]) => {
      console.log(`   ${name}: ${metric.successfulOptimizations}/${metric.totalOptimizations} exitosos`);
    });

    console.log('Validators:');
    Object.entries(metrics.validators).forEach(([name, metric]) => {
      console.log(`   ${name}: ${metric.successfulValidations}/${metric.totalValidations} exitosos`);
    });

    // 6. Ejemplo de configuración personalizada
    console.log('\n🔧 Ejemplo de configuración personalizada:');
    const customConfig = {
      uploaders: {
        ipfs: true,
        local: true
      },
      compressors: {
        gzip: true
      },
      optimizers: {
        image: true
      },
      validators: {
        file: true,
        integrity: true
      },
      performance: {
        maxConcurrentUploads: 3,
        maxConcurrentCompressions: 2,
        maxConcurrentOptimizations: 2,
        maxConcurrentValidations: 3,
        batchSize: 3
      }
    };

    const customSystem = new AssetsSystemAdvanced(customConfig);
    await customSystem.initialize();
    console.log('✅ Sistema personalizado inicializado');

    console.log('\n🎉 Ejemplo completado exitosamente!');

  } catch (error) {
    console.error('\n❌ Error en el ejemplo:', error);
  }
}

// Ejecutar el ejemplo si se llama directamente
if (require.main === module) {
  advancedExample();
}

module.exports = { advancedExample }; 