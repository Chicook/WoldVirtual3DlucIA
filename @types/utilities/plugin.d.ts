/**
 * Tipos para plugins/extensiones del sistema
 */
export interface Plugin {
  name: string;
  version: string;
  enabled: boolean;
  init(): void;
} 