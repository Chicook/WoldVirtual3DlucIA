/**
 * @fileoverview Interfaz avanzada para uploaders del sistema de assets
 */

export interface UploadResult {
  url: string;
  hash: string;
  size: number;
  metadata: Record<string, any>;
  timestamp: Date;
  expiresAt?: Date;
  accessToken?: string;
}

export interface UploadOptions {
  platform: 'ipfs' | 'arweave' | 'aws' | 'local';
  public?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  encryption?: {
    enabled: boolean;
    algorithm?: string;
    key?: string;
  };
  compression?: {
    enabled: boolean;
    algorithm?: string;
    level?: number;
  };
  retry?: {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
  progress?: (percentage: number, stage: string) => void;
}

export interface IUploader {
  name: string;
  version: string;
  supportedFormats: string[];
  maxFileSize: number;
  
  upload(filePath: string, options: UploadOptions): Promise<UploadResult>;
  delete(assetId: string): Promise<boolean>;
  getInfo(assetId: string): Promise<UploadResult | null>;
  updateMetadata(assetId: string, metadata: Record<string, any>): Promise<boolean>;
  validateConnection(): Promise<boolean>;
  getQuota(): Promise<{ used: number; total: number; remaining: number }>;
} 