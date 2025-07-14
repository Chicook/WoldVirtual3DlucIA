//! Sistema de Audio Ambiental Generado por Código
//! Crea sonidos únicos para cada ubicación del metaverso

use std::f32::consts::PI;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use crate::audio::synthesis::AudioSynthesisEngine;

/// Tipos de ubicaciones ambientales
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LocationType {
    Forest,      // Bosque mágico
    Ocean,       // Océano profundo
    Mountain,    // Montañas nevadas
    Desert,      // Desierto místico
    City,        // Ciudad futurista
    Cave,        // Cueva cristalina
    Space,       // Espacio exterior
    Underwater,  // Mundo submarino
    Volcano,     // Volcán activo
    Ice,         // Glaciar
    Storm,       // Tormenta eléctrica
    Peaceful,    // Jardín zen
}

/// Configuración de sonido ambiental
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AmbientConfig {
    pub base_frequency: f32,
    pub modulation_depth: f32,
    pub reverb_time: f32,
    pub echo_delay: f32,
    pub noise_level: f32,
    pub harmonic_content: f32,
    pub wind_intensity: f32,
    pub water_flow: f32,
}

impl Default for AmbientConfig {
    fn default() -> Self {
        Self {
            base_frequency: 220.0,
            modulation_depth: 0.3,
            reverb_time: 2.0,
            echo_delay: 0.1,
            noise_level: 0.1,
            harmonic_content: 0.5,
            wind_intensity: 0.2,
            water_flow: 0.0,
        }
    }
}

/// Sistema de Audio Ambiental
#[wasm_bindgen]
pub struct AmbientAudioSystem {
    synthesis_engine: AudioSynthesisEngine,
    config: AmbientConfig,
    current_location: Option<LocationType>,
    time: f32,
    sample_rate: u32,
    is_active: bool,
    oscillators: Vec<f32>,
    noise_buffer: Vec<f32>,
    reverb_buffer: Vec<f32>,
    echo_buffer: Vec<f32>,
}

#[wasm_bindgen]
impl AmbientAudioSystem {
    /// Crear nuevo sistema de audio ambiental
    pub fn new(audio_config: &crate::audio::AudioConfig) -> Self {
        let sample_rate = audio_config.sample_rate;
        let buffer_size = audio_config.buffer_size;
        
        Self {
            synthesis_engine: AudioSynthesisEngine::new(audio_config),
            config: AmbientConfig::default(),
            current_location: None,
            time: 0.0,
            sample_rate,
            is_active: false,
            oscillators: vec![0.0; 8], // 8 osciladores para sonidos complejos
            noise_buffer: vec![0.0; buffer_size],
            reverb_buffer: vec![0.0; (sample_rate as f32 * 3.0) as usize], // 3 segundos de reverb
            echo_buffer: vec![0.0; buffer_size],
        }
    }

    /// Inicializar el sistema
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.synthesis_engine.initialize()?;
        self.generate_noise_buffer();
        self.is_active = true;
        Ok(())
    }

    /// Generar sonido ambiental para una ubicación específica
    pub fn generate_location_ambient(&mut self, location_type: &str, intensity: f32) -> Result<Box<dyn crate::audio::spatial::SpatialSound>, JsValue> {
        let location = self.parse_location_type(location_type)?;
        self.current_location = Some(location.clone());
        
        // Configurar parámetros según la ubicación
        self.configure_location_ambient(&location, intensity);
        
        // Crear sonido espacial
        let spatial_sound = Box::new(AmbientSpatialSound {
            location_type: location,
            intensity,
            time: 0.0,
            sample_rate: self.sample_rate,
        });
        
        Ok(spatial_sound)
    }

    /// Configurar parámetros ambientales para una ubicación
    fn configure_location_ambient(&mut self, location: &LocationType, intensity: f32) {
        match location {
            LocationType::Forest => {
                self.config.base_frequency = 180.0 + intensity * 40.0;
                self.config.modulation_depth = 0.4;
                self.config.reverb_time = 3.0;
                self.config.noise_level = 0.15;
                self.config.harmonic_content = 0.6;
                self.config.wind_intensity = 0.3;
                self.config.water_flow = 0.1;
            },
            LocationType::Ocean => {
                self.config.base_frequency = 60.0 + intensity * 30.0;
                self.config.modulation_depth = 0.6;
                self.config.reverb_time = 4.0;
                self.config.noise_level = 0.25;
                self.config.harmonic_content = 0.3;
                self.config.wind_intensity = 0.5;
                self.config.water_flow = 0.8;
            },
            LocationType::Mountain => {
                self.config.base_frequency = 120.0 + intensity * 60.0;
                self.config.modulation_depth = 0.2;
                self.config.reverb_time = 5.0;
                self.config.noise_level = 0.1;
                self.config.harmonic_content = 0.7;
                self.config.wind_intensity = 0.7;
                self.config.water_flow = 0.05;
            },
            LocationType::Desert => {
                self.config.base_frequency = 90.0 + intensity * 50.0;
                self.config.modulation_depth = 0.8;
                self.config.reverb_time = 2.5;
                self.config.noise_level = 0.2;
                self.config.harmonic_content = 0.4;
                self.config.wind_intensity = 0.6;
                self.config.water_flow = 0.0;
            },
            LocationType::City => {
                self.config.base_frequency = 440.0 + intensity * 200.0;
                self.config.modulation_depth = 0.3;
                self.config.reverb_time = 1.5;
                self.config.noise_level = 0.3;
                self.config.harmonic_content = 0.8;
                self.config.wind_intensity = 0.2;
                self.config.water_flow = 0.0;
            },
            LocationType::Cave => {
                self.config.base_frequency = 80.0 + intensity * 40.0;
                self.config.modulation_depth = 0.5;
                self.config.reverb_time = 6.0;
                self.config.noise_level = 0.05;
                self.config.harmonic_content = 0.2;
                self.config.wind_intensity = 0.1;
                self.config.water_flow = 0.2;
            },
            LocationType::Space => {
                self.config.base_frequency = 200.0 + intensity * 300.0;
                self.config.modulation_depth = 0.9;
                self.config.reverb_time = 8.0;
                self.config.noise_level = 0.02;
                self.config.harmonic_content = 0.9;
                self.config.wind_intensity = 0.0;
                self.config.water_flow = 0.0;
            },
            LocationType::Underwater => {
                self.config.base_frequency = 40.0 + intensity * 20.0;
                self.config.modulation_depth = 0.7;
                self.config.reverb_time = 3.5;
                self.config.noise_level = 0.1;
                self.config.harmonic_content = 0.1;
                self.config.wind_intensity = 0.0;
                self.config.water_flow = 1.0;
            },
            LocationType::Volcano => {
                self.config.base_frequency = 150.0 + intensity * 100.0;
                self.config.modulation_depth = 0.6;
                self.config.reverb_time = 2.0;
                self.config.noise_level = 0.4;
                self.config.harmonic_content = 0.5;
                self.config.wind_intensity = 0.8;
                self.config.water_flow = 0.0;
            },
            LocationType::Ice => {
                self.config.base_frequency = 300.0 + intensity * 150.0;
                self.config.modulation_depth = 0.1;
                self.config.reverb_time = 4.5;
                self.config.noise_level = 0.05;
                self.config.harmonic_content = 0.8;
                self.config.wind_intensity = 0.4;
                self.config.water_flow = 0.0;
            },
            LocationType::Storm => {
                self.config.base_frequency = 100.0 + intensity * 80.0;
                self.config.modulation_depth = 0.8;
                self.config.reverb_time = 2.5;
                self.config.noise_level = 0.5;
                self.config.harmonic_content = 0.3;
                self.config.wind_intensity = 1.0;
                self.config.water_flow = 0.3;
            },
            LocationType::Peaceful => {
                self.config.base_frequency = 220.0 + intensity * 60.0;
                self.config.modulation_depth = 0.2;
                self.config.reverb_time = 3.0;
                self.config.noise_level = 0.02;
                self.config.harmonic_content = 0.7;
                self.config.wind_intensity = 0.1;
                self.config.water_flow = 0.1;
            },
        }
    }

    /// Procesar frame de audio ambiental
    pub fn process_frame(&mut self) -> Result<Vec<f32>, JsValue> {
        if !self.is_active {
            return Ok(vec![0.0; self.synthesis_engine.get_buffer_size()]);
        }

        let buffer_size = self.synthesis_engine.get_buffer_size();
        let mut output = vec![0.0; buffer_size];
        
        for i in 0..buffer_size {
            let sample = self.generate_ambient_sample();
            output[i] = sample;
            
            // Aplicar reverb
            output[i] = self.apply_reverb(output[i]);
            
            // Aplicar echo
            output[i] = self.apply_echo(output[i]);
            
            self.time += 1.0 / self.sample_rate as f32;
        }
        
        Ok(output)
    }

    /// Generar muestra de audio ambiental
    fn generate_ambient_sample(&mut self) -> f32 {
        let mut sample = 0.0;
        
        // Oscilador principal
        let main_freq = self.config.base_frequency;
        let main_osc = (2.0 * PI * main_freq * self.time).sin();
        
        // Modulación de frecuencia
        let mod_freq = main_freq * 0.1;
        let modulation = (2.0 * PI * mod_freq * self.time).sin() * self.config.modulation_depth;
        
        // Oscilador modulado
        let modulated_osc = (2.0 * PI * (main_freq + modulation) * self.time).sin();
        
        // Armónicos
        for harmonic in 2..=4 {
            let harmonic_freq = main_freq * harmonic as f32;
            let harmonic_osc = (2.0 * PI * harmonic_freq * self.time).sin();
            sample += harmonic_osc * self.config.harmonic_content / harmonic as f32;
        }
        
        // Ruido ambiental
        let noise = self.get_noise_sample();
        sample += noise * self.config.noise_level;
        
        // Viento
        let wind = self.generate_wind_sound();
        sample += wind * self.config.wind_intensity;
        
        // Agua
        let water = self.generate_water_sound();
        sample += water * self.config.water_flow;
        
        // Mezclar todo
        sample = sample * 0.3 + modulated_osc * 0.7;
        
        // Normalizar
        sample = sample.max(-1.0).min(1.0);
        
        sample
    }

    /// Generar ruido ambiental
    fn get_noise_sample(&self) -> f32 {
        let index = (self.time * self.sample_rate as f32) as usize % self.noise_buffer.len();
        self.noise_buffer[index]
    }

    /// Generar sonido de viento
    fn generate_wind_sound(&self) -> f32 {
        let wind_freq = 0.5 + (self.time * 0.1).sin() * 0.3;
        let wind_osc = (2.0 * PI * wind_freq * self.time).sin();
        let wind_noise = self.get_noise_sample();
        
        wind_osc * 0.3 + wind_noise * 0.7
    }

    /// Generar sonido de agua
    fn generate_water_sound(&self) -> f32 {
        let water_freq = 2.0 + (self.time * 0.05).sin() * 1.0;
        let water_osc = (2.0 * PI * water_freq * self.time).sin();
        let water_noise = self.get_noise_sample();
        
        water_osc * 0.2 + water_noise * 0.8
    }

    /// Aplicar reverb
    fn apply_reverb(&mut self, input: f32) -> f32 {
        let reverb_time = self.config.reverb_time;
        let decay = (-3.0 / (reverb_time * self.sample_rate as f32)).exp();
        
        let reverb_index = (self.time * self.sample_rate as f32) as usize % self.reverb_buffer.len();
        let delayed = self.reverb_buffer[reverb_index];
        
        self.reverb_buffer[reverb_index] = input + delayed * decay;
        
        input + delayed * 0.3
    }

    /// Aplicar echo
    fn apply_echo(&mut self, input: f32) -> f32 {
        let echo_delay = self.config.echo_delay;
        let delay_samples = (echo_delay * self.sample_rate as f32) as usize;
        
        let echo_index = (self.time * self.sample_rate as f32) as usize % self.echo_buffer.len();
        let delayed = self.echo_buffer[echo_index];
        
        self.echo_buffer[echo_index] = input;
        
        input + delayed * 0.5
    }

    /// Generar buffer de ruido
    fn generate_noise_buffer(&mut self) {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        
        for i in 0..self.noise_buffer.len() {
            self.noise_buffer[i] = rng.gen_range(-1.0..1.0);
        }
    }

    /// Parsear tipo de ubicación desde string
    fn parse_location_type(&self, location_str: &str) -> Result<LocationType, JsValue> {
        match location_str.to_lowercase().as_str() {
            "forest" => Ok(LocationType::Forest),
            "ocean" => Ok(LocationType::Ocean),
            "mountain" => Ok(LocationType::Mountain),
            "desert" => Ok(LocationType::Desert),
            "city" => Ok(LocationType::City),
            "cave" => Ok(LocationType::Cave),
            "space" => Ok(LocationType::Space),
            "underwater" => Ok(LocationType::Underwater),
            "volcano" => Ok(LocationType::Volcano),
            "ice" => Ok(LocationType::Ice),
            "storm" => Ok(LocationType::Storm),
            "peaceful" => Ok(LocationType::Peaceful),
            _ => Err(JsValue::from_str("Tipo de ubicación no válido")),
        }
    }

    /// Detener el sistema
    pub fn stop(&mut self) {
        self.is_active = false;
    }

    /// Verificar si está activo
    pub fn is_active(&self) -> bool {
        self.is_active
    }

    /// Actualizar configuración
    pub fn update_config(&mut self, audio_config: &crate::audio::AudioConfig) {
        self.sample_rate = audio_config.sample_rate;
    }
}

/// Sonido espacial ambiental
pub struct AmbientSpatialSound {
    location_type: LocationType,
    intensity: f32,
    time: f32,
    sample_rate: u32,
}

impl crate::audio::spatial::SpatialSound for AmbientSpatialSound {
    fn get_sample(&mut self) -> f32 {
        // Implementación similar al sistema principal pero simplificada
        let freq = match self.location_type {
            LocationType::Forest => 180.0,
            LocationType::Ocean => 60.0,
            LocationType::Mountain => 120.0,
            LocationType::Desert => 90.0,
            LocationType::City => 440.0,
            LocationType::Cave => 80.0,
            LocationType::Space => 200.0,
            LocationType::Underwater => 40.0,
            LocationType::Volcano => 150.0,
            LocationType::Ice => 300.0,
            LocationType::Storm => 100.0,
            LocationType::Peaceful => 220.0,
        };
        
        let sample = (2.0 * PI * freq * self.time).sin();
        self.time += 1.0 / self.sample_rate as f32;
        
        sample * self.intensity
    }

    fn get_position(&self) -> (f32, f32, f32) {
        (0.0, 0.0, 0.0) // Sonido ambiental omnidireccional
    }

    fn is_finished(&self) -> bool {
        false // Sonido ambiental continuo
    }
} 