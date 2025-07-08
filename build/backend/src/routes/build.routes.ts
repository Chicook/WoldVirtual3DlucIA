import { Router } from 'express';
import { buildQueueService } from '../services/BuildQueueService';
import { buildProgressService } from '../services/BuildProgressService';
import { notificationService } from '../services/NotificationService';
import { Logger } from '../utils/Logger';
import { validateBuildRequest } from '../middleware/validation';

const router = Router();
const logger = new Logger('BuildRoutes');

// GET /api/v1/builds - Obtener todos los builds
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, moduleName } = req.query;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const where: any = {};
    if (status) where.status = status;
    if (moduleName) where.moduleName = moduleName;
    
    const builds = await prisma.build.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      include: {
        module: true
      }
    });
    
    const total = await prisma.build.count({ where });
    
    res.json({
      builds,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/builds/:id - Obtener build específico
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const build = await prisma.build.findUnique({
      where: { id },
      include: {
        module: true
      }
    });
    
    if (!build) {
      return res.status(404).json({
        error: 'Build no encontrado'
      });
    }
    
    res.json({ build });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/builds - Iniciar nuevo build
router.post('/', validateBuildRequest, async (req, res, next) => {
  try {
    const { moduleName, priority = 'normal', metadata = {} } = req.body;
    
    logger.info(`Solicitud de build para módulo: ${moduleName}`);
    
    // Verificar si el módulo existe
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    const module = await prisma.buildModule.findUnique({
      where: { name: moduleName }
    });
    
    if (!module) {
      return res.status(404).json({
        error: 'Módulo no encontrado'
      });
    }
    
    // Agregar job a la cola
    const jobId = await buildQueueService.addJob(moduleName, priority, metadata);
    
    // Enviar notificación
    await notificationService.sendNotification('build-started', {
      moduleName,
      jobId
    });
    
    res.status(201).json({
      message: 'Build iniciado exitosamente',
      jobId,
      moduleName,
      priority
    });
    
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/builds/:id/cancel - Cancelar build
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    logger.info(`Cancelando build: ${id}`);
    
    await buildQueueService.cancelJob(id);
    
    // Enviar notificación
    await notificationService.sendNotification('build-cancelled', {
      jobId: id
    });
    
    res.json({
      message: 'Build cancelado exitosamente',
      jobId: id
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/builds/:id/logs - Obtener logs del build
router.get('/:id/logs', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lines = 100 } = req.query;
    
    // En un entorno real, aquí se leerían los logs del archivo
    // Por ahora retornamos logs simulados
    const logs = [
      `[${new Date().toISOString()}] INFO: Build iniciado`,
      `[${new Date().toISOString()}] INFO: Validando configuración`,
      `[${new Date().toISOString()}] INFO: Instalando dependencias`,
      `[${new Date().toISOString()}] INFO: Compilando código`,
      `[${new Date().toISOString()}] INFO: Ejecutando tests`,
      `[${new Date().toISOString()}] INFO: Optimizando build`,
      `[${new Date().toISOString()}] INFO: Empaquetando`,
      `[${new Date().toISOString()}] SUCCESS: Build completado`
    ].slice(-Number(lines));
    
    res.json({
      jobId: id,
      logs,
      totalLines: logs.length
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/builds/stats - Obtener estadísticas de builds
router.get('/stats/overview', async (req, res, next) => {
  try {
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const [
      totalBuilds,
      completedBuilds,
      failedBuilds,
      inProgressBuilds,
      averageDuration
    ] = await Promise.all([
      prisma.build.count(),
      prisma.build.count({ where: { status: 'completed' } }),
      prisma.build.count({ where: { status: 'failed' } }),
      prisma.build.count({ where: { status: 'processing' } }),
      prisma.build.aggregate({
        where: { status: 'completed' },
        _avg: { duration: true }
      })
    ]);
    
    const successRate = totalBuilds > 0 ? (completedBuilds / totalBuilds) * 100 : 0;
    
    res.json({
      totalBuilds,
      completedBuilds,
      failedBuilds,
      inProgressBuilds,
      successRate: Math.round(successRate * 100) / 100,
      averageDuration: averageDuration._avg.duration || 0,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/builds/stats/modules - Obtener estadísticas por módulo
router.get('/stats/modules', async (req, res, next) => {
  try {
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const moduleStats = await prisma.build.groupBy({
      by: ['moduleName'],
      _count: {
        id: true
      },
      _avg: {
        duration: true
      },
      where: {
        status: 'completed'
      }
    });
    
    const stats = await Promise.all(
      moduleStats.map(async (stat) => {
        const failedCount = await prisma.build.count({
          where: {
            moduleName: stat.moduleName,
            status: 'failed'
          }
        });
        
        const totalCount = stat._count.id + failedCount;
        const successRate = totalCount > 0 ? (stat._count.id / totalCount) * 100 : 0;
        
        return {
          moduleName: stat.moduleName,
          totalBuilds: totalCount,
          successfulBuilds: stat._count.id,
          failedBuilds: failedCount,
          successRate: Math.round(successRate * 100) / 100,
          averageDuration: stat._avg.duration || 0
        };
      })
    );
    
    res.json({ stats });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/builds/recent - Obtener builds recientes
router.get('/recent', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const recentBuilds = await prisma.build.findMany({
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      include: {
        module: true
      }
    });
    
    res.json({ builds: recentBuilds });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/builds/batch - Iniciar múltiples builds
router.post('/batch', async (req, res, next) => {
  try {
    const { builds } = req.body;
    
    if (!Array.isArray(builds) || builds.length === 0) {
      return res.status(400).json({
        error: 'Se requiere un array de builds'
      });
    }
    
    if (builds.length > 10) {
      return res.status(400).json({
        error: 'Máximo 10 builds por lote'
      });
    }
    
    const results = [];
    
    for (const build of builds) {
      try {
        const { moduleName, priority = 'normal', metadata = {} } = build;
        
        const jobId = await buildQueueService.addJob(moduleName, priority, metadata);
        
        results.push({
          moduleName,
          jobId,
          status: 'queued',
          priority
        });
        
      } catch (error) {
        results.push({
          moduleName: build.moduleName,
          error: (error as Error).message,
          status: 'failed'
        });
      }
    }
    
    res.status(201).json({
      message: 'Batch de builds procesado',
      results
    });
    
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/builds/:id - Eliminar build (solo si está completado o fallido)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const build = await prisma.build.findUnique({
      where: { id }
    });
    
    if (!build) {
      return res.status(404).json({
        error: 'Build no encontrado'
      });
    }
    
    if (build.status === 'processing' || build.status === 'queued') {
      return res.status(400).json({
        error: 'No se puede eliminar un build en progreso'
      });
    }
    
    await prisma.build.delete({
      where: { id }
    });
    
    res.json({
      message: 'Build eliminado exitosamente',
      jobId: id
    });
    
  } catch (error) {
    next(error);
  }
});

export { router as buildRoutes }; 