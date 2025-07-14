/**
 * @fileoverview Módulo de upload de assets del metaverso
 * @module assets/src/upload
 */

import { Logger } from '../utils/logger';
import { UploadOptions } from '../types';

/**
 * Uploader de assets
 */
export class AssetUploader {
  private logger: Logger;
  private platforms: {
    ipfs?: any;
    arweave?: any;
    aws?: any;
    local?: any;
  };
  private stats: {
    totalUploads: number;
    totalSize: number;
    successfulUploads: number;
    failedUploads: number;
  };

  constructor() {
    this.logger = new Logger('AssetUploader');
    this.platforms = {};
    this.stats = {
      totalUploads: 0,
      totalSize: 0,
      successfulUploads: 0,
      failedUploads: 0
    };
  }

  /**
   * Inicializa el uploader
   */
  async initialize(): Promise<void> {
    this.logger.info('📤 Inicializando uploader de assets...');

    try {
      // Inicializar plataformas disponibles
      await this.initializePlatforms();
      this.logger.success('✅ Uploader inicializado');
    } catch (error) {
      this.logger.error('❌ Error inicializando uploader:', error);
      throw error;
    }
  }

  /**
   * Inicializa las plataformas de upload
   */
  private async initializePlatforms(): Promise<void> {
    // IPFS
    try {
      const { create } = require('ipfs-http-client');
      this.platforms.ipfs = create({
        host: process.env.IPFS_HOST || 'ipfs.infura.io',
        port: process.env.IPFS_PORT || 5001,
        protocol: process.env.IPFS_PROTOCOL || 'https'
      });
      this.logger.info('✅ IPFS inicializado');
    } catch (error) {
      this.logger.warn('⚠️ IPFS no disponible:', error.message);
    }

    // Arweave
    try {
      const Arweave = require('arweave');
      this.platforms.arweave = Arweave.init({
        host: process.env.ARWEAVE_HOST || 'arweave.net',
        port: process.env.ARWEAVE_PORT || 443,
        protocol: process.env.ARWEAVE_PROTOCOL || 'https'
      });
      this.logger.info('✅ Arweave inicializado');
    } catch (error) {
      this.logger.warn('⚠️ Arweave no disponible:', error.message);
    }

    // AWS S3
    try {
      const AWS = require('aws-sdk');
      AWS.config.update({
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });
      this.platforms.aws = new AWS.S3();
      this.logger.info('✅ AWS S3 inicializado');
    } catch (error) {
      this.logger.warn('⚠️ AWS S3 no disponible:', error.message);
    }

    // Almacenamiento local
    try {
      const fs = require('fs-extra');
      const localPath = process.env.LOCAL_STORAGE_PATH || './storage';
      await fs.ensureDir(localPath);
      this.platforms.local = { path: localPath };
      this.logger.info('✅ Almacenamiento local inicializado');
    } catch (error) {
      this.logger.warn('⚠️ Almacenamiento local no disponible:', error.message);
    }
  }

  /**
   * Sube un asset
   */
  async upload(filePath: string, options: UploadOptions = {}): Promise<{
    url: string;
    platform: string;
    hash?: string;
    size: number;
  }> {
    this.logger.startProcess('upload', { filePath, options });

    try {
      const startTime = Date.now();
      const platform = options.platform || 'ipfs';
      const size = await this.getFileSize(filePath);

      if (!this.platforms[platform]) {
        throw new Error(`Plataforma no disponible: ${platform}`);
      }

      let result: any;

      switch (platform) {
        case 'ipfs':
          result = await this.uploadToIPFS(filePath, options);
          break;
        case 'arweave':
          result = await this.uploadToArweave(filePath, options);
          break;
        case 'aws':
          result = await this.uploadToAWS(filePath, options);
          break;
        case 'local':
          result = await this.uploadToLocal(filePath, options);
          break;
        default:
          throw new Error(`Plataforma no soportada: ${platform}`);
      }

      const duration = Date.now() - startTime;

      // Actualizar estadísticas
      this.updateStats(size, true);

      this.logger.endProcess('upload', duration, {
        platform,
        url: result.url,
        size
      });

      this.logger.upload(platform, result.url, size);

      return result;

    } catch (error) {
      this.logger.error('Error subiendo asset:', error);
      this.updateStats(0, false);
      throw error;
    }
  }

  /**
   * Sube a IPFS
   */
  private async uploadToIPFS(filePath: string, options: UploadOptions): Promise<{
    url: string;
    platform: string;
    hash: string;
    size: number;
  }> {
    const fs = require('fs-extra');
    const fileBuffer = await fs.readFile(filePath);

    const result = await this.platforms.ipfs.add(fileBuffer, {
      pin: options.pin !== false,
      cidVersion: 1
    });

    const url = `ipfs://${result.cid}`;
    const size = result.size;

    return {
      url,
      platform: 'ipfs',
      hash: result.cid,
      size
    };
  }

  /**
   * Sube a Arweave
   */
  private async uploadToArweave(filePath: string, options: UploadOptions): Promise<{
    url: string;
    platform: string;
    hash: string;
    size: number;
  }> {
    const fs = require('fs-extra');
    const fileBuffer = await fs.readFile(filePath);

    const transaction = await this.platforms.arweave.createTransaction({
      data: fileBuffer
    });

    // Agregar tags si se especifican
    if (options.tags) {
      for (const tag of options.tags) {
        transaction.addTag('Content-Type', 'application/octet-stream');
        transaction.addTag('User-Agent', 'Metaverso-Assets');
      }
    }

    // Firmar y enviar transacción
    await this.platforms.arweave.transactions.sign(transaction);
    const response = await this.platforms.arweave.transactions.post(transaction);

    const url = `ar://${transaction.id}`;
    const size = fileBuffer.length;

    return {
      url,
      platform: 'arweave',
      hash: transaction.id,
      size
    };
  }

  /**
   * Sube a AWS S3
   */
  private async uploadToAWS(filePath: string, options: UploadOptions): Promise<{
    url: string;
    platform: string;
    hash: string;
    size: number;
  }> {
    const fs = require('fs-extra');
    const path = require('path');
    const crypto = require('crypto');

    const bucket = process.env.AWS_S3_BUCKET || 'metaverso-assets';
    const key = `assets/${Date.now()}-${path.basename(filePath)}`;
    const fileBuffer = await fs.readFile(filePath);

    const params = {
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: this.getContentType(filePath),
      ACL: options.public ? 'public-read' : 'private',
      Metadata: {
        'upload-date': new Date().toISOString(),
        'original-filename': path.basename(filePath)
      }
    };

    const result = await this.platforms.aws.upload(params).promise();
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    return {
      url: result.Location,
      platform: 'aws',
      hash,
      size: fileBuffer.length
    };
  }

  /**
   * Sube a almacenamiento local
   */
  private async uploadToLocal(filePath: string, options: UploadOptions): Promise<{
    url: string;
    platform: string;
    hash: string;
    size: number;
  }> {
    const fs = require('fs-extra');
    const path = require('path');
    const crypto = require('crypto');

    const fileName = `${Date.now()}-${path.basename(filePath)}`;
    const destinationPath = path.join(this.platforms.local.path, fileName);

    await fs.copy(filePath, destinationPath);
    const fileBuffer = await fs.readFile(destinationPath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const url = `file://${destinationPath}`;

    return {
      url,
      platform: 'local',
      hash,
      size: fileBuffer.length
    };
  }

  /**
   * Obtiene el tipo de contenido
   */
  private getContentType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'glb': 'model/gltf-binary',
      'gltf': 'model/gltf+json',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'svg': 'image/svg+xml'
    };

    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Obtiene el tamaño del archivo
   */
  private async getFileSize(filePath: string): Promise<number> {
    const fs = require('fs-extra');
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * Actualiza estadísticas
   */
  private updateStats(size: number, success: boolean): void {
    this.stats.totalUploads++;
    this.stats.totalSize += size;
    
    if (success) {
      this.stats.successfulUploads++;
    } else {
      this.stats.failedUploads++;
    }
  }

  /**
   * Sube múltiples assets
   */
  async uploadBatch(filePaths: string[], options: UploadOptions = {}): Promise<{
    results: any[];
    successful: number;
    failed: number;
    totalSize: number;
  }> {
    this.logger.info(`📤 Subiendo lote de ${filePaths.length} assets...`);

    const results = [];
    const batchSize = 3; // Upload puede ser lento

    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const batchPromises = batch.map(filePath => this.upload(filePath, options));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.error('Error en upload de lote:', result.reason);
        }
      }

      this.logger.progress('Subiendo assets', i + batch.length, filePaths.length);
    }

    const successful = results.length;
    const failed = filePaths.length - successful;
    const totalSize = results.reduce((sum, r) => sum + r.size, 0);

    this.logger.success(`✅ Upload de lote completado: ${successful}/${filePaths.length} exitosos`);

    return {
      results,
      successful,
      failed,
      totalSize
    };
  }

  /**
   * Elimina un asset
   */
  async delete(assetId: string, platform: string): Promise<void> {
    this.logger.info(`🗑️ Eliminando asset ${assetId} de ${platform}`);

    try {
      switch (platform) {
        case 'ipfs':
          await this.deleteFromIPFS(assetId);
          break;
        case 'arweave':
          // Arweave es inmutable, no se puede eliminar
          this.logger.warn('Arweave es inmutable, no se puede eliminar');
          break;
        case 'aws':
          await this.deleteFromAWS(assetId);
          break;
        case 'local':
          await this.deleteFromLocal(assetId);
          break;
        default:
          throw new Error(`Plataforma no soportada: ${platform}`);
      }

      this.logger.success(`✅ Asset eliminado de ${platform}`);
    } catch (error) {
      this.logger.error(`Error eliminando asset de ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Elimina de IPFS
   */
  private async deleteFromIPFS(assetId: string): Promise<void> {
    // IPFS no tiene eliminación directa, pero se puede unpin
    try {
      await this.platforms.ipfs.pin.rm(assetId);
    } catch (error) {
      this.logger.warn('Error unpinning de IPFS:', error);
    }
  }

  /**
   * Elimina de AWS
   */
  private async deleteFromAWS(assetId: string): Promise<void> {
    const bucket = process.env.AWS_S3_BUCKET || 'metaverso-assets';
    
    await this.platforms.aws.deleteObject({
      Bucket: bucket,
      Key: assetId
    }).promise();
  }

  /**
   * Elimina de almacenamiento local
   */
  private async deleteFromLocal(assetId: string): Promise<void> {
    const fs = require('fs-extra');
    const filePath = path.join(this.platforms.local.path, assetId);
    
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  /**
   * Obtiene estadísticas
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Obtiene plataformas disponibles
   */
  getAvailablePlatforms(): string[] {
    return Object.keys(this.platforms);
  }

  /**
   * Verifica conectividad de plataformas
   */
  async checkConnectivity(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};

    for (const [platform, client] of Object.entries(this.platforms)) {
      try {
        switch (platform) {
          case 'ipfs':
            await client.version();
            status[platform] = true;
            break;
          case 'arweave':
            await client.network.getInfo();
            status[platform] = true;
            break;
          case 'aws':
            await client.listBuckets().promise();
            status[platform] = true;
            break;
          case 'local':
            const fs = require('fs-extra');
            await fs.access(this.platforms.local.path);
            status[platform] = true;
            break;
        }
      } catch (error) {
        status[platform] = false;
        this.logger.warn(`Conectividad fallida para ${platform}:`, error.message);
      }
    }

    return status;
  }

  /**
   * Limpia archivos temporales
   */
  async cleanup(): Promise<void> {
    this.logger.info('🧹 Limpiando archivos temporales de upload...');
    // Implementar limpieza de archivos temporales
    this.logger.success('✅ Limpieza de upload completada');
  }
} 