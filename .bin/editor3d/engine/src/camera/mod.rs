//! # Sistema de Cámaras
//! 
//! Sistema de gestión de cámaras 3D para el metaverso.
//! Proporciona diferentes tipos de cámaras y controles.

use serde::{Serialize, Deserialize};
use tracing::{info, debug};

/// Cámara principal del metaverso
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Camera {
    /// ID de la cámara
    pub id: String,
    /// Nombre de la cámara
    pub name: String,
    /// Tipo de cámara
    pub camera_type: CameraType,
    /// Transformación
    pub transform: CameraTransform,
    /// Configuración de la cámara
    pub config: CameraConfig,
    /// Controles de la cámara
    pub controls: CameraControls,
    /// Estado de la cámara
    pub state: CameraState,
}

/// Tipo de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CameraType {
    Perspective,
    Orthographic,
    VR,
    AR,
    Cinematic,
    Follow,
    Orbit,
}

/// Transformación de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraTransform {
    /// Posición
    pub position: [f32; 3],
    /// Rotación (cuaternión)
    pub rotation: [f32; 4],
    /// Escala
    pub scale: [f32; 3],
    /// Matriz de vista
    pub view_matrix: [[f32; 4]; 4],
    /// Matriz de proyección
    pub projection_matrix: [[f32; 4]; 4],
    /// Matriz de vista-proyección
    pub view_projection_matrix: [[f32; 4]; 4],
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
    /// Configuración específica
    pub specific_config: CameraSpecificConfig,
}

/// Configuración específica de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CameraSpecificConfig {
    Perspective(PerspectiveConfig),
    Orthographic(OrthographicConfig),
    VR(VRConfig),
    AR(ARConfig),
    Cinematic(CinematicConfig),
    Follow(FollowConfig),
    Orbit(OrbitConfig),
}

/// Configuración de perspectiva
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerspectiveConfig {
    /// Campo de visión
    pub fov: f32,
    /// Relación de aspecto
    pub aspect_ratio: f32,
}

/// Configuración de ortográfica
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrthographicConfig {
    /// Ancho
    pub width: f32,
    /// Alto
    pub height: f32,
}

/// Configuración de VR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VRConfig {
    /// Configuración de HMD
    pub hmd_config: HMDConfig,
    /// Configuración de controladores
    pub controller_config: ControllerConfig,
}

/// Configuración de HMD
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HMDConfig {
    /// Tipo de HMD
    pub hmd_type: HMDType,
    /// Resolución por ojo
    pub resolution_per_eye: (u32, u32),
    /// Campo de visión por ojo
    pub fov_per_eye: [f32; 4],
}

/// Tipo de HMD
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HMDType {
    OculusQuest,
    HTCVive,
    ValveIndex,
    Custom(String),
}

/// Configuración de controladores
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControllerConfig {
    /// Número de controladores
    pub controller_count: u32,
    /// Configuración de tracking
    pub tracking_config: TrackingConfig,
}

/// Configuración de tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackingConfig {
    /// Tipo de tracking
    pub tracking_type: TrackingType,
    /// Precisión
    pub precision: f32,
}

/// Tipo de tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrackingType {
    InsideOut,
    OutsideIn,
    Hybrid,
}

/// Configuración de AR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ARConfig {
    /// Configuración de tracking de mundo
    pub world_tracking_config: WorldTrackingConfig,
    /// Configuración de reconocimiento de objetos
    pub object_recognition_config: ObjectRecognitionConfig,
}

/// Configuración de tracking de mundo
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldTrackingConfig {
    /// Habilitado
    pub enabled: bool,
    /// Configuración de SLAM
    pub slam_config: SLAMConfig,
}

/// Configuración de SLAM
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SLAMConfig {
    /// Tipo de SLAM
    pub slam_type: SLAMType,
    /// Configuración de mapeo
    pub mapping_config: MappingConfig,
}

/// Tipo de SLAM
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SLAMType {
    Visual,
    VisualInertial,
    LiDAR,
}

/// Configuración de mapeo
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MappingConfig {
    /// Resolución del mapa
    pub map_resolution: f32,
    /// Tamaño del mapa
    pub map_size: [f32; 3],
}

/// Configuración de reconocimiento de objetos
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectRecognitionConfig {
    /// Habilitado
    pub enabled: bool,
    /// Modelos de objetos
    pub object_models: Vec<String>,
}

/// Configuración de cámara cinematográfica
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CinematicConfig {
    /// Configuración de movimiento
    pub movement_config: CinematicMovementConfig,
    /// Configuración de efectos
    pub effects_config: CinematicEffectsConfig,
}

/// Configuración de movimiento cinematográfico
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CinematicMovementConfig {
    /// Tipo de movimiento
    pub movement_type: CinematicMovementType,
    /// Velocidad de movimiento
    pub movement_speed: f32,
    /// Suavizado
    pub smoothing: f32,
}

/// Tipo de movimiento cinematográfico
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CinematicMovementType {
    Dolly,
    Crane,
    Handheld,
    Steadicam,
    Custom(String),
}

/// Configuración de efectos cinematográficos
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CinematicEffectsConfig {
    /// Profundidad de campo
    pub depth_of_field: bool,
    /// Motion blur
    pub motion_blur: bool,
    /// Lens flare
    pub lens_flare: bool,
}

/// Configuración de cámara de seguimiento
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FollowConfig {
    /// Objeto a seguir
    pub target_id: String,
    /// Configuración de seguimiento
    pub follow_config: FollowSettings,
}

/// Configuración de seguimiento
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FollowSettings {
    /// Distancia de seguimiento
    pub follow_distance: f32,
    /// Altura de seguimiento
    pub follow_height: f32,
    /// Suavizado
    pub smoothing: f32,
    /// Configuración de look-at
    pub look_at_config: LookAtConfig,
}

/// Configuración de look-at
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LookAtConfig {
    /// Habilitado
    pub enabled: bool,
    /// Offset de look-at
    pub look_at_offset: [f32; 3],
    /// Suavizado
    pub smoothing: f32,
}

/// Configuración de cámara orbital
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrbitConfig {
    /// Centro de órbita
    pub orbit_center: [f32; 3],
    /// Configuración de órbita
    pub orbit_config: OrbitSettings,
}

/// Configuración de órbita
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrbitSettings {
    /// Radio de órbita
    pub orbit_radius: f32,
    /// Ángulo horizontal
    pub horizontal_angle: f32,
    /// Ángulo vertical
    pub vertical_angle: f32,
    /// Velocidad de rotación
    pub rotation_speed: f32,
    /// Límites de ángulo vertical
    pub vertical_limits: [f32; 2],
}

/// Controles de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraControls {
    /// Tipo de control
    pub control_type: ControlType,
    /// Configuración de controles
    pub control_config: ControlConfig,
    /// Estado de los controles
    pub control_state: ControlState,
}

/// Tipo de control
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ControlType {
    Free,
    Orbit,
    FirstPerson,
    ThirdPerson,
    Cinematic,
    VR,
    AR,
}

/// Configuración de controles
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControlConfig {
    /// Sensibilidad del mouse
    pub mouse_sensitivity: f32,
    /// Sensibilidad del teclado
    pub keyboard_sensitivity: f32,
    /// Configuración de teclas
    pub key_config: KeyConfig,
    /// Configuración de límites
    pub limit_config: LimitConfig,
}

/// Configuración de teclas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyConfig {
    /// Tecla de movimiento hacia adelante
    pub forward_key: String,
    /// Tecla de movimiento hacia atrás
    pub backward_key: String,
    /// Tecla de movimiento hacia la izquierda
    pub left_key: String,
    /// Tecla de movimiento hacia la derecha
    pub right_key: String,
    /// Tecla de movimiento hacia arriba
    pub up_key: String,
    /// Tecla de movimiento hacia abajo
    pub down_key: String,
}

/// Configuración de límites
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LimitConfig {
    /// Límites de posición
    pub position_limits: Option<PositionLimits>,
    /// Límites de rotación
    pub rotation_limits: Option<RotationLimits>,
    /// Límites de zoom
    pub zoom_limits: Option<ZoomLimits>,
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

/// Límites de zoom
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ZoomLimits {
    /// Mínimo
    pub min: f32,
    /// Máximo
    pub max: f32,
}

/// Estado de controles
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControlState {
    /// Movimiento hacia adelante
    pub forward: bool,
    /// Movimiento hacia atrás
    pub backward: bool,
    /// Movimiento hacia la izquierda
    pub left: bool,
    /// Movimiento hacia la derecha
    pub right: bool,
    /// Movimiento hacia arriba
    pub up: bool,
    /// Movimiento hacia abajo
    pub down: bool,
    /// Rotación del mouse
    pub mouse_rotation: [f32; 2],
    /// Zoom del mouse
    pub mouse_zoom: f32,
}

/// Estado de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraState {
    /// Activa
    pub active: bool,
    /// Pausada
    pub paused: bool,
    /// Tiempo de la cámara
    pub time: f32,
    /// Delta time
    pub delta_time: f32,
}

impl Camera {
    /// Crea una nueva cámara
    pub fn new(id: &str, name: &str, camera_type: CameraType) -> Self {
        info!("📷 Creando cámara: {} ({})", name, id);
        
        let config = match camera_type {
            CameraType::Perspective => CameraConfig {
                fov: 75.0,
                aspect_ratio: 16.0 / 9.0,
                near_plane: 0.1,
                far_plane: 1000.0,
                specific_config: CameraSpecificConfig::Perspective(PerspectiveConfig {
                    fov: 75.0,
                    aspect_ratio: 16.0 / 9.0,
                }),
            },
            CameraType::Orthographic => CameraConfig {
                fov: 0.0,
                aspect_ratio: 16.0 / 9.0,
                near_plane: 0.1,
                far_plane: 1000.0,
                specific_config: CameraSpecificConfig::Orthographic(OrthographicConfig {
                    width: 10.0,
                    height: 10.0,
                }),
            },
            _ => CameraConfig {
                fov: 75.0,
                aspect_ratio: 16.0 / 9.0,
                near_plane: 0.1,
                far_plane: 1000.0,
                specific_config: CameraSpecificConfig::Perspective(PerspectiveConfig {
                    fov: 75.0,
                    aspect_ratio: 16.0 / 9.0,
                }),
            },
        };
        
        Self {
            id: id.to_string(),
            name: name.to_string(),
            camera_type,
            transform: CameraTransform {
                position: [0.0, 0.0, 5.0],
                rotation: [0.0, 0.0, 0.0, 1.0],
                scale: [1.0, 1.0, 1.0],
                view_matrix: [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]],
                projection_matrix: [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]],
                view_projection_matrix: [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]],
            },
            config,
            controls: CameraControls {
                control_type: ControlType::Free,
                control_config: ControlConfig {
                    mouse_sensitivity: 1.0,
                    keyboard_sensitivity: 1.0,
                    key_config: KeyConfig {
                        forward_key: "w".to_string(),
                        backward_key: "s".to_string(),
                        left_key: "a".to_string(),
                        right_key: "d".to_string(),
                        up_key: "space".to_string(),
                        down_key: "shift".to_string(),
                    },
                    limit_config: LimitConfig {
                        position_limits: None,
                        rotation_limits: None,
                        zoom_limits: None,
                    },
                },
                control_state: ControlState {
                    forward: false,
                    backward: false,
                    left: false,
                    right: false,
                    up: false,
                    down: false,
                    mouse_rotation: [0.0, 0.0],
                    mouse_zoom: 0.0,
                },
            },
            state: CameraState {
                active: true,
                paused: false,
                time: 0.0,
                delta_time: 0.0,
            },
        }
    }

    /// Actualiza la cámara
    pub fn update(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        if !self.state.active || self.state.paused {
            return Ok(());
        }
        
        // Actualizar tiempo de la cámara
        self.state.delta_time = delta_time;
        self.state.time += delta_time;
        
        // Actualizar controles
        self.update_controls(delta_time)?;
        
        // Actualizar transformación
        self.update_transform()?;
        
        // Actualizar matrices
        self.update_matrices()?;
        
        Ok(())
    }

    /// Actualiza controles de la cámara
    fn update_controls(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        match self.controls.control_type {
            ControlType::Free => self.update_free_controls(delta_time)?,
            ControlType::Orbit => self.update_orbit_controls(delta_time)?,
            ControlType::FirstPerson => self.update_first_person_controls(delta_time)?,
            ControlType::ThirdPerson => self.update_third_person_controls(delta_time)?,
            ControlType::Cinematic => self.update_cinematic_controls(delta_time)?,
            ControlType::VR => self.update_vr_controls(delta_time)?,
            ControlType::AR => self.update_ar_controls(delta_time)?,
        }
        
        Ok(())
    }

    /// Actualiza controles libres
    fn update_free_controls(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        let speed = self.controls.control_config.keyboard_sensitivity * delta_time;
        
        // Movimiento basado en el estado de los controles
        if self.controls.control_state.forward {
            self.move_forward(speed);
        }
        if self.controls.control_state.backward {
            self.move_backward(speed);
        }
        if self.controls.control_state.left {
            self.move_left(speed);
        }
        if self.controls.control_state.right {
            self.move_right(speed);
        }
        if self.controls.control_state.up {
            self.move_up(speed);
        }
        if self.controls.control_state.down {
            self.move_down(speed);
        }
        
        // Rotación del mouse
        if self.controls.control_state.mouse_rotation[0] != 0.0 || self.controls.control_state.mouse_rotation[1] != 0.0 {
            self.rotate_mouse(
                self.controls.control_state.mouse_rotation[0],
                self.controls.control_state.mouse_rotation[1]
            );
        }
        
        Ok(())
    }

    /// Actualiza controles orbitales
    fn update_orbit_controls(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar controles orbitales
        Ok(())
    }

    /// Actualiza controles de primera persona
    fn update_first_person_controls(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar controles de primera persona
        Ok(())
    }

    /// Actualiza controles de tercera persona
    fn update_third_person_controls(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar controles de tercera persona
        Ok(())
    }

    /// Actualiza controles cinematográficos
    fn update_cinematic_controls(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar controles cinematográficos
        Ok(())
    }

    /// Actualiza controles VR
    fn update_vr_controls(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar controles VR
        Ok(())
    }

    /// Actualiza controles AR
    fn update_ar_controls(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar controles AR
        Ok(())
    }

    /// Actualiza transformación
    fn update_transform(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Aplicar límites de posición
        if let Some(limits) = &self.controls.control_config.limit_config.position_limits {
            self.transform.position[0] = self.transform.position[0].max(limits.min[0]).min(limits.max[0]);
            self.transform.position[1] = self.transform.position[1].max(limits.min[1]).min(limits.max[1]);
            self.transform.position[2] = self.transform.position[2].max(limits.min[2]).min(limits.max[2]);
        }
        
        Ok(())
    }

    /// Actualiza matrices
    fn update_matrices(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Actualizar matriz de vista
        self.update_view_matrix()?;
        
        // Actualizar matriz de proyección
        self.update_projection_matrix()?;
        
        // Actualizar matriz de vista-proyección
        self.update_view_projection_matrix()?;
        
        Ok(())
    }

    /// Actualiza matriz de vista
    fn update_view_matrix(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar cálculo de matriz de vista
        // Por ahora, matriz identidad
        self.transform.view_matrix = [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]];
        
        Ok(())
    }

    /// Actualiza matriz de proyección
    fn update_projection_matrix(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar cálculo de matriz de proyección
        // Por ahora, matriz identidad
        self.transform.projection_matrix = [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]];
        
        Ok(())
    }

    /// Actualiza matriz de vista-proyección
    fn update_view_projection_matrix(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar multiplicación de matrices
        // Por ahora, matriz identidad
        self.transform.view_projection_matrix = [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]];
        
        Ok(())
    }

    /// Mueve la cámara hacia adelante
    fn move_forward(&mut self, speed: f32) {
        // Implementar movimiento hacia adelante
        self.transform.position[2] -= speed;
    }

    /// Mueve la cámara hacia atrás
    fn move_backward(&mut self, speed: f32) {
        // Implementar movimiento hacia atrás
        self.transform.position[2] += speed;
    }

    /// Mueve la cámara hacia la izquierda
    fn move_left(&mut self, speed: f32) {
        // Implementar movimiento hacia la izquierda
        self.transform.position[0] -= speed;
    }

    /// Mueve la cámara hacia la derecha
    fn move_right(&mut self, speed: f32) {
        // Implementar movimiento hacia la derecha
        self.transform.position[0] += speed;
    }

    /// Mueve la cámara hacia arriba
    fn move_up(&mut self, speed: f32) {
        // Implementar movimiento hacia arriba
        self.transform.position[1] += speed;
    }

    /// Mueve la cámara hacia abajo
    fn move_down(&mut self, speed: f32) {
        // Implementar movimiento hacia abajo
        self.transform.position[1] -= speed;
    }

    /// Rota la cámara con el mouse
    fn rotate_mouse(&mut self, delta_x: f32, delta_y: f32) {
        // Implementar rotación con mouse
        let sensitivity = self.controls.control_config.mouse_sensitivity;
        
        // Convertir cuaternión a euler, aplicar rotación, convertir de vuelta
        // Por ahora, implementación simplificada
    }

    /// Obtiene la posición de la cámara
    pub fn get_position(&self) -> [f32; 3] {
        self.transform.position
    }

    /// Establece la posición de la cámara
    pub fn set_position(&mut self, position: [f32; 3]) {
        self.transform.position = position;
    }

    /// Obtiene la rotación de la cámara
    pub fn get_rotation(&self) -> [f32; 4] {
        self.transform.rotation
    }

    /// Establece la rotación de la cámara
    pub fn set_rotation(&mut self, rotation: [f32; 4]) {
        self.transform.rotation = rotation;
    }

    /// Obtiene la matriz de vista
    pub fn get_view_matrix(&self) -> [[f32; 4]; 4] {
        self.transform.view_matrix
    }

    /// Obtiene la matriz de proyección
    pub fn get_projection_matrix(&self) -> [[f32; 4]; 4] {
        self.transform.projection_matrix
    }

    /// Obtiene la matriz de vista-proyección
    pub fn get_view_projection_matrix(&self) -> [[f32; 4]; 4] {
        self.transform.view_projection_matrix
    }

    /// Obtiene el campo de visión
    pub fn get_fov(&self) -> f32 {
        self.config.fov
    }

    /// Establece el campo de visión
    pub fn set_fov(&mut self, fov: f32) {
        self.config.fov = fov;
    }

    /// Obtiene la relación de aspecto
    pub fn get_aspect_ratio(&self) -> f32 {
        self.config.aspect_ratio
    }

    /// Establece la relación de aspecto
    pub fn set_aspect_ratio(&mut self, aspect_ratio: f32) {
        self.config.aspect_ratio = aspect_ratio;
    }
} 