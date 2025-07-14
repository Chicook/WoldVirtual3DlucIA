/**
 * Tipos para modelos 3D
 */
export interface Model3D {
  id: string;
  name: string;
  url: string;
  format: 'gltf' | 'obj' | 'fbx';
} 