/**
 * @fileoverview Controlador avanzado para assets con funcionalidades completas
 * @module backend/src/controllers/AssetController
 */

import { Request, Response } from 'express';
import { AppDataSource } from '../database/connection';
import { Asset, AssetStatus, AssetType } from '../entities/Asset';
import { AssetService, AssetFilters, AssetSort, AssetPagination } from '../services/AssetService';
import { validateAssetCreate, validateAssetUpdate } from '../validators/assetValidator';
import { Logger } from '../utils/logger';
import { clearAssetCache, clearStatsCache } from '../middleware/cache';

const logger = new Logger('AssetController');
const assetService = new AssetService();

export class AssetController {
  /**
   * Obtener todos los assets con filtros avanzados
   */
  async getAllAssets(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        type,
        status,
        ownerId,
        isPublic,
        allowDownload,
        allowModification,
        allowCommercialUse,
        minFileSize,
        maxFileSize,
        minRating,
        maxRating,
        minDownloadCount,
        minViewCount,
        tags,
        createdAfter,
        createdBefore,
        publishedAfter,
        publishedBefore,
        q
      } = req.query;

      // Construir filtros
      const filters: AssetFilters = {
        type: type as AssetType,
        status: status as AssetStatus,
        ownerId: ownerId as string,
        isPublic: isPublic === 'true',
        allowDownload: allowDownload === 'true',
        allowModification: allowModification === 'true',
        allowCommercialUse: allowCommercialUse === 'true',
        minFileSize: minFileSize ? parseInt(minFileSize as string) : undefined,
        maxFileSize: maxFileSize ? parseInt(maxFileSize as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxRating: maxRating ? parseFloat(maxRating as string) : undefined,
        minDownloadCount: minDownloadCount ? parseInt(minDownloadCount as string) : undefined,
        minViewCount: minViewCount ? parseInt(minViewCount as string) : undefined,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : undefined,
        createdAfter: createdAfter ? new Date(createdAfter as string) : undefined,
        createdBefore: createdBefore ? new Date(createdBefore as string) : undefined,
        publishedAfter: publishedAfter ? new Date(publishedAfter as string) : undefined,
        publishedBefore: publishedBefore ? new Date(publishedBefore as string) : undefined,
        q: q as string
      };

      const sort: AssetSort = {
        field: sortBy as keyof Asset,
        order: sortOrder as 'ASC' | 'DESC'
      };

      const pagination: AssetPagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await assetService.searchAssets(filters, sort, pagination);

      res.json({
        success: true,
        data: result.assets,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        }
      });

    } catch (error: any) {
      logger.error('Error obteniendo assets:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener asset por ID con incremento de vistas
   */
  async getAssetById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { incrementViews = 'true' } = req.query;

      const asset = await AppDataSource.getRepository(Asset).findOneBy({ id });

      if (!asset) {
        res.status(404).json({
          success: false,
          message: 'Asset no encontrado'
        });
        return;
      }

      // Incrementar contador de vistas si se solicita
      if (incrementViews === 'true') {
        await assetService.incrementViewCount(id);
      }

      res.json({
        success: true,
        data: asset
      });

    } catch (error: any) {
      logger.error('Error obteniendo asset por ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear nuevo asset
   */
  async createAsset(req: Request, res: Response): Promise<void> {
    try {
      // Validación manual de campos requeridos
      const { name, type, fileUrl, ownerId } = req.body;
      
      if (!name || typeof name !== 'string' || name.length < 3) {
        res.status(400).json({
          success: false,
          message: 'El nombre es obligatorio y debe tener al menos 3 caracteres'
        });
        return;
      }
      
      if (!type || !Object.values(AssetType).includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de asset inválido'
        });
        return;
      }
      
      if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.startsWith('http')) {
        res.status(400).json({
          success: false,
          message: 'URL de archivo inválida'
        });
        return;
      }
      
      if (!ownerId || typeof ownerId !== 'string') {
        res.status(400).json({
          success: false,
          message: 'El ownerId es obligatorio'
        });
        return;
      }

      const assetRepository = AppDataSource.getRepository(Asset);
      const asset = assetRepository.create(req.body);
      const savedAsset = await assetRepository.save(asset);

      // Limpiar caché relacionado
      await clearAssetCache();

      res.status(201).json({
        success: true,
        message: 'Asset creado exitosamente',
        data: savedAsset
      });

    } catch (error: any) {
      logger.error('Error creando asset:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar asset
   */
  async updateAsset(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validación manual de campos opcionales
      const { name, type, status, fileUrl } = req.body;
      
      if (name && (typeof name !== 'string' || name.length < 3)) {
        res.status(400).json({
          success: false,
          message: 'El nombre debe tener al menos 3 caracteres'
        });
        return;
      }
      
      if (type && !Object.values(AssetType).includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de asset inválido'
        });
        return;
      }
      
      if (status && !Object.values(AssetStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Estado de asset inválido'
        });
        return;
      }
      
      if (fileUrl && (typeof fileUrl !== 'string' || !fileUrl.startsWith('http'))) {
        res.status(400).json({
          success: false,
          message: 'URL de archivo inválida'
        });
        return;
      }

      const assetRepository = AppDataSource.getRepository(Asset);
      const asset = await assetRepository.findOneBy({ id });

      if (!asset) {
        res.status(404).json({
          success: false,
          message: 'Asset no encontrado'
        });
        return;
      }

      // Actualizar campos
      Object.assign(asset, req.body);
      asset.updatedAt = new Date();
      
      const updatedAsset = await assetRepository.save(asset);

      // Limpiar caché relacionado
      await clearAssetCache();

      res.json({
        success: true,
        message: 'Asset actualizado exitosamente',
        data: updatedAsset
      });

    } catch (error: any) {
      logger.error('Error actualizando asset:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar asset (soft delete)
   */
  async deleteAsset(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assetRepository = AppDataSource.getRepository(Asset);
      const asset = await assetRepository.findOneBy({ id });

      if (!asset) {
        res.status(404).json({
          success: false,
          message: 'Asset no encontrado'
        });
        return;
      }

      // Soft delete
      asset.status = AssetStatus.DELETED;
      asset.deletedAt = new Date();
      await assetRepository.save(asset);

      // Limpiar caché relacionado
      await clearAssetCache();

      res.json({
        success: true,
        message: 'Asset eliminado exitosamente'
      });

    } catch (error: any) {
      logger.error('Error eliminando asset:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Restaurar asset eliminado
   */
  async restoreAsset(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assetRepository = AppDataSource.getRepository(Asset);
      const asset = await assetRepository.findOneBy({ id });

      if (!asset) {
        res.status(404).json({
          success: false,
          message: 'Asset no encontrado'
        });
        return;
      }

      if (asset.status !== AssetStatus.DELETED) {
        res.status(400).json({
          success: false,
          message: 'El asset no está eliminado'
        });
        return;
      }

             asset.status = AssetStatus.DRAFT;
       asset.deletedAt = undefined;
       asset.updatedAt = new Date();
      await assetRepository.save(asset);

      // Limpiar caché relacionado
      await clearAssetCache();

      res.json({
        success: true,
        message: 'Asset restaurado exitosamente',
        data: asset
      });

    } catch (error: any) {
      logger.error('Error restaurando asset:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener assets recomendados
   */
  async getRecommendedAssets(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;
      const assets = await assetService.getRecommendedAssets(parseInt(limit as string));

      res.json({
        success: true,
        data: assets
      });

    } catch (error: any) {
      logger.error('Error obteniendo assets recomendados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener assets trending
   */
  async getTrendingAssets(req: Request, res: Response): Promise<void> {
    try {
      const { days = 7, limit = 10 } = req.query;
      const assets = await assetService.getTrendingAssets(
        parseInt(days as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: assets
      });

    } catch (error: any) {
      logger.error('Error obteniendo assets trending:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener assets similares
   */
  async getSimilarAssets(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;
      const assets = await assetService.getSimilarAssets(id, parseInt(limit as string));

      res.json({
        success: true,
        data: assets
      });

    } catch (error: any) {
      logger.error('Error obteniendo assets similares:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Incrementar contador de descargas
   */
  async incrementDownloadCount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await assetService.incrementDownloadCount(id);

      res.json({
        success: true,
        message: 'Contador de descargas incrementado'
      });

    } catch (error: any) {
      logger.error('Error incrementando contador de descargas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar rating de un asset
   */
  async updateRating(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating debe estar entre 1 y 5'
        });
        return;
      }

      await assetService.updateRating(id, rating);

      res.json({
        success: true,
        message: 'Rating actualizado exitosamente'
      });

    } catch (error: any) {
      logger.error('Error actualizando rating:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas detalladas
   */
  async getDetailedStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await assetService.getDetailedStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error: any) {
      logger.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Búsqueda por similitud
   */
  async searchBySimilarity(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit = 10 } = req.query;

      if (!q) {
        res.status(400).json({
          success: false,
          message: 'Parámetro de búsqueda requerido'
        });
        return;
      }

      const assets = await assetService.searchBySimilarity(
        q as string,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: assets
      });

    } catch (error: any) {
      logger.error('Error en búsqueda por similitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener assets por rango de fechas
   */
  async getAssetsByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Fechas de inicio y fin requeridas'
        });
        return;
      }

      const result = await assetService.getAssetsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      logger.error('Error obteniendo assets por rango de fechas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener assets por propietario
   */
  async getAssetsByOwner(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId } = req.params;
      const { page = 1, limit = 20, status } = req.query;

      const filters: AssetFilters = {
        ownerId,
        status: status as AssetStatus
      };

      const pagination: AssetPagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await assetService.searchAssets(filters, undefined, pagination);

      res.json({
        success: true,
        data: result.assets,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        }
      });

    } catch (error: any) {
      logger.error('Error obteniendo assets por propietario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
} 