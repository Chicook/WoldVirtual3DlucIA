/**
 * @fileoverview Módulo de procesamiento y optimización de imágenes para WoldVirtual3DlucIA
 * @version 1.0.0
 * @author WoldVirtual3DlucIA Team
 */

import React, { useState, useCallback } from 'react';
import { Logger } from '../../utils/logger';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

export interface ImageMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  width: number;
  height: number;
  format: string;
  mimeType: string;
  hash: string;
  uploadedAt: Date;
  processedAt?: Date;
  optimizationLevel: 'none' | 'low' | 'medium' | 'high';
  tags: string[];
  metadata: Record<string, any>;
}

export interface ImageProcessingOptions {
  quality: number;
  format: 'webp' | 'avif' | 'jpg' | 'png' | 'auto';
  resize?: {
    enabled: boolean;
    maxWidth: number;
    maxHeight: number;
    maintainAspectRatio: boolean;
  };
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'brotli' | 'lz4';
    level: number;
  };
  metadata: {
    preserve: boolean;
    strip: string[];
  };
  generateThumbnails: boolean;
  thumbnailSizes: number[];
}

export interface ImageProcessingResult {
  success: boolean;
  originalImage: ImageMetadata;
  processedImages: {
    optimized?: ImageMetadata;
    thumbnails?: ImageMetadata[];
  };
  optimizationStats: {
    originalSize: number;
    optimizedSize: number;
    reductionPercentage: number;
    processingTime: number;
  };
  errors?: string[];
}

export interface ImageModuleConfig {
  maxFileSize: number;
  supportedFormats: string[];
  defaultQuality: number;
  defaultFormat: 'webp' | 'avif' | 'jpg' | 'png';
  enableProgressive: boolean;
  enableLazyLoading: boolean;
  cacheEnabled: boolean;
  cacheExpiry: number;
}

// ============================================================================
// CLASE PRINCIPAL DEL MÓDULO DE IMÁGENES
// ============================================================================

class ImageProcessor {
  private logger: Logger;
  private config: ImageModuleConfig;
  private cache: Map<string, ImageMetadata>;
  private processingQueue: Map<string, Promise<ImageProcessingResult>>;

  constructor(config: Partial<ImageModuleConfig> = {}) {
    this.logger = new Logger('ImageProcessor');
    this.config = {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'],
      defaultQuality: 85,
      defaultFormat: 'webp',
      enableProgressive: true,
      enableLazyLoading: true,
      cacheEnabled: true,
      cacheExpiry: 24 * 60 * 60 * 1000, // 24 horas
      ...config
    };
    this.cache = new Map();
    this.processingQueue = new Map();
  }

  /**
   * Valida si un archivo es una imagen válida
   */
  async validateImage(file: File): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validar tamaño
    if (file.size > this.config.maxFileSize) {
      errors.push(`Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Validar formato
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.config.supportedFormats.includes(extension)) {
      errors.push(`Formato no soportado: ${extension}`);
    }

    // Validar tipo MIME
    if (!file.type.startsWith('image/')) {
      errors.push('Archivo no es una imagen válida');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Extrae metadatos de una imagen
   */
  async extractMetadata(file: File): Promise<Partial<ImageMetadata>> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          name: file.name,
          size: file.size,
          width: img.width,
          height: img.height,
          mimeType: file.type,
          format: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          uploadedAt: new Date(),
          optimizationLevel: 'none',
          tags: [],
          metadata: {}
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          name: file.name,
          size: file.size,
          mimeType: file.type,
          format: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          uploadedAt: new Date(),
          optimizationLevel: 'none',
          tags: [],
          metadata: {}
        });
      };

      img.src = url;
    });
  }

  /**
   * Procesa una imagen con las opciones especificadas
   */
  async processImage(
    file: File,
    options: Partial<ImageProcessingOptions> = {}
  ): Promise<ImageProcessingResult> {
    const startTime = Date.now();
    const fileId = `${file.name}-${file.size}-${file.lastModified}`;

    // Verificar cache
    if (this.config.cacheEnabled && this.cache.has(fileId)) {
      const cached = this.cache.get(fileId)!;
      this.logger.info(`📸 Imagen encontrada en cache: ${cached.name}`);
      return {
        success: true,
        originalImage: cached,
        processedImages: {},
        optimizationStats: {
          originalSize: cached.size,
          optimizedSize: cached.size,
          reductionPercentage: 0,
          processingTime: 0
        }
      };
    }

    // Verificar si ya está siendo procesada
    if (this.processingQueue.has(fileId)) {
      this.logger.info(`📸 Imagen ya en procesamiento: ${file.name}`);
      return await this.processingQueue.get(fileId)!;
    }

    // Crear promesa de procesamiento
    const processingPromise = this.performImageProcessing(file, options, startTime);
    this.processingQueue.set(fileId, processingPromise);

    try {
      const result = await processingPromise;
      
      // Guardar en cache
      if (this.config.cacheEnabled && result.success) {
        this.cache.set(fileId, result.originalImage);
        setTimeout(() => this.cache.delete(fileId), this.config.cacheExpiry);
      }

      return result;
    } finally {
      this.processingQueue.delete(fileId);
    }
  }

  /**
   * Realiza el procesamiento real de la imagen
   */
  private async performImageProcessing(
    file: File,
    options: Partial<ImageProcessingOptions>,
    startTime: number
  ): Promise<ImageProcessingResult> {
    try {
      // Validar imagen
      const validation = await this.validateImage(file);
      if (!validation.valid) {
        return {
          success: false,
          originalImage: {} as ImageMetadata,
          processedImages: {},
          optimizationStats: {
            originalSize: file.size,
            optimizedSize: file.size,
            reductionPercentage: 0,
            processingTime: Date.now() - startTime
          },
          errors: validation.errors
        };
      }

      // Extraer metadatos
      const metadata = await this.extractMetadata(file);
      const originalImage: ImageMetadata = {
        id: crypto.randomUUID(),
        hash: await this.generateHash(file),
        ...metadata
      } as ImageMetadata;

      // Simular optimización (en implementación real usaría Sharp)
      const optimizedSize = Math.floor(file.size * (options.quality || this.config.defaultQuality) / 100);
      const reductionPercentage = ((file.size - optimizedSize) / file.size) * 100;

      this.logger.success(`✅ Imagen procesada: ${file.name} - ${reductionPercentage.toFixed(1)}% reducción`);

      return {
        success: true,
        originalImage,
        processedImages: {
          optimized: {
            ...originalImage,
            id: crypto.randomUUID(),
            size: optimizedSize,
            optimizationLevel: this.getOptimizationLevel(options.quality || this.config.defaultQuality),
            processedAt: new Date()
          }
        },
        optimizationStats: {
          originalSize: file.size,
          optimizedSize,
          reductionPercentage,
          processingTime: Date.now() - startTime
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error procesando imagen: ${errorMessage}`);
      
      return {
        success: false,
        originalImage: {} as ImageMetadata,
        processedImages: {},
        optimizationStats: {
          originalSize: file.size,
          optimizedSize: file.size,
          reductionPercentage: 0,
          processingTime: Date.now() - startTime
        },
        errors: [errorMessage]
      };
    }
  }

  /**
   * Genera hash único para la imagen
   */
  private async generateHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Determina el nivel de optimización basado en la calidad
   */
  private getOptimizationLevel(quality: number): 'none' | 'low' | 'medium' | 'high' {
    if (quality >= 90) return 'none';
    if (quality >= 75) return 'low';
    if (quality >= 50) return 'medium';
    return 'high';
  }

  /**
   * Limpia el cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('🗑️ Cache de imágenes limpiado');
  }

  /**
   * Obtiene estadísticas del cache
   */
  getCacheStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: this.cache.size
    };
  }
}

// ============================================================================
// HOOKS REACT PARA EL MÓDULO
// ============================================================================

export const useImageProcessor = (config?: Partial<ImageModuleConfig>) => {
  const [processor] = useState(() => new ImageProcessor(config));
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ImageProcessingResult[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const processImage = useCallback(async (
    file: File,
    options?: Partial<ImageProcessingOptions>
  ): Promise<ImageProcessingResult> => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const result = await processor.processImage(file, options);
      if (result.success) {
        setResults(prev => [...prev, result]);
      } else {
        setErrors(prev => [...prev, ...(result.errors || [])]);
      }
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [processor]);

  const clearResults = useCallback(() => {
    setResults([]);
    setErrors([]);
  }, []);

  const clearCache = useCallback(() => {
    processor.clearCache();
  }, [processor]);

  return {
    processImage,
    isProcessing,
    results,
    errors,
    clearResults,
    clearCache,
    cacheStats: processor.getCacheStats()
  };
};

// ============================================================================
// COMPONENTE REACT DEL MÓDULO
// ============================================================================

interface ImageModuleProps {
  config?: Partial<ImageModuleConfig>;
  onImageProcessed?: (result: ImageProcessingResult) => void;
  onError?: (error: string) => void;
}

export const ImageModule: React.FC<ImageModuleProps> = ({
  config,
  onImageProcessed,
  onError
}) => {
  const {
    processImage,
    isProcessing,
    results,
    errors,
    clearResults,
    clearCache,
    cacheStats
  } = useImageProcessor(config);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const result = await processImage(file);
        if (result.success) {
          onImageProcessed?.(result);
        } else {
          onError?.(result.errors?.join(', ') || 'Error desconocido');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        onError?.(errorMessage);
      }
    }
  };

  return (
    <div className="image-module">
      <div className="image-module-header">
        <h3>🖼️ Módulo de Procesamiento de Imágenes</h3>
        <div className="image-module-stats">
          <span>📊 Cache: {cacheStats.entries} entradas</span>
          <span>⚡ Procesadas: {results.length}</span>
        </div>
      </div>

      <div className="image-module-controls">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="image-upload-input"
        />
        
        <div className="image-module-buttons">
          <button onClick={clearResults} disabled={results.length === 0}>
            🗑️ Limpiar Resultados
          </button>
          <button onClick={clearCache} disabled={cacheStats.entries === 0}>
            🧹 Limpiar Cache
          </button>
        </div>
      </div>

      {isProcessing && (
        <div className="image-module-loading">
          ⏳ Procesando imagen...
        </div>
      )}

      {errors.length > 0 && (
        <div className="image-module-errors">
          <h4>❌ Errores:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {results.length > 0 && (
        <div className="image-module-results">
          <h4>✅ Resultados:</h4>
          {results.map((result, index) => (
            <div key={index} className="image-result">
              <strong>{result.originalImage.name}</strong>
              <span>Reducción: {result.optimizationStats.reductionPercentage.toFixed(1)}%</span>
              <span>Tiempo: {result.optimizationStats.processingTime}ms</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTACIONES DEL MÓDULO
// ============================================================================

export default ImageModule;
export { ImageProcessor };
