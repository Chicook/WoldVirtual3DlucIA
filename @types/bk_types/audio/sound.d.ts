// sound.d.ts
/**
 * Tipos para sonidos individuales
 */
export interface Sound {
  id: string;
  url: string;
  volume: number;
  loop?: boolean;
} 