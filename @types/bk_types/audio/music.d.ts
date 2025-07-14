/**
 * Tipos para música de fondo
 */
export interface Music {
  id: string;
  url: string;
  artist?: string;
  album?: string;
  loop?: boolean;
} 