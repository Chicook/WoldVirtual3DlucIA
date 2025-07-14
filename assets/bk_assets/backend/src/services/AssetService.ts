/**
 * @fileoverview Servicio avanzado para assets con lógica de negocio
 * @module backend/src/services/AssetService
 */

import { AppDataSource } from '../database/connection';
import { Asset, AssetStatus, AssetType } from '../entities/Asset';
import { Repository, FindOptionsWhere, ILike, Between, In, IsNull, Not } from 'typeorm';
import { Logger } from '../utils/logger';

const logger = new Logger('AssetService');

export interface AssetFilters {
  type?: AssetType;
  status?: AssetStatus;
  ownerId?: string;
  isPublic?: boolean;
  allowDownload?: boolean;
  allowModification?: boolean;
  allowCommercialUse?: boolean;
  minFileSize?: number;
  maxFileSize?: number;
  minRating?: number;
  maxRating?: number;
  minDownloadCount?: number;
  minViewCount?: number;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  publishedAfter?: Date;
  publishedBefore?: Date;
  q?: string; // búsqueda en nombre y descripción
}

export interface AssetSort {
  field: keyof Asset;
  order: 'ASC' | 'DESC';
}

export interface AssetPagination {
  page: number;
  limit: number;
}

export interface AssetSearchResult {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class AssetService {
  private assetRepo: Repository<Asset>;

  constructor() {
    this.assetRepo = AppDataSource.getRepository(Asset);
  }

  /**
   * Búsqueda avanzada con filtros complejos
   */
  async searchAssets(
    filters: AssetFilters = {},
    sort: AssetSort = { field: 'createdAt', order: 'DESC' },
    pagination: AssetPagination = { page: 1, limit: 20 }
  ): Promise<AssetSearchResult> {
    try {
      const whereConditions: FindOptionsWhere<Asset> = {};
      const queryBuilder = this.assetRepo.createQueryBuilder('asset');

      // Aplicar filtros básicos
      if (filters.type) {
        whereConditions.type = filters.type;
      }
      if (filters.status) {
        whereConditions.status = filters.status;
      }
      if (filters.ownerId) {
        whereConditions.ownerId = filters.ownerId;
      }
      if (filters.isPublic !== undefined) {
        whereConditions.isPublic = filters.isPublic;
      }
      if (filters.allowDownload !== undefined) {
        whereConditions.allowDownload = filters.allowDownload;
      }
      if (filters.allowModification !== undefined) {
        whereConditions.allowModification = filters.allowModification;
      }
      if (filters.allowCommercialUse !== undefined) {
        whereConditions.allowCommercialUse = filters.allowCommercialUse;
      }

      // Aplicar filtros de rango
      if (filters.minFileSize || filters.maxFileSize) {
        queryBuilder.andWhere('asset.fileSize BETWEEN :minSize AND :maxSize', {
          minSize: filters.minFileSize || 0,
          maxSize: filters.maxFileSize || Number.MAX_SAFE_INTEGER
        });
      }

      if (filters.minRating || filters.maxRating) {
        queryBuilder.andWhere('asset.rating BETWEEN :minRating AND :maxRating', {
          minRating: filters.minRating || 0,
          maxRating: filters.maxRating || 5
        });
      }

      if (filters.minDownloadCount) {
        queryBuilder.andWhere('asset.downloadCount >= :minDownloads', {
          minDownloads: filters.minDownloadCount
        });
      }

      if (filters.minViewCount) {
        queryBuilder.andWhere('asset.viewCount >= :minViews', {
          minViews: filters.minViewCount
        });
      }

      // Filtros de fecha
      if (filters.createdAfter || filters.createdBefore) {
        queryBuilder.andWhere('asset.createdAt BETWEEN :createdAfter AND :createdBefore', {
          createdAfter: filters.createdAfter || new Date(0),
          createdBefore: filters.createdBefore || new Date()
        });
      }

      if (filters.publishedAfter || filters.publishedBefore) {
        queryBuilder.andWhere('asset.publishedAt BETWEEN :publishedAfter AND :publishedBefore', {
          publishedAfter: filters.publishedAfter || new Date(0),
          publishedBefore: filters.publishedBefore || new Date()
        });
      }

      // Búsqueda en texto
      if (filters.q) {
        queryBuilder.andWhere(
          '(asset.name ILIKE :search OR asset.description ILIKE :search)',
          { search: `%${filters.q}%` }
        );
      }

      // Filtros de tags (búsqueda en array JSONB)
      if (filters.tags && filters.tags.length > 0) {
        queryBuilder.andWhere('asset.tags @> :tags', { tags: filters.tags });
      }

      // Aplicar condiciones base
      queryBuilder.where(whereConditions);

      // Ordenamiento dinámico
      queryBuilder.orderBy(`asset.${sort.field}`, sort.order);

      // Paginación
      const skip = (pagination.page - 1) * pagination.limit;
      queryBuilder.skip(skip).take(pagination.limit);

      // Ejecutar consulta
      const [assets, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / pagination.limit);
      const hasNext = pagination.page < totalPages;
      const hasPrev = pagination.page > 1;

      return {
        assets,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
        hasNext,
        hasPrev
      };

    } catch (error) {
      logger.error('Error en búsqueda avanzada de assets:', error);
      throw error;
    }
  }

  /**
   * Obtener assets recomendados basados en popularidad y rating
   */
  async getRecommendedAssets(limit: number = 10): Promise<Asset[]> {
    try {
      return await this.assetRepo
        .createQueryBuilder('asset')
        .where('asset.status = :status', { status: AssetStatus.PUBLISHED })
        .andWhere('asset.isPublic = :isPublic', { isPublic: true })
        .orderBy('(asset.rating * asset.downloadCount * asset.viewCount)', 'DESC')
        .limit(limit)
        .getMany();
    } catch (error) {
      logger.error('Error obteniendo assets recomendados:', error);
      throw error;
    }
  }

  /**
   * Obtener assets trending (más descargados en los últimos días)
   */
  async getTrendingAssets(days: number = 7, limit: number = 10): Promise<Asset[]> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      return await this.assetRepo
        .createQueryBuilder('asset')
        .where('asset.status = :status', { status: AssetStatus.PUBLISHED })
        .andWhere('asset.isPublic = :isPublic', { isPublic: true })
        .andWhere('asset.updatedAt >= :dateThreshold', { dateThreshold })
        .orderBy('asset.downloadCount', 'DESC')
        .limit(limit)
        .getMany();
    } catch (error) {
      logger.error('Error obteniendo assets trending:', error);
      throw error;
    }
  }

  /**
   * Obtener assets similares basados en tags y tipo
   */
  async getSimilarAssets(assetId: string, limit: number = 5): Promise<Asset[]> {
    try {
      const asset = await this.assetRepo.findOneBy({ id: assetId });
      if (!asset) {
        throw new Error('Asset no encontrado');
      }

      const queryBuilder = this.assetRepo
        .createQueryBuilder('asset')
        .where('asset.id != :assetId', { assetId })
        .andWhere('asset.status = :status', { status: AssetStatus.PUBLISHED })
        .andWhere('asset.isPublic = :isPublic', { isPublic: true });

      // Buscar por tipo similar
      queryBuilder.andWhere('asset.type = :type', { type: asset.type });

      // Si tiene tags, buscar por tags similares
      if (asset.tags && asset.tags.length > 0) {
        queryBuilder.andWhere('asset.tags && :tags', { tags: asset.tags });
      }

      return await queryBuilder
        .orderBy('asset.rating', 'DESC')
        .limit(limit)
        .getMany();

    } catch (error) {
      logger.error('Error obteniendo assets similares:', error);
      throw error;
    }
  }

  /**
   * Incrementar contador de vistas
   */
  async incrementViewCount(assetId: string): Promise<void> {
    try {
      await this.assetRepo
        .createQueryBuilder()
        .update(Asset)
        .set({ viewCount: () => 'viewCount + 1' })
        .where('id = :id', { id: assetId })
        .execute();
    } catch (error) {
      logger.error('Error incrementando contador de vistas:', error);
      throw error;
    }
  }

  /**
   * Incrementar contador de descargas
   */
  async incrementDownloadCount(assetId: string): Promise<void> {
    try {
      await this.assetRepo
        .createQueryBuilder()
        .update(Asset)
        .set({ downloadCount: () => 'downloadCount + 1' })
        .where('id = :id', { id: assetId })
        .execute();
    } catch (error) {
      logger.error('Error incrementando contador de descargas:', error);
      throw error;
    }
  }

  /**
   * Calcular y actualizar rating promedio
   */
  async updateRating(assetId: string, newRating: number): Promise<void> {
    try {
      const asset = await this.assetRepo.findOneBy({ id: assetId });
      if (!asset) {
        throw new Error('Asset no encontrado');
      }

      asset.calculateAverageRating(newRating);
      await this.assetRepo.save(asset);
    } catch (error) {
      logger.error('Error actualizando rating:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas detalladas
   */
  async getDetailedStats(): Promise<any> {
    try {
      const [
        totalAssets,
        publishedAssets,
        draftAssets,
        archivedAssets,
        deletedAssets,
        publicAssets,
        downloadableAssets,
        commercialAssets
      ] = await Promise.all([
        this.assetRepo.count(),
        this.assetRepo.count({ where: { status: AssetStatus.PUBLISHED } }),
        this.assetRepo.count({ where: { status: AssetStatus.DRAFT } }),
        this.assetRepo.count({ where: { status: AssetStatus.ARCHIVED } }),
        this.assetRepo.count({ where: { status: AssetStatus.DELETED } }),
        this.assetRepo.count({ where: { isPublic: true } }),
        this.assetRepo.count({ where: { allowDownload: true } }),
        this.assetRepo.count({ where: { allowCommercialUse: true } })
      ]);

      // Estadísticas por tipo
      const byType = await this.assetRepo
        .createQueryBuilder('asset')
        .select('asset.type, COUNT(*) as count')
        .groupBy('asset.type')
        .getRawMany();

      // Top assets por descargas
      const topDownloads = await this.assetRepo
        .createQueryBuilder('asset')
        .where('asset.status = :status', { status: AssetStatus.PUBLISHED })
        .orderBy('asset.downloadCount', 'DESC')
        .limit(5)
        .getMany();

      // Top assets por rating
      const topRated = await this.assetRepo
        .createQueryBuilder('asset')
        .where('asset.status = :status', { status: AssetStatus.PUBLISHED })
        .andWhere('asset.ratingCount > 0')
        .orderBy('asset.rating', 'DESC')
        .limit(5)
        .getMany();

      return {
        overview: {
          total: totalAssets,
          published: publishedAssets,
          draft: draftAssets,
          archived: archivedAssets,
          deleted: deletedAssets,
          public: publicAssets,
          downloadable: downloadableAssets,
          commercial: commercialAssets
        },
        byType,
        topDownloads: topDownloads.map(a => ({ id: a.id, name: a.name, downloads: a.downloadCount })),
        topRated: topRated.map(a => ({ id: a.id, name: a.name, rating: a.rating, ratingCount: a.ratingCount }))
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas detalladas:', error);
      throw error;
    }
  }

  /**
   * Buscar assets por similitud de nombre (fuzzy search)
   */
  async searchBySimilarity(query: string, limit: number = 10): Promise<Asset[]> {
    try {
      // Búsqueda simple por similitud en nombre
      return await this.assetRepo
        .createQueryBuilder('asset')
        .where('asset.status = :status', { status: AssetStatus.PUBLISHED })
        .andWhere('asset.isPublic = :isPublic', { isPublic: true })
        .andWhere('asset.name ILIKE :query', { query: `%${query}%` })
        .orderBy('asset.rating', 'DESC')
        .limit(limit)
        .getMany();
    } catch (error) {
      logger.error('Error en búsqueda por similitud:', error);
      throw error;
    }
  }

  /**
   * Obtener assets por rango de fechas con estadísticas
   */
  async getAssetsByDateRange(startDate: Date, endDate: Date): Promise<any> {
    try {
      const assets = await this.assetRepo
        .createQueryBuilder('asset')
        .where('asset.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
        .orderBy('asset.createdAt', 'DESC')
        .getMany();

      const totalCreated = assets.length;
      const totalPublished = assets.filter(a => a.status === AssetStatus.PUBLISHED).length;
      const totalDownloads = assets.reduce((sum, a) => sum + a.downloadCount, 0);
      const totalViews = assets.reduce((sum, a) => sum + a.viewCount, 0);

      return {
        assets,
        stats: {
          totalCreated,
          totalPublished,
          totalDownloads,
          totalViews,
          publishRate: totalCreated > 0 ? (totalPublished / totalCreated) * 100 : 0
        }
      };

    } catch (error) {
      logger.error('Error obteniendo assets por rango de fechas:', error);
      throw error;
    }
  }
} 