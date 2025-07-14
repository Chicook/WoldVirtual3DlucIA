/**
 * Declaraciones de tipos para las utilidades JavaScript del editor 3D
 * Proporciona tipos TypeScript para las clases y funciones JavaScript
 */

import * as THREE from 'three';

// Tipos para EditorCore
export interface EditorCore {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: any;
  selectedObjects: Set<THREE.Object3D>;
  objectCounter: number;
  isInitialized: boolean;
  
  initialize(container: HTMLElement): void;
  addObject(object: THREE.Object3D): void;
  removeObject(object: THREE.Object3D): void;
  cleanup(): void;
  render(): void;
}

// Tipos para ObjectCreators
export interface ObjectCreators {
  defaultMaterial: THREE.Material;
  
  createCube(width?: number, height?: number, depth?: number, material?: THREE.Material): THREE.Mesh;
  createSphere(radius?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createCylinder(radius?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createPlane(width?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
  createCone(radius?: number, height?: number, segments?: number, material?: THREE.Material): THREE.Mesh;
}

// Tipos para TransformTools
export interface TransformTools {
  controls: any;
  mode: 'translate' | 'rotate' | 'scale';
  target: THREE.Object3D | null;
  
  setupTransformControls(camera: THREE.Camera, renderer: THREE.Renderer): void;
  setMode(mode: 'translate' | 'rotate' | 'scale'): void;
  setTarget(target: THREE.Object3D | null): void;
  update(): void;
  dispose(): void;
}

// Tipos para SelectionHelpers
export interface SelectionHelpers {
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  selectedObjects: Set<THREE.Object3D>;
  
  setupRaycaster(camera: THREE.Camera, renderer: THREE.Renderer): void;
  selectObjectFromEvent(event: MouseEvent): THREE.Object3D | null;
  selectObjectsInRect(start: THREE.Vector2, end: THREE.Vector2): THREE.Object3D[];
  clearSelection(): void;
}

// Tipos para NavigationHelpers
export interface NavigationHelpers {
  camera: THREE.Camera | null;
  controls: any;
  scene: THREE.Scene | null;
  renderer: THREE.Renderer | null;
  
  setupNavigation(camera: THREE.Camera, renderer: THREE.Renderer, scene: THREE.Scene): void;
  setTarget(target: THREE.Vector3): void;
  focusOnObject(object: THREE.Object3D): void;
  resetView(): void;
  update(): void;
}

// Instancias globales
export declare const editorCore: EditorCore;
export declare const objectCreators: ObjectCreators;
export declare const transformTools: TransformTools;
export declare const selectionHelpers: SelectionHelpers;
export declare const navigationHelpers: NavigationHelpers; 