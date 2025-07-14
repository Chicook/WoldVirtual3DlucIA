/**
 * @fileoverview Interfaz avanzada para validadores del sistema de assets
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata: Record<string, any>;
  securityScore: number;
  compatibility: Record<string, boolean>;
  recommendations: string[];
}

export interface ValidationOptions {
  maxFileSize: number;
  allowedFormats: string[];
  virusScan: boolean;
  integrityCheck: boolean;
  metadataValidation: boolean;
  securityScan: boolean;
  formatValidation: boolean;
  customRules?: Record<string, any>;
}

export interface IValidator {
  name: string;
  version: string;
  supportedValidations: string[];
  
  validate(filePath: string, options: ValidationOptions): Promise<ValidationResult>;
  validateBatch(filePaths: string[], options: ValidationOptions): Promise<ValidationResult[]>;
  getFileInfo(filePath: string): Promise<{
    size: number;
    format: string;
    mimeType: string;
    hash: string;
    metadata: Record<string, any>;
  }>;
  checkIntegrity(filePath: string, expectedHash: string): Promise<boolean>;
  scanForViruses(filePath: string): Promise<{
    clean: boolean;
    threats: string[];
    scanTime: number;
  }>;
  validateMetadata(filePath: string, schema: any): Promise<{
    valid: boolean;
    errors: string[];
    missing: string[];
  }>;
} 