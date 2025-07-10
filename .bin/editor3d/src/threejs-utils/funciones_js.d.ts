/**
 * Declaraciones TypeScript para helpers JavaScript del editor 3D
 * Define los tipos para todas las clases y funciones exportadas
 */

import * as THREE from 'three';

// EditorCore
export declare class EditorCore {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: any;
  selectedObjects: Set<THREE.Object3D>;
  objectCounter: number;
  isInitialized: boolean;
  
  constructor();
  initialize(container: HTMLElement): void;
  render(): void;
  addObject(object: THREE.Object3D): void;
  removeObject(object: THREE.Object3D): void;
  selectObject(object: THREE.Object3D): void;
  deselectObject(object: THREE.Object3D): void;
  dispose(): void;
}

// ObjectCreators
export declare class ObjectCreators {
  defaultMaterial: THREE.Material;
  
  constructor();
  createCube(width?: number, height?: number, depth?: number, material?: THREE.Material): THREE.Mesh;
  createSphere(radius?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createCylinder(radius?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createCone(radius?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createPlane(width?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createTorus(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, material?: THREE.Material): THREE.Mesh;
  createBox(width?: number, height?: number, depth?: number, material?: THREE.Material): THREE.Mesh;
  createPyramid(baseSize?: number, height?: number, material?: THREE.Material): THREE.Mesh;
  createPrism(baseSize?: number, height?: number, sides?: number, material?: THREE.Material): THREE.Mesh;
  createCustomGeometry(vertices: number[], indices: number[], material?: THREE.Material): THREE.Mesh;
}

// TransformTools
export declare class TransformTools {
  transformMode: 'translate' | 'rotate' | 'scale';
  transformControls: any;
  snapEnabled: boolean;
  snapValue: number;
  
  constructor();
  initialize(camera: THREE.Camera, renderer: THREE.Renderer): void;
  setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void;
  attachToObject(object: THREE.Object3D): void;
  detachFromObject(): void;
  setSnapEnabled(enabled: boolean): void;
  setSnapValue(value: number): void;
  update(): void;
  dispose(): void;
}

// SelectionHelpers
export declare class SelectionHelpers {
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  selectedObjects: Set<THREE.Object3D>;
  highlightMaterial: THREE.Material;
  originalMaterials: Map<THREE.Object3D, THREE.Material>;
  selectionBox: any;
  isSelecting: boolean;
  
  constructor();
  setup(camera: THREE.Camera, renderer: THREE.Renderer): void;
  onMouseMove(event: MouseEvent): void;
  onMouseDown(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
  selectObject(object: THREE.Object3D): void;
  deselectObject(object: THREE.Object3D): void;
  clearSelection(): void;
  getSelectedObjects(): THREE.Object3D[];
  highlightObject(object: THREE.Object3D): void;
  removeHighlight(object: THREE.Object3D): void;
  cleanup(): void;
}

// NavigationHelpers
export declare class NavigationHelpers {
  camera: THREE.Camera;
  controls: any;
  scene: THREE.Scene;
  renderer: THREE.Renderer;
  target: THREE.Vector3;
  navigationMode: string;
  snapEnabled: boolean;
  
  constructor();
  initialize(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.Renderer): void;
  setNavigationMode(mode: string): void;
  setTarget(target: THREE.Vector3): void;
  focusOnObject(object: THREE.Object3D): void;
  resetCamera(): void;
  setSnapEnabled(enabled: boolean): void;
  update(): void;
  dispose(): void;
}

// MaterialHelpers
export declare class MaterialHelpers {
  materialLibrary: Map<string, THREE.Material>;
  textureLoader: THREE.TextureLoader;
  cubeTextureLoader: THREE.CubeTextureLoader;
  defaultMaterials: any;
  materialCounter: number;
  
  constructor();
  createStandardMaterial(options?: any): THREE.MeshStandardMaterial;
  createBasicMaterial(options?: any): THREE.MeshBasicMaterial;
  createPhongMaterial(options?: any): THREE.MeshPhongMaterial;
  createLambertMaterial(options?: any): THREE.MeshLambertMaterial;
  createToonMaterial(options?: any): THREE.MeshToonMaterial;
  createShaderMaterial(vertexShader: string, fragmentShader: string, uniforms?: any): THREE.ShaderMaterial;
  loadTexture(url: string): Promise<THREE.Texture>;
  applyMaterialToObject(object: THREE.Object3D, material: THREE.Material): void;
  saveMaterial(name: string, material: THREE.Material): void;
  getMaterial(name: string): THREE.Material | undefined;
  initialize(): void;
  cleanup(): void;
}

// LightingHelpers
export declare class LightingHelpers {
  lights: Map<string, THREE.Light>;
  shadowMapEnabled: boolean;
  ambientLight: THREE.AmbientLight | null;
  directionalLight: THREE.DirectionalLight | null;
  hemisphereLight: THREE.HemisphereLight | null;
  fog: THREE.Fog | null;
  
  constructor();
  setupBasicLighting(scene: THREE.Scene, renderer: THREE.Renderer): void;
  createAmbientLight(color?: number, intensity?: number): THREE.AmbientLight;
  createDirectionalLight(color?: number, intensity?: number, position?: THREE.Vector3): THREE.DirectionalLight;
  createPointLight(color?: number, intensity?: number, distance?: number, position?: THREE.Vector3): THREE.PointLight;
  createSpotLight(color?: number, intensity?: number, distance?: number, angle?: number, penumbra?: number, position?: THREE.Vector3): THREE.SpotLight;
  createHemisphereLight(skyColor?: number, groundColor?: number, intensity?: number): THREE.HemisphereLight;
  addLightToScene(scene: THREE.Scene, light: THREE.Light, name?: string): void;
  removeLightFromScene(scene: THREE.Scene, name: string): void;
  setShadowMapEnabled(enabled: boolean, renderer: THREE.Renderer): void;
  createFog(color?: number, near?: number, far?: number): THREE.Fog;
  cleanup(): void;
}

// AnimationHelpers
export declare class AnimationHelpers {
  animations: Map<string, THREE.AnimationClip>;
  mixer: THREE.AnimationMixer | null;
  clock: THREE.Clock;
  timeline: any[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  loop: boolean;
  keyframes: Map<string, any[]>;
  
  constructor();
  createKeyframeAnimation(object: THREE.Object3D, property: string, keyframes: any[], duration: number): THREE.AnimationClip;
  addAnimation(name: string, animation: THREE.AnimationClip): void;
  playAnimation(name: string): void;
  stopAnimation(): void;
  pauseAnimation(): void;
  setLoop(loop: boolean): void;
  setDuration(duration: number): void;
  addKeyframe(time: number, object: THREE.Object3D, property: string, value: any): void;
  removeKeyframe(time: number, object: THREE.Object3D, property: string): void;
  update(): void;
  initialize(): void;
  cleanup(): void;
}

// ExportHelpers
export declare class ExportHelpers {
  supportedFormats: string[];
  
  constructor();
  exportToGLTF(scene: THREE.Scene, options?: any): Promise<Blob>;
  exportToOBJ(scene: THREE.Scene, options?: any): Promise<string>;
  exportToSTL(scene: THREE.Scene, options?: any): Promise<Blob>;
  exportToFBX(scene: THREE.Scene, options?: any): Promise<Blob>;
  importFromGLTF(url: string): Promise<THREE.Scene>;
  importFromOBJ(url: string): Promise<THREE.Scene>;
  importFromSTL(url: string): Promise<THREE.Scene>;
  importFromFBX(url: string): Promise<THREE.Scene>;
  downloadFile(blob: Blob, filename: string): void;
  getSupportedFormats(): string[];
}

// MathHelpers
export declare class MathHelpers {
  snapEnabled: boolean;
  snapValue: number;
  snapAngle: number;
  snapDistance: number;
  precision: number;
  
  constructor();
  snapToGrid(value: number, snapValue?: number): number;
  snapVectorToGrid(vector: THREE.Vector3, snapValue?: number): THREE.Vector3;
  snapRotationToAngle(rotation: THREE.Euler, angle?: number): THREE.Euler;
  snapScaleToGrid(scale: THREE.Vector3, snapValue?: number): THREE.Vector3;
  clamp(value: number, min: number, max: number): number;
  clampVector(vector: THREE.Vector3, min: THREE.Vector3, max: THREE.Vector3): THREE.Vector3;
  lerp(start: number, end: number, factor: number): number;
  lerpVector(start: THREE.Vector3, end: THREE.Vector3, factor: number): THREE.Vector3;
  distance(point1: THREE.Vector3, point2: THREE.Vector3): number;
  angleBetweenVectors(vector1: THREE.Vector3, vector2: THREE.Vector3): number;
  setSnapEnabled(enabled: boolean): void;
  setSnapValue(value: number): void;
  setSnapAngle(angle: number): void;
}

// TextureHelpers
export declare class TextureHelpers {
  textureLoader: THREE.TextureLoader;
  cubeTextureLoader: THREE.CubeTextureLoader;
  textureCache: Map<string, THREE.Texture>;
  textureQueue: any[];
  maxTextureSize: number;
  compressionEnabled: boolean;
  mipmapEnabled: boolean;
  
  constructor();
  loadTexture(url: string, options?: any): Promise<THREE.Texture>;
  loadCubeTexture(urls: string[]): Promise<THREE.CubeTexture>;
  applyTextureToMaterial(material: THREE.Material, texture: THREE.Texture, type?: string): void;
  createUVMap(geometry: THREE.BufferGeometry, mapping?: THREE.Mapping): void;
  optimizeTexture(texture: THREE.Texture, maxSize?: number): THREE.Texture;
  compressTexture(texture: THREE.Texture, quality?: number): Promise<THREE.Texture>;
  generateMipmaps(texture: THREE.Texture): void;
  setTextureFiltering(texture: THREE.Texture, filter: THREE.TextureFilter): void;
  setTextureWrapping(texture: THREE.Texture, wrap: THREE.Wrapping): void;
  disposeTexture(texture: THREE.Texture): void;
  initialize(): void;
  cleanup(): void;
} 