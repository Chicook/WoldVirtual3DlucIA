/**
 * Índice de utilidades JavaScript para el editor 3D
 * Exporta todas las clases y funciones necesarias para el funcionamiento del editor
 */

// Importar todas las utilidades
import { EditorCore } from './EditorCore.js';
import { ObjectCreators } from './ObjectCreators.js';
import { TransformTools } from './TransformTools.js';
import { SelectionHelpers } from './SelectionHelpers.js';
import { NavigationHelpers } from './NavigationHelpers.js';
import { MaterialHelpers } from './MaterialHelpers.js';
import { LightingHelpers } from './LightingHelpers.js';
import { AnimationHelpers } from './AnimationHelpers.js';
import { ExportHelpers } from './ExportHelpers.js';
import { MathHelpers } from './MathHelpers.js';
import { TextureHelpers } from './TextureHelpers.js';
import { SceneHelpers } from './SceneHelpers.js';
import { RenderHelpers } from './RenderHelpers.js';
import { PhysicsHelpers } from './PhysicsHelpers.js';
import { NetworkHelpers } from './NetworkHelpers.js';
import { AudioHelpers } from './AudioHelpers.js';

// Exportar todas las clases
export {
  EditorCore,
  ObjectCreators,
  TransformTools,
  SelectionHelpers,
  NavigationHelpers,
  MaterialHelpers,
  LightingHelpers,
  AnimationHelpers,
  ExportHelpers,
  MathHelpers,
  TextureHelpers,
  SceneHelpers,
  RenderHelpers,
  PhysicsHelpers,
  NetworkHelpers,
  AudioHelpers
};

// Exportar instancias por defecto para uso directo
export const editorCore = new EditorCore();
export const objectCreators = new ObjectCreators();
export const transformTools = new TransformTools();
export const selectionHelpers = new SelectionHelpers();
export const navigationHelpers = new NavigationHelpers();
export const materialHelpers = new MaterialHelpers();
export const lightingHelpers = new LightingHelpers();
export const animationHelpers = new AnimationHelpers();
export const exportHelpers = new ExportHelpers();
export const mathHelpers = new MathHelpers();
export const textureHelpers = new TextureHelpers();
export const sceneHelpers = new SceneHelpers();
export const renderHelpers = new RenderHelpers();
export const physicsHelpers = new PhysicsHelpers();
export const networkHelpers = new NetworkHelpers();
export const audioHelpers = new AudioHelpers();

// Exportar funciones de conveniencia
export const createCube = (options) => objectCreators.createCube(options);
export const createSphere = (options) => objectCreators.createSphere(options);
export const createCylinder = (options) => objectCreators.createCylinder(options);
export const createPlane = (options) => objectCreators.createPlane(options);
export const createCone = (options) => objectCreators.createCone(options);
export const createTorus = (options) => objectCreators.createTorus(options);

export const setupTransformControls = (camera, renderer) => 
  transformTools.setupTransformControls(camera, renderer);

export const setupRaycaster = (camera, renderer) => 
  selectionHelpers.setupRaycaster(camera, renderer);

export const setupNavigation = (camera, renderer, scene) => 
  navigationHelpers.setupNavigation(camera, renderer, scene);

export const setupBasicLighting = (scene, renderer) => 
  lightingHelpers.setupBasicLighting(scene, renderer);

// Exportar constantes útiles
export const TOOL_MODES = {
  SELECT: 'select',
  MOVE: 'move',
  ROTATE: 'rotate',
  SCALE: 'scale'
};

export const OBJECT_TYPES = {
  CUBE: 'cube',
  SPHERE: 'sphere',
  CYLINDER: 'cylinder',
  PLANE: 'plane',
  CONE: 'cone',
  TORUS: 'torus'
};

export const TRANSFORM_MODES = {
  TRANSLATE: 'translate',
  ROTATE: 'rotate',
  SCALE: 'scale'
};

// Exportar configuración por defecto
export const DEFAULT_CONFIG = {
  gridSize: 1000,
  gridDivisions: 100,
  snapValue: 1.0,
  snapAngle: Math.PI / 4,
  cameraFOV: 60,
  cameraNear: 0.1,
  cameraFar: 1000,
  backgroundColor: 0x23272e,
  ambientLightColor: 0x404040,
  ambientLightIntensity: 0.4,
  directionalLightColor: 0xffffff,
  directionalLightIntensity: 0.8
}; 