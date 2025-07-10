const fs = require('fs');
const path = require('path');
const { processGltf } = require('gltf-pipeline');
const sharp = require('sharp');

// Script para optimizar modelos 3D y texturas

const MODELS_DIR = './assets/models';
const TEXTURES_DIR = './assets/textures';
const OUTPUT_MODELS_DIR = './dist/models';
const OUTPUT_TEXTURES_DIR = './dist/textures';

console.log('Optimizando assets 3D...');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function optimizeModel(filePath, outputDir) {
    const fileName = path.basename(filePath);
    const gltf = fs.readFileSync(filePath);
    const options = {
        dracoOptions: { compressionLevel: 10 }
    };
    const results = await processGltf(gltf, options);
    fs.writeFileSync(path.join(outputDir, fileName), results.gltf);
    console.log(`Modelo optimizado: ${fileName}`);
}

async function optimizeTexture(filePath, outputDir) {
    const fileName = path.basename(filePath, path.extname(filePath)) + '.webp';
    await sharp(filePath)
        .resize({ width: 1024 })
        .webp({ quality: 80 })
        .toFile(path.join(outputDir, fileName));
    console.log(`Textura optimizada: ${fileName}`);
}

function getFiles(dir, exts) {
    return fs.readdirSync(dir)
        .filter(f => exts.includes(path.extname(f).toLowerCase()))
        .map(f => path.join(dir, f));
}

function cleanUnusedAssets(usedFiles, dir) {
    const allFiles = fs.readdirSync(dir);
    allFiles.forEach(file => {
        if (!usedFiles.includes(file)) {
            fs.unlinkSync(path.join(dir, file));
            console.log(`Asset eliminado: ${file}`);
        }
    });
}

async function main() {
    ensureDir(OUTPUT_MODELS_DIR);
    ensureDir(OUTPUT_TEXTURES_DIR);

    // Optimizar modelos 3D (glTF/GLB)
    const modelFiles = getFiles(MODELS_DIR, ['.gltf', '.glb']);
    for (const file of modelFiles) {
        await optimizeModel(file, OUTPUT_MODELS_DIR);
    }

    // Optimizar texturas (JPG/PNG)
    const textureFiles = getFiles(TEXTURES_DIR, ['.jpg', '.jpeg', '.png']);
    for (const file of textureFiles) {
        await optimizeTexture(file, OUTPUT_TEXTURES_DIR);
    }

    // Limpiar assets no utilizados (ejemplo)
    // cleanUnusedAssets(['model1.gltf', 'texture1.webp'], OUTPUT_MODELS_DIR);
}

main().catch(err => console.error(err));

// ============================================================================
// SISTEMA AVANZADO DE OPTIMIZACIÓN Y ANÁLISIS DE ASSETS
// ============================================================================

class AssetOptimizer {
    constructor() {
        this.optimizationMetrics = new Map();
        this.compressionHistory = new Map();
        this.qualitySettings = {
            low: { quality: 60, maxWidth: 512 },
            medium: { quality: 80, maxWidth: 1024 },
            high: { quality: 90, maxWidth: 2048 },
            extreme: { quality: 95, maxWidth: 4096 }
        };
    }

    async analyzeAsset(filePath) {
        const stats = fs.statSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        const analysis = {
            path: filePath,
            size: stats.size,
            type: this.getAssetType(ext),
            optimization: this.calculateOptimizationPotential(stats.size, ext),
            compression: this.estimateCompressionRatio(ext),
            lastModified: stats.mtime
        };

        this.optimizationMetrics.set(filePath, analysis);
        return analysis;
    }

    getAssetType(extension) {
        const typeMap = {
            '.gltf': '3d-model',
            '.glb': '3d-model',
            '.obj': '3d-model',
            '.fbx': '3d-model',
            '.jpg': 'texture',
            '.jpeg': 'texture',
            '.png': 'texture',
            '.webp': 'texture',
            '.mp3': 'audio',
            '.wav': 'audio',
            '.ogg': 'audio'
        };
        return typeMap[extension] || 'unknown';
    }

    calculateOptimizationPotential(size, extension) {
        const baseScore = Math.min(size / 1024 / 1024, 10); // Max 10 points
        const typeMultiplier = {
            '.png': 1.5,
            '.jpg': 1.2,
            '.gltf': 1.8,
            '.glb': 1.6,
            '.mp3': 1.3
        };
        return Math.round(baseScore * (typeMultiplier[extension] || 1));
    }

    estimateCompressionRatio(extension) {
        const ratios = {
            '.png': 0.7,  // 30% reduction
            '.jpg': 0.8,  // 20% reduction
            '.gltf': 0.6, // 40% reduction
            '.glb': 0.5,  // 50% reduction
            '.mp3': 0.9   // 10% reduction
        };
        return ratios[extension] || 0.8;
    }

    async batchOptimize(directory, quality = 'medium') {
        console.log(`Optimizando assets en ${directory} con calidad ${quality}...`);
        
        const files = this.getAllAssetFiles(directory);
        const results = [];
        
        for (const file of files) {
            try {
                const result = await this.optimizeSingleAsset(file, quality);
                results.push(result);
            } catch (error) {
                console.error(`Error optimizando ${file}:`, error.message);
                results.push({ file, error: error.message });
            }
        }
        
        return this.generateOptimizationReport(results);
    }

    getAllAssetFiles(directory) {
        const assetExtensions = ['.gltf', '.glb', '.obj', '.fbx', '.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.ogg'];
        const files = [];
        
        function scanDir(dir) {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDir(fullPath);
                } else if (assetExtensions.includes(path.extname(item).toLowerCase())) {
                    files.push(fullPath);
                }
            }
        }
        
        scanDir(directory);
        return files;
    }

    async optimizeSingleAsset(filePath, quality) {
        const startTime = Date.now();
        const originalSize = fs.statSync(filePath).size;
        const ext = path.extname(filePath).toLowerCase();
        
        const settings = this.qualitySettings[quality];
        const outputPath = this.getOptimizedPath(filePath, quality);
        
        let optimizedSize = originalSize;
        
        switch (ext) {
            case '.png':
            case '.jpg':
            case '.jpeg':
                await this.optimizeImage(filePath, outputPath, settings);
                break;
            case '.gltf':
            case '.glb':
                await this.optimize3DModel(filePath, outputPath, quality);
                break;
            case '.mp3':
            case '.wav':
            case '.ogg':
                await this.optimizeAudio(filePath, outputPath, quality);
                break;
        }
        
        optimizedSize = fs.statSync(outputPath).size;
        const compressionRatio = optimizedSize / originalSize;
        
        const result = {
            file: filePath,
            originalSize,
            optimizedSize,
            compressionRatio,
            savings: originalSize - optimizedSize,
            processingTime: Date.now() - startTime,
            quality
        };
        
        this.compressionHistory.set(filePath, result);
        return result;
    }

    getOptimizedPath(filePath, quality) {
        const dir = path.dirname(filePath);
        const name = path.basename(filePath, path.extname(filePath));
        const ext = path.extname(filePath);
        return path.join(dir, `${name}-${quality}${ext}`);
    }

    async optimizeImage(inputPath, outputPath, settings) {
        await sharp(inputPath)
            .resize({ width: settings.maxWidth, withoutEnlargement: true })
            .webp({ quality: settings.quality })
            .toFile(outputPath);
    }

    async optimize3DModel(inputPath, outputPath, quality) {
        const gltf = fs.readFileSync(inputPath);
        const options = {
            dracoOptions: { 
                compressionLevel: quality === 'extreme' ? 10 : quality === 'high' ? 8 : 6 
            }
        };
        const results = await processGltf(gltf, options);
        fs.writeFileSync(outputPath, results.gltf);
    }

    async optimizeAudio(inputPath, outputPath, quality) {
        // Implementar optimización de audio con ffmpeg o similar
        // Por ahora, solo copiamos el archivo
        fs.copyFileSync(inputPath, outputPath);
    }

    generateOptimizationReport(results) {
        const totalOriginalSize = results.reduce((sum, r) => sum + (r.originalSize || 0), 0);
        const totalOptimizedSize = results.reduce((sum, r) => sum + (r.optimizedSize || 0), 0);
        const totalSavings = totalOriginalSize - totalOptimizedSize;
        const averageCompressionRatio = totalOptimizedSize / totalOriginalSize;
        
        return {
            summary: {
                totalFiles: results.length,
                totalOriginalSize,
                totalOptimizedSize,
                totalSavings,
                averageCompressionRatio,
                savingsPercentage: (totalSavings / totalOriginalSize) * 100
            },
            details: results,
            timestamp: new Date().toISOString()
        };
    }
}

// Exportar para uso en otros módulos
module.exports = { AssetOptimizer };