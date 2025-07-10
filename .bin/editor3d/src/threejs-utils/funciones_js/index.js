/**
 * Index de utilidades JavaScript para el editor 3D
 * Exporta todas las clases y funciones necesarias para el funcionamiento del editor
 * Crea instancias únicas siguiendo el patrón Singleton
 */

// Importar todas las clases
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
import { NetworkHelpers } from './NetworkHelpers.js';
import { PhysicsHelpers } from './PhysicsHelpers.js';
import { RenderHelpers } from './RenderHelpers.js';
import { SceneHelpers } from './SceneHelpers.js';
import { AudioHelpers } from './AudioHelpers.js';
import { ProjectManager } from './ProjectManager.js';
import { SerializationHelpers } from './SerializationHelpers.js';

// Crear instancias únicas (Singleton pattern)
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
export const networkHelpers = new NetworkHelpers();
export const physicsHelpers = new PhysicsHelpers();
export const renderHelpers = new RenderHelpers();
export const sceneHelpers = new SceneHelpers();
export const audioHelpers = new AudioHelpers();
export const projectManager = new ProjectManager();
export const serializationHelpers = new SerializationHelpers();

// Exportar las clases también para casos donde se necesite crear nuevas instancias
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
  NetworkHelpers,
  PhysicsHelpers,
  RenderHelpers,
  SceneHelpers,
  AudioHelpers,
  ProjectManager,
  SerializationHelpers
};

// Exportar un objeto con todas las instancias para acceso fácil
export const editorUtils = {
  editorCore,
  objectCreators,
  transformTools,
  selectionHelpers,
  navigationHelpers,
  materialHelpers,
  lightingHelpers,
  animationHelpers,
  exportHelpers,
  mathHelpers,
  textureHelpers,
  networkHelpers,
  physicsHelpers,
  renderHelpers,
  sceneHelpers,
  audioHelpers,
  projectManager,
  serializationHelpers
};

// Función de inicialización global
export function initializeEditorUtils() {
  console.log('🚀 Inicializando utilidades del editor 3D...');
  
  // Inicializar componentes críticos
  editorCore.initialize();
  selectionHelpers.initialize();
  navigationHelpers.initialize();
  
  console.log('✅ Utilidades del editor 3D inicializadas correctamente');
  return editorUtils;
}

// Función de limpieza global
export function cleanupEditorUtils() {
  console.log('🧹 Limpiando utilidades del editor 3D...');
  
  // Limpiar componentes
  editorCore.cleanup();
  selectionHelpers.cleanup();
  navigationHelpers.cleanup();
  
  console.log('✅ Utilidades del editor 3D limpiadas correctamente');
}