/**
 * Tipos para configuración global del sistema
 */
export interface AppConfig {
  env: 'development' | 'production' | 'test';
  apiUrl: string;
  featureFlags?: Record<string, boolean>;
} 