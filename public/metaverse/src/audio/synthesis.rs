//! Motor de Síntesis de Audio
//! Genera sonidos originales usando síntesis digital

use std::f32::consts::PI;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Tipos de ondas para síntesis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Waveform {
    Sine,
    Square,
    Sawtooth,
    Triangle,
    Noise,
    Custom,
}

/// Configuración de oscilador
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OscillatorConfig {
    pub waveform: Waveform,
    pub frequency: f32,
    pub amplitude: f32,
    pub phase: f32,
    pub modulation_frequency: f32,
    pub modulation_depth: f32,
}

impl Default for OscillatorConfig {
    fn default() -> Self {
        Self {
            waveform: Waveform::Sine,
            frequency: 440.0,
            amplitude: 1.0,
            phase: 0.0,
            modulation_frequency: 0.0,
            modulation_depth: 0.0,
        }
    }
}

/// Configuración de filtro
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterConfig {
    pub filter_type: FilterType,
    pub cutoff_frequency: f32,
    pub resonance: f32,
    pub envelope_amount: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterType {
    LowPass,
    HighPass,
    BandPass,
    Notch,
}

impl Default for FilterConfig {
    fn default() -> Self {
        Self {
            filter_type: FilterType::LowPass,
            cutoff_frequency: 2000.0,
            resonance: 0.5,
            envelope_amount: 0.0,
        }
    }
}

/// Configuración de envolvente
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvelopeConfig {
    pub attack_time: f32,
    pub decay_time: f32,
    pub sustain_level: f32,
    pub release_time: f32,
}

impl Default for EnvelopeConfig {
    fn default() -> Self {
        Self {
            attack_time: 0.01,
            decay_time: 0.1,
            sustain_level: 0.7,
            release_time: 0.5,
        }
    }
}

/// Motor de Síntesis de Audio
#[wasm_bindgen]
pub struct AudioSynthesisEngine {
    sample_rate: u32,
    buffer_size: usize,
    oscillators: Vec<Oscillator>,
    filters: Vec<Filter>,
    envelopes: Vec<Envelope>,
    lfo: Vec<LFO>,
    time: f32,
    is_active: bool,
}

/// Oscilador individual
struct Oscillator {
    config: OscillatorConfig,
    time: f32,
    sample_rate: u32,
}

/// Filtro digital
struct Filter {
    config: FilterConfig,
    buffer: [f32; 4], // Buffer para filtro de segundo orden
    sample_rate: u32,
}

/// Envolvente ADSR
struct Envelope {
    config: EnvelopeConfig,
    state: EnvelopeState,
    level: f32,
    time: f32,
    sample_rate: u32,
}

#[derive(Debug, Clone)]
enum EnvelopeState {
    Attack,
    Decay,
    Sustain,
    Release,
    Off,
}

/// Oscilador de baja frecuencia (LFO)
struct LFO {
    frequency: f32,
    waveform: Waveform,
    time: f32,
    sample_rate: u32,
}

#[wasm_bindgen]
impl AudioSynthesisEngine {
    /// Crear nuevo motor de síntesis
    pub fn new(audio_config: &crate::audio::AudioConfig) -> Self {
        Self {
            sample_rate: audio_config.sample_rate,
            buffer_size: audio_config.buffer_size,
            oscillators: Vec::new(),
            filters: Vec::new(),
            envelopes: Vec::new(),
            lfo: Vec::new(),
            time: 0.0,
            is_active: false,
        }
    }

    /// Inicializar el motor
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.is_active = true;
        self.setup_default_oscillators();
        self.setup_default_filters();
        self.setup_default_envelopes();
        self.setup_default_lfo();
        Ok(())
    }

    /// Configurar osciladores por defecto
    fn setup_default_oscillators(&mut self) {
        // Oscilador principal
        self.oscillators.push(Oscillator {
            config: OscillatorConfig {
                waveform: Waveform::Sine,
                frequency: 440.0,
                amplitude: 1.0,
                phase: 0.0,
                modulation_frequency: 5.0,
                modulation_depth: 0.1,
            },
            time: 0.0,
            sample_rate: self.sample_rate,
        });

        // Oscilador de modulación
        self.oscillators.push(Oscillator {
            config: OscillatorConfig {
                waveform: Waveform::Sine,
                frequency: 220.0,
                amplitude: 0.5,
                phase: 0.0,
                modulation_frequency: 0.0,
                modulation_depth: 0.0,
            },
            time: 0.0,
            sample_rate: self.sample_rate,
        });
    }

    /// Configurar filtros por defecto
    fn setup_default_filters(&mut self) {
        self.filters.push(Filter {
            config: FilterConfig::default(),
            buffer: [0.0; 4],
            sample_rate: self.sample_rate,
        });
    }

    /// Configurar envolventes por defecto
    fn setup_default_envelopes(&mut self) {
        self.envelopes.push(Envelope {
            config: EnvelopeConfig::default(),
            state: EnvelopeState::Off,
            level: 0.0,
            time: 0.0,
            sample_rate: self.sample_rate,
        });
    }

    /// Configurar LFO por defecto
    fn setup_default_lfo(&mut self) {
        self.lfo.push(LFO {
            frequency: 2.0,
            waveform: Waveform::Sine,
            time: 0.0,
            sample_rate: self.sample_rate,
        });
    }

    /// Generar sonido de naturaleza
    pub fn generate_nature_sound(&mut self, nature_type: &str, duration: f32) -> Result<Vec<f32>, JsValue> {
        let samples = (duration * self.sample_rate as f32) as usize;
        let mut output = vec![0.0; samples];

        match nature_type {
            "wind" => self.generate_wind_sound(&mut output)?,
            "water" => self.generate_water_sound(&mut output)?,
            "fire" => self.generate_fire_sound(&mut output)?,
            "thunder" => self.generate_thunder_sound(&mut output)?,
            "birds" => self.generate_birds_sound(&mut output)?,
            "waves" => self.generate_waves_sound(&mut output)?,
            "rain" => self.generate_rain_sound(&mut output)?,
            "forest" => self.generate_forest_sound(&mut output)?,
            _ => return Err(JsValue::from_str("Tipo de sonido de naturaleza no válido")),
        }

        Ok(output)
    }

    /// Generar sonido de viento
    fn generate_wind_sound(&mut self, output: &mut [f32]) -> Result<(), JsValue> {
        for i in 0..output.len() {
            let time = i as f32 / self.sample_rate as f32;
            
            // Frecuencia variable para simular viento
            let base_freq = 0.5 + (time * 0.1).sin() * 0.3;
            let wind_osc = (2.0 * PI * base_freq * time).sin();
            
            // Ruido de viento
            let noise = self.generate_noise(time);
            
            // Modulación de amplitud
            let amplitude_mod = (2.0 * PI * 0.05 * time).sin() * 0.5 + 0.5;
            
            output[i] = (wind_osc * 0.3 + noise * 0.7) * amplitude_mod;
        }
        Ok(())
    }

    /// Generar sonido de agua
    fn generate_water_sound(&mut self, output: &mut [f32]) -> Result<(), JsValue> {
        for i in 0..output.len() {
            let time = i as f32 / self.sample_rate as f32;
            
            // Frecuencias múltiples para simular agua
            let freq1 = 2.0 + (time * 0.02).sin() * 1.0;
            let freq2 = 4.0 + (time * 0.03).sin() * 2.0;
            
            let water_osc1 = (2.0 * PI * freq1 * time).sin();
            let water_osc2 = (2.0 * PI * freq2 * time).sin();
            
            // Ruido de agua
            let noise = self.generate_noise(time);
            
            output[i] = (water_osc1 * 0.2 + water_osc2 * 0.3 + noise * 0.5) * 0.7;
        }
        Ok(())
    }

    /// Generar sonido de fuego
    fn generate_fire_sound(&mut self, output: &mut [f32]) -> Result<(), JsValue> {
        for i in 0..output.len() {
            let time = i as f32 / self.sample_rate as f32;
            
            // Frecuencias aleatorias para simular fuego
            let freq1 = 100.0 + (time * 50.0).sin() * 50.0;
            let freq2 = 200.0 + (time * 30.0).sin() * 30.0;
            
            let fire_osc1 = (2.0 * PI * freq1 * time).sin();
            let fire_osc2 = (2.0 * PI * freq2 * time).sin();
            
            // Ruido de fuego
            let noise = self.generate_noise(time);
            
            // Modulación de amplitud
            let amplitude_mod = (2.0 * PI * 0.1 * time).sin() * 0.3 + 0.7;
            
            output[i] = (fire_osc1 * 0.4 + fire_osc2 * 0.3 + noise * 0.3) * amplitude_mod;
        }
        Ok(())
    }

    /// Generar sonido de trueno
    fn generate_thunder_sound(&mut self, output: &mut [f32]) -> Result<(), JsValue> {
        for i in 0..output.len() {
            let time = i as f32 / self.sample_rate as f32;
            
            // Frecuencia baja para trueno
            let freq = 80.0 + (time * 20.0).sin() * 20.0;
            let thunder_osc = (2.0 * PI * freq * time).sin();
            
            // Ruido de trueno
            let noise = self.generate_noise(time);
            
            // Envolvente de trueno
            let envelope = if time < 0.1 {
                time / 0.1
            } else if time < 1.0 {
                1.0 - (time - 0.1) / 0.9
            } else {
                0.0
            };
            
            output[i] = (thunder_osc * 0.6 + noise * 0.4) * envelope;
        }
        Ok(())
    }

    /// Generar sonido de pájaros
    fn generate_birds_sound(&mut self, output: &mut [f32]) -> Result<(), JsValue> {
        for i in 0..output.len() {
            let time = i as f32 / self.sample_rate as f32;
            
            // Múltiples frecuencias para diferentes pájaros
            let freq1 = 800.0 + (time * 100.0).sin() * 100.0;
            let freq2 = 1200.0 + (time * 150.0).sin() * 150.0;
            let freq3 = 600.0 + (time * 80.0).sin() * 80.0;
            
            let bird1 = (2.0 * PI * freq1 * time).sin();
            let bird2 = (2.0 * PI * freq2 * time).sin();
            let bird3 = (2.0 * PI * freq3 * time).sin();
            
            // Modulación de amplitud para simular canto
            let mod1 = (2.0 * PI * 5.0 * time).sin() * 0.5 + 0.5;
            let mod2 = (2.0 * PI * 3.0 * time).sin() * 0.5 + 0.5;
            let mod3 = (2.0 * PI * 7.0 * time).sin() * 0.5 + 0.5;
            
            output[i] = (bird1 * mod1 * 0.3 + bird2 * mod2 * 0.3 + bird3 * mod3 * 0.3) * 0.5;
        }
        Ok(())
    }

    /// Generar sonido de olas
    fn generate_waves_sound(&mut self, output: &mut [f32]) -> Result<(), JsValue> {
        for i in 0..output.len() {
            let time = i as f32 / self.sample_rate as f32;
            
            // Frecuencias bajas para olas
            let freq1 = 0.5 + (time * 0.1).sin() * 0.2;
            let freq2 = 1.0 + (time * 0.15).sin() * 0.3;
            
            let wave1 = (2.0 * PI * freq1 * time).sin();
            let wave2 = (2.0 * PI * freq2 * time).sin();
            
            // Ruido de olas
            let noise = self.generate_noise(time);
            
            // Modulación de amplitud
            let amplitude_mod = (2.0 * PI * 0.02 * time).sin() * 0.3 + 0.7;
            
            output[i] = (wave1 * 0.4 + wave2 * 0.3 + noise * 0.3) * amplitude_mod;
        }
        Ok(())
    }

    /// Generar sonido de lluvia
    fn generate_rain_sound(&mut self, output: &mut [f32]) -> Result<(), JsValue> {
        for i in 0..output.len() {
            let time = i as f32 / self.sample_rate as f32;
            
            // Ruido de lluvia
            let noise = self.generate_noise(time);
            
            // Filtro paso bajo para simular gotas
            let filtered_noise = self.apply_lowpass_filter(noise, 2000.0);
            
            // Modulación de amplitud
            let amplitude_mod = (2.0 * PI * 0.05 * time).sin() * 0.2 + 0.8;
            
            output[i] = filtered_noise * amplitude_mod * 0.6;
        }
        Ok(())
    }

    /// Generar sonido de bosque
    fn generate_forest_sound(&mut self, output: &mut [f32]) -> Result<(), JsValue> {
        for i in 0..output.len() {
            let time = i as f32 / self.sample_rate as f32;
            
            // Combinación de múltiples sonidos naturales
            let wind = self.generate_wind_sample(time);
            let leaves = self.generate_leaves_sample(time);
            let distant_birds = self.generate_distant_birds_sample(time);
            
            output[i] = (wind * 0.4 + leaves * 0.3 + distant_birds * 0.2) * 0.7;
        }
        Ok(())
    }

    /// Generar muestra de viento
    fn generate_wind_sample(&self, time: f32) -> f32 {
        let freq = 0.3 + (time * 0.05).sin() * 0.2;
        (2.0 * PI * freq * time).sin() * 0.5
    }

    /// Generar muestra de hojas
    fn generate_leaves_sample(&self, time: f32) -> f32 {
        let freq = 2.0 + (time * 0.1).sin() * 1.0;
        (2.0 * PI * freq * time).sin() * 0.3
    }

    /// Generar muestra de pájaros distantes
    fn generate_distant_birds_sample(&self, time: f32) -> f32 {
        let freq = 400.0 + (time * 50.0).sin() * 50.0;
        (2.0 * PI * freq * time).sin() * 0.2
    }

    /// Generar ruido
    fn generate_noise(&self, time: f32) -> f32 {
        // Ruido pseudo-aleatorio simple
        let seed = (time * 10000.0) as u32;
        let x = seed ^ (seed << 13);
        let y = x ^ (x >> 17);
        let z = y ^ (y << 5);
        (z as f32 / u32::MAX as f32) * 2.0 - 1.0
    }

    /// Aplicar filtro paso bajo
    fn apply_lowpass_filter(&self, input: f32, cutoff: f32) -> f32 {
        let rc = 1.0 / (2.0 * PI * cutoff);
        let dt = 1.0 / self.sample_rate as f32;
        let alpha = dt / (rc + dt);
        
        // Implementación simple de filtro paso bajo
        input * alpha
    }

    /// Procesar muestra de audio
    pub fn process_sample(&mut self, input: f32) -> f32 {
        if !self.is_active {
            return input;
        }

        let mut sample = input;

        // Procesar osciladores
        for oscillator in &mut self.oscillators {
            sample += oscillator.get_sample();
        }

        // Procesar filtros
        for filter in &mut self.filters {
            sample = filter.process(sample);
        }

        // Procesar envolventes
        for envelope in &mut self.envelopes {
            sample *= envelope.get_level();
        }

        // Procesar LFO
        for lfo in &mut self.lfo {
            sample *= lfo.get_sample() * 0.1 + 0.9;
        }

        self.time += 1.0 / self.sample_rate as f32;
        sample
    }

    /// Obtener tamaño del buffer
    pub fn get_buffer_size(&self) -> usize {
        self.buffer_size
    }

    /// Detener el motor
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
        self.buffer_size = audio_config.buffer_size;
    }
}

impl Oscillator {
    fn get_sample(&mut self) -> f32 {
        let frequency = self.config.frequency + 
                       self.config.modulation_depth * 
                       (2.0 * PI * self.config.modulation_frequency * self.time).sin();
        
        let sample = match self.config.waveform {
            Waveform::Sine => (2.0 * PI * frequency * self.time + self.config.phase).sin(),
            Waveform::Square => {
                let sine = (2.0 * PI * frequency * self.time + self.config.phase).sin();
                if sine > 0.0 { 1.0 } else { -1.0 }
            },
            Waveform::Sawtooth => {
                let phase = (frequency * self.time + self.config.phase / (2.0 * PI)) % 1.0;
                2.0 * phase - 1.0
            },
            Waveform::Triangle => {
                let phase = (frequency * self.time + self.config.phase / (2.0 * PI)) % 1.0;
                if phase < 0.5 {
                    4.0 * phase - 1.0
                } else {
                    3.0 - 4.0 * phase
                }
            },
            Waveform::Noise => {
                let seed = (self.time * 10000.0) as u32;
                let x = seed ^ (seed << 13);
                let y = x ^ (x >> 17);
                let z = y ^ (y << 5);
                (z as f32 / u32::MAX as f32) * 2.0 - 1.0
            },
            Waveform::Custom => {
                // Implementación personalizada
                (2.0 * PI * frequency * self.time + self.config.phase).sin() * 0.5
            },
        };

        self.time += 1.0 / self.sample_rate as f32;
        sample * self.config.amplitude
    }
}

impl Filter {
    fn process(&mut self, input: f32) -> f32 {
        // Implementación simple de filtro digital
        let cutoff = self.config.cutoff_frequency / (self.sample_rate as f32 / 2.0);
        let resonance = self.config.resonance;
        
        let q = 1.0 / resonance;
        let w0 = 2.0 * PI * cutoff;
        let alpha = w0.sin() / (2.0 * q);
        
        let b0 = 1.0 + alpha;
        let b1 = -2.0 * w0.cos();
        let b2 = 1.0 - alpha;
        let a0 = 1.0 + alpha;
        let a1 = -2.0 * w0.cos();
        let a2 = 1.0 - alpha;
        
        // Aplicar filtro
        let output = (b0 * input + b1 * self.buffer[0] + b2 * self.buffer[1] -
                     a1 * self.buffer[2] - a2 * self.buffer[3]) / a0;
        
        // Actualizar buffer
        self.buffer[3] = self.buffer[2];
        self.buffer[2] = output;
        self.buffer[1] = self.buffer[0];
        self.buffer[0] = input;
        
        output
    }
}

impl Envelope {
    fn get_level(&mut self) -> f32 {
        match self.state {
            EnvelopeState::Attack => {
                self.level += 1.0 / (self.config.attack_time * self.sample_rate as f32);
                if self.level >= 1.0 {
                    self.level = 1.0;
                    self.state = EnvelopeState::Decay;
                }
            },
            EnvelopeState::Decay => {
                self.level -= (1.0 - self.config.sustain_level) / 
                             (self.config.decay_time * self.sample_rate as f32);
                if self.level <= self.config.sustain_level {
                    self.level = self.config.sustain_level;
                    self.state = EnvelopeState::Sustain;
                }
            },
            EnvelopeState::Sustain => {
                // Mantener nivel de sustain
            },
            EnvelopeState::Release => {
                self.level -= self.config.sustain_level / 
                             (self.config.release_time * self.sample_rate as f32);
                if self.level <= 0.0 {
                    self.level = 0.0;
                    self.state = EnvelopeState::Off;
                }
            },
            EnvelopeState::Off => {
                // No hacer nada
            },
        }
        
        self.level
    }

    fn trigger(&mut self) {
        self.state = EnvelopeState::Attack;
        self.level = 0.0;
    }

    fn release(&mut self) {
        self.state = EnvelopeState::Release;
    }
}

impl LFO {
    fn get_sample(&mut self) -> f32 {
        let sample = match self.waveform {
            Waveform::Sine => (2.0 * PI * self.frequency * self.time).sin(),
            Waveform::Square => {
                let sine = (2.0 * PI * self.frequency * self.time).sin();
                if sine > 0.0 { 1.0 } else { -1.0 }
            },
            Waveform::Sawtooth => {
                let phase = (self.frequency * self.time) % 1.0;
                2.0 * phase - 1.0
            },
            Waveform::Triangle => {
                let phase = (self.frequency * self.time) % 1.0;
                if phase < 0.5 {
                    4.0 * phase - 1.0
                } else {
                    3.0 - 4.0 * phase
                }
            },
            _ => (2.0 * PI * self.frequency * self.time).sin(),
        };

        self.time += 1.0 / self.sample_rate as f32;
        sample
    }
} 