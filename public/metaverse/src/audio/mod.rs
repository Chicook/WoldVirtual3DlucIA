//! Sistema de Audio Ambiental para Metaverso
//! Genera sonidos 100% originales para diferentes ubicaciones

pub mod ambient;
pub mod spatial;
pub mod synthesis;
pub mod effects;
pub mod location_audio;

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Configuración global del sistema de audio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioConfig {
    pub master_volume: f32,
    pub ambient_volume: f32,
    pub spatial_volume: f32,
    pub sample_rate: u32,
    pub buffer_size: usize,
    pub enable_3d_audio: bool,
    pub enable_reverb: bool,
    pub enable_echo: bool,
}

impl Default for AudioConfig {
    fn default() -> Self {
        Self {
            master_volume: 0.7,
            ambient_volume: 0.5,
            spatial_volume: 0.6,
            sample_rate: 44100,
            buffer_size: 2048,
            enable_3d_audio: true,
            enable_reverb: true,
            enable_echo: false,
        }
    }
}

/// Gestor principal del sistema de audio
#[wasm_bindgen]
pub struct AudioManager {
    config: AudioConfig,
    ambient_system: ambient::AmbientAudioSystem,
    spatial_system: spatial::SpatialAudioSystem,
    synthesis_engine: synthesis::AudioSynthesisEngine,
    effects_processor: effects::AudioEffectsProcessor,
    location_audio: location_audio::LocationAudioManager,
    active_sounds: HashMap<String, Box<dyn spatial::SpatialSound>>,
}

#[wasm_bindgen]
impl AudioManager {
    /// Crear nuevo gestor de audio
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let config = AudioConfig::default();
        
        Self {
            ambient_system: ambient::AmbientAudioSystem::new(&config),
            spatial_system: spatial::SpatialAudioSystem::new(&config),
            synthesis_engine: synthesis::AudioSynthesisEngine::new(&config),
            effects_processor: effects::AudioEffectsProcessor::new(&config),
            location_audio: location_audio::LocationAudioManager::new(&config),
            active_sounds: HashMap::new(),
            config,
        }
    }

    /// Inicializar el sistema de audio
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.ambient_system.initialize()?;
        self.spatial_system.initialize()?;
        self.synthesis_engine.initialize()?;
        self.effects_processor.initialize()?;
        self.location_audio.initialize()?;
        
        Ok(())
    }

    /// Generar sonido ambiental para una ubicación específica
    pub fn generate_ambient_sound(&mut self, location_type: &str, intensity: f32) -> Result<(), JsValue> {
        let ambient_sound = self.ambient_system.generate_location_ambient(location_type, intensity)?;
        self.active_sounds.insert(
            format!("ambient_{}", location_type),
            Box::new(ambient_sound)
        );
        Ok(())
    }

    /// Cambiar ubicación del usuario y actualizar audio
    pub fn change_location(&mut self, new_location: &str, transition_duration: f32) -> Result<(), JsValue> {
        self.location_audio.transition_to_location(new_location, transition_duration)?;
        Ok(())
    }

    /// Obtener configuración de audio
    pub fn get_config(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.config).unwrap_or_default()
    }

    /// Actualizar configuración de audio
    pub fn update_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        let new_config: AudioConfig = serde_wasm_bindgen::from_value(config)?;
        self.config = new_config;
        
        // Aplicar nueva configuración a todos los sistemas
        self.ambient_system.update_config(&self.config);
        self.spatial_system.update_config(&self.config);
        self.synthesis_engine.update_config(&self.config);
        self.effects_processor.update_config(&self.config);
        self.location_audio.update_config(&self.config);
        
        Ok(())
    }

    /// Procesar frame de audio
    pub fn process_audio_frame(&mut self, output_buffer: &mut [f32]) -> Result<(), JsValue> {
        // Procesar audio ambiental
        let ambient_buffer = self.ambient_system.process_frame()?;
        
        // Procesar audio espacial
        let spatial_buffer = self.spatial_system.process_frame()?;
        
        // Mezclar buffers
        for i in 0..output_buffer.len() {
            output_buffer[i] = ambient_buffer[i] * self.config.ambient_volume +
                              spatial_buffer[i] * self.config.spatial_volume;
            
            // Aplicar efectos
            output_buffer[i] = self.effects_processor.process_sample(output_buffer[i]);
            
            // Aplicar volumen maestro
            output_buffer[i] *= self.config.master_volume;
            
            // Clipping
            output_buffer[i] = output_buffer[i].max(-1.0).min(1.0);
        }
        
        Ok(())
    }

    /// Detener todos los sonidos
    pub fn stop_all_sounds(&mut self) {
        self.active_sounds.clear();
        self.ambient_system.stop();
        self.spatial_system.stop();
    }

    /// Obtener estadísticas del sistema de audio
    pub fn get_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "active_sounds": self.active_sounds.len(),
            "ambient_active": self.ambient_system.is_active(),
            "spatial_active": self.spatial_system.is_active(),
            "current_location": self.location_audio.get_current_location(),
            "cpu_usage": self.get_cpu_usage(),
        });
        
        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }

    /// Obtener uso de CPU del sistema de audio
    fn get_cpu_usage(&self) -> f32 {
        // Simulación de uso de CPU basado en sonidos activos
        let base_usage = 0.1;
        let sound_usage = self.active_sounds.len() as f32 * 0.05;
        (base_usage + sound_usage).min(1.0)
    }
}

impl Drop for AudioManager {
    fn drop(&mut self) {
        self.stop_all_sounds();
    }
} 