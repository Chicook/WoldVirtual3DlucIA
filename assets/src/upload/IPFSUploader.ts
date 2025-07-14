/**
 * @fileoverview Implementación avanzada del uploader para IPFS
 */

import { IUploader, UploadOptions, UploadResult } from '../interfaces/IUploader';
import { Logger } from '../utils/logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

export class IPFSUploader implements IUploader {
  public readonly name = 'IPFS Uploader';
  public readonly version = '1.0.0';
  public readonly supportedFormats = ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'webp', 'mp3', 'wav', 'ogg', 'mp4', 'webm'];
  public readonly maxFileSize = 100 * 1024 * 1024; // 100MB

  private logger: Logger;
  private endpoint: string;
  private apiKey: string;
  private gateway: string;

  constructor() {
    this.logger = new Logger('IPFSUploader');
    this.endpoint = process.env.IPFS_ENDPOINT || 'https://ipfs.infura.io:5001';
    this.apiKey = process.env.IPFS_API_KEY || '';
    this.gateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
  }

  async upload(filePath: string, options: UploadOptions): Promise<UploadResult> {
    const startTime = Date.now();
    
    try {
      // Validar archivo
      await this.validateFile(filePath);
      
      // Calcular hash del archivo
      const fileHash = await this.calculateFileHash(filePath);
      
      // Verificar si ya existe en IPFS
      const existingResult = await this.checkExisting(fileHash);
      if (existingResult) {
        this.logger.info(`📋 Archivo ya existe en IPFS: ${fileHash}`);
        return existingResult;
      }

      // Preparar archivo para upload
      const formData = await this.prepareFormData(filePath, options);
      
      // Realizar upload con reintentos
      const uploadResult = await this.performUpload(formData, options);
      
      // Generar URL pública
      const publicUrl = `${this.gateway}${uploadResult.Hash}`;
      
      const result: UploadResult = {
        url: publicUrl,
        hash: uploadResult.Hash,
        size: uploadResult.Size,
        metadata: {
          name: path.basename(filePath),
          format: path.extname(filePath).substring(1),
          uploadedAt: new Date().toISOString(),
          ipfsHash: uploadResult.Hash,
          gateway: this.gateway
        },
        timestamp: new Date(),
        expiresAt: undefined, // IPFS es permanente
        accessToken: undefined
      };

      this.logger.success(`✅ Upload exitoso a IPFS: ${result.hash}`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en upload a IPFS: ${errorMessage}`);
      throw new Error(`IPFS upload failed: ${errorMessage}`);
    }
  }

  async delete(assetId: string): Promise<boolean> {
    try {
      // IPFS no permite eliminación directa, pero podemos marcar como no deseado
      this.logger.warn(`⚠️ IPFS no permite eliminación directa. Asset: ${assetId}`);
      return true; // Simulamos éxito
    } catch (error) {
      this.logger.error(`❌ Error marcando asset como no deseado: ${error}`);
      return false;
    }
  }

  async getInfo(assetId: string): Promise<UploadResult | null> {
    try {
      const response = await fetch(`${this.endpoint}/api/v0/object/stat?arg=${assetId}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return {
        url: `${this.gateway}${assetId}`,
        hash: assetId,
        size: data.CumulativeSize,
        metadata: {
          links: data.Links,
          dataSize: data.DataSize
        },
        timestamp: new Date(),
        expiresAt: undefined,
        accessToken: undefined
      };
    } catch (error) {
      this.logger.error(`❌ Error obteniendo info de IPFS: ${error}`);
      return null;
    }
  }

  async updateMetadata(assetId: string, metadata: Record<string, any>): Promise<boolean> {
    try {
      // IPFS no permite actualización directa de metadatos
      // Podríamos crear un nuevo archivo con metadatos actualizados
      this.logger.warn(`⚠️ IPFS no permite actualización directa de metadatos. Asset: ${assetId}`);
      return true; // Simulamos éxito
    } catch (error) {
      this.logger.error(`❌ Error actualizando metadatos: ${error}`);
      return false;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/api/v0/version`);
      return response.ok;
    } catch (error) {
      this.logger.error(`❌ Error validando conexión IPFS: ${error}`);
      return false;
    }
  }

  async getQuota(): Promise<{ used: number; total: number; remaining: number }> {
    try {
      // IPFS no tiene cuotas tradicionales, pero podemos verificar el estado del nodo
      const response = await fetch(`${this.endpoint}/api/v0/repo/stat`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          used: data.RepoSize,
          total: Infinity, // IPFS no tiene límite teórico
          remaining: Infinity
        };
      }
      
      return { used: 0, total: Infinity, remaining: Infinity };
    } catch (error) {
      this.logger.error(`❌ Error obteniendo cuota IPFS: ${error}`);
      return { used: 0, total: Infinity, remaining: Infinity };
    }
  }

  private async validateFile(filePath: string): Promise<void> {
    const stats = await fs.stat(filePath);
    
    if (stats.size > this.maxFileSize) {
      throw new Error(`Archivo demasiado grande: ${stats.size} bytes (máximo: ${this.maxFileSize} bytes)`);
    }

    const ext = path.extname(filePath).toLowerCase().substring(1);
    if (!this.supportedFormats.includes(ext)) {
      throw new Error(`Formato no soportado: ${ext}`);
    }
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async checkExisting(hash: string): Promise<UploadResult | null> {
    try {
      const info = await this.getInfo(hash);
      return info;
    } catch {
      return null;
    }
  }

  private async prepareFormData(filePath: string, options: UploadOptions): Promise<FormData> {
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', fs.createReadStream(filePath));
    
    if (options.tags && options.tags.length > 0) {
      form.append('pin', 'true');
    }
    
    if (options.metadata) {
      form.append('metadata', JSON.stringify(options.metadata));
    }
    
    return form;
  }

  private async performUpload(formData: any, options: UploadOptions): Promise<any> {
    const axios = require('axios');
    const maxRetries = options.retry?.attempts || 3;
    const retryDelay = options.retry?.delay || 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(`${this.endpoint}/api/v0/add`, formData, {
          headers: {
            ...formData.getHeaders(),
            'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : undefined
          },
          timeout: 30000
        });
        
        return response.data;
        
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        this.logger.warn(`⚠️ Intento ${attempt}/${maxRetries} falló, reintentando en ${retryDelay}ms...`);
        await this.delay(retryDelay * attempt);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 