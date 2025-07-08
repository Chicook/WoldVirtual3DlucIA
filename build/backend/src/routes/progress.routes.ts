import { Router } from 'express';
import { buildProgressService } from '../services/BuildProgressService';
import { Logger } from '../utils/Logger';

const router = Router();
const logger = new Logger('ProgressRoutes');

// GET /api/v1/progress - Obtener progreso general del proyecto
router.get('/', async (req, res, next) => {
  try {
    logger.info('Solicitud de progreso general');
    
    const progress = await buildProgressService.getCurrentProgress();
    
    res.json({
      success: true,
      data: progress
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/progress/modules - Obtener progreso de todos los módulos
router.get('/modules', async (req, res, next) => {
  try {
    const { status, sortBy = 'progress', order = 'desc' } = req.query;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const where: any = {};
    if (status) where.status = status;
    
    const orderBy: any = {};
    orderBy[sortBy as string] = order;
    
    const modules = await prisma.buildModule.findMany({
      where,
      orderBy,
      include: {
        builds: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    const modulesWithProgress = modules.map(module => ({
      name: module.name,
      description: module.description,
      status: module.status,
      progress: module.progress,
      lastBuild: module.builds[0] || null,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt
    }));
    
    res.json({
      success: true,
      data: {
        modules: modulesWithProgress,
        total: modulesWithProgress.length,
        completed: modulesWithProgress.filter(m => m.status === 'completed').length,
        inProgress: modulesWithProgress.filter(m => m.status === 'in-progress').length,
        notStarted: modulesWithProgress.filter(m => m.status === 'not-started').length,
        failed: modulesWithProgress.filter(m => m.status === 'failed').length
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/progress/modules/:name - Obtener progreso de un módulo específico
router.get('/modules/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    
    logger.info(`Solicitud de progreso para módulo: ${name}`);
    
    const progress = await buildProgressService.getProgress(name);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Módulo no encontrado'
      });
    }
    
    // Obtener información adicional del módulo
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    const module = await prisma.buildModule.findUnique({
      where: { name },
      include: {
        builds: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    
    const response = {
      ...progress,
      module: module ? {
        name: module.name,
        description: module.description,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt
      } : null,
      recentBuilds: module?.builds || []
    };
    
    res.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/progress/modules/:name - Actualizar progreso de un módulo
router.put('/modules/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const { progress, step, metadata } = req.body;
    
    logger.info(`Actualizando progreso para módulo: ${name} - ${progress}%`);
    
    await buildProgressService.updateProgress(name, progress, step);
    
    // Si hay metadata, actualizar el módulo
    if (metadata) {
      const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
      await prisma.buildModule.update({
        where: { name },
        data: {
          progress,
          updatedAt: new Date()
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Progreso actualizado exitosamente',
      data: {
        moduleName: name,
        progress,
        step
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/progress/modules/:name/start - Iniciar progreso de un módulo
router.post('/modules/:name/start', async (req, res, next) => {
  try {
    const { name } = req.params;
    
    logger.info(`Iniciando progreso para módulo: ${name}`);
    
    await buildProgressService.startBuild(name);
    
    res.json({
      success: true,
      message: 'Progreso iniciado exitosamente',
      data: {
        moduleName: name,
        status: 'in-progress'
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/progress/modules/:name/complete - Completar progreso de un módulo
router.post('/modules/:name/complete', async (req, res, next) => {
  try {
    const { name } = req.params;
    const { metadata } = req.body;
    
    logger.info(`Completando progreso para módulo: ${name}`);
    
    await buildProgressService.completeBuild(name, metadata);
    
    res.json({
      success: true,
      message: 'Progreso completado exitosamente',
      data: {
        moduleName: name,
        status: 'completed'
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/progress/modules/:name/fail - Marcar progreso de un módulo como fallido
router.post('/modules/:name/fail', async (req, res, next) => {
  try {
    const { name } = req.params;
    const { error } = req.body;
    
    logger.error(`Marcando progreso como fallido para módulo: ${name}`, new Error(error));
    
    await buildProgressService.failBuild(name, error);
    
    res.json({
      success: true,
      message: 'Progreso marcado como fallido',
      data: {
        moduleName: name,
        status: 'failed',
        error
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/progress/modules/:name/pause - Pausar progreso de un módulo
router.post('/modules/:name/pause', async (req, res, next) => {
  try {
    const { name } = req.params;
    
    logger.info(`Pausando progreso para módulo: ${name}`);
    
    await buildProgressService.pauseBuild(name);
    
    res.json({
      success: true,
      message: 'Progreso pausado exitosamente',
      data: {
        moduleName: name,
        status: 'paused'
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/progress/stats - Obtener estadísticas de progreso
router.get('/stats', async (req, res, next) => {
  try {
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const [
      totalModules,
      completedModules,
      inProgressModules,
      failedModules,
      notStartedModules
    ] = await Promise.all([
      prisma.buildModule.count(),
      prisma.buildModule.count({ where: { status: 'completed' } }),
      prisma.buildModule.count({ where: { status: 'in-progress' } }),
      prisma.buildModule.count({ where: { status: 'failed' } }),
      prisma.buildModule.count({ where: { status: 'not-started' } })
    ]);
    
    const overallProgress = totalModules > 0 ? 
      (completedModules / totalModules) * 100 : 0;
    
    const averageProgress = await prisma.buildModule.aggregate({
      _avg: { progress: true }
    });
    
    const stats = {
      totalModules,
      completedModules,
      inProgressModules,
      failedModules,
      notStartedModules,
      overallProgress: Math.round(overallProgress * 100) / 100,
      averageProgress: Math.round((averageProgress._avg.progress || 0) * 100) / 100,
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

// GET /api/v1/progress/timeline - Obtener timeline de progreso
router.get('/timeline', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const prisma = (await import('../database/DatabaseManager')).databaseManager.getClient();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    
    const timeline = await prisma.buildModule.findMany({
      where: {
        updatedAt: {
          gte: startDate
        }
      },
      orderBy: { updatedAt: 'asc' },
      select: {
        name: true,
        status: true,
        progress: true,
        updatedAt: true
      }
    });
    
    // Agrupar por fecha
    const groupedTimeline = timeline.reduce((acc, item) => {
      const date = item.updatedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, any[]>);
    
    res.json({
      success: true,
      data: {
        timeline: groupedTimeline,
        days: Number(days),
        totalUpdates: timeline.length
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/progress/export - Exportar progreso en diferentes formatos
router.get('/export', async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;
    
    const progress = await buildProgressService.getCurrentProgress();
    
    switch (format) {
      case 'csv':
        const csv = generateCSV(progress);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="progress.csv"');
        res.send(csv);
        break;
        
      case 'json':
      default:
        res.json({
          success: true,
          data: progress,
          exportedAt: new Date().toISOString()
        });
        break;
    }
    
  } catch (error) {
    next(error);
  }
});

function generateCSV(progress: any): string {
  const headers = ['Module', 'Status', 'Progress', 'Current Step', 'Last Updated'];
  const rows = progress.modules.map((module: any) => [
    module.name,
    module.status,
    `${module.progress}%`,
    module.currentStep,
    module.lastUpdated
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

export { router as progressRoutes }; 