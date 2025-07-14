// Core rendering system exports
export { Renderer } from './Renderer';
export { Camera } from './Camera';
export { Material } from './Material';
export type { MaterialType, BlendMode, PBRProperties, TextureConfig } from './Material';
export { Geometry } from './Geometry';

// Re-export math utilities for convenience
export { Vector3 } from '../scene/math/Vector3';
export { Matrix4 } from '../scene/math/Matrix4';
export { Quaternion } from '../scene/math/Quaternion';
export { Euler } from '../scene/math/Euler'; 