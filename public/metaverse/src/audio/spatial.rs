//! Sistema de Audio Espacial 3D
//! Maneja posicionamiento y efectos espaciales de sonidos

use std::f32::consts::PI;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Posición 3D en el espacio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position3D {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

impl Position3D {
    pub fn new(x: f32, y: f32, z: f32) -> Self {
        Self { x, y, z }
    }

    pub fn distance_to(&self, other: &Position3D) -> f32 {
        ((self.x - other.x).powi(2) + 
         (self.y - other.y).powi(2) + 
         (self.z - other.z).powi(2)).sqrt()
    }

    pub fn normalize(&self) -> Self {
        let length = (self.x.powi(2) + self.y.powi(2) + self.z.powi(2)).sqrt();
        if length > 0.0 {
            Self {
                x: self.x / length,
                y: self.y / length,
                z: self.z / length,
            }
        } else {
            Self { x: 0.0, y: 0.0, z: 0.0 }
        }
    }
}

/// Orientación del oyente
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListenerOrientation {
    pub forward: Position3D,
    pub up: Position3D,
    pub right: Position3D,
}

impl Default for ListenerOrientation {
    fn default() -> Self {
        Self {
            forward: Position3D::new(0.0, 0.0, -1.0),
            up: Position3D::new(0.0, 1.0, 0.0),
            right: Position3D::new(1.0, 0.0, 0.0),
        }
    }
}

/// Configuración de audio espacial
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpatialConfig {
    pub max_distance: f32,
    pub min_distance: f32,
    pub rolloff_factor: f32,
    pub doppler_factor: f32,
    pub speed_of_sound: f32,
    pub enable_doppler: bool,
    pub enable_occlusion: bool,
    pub enable_reverb_zones: bool,
}

impl Default for SpatialConfig {
    fn default() -> Self {
        Self {
            max_distance: 100.0,
            min_distance: 1.0,
            rolloff_factor: 1.0,
            doppler_factor: 1.0,
            speed_of_sound: 343.0,
            enable_doppler: true,
            enable_occlusion: true,
            enable_reverb_zones: true,
        }
    }
}

/// Trait para sonidos espaciales
pub trait SpatialSound {
    fn get_sample(&mut self) -> f32;
    fn get_position(&self) -> (f32, f32, f32);
    fn is_finished(&self) -> bool;
    fn get_volume(&self) -> f32 { 1.0 }
    fn get_pitch(&self) -> f32 { 1.0 }
}

/// Sistema de Audio Espacial
#[wasm_bindgen]
pub struct SpatialAudioSystem {
    config: SpatialConfig,
    listener_position: Position3D,
    listener_orientation: ListenerOrientation,
    listener_velocity: Position3D,
    sounds: Vec<Box<dyn SpatialSound>>,
    reverb_zones: Vec<ReverbZone>,
    occlusion_objects: Vec<OcclusionObject>,
    sample_rate: u32,
    is_active: bool,
}

/// Zona de reverb
#[derive(Debug, Clone)]
pub struct ReverbZone {
    pub position: Position3D,
    pub radius: f32,
    pub reverb_level: f32,
    pub room_size: f32,
    pub damping: f32,
}

/// Objeto de oclusión
#[derive(Debug, Clone)]
pub struct OcclusionObject {
    pub position: Position3D,
    pub size: f32,
    pub occlusion_factor: f32,
}

#[wasm_bindgen]
impl SpatialAudioSystem {
    /// Crear nuevo sistema de audio espacial
    pub fn new(audio_config: &crate::audio::AudioConfig) -> Self {
        Self {
            config: SpatialConfig::default(),
            listener_position: Position3D::new(0.0, 0.0, 0.0),
            listener_orientation: ListenerOrientation::default(),
            listener_velocity: Position3D::new(0.0, 0.0, 0.0),
            sounds: Vec::new(),
            reverb_zones: Vec::new(),
            occlusion_objects: Vec::new(),
            sample_rate: audio_config.sample_rate,
            is_active: false,
        }
    }

    /// Inicializar el sistema
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.is_active = true;
        self.setup_default_reverb_zones();
        self.setup_default_occlusion_objects();
        Ok(())
    }

    /// Configurar zonas de reverb por defecto
    fn setup_default_reverb_zones(&mut self) {
        // Zona de reverb para cuevas
        self.reverb_zones.push(ReverbZone {
            position: Position3D::new(50.0, 0.0, 50.0),
            radius: 30.0,
            reverb_level: 0.8,
            room_size: 100.0,
            damping: 0.3,
        });

        // Zona de reverb para espacios abiertos
        self.reverb_zones.push(ReverbZone {
            position: Position3D::new(-50.0, 0.0, -50.0),
            radius: 50.0,
            reverb_level: 0.2,
            room_size: 200.0,
            damping: 0.7,
        });
    }

    /// Configurar objetos de oclusión por defecto
    fn setup_default_occlusion_objects(&mut self) {
        // Muro
        self.occlusion_objects.push(OcclusionObject {
            position: Position3D::new(20.0, 0.0, 0.0),
            size: 10.0,
            occlusion_factor: 0.6,
        });

        // Montaña
        self.occlusion_objects.push(OcclusionObject {
            position: Position3D::new(-30.0, 0.0, 30.0),
            size: 25.0,
            occlusion_factor: 0.8,
        });
    }

    /// Añadir sonido espacial
    pub fn add_sound(&mut self, sound: Box<dyn SpatialSound>) {
        self.sounds.push(sound);
    }

    /// Actualizar posición del oyente
    pub fn update_listener_position(&mut self, x: f32, y: f32, z: f32) {
        self.listener_position = Position3D::new(x, y, z);
    }

    /// Actualizar orientación del oyente
    pub fn update_listener_orientation(&mut self, forward: (f32, f32, f32), up: (f32, f32, f32)) {
        self.listener_orientation.forward = Position3D::new(forward.0, forward.1, forward.2);
        self.listener_orientation.up = Position3D::new(up.0, up.1, up.2);
        
        // Calcular vector derecho
        let forward_vec = &self.listener_orientation.forward;
        let up_vec = &self.listener_orientation.up;
        
        self.listener_orientation.right = Position3D::new(
            forward_vec.y * up_vec.z - forward_vec.z * up_vec.y,
            forward_vec.z * up_vec.x - forward_vec.x * up_vec.z,
            forward_vec.x * up_vec.y - forward_vec.y * up_vec.x,
        );
    }

    /// Actualizar velocidad del oyente
    pub fn update_listener_velocity(&mut self, x: f32, y: f32, z: f32) {
        self.listener_velocity = Position3D::new(x, y, z);
    }

    /// Procesar frame de audio espacial
    pub fn process_frame(&mut self) -> Result<Vec<f32>, JsValue> {
        if !self.is_active {
            return Ok(vec![0.0; 2048]); // Buffer por defecto
        }

        let buffer_size = 2048;
        let mut left_channel = vec![0.0; buffer_size];
        let mut right_channel = vec![0.0; buffer_size];

        // Procesar cada sonido
        for sound in &mut self.sounds {
            if sound.is_finished() {
                continue;
            }

            let sound_pos = sound.get_position();
            let sound_position = Position3D::new(sound_pos.0, sound_pos.1, sound_pos.2);
            
            // Calcular distancia y dirección
            let distance = self.listener_position.distance_to(&sound_position);
            let direction = Position3D::new(
                sound_position.x - self.listener_position.x,
                sound_position.y - self.listener_position.y,
                sound_position.z - self.listener_position.z,
            ).normalize();

            // Aplicar atenuación por distancia
            let volume = self.calculate_distance_attenuation(distance) * sound.get_volume();

            // Aplicar efecto Doppler
            let pitch = if self.config.enable_doppler {
                self.calculate_doppler_effect(&sound_position, distance)
            } else {
                1.0
            } * sound.get_pitch();

            // Aplicar oclusión
            let occlusion_factor = if self.config.enable_occlusion {
                self.calculate_occlusion(&sound_position)
            } else {
                1.0
            };

            // Calcular balance estéreo
            let (left_gain, right_gain) = self.calculate_stereo_balance(&direction);

            // Generar muestra de audio
            for i in 0..buffer_size {
                let sample = sound.get_sample() * volume * occlusion_factor;
                
                left_channel[i] += sample * left_gain;
                right_channel[i] += sample * right_gain;
            }
        }

        // Aplicar reverb de zona
        if self.config.enable_reverb_zones {
            self.apply_reverb_zones(&mut left_channel, &mut right_channel);
        }

        // Mezclar canales
        let mut output = vec![0.0; buffer_size];
        for i in 0..buffer_size {
            output[i] = (left_channel[i] + right_channel[i]) * 0.5;
        }

        Ok(output)
    }

    /// Calcular atenuación por distancia
    fn calculate_distance_attenuation(&self, distance: f32) -> f32 {
        if distance <= self.config.min_distance {
            return 1.0;
        }

        if distance >= self.config.max_distance {
            return 0.0;
        }

        let rolloff = self.config.rolloff_factor;
        let factor = (self.config.min_distance / distance).powf(rolloff);
        
        factor.max(0.0).min(1.0)
    }

    /// Calcular efecto Doppler
    fn calculate_doppler_effect(&self, sound_position: &Position3D, distance: f32) -> f32 {
        if !self.config.enable_doppler {
            return 1.0;
        }

        // Velocidad relativa entre oyente y fuente
        let relative_velocity = self.listener_velocity.x + self.listener_velocity.y + self.listener_velocity.z;
        
        // Fórmula Doppler simplificada
        let doppler_shift = (self.config.speed_of_sound + relative_velocity) / 
                           (self.config.speed_of_sound - relative_velocity);
        
        doppler_shift.max(0.5).min(2.0)
    }

    /// Calcular oclusión
    fn calculate_occlusion(&self, sound_position: &Position3D) -> f32 {
        let mut total_occlusion = 1.0;

        for occlusion_obj in &self.occlusion_objects {
            let distance_to_object = sound_position.distance_to(&occlusion_obj.position);
            
            if distance_to_object < occlusion_obj.size {
                let occlusion_factor = 1.0 - (distance_to_object / occlusion_obj.size) * occlusion_obj.occlusion_factor;
                total_occlusion *= occlusion_factor;
            }
        }

        total_occlusion.max(0.1).min(1.0)
    }

    /// Calcular balance estéreo
    fn calculate_stereo_balance(&self, direction: &Position3D) -> (f32, f32) {
        // Proyectar dirección en el plano horizontal del oyente
        let forward = &self.listener_orientation.forward;
        let right = &self.listener_orientation.right;
        
        let forward_component = direction.x * forward.x + direction.z * forward.z;
        let right_component = direction.x * right.x + direction.z * right.z;
        
        // Convertir a balance estéreo
        let angle = right_component.atan2(forward_component);
        let normalized_angle = angle / PI;
        
        let left_gain = (1.0 - normalized_angle).max(0.0).min(1.0);
        let right_gain = (1.0 + normalized_angle).max(0.0).min(1.0);
        
        (left_gain, right_gain)
    }

    /// Aplicar reverb de zonas
    fn apply_reverb_zones(&self, left_channel: &mut [f32], right_channel: &mut [f32]) {
        for zone in &self.reverb_zones {
            let distance_to_zone = self.listener_position.distance_to(&zone.position);
            
            if distance_to_zone <= zone.radius {
                let reverb_intensity = 1.0 - (distance_to_zone / zone.radius);
                
                // Aplicar reverb simple
                for i in 0..left_channel.len() {
                    let reverb_sample = if i >= 1000 {
                        left_channel[i - 1000] * reverb_intensity * zone.reverb_level
                    } else {
                        0.0
                    };
                    
                    left_channel[i] += reverb_sample * 0.3;
                    right_channel[i] += reverb_sample * 0.3;
                }
            }
        }
    }

    /// Añadir zona de reverb
    pub fn add_reverb_zone(&mut self, position: (f32, f32, f32), radius: f32, reverb_level: f32) {
        self.reverb_zones.push(ReverbZone {
            position: Position3D::new(position.0, position.1, position.2),
            radius,
            reverb_level,
            room_size: 100.0,
            damping: 0.5,
        });
    }

    /// Añadir objeto de oclusión
    pub fn add_occlusion_object(&mut self, position: (f32, f32, f32), size: f32, occlusion_factor: f32) {
        self.occlusion_objects.push(OcclusionObject {
            position: Position3D::new(position.0, position.1, position.2),
            size,
            occlusion_factor,
        });
    }

    /// Limpiar sonidos terminados
    pub fn cleanup_finished_sounds(&mut self) {
        self.sounds.retain(|sound| !sound.is_finished());
    }

    /// Detener el sistema
    pub fn stop(&mut self) {
        self.is_active = false;
        self.sounds.clear();
    }

    /// Verificar si está activo
    pub fn is_active(&self) -> bool {
        self.is_active
    }

    /// Actualizar configuración
    pub fn update_config(&mut self, audio_config: &crate::audio::AudioConfig) {
        self.sample_rate = audio_config.sample_rate;
    }

    /// Obtener estadísticas del sistema
    pub fn get_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "active_sounds": self.sounds.len(),
            "reverb_zones": self.reverb_zones.len(),
            "occlusion_objects": self.occlusion_objects.len(),
            "listener_position": {
                "x": self.listener_position.x,
                "y": self.listener_position.y,
                "z": self.listener_position.z,
            }
        });
        
        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }
} 