/**
 * Tipos para texturas
 */
export interface Texture {
  id: string;
  url: string;
  type: 'diffuse' | 'normal' | 'specular';
} 