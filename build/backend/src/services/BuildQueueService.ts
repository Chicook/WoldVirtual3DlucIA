import { Logger } from '../utils/Logger';
import { cacheManager } from '../cache/CacheManager';
import { databaseManager } from '../database/DatabaseManager';
import { EventEmitter } from 'events';

export interface BuildJob {
  id: string;
  moduleName: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  metadata: any;
  retryCount: number;
  maxRetries: number;
  dependencies?: string[];
}

export interface QueueStatus {
  totalJobs: number;
  queuedJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  cancelledJobs: number;
  averageWaitTime: number;
  averageProcessingTime: number;
  queueHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface QueueConfig {
  maxConcurrency: number;
  maxQueueSize: number;
  retryAttempts: number;
  retryDelay: number;
  jobTimeout: number;
  cleanupInterval: number;
}

export class BuildQueueService extends EventEmitter {
  private static instance: BuildQueueService;
  private logger: Logger;
  private queue: BuildJob[] = [];
  private processing: Set<string> = new Set();
  private config: QueueConfig;
  private cleanupInterval?: NodeJS.Timeout;

  private constructor() {
    super();
    this.logger = new Logger('BuildQueueService');
    this.config = {
      maxConcurrency: 4,
      maxQueueSize: 100,
      retryAttempts: 3,
      retryDelay: 5000,
      jobTimeout: 300000, // 5 minutos
      cleanupInterval: 3600000 // 1 hora
    };
  }

  public static getInstance(): BuildQueueService {
    if (!BuildQueueService.instance) {
      BuildQueueService.instance = new BuildQueueService();
    }
    return BuildQueueService.instance;
  }

  public static async initialize(): Promise<void> {
    const instance = BuildQueueService.getInstance();
    await instance.loadQueueFromDatabase();
    instance.startCleanupInterval();
    instance.processQueue();
  }

  private async loadQueueFromDatabase(): Promise<void> {
    try {
      this.logger.info('Cargando cola desde la base de datos...');
      
      const prisma = databaseManager.getClient();
      const builds = await prisma.build.findMany({
        where: {
          status: {
            in: ['queued', 'processing']
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      for (const build of builds) {
        const job: BuildJob = {
          id: build.id,
          moduleName: build.moduleName,
          priority: this.getPriorityFromBuild(build),
          status: build.status as any,
          createdAt: build.createdAt,
          startedAt: build.startTime,
          completedAt: build.endTime,
          duration: build.duration,
          error: build.error || undefined,
          metadata: {},
          retryCount: build.retryCount || 0,
          maxRetries: this.config.retryAttempts,
          dependencies: []
        };

        if (job.status === 'processing') {
          this.processing.add(job.id);
        } else {
          this.queue.push(job);
        }
      }

      this.logger.success(`Cola cargada: ${this.queue.length} jobs en cola, ${this.processing.size} procesando`);
      
    } catch (error) {
      this.logger.error('Error cargando cola desde la base de datos', error as Error);
    }
  }

  private getPriorityFromBuild(build: any): 'low' | 'normal' | 'high' | 'urgent' {
    // Lógica para determinar prioridad basada en el build
    if (build.moduleName === 'blockchain' || build.moduleName === 'smart-contracts') {
      return 'high';
    }
    if (build.moduleName === 'bridge-bsc' || build.moduleName === 'gas-abstraction') {
      return 'normal';
    }
    return 'low';
  }

  public async addJob(moduleName: string, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal', metadata: any = {}): Promise<string> {
    try {
      if (this.queue.length >= this.config.maxQueueSize) {
        throw new Error('Cola llena, no se pueden agregar más jobs');
      }

      const jobId = this.generateJobId();
      const job: BuildJob = {
        id: jobId,
        moduleName,
        priority,
        status: 'queued',
        createdAt: new Date(),
        metadata,
        retryCount: 0,
        maxRetries: this.config.retryAttempts,
        dependencies: []
      };

      // Insertar en la posición correcta según prioridad
      this.insertJobByPriority(job);
      
      // Guardar en base de datos
      await this.saveJobToDatabase(job);
      
      // Actualizar cache
      await this.updateQueueCache();
      
      this.emit('job-added', { job });
      this.logger.info(`Job agregado: ${jobId} para módulo ${moduleName} con prioridad ${priority}`);
      
      // Procesar cola si hay capacidad
      this.processQueue();
      
      return jobId;
      
    } catch (error) {
      this.logger.error(`Error agregando job para módulo: ${moduleName}`, error as Error);
      throw error;
    }
  }

  private insertJobByPriority(job: BuildJob): void {
    const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
    const jobPriority = priorityOrder[job.priority];
    
    let insertIndex = 0;
    for (let i = 0; i < this.queue.length; i++) {
      const currentPriority = priorityOrder[this.queue[i].priority];
      if (jobPriority > currentPriority) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }
    
    this.queue.splice(insertIndex, 0, job);
  }

  public async cancelJob(jobId: string): Promise<void> {
    try {
      const jobIndex = this.queue.findIndex(job => job.id === jobId);
      if (jobIndex === -1) {
        throw new Error(`Job no encontrado: ${jobId}`);
      }

      const job = this.queue[jobIndex];
      job.status = 'cancelled';
      job.completedAt = new Date();
      
      // Remover de la cola
      this.queue.splice(jobIndex, 1);
      
      // Actualizar en base de datos
      await this.updateJobInDatabase(job);
      
      // Actualizar cache
      await this.updateQueueCache();
      
      this.emit('job-cancelled', { job });
      this.logger.info(`Job cancelado: ${jobId}`);
      
    } catch (error) {
      this.logger.error(`Error cancelando job: ${jobId}`, error as Error);
      throw error;
    }
  }

  public async getJob(jobId: string): Promise<BuildJob | null> {
    try {
      // Buscar en cola
      const queuedJob = this.queue.find(job => job.id === jobId);
      if (queuedJob) return queuedJob;

      // Buscar en procesamiento
      if (this.processing.has(jobId)) {
        const prisma = databaseManager.getClient();
        const build = await prisma.build.findUnique({
          where: { id: jobId }
        });
        
        if (build) {
          return this.convertBuildToJob(build);
        }
      }

      return null;
      
    } catch (error) {
      this.logger.error(`Error obteniendo job: ${jobId}`, error as Error);
      throw error;
    }
  }

  public async getQueueStatus(): Promise<QueueStatus> {
    try {
      const now = new Date();
      const totalJobs = this.queue.length + this.processing.size;
      
      // Calcular tiempos promedio
      const queuedJobs = this.queue.filter(job => job.status === 'queued');
      const averageWaitTime = queuedJobs.length > 0 ? 
        queuedJobs.reduce((sum, job) => sum + (now.getTime() - job.createdAt.getTime()), 0) / queuedJobs.length : 0;

      const prisma = databaseManager.getClient();
      const completedBuilds = await prisma.build.findMany({
        where: { status: 'completed' },
        orderBy: { endTime: 'desc' },
        take: 10
      });

      const averageProcessingTime = completedBuilds.length > 0 ?
        completedBuilds.reduce((sum, build) => sum + (build.duration || 0), 0) / completedBuilds.length : 0;

      // Determinar salud de la cola
      let queueHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (this.queue.length > this.config.maxQueueSize * 0.8) {
        queueHealth = 'warning';
      }
      if (this.queue.length >= this.config.maxQueueSize) {
        queueHealth = 'critical';
      }

      const status: QueueStatus = {
        totalJobs,
        queuedJobs: this.queue.length,
        processingJobs: this.processing.size,
        completedJobs: await this.getCompletedJobsCount(),
        failedJobs: await this.getFailedJobsCount(),
        cancelledJobs: await this.getCancelledJobsCount(),
        averageWaitTime,
        averageProcessingTime,
        queueHealth,
        lastUpdated: now
      };

      return status;
      
    } catch (error) {
      this.logger.error('Error obteniendo estado de la cola', error as Error);
      throw error;
    }
  }

  private async getCompletedJobsCount(): Promise<number> {
    try {
      const prisma = databaseManager.getClient();
      return await prisma.build.count({
        where: { status: 'completed' }
      });
    } catch (error) {
      return 0;
    }
  }

  private async getFailedJobsCount(): Promise<number> {
    try {
      const prisma = databaseManager.getClient();
      return await prisma.build.count({
        where: { status: 'failed' }
      });
    } catch (error) {
      return 0;
    }
  }

  private async getCancelledJobsCount(): Promise<number> {
    try {
      const prisma = databaseManager.getClient();
      return await prisma.build.count({
        where: { status: 'cancelled' }
      });
    } catch (error) {
      return 0;
    }
  }

  private async processQueue(): Promise<void> {
    try {
      while (this.processing.size < this.config.maxConcurrency && this.queue.length > 0) {
        const job = this.queue.shift();
        if (!job) break;

        await this.startJob(job);
      }
    } catch (error) {
      this.logger.error('Error procesando cola', error as Error);
    }
  }

  private async startJob(job: BuildJob): Promise<void> {
    try {
      job.status = 'processing';
      job.startedAt = new Date();
      this.processing.add(job.id);

      // Actualizar en base de datos
      await this.updateJobInDatabase(job);
      
      // Actualizar cache
      await this.updateQueueCache();

      this.emit('job-started', { job });
      this.logger.info(`Job iniciado: ${job.id} para módulo ${job.moduleName}`);

      // Simular procesamiento (en un entorno real, aquí se ejecutaría el build)
      setTimeout(async () => {
        await this.completeJob(job);
      }, Math.random() * 30000 + 10000); // Entre 10-40 segundos

    } catch (error) {
      this.logger.error(`Error iniciando job: ${job.id}`, error as Error);
      await this.failJob(job, error as Error);
    }
  }

  private async completeJob(job: BuildJob): Promise<void> {
    try {
      job.status = 'completed';
      job.completedAt = new Date();
      job.duration = job.startedAt ? 
        job.completedAt.getTime() - job.startedAt.getTime() : undefined;

      this.processing.delete(job.id);

      // Actualizar en base de datos
      await this.updateJobInDatabase(job);
      
      // Actualizar cache
      await this.updateQueueCache();

      this.emit('job-completed', { job });
      this.logger.success(`Job completado: ${job.id} para módulo ${job.moduleName}`);

      // Procesar siguiente job
      this.processQueue();

    } catch (error) {
      this.logger.error(`Error completando job: ${job.id}`, error as Error);
      await this.failJob(job, error as Error);
    }
  }

  private async failJob(job: BuildJob, error: Error): Promise<void> {
    try {
      job.retryCount++;
      job.error = error.message;

      if (job.retryCount < job.maxRetries) {
        // Reintentar
        job.status = 'queued';
        job.startedAt = undefined;
        this.processing.delete(job.id);
        this.insertJobByPriority(job);
        
        this.logger.warn(`Job falló, reintentando: ${job.id} (intento ${job.retryCount}/${job.maxRetries})`);
        
        // Esperar antes del reintento
        setTimeout(() => {
          this.processQueue();
        }, this.config.retryDelay);
        
      } else {
        // Máximo de reintentos alcanzado
        job.status = 'failed';
        job.completedAt = new Date();
        this.processing.delete(job.id);

        this.logger.error(`Job falló definitivamente: ${job.id} después de ${job.maxRetries} intentos`);
      }

      // Actualizar en base de datos
      await this.updateJobInDatabase(job);
      
      // Actualizar cache
      await this.updateQueueCache();

      this.emit('job-failed', { job, error });
      
      // Procesar siguiente job
      this.processQueue();

    } catch (updateError) {
      this.logger.error(`Error actualizando job fallido: ${job.id}`, updateError as Error);
    }
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveJobToDatabase(job: BuildJob): Promise<void> {
    try {
      const prisma = databaseManager.getClient();
      await prisma.build.create({
        data: {
          id: job.id,
          moduleName: job.moduleName,
          status: job.status,
          startTime: job.startedAt,
          endTime: job.completedAt,
          duration: job.duration,
          error: job.error,
          retryCount: job.retryCount,
          createdAt: job.createdAt,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Error guardando job en base de datos: ${job.id}`, error as Error);
    }
  }

  private async updateJobInDatabase(job: BuildJob): Promise<void> {
    try {
      const prisma = databaseManager.getClient();
      await prisma.build.update({
        where: { id: job.id },
        data: {
          status: job.status,
          startTime: job.startedAt,
          endTime: job.completedAt,
          duration: job.duration,
          error: job.error,
          retryCount: job.retryCount,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Error actualizando job en base de datos: ${job.id}`, error as Error);
    }
  }

  private convertBuildToJob(build: any): BuildJob {
    return {
      id: build.id,
      moduleName: build.moduleName,
      priority: this.getPriorityFromBuild(build),
      status: build.status as any,
      createdAt: build.createdAt,
      startedAt: build.startTime,
      completedAt: build.endTime,
      duration: build.duration,
      error: build.error || undefined,
      metadata: {},
      retryCount: build.retryCount || 0,
      maxRetries: this.config.retryAttempts,
      dependencies: []
    };
  }

  private async updateQueueCache(): Promise<void> {
    try {
      const status = await this.getQueueStatus();
      await cacheManager.cacheBuildQueue(status);
    } catch (error) {
      this.logger.error('Error actualizando cache de cola', error as Error);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupOldJobs();
    }, this.config.cleanupInterval);
  }

  private async cleanupOldJobs(): Promise<void> {
    try {
      this.logger.info('Limpiando jobs antiguos...');
      
      const prisma = databaseManager.getClient();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      await prisma.build.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          status: {
            in: ['completed', 'failed', 'cancelled']
          }
        }
      });
      
      this.logger.success('Limpieza de jobs completada');
      
    } catch (error) {
      this.logger.error('Error limpiando jobs antiguos', error as Error);
    }
  }

  public async close(): Promise<void> {
    try {
      this.logger.info('Cerrando servicio de cola...');
      
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
      
      // Esperar a que terminen los jobs en procesamiento
      while (this.processing.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      this.logger.success('Servicio de cola cerrado');
      
    } catch (error) {
      this.logger.error('Error cerrando servicio de cola', error as Error);
    }
  }
}

// Exportar instancia singleton
export const buildQueueService = BuildQueueService.getInstance(); 