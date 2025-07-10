/**
 * Three.js Editor Utilities - Índice Principal
 * Exporta todas las funciones JavaScript y TypeScript del editor 3D
 * Inspirado en Blender y Godot
 */

// Exportar funciones JavaScript
export { EditorCore } from './funciones_js/EditorCore.js';
export { ObjectCreators } from './funciones_js/ObjectCreators.js';
export { TransformTools } from './funciones_js/TransformTools.js';
export { SelectionHelpers } from './funciones_js/SelectionHelpers.js';
export { NavigationHelpers } from './funciones_js/NavigationHelpers.js';
export { MaterialHelpers } from './funciones_js/MaterialHelpers.js';
export { LightingHelpers } from './funciones_js/LightingHelpers.js';
export { AnimationHelpers } from './funciones_js/AnimationHelpers.js';
export { ExportHelpers } from './funciones_js/ExportHelpers.js';
export { MathHelpers } from './funciones_js/MathHelpers.js';
export { TextureHelpers } from './funciones_js/TextureHelpers.js';
export { SceneHelpers } from './funciones_js/SceneHelpers.js';
export { RenderHelpers } from './funciones_js/RenderHelpers.js';

// Exportar funciones TypeScript
export { GeometryGenerators } from './GeometryGenerators.js';

// Exportar tipos
export * from './types.js';

// Exportar instancias por defecto para uso directo
import { EditorCore } from './funciones_js/EditorCore.js';
import { ObjectCreators } from './funciones_js/ObjectCreators.js';
import { TransformTools } from './funciones_js/TransformTools.js';
import { SelectionHelpers } from './funciones_js/SelectionHelpers.js';
import { NavigationHelpers } from './funciones_js/NavigationHelpers.js';
import { MaterialHelpers } from './funciones_js/MaterialHelpers.js';
import { LightingHelpers } from './funciones_js/LightingHelpers.js';
import { AnimationHelpers } from './funciones_js/AnimationHelpers.js';
import { ExportHelpers } from './funciones_js/ExportHelpers.js';
import { MathHelpers } from './funciones_js/MathHelpers.js';
import { TextureHelpers } from './funciones_js/TextureHelpers.js';
import { SceneHelpers } from './funciones_js/SceneHelpers.js';
import { RenderHelpers } from './funciones_js/RenderHelpers.js';
import { GeometryGenerators } from './GeometryGenerators.js';

// Instancias por defecto
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
export const geometryGenerators = new GeometryGenerators();

// Función de inicialización completa del editor
export const initializeEditor = (container: HTMLElement) => {
  // Inicializar componentes principales
  editorCore.initialize(container);
  navigationHelpers.initialize(editorCore.camera, editorCore.scene, editorCore.renderer);
  lightingHelpers.setupBasicLighting(editorCore.scene, editorCore.renderer);
  sceneHelpers.initializeScene();
  
  // Configurar helpers
  selectionHelpers.setup(editorCore.camera, editorCore.renderer);
  materialHelpers.initialize();
  textureHelpers.initialize();
  animationHelpers.initialize();
  
  console.log('✅ Editor 3D inicializado completamente');
  return {
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
    sceneHelpers,
    renderHelpers,
    geometryGenerators
  };
};

// Función de limpieza
export const cleanupEditor = () => {
  editorCore.dispose();
  selectionHelpers.cleanup();
  materialHelpers.cleanup();
  textureHelpers.cleanup();
  animationHelpers.cleanup();
  console.log('🧹 Editor 3D limpiado');
};

// Exportar configuración por defecto
export const defaultConfig = {
  gridSize: 100,
  gridDivisions: 100,
  backgroundColor: 0x23272e,
  cameraPosition: { x: 5, y: 5, z: 5 },
  cameraFOV: 75,
  nearPlane: 0.1,
  farPlane: 1000,
  enableShadows: true,
  enablePostProcessing: true,
  snapEnabled: true,
  snapValue: 1.0
}; 