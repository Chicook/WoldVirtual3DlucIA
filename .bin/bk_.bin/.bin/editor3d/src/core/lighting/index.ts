// Sistema de iluminación enterprise exports
export { Light, LightType, ShadowConfig, AttenuationConfig } from './Light';
export { DirectionalLight } from './DirectionalLight';
export { PointLight } from './PointLight';
export { SpotLight } from './SpotLight';
export { AreaLight } from './AreaLight';
export { AmbientLight } from './AmbientLight';
export { LightManager, LightingConfig, LightingEvents } from './LightManager';

// Sistema de post-procesado
export { PostProcessor, PostEffectType, BloomConfig, SSAOConfig, DOFConfig, MotionBlurConfig, ChromaticAberrationConfig, VignetteConfig, TonemappingConfig } from '../postprocessing/PostProcessor'; 