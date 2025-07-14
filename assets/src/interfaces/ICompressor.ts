/**
 * @fileoverview Interfaz avanzada para compressores del sistema de assets
 */

export interface CompressionResult {
  outputPath: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
  quality: number;
  processingTime: number;
  metadata: Record<string, any>;
}

export interface CompressionOptions {
  algorithm: 'gzip' | 'brotli' | 'lz4' | 'zstd' | 'deflate';
  level: number;
  preserveMetadata: boolean;
  adaptiveCompression: boolean;
  parallelProcessing: boolean;
  memoryLimit: number;
  quality: number;
  format?: string;
  customParams?: Record<string, any>;
}

export interface ICompressor {
  name: string;
  version: string;
  supportedAlgorithms: string[];
  supportedFormats: string[];
  
  compress(filePath: string, options: CompressionOptions): Promise<CompressionResult>;
  decompress(filePath: string, outputPath: string): Promise<string>;
  analyze(filePath: string): Promise<{
    bestAlgorithm: string;
    estimatedRatio: number;
    processingTime: number;
    recommendations: string[];
  }>;
  benchmark(filePath: string): Promise<Record<string, CompressionResult>>;
  validate(filePath: string): Promise<boolean>;
} 