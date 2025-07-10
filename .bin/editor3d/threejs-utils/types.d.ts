/**
 * Type Definitions for Three.js Editor JavaScript Functions
 * Definiciones de tipos para las funciones JavaScript del editor 3D
 */

import * as THREE from 'three';

// EditorCore
export declare class EditorCore {
  constructor();
  initialize(container: HTMLElement): void;
  addObject(object: THREE.Object3D): void;
  removeObject(object: THREE.Object3D): void;
  selectObject(object: THREE.Object3D): void;
  deselectObject(object: THREE.Object3D): void;
  clearSelection(): void;
  render(): void;
  dispose(): void;
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
}

// ObjectCreators
export declare class ObjectCreators {
  constructor();
  createCube(width?: number, height?: number, depth?: number, material?: THREE.Material): THREE.Mesh;
  createSphere(radius?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createCylinder(radius?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createCone(radius?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createPlane(width?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createTorus(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, material?: THREE.Material): THREE.Mesh;
  createOctahedron(radius?: number, detail?: number, material?: THREE.Material): THREE.Mesh;
  createTetrahedron(radius?: number, detail?: number, material?: THREE.Material): THREE.Mesh;
  createIcosahedron(radius?: number, detail?: number, material?: THREE.Material): THREE.Mesh;
  createDodecahedron(radius?: number, detail?: number, material?: THREE.Material): THREE.Mesh;
}

// TransformTools
export declare class TransformTools {
  constructor();
  setupTransformControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void;
  setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void;
  attachToObject(object: THREE.Object3D): void;
  detachFromObject(): void;
  setSnapEnabled(enabled: boolean): void;
  setSnapValue(value: number): void;
  cleanup(): void;
}

// SelectionHelpers
export declare class SelectionHelpers {
  constructor();
  setup(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void;
  selectObject(object: THREE.Object3D): void;
  deselectObject(object: THREE.Object3D): void;
  clearSelection(): void;
  getSelectedObjects(): THREE.Object3D[];
  isSelected(object: THREE.Object3D): boolean;
  cleanup(): void;
}

// NavigationHelpers
export declare class NavigationHelpers {
  constructor();
  initialize(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer): void;
  setupOrbitControls(): void;
  setupPanControls(): void;
  setupZoomControls(): void;
  focusOnObject(object: THREE.Object3D): void;
  resetCamera(): void;
  cleanup(): void;
}

// MaterialHelpers
export declare class MaterialHelpers {
  constructor();
  initialize(): void;
  createBasicMaterial(color?: THREE.Color, opacity?: number): THREE.MeshBasicMaterial;
  createLambertMaterial(color?: THREE.Color, opacity?: number): THREE.MeshLambertMaterial;
  createPhongMaterial(color?: THREE.Color, opacity?: number): THREE.MeshPhongMaterial;
  createStandardMaterial(color?: THREE.Color, metalness?: number, roughness?: number): THREE.MeshStandardMaterial;
  createPhysicalMaterial(color?: THREE.Color, metalness?: number, roughness?: number): THREE.MeshPhysicalMaterial;
  createToonMaterial(color?: THREE.Color): THREE.MeshToonMaterial;
  createShaderMaterial(vertexShader: string, fragmentShader: string, uniforms?: object): THREE.ShaderMaterial;
  cleanup(): void;
}

// LightingHelpers
export declare class LightingHelpers {
  constructor();
  setupBasicLighting(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void;
  addAmbientLight(color?: THREE.Color, intensity?: number): THREE.AmbientLight;
  addDirectionalLight(color?: THREE.Color, intensity?: number, position?: THREE.Vector3): THREE.DirectionalLight;
  addPointLight(color?: THREE.Color, intensity?: number, position?: THREE.Vector3): THREE.PointLight;
  addSpotLight(color?: THREE.Color, intensity?: number, position?: THREE.Vector3): THREE.SpotLight;
  addHemisphereLight(skyColor?: THREE.Color, groundColor?: THREE.Color, intensity?: number): THREE.HemisphereLight;
  cleanup(): void;
}

// AnimationHelpers
export declare class AnimationHelpers {
  constructor();
  initialize(): void;
  createAnimation(name: string, duration?: number): any;
  addKeyframe(animationName: string, time: number, object: THREE.Object3D, property: string, value: any, interpolation?: string): void;
  playAnimation(name: string): void;
  pauseAnimation(): void;
  stopAnimation(): void;
  update(deltaTime: number): void;
  createRotationAnimation(name: string, object: THREE.Object3D, duration?: number, axis?: string, angle?: number): any;
  createMovementAnimation(name: string, object: THREE.Object3D, startPosition: THREE.Vector3, endPosition: THREE.Vector3, duration?: number): any;
  createScaleAnimation(name: string, object: THREE.Object3D, startScale: THREE.Vector3, endScale: THREE.Vector3, duration?: number): any;
  exportAnimation(name: string): any;
  importAnimation(animationData: any): any;
  getAnimations(): string[];
  removeAnimation(name: string): void;
  cleanup(): void;
}

// ExportHelpers
export declare class ExportHelpers {
  constructor();
  exportToGLTF(scene: THREE.Scene, filename?: string): void;
  exportToOBJ(scene: THREE.Scene, filename?: string): void;
  exportToSTL(scene: THREE.Scene, filename?: string): void;
  exportToPLY(scene: THREE.Scene, filename?: string): void;
  exportToFBX(scene: THREE.Scene, filename?: string): void;
  exportToCollada(scene: THREE.Scene, filename?: string): void;
  exportToVRML(scene: THREE.Scene, filename?: string): void;
  exportToX3D(scene: THREE.Scene, filename?: string): void;
  exportToUSDZ(scene: THREE.Scene, filename?: string): void;
  exportToGLB(scene: THREE.Scene, filename?: string): void;
  exportToThreeJS(scene: THREE.Scene, filename?: string): void;
  exportToJSON(scene: THREE.Scene, filename?: string): void;
  exportToScreenshot(renderer: THREE.WebGLRenderer, filename?: string): void;
  exportToVideo(renderer: THREE.WebGLRenderer, duration?: number, filename?: string): void;
}

// MathHelpers
export declare class MathHelpers {
  constructor();
  clamp(value: number, min: number, max: number): number;
  lerp(start: number, end: number, factor: number): number;
  smoothstep(edge0: number, edge1: number, x: number): number;
  map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
  random(min: number, max: number): number;
  randomInt(min: number, max: number): number;
  randomChoice(array: any[]): any;
  randomColor(): THREE.Color;
  randomVector3(min: number, max: number): THREE.Vector3;
  randomRotation(): THREE.Euler;
  distance(point1: THREE.Vector3, point2: THREE.Vector3): number;
  angleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3): number;
  crossProduct(v1: THREE.Vector3, v2: THREE.Vector3): THREE.Vector3;
  dotProduct(v1: THREE.Vector3, v2: THREE.Vector3): number;
  normalizeVector(vector: THREE.Vector3): THREE.Vector3;
  rotateVector(vector: THREE.Vector3, axis: THREE.Vector3, angle: number): THREE.Vector3;
  createMatrix4(): THREE.Matrix4;
  createQuaternion(): THREE.Quaternion;
  createEuler(x?: number, y?: number, z?: number): THREE.Euler;
  createVector3(x?: number, y?: number, z?: number): THREE.Vector3;
  createVector2(x?: number, y?: number): THREE.Vector2;
  createColor(color?: string | number): THREE.Color;
}

// TextureHelpers
export declare class TextureHelpers {
  constructor();
  initialize(): void;
  loadTexture(url: string, options?: any): Promise<THREE.Texture>;
  loadCubeTexture(urls: string[], options?: any): Promise<THREE.CubeTexture>;
  createProceduralTexture(type: string, size?: number, options?: any): THREE.Texture;
  createNoiseTexture(size?: number, scale?: number): THREE.Texture;
  createGradientTexture(width?: number, height?: number, colors?: THREE.Color[]): THREE.Texture;
  createCheckerTexture(size?: number, color1?: THREE.Color, color2?: THREE.Color): THREE.Texture;
  createVoronoiTexture(size?: number, points?: number): THREE.Texture;
  createPerlinTexture(size?: number, scale?: number): THREE.Texture;
  createSimplexTexture(size?: number, scale?: number): THREE.Texture;
  createWorleyTexture(size?: number, scale?: number): THREE.Texture;
  applyTextureToMaterial(material: THREE.Material, texture: THREE.Texture, type?: string): void;
  optimizeTexture(texture: THREE.Texture, maxSize?: number): void;
  cleanup(): void;
}

// SceneHelpers
export declare class SceneHelpers {
  constructor();
  initializeScene(): void;
  addObject(object: THREE.Object3D, parent?: THREE.Object3D): void;
  removeObject(object: THREE.Object3D): void;
  createGroup(name?: string): THREE.Group;
  addToGroup(group: THREE.Group, object: THREE.Object3D): void;
  removeFromGroup(group: THREE.Group, object: THREE.Object3D): void;
  createLayer(name: string): void;
  addToLayer(layerName: string, object: THREE.Object3D): void;
  removeFromLayer(layerName: string, object: THREE.Object3D): void;
  setLayerVisibility(layerName: string, visible: boolean): void;
  getObjectsInLayer(layerName: string): THREE.Object3D[];
  getAllObjects(): THREE.Object3D[];
  clearScene(): void;
  saveScene(): any;
  loadScene(sceneData: any): void;
  cleanup(): void;
}

// RenderHelpers
export declare class RenderHelpers {
  constructor();
  initializeRenderer(container: HTMLElement): THREE.WebGLRenderer;
  setupPostProcessing(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer): void;
  addFXAA(): void;
  addBloom(): void;
  addSSAO(): void;
  addDOF(): void;
  addMotionBlur(): void;
  addChromaticAberration(): void;
  addVignette(): void;
  addFilmGrain(): void;
  addScanlines(): void;
  addGlitch(): void;
  setRenderQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void;
  enableShadows(renderer: THREE.WebGLRenderer): void;
  enableAntialiasing(renderer: THREE.WebGLRenderer): void;
  setBackgroundColor(color: THREE.Color): void;
  setBackgroundTexture(texture: THREE.Texture): void;
  setBackgroundCubeTexture(texture: THREE.CubeTexture): void;
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  cleanup(): void;
} 