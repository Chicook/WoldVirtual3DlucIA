/**
 * @fileoverview Tipos para escenas 3D del metaverso
 * @module @types/metaverso/scene
 */

import { WorldCoordinates, WorldRotation, WorldScale } from './world';

// ============================================================================
// TIPOS BÁSICOS DE ESCENA
// ============================================================================

/**
 * Identificador único de una escena
 */
export type SceneId = string;

/**
 * Objeto de escena 3D
 */
export interface SceneObject {
  id: string;
  name: string;
  type: SceneObjectType;
  transform: SceneTransform;
  geometry: SceneGeometry;
  material: SceneMaterial;
  children: SceneObject[];
  parent?: string;
  
  // Propiedades físicas
  physics?: ScenePhysics;
  
  // Propiedades de renderizado
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  
  // Propiedades de interacción
  interactive: boolean;
  clickable: boolean;
  hoverable: boolean;
  
  // Metadatos
  tags: string[];
  metadata: Record<string, any>;
  
  // Estados
  states: SceneObjectState[];
  currentState?: string;
}

/**
 * Tipos de objetos de escena
 */
export enum SceneObjectType {
  MESH = 'mesh',
  LIGHT = 'light',
  CAMERA = 'camera',
  AUDIO = 'audio',
  PARTICLE = 'particle',
  TEXT = 'text',
  UI = 'ui',
  TRIGGER = 'trigger',
  SPAWN_POINT = 'spawn_point',
  TELEPORT = 'teleport',
  NPC = 'npc',
  VEHICLE = 'vehicle',
  BUILDING = 'building',
  DECORATION = 'decoration',
  INTERACTIVE = 'interactive'
}

/**
 * Transformación de objeto de escena
 */
export interface SceneTransform {
  position: WorldCoordinates;
  rotation: WorldRotation;
  scale: WorldScale;
  matrix?: number[]; // Matriz de transformación 4x4
}

// ============================================================================
// TIPOS DE GEOMETRÍA
// ============================================================================

/**
 * Geometría de objeto de escena
 */
export interface SceneGeometry {
  type: GeometryType;
  data: GeometryData;
  boundingBox?: BoundingBox;
  boundingSphere?: BoundingSphere;
}

/**
 * Tipos de geometría
 */
export enum GeometryType {
  BOX = 'box',
  SPHERE = 'sphere',
  CYLINDER = 'cylinder',
  PLANE = 'plane',
  CUBE = 'cube',
  CONE = 'cone',
  TORUS = 'torus',
  CUSTOM = 'custom',
  GLTF = 'gltf',
  FBX = 'fbx',
  OBJ = 'obj'
}

/**
 * Datos de geometría
 */
export interface GeometryData {
  vertices?: number[];
  indices?: number[];
  normals?: number[];
  uvs?: number[];
  colors?: number[];
  tangents?: number[];
  url?: string; // Para geometrías cargadas desde archivo
}

/**
 * Caja delimitadora
 */
export interface BoundingBox {
  min: WorldCoordinates;
  max: WorldCoordinates;
  center: WorldCoordinates;
  size: WorldCoordinates;
}

/**
 * Esfera delimitadora
 */
export interface BoundingSphere {
  center: WorldCoordinates;
  radius: number;
}

// ============================================================================
// TIPOS DE MATERIALES
// ============================================================================

/**
 * Material de objeto de escena
 */
export interface SceneMaterial {
  id: string;
  name: string;
  type: MaterialType;
  properties: MaterialProperties;
  textures: SceneTexture[];
  shaders?: SceneShader;
}

/**
 * Tipos de materiales
 */
export enum MaterialType {
  BASIC = 'basic',
  LAMBERT = 'lambert',
  PHONG = 'phong',
  STANDARD = 'standard',
  PHYSICAL = 'physical',
  TOON = 'toon',
  SHADER = 'shader',
  CUSTOM = 'custom'
}

/**
 * Propiedades del material
 */
export interface MaterialProperties {
  color?: string;
  opacity?: number;
  transparent?: boolean;
  alphaTest?: number;
  side?: 'front' | 'back' | 'double';
  
  // Propiedades de iluminación
  emissive?: string;
  emissiveIntensity?: number;
  reflectivity?: number;
  refractionRatio?: number;
  
  // Propiedades físicas
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  
  // Propiedades de textura
  map?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;
  emissiveMap?: string;
  
  // Propiedades de mapeo
  repeat?: WorldCoordinates;
  offset?: WorldCoordinates;
  wrapS?: 'clamp' | 'repeat' | 'mirror';
  wrapT?: 'clamp' | 'repeat' | 'mirror';
}

/**
 * Textura de escena
 */
export interface SceneTexture {
  id: string;
  name: string;
  type: TextureType;
  url: string;
  format: TextureFormat;
  encoding: TextureEncoding;
  properties: TextureProperties;
}

/**
 * Tipos de texturas
 */
export enum TextureType {
  DIFFUSE = 'diffuse',
  NORMAL = 'normal',
  ROUGHNESS = 'roughness',
  METALNESS = 'metalness',
  AMBIENT_OCCLUSION = 'ao',
  EMISSIVE = 'emissive',
  ENVIRONMENT = 'environment',
  CUBEMAP = 'cubemap',
  VIDEO = 'video'
}

/**
 * Formatos de textura
 */
export enum TextureFormat {
  RGB = 'rgb',
  RGBA = 'rgba',
  LUMINANCE = 'luminance',
  DEPTH = 'depth',
  COMPRESSED = 'compressed'
}

/**
 * Codificación de textura
 */
export enum TextureEncoding {
  LINEAR = 'linear',
  SRGB = 'srgb',
  GAMMA = 'gamma'
}

/**
 * Propiedades de textura
 */
export interface TextureProperties {
  flipY: boolean;
  generateMipmaps: boolean;
  anisotropy: number;
  minFilter: TextureFilter;
  magFilter: TextureFilter;
  wrapS: TextureWrap;
  wrapT: TextureWrap;
}

/**
 * Filtros de textura
 */
export enum TextureFilter {
  NEAREST = 'nearest',
  LINEAR = 'linear',
  NEAREST_MIPMAP_NEAREST = 'nearest_mipmap_nearest',
  LINEAR_MIPMAP_NEAREST = 'linear_mipmap_nearest',
  NEAREST_MIPMAP_LINEAR = 'nearest_mipmap_linear',
  LINEAR_MIPMAP_LINEAR = 'linear_mipmap_linear'
}

/**
 * Modos de envoltura de textura
 */
export enum TextureWrap {
  CLAMP = 'clamp',
  REPEAT = 'repeat',
  MIRROR = 'mirror'
}

// ============================================================================
// TIPOS DE SHADERS
// ============================================================================

/**
 * Shader personalizado
 */
export interface SceneShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: ShaderUniform[];
  attributes: ShaderAttribute[];
}

/**
 * Uniforme de shader
 */
export interface ShaderUniform {
  name: string;
  type: UniformType;
  value: any;
}

/**
 * Tipos de uniformes
 */
export enum UniformType {
  FLOAT = 'float',
  VEC2 = 'vec2',
  VEC3 = 'vec3',
  VEC4 = 'vec4',
  MAT3 = 'mat3',
  MAT4 = 'mat4',
  TEXTURE = 'texture',
  CUBE = 'cube'
}

/**
 * Atributo de shader
 */
export interface ShaderAttribute {
  name: string;
  type: AttributeType;
  size: number;
}

/**
 * Tipos de atributos
 */
export enum AttributeType {
  FLOAT = 'float',
  VEC2 = 'vec2',
  VEC3 = 'vec3',
  VEC4 = 'vec4'
}

// ============================================================================
// TIPOS DE ILUMINACIÓN
// ============================================================================

/**
 * Luz de escena
 */
export interface SceneLight extends SceneObject {
  type: SceneObjectType.LIGHT;
  lightType: LightType;
  properties: LightProperties;
  shadows: LightShadows;
}

/**
 * Tipos de luces
 */
export enum LightType {
  AMBIENT = 'ambient',
  DIRECTIONAL = 'directional',
  POINT = 'point',
  SPOT = 'spot',
  HEMISPHERE = 'hemisphere',
  AREA = 'area'
}

/**
 * Propiedades de luz
 */
export interface LightProperties {
  color: string;
  intensity: number;
  distance?: number;
  decay?: number;
  angle?: number;
  penumbra?: number;
  target?: WorldCoordinates;
}

/**
 * Sombras de luz
 */
export interface LightShadows {
  enabled: boolean;
  mapSize: number;
  bias: number;
  darkness: number;
  opacity: number;
  radius: number;
}

// ============================================================================
// TIPOS DE CÁMARA
// ============================================================================

/**
 * Cámara de escena
 */
export interface SceneCamera extends SceneObject {
  type: SceneObjectType.CAMERA;
  cameraType: CameraType;
  properties: CameraProperties;
  controls: CameraControls;
}

/**
 * Tipos de cámara
 */
export enum CameraType {
  PERSPECTIVE = 'perspective',
  ORTHOGRAPHIC = 'orthographic',
  CUBE = 'cube'
}

/**
 * Propiedades de cámara
 */
export interface CameraProperties {
  fov: number;
  aspect: number;
  near: number;
  far: number;
  zoom: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

/**
 * Controles de cámara
 */
export interface CameraControls {
  enabled: boolean;
  type: ControlType;
  target: WorldCoordinates;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  enableDamping: boolean;
  dampingFactor: number;
}

/**
 * Tipos de controles
 */
export enum ControlType {
  ORBIT = 'orbit',
  FLY = 'fly',
  FIRST_PERSON = 'first_person',
  THIRD_PERSON = 'third_person'
}

// ============================================================================
// TIPOS DE AUDIO
// ============================================================================

/**
 * Audio de escena
 */
export interface SceneAudio extends SceneObject {
  type: SceneObjectType.AUDIO;
  audioType: AudioType;
  properties: AudioProperties;
  spatial: AudioSpatial;
}

/**
 * Tipos de audio
 */
export enum AudioType {
  AMBIENT = 'ambient',
  EFFECT = 'effect',
  MUSIC = 'music',
  VOICE = 'voice'
}

/**
 * Propiedades de audio
 */
export interface AudioProperties {
  url: string;
  volume: number;
  loop: boolean;
  autoplay: boolean;
  rate: number;
  detune: number;
}

/**
 * Audio espacial
 */
export interface AudioSpatial {
  enabled: boolean;
  refDistance: number;
  maxDistance: number;
  rolloffFactor: number;
  distanceModel: DistanceModel;
  coneInnerAngle: number;
  coneOuterAngle: number;
  coneOuterGain: number;
}

/**
 * Modelos de distancia
 */
export enum DistanceModel {
  LINEAR = 'linear',
  INVERSE = 'inverse',
  EXPONENTIAL = 'exponential'
}

// ============================================================================
// TIPOS DE PARTÍCULAS
// ============================================================================

/**
 * Sistema de partículas
 */
export interface SceneParticle extends SceneObject {
  type: SceneObjectType.PARTICLE;
  properties: ParticleProperties;
  emitter: ParticleEmitter;
  particles: Particle[];
}

/**
 * Propiedades de partículas
 */
export interface ParticleProperties {
  count: number;
  lifetime: number;
  size: number;
  sizeVariation: number;
  color: string;
  colorVariation: number;
  opacity: number;
  opacityVariation: number;
  speed: number;
  speedVariation: number;
  gravity: number;
  wind: WorldCoordinates;
}

/**
 * Emisor de partículas
 */
export interface ParticleEmitter {
  type: EmitterType;
  position: WorldCoordinates;
  size: WorldCoordinates;
  rate: number;
  burst: boolean;
  burstCount?: number;
}

/**
 * Tipos de emisores
 */
export enum EmitterType {
  POINT = 'point',
  BOX = 'box',
  SPHERE = 'sphere',
  CYLINDER = 'cylinder',
  PLANE = 'plane'
}

/**
 * Partícula individual
 */
export interface Particle {
  id: string;
  position: WorldCoordinates;
  velocity: WorldCoordinates;
  size: number;
  color: string;
  opacity: number;
  age: number;
  lifetime: number;
}

// ============================================================================
// TIPOS DE FÍSICA
// ============================================================================

/**
 * Física de objeto de escena
 */
export interface ScenePhysics {
  enabled: boolean;
  type: PhysicsType;
  mass: number;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
  collisionGroup: number;
  collisionMask: number;
  shape: PhysicsShape;
}

/**
 * Tipos de física
 */
export enum PhysicsType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
  KINEMATIC = 'kinematic'
}

/**
 * Forma física
 */
export interface PhysicsShape {
  type: ShapeType;
  size?: WorldCoordinates;
  radius?: number;
  height?: number;
  points?: WorldCoordinates[];
}

/**
 * Tipos de formas
 */
export enum ShapeType {
  BOX = 'box',
  SPHERE = 'sphere',
  CYLINDER = 'cylinder',
  CAPSULE = 'capsule',
  CONE = 'cone',
  PLANE = 'plane',
  MESH = 'mesh',
  CONVEX = 'convex'
}

// ============================================================================
// TIPOS DE ESTADOS
// ============================================================================

/**
 * Estado de objeto de escena
 */
export interface SceneObjectState {
  id: string;
  name: string;
  transform?: Partial<SceneTransform>;
  material?: Partial<SceneMaterial>;
  visible?: boolean;
  interactive?: boolean;
  animation?: SceneAnimation;
  script?: SceneScript;
}

/**
 * Animación de escena
 */
export interface SceneAnimation {
  id: string;
  name: string;
  duration: number;
  loop: boolean;
  tracks: AnimationTrack[];
}

/**
 * Pista de animación
 */
export interface AnimationTrack {
  property: string;
  keyframes: Keyframe[];
  interpolation: InterpolationType;
}

/**
 * Keyframe de animación
 */
export interface Keyframe {
  time: number;
  value: any;
  easing?: EasingFunction;
}

/**
 * Tipos de interpolación
 */
export enum InterpolationType {
  LINEAR = 'linear',
  STEP = 'step',
  CUBIC = 'cubic',
  BEZIER = 'bezier'
}

/**
 * Funciones de easing
 */
export enum EasingFunction {
  LINEAR = 'linear',
  EASE_IN = 'easeIn',
  EASE_OUT = 'easeOut',
  EASE_IN_OUT = 'easeInOut',
  BOUNCE = 'bounce',
  ELASTIC = 'elastic'
}

/**
 * Script de escena
 */
export interface SceneScript {
  id: string;
  name: string;
  language: ScriptLanguage;
  code: string;
  parameters: ScriptParameter[];
}

/**
 * Lenguajes de script
 */
export enum ScriptLanguage {
  JAVASCRIPT = 'javascript',
  PYTHON = 'python',
  LUA = 'lua',
  CUSTOM = 'custom'
}

/**
 * Parámetro de script
 */
export interface ScriptParameter {
  name: string;
  type: ParameterType;
  value: any;
  description: string;
}

/**
 * Tipos de parámetros
 */
export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  VECTOR3 = 'vector3',
  COLOR = 'color',
  TEXTURE = 'texture',
  OBJECT = 'object'
}

// ============================================================================
// TIPOS DE ESCENA COMPLETA
// ============================================================================

/**
 * Escena completa del metaverso
 */
export interface Scene {
  id: SceneId;
  name: string;
  description: string;
  
  // Objetos de la escena
  objects: SceneObject[];
  
  // Configuración de renderizado
  renderer: SceneRenderer;
  
  // Configuración de post-procesamiento
  postProcessing: PostProcessing;
  
  // Configuración de optimización
  optimization: SceneOptimization;
  
  // Metadatos
  version: string;
  createdAt: number;
  updatedAt: number;
  author: string;
}

/**
 * Configuración del renderizador
 */
export interface SceneRenderer {
  antialias: boolean;
  shadowMap: boolean;
  shadowMapType: ShadowMapType;
  pixelRatio: number;
  outputEncoding: OutputEncoding;
  toneMapping: ToneMapping;
  exposure: number;
  gammaFactor: number;
}

/**
 * Tipos de mapa de sombras
 */
export enum ShadowMapType {
  BASIC = 'basic',
  PCF = 'pcf',
  PCF_SOFT = 'pcf_soft',
  VSM = 'vsm'
}

/**
 * Codificación de salida
 */
export enum OutputEncoding {
  LINEAR = 'linear',
  SRGB = 'srgb',
  GAMMA = 'gamma'
}

/**
 * Mapeo de tonos
 */
export enum ToneMapping {
  NONE = 'none',
  LINEAR = 'linear',
  REINHARD = 'reinhard',
  CINEON = 'cineon',
  ACES_FILMIC = 'aces_filmic'
}

/**
 * Post-procesamiento
 */
export interface PostProcessing {
  enabled: boolean;
  effects: PostProcessingEffect[];
}

/**
 * Efecto de post-procesamiento
 */
export interface PostProcessingEffect {
  type: EffectType;
  enabled: boolean;
  parameters: Record<string, any>;
}

/**
 * Tipos de efectos
 */
export enum EffectType {
  BLOOM = 'bloom',
  DOF = 'dof',
  SSAO = 'ssao',
  FXAA = 'fxaa',
  SMAA = 'smaa',
  VIGNETTE = 'vignette',
  CHROMATIC_ABERRATION = 'chromatic_aberration',
  FILM_GRAIN = 'film_grain'
}

/**
 * Optimización de escena
 */
export interface SceneOptimization {
  frustumCulling: boolean;
  occlusionCulling: boolean;
  levelOfDetail: boolean;
  instancing: boolean;
  textureCompression: boolean;
  geometryCompression: boolean;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type {
  SceneId,
  SceneObject,
  SceneTransform,
  SceneGeometry,
  GeometryData,
  BoundingBox,
  BoundingSphere,
  SceneMaterial,
  MaterialProperties,
  SceneTexture,
  TextureProperties,
  SceneShader,
  ShaderUniform,
  ShaderAttribute,
  SceneLight,
  LightProperties,
  LightShadows,
  SceneCamera,
  CameraProperties,
  CameraControls,
  SceneAudio,
  AudioProperties,
  AudioSpatial,
  SceneParticle,
  ParticleProperties,
  ParticleEmitter,
  Particle,
  ScenePhysics,
  PhysicsShape,
  SceneObjectState,
  SceneAnimation,
  AnimationTrack,
  Keyframe,
  SceneScript,
  ScriptParameter,
  Scene,
  SceneRenderer,
  PostProcessing,
  PostProcessingEffect,
  SceneOptimization
};

export {
  SceneObjectType,
  GeometryType,
  MaterialType,
  TextureType,
  TextureFormat,
  TextureEncoding,
  TextureFilter,
  TextureWrap,
  UniformType,
  AttributeType,
  LightType,
  CameraType,
  ControlType,
  AudioType,
  DistanceModel,
  EmitterType,
  PhysicsType,
  ShapeType,
  InterpolationType,
  EasingFunction,
  ScriptLanguage,
  ParameterType,
  ShadowMapType,
  OutputEncoding,
  ToneMapping,
  EffectType
}; 