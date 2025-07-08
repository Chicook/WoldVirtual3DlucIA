/**
 * @fileoverview Implementación avanzada del compressor Gzip
 */

import { ICompressor, CompressionOptions, CompressionResult } from '../interfaces/ICompressor';
import { Logger } from '../utils/logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export class GzipCompressor implements ICompressor {
  public readonly name = 'Gzip Compressor';
  public readonly version = '1.0.0';
  public readonly supportedAlgorithms = ['gzip'];
  public readonly supportedFormats = ['txt', 'json', 'xml', 'csv', 'log', 'md', 'js', 'ts', 'css', 'html'];

  private logger: Logger;

  constructor() {
    this.logger = new Logger('GzipCompressor');
  }

  async compress(filePath: string, options: CompressionOptions): Promise<CompressionResult> {
    const startTime = Date.now();
    
    try {
      // Leer archivo
      const fileBuffer = await fs.readFile(filePath);
      const originalSize = fileBuffer.length;
      
      // Configurar nivel de compresión
      const level = Math.min(Math.max(options.level || 6, 1), 9);
      
      // Comprimir
      const compressedBuffer = await gzip(fileBuffer, { level });
      const compressedSize = compressedBuffer.length;
      
      // Calcular ratio de compresión
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
      
      // Generar archivo de salida
      const outputPath = this.generateOutputPath(filePath, 'gz');
      await fs.writeFile(outputPath, compressedBuffer);
      
      const result: CompressionResult = {
        outputPath,
        originalSize,
        compressedSize,
        compressionRatio,
        algorithm: 'gzip',
        quality: level,
        processingTime: Date.now() - startTime,
        metadata: {
          level,
          originalFormat: path.extname(filePath).substring(1),
          compressedFormat: 'gz'
        }
      };

      this.logger.success(`✅ Compresión Gzip exitosa: ${compressionRatio.toFixed(1)}% reducción`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en compresión Gzip: ${errorMessage}`);
      throw new Error(`Gzip compression failed: ${errorMessage}`);
    }
  }

  async decompress(filePath: string, outputPath: string): Promise<string> {
    try {
      const compressedBuffer = await fs.readFile(filePath);
      const decompressedBuffer = await gunzip(compressedBuffer);
      await fs.writeFile(outputPath, decompressedBuffer);
      
      this.logger.success(`✅ Descompresión Gzip exitosa: ${outputPath}`);
      return outputPath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en descompresión Gzip: ${errorMessage}`);
      throw new Error(`Gzip decompression failed: ${errorMessage}`);
    }
  }

  async analyze(filePath: string): Promise<{
    bestAlgorithm: string;
    estimatedRatio: number;
    processingTime: number;
    recommendations: string[];
  }> {
    const startTime = Date.now();
    
    try {
      const fileBuffer = await fs.readFile(filePath);
      const originalSize = fileBuffer.length;
      
      // Analizar contenido para estimar ratio
      const estimatedRatio = this.estimateCompressionRatio(fileBuffer);
      
      // Probar diferentes niveles
      const testLevels = [1, 6, 9];
      const testResults = await Promise.all(
        testLevels.map(async (level) => {
          const start = Date.now();
          const compressed = await gzip(fileBuffer, { level });
          const processingTime = Date.now() - start;
          const ratio = ((originalSize - compressed.length) / originalSize) * 100;
          
          return { level, ratio, processingTime };
        })
      );
      
      // Encontrar mejor nivel
      const bestResult = testResults.reduce((best, current) => 
        current.ratio > best.ratio ? current : best
      );
      
      const recommendations = this.generateRecommendations(fileBuffer, bestResult);
      
      return {
        bestAlgorithm: 'gzip',
        estimatedRatio: bestResult.ratio,
        processingTime: Date.now() - startTime,
        recommendations
      };
      
    } catch (error) {
      this.logger.error(`❌ Error analizando archivo: ${error}`);
      return {
        bestAlgorithm: 'gzip',
        estimatedRatio: 20, // Estimación conservadora
        processingTime: Date.now() - startTime,
        recommendations: ['Usar nivel 6 para balance entre velocidad y compresión']
      };
    }
  }

  async benchmark(filePath: string): Promise<Record<string, CompressionResult>> {
    const results: Record<string, CompressionResult> = {};
    
    try {
      const testLevels = [1, 3, 6, 9];
      
      for (const level of testLevels) {
        const options: CompressionOptions = {
          algorithm: 'gzip',
          level,
          preserveMetadata: true,
          adaptiveCompression: false,
          parallelProcessing: false,
          memoryLimit: 1024 * 1024 * 100, // 100MB
          quality: level
        };
        
        const result = await this.compress(filePath, options);
        results[`gzip-level-${level}`] = result;
      }
      
      return results;
      
    } catch (error) {
      this.logger.error(`❌ Error en benchmark: ${error}`);
      return results;
    }
  }

  async validate(filePath: string): Promise<boolean> {
    try {
      const buffer = await fs.readFile(filePath);
      
      // Verificar si es un archivo gzip válido
      return new Promise((resolve) => {
        const gunzip = zlib.createGunzip();
        let isValid = true;
        
        gunzip.on('error', () => {
          isValid = false;
        });
        
        gunzip.on('end', () => {
          resolve(isValid);
        });
        
        gunzip.write(buffer);
        gunzip.end();
      });
      
    } catch (error) {
      return false;
    }
  }

  private generateOutputPath(inputPath: string, extension: string): string {
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, path.extname(inputPath));
    return path.join(dir, `${name}.${extension}`);
  }

  private estimateCompressionRatio(buffer: Buffer): number {
    // Análisis simple del contenido para estimar compresibilidad
    const textContent = buffer.toString('utf8', 0, Math.min(buffer.length, 1000));
    
    // Contar caracteres repetidos
    const charCounts: Record<string, number> = {};
    for (const char of textContent) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }
    
    // Calcular entropía (menor entropía = mejor compresión)
    const totalChars = textContent.length;
    const entropy = Object.values(charCounts).reduce((sum, count) => {
      const probability = count / totalChars;
      return sum - probability * Math.log2(probability);
    }, 0);
    
    // Convertir entropía a ratio estimado (heurística)
    const maxEntropy = Math.log2(256); // 8 bits por byte
    const normalizedEntropy = entropy / maxEntropy;
    const estimatedRatio = (1 - normalizedEntropy) * 80; // Máximo 80% de compresión
    
    return Math.max(0, Math.min(80, estimatedRatio));
  }

  private generateRecommendations(buffer: Buffer, bestResult: any): string[] {
    const recommendations: string[] = [];
    
    if (bestResult.level === 1) {
      recommendations.push('Usar nivel 1 para máxima velocidad');
    } else if (bestResult.level === 9) {
      recommendations.push('Usar nivel 9 para máxima compresión');
    } else {
      recommendations.push('Usar nivel 6 para balance óptimo');
    }
    
    if (buffer.length > 10 * 1024 * 1024) { // > 10MB
      recommendations.push('Archivo grande detectado, considerar compresión paralela');
    }
    
    if (bestResult.ratio < 10) {
      recommendations.push('Baja compresibilidad detectada, considerar otros algoritmos');
    }
    
    return recommendations;
  }
} 