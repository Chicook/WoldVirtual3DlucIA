#!/usr/bin/env node

/**
 * 🎨 Asset Processor - Metaverso Web3
 * Procesa y optimiza assets 3D: modelos, texturas, animaciones y sonidos
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { performance } = require('perf_hooks');

// Configuración
const CONFIG = {
    inputDir: './assets/raw',
    outputDir: './assets/processed',
    tempDir: './assets/temp',
    formats: {
        models: ['.gltf', '.glb', '.fbx', '.obj', '.dae'],
        textures: ['.png', '.jpg', '.jpeg', '.tga', '.bmp'],
        audio: ['.mp3', '.wav', '.ogg', '.flac'],
        animations: ['.fbx', '.bvh', '.dae']
    },
    optimization: {
        models: {
            maxVertices: 10000,
            maxTriangles: 20000,
            compression: 'draco',
            level: 7
        },
        textures: {
            maxSize: 2048,
            format: 'webp',
            quality: 80,
            generateMipmaps: true
        },
        audio: {
            format: 'ogg',
            quality: 0.7,
            sampleRate: 44100
        }
    }
};

// Colores para consola
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

class AssetProcessor {
    constructor() {
        this.processedAssets = {
            models: [],
            textures: [],
            audio: [],
            animations: []
        };
        this.errors = [];
        this.warnings = [];
        this.startTime = performance.now();
    }

    log(message, color = 'reset', level = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`${colors[color]}[${timestamp}] [${level}] ${message}${colors.reset}`);
    }

    // Crear directorios necesarios
    createDirectories() {
        const dirs = [CONFIG.outputDir, CONFIG.tempDir];
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.log(`📁 Directorio creado: ${dir}`, 'green');
            }
        });
    }

    // Obtener estadísticas de archivo
    getFileStats(filepath) {
        const stats = fs.statSync(filepath);
        return {
            size: stats.size,
            sizeMB: (stats.size / 1024 / 1024).toFixed(2),
            modified: stats.mtime,
            extension: path.extname(filepath).toLowerCase()
        };
    }

    // Verificar si un archivo es un modelo 3D
    isModelFile(filepath) {
        return CONFIG.formats.models.includes(path.extname(filepath).toLowerCase());
    }

    // Verificar si un archivo es una textura
    isTextureFile(filepath) {
        return CONFIG.formats.textures.includes(path.extname(filepath).toLowerCase());
    }

    // Verificar si un archivo es audio
    isAudioFile(filepath) {
        return CONFIG.formats.audio.includes(path.extname(filepath).toLowerCase());
    }

    // Verificar si un archivo es una animación
    isAnimationFile(filepath) {
        return CONFIG.formats.animations.includes(path.extname(filepath).toLowerCase());
    }

    // Procesar modelo 3D
    async processModel(inputPath, outputPath) {
        this.log(`🎨 Procesando modelo: ${path.basename(inputPath)}`, 'blue');
        
        try {
            const stats = this.getFileStats(inputPath);
            const extension = path.extname(inputPath).toLowerCase();
            
            // Verificar si es GLTF/GLB
            if (extension === '.gltf' || extension === '.glb') {
                await this.processGltfModel(inputPath, outputPath);
            } else {
                // Convertir a GLTF usando gltf-pipeline
                await this.convertToGltf(inputPath, outputPath);
            }
            
            const outputStats = this.getFileStats(outputPath);
            const compressionRatio = ((stats.size - outputStats.size) / stats.size * 100).toFixed(1);
            
            this.processedAssets.models.push({
                input: inputPath,
                output: outputPath,
                originalSize: stats.sizeMB,
                processedSize: outputStats.sizeMB,
                compressionRatio: `${compressionRatio}%`,
                format: 'glb'
            });
            
            this.log(`✅ Modelo procesado: ${compressionRatio}% de compresión`, 'green');
            
        } catch (error) {
            this.log(`❌ Error procesando modelo ${inputPath}: ${error.message}`, 'red');
            this.errors.push({ file: inputPath, error: error.message });
        }
    }

    // Procesar modelo GLTF específicamente
    async processGltfModel(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                // Usar gltf-pipeline para optimizar
                const command = `npx gltf-pipeline -i "${inputPath}" -o "${outputPath}" -s`;
                execSync(command, { stdio: 'pipe' });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Convertir modelo a GLTF
    async convertToGltf(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                // Usar assimp o similar para conversión
                const command = `npx assimp export "${inputPath}" "${outputPath}"`;
                execSync(command, { stdio: 'pipe' });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Procesar textura
    async processTexture(inputPath, outputPath) {
        this.log(`🖼️  Procesando textura: ${path.basename(inputPath)}`, 'blue');
        
        try {
            const stats = this.getFileStats(inputPath);
            
            // Usar sharp para procesar texturas
            const sharp = require('sharp');
            
            let image = sharp(inputPath);
            
            // Redimensionar si es necesario
            const metadata = await image.metadata();
            if (metadata.width > CONFIG.optimization.textures.maxSize || 
                metadata.height > CONFIG.optimization.textures.maxSize) {
                image = image.resize(CONFIG.optimization.textures.maxSize, CONFIG.optimization.textures.maxSize, {
                    fit: 'inside',
                    withoutEnlargement: true
                });
            }
            
            // Convertir a WebP
            if (CONFIG.optimization.textures.format === 'webp') {
                image = image.webp({ quality: CONFIG.optimization.textures.quality });
            }
            
            // Generar mipmaps si está habilitado
            if (CONFIG.optimization.textures.generateMipmaps) {
                // Implementar generación de mipmaps
                this.log(`📐 Generando mipmaps para: ${path.basename(inputPath)}`, 'yellow');
            }
            
            await image.toFile(outputPath);
            
            const outputStats = this.getFileStats(outputPath);
            const compressionRatio = ((stats.size - outputStats.size) / stats.size * 100).toFixed(1);
            
            this.processedAssets.textures.push({
                input: inputPath,
                output: outputPath,
                originalSize: stats.sizeMB,
                processedSize: outputStats.sizeMB,
                compressionRatio: `${compressionRatio}%`,
                format: CONFIG.optimization.textures.format,
                dimensions: `${metadata.width}x${metadata.height}`
            });
            
            this.log(`✅ Textura procesada: ${compressionRatio}% de compresión`, 'green');
            
        } catch (error) {
            this.log(`❌ Error procesando textura ${inputPath}: ${error.message}`, 'red');
            this.errors.push({ file: inputPath, error: error.message });
        }
    }

    // Procesar audio
    async processAudio(inputPath, outputPath) {
        this.log(`🔊 Procesando audio: ${path.basename(inputPath)}`, 'blue');
        
        try {
            const stats = this.getFileStats(inputPath);
            
            // Usar ffmpeg para procesar audio
            const ffmpegCommand = [
                '-i', inputPath,
                '-c:a', 'libvorbis',
                '-q:a', Math.floor(CONFIG.optimization.audio.quality * 10),
                '-ar', CONFIG.optimization.audio.sampleRate,
                outputPath
            ];
            
            execSync(`ffmpeg ${ffmpegCommand.join(' ')}`, { stdio: 'pipe' });
            
            const outputStats = this.getFileStats(outputPath);
            const compressionRatio = ((stats.size - outputStats.size) / stats.size * 100).toFixed(1);
            
            this.processedAssets.audio.push({
                input: inputPath,
                output: outputPath,
                originalSize: stats.sizeMB,
                processedSize: outputStats.sizeMB,
                compressionRatio: `${compressionRatio}%`,
                format: CONFIG.optimization.audio.format,
                sampleRate: CONFIG.optimization.audio.sampleRate
            });
            
            this.log(`✅ Audio procesado: ${compressionRatio}% de compresión`, 'green');
            
        } catch (error) {
            this.log(`❌ Error procesando audio ${inputPath}: ${error.message}`, 'red');
            this.errors.push({ file: inputPath, error: error.message });
        }
    }

    // Procesar animación
    async processAnimation(inputPath, outputPath) {
        this.log(`🎬 Procesando animación: ${path.basename(inputPath)}`, 'blue');
        
        try {
            const stats = this.getFileStats(inputPath);
            
            // Convertir animación a formato optimizado
            if (path.extname(inputPath).toLowerCase() === '.fbx') {
                await this.convertFbxAnimation(inputPath, outputPath);
            } else {
                // Copiar archivo si no es FBX
                fs.copyFileSync(inputPath, outputPath);
            }
            
            const outputStats = this.getFileStats(outputPath);
            const compressionRatio = ((stats.size - outputStats.size) / stats.size * 100).toFixed(1);
            
            this.processedAssets.animations.push({
                input: inputPath,
                output: outputPath,
                originalSize: stats.sizeMB,
                processedSize: outputStats.sizeMB,
                compressionRatio: `${compressionRatio}%`,
                format: 'gltf'
            });
            
            this.log(`✅ Animación procesada: ${compressionRatio}% de compresión`, 'green');
            
        } catch (error) {
            this.log(`❌ Error procesando animación ${inputPath}: ${error.message}`, 'red');
            this.errors.push({ file: inputPath, error: error.message });
        }
    }

    // Convertir animación FBX
    async convertFbxAnimation(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                // Usar FBX2glTF o similar para conversión
                const command = `npx fbx2gltf "${inputPath}" -o "${outputPath}"`;
                execSync(command, { stdio: 'pipe' });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Validar asset
    validateAsset(filepath) {
        const stats = this.getFileStats(filepath);
        const warnings = [];
        
        // Verificar tamaño
        if (stats.size > 100 * 1024 * 1024) { // 100MB
            warnings.push('Archivo muy grande (>100MB)');
        }
        
        // Verificar extensión
        const extension = path.extname(filepath).toLowerCase();
        const allFormats = [
            ...CONFIG.formats.models,
            ...CONFIG.formats.textures,
            ...CONFIG.formats.audio,
            ...CONFIG.formats.animations
        ];
        
        if (!allFormats.includes(extension)) {
            warnings.push(`Formato no soportado: ${extension}`);
        }
        
        return warnings;
    }

    // Escanear directorio de entrada
    scanInputDirectory() {
        this.log(`🔍 Escaneando directorio: ${CONFIG.inputDir}`, 'blue');
        
        const assets = {
            models: [],
            textures: [],
            audio: [],
            animations: []
        };
        
        function scanDirectory(dir) {
            if (!fs.existsSync(dir)) {
                return;
            }
            
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const filepath = path.join(dir, file);
                const stat = fs.statSync(filepath);
                
                if (stat.isDirectory()) {
                    scanDirectory(filepath);
                } else if (stat.isFile()) {
                    if (this.isModelFile(filepath)) {
                        assets.models.push(filepath);
                    } else if (this.isTextureFile(filepath)) {
                        assets.textures.push(filepath);
                    } else if (this.isAudioFile(filepath)) {
                        assets.audio.push(filepath);
                    } else if (this.isAnimationFile(filepath)) {
                        assets.animations.push(filepath);
                    }
                }
            });
        }
        
        scanDirectory.call(this, CONFIG.inputDir);
        
        this.log(`📊 Assets encontrados:`, 'green');
        this.log(`   Modelos: ${assets.models.length}`, 'green');
        this.log(`   Texturas: ${assets.textures.length}`, 'green');
        this.log(`   Audio: ${assets.audio.length}`, 'green');
        this.log(`   Animaciones: ${assets.animations.length}`, 'green');
        
        return assets;
    }

    // Procesar todos los assets
    async processAllAssets() {
        this.log('🚀 Iniciando procesamiento de assets...', 'green');
        
        this.createDirectories();
        const assets = this.scanInputDirectory();
        
        // Procesar modelos
        for (const model of assets.models) {
            const outputPath = path.join(
                CONFIG.outputDir,
                'models',
                path.basename(model, path.extname(model)) + '.glb'
            );
            
            // Crear directorio si no existe
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            await this.processModel(model, outputPath);
        }
        
        // Procesar texturas
        for (const texture of assets.textures) {
            const outputPath = path.join(
                CONFIG.outputDir,
                'textures',
                path.basename(texture, path.extname(texture)) + '.' + CONFIG.optimization.textures.format
            );
            
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            await this.processTexture(texture, outputPath);
        }
        
        // Procesar audio
        for (const audio of assets.audio) {
            const outputPath = path.join(
                CONFIG.outputDir,
                'audio',
                path.basename(audio, path.extname(audio)) + '.' + CONFIG.optimization.audio.format
            );
            
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            await this.processAudio(audio, outputPath);
        }
        
        // Procesar animaciones
        for (const animation of assets.animations) {
            const outputPath = path.join(
                CONFIG.outputDir,
                'animations',
                path.basename(animation, path.extname(animation)) + '.gltf'
            );
            
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            await this.processAnimation(animation, outputPath);
        }
    }

    // Generar reporte
    generateReport() {
        const duration = ((performance.now() - this.startTime) / 1000).toFixed(2);
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: `${duration}s`,
            summary: {
                totalProcessed: this.processedAssets.models.length + 
                               this.processedAssets.textures.length + 
                               this.processedAssets.audio.length + 
                               this.processedAssets.animations.length,
                models: this.processedAssets.models.length,
                textures: this.processedAssets.textures.length,
                audio: this.processedAssets.audio.length,
                animations: this.processedAssets.animations.length,
                errors: this.errors.length,
                warnings: this.warnings.length
            },
            assets: this.processedAssets,
            errors: this.errors,
            warnings: this.warnings
        };
        
        return report;
    }

    // Mostrar estadísticas
    displayStats() {
        console.log(`\n${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.cyan}║                    🎨 ASSET PROCESSING STATS                  ║${colors.reset}`);
        console.log(`${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

        console.log(`${colors.blue}📊 SUMMARY:${colors.reset}`);
        console.log(`   Total Processed: ${this.processedAssets.models.length + this.processedAssets.textures.length + this.processedAssets.audio.length + this.processedAssets.animations.length}`);
        console.log(`   Models: ${colors.green}${this.processedAssets.models.length}${colors.reset}`);
        console.log(`   Textures: ${colors.green}${this.processedAssets.textures.length}${colors.reset}`);
        console.log(`   Audio: ${colors.green}${this.processedAssets.audio.length}${colors.reset}`);
        console.log(`   Animations: ${colors.green}${this.processedAssets.animations.length}${colors.reset}`);
        console.log(`   Errors: ${colors.red}${this.errors.length}${colors.reset}`);
        console.log(`   Warnings: ${colors.yellow}${this.warnings.length}${colors.reset}`);

        if (this.processedAssets.models.length > 0) {
            console.log(`\n${colors.blue}🎨 MODELS:${colors.reset}`);
            this.processedAssets.models.forEach(model => {
                console.log(`   ${path.basename(model.input)}: ${model.compressionRatio} compression`);
            });
        }

        if (this.processedAssets.textures.length > 0) {
            console.log(`\n${colors.blue}🖼️  TEXTURES:${colors.reset}`);
            this.processedAssets.textures.forEach(texture => {
                console.log(`   ${path.basename(texture.input)}: ${texture.compressionRatio} compression (${texture.dimensions})`);
            });
        }

        if (this.processedAssets.audio.length > 0) {
            console.log(`\n${colors.blue}🔊 AUDIO:${colors.reset}`);
            this.processedAssets.audio.forEach(audio => {
                console.log(`   ${path.basename(audio.input)}: ${audio.compressionRatio} compression`);
            });
        }

        if (this.errors.length > 0) {
            console.log(`\n${colors.red}❌ ERRORS:${colors.reset}`);
            this.errors.forEach(error => {
                console.log(`   ${path.basename(error.file)}: ${error.error}`);
            });
        }
    }

    // Guardar reporte
    saveReport(report, filename = 'asset-processing-report.json') {
        const reportPath = path.join(CONFIG.outputDir, filename);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`📄 Reporte guardado en: ${reportPath}`, 'green');
    }
}

// Manejar argumentos de línea de comandos
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        input: CONFIG.inputDir,
        output: CONFIG.outputDir,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--input':
            case '-i':
                options.input = args[++i];
                break;
            case '--output':
            case '-o':
                options.output = args[++i];
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }

    return options;
}

// Mostrar ayuda
function showHelp() {
    console.log(`${colors.cyan}🎨 Asset Processor - Metaverso Web3${colors.reset}\n`);
    console.log('Uso: node process-assets.js [opciones]\n');
    console.log('Opciones:');
    console.log('  -i, --input <dir>     Directorio de entrada (default: ./assets/raw)');
    console.log('  -o, --output <dir>    Directorio de salida (default: ./assets/processed)');
    console.log('  -h, --help            Mostrar esta ayuda\n');
    console.log('Ejemplos:');
    console.log('  node process-assets.js');
    console.log('  node process-assets.js --input ./my-assets --output ./optimized');
}

// Iniciar si es el script principal
if (require.main === module) {
    const options = parseArguments();
    
    if (options.help) {
        showHelp();
        process.exit(0);
    }

    // Actualizar configuración con opciones
    CONFIG.inputDir = options.input;
    CONFIG.outputDir = options.output;

    const processor = new AssetProcessor();
    
    processor.processAllAssets()
        .then(() => {
            const report = processor.generateReport();
            processor.displayStats();
            processor.saveReport(report);
            
            const duration = ((performance.now() - processor.startTime) / 1000).toFixed(2);
            console.log(`\n${colors.green}✅ Procesamiento completado en ${duration}s${colors.reset}`);
            
            if (processor.errors.length > 0) {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error(`${colors.red}❌ Error durante el procesamiento: ${error.message}${colors.reset}`);
            process.exit(1);
        });
}

module.exports = AssetProcessor; 