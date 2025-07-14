//! # Sistema de Animaciones
//! 
//! Sistema de gestión de animaciones 3D para el metaverso.
//! Proporciona animaciones de esqueleto, morphing, y procedurales.

use serde::{Serialize, Deserialize};
use tracing::{info, debug};
use std::collections::HashMap;

/// Sistema de animaciones principal
pub struct AnimationSystem {
    /// Animaciones registradas
    animations: HashMap<String, Animation>,
    /// Clips de animación
    clips: HashMap<String, AnimationClip>,
    /// Controladores de animación
    controllers: HashMap<String, AnimationController>,
    /// Estado del sistema
    running: bool,
}

/// Animación principal
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Animation {
    /// ID de la animación
    pub id: String,
    /// Nombre de la animación
    pub name: String,
    /// Tipo de animación
    pub animation_type: AnimationType,
    /// Configuración de la animación
    pub config: AnimationConfig,
    /// Clips de la animación
    pub clips: Vec<String>,
    /// Estado de la animación
    pub state: AnimationState,
}

/// Tipo de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnimationType {
    Skeletal,
    Morphing,
    Procedural,
    Particle,
    Camera,
    Light,
    Custom(String),
}

/// Configuración de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationConfig {
    /// Duración de la animación
    pub duration: f32,
    /// FPS de la animación
    pub fps: f32,
    /// Loop de la animación
    pub looped: bool,
    /// Configuración de interpolación
    pub interpolation: InterpolationConfig,
    /// Configuración de blending
    pub blending: Option<BlendingConfig>,
    /// Configuración de eventos
    pub events: Vec<AnimationEvent>,
}

/// Configuración de interpolación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterpolationConfig {
    /// Tipo de interpolación
    pub interpolation_type: InterpolationType,
    /// Configuración de easing
    pub easing: EasingConfig,
    /// Configuración de tangentes
    pub tangents: Option<TangentConfig>,
}

/// Tipo de interpolación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InterpolationType {
    Linear,
    Step,
    Smooth,
    Bezier,
    CatmullRom,
    Custom(String),
}

/// Configuración de easing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EasingConfig {
    /// Tipo de easing
    pub easing_type: EasingType,
    /// Parámetros de easing
    pub parameters: [f32; 4],
}

/// Tipo de easing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EasingType {
    None,
    EaseIn,
    EaseOut,
    EaseInOut,
    Elastic,
    Bounce,
    Back,
    Custom(String),
}

/// Configuración de tangentes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TangentConfig {
    /// Tangente de entrada
    pub in_tangent: [f32; 3],
    /// Tangente de salida
    pub out_tangent: [f32; 3],
    /// Configuración de peso
    pub weight: f32,
}

/// Configuración de blending
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlendingConfig {
    /// Tipo de blending
    pub blending_type: BlendingType,
    /// Duración de transición
    pub transition_duration: f32,
    /// Configuración de peso
    pub weight: f32,
    /// Configuración de máscara
    pub mask: Option<BlendMask>,
}

/// Tipo de blending
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BlendingType {
    Linear,
    Smooth,
    Step,
    Custom(String),
}

/// Máscara de blending
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlendMask {
    /// Huesos afectados
    pub bones: Vec<String>,
    /// Peso por hueso
    pub weights: Vec<f32>,
}

/// Evento de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationEvent {
    /// Nombre del evento
    pub name: String,
    /// Tiempo del evento
    pub time: f32,
    /// Datos del evento
    pub data: AnimationEventData,
}

/// Datos del evento de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnimationEventData {
    /// Evento de sonido
    Sound(SoundEvent),
    /// Evento de partículas
    Particle(ParticleEvent),
    /// Evento de callback
    Callback(CallbackEvent),
    /// Evento personalizado
    Custom(serde_json::Value),
}

/// Evento de sonido
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoundEvent {
    /// ID del sonido
    pub sound_id: String,
    /// Volumen
    pub volume: f32,
    /// Pitch
    pub pitch: f32,
}

/// Evento de partículas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParticleEvent {
    /// ID del sistema de partículas
    pub particle_system_id: String,
    /// Configuración de emisión
    pub emission_config: EmissionConfig,
}

/// Configuración de emisión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmissionConfig {
    /// Número de partículas
    pub particle_count: u32,
    /// Velocidad de emisión
    pub emission_rate: f32,
    /// Duración de emisión
    pub emission_duration: f32,
}

/// Evento de callback
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CallbackEvent {
    /// Nombre de la función
    pub function_name: String,
    /// Parámetros
    pub parameters: Vec<serde_json::Value>,
}

/// Estado de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationState {
    /// Activa
    pub active: bool,
    /// Reproduciendo
    pub playing: bool,
    /// Pausada
    pub paused: bool,
    /// Tiempo actual
    pub current_time: f32,
    /// Velocidad de reproducción
    pub speed: f32,
    /// Peso de la animación
    pub weight: f32,
}

/// Clip de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationClip {
    /// ID del clip
    pub id: String,
    /// Nombre del clip
    pub name: String,
    /// Tipo de clip
    pub clip_type: ClipType,
    /// Configuración del clip
    pub config: ClipConfig,
    /// Datos del clip
    pub data: ClipData,
    /// Estado del clip
    pub state: ClipState,
}

/// Tipo de clip
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClipType {
    Skeletal,
    Morphing,
    Procedural,
    Particle,
    Camera,
    Light,
    Custom(String),
}

/// Configuración de clip
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipConfig {
    /// Duración del clip
    pub duration: f32,
    /// FPS del clip
    pub fps: f32,
    /// Loop del clip
    pub looped: bool,
    /// Configuración de compresión
    pub compression: Option<CompressionConfig>,
    /// Configuración de optimización
    pub optimization: Option<OptimizationConfig>,
}

/// Configuración de compresión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressionConfig {
    /// Tipo de compresión
    pub compression_type: CompressionType,
    /// Factor de compresión
    pub compression_factor: f32,
    /// Configuración de precisión
    pub precision: f32,
}

/// Tipo de compresión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompressionType {
    None,
    Linear,
    Spline,
    Wavelet,
    Custom(String),
}

/// Configuración de optimización
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationConfig {
    /// Reducción de keyframes
    pub keyframe_reduction: bool,
    /// Umbral de reducción
    pub reduction_threshold: f32,
    /// Configuración de LOD
    pub lod_config: Option<LODConfig>,
}

/// Configuración de LOD
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LODConfig {
    /// Niveles de LOD
    pub lod_levels: Vec<LODLevel>,
    /// Configuración de transición
    pub transition_config: TransitionConfig,
}

/// Nivel de LOD
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LODLevel {
    /// Distancia
    pub distance: f32,
    /// Factor de reducción
    pub reduction_factor: f32,
    /// Configuración de calidad
    pub quality_config: QualityConfig,
}

/// Configuración de calidad
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityConfig {
    /// Factor de calidad
    pub quality_factor: f32,
    /// Configuración de precisión
    pub precision: f32,
}

/// Configuración de transición
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransitionConfig {
    /// Duración de transición
    pub transition_duration: f32,
    /// Tipo de transición
    pub transition_type: TransitionType,
}

/// Tipo de transición
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransitionType {
    Linear,
    Smooth,
    Step,
    Custom(String),
}

/// Datos del clip
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClipData {
    /// Datos de esqueleto
    Skeletal(SkeletalData),
    /// Datos de morphing
    Morphing(MorphingData),
    /// Datos procedurales
    Procedural(ProceduralData),
    /// Datos de partículas
    Particle(ParticleData),
    /// Datos de cámara
    Camera(CameraData),
    /// Datos de luz
    Light(LightData),
    /// Datos personalizados
    Custom(serde_json::Value),
}

/// Datos de esqueleto
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkeletalData {
    /// Huesos del esqueleto
    pub bones: Vec<Bone>,
    /// Keyframes de transformación
    pub keyframes: Vec<TransformKeyframe>,
    /// Configuración de constraints
    pub constraints: Vec<Constraint>,
}

/// Hueso
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bone {
    /// ID del hueso
    pub id: String,
    /// Nombre del hueso
    pub name: String,
    /// Hueso padre
    pub parent_id: Option<String>,
    /// Transformación local
    pub local_transform: Transform,
    /// Transformación mundial
    pub world_transform: Transform,
    /// Configuración de influencia
    pub influence_config: InfluenceConfig,
}

/// Transformación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transform {
    /// Posición
    pub position: [f32; 3],
    /// Rotación (cuaternión)
    pub rotation: [f32; 4],
    /// Escala
    pub scale: [f32; 3],
}

/// Configuración de influencia
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfluenceConfig {
    /// Radio de influencia
    pub influence_radius: f32,
    /// Peso de influencia
    pub influence_weight: f32,
    /// Configuración de falloff
    pub falloff_config: FalloffConfig,
}

/// Configuración de falloff
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FalloffConfig {
    /// Tipo de falloff
    pub falloff_type: FalloffType,
    /// Exponente de falloff
    pub falloff_exponent: f32,
}

/// Tipo de falloff
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FalloffType {
    Linear,
    Quadratic,
    Cubic,
    Exponential,
    Custom(String),
}

/// Keyframe de transformación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransformKeyframe {
    /// Tiempo del keyframe
    pub time: f32,
    /// ID del hueso
    pub bone_id: String,
    /// Transformación
    pub transform: Transform,
    /// Configuración de interpolación
    pub interpolation: KeyframeInterpolation,
}

/// Interpolación de keyframe
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyframeInterpolation {
    /// Tipo de interpolación
    pub interpolation_type: InterpolationType,
    /// Configuración de tangentes
    pub tangents: Option<TangentConfig>,
    /// Configuración de easing
    pub easing: EasingConfig,
}

/// Constraint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Constraint {
    /// ID del constraint
    pub id: String,
    /// Nombre del constraint
    pub name: String,
    /// Tipo de constraint
    pub constraint_type: ConstraintType,
    /// Configuración del constraint
    pub config: ConstraintConfig,
}

/// Tipo de constraint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConstraintType {
    IK,
    FK,
    LookAt,
    Point,
    Aim,
    Orient,
    Scale,
    Custom(String),
}

/// Configuración de constraint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstraintConfig {
    /// Huesos objetivo
    pub target_bones: Vec<String>,
    /// Configuración de peso
    pub weight: f32,
    /// Configuración de límites
    pub limits: Option<ConstraintLimits>,
}

/// Límites de constraint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstraintLimits {
    /// Límites de posición
    pub position_limits: Option<PositionLimits>,
    /// Límites de rotación
    pub rotation_limits: Option<RotationLimits>,
    /// Límites de escala
    pub scale_limits: Option<ScaleLimits>,
}

/// Límites de posición
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PositionLimits {
    /// Mínimo
    pub min: [f32; 3],
    /// Máximo
    pub max: [f32; 3],
}

/// Límites de rotación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RotationLimits {
    /// Límites de pitch
    pub pitch_limits: [f32; 2],
    /// Límites de yaw
    pub yaw_limits: [f32; 2],
    /// Límites de roll
    pub roll_limits: [f32; 2],
}

/// Límites de escala
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScaleLimits {
    /// Mínimo
    pub min: [f32; 3],
    /// Máximo
    pub max: [f32; 3],
}

/// Datos de morphing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MorphingData {
    /// Targets de morphing
    pub targets: Vec<MorphTarget>,
    /// Keyframes de morphing
    pub keyframes: Vec<MorphKeyframe>,
}

/// Target de morphing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MorphTarget {
    /// ID del target
    pub id: String,
    /// Nombre del target
    pub name: String,
    /// Vértices del target
    pub vertices: Vec<[f32; 3]>,
    /// Normales del target
    pub normals: Vec<[f32; 3]>,
    /// Configuración de influencia
    pub influence_config: InfluenceConfig,
}

/// Keyframe de morphing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MorphKeyframe {
    /// Tiempo del keyframe
    pub time: f32,
    /// ID del target
    pub target_id: String,
    /// Peso del target
    pub weight: f32,
    /// Configuración de interpolación
    pub interpolation: KeyframeInterpolation,
}

/// Datos procedurales
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProceduralData {
    /// Tipo de procedimiento
    pub procedure_type: ProcedureType,
    /// Configuración del procedimiento
    pub config: ProcedureConfig,
    /// Parámetros del procedimiento
    pub parameters: HashMap<String, f32>,
}

/// Tipo de procedimiento
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProcedureType {
    Noise,
    Wave,
    Spring,
    Pendulum,
    Custom(String),
}

/// Configuración de procedimiento
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcedureConfig {
    /// Frecuencia
    pub frequency: f32,
    /// Amplitud
    pub amplitude: f32,
    /// Fase
    pub phase: f32,
    /// Configuración de ruido
    pub noise_config: Option<NoiseConfig>,
}

/// Configuración de ruido
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NoiseConfig {
    /// Tipo de ruido
    pub noise_type: NoiseType,
    /// Octavas
    pub octaves: u32,
    /// Persistencia
    pub persistence: f32,
    /// Lacunaridad
    pub lacunarity: f32,
}

/// Tipo de ruido
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NoiseType {
    Perlin,
    Simplex,
    Worley,
    Custom(String),
}

/// Datos de partículas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParticleData {
    /// Configuración de partículas
    pub particle_config: ParticleConfig,
    /// Keyframes de partículas
    pub keyframes: Vec<ParticleKeyframe>,
}

/// Configuración de partículas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParticleConfig {
    /// Número máximo de partículas
    pub max_particles: u32,
    /// Tasa de emisión
    pub emission_rate: f32,
    /// Vida de las partículas
    pub particle_lifetime: f32,
    /// Configuración de velocidad
    pub velocity_config: VelocityConfig,
    /// Configuración de color
    pub color_config: ColorConfig,
    /// Configuración de tamaño
    pub size_config: SizeConfig,
}

/// Configuración de velocidad
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VelocityConfig {
    /// Velocidad inicial
    pub initial_velocity: [f32; 3],
    /// Variación de velocidad
    pub velocity_variation: [f32; 3],
    /// Aceleración
    pub acceleration: [f32; 3],
}

/// Configuración de color
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColorConfig {
    /// Color inicial
    pub initial_color: [f32; 4],
    /// Color final
    pub final_color: [f32; 4],
    /// Curva de color
    pub color_curve: ColorCurve,
}

/// Curva de color
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ColorCurve {
    Linear,
    EaseIn,
    EaseOut,
    EaseInOut,
    Custom(Vec<[f32; 4]>),
}

/// Configuración de tamaño
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SizeConfig {
    /// Tamaño inicial
    pub initial_size: f32,
    /// Tamaño final
    pub final_size: f32,
    /// Curva de tamaño
    pub size_curve: SizeCurve,
}

/// Curva de tamaño
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SizeCurve {
    Linear,
    EaseIn,
    EaseOut,
    EaseInOut,
    Custom(Vec<f32>),
}

/// Keyframe de partículas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParticleKeyframe {
    /// Tiempo del keyframe
    pub time: f32,
    /// Configuración de partículas
    pub particle_config: ParticleConfig,
    /// Configuración de interpolación
    pub interpolation: KeyframeInterpolation,
}

/// Datos de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraData {
    /// Keyframes de cámara
    pub keyframes: Vec<CameraKeyframe>,
    /// Configuración de cámara
    pub camera_config: CameraConfig,
}

/// Keyframe de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraKeyframe {
    /// Tiempo del keyframe
    pub time: f32,
    /// Transformación de cámara
    pub transform: Transform,
    /// Configuración de cámara
    pub camera_config: CameraConfig,
    /// Configuración de interpolación
    pub interpolation: KeyframeInterpolation,
}

/// Configuración de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraConfig {
    /// Campo de visión
    pub fov: f32,
    /// Relación de aspecto
    pub aspect_ratio: f32,
    /// Plano cercano
    pub near_plane: f32,
    /// Plano lejano
    pub far_plane: f32,
}

/// Datos de luz
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightData {
    /// Keyframes de luz
    pub keyframes: Vec<LightKeyframe>,
    /// Configuración de luz
    pub light_config: LightConfig,
}

/// Keyframe de luz
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightKeyframe {
    /// Tiempo del keyframe
    pub time: f32,
    /// Transformación de luz
    pub transform: Transform,
    /// Configuración de luz
    pub light_config: LightConfig,
    /// Configuración de interpolación
    pub interpolation: KeyframeInterpolation,
}

/// Configuración de luz
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightConfig {
    /// Color de la luz
    pub color: [f32; 3],
    /// Intensidad
    pub intensity: f32,
    /// Rango
    pub range: f32,
}

/// Estado del clip
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipState {
    /// Activo
    pub active: bool,
    /// Cargado
    pub loaded: bool,
    /// Compilado
    pub compiled: bool,
    /// Tiempo de carga
    pub load_time: f32,
}

/// Controlador de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationController {
    /// ID del controlador
    pub id: String,
    /// Nombre del controlador
    pub name: String,
    /// Configuración del controlador
    pub config: ControllerConfig,
    /// Estados del controlador
    pub states: HashMap<String, ControllerState>,
    /// Transiciones del controlador
    pub transitions: Vec<ControllerTransition>,
    /// Estado actual
    pub current_state: Option<String>,
    /// Estado del controlador
    pub state: ControllerState,
}

/// Configuración del controlador
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControllerConfig {
    /// Configuración de blending
    pub blending_config: BlendingConfig,
    /// Configuración de eventos
    pub events_config: EventsConfig,
    /// Configuración de parámetros
    pub parameters_config: ParametersConfig,
}

/// Configuración de eventos
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventsConfig {
    /// Eventos del controlador
    pub events: Vec<ControllerEvent>,
    /// Configuración de callbacks
    pub callbacks: HashMap<String, String>,
}

/// Evento del controlador
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControllerEvent {
    /// Nombre del evento
    pub name: String,
    /// Condición del evento
    pub condition: EventCondition,
    /// Acción del evento
    pub action: EventAction,
}

/// Condición del evento
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventCondition {
    /// Tipo de condición
    pub condition_type: ConditionType,
    /// Parámetros de la condición
    pub parameters: HashMap<String, f32>,
}

/// Tipo de condición
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionType {
    Time,
    Parameter,
    State,
    Custom(String),
}

/// Acción del evento
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventAction {
    /// Tipo de acción
    pub action_type: ActionType,
    /// Parámetros de la acción
    pub parameters: HashMap<String, serde_json::Value>,
}

/// Tipo de acción
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    PlayAnimation,
    StopAnimation,
    SetParameter,
    TriggerEvent,
    Custom(String),
}

/// Configuración de parámetros
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParametersConfig {
    /// Parámetros del controlador
    pub parameters: HashMap<String, ControllerParameter>,
}

/// Parámetro del controlador
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControllerParameter {
    /// Nombre del parámetro
    pub name: String,
    /// Tipo del parámetro
    pub parameter_type: ParameterType,
    /// Valor por defecto
    pub default_value: f32,
    /// Configuración de límites
    pub limits: Option<ParameterLimits>,
}

/// Tipo de parámetro
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ParameterType {
    Float,
    Int,
    Bool,
    Trigger,
    Custom(String),
}

/// Límites de parámetro
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParameterLimits {
    /// Mínimo
    pub min: f32,
    /// Máximo
    pub max: f32,
}

/// Estado del controlador
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControllerState {
    /// ID del estado
    pub id: String,
    /// Nombre del estado
    pub name: String,
    /// Animaciones del estado
    pub animations: Vec<String>,
    /// Configuración del estado
    pub config: StateConfig,
    /// Estado del estado
    pub state: StateState,
}

/// Configuración del estado
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateConfig {
    /// Configuración de blending
    pub blending_config: BlendingConfig,
    /// Configuración de eventos
    pub events_config: EventsConfig,
    /// Configuración de parámetros
    pub parameters_config: ParametersConfig,
}

/// Estado del estado
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateState {
    /// Activo
    pub active: bool,
    /// Tiempo en el estado
    pub time_in_state: f32,
    /// Configuración de transición
    pub transition_config: Option<TransitionConfig>,
}

/// Transición del controlador
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControllerTransition {
    /// Estado de origen
    pub from_state: String,
    /// Estado de destino
    pub to_state: String,
    /// Configuración de transición
    pub config: TransitionConfig,
    /// Condiciones de transición
    pub conditions: Vec<TransitionCondition>,
}

/// Condición de transición
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransitionCondition {
    /// Tipo de condición
    pub condition_type: ConditionType,
    /// Parámetros de la condición
    pub parameters: HashMap<String, f32>,
}

/// Estado del controlador
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControllerState {
    /// Activo
    pub active: bool,
    /// Estado actual
    pub current_state: Option<String>,
    /// Tiempo del controlador
    pub time: f32,
}

impl AnimationSystem {
    /// Crea un nuevo sistema de animaciones
    pub fn new() -> Self {
        info!("🎬 Inicializando sistema de animaciones...");
        
        Self {
            animations: HashMap::new(),
            clips: HashMap::new(),
            controllers: HashMap::new(),
            running: false,
        }
    }

    /// Inicializa el sistema
    pub async fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🚀 Inicializando sistema de animaciones...");
        
        // Cargar animaciones por defecto
        self.load_default_animations().await?;
        
        // Cargar clips por defecto
        self.load_default_clips().await?;
        
        // Cargar controladores por defecto
        self.load_default_controllers().await?;
        
        self.running = true;
        
        info!("✅ Sistema de animaciones inicializado correctamente");
        Ok(())
    }

    /// Actualiza el sistema
    pub async fn update(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        if !self.running {
            return Ok(());
        }
        
        // Actualizar animaciones
        for animation in self.animations.values_mut() {
            if animation.state.active && animation.state.playing {
                self.update_animation(animation, delta_time).await?;
            }
        }
        
        // Actualizar controladores
        for controller in self.controllers.values_mut() {
            if controller.state.active {
                self.update_controller(controller, delta_time).await?;
            }
        }
        
        Ok(())
    }

    /// Limpia el sistema
    pub async fn cleanup(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🧹 Limpiando sistema de animaciones...");
        
        self.running = false;
        self.animations.clear();
        self.clips.clear();
        self.controllers.clear();
        
        info!("✅ Sistema de animaciones limpiado correctamente");
        Ok(())
    }

    /// Carga animaciones por defecto
    async fn load_default_animations(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Animación de idle
        let idle_animation = Animation {
            id: "idle".to_string(),
            name: "Idle".to_string(),
            animation_type: AnimationType::Skeletal,
            config: AnimationConfig {
                duration: 2.0,
                fps: 30.0,
                looped: true,
                interpolation: InterpolationConfig {
                    interpolation_type: InterpolationType::Linear,
                    easing: EasingConfig {
                        easing_type: EasingType::None,
                        parameters: [0.0, 0.0, 0.0, 0.0],
                    },
                    tangents: None,
                },
                blending: None,
                events: vec![],
            },
            clips: vec!["idle_clip".to_string()],
            state: AnimationState {
                active: true,
                playing: false,
                paused: false,
                current_time: 0.0,
                speed: 1.0,
                weight: 1.0,
            },
        };
        
        self.animations.insert(idle_animation.id.clone(), idle_animation);
        
        Ok(())
    }

    /// Carga clips por defecto
    async fn load_default_clips(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Clip de idle
        let idle_clip = AnimationClip {
            id: "idle_clip".to_string(),
            name: "Idle Clip".to_string(),
            clip_type: ClipType::Skeletal,
            config: ClipConfig {
                duration: 2.0,
                fps: 30.0,
                looped: true,
                compression: None,
                optimization: None,
            },
            data: ClipData::Skeletal(SkeletalData {
                bones: vec![],
                keyframes: vec![],
                constraints: vec![],
            }),
            state: ClipState {
                active: true,
                loaded: true,
                compiled: false,
                load_time: 0.0,
            },
        };
        
        self.clips.insert(idle_clip.id.clone(), idle_clip);
        
        Ok(())
    }

    /// Carga controladores por defecto
    async fn load_default_controllers(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Controlador básico
        let basic_controller = AnimationController {
            id: "basic_controller".to_string(),
            name: "Basic Controller".to_string(),
            config: ControllerConfig {
                blending_config: BlendingConfig {
                    blending_type: BlendingType::Linear,
                    transition_duration: 0.3,
                    weight: 1.0,
                    mask: None,
                },
                events_config: EventsConfig {
                    events: vec![],
                    callbacks: HashMap::new(),
                },
                parameters_config: ParametersConfig {
                    parameters: HashMap::new(),
                },
            },
            states: HashMap::new(),
            transitions: vec![],
            current_state: None,
            state: ControllerState {
                active: true,
                current_state: None,
                time: 0.0,
            },
        };
        
        self.controllers.insert(basic_controller.id.clone(), basic_controller);
        
        Ok(())
    }

    /// Actualiza una animación
    async fn update_animation(&self, animation: &mut Animation, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        // Actualizar tiempo de la animación
        animation.state.current_time += delta_time * animation.state.speed;
        
        // Verificar loop
        if animation.state.current_time >= animation.config.duration {
            if animation.config.looped {
                animation.state.current_time = 0.0;
            } else {
                animation.state.playing = false;
                animation.state.current_time = animation.config.duration;
            }
        }
        
        // Procesar eventos
        self.process_animation_events(animation).await?;
        
        Ok(())
    }

    /// Procesa eventos de animación
    async fn process_animation_events(&self, animation: &Animation) -> Result<(), Box<dyn std::error::Error>> {
        for event in &animation.config.events {
            if event.time <= animation.state.current_time {
                // Procesar evento
                debug!("🎬 Evento de animación: {} en tiempo {}", event.name, event.time);
            }
        }
        
        Ok(())
    }

    /// Actualiza un controlador
    async fn update_controller(&self, controller: &mut AnimationController, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        // Actualizar tiempo del controlador
        controller.state.time += delta_time;
        
        // Procesar transiciones
        self.process_controller_transitions(controller).await?;
        
        // Actualizar estado actual
        if let Some(current_state_id) = &controller.current_state {
            if let Some(state) = controller.states.get_mut(current_state_id) {
                state.state.time_in_state += delta_time;
            }
        }
        
        Ok(())
    }

    /// Procesa transiciones del controlador
    async fn process_controller_transitions(&self, controller: &mut AnimationController) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar lógica de transiciones
        Ok(())
    }

    /// Crea una animación
    pub async fn create_animation(&mut self, animation: Animation) -> Result<(), Box<dyn std::error::Error>> {
        let id = animation.id.clone();
        self.animations.insert(id.clone(), animation);
        
        debug!("➕ Animación creada: {} ({})", id, id);
        Ok(())
    }

    /// Obtiene una animación
    pub fn get_animation(&self, id: &str) -> Option<&Animation> {
        self.animations.get(id)
    }

    /// Crea un clip
    pub async fn create_clip(&mut self, clip: AnimationClip) -> Result<(), Box<dyn std::error::Error>> {
        let id = clip.id.clone();
        self.clips.insert(id.clone(), clip);
        
        debug!("➕ Clip creado: {} ({})", id, id);
        Ok(())
    }

    /// Obtiene un clip
    pub fn get_clip(&self, id: &str) -> Option<&AnimationClip> {
        self.clips.get(id)
    }

    /// Crea un controlador
    pub async fn create_controller(&mut self, controller: AnimationController) -> Result<(), Box<dyn std::error::Error>> {
        let id = controller.id.clone();
        self.controllers.insert(id.clone(), controller);
        
        debug!("➕ Controlador creado: {} ({})", id, id);
        Ok(())
    }

    /// Obtiene un controlador
    pub fn get_controller(&self, id: &str) -> Option<&AnimationController> {
        self.controllers.get(id)
    }

    /// Obtiene el estado de salud del sistema
    pub async fn health_check(&self) -> bool {
        self.running
    }

    /// Obtiene estadísticas del sistema
    pub fn get_stats(&self) -> AnimationStats {
        AnimationStats {
            animation_count: self.animations.len(),
            clip_count: self.clips.len(),
            controller_count: self.controllers.len(),
            active_animations: self.animations.values().filter(|a| a.state.active).count(),
            playing_animations: self.animations.values().filter(|a| a.state.playing).count(),
        }
    }
}

/// Estadísticas del sistema de animaciones
#[derive(Debug, Clone)]
pub struct AnimationStats {
    /// Número de animaciones
    pub animation_count: usize,
    /// Número de clips
    pub clip_count: usize,
    /// Número de controladores
    pub controller_count: usize,
    /// Número de animaciones activas
    pub active_animations: usize,
    /// Número de animaciones reproduciéndose
    pub playing_animations: usize,
} 