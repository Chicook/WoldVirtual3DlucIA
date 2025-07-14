/**
 * @fileoverview Ejemplo básico de uso del sistema de fuentes del metaverso
 * @module @metaverso/fonts/examples/basic-usage
 */

import { FontManager, FontFamily, FontVariant, FontStyle } from '../src';

/**
 * Ejemplo básico de uso del sistema de fuentes
 */
async function basicUsageExample() {
  console.log('🚀 Iniciando ejemplo básico del sistema de fuentes...');

  try {
    // Crear gestor de fuentes
    const fontManager = new FontManager({
      ipfs: { enabled: false },
      cache: { enabled: true, ttl: 3600, maxSize: 50, strategy: 'lru', persistence: false },
      optimization: { enabled: false, compression: 'ttf', subsetting: false, quality: 'low', hinting: false, kerning: false },
      rendering: { antialiasing: true, hinting: true, kerning: true, ligatures: true, subpixel: true, gamma: 2.2 },
      accessibility: { highContrast: false, dyslexia: false, screenReader: true, fontSize: 16, lineHeight: 1.5 },
      security: { verification: false, integrity: false, license: false, sandbox: false }
    });

    // Inicializar el sistema
    await fontManager.initialize();
    console.log('✅ Sistema de fuentes inicializado');

    // Crear una familia de fuentes personalizada
    const robotoFamily: FontFamily = {
      name: 'Roboto',
      variants: [
        {
          name: 'regular',
          style: { name: 'regular', weight: 400, italic: false, stretch: 100 }
        },
        {
          name: 'bold',
          style: { name: 'bold', weight: 700, italic: false, stretch: 100 }
        },
        {
          name: 'italic',
          style: { name: 'italic', weight: 400, italic: true, stretch: 100 }
        }
      ],
      category: 'sans-serif',
      license: 'Apache-2.0',
      author: 'Google Fonts',
      version: '2.138',
      languages: ['en', 'es', 'fr', 'de'],
      metadata: {
        description: 'Roboto is a sans-serif typeface family developed by Google',
        website: 'https://fonts.google.com/specimen/Roboto'
      }
    };

    // Registrar la familia de fuentes
    await fontManager.registerFamily(robotoFamily);
    console.log('✅ Familia de fuentes Roboto registrada');

    // Cargar una fuente específica
    const font = await fontManager.loadFont('Roboto', 'regular', {
      size: 16,
      color: '#333333',
      antialiasing: true,
      hinting: true,
      kerning: true,
      ligatures: true
    });

    console.log('✅ Fuente cargada:', font);

    // Verificar disponibilidad de fuentes
    console.log('Fuentes disponibles:');
    console.log('- Roboto regular:', fontManager.isFontAvailable('Roboto', 'regular'));
    console.log('- Roboto bold:', fontManager.isFontAvailable('Roboto', 'bold'));
    console.log('- Arial regular:', fontManager.isFontAvailable('Arial', 'regular'));

    // Obtener estadísticas de rendimiento
    const metrics = fontManager.getPerformanceMetrics();
    console.log('📊 Métricas de rendimiento:', metrics);

    // Obtener estadísticas del cache
    const cacheStats = await fontManager.getCacheStats();
    console.log('📊 Estadísticas del cache:', cacheStats);

    // Renderizar texto en 3D (ejemplo básico)
    const text3D = await fontManager.renderText3D({
      text: 'Metaverso',
      font: 'Roboto',
      style: 'regular',
      size: 24,
      color: '#00ff00',
      position: [0, 0, 0],
      effects: {
        glow: true,
        shadow: true
      },
      animation: {
        type: 'fade-in',
        duration: 1000,
        easing: 'ease-in-out'
      }
    });

    console.log('✅ Texto 3D renderizado:', text3D);

    // Obtener todas las familias registradas
    const families = fontManager.getRegisteredFamilies();
    console.log('📚 Familias de fuentes registradas:', families.length);

    // Limpiar recursos
    await fontManager.destroy();
    console.log('✅ Sistema de fuentes destruido');

  } catch (error) {
    console.error('❌ Error en el ejemplo:', error);
  }
}

/**
 * Ejemplo de integración con IPFS
 */
async function ipfsIntegrationExample() {
  console.log('🌐 Iniciando ejemplo de integración IPFS...');

  try {
    // Crear gestor con IPFS habilitado
    const fontManager = new FontManager({
      ipfs: { 
        enabled: true, 
        gateway: 'https://ipfs.io', 
        timeout: 30000, 
        retries: 3, 
        pinning: true 
      },
      cache: { enabled: true, ttl: 3600, maxSize: 50, strategy: 'lru', persistence: true },
      optimization: { enabled: true, compression: 'woff2', subsetting: true, quality: 'high', hinting: true, kerning: true },
      rendering: { antialiasing: true, hinting: true, kerning: true, ligatures: true, subpixel: true, gamma: 2.2 },
      accessibility: { highContrast: false, dyslexia: false, screenReader: true, fontSize: 16, lineHeight: 1.5 },
      security: { verification: true, integrity: true, license: true, sandbox: true }
    });

    await fontManager.initialize();
    console.log('✅ Sistema de fuentes con IPFS inicializado');

    // Crear fuente con datos simulados
    const fontData = new ArrayBuffer(1024); // Datos simulados
    const customFamily: FontFamily = {
      name: 'CustomFont',
      variants: [
        {
          name: 'regular',
          style: { name: 'regular', weight: 400, italic: false, stretch: 100 },
          data: fontData
        }
      ],
      category: 'sans-serif',
      license: 'MIT',
      languages: ['en']
    };

    // Registrar fuente (se subirá automáticamente a IPFS)
    await fontManager.registerFamily(customFamily);
    console.log('✅ Fuente personalizada registrada y subida a IPFS');

    await fontManager.destroy();

  } catch (error) {
    console.error('❌ Error en ejemplo IPFS:', error);
  }
}

/**
 * Ejemplo de optimización de fuentes
 */
async function optimizationExample() {
  console.log('⚡ Iniciando ejemplo de optimización...');

  try {
    const fontManager = new FontManager({
      optimization: { 
        enabled: true, 
        compression: 'woff2', 
        subsetting: true, 
        quality: 'high', 
        hinting: true, 
        kerning: true 
      }
    });

    await fontManager.initialize();

    // Crear fuente para optimizar
    const fontData = new ArrayBuffer(2048); // Datos simulados más grandes
    const familyToOptimize: FontFamily = {
      name: 'OptimizedFont',
      variants: [
        {
          name: 'regular',
          style: { name: 'regular', weight: 400, italic: false, stretch: 100 },
          data: fontData
        }
      ],
      category: 'serif',
      license: 'MIT',
      languages: ['en']
    };

    // Registrar fuente (se optimizará automáticamente)
    await fontManager.registerFamily(familyToOptimize);
    console.log('✅ Fuente optimizada registrada');

    await fontManager.destroy();

  } catch (error) {
    console.error('❌ Error en ejemplo de optimización:', error);
  }
}

// Ejecutar ejemplos
if (require.main === module) {
  (async () => {
    console.log('🎨 Ejemplos del Sistema de Fuentes del Metaverso\n');
    
    await basicUsageExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await ipfsIntegrationExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await optimizationExample();
    
    console.log('\n🎉 Todos los ejemplos completados exitosamente!');
  })();
}

export {
  basicUsageExample,
  ipfsIntegrationExample,
  optimizationExample
}; 