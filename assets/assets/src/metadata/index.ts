/**
 * @fileoverview Módulo de metadatos de assets del metaverso
 * @module assets/src/metadata
 */

import { Logger } from '../utils/logger';
import { AssetMetadata } from '../types';

/**
 * Gestor de metadatos de assets
 */
export class AssetMetadata {
  private logger: Logger;
  private database: Map<string, AssetMetadata>;
  private schemas: Map<string, any>;

  constructor() {
    this.logger = new Logger('AssetMetadata');
    this.database = new Map();
    this.schemas = new Map();
  }

  /**
   * Inicializa el gestor de metadatos
   */
  async initialize(): Promise<void> {
    this.logger.info('📋 Inicializando gestor de metadatos...');

    try {
      // Cargar esquemas de metadatos
      await this.loadSchemas();
      
      // Cargar metadatos existentes
      await this.loadFromStorage();
      
      this.logger.success('✅ Gestor de metadatos inicializado');
    } catch (error) {
      this.logger.error('❌ Error inicializando gestor de metadatos:', error);
      throw error;
    }
  }

  /**
   * Genera metadatos para un asset
   */
  async generate(filePath: string, context: {
    validation?: any;
    optimization?: any;
    compression?: any;
    upload?: any;
  } = {}): Promise<AssetMetadata> {
    this.logger.metadata('generate', '', { filePath });

    try {
      const fs = require('fs-extra');
      const path = require('path');
      const crypto = require('crypto');

      // Información básica del archivo
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath, path.extname(filePath));
      const format = path.extname(filePath).substring(1);
      const fileBuffer = await fs.readFile(filePath);

      // Generar ID único
      const id = this.generateAssetId(filePath);

      // Calcular hash
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Extraer metadatos específicos del tipo
      const typeSpecificMetadata = await this.extractTypeSpecificMetadata(filePath, format);

      // Metadatos base
      const metadata: AssetMetadata = {
        id,
        name: fileName,
        type: this.determineAssetType(format),
        category: this.determineCategory(filePath),
        size: stats.size,
        format,
        path: filePath,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
        tags: this.extractTags(filePath),
        properties: {
          ...typeSpecificMetadata,
          hash,
          checksum: hash.substring(0, 16),
          fileSize: stats.size,
          lastModified: stats.mtime.toISOString(),
          permissions: stats.mode.toString(8)
        }
      };

      // Agregar contexto si está disponible
      if (context.validation) {
        metadata.properties.validation = context.validation;
      }
      if (context.optimization) {
        metadata.properties.optimization = context.optimization;
      }
      if (context.compression) {
        metadata.properties.compression = context.compression;
      }
      if (context.upload) {
        metadata.properties.upload = context.upload;
        metadata.url = context.upload.url;
      }

      // Validar metadatos contra esquema
      const validation = this.validateMetadata(metadata);
      if (!validation.valid) {
        this.logger.warn('Metadatos no válidos:', validation.errors);
      }

      this.logger.success(`✅ Metadatos generados para: ${fileName}`);
      return metadata;

    } catch (error) {
      this.logger.error('Error generando metadatos:', error);
      throw error;
    }
  }

  /**
   * Actualiza metadatos de un asset
   */
  async update(assetId: string, updates: Partial<AssetMetadata>): Promise<void> {
    this.logger.metadata('update', assetId);

    try {
      const metadata = this.database.get(assetId);
      if (!metadata) {
        throw new Error(`Metadatos no encontrados: ${assetId}`);
      }

      // Actualizar metadatos
      const updatedMetadata = {
        ...metadata,
        ...updates,
        updatedAt: new Date()
      };

      // Validar metadatos actualizados
      const validation = this.validateMetadata(updatedMetadata);
      if (!validation.valid) {
        throw new Error(`Metadatos inválidos: ${validation.errors.join(', ')}`);
      }

      // Guardar cambios
      this.database.set(assetId, updatedMetadata);
      await this.saveToStorage();

      this.logger.success(`✅ Metadatos actualizados: ${assetId}`);
    } catch (error) {
      this.logger.error('Error actualizando metadatos:', error);
      throw error;
    }
  }

  /**
   * Obtiene metadatos de un asset
   */
  async get(assetId: string): Promise<AssetMetadata | null> {
    this.logger.metadata('get', assetId);

    const metadata = this.database.get(assetId);
    if (!metadata) {
      this.logger.warn(`Metadatos no encontrados: ${assetId}`);
      return null;
    }

    return metadata;
  }

  /**
   * Elimina metadatos de un asset
   */
  async delete(assetId: string): Promise<void> {
    this.logger.metadata('delete', assetId);

    try {
      if (!this.database.has(assetId)) {
        throw new Error(`Metadatos no encontrados: ${assetId}`);
      }

      this.database.delete(assetId);
      await this.saveToStorage();

      this.logger.success(`✅ Metadatos eliminados: ${assetId}`);
    } catch (error) {
      this.logger.error('Error eliminando metadatos:', error);
      throw error;
    }
  }

  /**
   * Busca metadatos por criterios
   */
  async search(criteria: {
    type?: string;
    category?: string;
    tags?: string[];
    size?: { min?: number; max?: number };
    date?: { from?: Date; to?: Date };
  }): Promise<AssetMetadata[]> {
    this.logger.metadata('search', '', criteria);

    let results = Array.from(this.database.values());

    // Aplicar filtros
    if (criteria.type) {
      results = results.filter(m => m.type === criteria.type);
    }

    if (criteria.category) {
      results = results.filter(m => m.category === criteria.category);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(m => 
        criteria.tags!.some(tag => m.tags.includes(tag))
      );
    }

    if (criteria.size) {
      if (criteria.size.min !== undefined) {
        results = results.filter(m => m.size >= criteria.size!.min!);
      }
      if (criteria.size.max !== undefined) {
        results = results.filter(m => m.size <= criteria.size!.max!);
      }
    }

    if (criteria.date) {
      if (criteria.date.from) {
        results = results.filter(m => m.createdAt >= criteria.date!.from!);
      }
      if (criteria.date.to) {
        results = results.filter(m => m.createdAt <= criteria.date!.to!);
      }
    }

    this.logger.info(`🔍 Búsqueda de metadatos completada: ${results.length} resultados`);
    return results;
  }

  /**
   * Genera ID único para asset
   */
  private generateAssetId(filePath: string): string {
    const crypto = require('crypto');
    const content = filePath + Date.now().toString();
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  /**
   * Determina el tipo de asset
   */
  private determineAssetType(format: string): string {
    const typeMap: Record<string, string> = {
      'glb': '3d_model',
      'gltf': '3d_model',
      'fbx': '3d_model',
      'obj': '3d_model',
      'png': 'texture',
      'jpg': 'texture',
      'jpeg': 'texture',
      'webp': 'texture',
      'mp3': 'audio',
      'wav': 'audio',
      'ogg': 'audio',
      'svg': 'image'
    };

    return typeMap[format.toLowerCase()] || 'unknown';
  }

  /**
   * Determina la categoría del asset
   */
  private determineCategory(filePath: string): string {
    const pathParts = filePath.toLowerCase().split('/');
    
    if (pathParts.includes('character') || pathParts.includes('avatar')) {
      return 'character';
    }
    if (pathParts.includes('building') || pathParts.includes('structure')) {
      return 'building';
    }
    if (pathParts.includes('vehicle') || pathParts.includes('car')) {
      return 'vehicle';
    }
    if (pathParts.includes('prop') || pathParts.includes('object')) {
      return 'prop';
    }
    if (pathParts.includes('environment') || pathParts.includes('terrain')) {
      return 'environment';
    }
    if (pathParts.includes('ui') || pathParts.includes('interface')) {
      return 'ui';
    }
    if (pathParts.includes('audio') || pathParts.includes('sound')) {
      return 'audio';
    }
    if (pathParts.includes('effect') || pathParts.includes('particle')) {
      return 'effect';
    }

    return 'prop';
  }

  /**
   * Extrae tags del nombre del archivo y ruta
   */
  private extractTags(filePath: string): string[] {
    const tags: string[] = [];
    const path = require('path');
    
    const fileName = path.basename(filePath, path.extname(filePath));
    const pathParts = filePath.toLowerCase().split('/');

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
   * Extrae metadatos específicos del tipo
   */
  private async extractTypeSpecificMetadata(filePath: string, format: string): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {};

    try {
      switch (format.toLowerCase()) {
        case 'glb':
        case 'gltf':
          metadata.model = await this.extractModelMetadata(filePath);
          break;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'webp':
          metadata.texture = await this.extractTextureMetadata(filePath);
          break;
        case 'mp3':
        case 'wav':
        case 'ogg':
          metadata.audio = await this.extractAudioMetadata(filePath);
          break;
        case 'svg':
          metadata.image = await this.extractImageMetadata(filePath);
          break;
      }
    } catch (error) {
      this.logger.warn(`Error extrayendo metadatos específicos de ${format}:`, error);
    }

    return metadata;
  }

  /**
   * Extrae metadatos de modelos 3D
   */
  private async extractModelMetadata(filePath: string): Promise<any> {
    // Implementar extracción de metadatos de modelos 3D
    // Usar bibliotecas como three.js o gltf-pipeline
    return {
      format: 'gltf',
      version: '2.0',
      // Otras propiedades específicas de modelos 3D
    };
  }

  /**
   * Extrae metadatos de texturas
   */
  private async extractTextureMetadata(filePath: string): Promise<any> {
    // Implementar extracción de metadatos de texturas
    // Usar bibliotecas como sharp
    return {
      format: 'image',
      // Otras propiedades específicas de texturas
    };
  }

  /**
   * Extrae metadatos de audio
   */
  private async extractAudioMetadata(filePath: string): Promise<any> {
    // Implementar extracción de metadatos de audio
    // Usar bibliotecas como fluent-ffmpeg
    return {
      format: 'audio',
      // Otras propiedades específicas de audio
    };
  }

  /**
   * Extrae metadatos de imágenes
   */
  private async extractImageMetadata(filePath: string): Promise<any> {
    // Implementar extracción de metadatos de imágenes
    // Usar bibliotecas como sharp
    return {
      format: 'image',
      // Otras propiedades específicas de imágenes
    };
  }

  /**
   * Valida metadatos contra esquema
   */
  private validateMetadata(metadata: AssetMetadata): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validaciones básicas
    if (!metadata.id || metadata.id.length < 8) {
      errors.push('ID inválido');
    }

    if (!metadata.name || metadata.name.length < 1) {
      errors.push('Nombre requerido');
    }

    if (!metadata.type) {
      errors.push('Tipo requerido');
    }

    if (!metadata.category) {
      errors.push('Categoría requerida');
    }

    if (metadata.size <= 0) {
      errors.push('Tamaño inválido');
    }

    // Validar esquema específico si existe
    const schema = this.schemas.get(metadata.type);
    if (schema) {
      // Implementar validación contra esquema JSON
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Carga esquemas de metadatos
   */
  private async loadSchemas(): Promise<void> {
    const fs = require('fs-extra');
    const path = require('path');

    const schemasPath = path.join(process.cwd(), 'assets', 'schemas');

    try {
      if (await fs.pathExists(schemasPath)) {
        const schemaFiles = await fs.readdir(schemasPath);
        
        for (const file of schemaFiles) {
          if (file.endsWith('.json')) {
            const schema = await fs.readJson(path.join(schemasPath, file));
            const type = path.basename(file, '.json');
            this.schemas.set(type, schema);
          }
        }

        this.logger.info(`📋 Esquemas cargados: ${this.schemas.size}`);
      }
    } catch (error) {
      this.logger.warn('No se pudieron cargar esquemas:', error.message);
    }
  }

  /**
   * Carga metadatos desde almacenamiento
   */
  private async loadFromStorage(): Promise<void> {
    const fs = require('fs-extra');
    const path = require('path');

    const metadataPath = path.join(process.cwd(), 'data', 'metadata.json');

    try {
      if (await fs.pathExists(metadataPath)) {
        const data = await fs.readJson(metadataPath);
        
        // Convertir fechas de vuelta a objetos Date
        for (const [id, metadata] of Object.entries(data)) {
          const meta = metadata as any;
          meta.createdAt = new Date(meta.createdAt);
          meta.updatedAt = new Date(meta.updatedAt);
          this.database.set(id, meta);
        }

        this.logger.info(`📋 Metadatos cargados: ${this.database.size} registros`);
      }
    } catch (error) {
      this.logger.warn('No se pudieron cargar metadatos existentes:', error.message);
    }
  }

  /**
   * Guarda metadatos a almacenamiento
   */
  private async saveToStorage(): Promise<void> {
    const fs = require('fs-extra');
    const path = require('path');

    const dataDir = path.join(process.cwd(), 'data');
    const metadataPath = path.join(dataDir, 'metadata.json');

    try {
      await fs.ensureDir(dataDir);

      const data = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        metadata: Object.fromEntries(this.database)
      };

      await fs.writeJson(metadataPath, data, { spaces: 2 });
      this.logger.debug(`💾 Metadatos guardados: ${this.database.size} registros`);
    } catch (error) {
      this.logger.error('Error guardando metadatos:', error);
    }
  }

  /**
   * Exporta metadatos
   */
  async export(format: 'json' | 'csv' = 'json'): Promise<string> {
    this.logger.info(`📤 Exportando metadatos en formato ${format}`);

    try {
      if (format === 'json') {
        const data = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          metadata: Array.from(this.database.values())
        };
        return JSON.stringify(data, null, 2);
      } else {
        // CSV format
        const headers = ['id', 'name', 'type', 'category', 'size', 'format', 'tags', 'createdAt'];
        const rows = [headers.join(',')];

        for (const metadata of this.database.values()) {
          const row = [
            metadata.id,
            `"${metadata.name}"`,
            metadata.type,
            metadata.category,
            metadata.size,
            metadata.format,
            `"${metadata.tags.join(';')}"`,
            metadata.createdAt.toISOString()
          ];
          rows.push(row.join(','));
        }

        return rows.join('\n');
      }
    } catch (error) {
      this.logger.error('Error exportando metadatos:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas
   */
  async getStats(): Promise<{
    total: number;
    types: Record<string, number>;
    categories: Record<string, number>;
    averageSize: number;
  }> {
    const total = this.database.size;
    const totalSize = Array.from(this.database.values()).reduce((sum, m) => sum + m.size, 0);
    const averageSize = total > 0 ? totalSize / total : 0;

    // Contar por tipos
    const types: Record<string, number> = {};
    for (const metadata of this.database.values()) {
      types[metadata.type] = (types[metadata.type] || 0) + 1;
    }

    // Contar por categorías
    const categories: Record<string, number> = {};
    for (const metadata of this.database.values()) {
      categories[metadata.category] = (categories[metadata.category] || 0) + 1;
    }

    return {
      total,
      types,
      categories,
      averageSize
    };
  }
} 