//! Procesador de Efectos de Audio
//! Implementa efectos como reverb, echo, distorsión, etc.

use std::f32::consts::PI;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Configuración de reverb
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReverbConfig {
    pub room_size: f32,
    pub damping: f32,
    pub wet_level: f32,
    pub dry_level: f32,
    pub width: f32,
}

impl Default for ReverbConfig {
    fn default() -> Self {
        Self {
            room_size: 0.5,
            damping: 0.5,
            wet_level: 0.33,
            dry_level: 0.4,
            width: 1.0,
        }
    }
}

/// Configuración de echo
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EchoConfig {
    pub delay_time: f32,
    pub feedback: f32,
    pub wet_level: f32,
    pub dry_level: f32,
    pub modulation_depth: f32,
    pub modulation_rate: f32,
}

impl Default for EchoConfig {
    fn default() -> Self {
        Self {
            delay_time: 0.3,
            feedback: 0.3,
            wet_level: 0.4,
            dry_level: 0.6,
            modulation_depth: 0.1,
            modulation_rate: 0.5,
        }
    }
}

/// Configuración de distorsión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DistortionConfig {
    pub drive: f32,
    pub tone: f32,
    pub wet_level: f32,
    pub dry_level: f32,
}

impl Default for DistortionConfig {
    fn default() -> Self {
        Self {
            drive: 0.5,
            tone: 0.5,
            wet_level: 0.5,
            dry_level: 0.5,
        }
    }
}

/// Configuración de filtro
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterEffectConfig {
    pub filter_type: FilterEffectType,
    pub frequency: f32,
    pub resonance: f32,
    pub envelope_amount: f32,
    pub lfo_amount: f32,
    pub lfo_rate: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterEffectType {
    LowPass,
    HighPass,
    BandPass,
    Notch,
    AllPass,
}

impl Default for FilterEffectConfig {
    fn default() -> Self {
        Self {
            filter_type: FilterEffectType::LowPass,
            frequency: 1000.0,
            resonance: 0.5,
            envelope_amount: 0.0,
            lfo_amount: 0.0,
            lfo_rate: 1.0,
        }
    }
}

/// Procesador de Efectos de Audio
#[wasm_bindgen]
pub struct AudioEffectsProcessor {
    reverb_config: ReverbConfig,
    echo_config: EchoConfig,
    distortion_config: DistortionConfig,
    filter_config: FilterEffectConfig,
    sample_rate: u32,
    is_active: bool,
    
    // Buffers para efectos
    reverb_buffer: Vec<f32>,
    echo_buffer: Vec<f32>,
    filter_buffer: [f32; 4],
    
    // Contadores de tiempo
    reverb_time: f32,
    echo_time: f32,
    lfo_time: f32,
    
    // Estados de efectos
    reverb_active: bool,
    echo_active: bool,
    distortion_active: bool,
    filter_active: bool,
}

#[wasm_bindgen]
impl AudioEffectsProcessor {
    /// Crear nuevo procesador de efectos
    pub fn new(audio_config: &crate::audio::AudioConfig) -> Self {
        let sample_rate = audio_config.sample_rate;
        let buffer_size = audio_config.buffer_size;
        
        Self {
            reverb_config: ReverbConfig::default(),
            echo_config: EchoConfig::default(),
            distortion_config: DistortionConfig::default(),
            filter_config: FilterEffectConfig::default(),
            sample_rate,
            is_active: false,
            
            reverb_buffer: vec![0.0; (sample_rate as f32 * 3.0) as usize], // 3 segundos
            echo_buffer: vec![0.0; (sample_rate as f32 * 2.0) as usize],   // 2 segundos
            filter_buffer: [0.0; 4],
            
            reverb_time: 0.0,
            echo_time: 0.0,
            lfo_time: 0.0,
            
            reverb_active: true,
            echo_active: false,
            distortion_active: false,
            filter_active: false,
        }
    }

    /// Inicializar el procesador
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.is_active = true;
        self.clear_buffers();
        Ok(())
    }

    /// Limpiar buffers
    fn clear_buffers(&mut self) {
        self.reverb_buffer.fill(0.0);
        self.echo_buffer.fill(0.0);
        self.filter_buffer.fill(0.0);
    }

    /// Procesar muestra de audio con todos los efectos
    pub fn process_sample(&mut self, input: f32) -> f32 {
        if !self.is_active {
            return input;
        }

        let mut sample = input;

        // Aplicar filtro
        if self.filter_active {
            sample = self.apply_filter_effect(sample);
        }

        // Aplicar distorsión
        if self.distortion_active {
            sample = self.apply_distortion_effect(sample);
        }

        // Aplicar echo
        if self.echo_active {
            sample = self.apply_echo_effect(sample);
        }

        // Aplicar reverb
        if self.reverb_active {
            sample = self.apply_reverb_effect(sample);
        }

        // Actualizar contadores de tiempo
        self.reverb_time += 1.0 / self.sample_rate as f32;
        self.echo_time += 1.0 / self.sample_rate as f32;
        self.lfo_time += 1.0 / self.sample_rate as f32;

        sample
    }

    /// Aplicar efecto de reverb
    fn apply_reverb_effect(&mut self, input: f32) -> f32 {
        let room_size = self.reverb_config.room_size;
        let damping = self.reverb_config.damping;
        
        // Calcular índices de delay
        let delay1 = (0.0297 * room_size * self.sample_rate as f32) as usize;
        let delay2 = (0.0371 * room_size * self.sample_rate as f32) as usize;
        let delay3 = (0.0411 * room_size * self.sample_rate as f32) as usize;
        let delay4 = (0.0437 * room_size * self.sample_rate as f32) as usize;
        
        // Obtener muestras retrasadas
        let index = (self.reverb_time * self.sample_rate as f32) as usize;
        let delayed1 = self.reverb_buffer[(index + delay1) % self.reverb_buffer.len()];
        let delayed2 = self.reverb_buffer[(index + delay2) % self.reverb_buffer.len()];
        let delayed3 = self.reverb_buffer[(index + delay3) % self.reverb_buffer.len()];
        let delayed4 = self.reverb_buffer[(index + delay4) % self.reverb_buffer.len()];
        
        // Aplicar damping
        let damped1 = delayed1 * (1.0 - damping);
        let damped2 = delayed2 * (1.0 - damping);
        let damped3 = delayed3 * (1.0 - damping);
        let damped4 = delayed4 * (1.0 - damping);
        
        // Mezclar reverb
        let reverb_output = (damped1 + damped2 + damped3 + damped4) * 0.25;
        
        // Actualizar buffer
        self.reverb_buffer[index % self.reverb_buffer.len()] = input + reverb_output * 0.5;
        
        // Mezclar señal original con reverb
        input * self.reverb_config.dry_level + reverb_output * self.reverb_config.wet_level
    }

    /// Aplicar efecto de echo
    fn apply_echo_effect(&mut self, input: f32) -> f32 {
        let delay_time = self.echo_config.delay_time;
        let feedback = self.echo_config.feedback;
        
        // Calcular índice de delay
        let delay_samples = (delay_time * self.sample_rate as f32) as usize;
        let index = (self.echo_time * self.sample_rate as f32) as usize;
        
        // Obtener muestra retrasada
        let delayed = self.echo_buffer[(index + delay_samples) % self.echo_buffer.len()];
        
        // Aplicar modulación si está habilitada
        let modulation = if self.echo_config.modulation_depth > 0.0 {
            let mod_rate = self.echo_config.modulation_rate;
            let mod_depth = self.echo_config.modulation_depth;
            (2.0 * PI * mod_rate * self.echo_time).sin() * mod_depth
        } else {
            0.0
        };
        
        // Mezclar señal original con echo
        let echo_output = input + delayed * feedback + modulation;
        
        // Actualizar buffer
        self.echo_buffer[index % self.echo_buffer.len()] = echo_output;
        
        // Mezclar señal original con echo
        input * self.echo_config.dry_level + delayed * self.echo_config.wet_level
    }

    /// Aplicar efecto de distorsión
    fn apply_distortion_effect(&mut self, input: f32) -> f32 {
        let drive = self.distortion_config.drive;
        let tone = self.distortion_config.tone;
        
        // Aplicar drive
        let driven = input * (1.0 + drive * 10.0);
        
        // Aplicar distorsión (soft clipping)
        let distorted = if driven > 0.0 {
            1.0 - (-driven).exp()
        } else {
            -1.0 + driven.exp()
        };
        
        // Aplicar filtro de tono
        let filtered = self.apply_tone_filter(distorted, tone);
        
        // Mezclar señal original con distorsión
        input * self.distortion_config.dry_level + filtered * self.distortion_config.wet_level
    }

    /// Aplicar filtro de tono para distorsión
    fn apply_tone_filter(&self, input: f32, tone: f32) -> f32 {
        // Filtro simple de tono
        let cutoff = 200.0 + tone * 3000.0;
        let rc = 1.0 / (2.0 * PI * cutoff);
        let dt = 1.0 / self.sample_rate as f32;
        let alpha = dt / (rc + dt);
        
        input * alpha
    }

    /// Aplicar efecto de filtro
    fn apply_filter_effect(&mut self, input: f32) -> f32 {
        let frequency = self.filter_config.frequency;
        let resonance = self.filter_config.resonance;
        
        // Aplicar modulación LFO si está habilitada
        let modulated_freq = if self.filter_config.lfo_amount > 0.0 {
            let lfo = (2.0 * PI * self.filter_config.lfo_rate * self.lfo_time).sin();
            frequency + lfo * self.filter_config.lfo_amount * frequency
        } else {
            frequency
        };
        
        // Calcular coeficientes del filtro
        let cutoff = modulated_freq / (self.sample_rate as f32 / 2.0);
        let q = 1.0 / resonance;
        let w0 = 2.0 * PI * cutoff;
        let alpha = w0.sin() / (2.0 * q);
        
        let (b0, b1, b2, a1, a2) = match self.filter_config.filter_type {
            FilterEffectType::LowPass => {
                let b0 = (1.0 - w0.cos()) / 2.0;
                let b1 = 1.0 - w0.cos();
                let b2 = (1.0 - w0.cos()) / 2.0;
                let a0 = 1.0 + alpha;
                let a1 = -2.0 * w0.cos();
                let a2 = 1.0 - alpha;
                (b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
            },
            FilterEffectType::HighPass => {
                let b0 = (1.0 + w0.cos()) / 2.0;
                let b1 = -(1.0 + w0.cos());
                let b2 = (1.0 + w0.cos()) / 2.0;
                let a0 = 1.0 + alpha;
                let a1 = -2.0 * w0.cos();
                let a2 = 1.0 - alpha;
                (b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
            },
            FilterEffectType::BandPass => {
                let b0 = alpha;
                let b1 = 0.0;
                let b2 = -alpha;
                let a0 = 1.0 + alpha;
                let a1 = -2.0 * w0.cos();
                let a2 = 1.0 - alpha;
                (b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
            },
            FilterEffectType::Notch => {
                let b0 = 1.0;
                let b1 = -2.0 * w0.cos();
                let b2 = 1.0;
                let a0 = 1.0 + alpha;
                let a1 = -2.0 * w0.cos();
                let a2 = 1.0 - alpha;
                (b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
            },
            FilterEffectType::AllPass => {
                let b0 = 1.0 - alpha;
                let b1 = -2.0 * w0.cos();
                let b2 = 1.0 + alpha;
                let a0 = 1.0 + alpha;
                let a1 = -2.0 * w0.cos();
                let a2 = 1.0 - alpha;
                (b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
            },
        };
        
        // Aplicar filtro
        let output = b0 * input + b1 * self.filter_buffer[0] + b2 * self.filter_buffer[1] -
                     a1 * self.filter_buffer[2] - a2 * self.filter_buffer[3];
        
        // Actualizar buffer
        self.filter_buffer[3] = self.filter_buffer[2];
        self.filter_buffer[2] = output;
        self.filter_buffer[1] = self.filter_buffer[0];
        self.filter_buffer[0] = input;
        
        output
    }

    /// Configurar efecto de reverb
    pub fn set_reverb_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        self.reverb_config = serde_wasm_bindgen::from_value(config)?;
        Ok(())
    }

    /// Configurar efecto de echo
    pub fn set_echo_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        self.echo_config = serde_wasm_bindgen::from_value(config)?;
        Ok(())
    }

    /// Configurar efecto de distorsión
    pub fn set_distortion_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        self.distortion_config = serde_wasm_bindgen::from_value(config)?;
        Ok(())
    }

    /// Configurar efecto de filtro
    pub fn set_filter_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        self.filter_config = serde_wasm_bindgen::from_value(config)?;
        Ok(())
    }

    /// Habilitar/deshabilitar reverb
    pub fn set_reverb_active(&mut self, active: bool) {
        self.reverb_active = active;
    }

    /// Habilitar/deshabilitar echo
    pub fn set_echo_active(&mut self, active: bool) {
        self.echo_active = active;
    }

    /// Habilitar/deshabilitar distorsión
    pub fn set_distortion_active(&mut self, active: bool) {
        self.distortion_active = active;
    }

    /// Habilitar/deshabilitar filtro
    pub fn set_filter_active(&mut self, active: bool) {
        self.filter_active = active;
    }

    /// Crear preset de efectos para ubicación
    pub fn create_location_preset(&mut self, location_type: &str) -> Result<(), JsValue> {
        match location_type {
            "cave" => {
                // Reverb largo y húmedo
                self.reverb_config.room_size = 0.8;
                self.reverb_config.damping = 0.3;
                self.reverb_config.wet_level = 0.6;
                self.reverb_active = true;
                self.echo_active = true;
                self.echo_config.delay_time = 0.5;
                self.echo_config.feedback = 0.4;
            },
            "forest" => {
                // Reverb natural
                self.reverb_config.room_size = 0.4;
                self.reverb_config.damping = 0.6;
                self.reverb_config.wet_level = 0.3;
                self.reverb_active = true;
                self.echo_active = false;
            },
            "ocean" => {
                // Filtro paso bajo para simular agua
                self.filter_config.filter_type = FilterEffectType::LowPass;
                self.filter_config.frequency = 800.0;
                self.filter_active = true;
                self.reverb_active = true;
                self.reverb_config.room_size = 0.6;
            },
            "city" => {
                // Echo corto para simular edificios
                self.echo_config.delay_time = 0.1;
                self.echo_config.feedback = 0.2;
                self.echo_active = true;
                self.reverb_active = true;
                self.reverb_config.room_size = 0.3;
            },
            "space" => {
                // Reverb muy largo
                self.reverb_config.room_size = 1.0;
                self.reverb_config.damping = 0.1;
                self.reverb_config.wet_level = 0.8;
                self.reverb_active = true;
                self.echo_active = true;
                self.echo_config.delay_time = 1.0;
                self.echo_config.feedback = 0.6;
            },
            _ => {
                // Configuración por defecto
                self.reverb_active = false;
                self.echo_active = false;
                self.distortion_active = false;
                self.filter_active = false;
            },
        }
        
        Ok(())
    }

    /// Obtener configuración actual
    pub fn get_config(&self) -> JsValue {
        let config = serde_json::json!({
            "reverb": {
                "config": self.reverb_config,
                "active": self.reverb_active,
            },
            "echo": {
                "config": self.echo_config,
                "active": self.echo_active,
            },
            "distortion": {
                "config": self.distortion_config,
                "active": self.distortion_active,
            },
            "filter": {
                "config": self.filter_config,
                "active": self.filter_active,
            },
        });
        
        serde_wasm_bindgen::to_value(&config).unwrap_or_default()
    }

    /// Detener el procesador
    pub fn stop(&mut self) {
        self.is_active = false;
        self.clear_buffers();
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