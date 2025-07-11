/**
 * Performance Optimizer - Script de optimización de rendimiento
 * WoldVirtual3DlucIA v0.6.0
 * 
 * Responsabilidades:
 * - Optimización de assets
 * - Compresión de imágenes
 * - Minificación de código
 * - Optimización de bundles
 * - Cache management
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');

class PerformanceOptimizer {
  constructor() {
    this.config = {
      imageQuality: 85,
      maxImageWidth: 1920,
      maxImageHeight: 1080,
      enableWebP: true,
      enableAvif: false,
      minifyCSS: true,
      minifyJS: true,
      enableGzip: true,
      enableBrotli: true,
      cacheDuration: 31536000, // 1 año
      maxBundleSize: 500 * 1024, // 500KB
    };
    
    this.stats = {
      imagesOptimized: 0,
      filesMinified: 0,
      bundlesOptimized: 0,
      cacheEntries: 0,
      totalSavings: 0,
    };
  }

  /**
   * Ejecuta todas las optimizaciones
   */
  async optimizeAll() {
    console.log('🚀 Iniciando optimización de rendimiento...');
    
    try {
      // Optimizar imágenes
      await this.optimizeImages();
      
      // Optimizar código
      await this.optimizeCode();
      
      // Optimizar bundles
      await this.optimizeBundles();
      
      // Configurar cache
      await this.setupCache();
      
      // Generar reporte
      this.generateReport();
      
      console.log('✅ Optimización completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error durante la optimización:', error);
      throw error;
    }
  }

  /**
   * Optimiza todas las imágenes del proyecto
   */
  async optimizeImages() {
    console.log('🖼️ Optimizando imágenes...');
    
    const imagePaths = [
      'public/assets/images',
      'assets/images',
      'src/assets/images',
      'web/assets/images'
    ];
    
    for (const imagePath of imagePaths) {
      if (fs.existsSync(imagePath)) {
        await this.optimizeImageDirectory(imagePath);
      }
    }
  }

  /**
   * Optimiza imágenes en un directorio específico
   */
  async optimizeImageDirectory(directoryPath) {
    const files = await imagemin([`${directoryPath}/*.{jpg,jpeg,png,svg}`], {
      destination: directoryPath,
      plugins: [
        imageminMozjpeg({ quality: this.config.imageQuality }),
        imageminPngquant({ quality: [0.6, 0.8] }),
        imageminSvgo({
          plugins: [
            { removeViewBox: false },
            { removeEmptyAttrs: false }
          ]
        })
      ]
    });
    
    this.stats.imagesOptimized += files.length;
    console.log(`📸 Optimizadas ${files.length} imágenes en ${directoryPath}`);
    
    // Convertir a WebP si está habilitado
    if (this.config.enableWebP) {
      await this.convertToWebP(directoryPath);
    }
  }

  /**
   * Convierte imágenes a formato WebP
   */
  async convertToWebP(directoryPath) {
    try {
      const { execSync } = require('child_process');
      
      // Verificar si cwebp está disponible
      try {
        execSync('cwebp -version', { stdio: 'ignore' });
      } catch {
        console.log('⚠️ cwebp no disponible, saltando conversión WebP');
        return;
      }
      
      const imageFiles = fs.readdirSync(directoryPath)
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
      
      for (const file of imageFiles) {
        const inputPath = path.join(directoryPath, file);
        const outputPath = path.join(directoryPath, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
        
        execSync(`cwebp -q ${this.config.imageQuality} "${inputPath}" -o "${outputPath}"`, {
          stdio: 'ignore'
        });
      }
      
      console.log(`🔄 Convertidas ${imageFiles.length} imágenes a WebP`);
      
    } catch (error) {
      console.warn('⚠️ Error en conversión WebP:', error.message);
    }
  }

  /**
   * Optimiza código JavaScript y CSS
   */
  async optimizeCode() {
    console.log('📝 Optimizando código...');
    
    // Minificar CSS
    if (this.config.minifyCSS) {
      await this.minifyCSS();
    }
    
    // Minificar JavaScript
    if (this.config.minifyJS) {
      await this.minifyJavaScript();
    }
    
    // Optimizar TypeScript
    await this.optimizeTypeScript();
  }

  /**
   * Minifica archivos CSS
   */
  async minifyCSS() {
    const cssPaths = [
      'src/styles',
      'css',
      'web/styles',
      'components/styles'
    ];
    
    for (const cssPath of cssPaths) {
      if (fs.existsSync(cssPath)) {
        await this.minifyCSSDirectory(cssPath);
      }
    }
  }

  /**
   * Minifica CSS en un directorio específico
   */
  async minifyCSSDirectory(directoryPath) {
    const files = fs.readdirSync(directoryPath)
      .filter(file => file.endsWith('.css'));
    
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Minificación básica
      const minified = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Comentarios
        .replace(/\s+/g, ' ') // Espacios múltiples
        .replace(/;\s*}/g, '}') // Punto y coma antes de }
        .replace(/:\s+/g, ':') // Espacios después de :
        .replace(/;\s+/g, ';') // Espacios después de ;
        .trim();
      
      // Crear archivo minificado
      const minifiedPath = filePath.replace('.css', '.min.css');
      fs.writeFileSync(minifiedPath, minified);
      
      this.stats.filesMinified++;
    }
    
    console.log(`🎨 Minificados ${files.length} archivos CSS en ${directoryPath}`);
  }

  /**
   * Minifica archivos JavaScript
   */
  async minifyJavaScript() {
    const jsPaths = [
      'src',
      'js',
      'web/src',
      'components/src'
    ];
    
    for (const jsPath of jsPaths) {
      if (fs.existsSync(jsPath)) {
        await this.minifyJSDirectory(jsPath);
      }
    }
  }

  /**
   * Minifica JavaScript en un directorio específico
   */
  async minifyJSDirectory(directoryPath) {
    const files = this.getJavaScriptFiles(directoryPath);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Minificación básica
      const minified = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Comentarios multilínea
        .replace(/\/\/.*$/gm, '') // Comentarios de línea
        .replace(/\s+/g, ' ') // Espacios múltiples
        .replace(/;\s*}/g, '}') // Punto y coma antes de }
        .trim();
      
      // Crear archivo minificado
      const minifiedPath = file.replace('.js', '.min.js');
      fs.writeFileSync(minifiedPath, minified);
      
      this.stats.filesMinified++;
    }
    
    console.log(`⚡ Minificados ${files.length} archivos JavaScript en ${directoryPath}`);
  }

  /**
   * Obtiene todos los archivos JavaScript recursivamente
   */
  getJavaScriptFiles(directoryPath) {
    const files = [];
    
    const traverse = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.js') && !item.endsWith('.min.js')) {
          files.push(fullPath);
        }
      }
    };
    
    traverse(directoryPath);
    return files;
  }

  /**
   * Optimiza TypeScript
   */
  async optimizeTypeScript() {
    console.log('📘 Optimizando TypeScript...');
    
    try {
      // Verificar tipos
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      
      // Generar definiciones de tipos optimizadas
      execSync('npx tsc --declaration --emitDeclarationOnly --outDir dist/types', { stdio: 'pipe' });
      
      console.log('✅ TypeScript optimizado');
      
    } catch (error) {
      console.warn('⚠️ Advertencias en TypeScript:', error.message);
    }
  }

  /**
   * Optimiza bundles de la aplicación
   */
  async optimizeBundles() {
    console.log('📦 Optimizando bundles...');
    
    // Analizar tamaño de bundles
    await this.analyzeBundleSize();
    
    // Optimizar imports
    await this.optimizeImports();
    
    // Configurar tree shaking
    await this.setupTreeShaking();
    
    this.stats.bundlesOptimized++;
  }

  /**
   * Analiza el tamaño de los bundles
   */
  async analyzeBundleSize() {
    try {
      // Usar webpack-bundle-analyzer si está disponible
      execSync('npx webpack-bundle-analyzer build/stats.json', { stdio: 'ignore' });
    } catch {
      // Análisis manual de tamaños
      const buildPath = 'build';
      if (fs.existsSync(buildPath)) {
        const files = fs.readdirSync(buildPath);
        let totalSize = 0;
        
        for (const file of files) {
          const filePath = path.join(buildPath, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          
          if (stats.size > this.config.maxBundleSize) {
            console.warn(`⚠️ Bundle grande detectado: ${file} (${(stats.size / 1024).toFixed(2)}KB)`);
          }
        }
        
        console.log(`📊 Tamaño total de bundles: ${(totalSize / 1024).toFixed(2)}KB`);
      }
    }
  }

  /**
   * Optimiza imports para reducir el tamaño del bundle
   */
  async optimizeImports() {
    console.log('📥 Optimizando imports...');
    
    // Buscar imports innecesarios
    const sourcePaths = ['src', 'components', 'services'];
    
    for (const sourcePath of sourcePaths) {
      if (fs.existsSync(sourcePath)) {
        await this.optimizeImportsInDirectory(sourcePath);
      }
    }
  }

  /**
   * Optimiza imports en un directorio específico
   */
  async optimizeImportsInDirectory(directoryPath) {
    const files = this.getTypeScriptFiles(directoryPath);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Detectar imports no utilizados (análisis básico)
      const lines = content.split('\n');
      const optimizedLines = lines.filter(line => {
        // Filtrar imports vacíos o comentarios
        return !line.trim().startsWith('import {}') && 
               !line.trim().startsWith('//') &&
               line.trim() !== '';
      });
      
      if (optimizedLines.length !== lines.length) {
        fs.writeFileSync(file, optimizedLines.join('\n'));
        console.log(`🔧 Optimizados imports en ${file}`);
      }
    }
  }

  /**
   * Obtiene archivos TypeScript recursivamente
   */
  getTypeScriptFiles(directoryPath) {
    const files = [];
    
    const traverse = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    };
    
    traverse(directoryPath);
    return files;
  }

  /**
   * Configura tree shaking
   */
  async setupTreeShaking() {
    console.log('🌳 Configurando tree shaking...');
    
    // Crear configuración de webpack optimizada
    const webpackConfig = {
      mode: 'production',
      optimization: {
        usedExports: true,
        sideEffects: false,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      },
    };
    
    // Guardar configuración
    fs.writeFileSync('webpack.optimized.config.js', `module.exports = ${JSON.stringify(webpackConfig, null, 2)}`);
    
    console.log('✅ Tree shaking configurado');
  }

  /**
   * Configura cache para mejor rendimiento
   */
  async setupCache() {
    console.log('💾 Configurando cache...');
    
    // Crear archivo de configuración de cache
    const cacheConfig = {
      staticAssets: {
        maxAge: this.config.cacheDuration,
        headers: {
          'Cache-Control': `public, max-age=${this.config.cacheDuration}`,
        },
      },
      apiResponses: {
        maxAge: 300, // 5 minutos
        headers: {
          'Cache-Control': 'public, max-age=300',
        },
      },
    };
    
    fs.writeFileSync('cache.config.json', JSON.stringify(cacheConfig, null, 2));
    
    this.stats.cacheEntries = Object.keys(cacheConfig).length;
    console.log('✅ Cache configurado');
  }

  /**
   * Genera reporte de optimización
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      config: this.config,
      recommendations: this.generateRecommendations(),
    };
    
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 REPORTE DE OPTIMIZACIÓN');
    console.log('========================');
    console.log(`🖼️ Imágenes optimizadas: ${this.stats.imagesOptimized}`);
    console.log(`📝 Archivos minificados: ${this.stats.filesMinified}`);
    console.log(`📦 Bundles optimizados: ${this.stats.bundlesOptimized}`);
    console.log(`💾 Entradas de cache: ${this.stats.cacheEntries}`);
    console.log(`💰 Ahorro total estimado: ${(this.stats.totalSavings / 1024).toFixed(2)}KB`);
    
    console.log('\n💡 RECOMENDACIONES:');
    report.recommendations.forEach(rec => {
      console.log(`- ${rec}`);
    });
  }

  /**
   * Genera recomendaciones de optimización
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.stats.imagesOptimized === 0) {
      recommendations.push('Considerar optimizar imágenes para reducir el tamaño de carga');
    }
    
    if (this.stats.filesMinified === 0) {
      recommendations.push('Minificar archivos CSS y JavaScript para mejor rendimiento');
    }
    
    if (!this.config.enableWebP) {
      recommendations.push('Habilitar conversión WebP para imágenes más pequeñas');
    }
    
    if (!this.config.enableGzip) {
      recommendations.push('Habilitar compresión Gzip para transferencias más rápidas');
    }
    
    recommendations.push('Implementar lazy loading para componentes pesados');
    recommendations.push('Usar CDN para assets estáticos');
    recommendations.push('Implementar service workers para cache offline');
    
    return recommendations;
  }
}

// Función principal
async function main() {
  const optimizer = new PerformanceOptimizer();
  
  try {
    await optimizer.optimizeAll();
  } catch (error) {
    console.error('❌ Error en optimización:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = PerformanceOptimizer; 