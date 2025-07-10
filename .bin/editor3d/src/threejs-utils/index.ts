/**
 * ThreeJS Utils - Índice principal de utilidades para el editor 3D
 * Exporta todas las funciones JavaScript necesarias para el funcionamiento del editor
 */

// @ts-nocheck - Suprimir errores de tipos para archivos .js

// Exportar helpers principales
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

// Exportar tipos TypeScript
export * from './funciones_js.d.ts'; 