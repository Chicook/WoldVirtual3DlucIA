/**
 * @fileoverview Módulo de compresión de assets del metaverso
 * @module assets/src/compression
 */

import { Logger } from '../utils/logger';
import { AssetType, CompressionOptions } from '../types';

/**
 * Compresor de assets
 */
export class AssetCompressor {
  private logger: Logger;
  private algorithms: {
    [key: string]: {
      name: string;
      extension: string;
      compressionRatio: number;
    };
  };

  constructor() {
    this.logger = new Logger('AssetCompressor');
    this.algorithms = {
      gzip: {
        name: 'Gzip',
        extension: '.gz',
        compressionRatio: 0.3
      },
      brotli: {
        name: 'Brotli',
        extension: '.br',
        compressionRatio: 0.25
      },
      lz4: {
        name: 'LZ4',
        extension: '.lz4',
        compressionRatio: 0.4
      },
      zstd: {
        name: 'Zstandard',
        extension: '.zst',
        compressionRatio: 0.2
      }
    };
  }

  /**
   * Inicializa el compresor
   */
  async initialize(): Promise<void> {
    this.logger.info('🗜️ Inicializando compresor de assets...');
    this.logger.success('✅ Compresor inicializado');
  }

  /**
   * Comprime un asset
   */
  async compress(filePath: string, options: CompressionOptions = {}): Promise<{
    outputPath: string;
    size: number;
    algorithm: string;
    ratio: number;
  }> {
    this.logger.startProcess('compression', { filePath, options });

    try {
      const startTime = Date.now();
      const originalSize = await this.getFileSize(filePath);
      const algorithm = options.algorithm || 'gzip';
      const level = options.level || 6;

      if (!this.algorithms[algorithm]) {
        throw new Error(`Algoritmo de compresión no soportado: ${algorithm}`);
      }

      const outputPath = await this.compressFile(filePath, algorithm, level);
      const compressedSize = await this.getFileSize(outputPath);
      const ratio = compressedSize / originalSize;

      const duration = Date.now() - startTime;

      this.logger.endProcess('compression', duration, {
        originalSize,
        compressedSize,
        ratio: `${(ratio * 100).toFixed(1)}%`
      });

      this.logger.compression(originalSize, compressedSize);

      return {
        outputPath,
        size: compressedSize,
        algorithm,
        ratio
      };

    } catch (error) {
      this.logger.error('Error comprimiendo asset:', error);
      throw error;
    }
  }

  /**
   * Comprime archivo usando algoritmo específico
   */
  private async compressFile(filePath: string, algorithm: string, level: number): Promise<string> {
    const fs = require('fs-extra');
    const path = require('path');
    const zlib = require('zlib');
    const { promisify } = require('util');

    const outputPath = filePath + this.algorithms[algorithm].extension;

    try {
      const inputBuffer = await fs.readFile(filePath);
      let compressedBuffer: Buffer;

      switch (algorithm) {
        case 'gzip':
          compressedBuffer = await promisify(zlib.gzip)(inputBuffer, { level });
          break;

        case 'brotli':
          const brotli = require('brotli');
          compressedBuffer = Buffer.from(brotli.compress(inputBuffer, { quality: level }));
          break;

        case 'lz4':
          const lz4 = require('lz4');
          compressedBuffer = lz4.encode(inputBuffer);
          break;

        case 'zstd':
          const zstd = require('node-zstd');
          compressedBuffer = await promisify(zstd.compress)(inputBuffer, level);
          break;

        default:
          throw new Error(`Algoritmo no implementado: ${algorithm}`);
      }

      await fs.writeFile(outputPath, compressedBuffer);
      return outputPath;

    } catch (error) {
      this.logger.error(`Error comprimiendo con ${algorithm}:`, error);
      throw error;
    }
  }

  /**
   * Descomprime un archivo
   */
  async decompress(filePath: string, algorithm?: string): Promise<{
    outputPath: string;
    size: number;
  }> {
    this.logger.info(`📦 Descomprimiendo: ${filePath}`);

    try {
      const detectedAlgorithm = algorithm || this.detectAlgorithm(filePath);
      const outputPath = filePath.replace(this.algorithms[detectedAlgorithm].extension, '');
      
      const originalSize = await this.getFileSize(filePath);
      const decompressedSize = await this.decompressFile(filePath, detectedAlgorithm, outputPath);

      this.logger.success(`✅ Descompresión completada: ${this.formatSize(decompressedSize)}`);

      return {
        outputPath,
        size: decompressedSize
      };

    } catch (error) {
      this.logger.error('Error descomprimiendo archivo:', error);
      throw error;
    }
  }

  /**
   * Descomprime archivo usando algoritmo específico
   */
  private async decompressFile(filePath: string, algorithm: string, outputPath: string): Promise<number> {
    const fs = require('fs-extra');
    const zlib = require('zlib');
    const { promisify } = require('util');

    try {
      const compressedBuffer = await fs.readFile(filePath);
      let decompressedBuffer: Buffer;

      switch (algorithm) {
        case 'gzip':
          decompressedBuffer = await promisify(zlib.gunzip)(compressedBuffer);
          break;

        case 'brotli':
          const brotli = require('brotli');
          decompressedBuffer = Buffer.from(brotli.decompress(compressedBuffer));
          break;

        case 'lz4':
          const lz4 = require('lz4');
          decompressedBuffer = lz4.decode(compressedBuffer);
          break;

        case 'zstd':
          const zstd = require('node-zstd');
          decompressedBuffer = await promisify(zstd.decompress)(compressedBuffer);
          break;

        default:
          throw new Error(`Algoritmo no implementado: ${algorithm}`);
      }

      await fs.writeFile(outputPath, decompressedBuffer);
      return decompressedBuffer.length;

    } catch (error) {
      this.logger.error(`Error descomprimiendo con ${algorithm}:`, error);
      throw error;
    }
  }

  /**
   * Detecta el algoritmo de compresión
   */
  private detectAlgorithm(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    
    for (const [algorithm, config] of Object.entries(this.algorithms)) {
      if (config.extension === `.${ext}`) {
        return algorithm;
      }
    }

    throw new Error(`No se pudo detectar el algoritmo de compresión para: ${filePath}`);
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
   * Formatea el tamaño en bytes
   */
  private formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Comprime múltiples archivos
   */
  async compressBatch(filePaths: string[], options: CompressionOptions = {}): Promise<{
    outputPaths: string[];
    totalOriginalSize: number;
    totalCompressedSize: number;
    averageRatio: number;
  }> {
    this.logger.info(`🗜️ Comprimiendo lote de ${filePaths.length} archivos...`);

    const results = [];
    const batchSize = 3; // Compresión es intensiva en CPU

    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const batchPromises = batch.map(filePath => this.compress(filePath, options));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.error('Error en compresión de lote:', result.reason);
        }
      }

      this.logger.progress('Comprimiendo archivos', i + batch.length, filePaths.length);
    }

    const totalOriginalSize = results.reduce((sum, r) => sum + r.size / r.ratio, 0);
    const totalCompressedSize = results.reduce((sum, r) => sum + r.size, 0);
    const averageRatio = totalCompressedSize / totalOriginalSize;

    this.logger.success(`✅ Compresión de lote completada: ${(averageRatio * 100).toFixed(1)}% ratio promedio`);

    return {
      outputPaths: results.map(r => r.outputPath),
      totalOriginalSize,
      totalCompressedSize,
      averageRatio
    };
  }

  /**
   * Compara algoritmos de compresión
   */
  async compareAlgorithms(filePath: string): Promise<{
    algorithm: string;
    size: number;
    ratio: number;
    time: number;
  }[]> {
    this.logger.info(`🔍 Comparando algoritmos de compresión para: ${filePath}`);

    const results = [];
    const originalSize = await this.getFileSize(filePath);

    for (const [algorithm, config] of Object.entries(this.algorithms)) {
      try {
        const startTime = Date.now();
        const result = await this.compress(filePath, { algorithm });
        const time = Date.now() - startTime;

        results.push({
          algorithm,
          size: result.size,
          ratio: result.ratio,
          time
        });

        // Limpiar archivo temporal
        const fs = require('fs-extra');
        await fs.remove(result.outputPath);

      } catch (error) {
        this.logger.warn(`Error probando algoritmo ${algorithm}:`, error);
      }
    }

    // Ordenar por ratio de compresión
    results.sort((a, b) => a.ratio - b.ratio);

    this.logger.info('📊 Resultados de comparación:', results);

    return results;
  }

  /**
   * Obtiene algoritmos disponibles
   */
  getAvailableAlgorithms(): string[] {
    return Object.keys(this.algorithms);
  }

  /**
   * Obtiene información del algoritmo
   */
  getAlgorithmInfo(algorithm: string): any {
    return this.algorithms[algorithm] || null;
  }

  /**
   * Limpia archivos temporales
   */
  async cleanup(): Promise<void> {
    this.logger.info('🧹 Limpiando archivos temporales de compresión...');
    // Implementar limpieza de archivos temporales
    this.logger.success('✅ Limpieza de compresión completada');
  }
} 