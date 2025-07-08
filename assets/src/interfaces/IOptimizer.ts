/**
 * @fileoverview Interfaz avanzada para optimizadores del sistema de assets
 */

export interface OptimizationResult {
  outputPath: string;
  originalSize: number;
  optimizedSize: number;
  optimizationRatio: number;
  quality: number;
  processingTime: number;
  appliedTechniques: string[];
  metadata: Record<string, any>;
  warnings: string[];
}

export interface OptimizationOptions {
  quality: number;
  format: string;
  resize?: {
    enabled: boolean;
    maxWidth: number;
    maxHeight: number;
    maintainAspectRatio: boolean;
  };
  compression?: {
    enabled: boolean;
    algorithm: string;
    level: number;
  };
  metadata?: {
    preserve: boolean;
    strip: string[];
  };
  adaptive?: {
    enabled: boolean;
    targetSize: number;
    qualityRange: [number, number];
  };
  parallel?: boolean;
  customParams?: Record<string, any>;
}

export interface IOptimizer {
  name: string;
  version: string;
  supportedFormats: string[];
  supportedTechniques: string[];
  
  optimize(filePath: string, options: OptimizationOptions): Promise<OptimizationResult>;
  analyze(filePath: string): Promise<{
    recommendations: string[];
    estimatedSavings: number;
    bestSettings: OptimizationOptions;
    compatibility: Record<string, boolean>;
  }>;
  batchOptimize(filePaths: string[], options: OptimizationOptions): Promise<OptimizationResult[]>;
  validate(filePath: string): Promise<boolean>;
  getSupportedFormats(): string[];
} 