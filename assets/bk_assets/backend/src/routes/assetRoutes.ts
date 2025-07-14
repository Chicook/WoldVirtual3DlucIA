/**
 * @fileoverview Rutas avanzadas para assets con caché y funcionalidades completas
 * @module backend/src/routes/assetRoutes
 */

import { Router } from 'express';
import { AssetController } from '../controllers/AssetController';
import { assetCacheMiddleware, statsCacheMiddleware, invalidateCache } from '../middleware/cache';
import { validateAssetCreate, validateAssetUpdate } from '../validators/assetValidator';

const router = Router();
const assetController = new AssetController();

// Middleware de caché para operaciones de escritura
const invalidateAssetCache = invalidateCache(['/api/assets']);

/**
 * @route GET /api/assets
 * @desc Obtener todos los assets con filtros avanzados
 * @access Public
 */
router.get('/', assetCacheMiddleware, assetController.getAllAssets.bind(assetController));

/**
 * @route GET /api/assets/recommended
 * @desc Obtener assets recomendados
 * @access Public
 */
router.get('/recommended', assetCacheMiddleware, assetController.getRecommendedAssets.bind(assetController));

/**
 * @route GET /api/assets/trending
 * @desc Obtener assets trending
 * @access Public
 */
router.get('/trending', assetCacheMiddleware, assetController.getTrendingAssets.bind(assetController));

/**
 * @route GET /api/assets/search
 * @desc Búsqueda por similitud
 * @access Public
 */
router.get('/search', assetCacheMiddleware, assetController.searchBySimilarity.bind(assetController));

/**
 * @route GET /api/assets/date-range
 * @desc Obtener assets por rango de fechas
 * @access Public
 */
router.get('/date-range', assetCacheMiddleware, assetController.getAssetsByDateRange.bind(assetController));

/**
 * @route GET /api/assets/stats
 * @desc Obtener estadísticas detalladas
 * @access Public
 */
router.get('/stats', statsCacheMiddleware, assetController.getDetailedStats.bind(assetController));

/**
 * @route GET /api/assets/owner/:ownerId
 * @desc Obtener assets por propietario
 * @access Public
 */
router.get('/owner/:ownerId', assetCacheMiddleware, assetController.getAssetsByOwner.bind(assetController));

/**
 * @route GET /api/assets/:id
 * @desc Obtener asset por ID
 * @access Public
 */
router.get('/:id', assetCacheMiddleware, assetController.getAssetById.bind(assetController));

/**
 * @route GET /api/assets/:id/similar
 * @desc Obtener assets similares
 * @access Public
 */
router.get('/:id/similar', assetCacheMiddleware, assetController.getSimilarAssets.bind(assetController));

/**
 * @route POST /api/assets
 * @desc Crear nuevo asset
 * @access Private
 */
router.post('/', 
  validateAssetCreate, 
  invalidateAssetCache,
  assetController.createAsset.bind(assetController)
);

/**
 * @route PUT /api/assets/:id
 * @desc Actualizar asset
 * @access Private
 */
router.put('/:id', 
  validateAssetUpdate, 
  invalidateAssetCache,
  assetController.updateAsset.bind(assetController)
);

/**
 * @route DELETE /api/assets/:id
 * @desc Eliminar asset (soft delete)
 * @access Private
 */
router.delete('/:id', 
  invalidateAssetCache,
  assetController.deleteAsset.bind(assetController)
);

/**
 * @route PATCH /api/assets/:id/restore
 * @desc Restaurar asset eliminado
 * @access Private
 */
router.patch('/:id/restore', 
  invalidateAssetCache,
  assetController.restoreAsset.bind(assetController)
);

/**
 * @route POST /api/assets/:id/download
 * @desc Incrementar contador de descargas
 * @access Public
 */
router.post('/:id/download', 
  invalidateAssetCache,
  assetController.incrementDownloadCount.bind(assetController)
);

/**
 * @route POST /api/assets/:id/rating
 * @desc Actualizar rating de un asset
 * @access Public
 */
router.post('/:id/rating', 
  invalidateAssetCache,
  assetController.updateRating.bind(assetController)
);

export default router; 