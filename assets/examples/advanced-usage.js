/**
 * @fileoverview Ejemplo de uso avanzado del sistema de assets
 * @module assets/examples/advanced-usage
 */

const { AssetsSystem } = require('../dist/index');
const fs = require('fs-extra');
const path = require('path');

async function advancedUsage() {
  console.log('🚀 Ejemplo de uso avanzado del Sistema de Assets\n');

  const assetsSystem = new AssetsSystem();

  try {
    await assetsSystem.initialize();

    // 1. Procesamiento con configuración personalizada
    console.log('1️⃣ Procesamiento con configuración personalizada...');
    
    const customConfig = {
      optimization: {
        quality: 90,
        format: 'webp',
        resize: true,
        maxWidth: 2048,
        maxHeight: 2048,
        preserveAspectRatio: true
      },
      compression: {
        algorithm: 'brotli',
        level: 11,
        preserveMetadata: true
      },
      upload: {
        platform: 'arweave',
        public: true,
        tags: ['metaverso', '3d', 'character'],
        pin: true
      }
    };

    const result = await assetsSystem.processAsset('./assets/models/character.glb', customConfig);
    
    if (result.success) {
      console.log('✅ Asset procesado con configuración personalizada');
      console.log(`📊 Reducción total: ${result.stats.reduction.toFixed(1)}%`);
      console.log(`🔗 URL permanente: ${result.processedPath}\n`);
    }

    // 2. Procesamiento en lote con diferentes configuraciones
    console.log('2️⃣ Procesamiento en lote con configuraciones específicas...');
    
    const batchConfigs = [
      {
        files: ['./assets/models/*.glb'],
        config: {
          optimization: { quality: 85, format: 'glb' },
          upload: { platform: 'ipfs' }
        }
      },
      {
        files: ['./assets/textures/*.png'],
        config: {
          optimization: { quality: 80, format: 'webp' },
          upload: { platform: 'arweave' }
        }
      },
      {
        files: ['./assets/audio/*.wav'],
        config: {
          optimization: { quality: 70, format: 'mp3' },
          upload: { platform: 'aws' }
        }
      }
    ];

    for (const batch of batchConfigs) {
      const files = await globFiles(batch.files);
      if (files.length > 0) {
        console.log(`📦 Procesando ${files.length} archivos con configuración específica...`);
        const results = await assetsSystem.processAssets(files, batch.config);
        const successCount = results.filter(r => r.success).length;
        console.log(`✅ ${successCount}/${files.length} procesados exitosamente\n`);
      }
    }

    // 3. Búsqueda avanzada y filtrado
    console.log('3️⃣ Búsqueda avanzada y filtrado...');
    
    const searchQueries = [
      {
        name: 'Modelos 3D grandes',
        criteria: {
          type: '3d_model',
          size: { min: 1024 * 1024 }, // > 1MB
          sortBy: 'size',
          sortOrder: 'desc',
          limit: 5
        }
      },
      {
        name: 'Texturas recientes',
        criteria: {
          type: 'texture',
          date: { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Última semana
          sortBy: 'date',
          sortOrder: 'desc',
          limit: 10
        }
      },
      {
        name: 'Assets con tags específicos',
        criteria: {
          tags: ['character', 'animated'],
          sortBy: 'name',
          limit: 20
        }
      }
    ];

    for (const query of searchQueries) {
      console.log(`🔍 ${query.name}:`);
      const results = await assetsSystem.searchAssets(query.criteria);
      console.log(`   Encontrados: ${results.length} assets`);
      
      if (results.length > 0) {
        const sample = results.slice(0, 3);
        sample.forEach(asset => {
          console.log(`   - ${asset.name} (${formatSize(asset.size)})`);
        });
      }
      console.log('');
    }

    // 4. Gestión de metadatos
    console.log('4️⃣ Gestión de metadatos...');
    
    // Obtener asset específico
    const assetId = 'example-asset-id';
    const asset = await assetsSystem.getAsset(assetId);
    
    if (asset) {
      console.log(`📋 Metadatos de ${asset.name}:`);
      console.log(`   Tipo: ${asset.type}`);
      console.log(`   Categoría: ${asset.category}`);
      console.log(`   Tamaño: ${formatSize(asset.size)}`);
      console.log(`   Tags: ${asset.metadata.tags.join(', ')}`);
      console.log(`   URL: ${asset.url}\n`);

      // Actualizar metadatos
      await assetsSystem.updateAssetMetadata(assetId, {
        description: 'Asset de ejemplo actualizado',
        tags: [...asset.metadata.tags, 'updated', 'example']
      });
      console.log('✅ Metadatos actualizados\n');
    }

    // 5. Exportación e importación de catálogo
    console.log('5️⃣ Exportación e importación de catálogo...');
    
    // Exportar catálogo
    const catalogJson = await assetsSystem.exportCatalog('json');
    const catalogCsv = await assetsSystem.exportCatalog('csv');
    
    await fs.writeFile('./catalog-export.json', catalogJson);
    await fs.writeFile('./catalog-export.csv', catalogCsv);
    
    console.log('📤 Catálogo exportado en formato JSON y CSV\n');

    // 6. Monitoreo y métricas
    console.log('6️⃣ Monitoreo y métricas...');
    
    const stats = await assetsSystem.getStats();
    
    console.log('📊 Métricas Detalladas:');
    console.log(`   Total de assets: ${stats.totalAssets}`);
    console.log(`   Tamaño total: ${formatSize(stats.totalSize)}`);
    console.log(`   Optimización promedio: ${stats.averageOptimization.toFixed(1)}%`);
    console.log(`   Almacenamiento usado: ${formatSize(stats.storageUsed)}`);
    console.log(`   Total de uploads: ${stats.uploads}`);
    
    console.log('\n📂 Distribución por categorías:');
    Object.entries(stats.categories).forEach(([category, count]) => {
      const percentage = ((count / stats.totalAssets) * 100).toFixed(1);
      console.log(`   ${category}: ${count} (${percentage}%)`);
    });
    
    console.log('\n📈 Assets recientes:');
    stats.recentUploads.slice(0, 5).forEach(asset => {
      console.log(`   - ${asset.name} (${asset.type}) - ${asset.createdAt.toLocaleDateString()}`);
    });
    console.log('');

    // 7. Limpieza y mantenimiento
    console.log('7️⃣ Limpieza y mantenimiento...');
    
    await assetsSystem.cleanup();
    console.log('✅ Limpieza completada');
    
    // Verificar conectividad de plataformas
    const connectivity = await assetsSystem.uploader.checkConnectivity();
    console.log('\n🌐 Estado de conectividad:');
    Object.entries(connectivity).forEach(([platform, status]) => {
      console.log(`   ${platform}: ${status ? '✅ Conectado' : '❌ Desconectado'}`);
    });
    console.log('');

    console.log('🎉 Ejemplo avanzado completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el ejemplo avanzado:', error);
  }
}

// Función auxiliar para expandir patrones glob
async function globFiles(pattern) {
  const glob = require('glob');
  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
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
  advancedUsage();
}

module.exports = { advancedUsage }; 