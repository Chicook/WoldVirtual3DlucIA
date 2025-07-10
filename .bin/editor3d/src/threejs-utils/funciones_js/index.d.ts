/**
 * Declaraciones de tipos para las utilidades JavaScript del editor 3D
 */

import * as THREE from 'three';

// Clases principales
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
  addObject(object: THREE.Object3D): boolean;
  removeObject(object: THREE.Object3D): boolean;
  selectObject(object: THREE.Object3D): void;
  clearSelection(): void;
  render(): void;
  cleanup(): void;
}

export declare class ObjectCreators {
  defaultMaterial: THREE.Material;
  constructor();
  createCube(width?: number, height?: number, depth?: number, material?: THREE.Material): THREE.Mesh;
  createSphere(radius?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createCylinder(radiusTop?: number, radiusBottom?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createPlane(width?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createCone(radius?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createTorus(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, material?: THREE.Material): THREE.Mesh;
}

export declare class TransformTools {
  transformMode: string;
  snapEnabled: boolean;
  snapValue: number;
  pivotPoint: THREE.Vector3;
  transformControls: any;
  isActive: boolean;

  constructor();
  setupTransformControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer): any;
  setMode(mode: string): void;
  setTarget(object: THREE.Object3D | null): void;
  setTransformMode(mode: string): void;
  setSnap(enabled: boolean, value?: number): void;
  moveObject(object: THREE.Object3D, position: THREE.Vector3, snap?: boolean): boolean;
  rotateObject(object: THREE.Object3D, rotation: THREE.Euler, snap?: boolean): boolean;
  scaleObject(object: THREE.Object3D, scale: THREE.Vector3, snap?: boolean): boolean;
  duplicateObject(object: THREE.Object3D): THREE.Object3D | null;
  dispose(): void;
}

export declare class SelectionHelpers {
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  selectedObjects: Set<THREE.Object3D>;
  highlightMaterial: THREE.Material;
  originalMaterials: Map<THREE.Object3D, THREE.Material>;
  selectionBox: any;
  isSelecting: boolean;
  selectionStart: THREE.Vector2;
  selectionEnd: THREE.Vector2;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;

  constructor();
  setupRaycaster(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void;
  selectObject(object: THREE.Object3D, addToSelection?: boolean): boolean;
  selectObjectFromEvent(event: MouseEvent): THREE.Object3D | null;
  deselectObject(object: THREE.Object3D): void;
  clearSelection(): void;
  highlightObject(object: THREE.Object3D): void;
  removeHighlight(object: THREE.Object3D): void;
  dispose(): void;
}

export declare class NavigationHelpers {
  camera: THREE.Camera;
  controls: any;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  target: THREE.Vector3;
  navigationMode: string;
  snapEnabled: boolean;
  snapAngle: number;
  snapDistance: number;
  minDistance: number;
  maxDistance: number;
  zoomSpeed: number;
  panSpeed: number;
  rotateSpeed: number;

  constructor();
  setupNavigation(camera: THREE.Camera, renderer: THREE.WebGLRenderer, scene: THREE.Scene): void;
  setNavigationMode(mode: string): void;
  setTarget(target: THREE.Vector3): void;
  setSnap(enabled: boolean, angle?: number, distance?: number): void;
  focusOnObject(object: THREE.Object3D): void;
  resetView(): void;
  dispose(): void;
}

export declare class MaterialHelpers {
  materialLibrary: Map<string, THREE.Material>;
  textureLoader: THREE.TextureLoader;
  cubeTextureLoader: THREE.CubeTextureLoader;
  defaultMaterials: Record<string, THREE.Material>;
  materialCounter: number;

  constructor();
  createDefaultMaterials(): Record<string, THREE.Material>;
  createMaterial(type: string, options?: any): THREE.Material;
  loadTexture(url: string, options?: any): Promise<THREE.Texture>;
  applyMaterial(object: THREE.Object3D, material: THREE.Material): void;
  cloneMaterial(material: THREE.Material): THREE.Material;
  dispose(): void;
}

export declare class LightingHelpers {
  lights: Map<string, THREE.Light>;
  shadowMapEnabled: boolean;
  ambientLight: THREE.AmbientLight | null;
  directionalLight: THREE.DirectionalLight | null;
  hemisphereLight: THREE.HemisphereLight | null;
  fog: THREE.Fog | null;
  postProcessing: any;

  constructor();
  setupBasicLighting(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void;
  createAmbientLight(color?: number, intensity?: number): THREE.AmbientLight;
  createDirectionalLight(color?: number, intensity?: number, position?: THREE.Vector3): THREE.DirectionalLight;
  createPointLight(color?: number, intensity?: number, distance?: number, position?: THREE.Vector3): THREE.PointLight;
  createSpotLight(color?: number, intensity?: number, distance?: number, angle?: number, penumbra?: number, position?: THREE.Vector3): THREE.SpotLight;
  createHemisphereLight(skyColor?: number, groundColor?: number, intensity?: number): THREE.HemisphereLight;
  enableShadows(renderer: THREE.WebGLRenderer, enabled?: boolean): void;
  dispose(): void;
}

export declare class AnimationHelpers {
  animations: Map<string, THREE.AnimationClip>;
  mixer: THREE.AnimationMixer;
  clock: THREE.Clock;
  timeline: any[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  loop: boolean;
  keyframes: Map<string, any>;
  interpolationTypes: Record<string, string>;

  constructor();
  createAnimation(name: string, duration: number): THREE.AnimationClip;
  addKeyframe(object: THREE.Object3D, time: number, property: string, value: any): void;
  playAnimation(name: string, loop?: boolean): void;
  pauseAnimation(): void;
  stopAnimation(): void;
  setTime(time: number): void;
  exportAnimation(name: string, format?: string): any;
  dispose(): void;
}

export declare class ExportHelpers {
  gltfExporter: any;
  gltfLoader: any;
  objExporter: any;
  objLoader: any;
  fbxLoader: any;
  stlLoader: any;
  supportedFormats: string[];

  constructor();
  exportScene(scene: THREE.Scene, format: string, options?: any): Promise<any>;
  importModel(url: string, format: string): Promise<THREE.Object3D>;
  exportToGLTF(scene: THREE.Scene, options?: any): Promise<any>;
  exportToOBJ(scene: THREE.Scene, options?: any): Promise<string>;
  importFromGLTF(url: string): Promise<THREE.Object3D>;
  importFromOBJ(url: string): Promise<THREE.Object3D>;
  dispose(): void;
}

export declare class MathHelpers {
  snapEnabled: boolean;
  snapValue: number;
  snapAngle: number;
  snapDistance: number;
  precision: number;

  constructor();
  snapToGrid(value: number, snapValue?: number): number;
  snapVector(vector: THREE.Vector3, snapValue?: number): THREE.Vector3;
  snapEuler(euler: THREE.Euler, snapAngle?: number): THREE.Euler;
  interpolateVector(start: THREE.Vector3, end: THREE.Vector3, t: number): THREE.Vector3;
  interpolateEuler(start: THREE.Euler, end: THREE.Euler, t: number): THREE.Euler;
  distanceBetweenPoints(point1: THREE.Vector3, point2: THREE.Vector3): number;
  angleBetweenVectors(vector1: THREE.Vector3, vector2: THREE.Vector3): number;
  clamp(value: number, min: number, max: number): number;
  lerp(start: number, end: number, t: number): number;
  smoothstep(edge0: number, edge1: number, x: number): number;
}

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
  loadCubeTexture(urls: string[], options?: any): Promise<THREE.CubeTexture>;
  createProceduralTexture(type: string, options?: any): THREE.Texture;
  applyTexture(object: THREE.Object3D, texture: THREE.Texture, slot?: string): void;
  optimizeTexture(texture: THREE.Texture, maxSize?: number): void;
  dispose(): void;
}

// Instancias exportadas
export declare const editorCore: EditorCore;
export declare const objectCreators: ObjectCreators;
export declare const transformTools: TransformTools;
export declare const selectionHelpers: SelectionHelpers;
export declare const navigationHelpers: NavigationHelpers;
export declare const materialHelpers: MaterialHelpers;
export declare const lightingHelpers: LightingHelpers;
export declare const animationHelpers: AnimationHelpers;
export declare const exportHelpers: ExportHelpers;
export declare const mathHelpers: MathHelpers;
export declare const textureHelpers: TextureHelpers; 