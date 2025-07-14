// Tipos personalizados para el Editor 3D

export interface SceneObject {
  id: string;
  name: string;
  type: 'mesh' | 'light' | 'camera' | 'group';
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  visible: boolean;
  userData?: Record<string, any>;
}

export interface MaterialProperties {
  type: 'MeshLambertMaterial' | 'MeshPhongMaterial' | 'MeshStandardMaterial';
  color: string;
  opacity: number;
  transparent: boolean;
  metalness?: number;
  roughness?: number;
}

export interface GeometryProperties {
  type: 'BoxGeometry' | 'SphereGeometry' | 'CylinderGeometry' | 'PlaneGeometry';
  parameters: Record<string, number>;
}

export interface Asset {
  id: string;
  name: string;
  type: 'model' | 'texture' | 'material' | 'sound';
  category: string;
  thumbnail: string;
  description: string;
  tags: string[];
  url?: string;
}

export interface EditorState {
  selectedObject: SceneObject | null;
  editMode: 'select' | 'translate' | 'rotate' | 'scale';
  sceneObjects: SceneObject[];
  camera: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
}

export interface SceneData {
  objects: SceneObject[];
  metadata: {
    name: string;
    created: string;
    version: string;
    description?: string;
  };
} 