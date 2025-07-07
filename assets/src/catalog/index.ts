/**
 * @fileoverview Módulo de catálogo de assets del metaverso
 * @module assets/src/catalog
 */

import { Logger } from '../utils/logger';
import { AssetInfo, AssetSearchCriteria, AssetSystemStats } from '../types';

/**
 * Catálogo de assets
 */
export class AssetCatalog {
  private logger: Logger;
  private database: Map<string, AssetInfo>;
  private indexes: {
    type: Map<string, string[]>;
    category: Map<string, string[]>;
    tags: Map<string, string[]>;
    size: Map<number, string[]>;
    date: Map<string, string[]>;
  };

  constructor() {
    this.logger = new Logger('AssetCatalog');
    this.database = new Map();
    this.indexes = {
      type: new Map(),
      category: new Map(),
      tags: new Map(),
      size: new Map(),
      date: new Map()
    };
  }

  /**
   * Inicializa el catálogo
   */
  async initialize(): Promise<void> {
    this.logger.info('📚 Inicializando catálogo de assets...');
    
    try {
      // Cargar datos existentes si los hay
      await this.loadFromStorage();
      
      // Reconstruir índices
      await this.rebuildIndexes();
      
      this.logger.success('✅ Catálogo inicializado');
    } catch (error) {
      this.logger.error('❌ Error inicializando catálogo:', error);
      throw error;
    }
  }

  /**
   * Registra un asset en el catálogo
   */
  async register(assetInfo: AssetInfo): Promise<void> {
    this.logger.catalog('register', assetInfo.id);

    try {
      // Verificar que no exista
      if (this.database.has(assetInfo.id)) {
        throw new Error(`Asset ya registrado: ${assetInfo.id}`);
      }

      // Agregar al catálogo
      this.database.set(assetInfo.id, assetInfo);

      // Actualizar índices
      this.updateIndexes(assetInfo);

      // Persistir cambios
      await this.saveToStorage();

      this.logger.success(`✅ Asset registrado: ${assetInfo.name}`);
    } catch (error) {
      this.logger.error('Error registrando asset:', error);
      throw error;
    }
  }

  /**
   * Obtiene un asset por ID
   */
  async getAsset(assetId: string): Promise<AssetInfo | null> {
    this.logger.catalog('get', assetId);
    
    const asset = this.database.get(assetId);
    if (!asset) {
      this.logger.warn(`Asset no encontrado: ${assetId}`);
      return null;
    }

    return asset;
  }

  /**
   * Busca assets por criterios
   */
  async search(criteria: AssetSearchCriteria): Promise<AssetInfo[]> {
    this.logger.catalog('search', '', criteria);

    try {
      let results = Array.from(this.database.values());

      // Filtrar por tipo
      if (criteria.type) {
        results = results.filter(asset => asset.type === criteria.type);
      }

      // Filtrar por categoría
      if (criteria.category) {
        results = results.filter(asset => asset.category === criteria.category);
      }

      // Filtrar por tags
      if (criteria.tags && criteria.tags.length > 0) {
        results = results.filter(asset => 
          criteria.tags!.some(tag => asset.metadata.tags.includes(tag))
        );
      }

      // Filtrar por tamaño
      if (criteria.size) {
        if (criteria.size.min !== undefined) {
          results = results.filter(asset => asset.size >= criteria.size!.min!);
        }
        if (criteria.size.max !== undefined) {
          results = results.filter(asset => asset.size <= criteria.size!.max!);
        }
      }

      // Filtrar por fecha
      if (criteria.date) {
        if (criteria.date.from) {
          results = results.filter(asset => asset.createdAt >= criteria.date!.from!);
        }
        if (criteria.date.to) {
          results = results.filter(asset => asset.createdAt <= criteria.date!.to!);
        }
      }

      // Ordenar
      if (criteria.sortBy) {
        results.sort((a, b) => {
          let aValue: any, bValue: any;

          switch (criteria.sortBy) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'size':
              aValue = a.size;
              bValue = b.size;
              break;
            case 'date':
              aValue = a.createdAt.getTime();
              bValue = b.createdAt.getTime();
              break;
            case 'type':
              aValue = a.type;
              bValue = b.type;
              break;
            default:
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
          }

          if (criteria.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }

      // Aplicar límites
      if (criteria.offset) {
        results = results.slice(criteria.offset);
      }
      if (criteria.limit) {
        results = results.slice(0, criteria.limit);
      }

      this.logger.info(`🔍 Búsqueda completada: ${results.length} resultados`);
      return results;

    } catch (error) {
      this.logger.error('Error buscando assets:', error);
      return [];
    }
  }

  /**
   * Actualiza un asset
   */
  async updateAsset(assetId: string, updates: Partial<AssetInfo>): Promise<void> {
    this.logger.catalog('update', assetId);

    try {
      const asset = this.database.get(assetId);
      if (!asset) {
        throw new Error(`Asset no encontrado: ${assetId}`);
      }

      // Remover índices antiguos
      this.removeFromIndexes(asset);

      // Actualizar asset
      const updatedAsset = { ...asset, ...updates, updatedAt: new Date() };
      this.database.set(assetId, updatedAsset);

      // Actualizar índices
      this.updateIndexes(updatedAsset);

      // Persistir cambios
      await this.saveToStorage();

      this.logger.success(`✅ Asset actualizado: ${assetId}`);
    } catch (error) {
      this.logger.error('Error actualizando asset:', error);
      throw error;
    }
  }

  /**
   * Elimina un asset del catálogo
   */
  async removeAsset(assetId: string): Promise<void> {
    this.logger.catalog('remove', assetId);

    try {
      const asset = this.database.get(assetId);
      if (!asset) {
        throw new Error(`Asset no encontrado: ${assetId}`);
      }

      // Remover índices
      this.removeFromIndexes(asset);

      // Eliminar del catálogo
      this.database.delete(assetId);

      // Persistir cambios
      await this.saveToStorage();

      this.logger.success(`✅ Asset eliminado: ${assetId}`);
    } catch (error) {
      this.logger.error('Error eliminando asset:', error);
      throw error;
    }
  }

  /**
   * Actualiza índices para un asset
   */
  private updateIndexes(asset: AssetInfo): void {
    // Índice por tipo
    if (!this.indexes.type.has(asset.type)) {
      this.indexes.type.set(asset.type, []);
    }
    this.indexes.type.get(asset.type)!.push(asset.id);

    // Índice por categoría
    if (!this.indexes.category.has(asset.category)) {
      this.indexes.category.set(asset.category, []);
    }
    this.indexes.category.get(asset.category)!.push(asset.id);

    // Índice por tags
    for (const tag of asset.metadata.tags) {
      if (!this.indexes.tags.has(tag)) {
        this.indexes.tags.set(tag, []);
      }
      this.indexes.tags.get(tag)!.push(asset.id);
    }

    // Índice por tamaño (agrupado en rangos)
    const sizeRange = Math.floor(asset.size / (1024 * 1024)); // MB
    if (!this.indexes.size.has(sizeRange)) {
      this.indexes.size.set(sizeRange, []);
    }
    this.indexes.size.get(sizeRange)!.push(asset.id);

    // Índice por fecha (agrupado por día)
    const dateKey = asset.createdAt.toISOString().split('T')[0];
    if (!this.indexes.date.has(dateKey)) {
      this.indexes.date.set(dateKey, []);
    }
    this.indexes.date.get(dateKey)!.push(asset.id);
  }

  /**
   * Remueve índices para un asset
   */
  private removeFromIndexes(asset: AssetInfo): void {
    // Remover de índice por tipo
    const typeIndex = this.indexes.type.get(asset.type);
    if (typeIndex) {
      const index = typeIndex.indexOf(asset.id);
      if (index > -1) {
        typeIndex.splice(index, 1);
      }
    }

    // Remover de índice por categoría
    const categoryIndex = this.indexes.category.get(asset.category);
    if (categoryIndex) {
      const index = categoryIndex.indexOf(asset.id);
      if (index > -1) {
        categoryIndex.splice(index, 1);
      }
    }

    // Remover de índice por tags
    for (const tag of asset.metadata.tags) {
      const tagIndex = this.indexes.tags.get(tag);
      if (tagIndex) {
        const index = tagIndex.indexOf(asset.id);
        if (index > -1) {
          tagIndex.splice(index, 1);
        }
      }
    }

    // Remover de índice por tamaño
    const sizeRange = Math.floor(asset.size / (1024 * 1024));
    const sizeIndex = this.indexes.size.get(sizeRange);
    if (sizeIndex) {
      const index = sizeIndex.indexOf(asset.id);
      if (index > -1) {
        sizeIndex.splice(index, 1);
      }
    }

    // Remover de índice por fecha
    const dateKey = asset.createdAt.toISOString().split('T')[0];
    const dateIndex = this.indexes.date.get(dateKey);
    if (dateIndex) {
      const index = dateIndex.indexOf(asset.id);
      if (index > -1) {
        dateIndex.splice(index, 1);
      }
    }
  }

  /**
   * Reconstruye todos los índices
   */
  private async rebuildIndexes(): Promise<void> {
    this.logger.info('🔧 Reconstruyendo índices...');

    // Limpiar índices existentes
    this.indexes.type.clear();
    this.indexes.category.clear();
    this.indexes.tags.clear();
    this.indexes.size.clear();
    this.indexes.date.clear();

    // Reconstruir índices
    for (const asset of this.database.values()) {
      this.updateIndexes(asset);
    }

    this.logger.success('✅ Índices reconstruidos');
  }

  /**
   * Carga datos desde almacenamiento
   */
  private async loadFromStorage(): Promise<void> {
    const fs = require('fs-extra');
    const path = require('path');

    const catalogPath = path.join(process.cwd(), 'data', 'catalog.json');

    try {
      if (await fs.pathExists(catalogPath)) {
        const data = await fs.readJson(catalogPath);
        
        // Convertir fechas de vuelta a objetos Date
        for (const [id, asset] of Object.entries(data.assets)) {
          const assetInfo = asset as any;
          assetInfo.createdAt = new Date(assetInfo.createdAt);
          assetInfo.updatedAt = new Date(assetInfo.updatedAt);
          this.database.set(id, assetInfo);
        }

        this.logger.info(`📚 Catálogo cargado: ${this.database.size} assets`);
      }
    } catch (error) {
      this.logger.warn('No se pudo cargar catálogo existente:', error.message);
    }
  }

  /**
   * Guarda datos a almacenamiento
   */
  private async saveToStorage(): Promise<void> {
    const fs = require('fs-extra');
    const path = require('path');

    const dataDir = path.join(process.cwd(), 'data');
    const catalogPath = path.join(dataDir, 'catalog.json');

    try {
      await fs.ensureDir(dataDir);

      const data = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        assets: Object.fromEntries(this.database)
      };

      await fs.writeJson(catalogPath, data, { spaces: 2 });
      this.logger.debug(`💾 Catálogo guardado: ${this.database.size} assets`);
    } catch (error) {
      this.logger.error('Error guardando catálogo:', error);
    }
  }

  /**
   * Obtiene estadísticas del catálogo
   */
  async getStats(): Promise<{
    total: number;
    totalSize: number;
    categories: Record<string, number>;
    types: Record<string, number>;
    recentUploads: AssetInfo[];
  }> {
    const total = this.database.size;
    const totalSize = Array.from(this.database.values()).reduce((sum, asset) => sum + asset.size, 0);

    // Contar por categorías
    const categories: Record<string, number> = {};
    for (const asset of this.database.values()) {
      categories[asset.category] = (categories[asset.category] || 0) + 1;
    }

    // Contar por tipos
    const types: Record<string, number> = {};
    for (const asset of this.database.values()) {
      types[asset.type] = (types[asset.type] || 0) + 1;
    }

    // Assets recientes
    const recentUploads = Array.from(this.database.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      total,
      totalSize,
      categories,
      types,
      recentUploads
    };
  }

  /**
   * Exporta catálogo
   */
  async export(format: 'json' | 'csv' = 'json'): Promise<string> {
    this.logger.info(`📤 Exportando catálogo en formato ${format}`);

    try {
      if (format === 'json') {
        const data = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          assets: Array.from(this.database.values())
        };
        return JSON.stringify(data, null, 2);
      } else {
        // CSV format
        const headers = ['id', 'name', 'type', 'category', 'size', 'url', 'createdAt', 'tags'];
        const rows = [headers.join(',')];

        for (const asset of this.database.values()) {
          const row = [
            asset.id,
            `"${asset.name}"`,
            asset.type,
            asset.category,
            asset.size,
            `"${asset.url}"`,
            asset.createdAt.toISOString(),
            `"${asset.metadata.tags.join(';')}"`
          ];
          rows.push(row.join(','));
        }

        return rows.join('\n');
      }
    } catch (error) {
      this.logger.error('Error exportando catálogo:', error);
      throw error;
    }
  }

  /**
   * Importa catálogo
   */
  async import(data: string, format: 'json' | 'csv' = 'json'): Promise<void> {
    this.logger.info(`📥 Importando catálogo en formato ${format}`);

    try {
      if (format === 'json') {
        const parsed = JSON.parse(data);
        const assets = Array.isArray(parsed.assets) ? parsed.assets : Object.values(parsed.assets);

        for (const asset of assets) {
          // Convertir fechas
          asset.createdAt = new Date(asset.createdAt);
          asset.updatedAt = new Date(asset.updatedAt);
          
          this.database.set(asset.id, asset);
        }
      } else {
        // CSV format
        const lines = data.split('\n');
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const asset: any = {};

          for (let j = 0; j < headers.length; j++) {
            const value = values[j]?.replace(/^"|"$/g, '') || '';
            
            switch (headers[j]) {
              case 'id':
                asset.id = value;
                break;
              case 'name':
                asset.name = value;
                break;
              case 'type':
                asset.type = value;
                break;
              case 'category':
                asset.category = value;
                break;
              case 'size':
                asset.size = parseInt(value) || 0;
                break;
              case 'url':
                asset.url = value;
                break;
              case 'createdAt':
                asset.createdAt = new Date(value);
                break;
              case 'tags':
                asset.metadata = { tags: value.split(';').filter(t => t) };
                break;
            }
          }

          if (asset.id) {
            asset.updatedAt = new Date();
            this.database.set(asset.id, asset);
          }
        }
      }

      // Reconstruir índices
      await this.rebuildIndexes();

      // Guardar cambios
      await this.saveToStorage();

      this.logger.success(`✅ Catálogo importado: ${this.database.size} assets`);
    } catch (error) {
      this.logger.error('Error importando catálogo:', error);
      throw error;
    }
  }

  /**
   * Limpia catálogo
   */
  async clear(): Promise<void> {
    this.logger.warn('🗑️ Limpiando catálogo...');

    this.database.clear();
    await this.rebuildIndexes();
    await this.saveToStorage();

    this.logger.success('✅ Catálogo limpiado');
  }
} 