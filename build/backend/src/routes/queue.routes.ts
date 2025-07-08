import { Router } from 'express';
import { buildQueueService } from '../services/BuildQueueService';
import { Logger } from '../utils/Logger';

const router = Router();
const logger = new Logger('QueueRoutes');

// GET /api/v1/queue - Obtener estado de la cola
router.get('/', async (req, res, next) => {
  try {
    logger.info('Solicitud de estado de cola');
    
    const status = await buildQueueService.getQueueStatus();
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/queue/jobs - Obtener jobs en cola
router.get('/jobs', async (req, res, next) => {
  try {
    const { status, priority, limit = 50, offset = 0 } = req.query;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    const jobs = await prisma.build.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: Number(limit),
      skip: Number(offset),
      include: {
        module: true
      }
    });
    
    const total = await prisma.build.count({ where });
    
    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: Math.floor(Number(offset) / Number(limit)) + 1,
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/queue/jobs/:id - Obtener job específico
router.get('/jobs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    logger.info(`Solicitud de job: ${id}`);
    
    const job = await buildQueueService.getJob(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: job
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/queue/jobs - Agregar job a la cola
router.post('/jobs', async (req, res, next) => {
  try {
    const { moduleName, priority = 'normal', metadata = {} } = req.body;
    
    if (!moduleName) {
      return res.status(400).json({
        success: false,
        error: 'moduleName es requerido'
      });
    }
    
    logger.info(`Agregando job a la cola: ${moduleName}`);
    
    const jobId = await buildQueueService.addJob(moduleName, priority, metadata);
    
    res.status(201).json({
      success: true,
      message: 'Job agregado a la cola exitosamente',
      data: {
        jobId,
        moduleName,
        priority,
        status: 'queued'
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/queue/jobs/:id - Cancelar job
router.delete('/jobs/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    logger.info(`Cancelando job: ${id}`);
    
    await buildQueueService.cancelJob(id);
    
    res.json({
      success: true,
      message: 'Job cancelado exitosamente',
      data: {
        jobId: id
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/queue/jobs/:id/retry - Reintentar job
router.post('/jobs/:id/retry', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    logger.info(`Reintentando job: ${id}`);
    
    const job = await buildQueueService.getJob(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job no encontrado'
      });
    }
    
    if (job.status !== 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden reintentar jobs fallidos'
      });
    }
    
    // Crear nuevo job con los mismos parámetros
    const newJobId = await buildQueueService.addJob(
      job.moduleName,
      job.priority,
      job.metadata
    );
    
    res.json({
      success: true,
      message: 'Job reintentado exitosamente',
      data: {
        originalJobId: id,
        newJobId,
        moduleName: job.moduleName
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/queue/stats - Obtener estadísticas de la cola
router.get('/stats', async (req, res, next) => {
  try {
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const [
      totalJobs,
      queuedJobs,
      processingJobs,
      completedJobs,
      failedJobs,
      cancelledJobs,
      averageWaitTime,
      averageProcessingTime
    ] = await Promise.all([
      prisma.build.count(),
      prisma.build.count({ where: { status: 'queued' } }),
      prisma.build.count({ where: { status: 'processing' } }),
      prisma.build.count({ where: { status: 'completed' } }),
      prisma.build.count({ where: { status: 'failed' } }),
      prisma.build.count({ where: { status: 'cancelled' } }),
      prisma.build.aggregate({
        where: { status: 'completed' },
        _avg: { duration: true }
      }),
      prisma.build.aggregate({
        where: { 
          status: 'completed',
          startTime: { not: null }
        },
        _avg: {
          startTime: true
        }
      })
    ]);
    
    const stats = {
      totalJobs,
      queuedJobs,
      processingJobs,
      completedJobs,
      failedJobs,
      cancelledJobs,
      successRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
      averageWaitTime: averageWaitTime._avg.duration || 0,
      averageProcessingTime: averageProcessingTime._avg.startTime || 0,
      queueUtilization: (processingJobs / 4) * 100, // Asumiendo maxConcurrency = 4
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/queue/priority-stats - Obtener estadísticas por prioridad
router.get('/priority-stats', async (req, res, next) => {
  try {
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const priorityStats = await prisma.build.groupBy({
      by: ['priority'],
      _count: {
        id: true
      },
      _avg: {
        duration: true
      }
    });
    
    const stats = priorityStats.map(stat => ({
      priority: stat.priority,
      totalJobs: stat._count.id,
      averageDuration: stat._avg.duration || 0
    }));
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/queue/module-stats - Obtener estadísticas por módulo
router.get('/module-stats', async (req, res, next) => {
  try {
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const moduleStats = await prisma.build.groupBy({
      by: ['moduleName'],
      _count: {
        id: true
      },
      _avg: {
        duration: true
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
          totalJobs: totalCount,
          successfulJobs: stat._count.id,
          failedJobs: failedCount,
          successRate: Math.round(successRate * 100) / 100,
          averageDuration: stat._avg.duration || 0
        };
      })
    );
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/queue/clear - Limpiar cola (solo jobs completados/fallidos/cancelados)
router.post('/clear', async (req, res, next) => {
  try {
    const { status = ['completed', 'failed', 'cancelled'] } = req.body;
    
    logger.info('Limpiando cola de jobs');
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const result = await prisma.build.deleteMany({
      where: {
        status: {
          in: Array.isArray(status) ? status : [status]
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Cola limpiada exitosamente',
      data: {
        deletedCount: result.count
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/queue/pause - Pausar procesamiento de la cola
router.post('/pause', async (req, res, next) => {
  try {
    logger.info('Pausando procesamiento de la cola');
    
    // En una implementación real, aquí se pausaría el procesamiento
    // Por ahora solo retornamos un mensaje
    
    res.json({
      success: true,
      message: 'Procesamiento de cola pausado',
      data: {
        pausedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/queue/resume - Reanudar procesamiento de la cola
router.post('/resume', async (req, res, next) => {
  try {
    logger.info('Reanudando procesamiento de la cola');
    
    // En una implementación real, aquí se reanudaría el procesamiento
    // Por ahora solo retornamos un mensaje
    
    res.json({
      success: true,
      message: 'Procesamiento de cola reanudado',
      data: {
        resumedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/queue/health - Health check de la cola
router.get('/health', async (req, res, next) => {
  try {
    const status = await buildQueueService.getQueueStatus();
    
    const health = {
      status: 'healthy',
      queueSize: status.queuedJobs,
      processingJobs: status.processingJobs,
      queueHealth: status.queueHealth,
      lastUpdated: status.lastUpdated
    };
    
    // Marcar como warning si hay muchos jobs en cola
    if (status.queuedJobs > 20) {
      health.status = 'warning';
    }
    
    // Marcar como critical si la cola está llena
    if (status.queueHealth === 'critical') {
      health.status = 'critical';
    }
    
    res.json({
      success: true,
      data: health
    });
    
  } catch (error) {
    next(error);
  }
});

export { router as queueRoutes }; 