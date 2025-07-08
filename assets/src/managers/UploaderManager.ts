/**
 * @fileoverview Manager avanzado para uploaders con registro dinámico y balanceo de carga
 */

import { IUploader, UploadOptions, UploadResult } from '../interfaces/IUploader';
import { Logger } from '../utils/logger';

export interface UploaderConfig {
  name: string;
  priority: number;
  weight: number;
  maxConcurrent: number;
  timeout: number;
  retryAttempts: number;
  fallbackTo?: string[];
}

export interface UploadMetrics {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  averageUploadTime: number;
  totalDataTransferred: number;
  lastUploadTime: Date;
  errors: Record<string, number>;
}

export class UploaderManager {
  private uploaders: Map<string, IUploader> = new Map();
  private configs: Map<string, UploaderConfig> = new Map();
  private metrics: Map<string, UploadMetrics> = new Map();
  private logger: Logger;
  private activeUploads: Map<string, Promise<UploadResult>> = new Map();

  constructor() {
    this.logger = new Logger('UploaderManager');
  }

  registerUploader(name: string, uploader: IUploader, config: UploaderConfig): void {
    this.uploaders.set(name, uploader);
    this.configs.set(name, config);
    this.metrics.set(name, {
      totalUploads: 0,
      successfulUploads: 0,
      failedUploads: 0,
      averageUploadTime: 0,
      totalDataTransferred: 0,
      lastUploadTime: new Date(),
      errors: {}
    });
    this.logger.info(`📤 Uploader registrado: ${name} (prioridad: ${config.priority})`);
  }

  async upload(filePath: string, options: UploadOptions): Promise<UploadResult> {
    const startTime = Date.now();
    const uploaderName = options.platform;
    
    try {
      const uploader = this.uploaders.get(uploaderName);
      if (!uploader) {
        throw new Error(`Uploader no encontrado: ${uploaderName}`);
      }

      const config = this.configs.get(uploaderName);
      if (!config) {
        throw new Error(`Configuración no encontrada para: ${uploaderName}`);
      }

      // Verificar límites de concurrencia
      if (this.activeUploads.size >= config.maxConcurrent) {
        this.logger.warn(`⚠️ Límite de concurrencia alcanzado para ${uploaderName}`);
        await this.waitForSlot(uploaderName);
      }

      // Crear promesa de upload
      const uploadPromise = this.executeUpload(uploader, filePath, options, config);
      this.activeUploads.set(`${uploaderName}-${Date.now()}`, uploadPromise);

      const result = await uploadPromise;
      
      // Actualizar métricas
      this.updateMetrics(uploaderName, Date.now() - startTime, true, result.size);
      
      return result;

    } catch (error) {
      this.updateMetrics(uploaderName, Date.now() - startTime, false, 0, error.message);
      
      // Intentar fallback
      const config = this.configs.get(uploaderName);
      if (config?.fallbackTo && config.fallbackTo.length > 0) {
        this.logger.warn(`🔄 Intentando fallback para ${uploaderName}`);
        return this.uploadWithFallback(filePath, options, config.fallbackTo);
      }
      
      throw error;
    } finally {
      // Limpiar upload activo
      this.activeUploads.delete(`${uploaderName}-${Date.now()}`);
    }
  }

  private async executeUpload(
    uploader: IUploader, 
    filePath: string, 
    options: UploadOptions, 
    config: UploaderConfig
  ): Promise<UploadResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
      try {
        return await uploader.upload(filePath, options);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`⚠️ Intento ${attempt}/${config.retryAttempts} falló para ${uploader.name}: ${error.message}`);
        
        if (attempt < config.retryAttempts) {
          await this.delay(config.timeout * attempt);
        }
      }
    }
    
    throw lastError || new Error('Upload falló después de todos los intentos');
  }

  private async uploadWithFallback(
    filePath: string, 
    options: UploadOptions, 
    fallbackUploaders: string[]
  ): Promise<UploadResult> {
    for (const fallbackName of fallbackUploaders) {
      try {
        const fallbackOptions = { ...options, platform: fallbackName as any };
        return await this.upload(filePath, fallbackOptions);
      } catch (error) {
        this.logger.warn(`⚠️ Fallback ${fallbackName} también falló: ${error.message}`);
      }
    }
    
    throw new Error('Todos los uploaders fallaron');
  }

  private async waitForSlot(uploaderName: string): Promise<void> {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        const config = this.configs.get(uploaderName);
        if (config && this.activeUploads.size < config.maxConcurrent) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  private updateMetrics(
    uploaderName: string, 
    duration: number, 
    success: boolean, 
    dataSize: number, 
    error?: string
  ): void {
    const metrics = this.metrics.get(uploaderName);
    if (!metrics) return;

    metrics.totalUploads++;
    metrics.lastUploadTime = new Date();
    metrics.totalDataTransferred += dataSize;

    if (success) {
      metrics.successfulUploads++;
      metrics.averageUploadTime = (metrics.averageUploadTime + duration) / 2;
    } else {
      metrics.failedUploads++;
      if (error) {
        metrics.errors[error] = (metrics.errors[error] || 0) + 1;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getMetrics(uploaderName?: string): UploadMetrics | Record<string, UploadMetrics> {
    if (uploaderName) {
      return this.metrics.get(uploaderName) || {} as UploadMetrics;
    }
    return Object.fromEntries(this.metrics);
  }

  getUploader(uploaderName: string): IUploader | undefined {
    return this.uploaders.get(uploaderName);
  }

  listUploaders(): string[] {
    return Array.from(this.uploaders.keys());
  }
} 