//! Tipos para la comunicación con el Motor 3D

/// Mensaje del motor
export interface EngineMessage {
  /// ID único del mensaje
  id: string;
  /// Tipo de mensaje
  type: 'command' | 'response' | 'event' | 'heartbeat';
  /// Timestamp
  timestamp: number;
  /// Datos del mensaje
  data: any;
}

/// Respuesta del motor
export interface EngineResponse {
  /// Éxito de la operación
  success: boolean;
  /// Datos de la respuesta
  data?: any;
  /// Error si falló
  error?: string;
  /// Código de error
  errorCode?: number;
}

/// Comando para el motor
export interface EngineCommand {
  /// Tipo de comando
  type: string;
  /// Datos del comando
  data: any;
}

/// Entidad del motor
export interface EngineEntity {
  /// ID de la entidad
  id: string;
  /// Nombre de la entidad
  name: string;
  /// Componentes de la entidad
  components: EngineComponent[];
  /// Hijos de la entidad
  children: string[];
  /// Padre de la entidad
  parent?: string;
  /// Activa
  active: boolean;
}

/// Componente del motor
export interface EngineComponent {
  /// Tipo de componente
  type: string;
  /// ID del componente
  id: string;
  /// Datos del componente
  data: any;
  /// Activo
  active: boolean;
}

/// Transform component
export interface TransformComponent {
  /// Posición
  position: Vector3;
  /// Rotación
  rotation: Quaternion;
  /// Escala
  scale: Vector3;
  /// Matriz de transformación
  matrix: Matrix4;
}

/// Mesh component
export interface MeshComponent {
  /// Geometría
  geometry: Geometry;
  /// Material
  material: Material;
  /// Visible
  visible: boolean;
  /// Cast shadows
  castShadow: boolean;
  /// Receive shadows
  receiveShadow: boolean;
}

/// Material component
export interface MaterialComponent {
  /// Tipo de material
  type: 'standard' | 'pbr' | 'shader';
  /// Propiedades del material
  properties: MaterialProperties;
  /// Texturas
  textures: Texture[];
  /// Shader
  shader?: Shader;
}

/// Light component
export interface LightComponent {
  /// Tipo de luz
  type: 'directional' | 'point' | 'spot' | 'area';
  /// Color
  color: Color;
  /// Intensidad
  intensity: number;
  /// Distancia
  distance: number;
  /// Ángulo
  angle: number;
  /// Penumbra
  penumbra: number;
  /// Cast shadows
  castShadow: boolean;
}

/// Camera component
export interface CameraComponent {
  /// Tipo de cámara
  type: 'perspective' | 'orthographic';
  /// FOV
  fov: number;
  /// Aspect ratio
  aspect: number;
  /// Near plane
  near: number;
  /// Far plane
  far: number;
  /// Viewport
  viewport: Viewport;
}

/// Physics component
export interface PhysicsComponent {
  /// Tipo de cuerpo
  type: 'rigid' | 'soft' | 'fluid';
  /// Masa
  mass: number;
  /// Fricción
  friction: number;
  /// Restitución
  restitution: number;
  /// Collision shape
  collisionShape: CollisionShape;
  /// Kinematic
  kinematic: boolean;
}

/// Audio component
export interface AudioComponent {
  /// Clip de audio
  clip: AudioClip;
  /// Volumen
  volume: number;
  /// Pitch
  pitch: number;
  /// Loop
  loop: boolean;
  /// Spatial
  spatial: boolean;
  /// Playing
  playing: boolean;
}

/// Animation component
export interface AnimationComponent {
  /// Animaciones
  animations: Animation[];
  /// Animación actual
  currentAnimation?: string;
  /// Playing
  playing: boolean;
  /// Speed
  speed: number;
  /// Loop
  loop: boolean;
}

/// Script component
export interface ScriptComponent {
  /// Script
  script: Script;
  /// Variables
  variables: Map<string, any>;
  /// Functions
  functions: string[];
  /// Active
  active: boolean;
}

/// Network component
export interface NetworkComponent {
  /// Network ID
  networkId: string;
  /// Owner
  owner: string;
  /// Synchronized
  synchronized: boolean;
  /// Authority
  authority: boolean;
}

/// Vector3
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/// Quaternion
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/// Matrix4
export interface Matrix4 {
  elements: number[];
}

/// Color
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

/// Geometry
export interface Geometry {
  /// Vertices
  vertices: number[];
  /// Indices
  indices: number[];
  /// Normals
  normals: number[];
  /// UVs
  uvs: number[];
  /// Tangents
  tangents: number[];
  /// Bounding box
  boundingBox: BoundingBox;
}

/// Material
export interface Material {
  /// ID del material
  id: string;
  /// Nombre
  name: string;
  /// Tipo
  type: string;
  /// Propiedades
  properties: MaterialProperties;
}

/// Material properties
export interface MaterialProperties {
  /// Color base
  baseColor?: Color;
  /// Metallic
  metallic?: number;
  /// Roughness
  roughness?: number;
  /// Normal scale
  normalScale?: number;
  /// Emissive
  emissive?: Color;
  /// Emissive intensity
  emissiveIntensity?: number;
  /// Alpha
  alpha?: number;
  /// Alpha test
  alphaTest?: number;
  /// Double sided
  doubleSided?: boolean;
  /// Wireframe
  wireframe?: boolean;
}

/// Texture
export interface Texture {
  /// ID de la textura
  id: string;
  /// Nombre
  name: string;
  /// URL
  url: string;
  /// Tipo
  type: 'diffuse' | 'normal' | 'roughness' | 'metallic' | 'emissive' | 'ao';
  /// Ancho
  width: number;
  /// Alto
  height: number;
  /// Format
  format: string;
  /// Filter
  filter: 'linear' | 'nearest';
  /// Wrap
  wrap: 'repeat' | 'clamp' | 'mirror';
}

/// Shader
export interface Shader {
  /// ID del shader
  id: string;
  /// Nombre
  name: string;
  /// Vertex shader
  vertexShader: string;
  /// Fragment shader
  fragmentShader: string;
  /// Uniforms
  uniforms: Uniform[];
  /// Attributes
  attributes: Attribute[];
}

/// Uniform
export interface Uniform {
  /// Nombre
  name: string;
  /// Tipo
  type: string;
  /// Valor
  value: any;
}

/// Attribute
export interface Attribute {
  /// Nombre
  name: string;
  /// Tipo
  type: string;
  /// Tamaño
  size: number;
}

/// Viewport
export interface Viewport {
  /// X
  x: number;
  /// Y
  y: number;
  /// Ancho
  width: number;
  /// Alto
  height: number;
}

/// Collision shape
export interface CollisionShape {
  /// Tipo
  type: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'mesh';
  /// Parámetros
  parameters: any;
}

/// Audio clip
export interface AudioClip {
  /// ID del clip
  id: string;
  /// Nombre
  name: string;
  /// URL
  url: string;
  /// Duración
  duration: number;
  /// Sample rate
  sampleRate: number;
  /// Channels
  channels: number;
}

/// Animation
export interface Animation {
  /// ID de la animación
  id: string;
  /// Nombre
  name: string;
  /// Duración
  duration: number;
  /// Tracks
  tracks: AnimationTrack[];
}

/// Animation track
export interface AnimationTrack {
  /// Nombre
  name: string;
  /// Tipo
  type: 'position' | 'rotation' | 'scale' | 'property';
  /// Keyframes
  keyframes: Keyframe[];
}

/// Keyframe
export interface Keyframe {
  /// Tiempo
  time: number;
  /// Valor
  value: any;
  /// Easing
  easing?: string;
}

/// Script
export interface Script {
  /// ID del script
  id: string;
  /// Nombre
  name: string;
  /// Código
  code: string;
  /// Tipo
  type: 'javascript' | 'wasm' | 'rust';
  /// Compiled
  compiled: boolean;
}

/// Bounding box
export interface BoundingBox {
  /// Min
  min: Vector3;
  /// Max
  max: Vector3;
  /// Center
  center: Vector3;
  /// Size
  size: Vector3;
}

/// Scene
export interface Scene {
  /// ID de la escena
  id: string;
  /// Nombre
  name: string;
  /// Entidades
  entities: EngineEntity[];
  /// Configuración
  config: SceneConfig;
  /// Metadata
  metadata: SceneMetadata;
}

/// Scene config
export interface SceneConfig {
  /// Background
  background: Color;
  /// Fog
  fog?: Fog;
  /// Environment
  environment?: Environment;
  /// Physics
  physics: PhysicsConfig;
  /// Audio
  audio: AudioConfig;
}

/// Fog
export interface Fog {
  /// Color
  color: Color;
  /// Near
  near: number;
  /// Far
  far: number;
}

/// Environment
export interface Environment {
  /// Skybox
  skybox?: string;
  /// Ambient light
  ambientLight: Color;
  /// Ambient intensity
  ambientIntensity: number;
}

/// Physics config
export interface PhysicsConfig {
  /// Gravity
  gravity: Vector3;
  /// Enabled
  enabled: boolean;
  /// Debug
  debug: boolean;
}

/// Audio config
export interface AudioConfig {
  /// Master volume
  masterVolume: number;
  /// Spatial audio
  spatialAudio: boolean;
  /// HRTF
  hrtf: boolean;
}

/// Scene metadata
export interface SceneMetadata {
  /// Autor
  author: string;
  /// Versión
  version: string;
  /// Descripción
  description: string;
  /// Tags
  tags: string[];
  /// Created
  created: number;
  /// Modified
  modified: number;
}

/// Performance stats
export interface PerformanceStats {
  /// FPS
  fps: number;
  /// Frame time
  frameTime: number;
  /// CPU usage
  cpuUsage: number;
  /// Memory usage
  memoryUsage: number;
  /// GPU usage
  gpuUsage: number;
  /// Draw calls
  drawCalls: number;
  /// Triangles
  triangles: number;
  /// Vertices
  vertices: number;
}

/// Engine stats
export interface EngineStats {
  /// Performance
  performance: PerformanceStats;
  /// Entities
  entities: number;
  /// Components
  components: number;
  /// Systems
  systems: number;
  /// Memory
  memory: MemoryStats;
  /// Network
  network: NetworkStats;
}

/// Memory stats
export interface MemoryStats {
  /// Total
  total: number;
  /// Used
  used: number;
  /// Free
  free: number;
  /// Allocated
  allocated: number;
}

/// Network stats
export interface NetworkStats {
  /// Connected peers
  connectedPeers: number;
  /// Messages sent
  messagesSent: number;
  /// Messages received
  messagesReceived: number;
  /// Latency
  latency: number;
  /// Bandwidth
  bandwidth: number;
} 