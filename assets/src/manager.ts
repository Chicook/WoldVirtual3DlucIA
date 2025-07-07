/**
 * @fileoverview Gestor principal de assets del metaverso
 * @module assets/src/manager
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import { AssetType, AssetCategory, AssetInfo, AssetMetadata } from './types';
import { Logger } from './utils/logger';

/**
 * Gestor principal de assets
 */
export class AssetManager {
  private logger: Logger;
  private basePath: string;
  private tempPath: string;
  private processedPath: string;

  constructor() {
    this.logger = new Logger('AssetManager');
    this.basePath = path.join(process.cwd(), 'assets');
    this.tempPath = path.join(this.basePath, 'temp');
    this.processedPath = path.join(this.basePath, 'processed');
  }

  /**
   * Inicializa el gestor de assets
   */
  async initialize(): Promise<void> {
    this.logger.info('🎨 Inicializando gestor de assets...');

    try {
      // Crear directorios necesarios
      await this.createDirectories();
      
      // Verificar estructura de directorios
      await this.validateStructure();
      
      // Limpiar directorio temporal
      await this.cleanupTemp();

      this.logger.success('✅ Gestor de assets inicializado');
    } catch (error) {
      this.logger.error('❌ Error inicializando gestor de assets:', error);
      throw error;
    }
  }

  /**
   * Crea directorios necesarios
   */
  private async createDirectories(): Promise<void> {
    const directories = [
      this.tempPath,
      this.processedPath,
      path.join(this.basePath, 'models', 'characters'),
      path.join(this.basePath, 'models', 'buildings'),
      path.join(this.basePath, 'models', 'vehicles'),
      path.join(this.basePath, 'models', 'props'),
      path.join(this.basePath, 'textures', 'characters'),
      path.join(this.basePath, 'textures', 'buildings'),
      path.join(this.basePath, 'textures', 'environments'),
      path.join(this.basePath, 'audio', 'ambient'),
      path.join(this.basePath, 'audio', 'characters'),
      path.join(this.basePath, 'audio', 'ui'),
      path.join(this.basePath, 'audio', 'music'),
      path.join(this.basePath, 'animations', 'characters'),
      path.join(this.basePath, 'animations', 'objects'),
      path.join(this.basePath, 'visual', 'ui'),
      path.join(this.basePath, 'visual', 'particles'),
      path.join(this.basePath, 'icons', 'crypto'),
      path.join(this.basePath, 'icons', 'ui'),
      path.join(this.basePath, 'libraries', 'materials'),
      path.join(this.basePath, 'libraries', 'sounds'),
      path.join(this.basePath, 'libraries', 'animations')
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
    }

    this.logger.info(`📁 Directorios creados: ${directories.length}`);
  }

  /**
   * Valida la estructura de directorios
   */
  private async validateStructure(): Promise<void> {
    const requiredDirs = [
      'models',
      'textures', 
      'audio',
      'animations',
      'visual',
      'icons',
      'libraries'
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.basePath, dir);
      if (!await fs.pathExists(dirPath)) {
        throw new Error(`Directorio requerido no encontrado: ${dir}`);
      }
    }

    this.logger.success('✅ Estructura de directorios validada');
  }

  /**
   * Limpia directorio temporal
   */
  private async cleanupTemp(): Promise<void> {
    if (await fs.pathExists(this.tempPath)) {
      await fs.emptyDir(this.tempPath);
      this.logger.info('🧹 Directorio temporal limpiado');
    }
  }

  /**
   * Escanea assets en un directorio
   */
  async scanDirectory(directory: string, options: ScanOptions = {}): Promise<AssetInfo[]> {
    this.logger.info(`🔍 Escaneando directorio: ${directory}`);

    const assets: AssetInfo[] = [];
    const patterns = options.patterns || ['**/*'];
    const excludePatterns = options.exclude || ['**/node_modules/**', '**/.git/**'];

    for (const pattern of patterns) {
      const files = glob.sync(pattern, {
        cwd: directory,
        nodir: true,
        ignore: excludePatterns
      });

      for (const file of files) {
        const filePath = path.join(directory, file);
        const assetInfo = await this.analyzeFile(filePath);
        
        if (assetInfo) {
          assets.push(assetInfo);
        }
      }
    }

    this.logger.success(`✅ Escaneo completado: ${assets.length} assets encontrados`);
    return assets;
  }

  /**
   * Analiza un archivo para determinar su tipo y metadatos
   */
  async analyzeFile(filePath: string): Promise<AssetInfo | null> {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath, ext);

      // Determinar tipo de asset
      const assetType = this.determineAssetType(ext);
      if (!assetType) {
        return null; // No es un asset soportado
      }

      // Determinar categoría
      const category = this.determineCategory(filePath, assetType);

      // Generar ID único
      const id = this.generateAssetId(filePath);

      // Generar metadatos básicos
      const metadata: AssetMetadata = {
        id,
        name: fileName,
        type: assetType,
        category,
        size: stats.size,
        format: ext.substring(1),
        path: filePath,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
        tags: this.extractTags(filePath),
        properties: await this.extractProperties(filePath, assetType)
      };

      const assetInfo: AssetInfo = {
        id,
        name: fileName,
        type: assetType,
        category,
        url: filePath, // URL local por defecto
        size: stats.size,
        metadata,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime
      };

      return assetInfo;

    } catch (error) {
      this.logger.error(`❌ Error analizando archivo '${filePath}':`, error);
      return null;
    }
  }

  /**
   * Determina el tipo de asset basado en la extensión
   */
  private determineAssetType(extension: string): AssetType | null {
    const typeMap: Record<string, AssetType> = {
      // Modelos 3D
      '.glb': AssetType.MODEL_3D,
      '.gltf': AssetType.MODEL_3D,
      '.fbx': AssetType.MODEL_3D,
      '.obj': AssetType.MODEL_3D,
      '.dae': AssetType.MODEL_3D,
      '.ply': AssetType.MODEL_3D,
      
      // Texturas
      '.png': AssetType.TEXTURE,
      '.jpg': AssetType.TEXTURE,
      '.jpeg': AssetType.TEXTURE,
      '.webp': AssetType.TEXTURE,
      '.ktx2': AssetType.TEXTURE,
      '.basis': AssetType.TEXTURE,
      '.tga': AssetType.TEXTURE,
      '.tiff': AssetType.TEXTURE,
      
      // Audio
      '.mp3': AssetType.AUDIO,
      '.wav': AssetType.AUDIO,
      '.ogg': AssetType.AUDIO,
      '.aac': AssetType.AUDIO,
      '.flac': AssetType.AUDIO,
      '.opus': AssetType.AUDIO,
      
      // Imágenes
      '.svg': AssetType.IMAGE,
      '.ico': AssetType.IMAGE,
      
      // Animaciones
      '.bvh': AssetType.ANIMATION,
      '.fbx': AssetType.ANIMATION,
      
      // Video
      '.mp4': AssetType.VIDEO,
      '.webm': AssetType.VIDEO,
      '.avi': AssetType.VIDEO,
      '.mov': AssetType.VIDEO
    };

    return typeMap[extension] || null;
  }

  /**
   * Determina la categoría del asset
   */
  private determineCategory(filePath: string, type: AssetType): AssetCategory {
    const pathParts = filePath.toLowerCase().split(path.sep);
    
    // Buscar palabras clave en la ruta
    if (pathParts.includes('character') || pathParts.includes('avatar')) {
      return AssetCategory.CHARACTER;
    }
    if (pathParts.includes('building') || pathParts.includes('structure')) {
      return AssetCategory.BUILDING;
    }
    if (pathParts.includes('vehicle') || pathParts.includes('car')) {
      return AssetCategory.VEHICLE;
    }
    if (pathParts.includes('prop') || pathParts.includes('object')) {
      return AssetCategory.PROP;
    }
    if (pathParts.includes('environment') || pathParts.includes('terrain')) {
      return AssetCategory.ENVIRONMENT;
    }
    if (pathParts.includes('ui') || pathParts.includes('interface')) {
      return AssetCategory.UI;
    }
    if (pathParts.includes('audio') || pathParts.includes('sound')) {
      return AssetCategory.AUDIO;
    }
    if (pathParts.includes('effect') || pathParts.includes('particle')) {
      return AssetCategory.EFFECT;
    }

    // Categoría por defecto basada en el tipo
    switch (type) {
      case AssetType.AUDIO:
        return AssetCategory.AUDIO;
      case AssetType.IMAGE:
        return AssetCategory.UI;
      default:
        return AssetCategory.PROP;
    }
  }

  /**
   * Genera ID único para el asset
   */
  private generateAssetId(filePath: string): string {
    const crypto = require('crypto');
    const content = filePath + Date.now().toString();
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  /**
   * Extrae tags del nombre del archivo y ruta
   */
  private extractTags(filePath: string): string[] {
    const tags: string[] = [];
    const fileName = path.basename(filePath, path.extname(filePath));
    const pathParts = filePath.toLowerCase().split(path.sep);

    // Extraer tags del nombre del archivo
    const nameTags = fileName.split(/[-_\s]+/);
    tags.push(...nameTags.filter(tag => tag.length > 2));

    // Extraer tags de la ruta
    const pathTags = pathParts.filter(part => 
      part.length > 2 && 
      !['assets', 'models', 'textures', 'audio', 'animations', 'visual', 'icons', 'libraries'].includes(part)
    );
    tags.push(...pathTags);

    // Eliminar duplicados y normalizar
    return [...new Set(tags.map(tag => tag.toLowerCase()))];
  }

  /**
   * Extrae propiedades específicas del asset
   */
  private async extractProperties(filePath: string, type: AssetType): Promise<Record<string, any>> {
    const properties: Record<string, any> = {};

    try {
      switch (type) {
        case AssetType.MODEL_3D:
          properties.model = await this.extractModelProperties(filePath);
          break;
        case AssetType.TEXTURE:
          properties.texture = await this.extractTextureProperties(filePath);
          break;
        case AssetType.AUDIO:
          properties.audio = await this.extractAudioProperties(filePath);
          break;
        case AssetType.IMAGE:
          properties.image = await this.extractImageProperties(filePath);
          break;
      }
    } catch (error) {
      this.logger.warn(`⚠️ Error extrayendo propiedades de '${filePath}':`, error);
    }

    return properties;
  }

  /**
   * Extrae propiedades de modelos 3D
   */
  private async extractModelProperties(filePath: string): Promise<any> {
    // Implementar extracción de propiedades de modelos 3D
    // Usar bibliotecas como three.js o gltf-pipeline
    return {
      format: path.extname(filePath).substring(1),
      // Otras propiedades específicas de modelos 3D
    };
  }

  /**
   * Extrae propiedades de texturas
   */
  private async extractTextureProperties(filePath: string): Promise<any> {
    // Implementar extracción de propiedades de texturas
    // Usar bibliotecas como sharp
    return {
      format: path.extname(filePath).substring(1),
      // Otras propiedades específicas de texturas
    };
  }

  /**
   * Extrae propiedades de audio
   */
  private async extractAudioProperties(filePath: string): Promise<any> {
    // Implementar extracción de propiedades de audio
    // Usar bibliotecas como fluent-ffmpeg
    return {
      format: path.extname(filePath).substring(1),
      // Otras propiedades específicas de audio
    };
  }

  /**
   * Extrae propiedades de imágenes
   */
  private async extractImageProperties(filePath: string): Promise<any> {
    // Implementar extracción de propiedades de imágenes
    // Usar bibliotecas como sharp
    return {
      format: path.extname(filePath).substring(1),
      // Otras propiedades específicas de imágenes
    };
  }

  /**
   * Mueve asset a directorio procesado
   */
  async moveToProcessed(assetId: string, processedPath: string): Promise<void> {
    const asset = await this.getAssetById(assetId);
    if (!asset) {
      throw new Error(`Asset no encontrado: ${assetId}`);
    }

    const newPath = path.join(this.processedPath, path.basename(processedPath));
    await fs.move(processedPath, newPath);
    
    // Actualizar metadatos
    asset.metadata.path = newPath;
    asset.url = newPath;
    asset.updatedAt = new Date();

    this.logger.info(`📁 Asset movido a procesado: ${assetId}`);
  }

  /**
   * Obtiene asset por ID
   */
  async getAssetById(assetId: string): Promise<AssetInfo | null> {
    // Implementar búsqueda en catálogo
    // Por ahora retorna null
    return null;
  }

  /**
   * Limpia assets temporales
   */
  async cleanup(): Promise<void> {
    this.logger.info('🧹 Limpiando assets temporales...');
    await this.cleanupTemp();
    this.logger.success('✅ Limpieza completada');
  }
}

// Tipos de datos
export interface ScanOptions {
  patterns?: string[];
  exclude?: string[];
  recursive?: boolean;
  maxDepth?: number;
}

// Exportaciones
export { AssetManager }; 