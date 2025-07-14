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