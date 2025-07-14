//! Gestor de Audio por Ubicación
//! Maneja transiciones de audio entre diferentes islas virtuales

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use crate::audio::ambient::LocationType;

/// Configuración de ubicación virtual
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VirtualLocation {
    pub id: String,
    pub name: String,
    pub location_type: LocationType,
    pub position: (f32, f32, f32),
    pub size: f32,
    pub ambient_intensity: f32,
    pub transition_distance: f32,
    pub audio_layers: Vec<AudioLayer>,
    pub special_effects: Vec<SpecialEffect>,
}

/// Capa de audio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioLayer {
    pub name: String,
    pub sound_type: String,
    pub volume: f32,
    pub pitch: f32,
    pub loop_enabled: bool,
    pub fade_in_time: f32,
    pub fade_out_time: f32,
}

/// Efecto especial de audio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpecialEffect {
    pub name: String,
    pub effect_type: String,
    pub parameters: HashMap<String, f32>,
    pub trigger_condition: TriggerCondition,
}

/// Condición de activación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TriggerCondition {
    Distance(f32),
    Time(f32),
    Interaction(String),
    Always,
}

/// Estado de transición
#[derive(Debug, Clone)]
pub enum TransitionState {
    None,
    FadingIn { progress: f32, duration: f32 },
    FadingOut { progress: f32, duration: f32 },
    Crossfading { progress: f32, duration: f32 },
}

/// Gestor de Audio por Ubicación
#[wasm_bindgen]
pub struct LocationAudioManager {
    locations: HashMap<String, VirtualLocation>,
    current_location: Option<String>,
    target_location: Option<String>,
    transition_state: TransitionState,
    player_position: (f32, f32, f32),
    sample_rate: u32,
    is_active: bool,
    
    // Buffers de transición
    current_audio_buffer: Vec<f32>,
    target_audio_buffer: Vec<f32>,
    transition_buffer: Vec<f32>,
    
    // Contadores de tiempo
    transition_time: f32,
    location_time: f32,
}

#[wasm_bindgen]
impl LocationAudioManager {
    /// Crear nuevo gestor de audio por ubicación
    pub fn new(audio_config: &crate::audio::AudioConfig) -> Self {
        let sample_rate = audio_config.sample_rate;
        let buffer_size = audio_config.buffer_size;
        
        Self {
            locations: HashMap::new(),
            current_location: None,
            target_location: None,
            transition_state: TransitionState::None,
            player_position: (0.0, 0.0, 0.0),
            sample_rate,
            is_active: false,
            
            current_audio_buffer: vec![0.0; buffer_size],
            target_audio_buffer: vec![0.0; buffer_size],
            transition_buffer: vec![0.0; buffer_size],
            
            transition_time: 0.0,
            location_time: 0.0,
        }
    }

    /// Inicializar el gestor
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.is_active = true;
        self.setup_default_locations();
        Ok(())
    }

    /// Configurar ubicaciones por defecto
    fn setup_default_locations(&mut self) {
        // Isla del Bosque Mágico
        self.locations.insert("forest_island".to_string(), VirtualLocation {
            id: "forest_island".to_string(),
            name: "Isla del Bosque Mágico".to_string(),
            location_type: LocationType::Forest,
            position: (0.0, 0.0, 0.0),
            size: 100.0,
            ambient_intensity: 0.7,
            transition_distance: 20.0,
            audio_layers: vec![
                AudioLayer {
                    name: "wind".to_string(),
                    sound_type: "wind".to_string(),
                    volume: 0.6,
                    pitch: 1.0,
                    loop_enabled: true,
                    fade_in_time: 2.0,
                    fade_out_time: 2.0,
                },
                AudioLayer {
                    name: "leaves".to_string(),
                    sound_type: "forest".to_string(),
                    volume: 0.4,
                    pitch: 1.0,
                    loop_enabled: true,
                    fade_in_time: 3.0,
                    fade_out_time: 3.0,
                },
                AudioLayer {
                    name: "birds".to_string(),
                    sound_type: "birds".to_string(),
                    volume: 0.3,
                    pitch: 1.0,
                    loop_enabled: true,
                    fade_in_time: 4.0,
                    fade_out_time: 4.0,
                },
            ],
            special_effects: vec![
                SpecialEffect {
                    name: "magic_sparkles".to_string(),
                    effect_type: "spatial_reverb".to_string(),
                    parameters: {
                        let mut params = HashMap::new();
                        params.insert("room_size".to_string(), 0.4);
                        params.insert("damping".to_string(), 0.6);
                        params
                    },
                    trigger_condition: TriggerCondition::Always,
                },
            ],
        });

        // Isla del Océano Profundo
        self.locations.insert("ocean_island".to_string(), VirtualLocation {
            id: "ocean_island".to_string(),
            name: "Isla del Océano Profundo".to_string(),
            location_type: LocationType::Ocean,
            position: (200.0, 0.0, 0.0),
            size: 150.0,
            ambient_intensity: 0.8,
            transition_distance: 25.0,
            audio_layers: vec![
                AudioLayer {
                    name: "waves".to_string(),
                    sound_type: "waves".to_string(),
                    volume: 0.8,
                    pitch: 0.9,
                    loop_enabled: true,
                    fade_in_time: 2.5,
                    fade_out_time: 2.5,
                },
                AudioLayer {
                    name: "underwater".to_string(),
                    sound_type: "underwater".to_string(),
                    volume: 0.5,
                    pitch: 0.7,
                    loop_enabled: true,
                    fade_in_time: 3.0,
                    fade_out_time: 3.0,
                },
                AudioLayer {
                    name: "seagulls".to_string(),
                    sound_type: "birds".to_string(),
                    volume: 0.2,
                    pitch: 1.1,
                    loop_enabled: true,
                    fade_in_time: 4.0,
                    fade_out_time: 4.0,
                },
            ],
            special_effects: vec![
                SpecialEffect {
                    name: "water_filter".to_string(),
                    effect_type: "lowpass_filter".to_string(),
                    parameters: {
                        let mut params = HashMap::new();
                        params.insert("cutoff".to_string(), 800.0);
                        params.insert("resonance".to_string(), 0.3);
                        params
                    },
                    trigger_condition: TriggerCondition::Always,
                },
            ],
        });

        // Isla de las Montañas Nevadas
        self.locations.insert("mountain_island".to_string(), VirtualLocation {
            id: "mountain_island".to_string(),
            name: "Isla de las Montañas Nevadas".to_string(),
            location_type: LocationType::Mountain,
            position: (-200.0, 0.0, 100.0),
            size: 120.0,
            ambient_intensity: 0.6,
            transition_distance: 30.0,
            audio_layers: vec![
                AudioLayer {
                    name: "wind".to_string(),
                    sound_type: "wind".to_string(),
                    volume: 0.7,
                    pitch: 1.2,
                    loop_enabled: true,
                    fade_in_time: 2.0,
                    fade_out_time: 2.0,
                },
                AudioLayer {
                    name: "ice_cracking".to_string(),
                    sound_type: "ice".to_string(),
                    volume: 0.3,
                    pitch: 0.8,
                    loop_enabled: false,
                    fade_in_time: 1.0,
                    fade_out_time: 1.0,
                },
            ],
            special_effects: vec![
                SpecialEffect {
                    name: "echo_mountains".to_string(),
                    effect_type: "echo".to_string(),
                    parameters: {
                        let mut params = HashMap::new();
                        params.insert("delay".to_string(), 0.8);
                        params.insert("feedback".to_string(), 0.4);
                        params
                    },
                    trigger_condition: TriggerCondition::Always,
                },
            ],
        });

        // Isla del Desierto Místico
        self.locations.insert("desert_island".to_string(), VirtualLocation {
            id: "desert_island".to_string(),
            name: "Isla del Desierto Místico".to_string(),
            location_type: LocationType::Desert,
            position: (0.0, 0.0, 200.0),
            size: 180.0,
            ambient_intensity: 0.5,
            transition_distance: 35.0,
            audio_layers: vec![
                AudioLayer {
                    name: "wind".to_string(),
                    sound_type: "wind".to_string(),
                    volume: 0.5,
                    pitch: 1.1,
                    loop_enabled: true,
                    fade_in_time: 2.0,
                    fade_out_time: 2.0,
                },
                AudioLayer {
                    name: "sand_storm".to_string(),
                    sound_type: "storm".to_string(),
                    volume: 0.4,
                    pitch: 0.9,
                    loop_enabled: true,
                    fade_in_time: 3.0,
                    fade_out_time: 3.0,
                },
            ],
            special_effects: vec![
                SpecialEffect {
                    name: "desert_reverb".to_string(),
                    effect_type: "reverb".to_string(),
                    parameters: {
                        let mut params = HashMap::new();
                        params.insert("room_size".to_string(), 0.7);
                        params.insert("damping".to_string(), 0.4);
                        params
                    },
                    trigger_condition: TriggerCondition::Always,
                },
            ],
        });

        // Isla de la Ciudad Futurista
        self.locations.insert("city_island".to_string(), VirtualLocation {
            id: "city_island".to_string(),
            name: "Isla de la Ciudad Futurista".to_string(),
            location_type: LocationType::City,
            position: (200.0, 0.0, -200.0),
            size: 200.0,
            ambient_intensity: 0.9,
            transition_distance: 40.0,
            audio_layers: vec![
                AudioLayer {
                    name: "city_ambience".to_string(),
                    sound_type: "city".to_string(),
                    volume: 0.8,
                    pitch: 1.0,
                    loop_enabled: true,
                    fade_in_time: 2.0,
                    fade_out_time: 2.0,
                },
                AudioLayer {
                    name: "hover_cars".to_string(),
                    sound_type: "vehicles".to_string(),
                    volume: 0.6,
                    pitch: 1.1,
                    loop_enabled: true,
                    fade_in_time: 2.5,
                    fade_out_time: 2.5,
                },
            ],
            special_effects: vec![
                SpecialEffect {
                    name: "city_echo".to_string(),
                    effect_type: "echo".to_string(),
                    parameters: {
                        let mut params = HashMap::new();
                        params.insert("delay".to_string(), 0.1);
                        params.insert("feedback".to_string(), 0.2);
                        params
                    },
                    trigger_condition: TriggerCondition::Always,
                },
            ],
        });
    }

    /// Transicionar a nueva ubicación
    pub fn transition_to_location(&mut self, location_id: &str, duration: f32) -> Result<(), JsValue> {
        if !self.locations.contains_key(location_id) {
            return Err(JsValue::from_str("Ubicación no encontrada"));
        }

        let target_location = self.locations.get(location_id).unwrap();
        
        // Verificar si el jugador está en rango de transición
        let distance = self.calculate_distance_to_location(target_location);
        if distance > target_location.transition_distance {
            return Err(JsValue::from_str("Demasiado lejos para transicionar"));
        }

        self.target_location = Some(location_id.to_string());
        self.transition_state = TransitionState::Crossfading { progress: 0.0, duration };
        self.transition_time = 0.0;

        Ok(())
    }

    /// Calcular distancia a ubicación
    fn calculate_distance_to_location(&self, location: &VirtualLocation) -> f32 {
        let dx = self.player_position.0 - location.position.0;
        let dy = self.player_position.1 - location.position.1;
        let dz = self.player_position.2 - location.position.2;
        
        (dx * dx + dy * dy + dz * dz).sqrt()
    }

    /// Actualizar posición del jugador
    pub fn update_player_position(&mut self, x: f32, y: f32, z: f32) {
        self.player_position = (x, y, z);
        
        // Verificar si el jugador entró en una nueva ubicación
        self.check_location_proximity();
    }

    /// Verificar proximidad a ubicaciones
    fn check_location_proximity(&mut self) {
        for (location_id, location) in &self.locations {
            let distance = self.calculate_distance_to_location(location);
            
            if distance <= location.size {
                if self.current_location.as_ref() != Some(location_id) {
                    // El jugador entró en una nueva ubicación
                    self.enter_location(location_id);
                }
            } else if self.current_location.as_ref() == Some(location_id) {
                // El jugador salió de la ubicación actual
                self.exit_location();
            }
        }
    }

    /// Entrar en ubicación
    fn enter_location(&mut self, location_id: &str) {
        if self.current_location.is_some() {
            // Iniciar transición
            self.target_location = Some(location_id.to_string());
            self.transition_state = TransitionState::Crossfading { 
                progress: 0.0, 
                duration: 3.0 
            };
        } else {
            // Primera ubicación
            self.current_location = Some(location_id.to_string());
            self.transition_state = TransitionState::FadingIn { 
                progress: 0.0, 
                duration: 2.0 
            };
        }
        
        self.transition_time = 0.0;
    }

    /// Salir de ubicación
    fn exit_location(&mut self) {
        self.transition_state = TransitionState::FadingOut { 
            progress: 0.0, 
            duration: 2.0 
        };
        self.transition_time = 0.0;
    }

    /// Procesar transición de audio
    pub fn process_transition(&mut self, delta_time: f32) -> Result<Vec<f32>, JsValue> {
        if !self.is_active {
            return Ok(vec![0.0; 2048]);
        }

        self.transition_time += delta_time;
        self.location_time += delta_time;

        // Actualizar estado de transición
        self.update_transition_state();

        // Generar audio según el estado actual
        let mut output = vec![0.0; 2048];

        match self.transition_state {
            TransitionState::None => {
                // Audio de ubicación actual
                if let Some(location_id) = &self.current_location {
                    output = self.generate_location_audio(location_id)?;
                }
            },
            TransitionState::FadingIn { progress, .. } => {
                // Fade in de nueva ubicación
                if let Some(location_id) = &self.current_location {
                    let audio = self.generate_location_audio(location_id)?;
                    for i in 0..output.len() {
                        output[i] = audio[i] * progress;
                    }
                }
            },
            TransitionState::FadingOut { progress, .. } => {
                // Fade out de ubicación actual
                if let Some(location_id) = &self.current_location {
                    let audio = self.generate_location_audio(location_id)?;
                    for i in 0..output.len() {
                        output[i] = audio[i] * (1.0 - progress);
                    }
                }
            },
            TransitionState::Crossfading { progress, .. } => {
                // Crossfade entre ubicaciones
                if let Some(current_id) = &self.current_location {
                    let current_audio = self.generate_location_audio(current_id)?;
                    for i in 0..output.len() {
                        output[i] += current_audio[i] * (1.0 - progress);
                    }
                }
                
                if let Some(target_id) = &self.target_location {
                    let target_audio = self.generate_location_audio(target_id)?;
                    for i in 0..output.len() {
                        output[i] += target_audio[i] * progress;
                    }
                }
            },
        }

        Ok(output)
    }

    /// Actualizar estado de transición
    fn update_transition_state(&mut self) {
        match &mut self.transition_state {
            TransitionState::FadingIn { progress, duration } => {
                *progress = (self.transition_time / *duration).min(1.0);
                if *progress >= 1.0 {
                    self.transition_state = TransitionState::None;
                }
            },
            TransitionState::FadingOut { progress, duration } => {
                *progress = (self.transition_time / *duration).min(1.0);
                if *progress >= 1.0 {
                    self.current_location = None;
                    self.transition_state = TransitionState::None;
                }
            },
            TransitionState::Crossfading { progress, duration } => {
                *progress = (self.transition_time / *duration).min(1.0);
                if *progress >= 1.0 {
                    // Completar transición
                    if let Some(target_id) = &self.target_location {
                        self.current_location = Some(target_id.clone());
                        self.target_location = None;
                        self.transition_state = TransitionState::None;
                    }
                }
            },
            TransitionState::None => {
                // No hay transición activa
            },
        }
    }

    /// Generar audio para ubicación específica
    fn generate_location_audio(&self, location_id: &str) -> Result<Vec<f32>, JsValue> {
        let location = self.locations.get(location_id)
            .ok_or_else(|| JsValue::from_str("Ubicación no encontrada"))?;

        let mut output = vec![0.0; 2048];

        // Generar audio para cada capa
        for layer in &location.audio_layers {
            let layer_audio = self.generate_layer_audio(layer, location)?;
            
            for i in 0..output.len() {
                output[i] += layer_audio[i] * layer.volume;
            }
        }

        // Aplicar efectos especiales
        for effect in &location.special_effects {
            if self.should_trigger_effect(effect) {
                output = self.apply_special_effect(output, effect)?;
            }
        }

        Ok(output)
    }

    /// Generar audio para capa específica
    fn generate_layer_audio(&self, layer: &AudioLayer, location: &VirtualLocation) -> Result<Vec<f32>, JsValue> {
        // Aquí se generaría el audio específico para cada tipo de sonido
        // Por ahora, generamos audio sintético basado en el tipo
        let mut audio = vec![0.0; 2048];
        
        match layer.sound_type.as_str() {
            "wind" => {
                for i in 0..audio.len() {
                    let time = i as f32 / self.sample_rate as f32;
                    let freq = 0.5 + (time * 0.1).sin() * 0.3;
                    audio[i] = (2.0 * PI * freq * time).sin() * 0.5;
                }
            },
            "waves" => {
                for i in 0..audio.len() {
                    let time = i as f32 / self.sample_rate as f32;
                    let freq = 2.0 + (time * 0.02).sin() * 1.0;
                    audio[i] = (2.0 * PI * freq * time).sin() * 0.6;
                }
            },
            "birds" => {
                for i in 0..audio.len() {
                    let time = i as f32 / self.sample_rate as f32;
                    let freq = 800.0 + (time * 100.0).sin() * 100.0;
                    audio[i] = (2.0 * PI * freq * time).sin() * 0.3;
                }
            },
            "city" => {
                for i in 0..audio.len() {
                    let time = i as f32 / self.sample_rate as f32;
                    let freq = 440.0 + (time * 200.0).sin() * 200.0;
                    audio[i] = (2.0 * PI * freq * time).sin() * 0.4;
                }
            },
            _ => {
                // Audio por defecto
                for i in 0..audio.len() {
                    let time = i as f32 / self.sample_rate as f32;
                    audio[i] = (2.0 * PI * 220.0 * time).sin() * 0.3;
                }
            },
        }

        Ok(audio)
    }

    /// Verificar si se debe activar un efecto
    fn should_trigger_effect(&self, effect: &SpecialEffect) -> bool {
        match &effect.trigger_condition {
            TriggerCondition::Always => true,
            TriggerCondition::Distance(distance) => {
                // Verificar distancia a algún punto específico
                true // Simplificado por ahora
            },
            TriggerCondition::Time(time) => {
                self.location_time >= *time
            },
            TriggerCondition::Interaction(_) => {
                // Verificar interacción específica
                false // Simplificado por ahora
            },
        }
    }

    /// Aplicar efecto especial
    fn apply_special_effect(&self, audio: Vec<f32>, effect: &SpecialEffect) -> Result<Vec<f32>, JsValue> {
        let mut processed_audio = audio;

        match effect.effect_type.as_str() {
            "reverb" => {
                // Aplicar reverb simple
                let room_size = effect.parameters.get("room_size").unwrap_or(&0.5);
                let damping = effect.parameters.get("damping").unwrap_or(&0.5);
                
                for i in 1000..processed_audio.len() {
                    processed_audio[i] += processed_audio[i - 1000] * room_size * (1.0 - damping) * 0.3;
                }
            },
            "echo" => {
                // Aplicar echo simple
                let delay = effect.parameters.get("delay").unwrap_or(&0.3);
                let feedback = effect.parameters.get("feedback").unwrap_or(&0.3);
                let delay_samples = (delay * self.sample_rate as f32) as usize;
                
                for i in delay_samples..processed_audio.len() {
                    processed_audio[i] += processed_audio[i - delay_samples] * feedback;
                }
            },
            "lowpass_filter" => {
                // Aplicar filtro paso bajo simple
                let cutoff = effect.parameters.get("cutoff").unwrap_or(&1000.0);
                let resonance = effect.parameters.get("resonance").unwrap_or(&0.5);
                
                let rc = 1.0 / (2.0 * PI * cutoff);
                let dt = 1.0 / self.sample_rate as f32;
                let alpha = dt / (rc + dt);
                
                for i in 1..processed_audio.len() {
                    processed_audio[i] = alpha * processed_audio[i] + (1.0 - alpha) * processed_audio[i - 1];
                }
            },
            _ => {
                // Efecto no reconocido, no hacer nada
            },
        }

        Ok(processed_audio)
    }

    /// Obtener ubicación actual
    pub fn get_current_location(&self) -> Option<String> {
        self.current_location.clone()
    }

    /// Obtener información de ubicación
    pub fn get_location_info(&self, location_id: &str) -> Result<JsValue, JsValue> {
        let location = self.locations.get(location_id)
            .ok_or_else(|| JsValue::from_str("Ubicación no encontrada"))?;
        
        serde_wasm_bindgen::to_value(location)
            .map_err(|_| JsValue::from_str("Error al serializar ubicación"))
    }

    /// Obtener todas las ubicaciones
    pub fn get_all_locations(&self) -> JsValue {
        let location_list: Vec<&VirtualLocation> = self.locations.values().collect();
        serde_wasm_bindgen::to_value(&location_list).unwrap_or_default()
    }

    /// Añadir nueva ubicación
    pub fn add_location(&mut self, location: JsValue) -> Result<(), JsValue> {
        let virtual_location: VirtualLocation = serde_wasm_bindgen::from_value(location)?;
        self.locations.insert(virtual_location.id.clone(), virtual_location);
        Ok(())
    }

    /// Detener el gestor
    pub fn stop(&mut self) {
        self.is_active = false;
        self.current_location = None;
        self.target_location = None;
        self.transition_state = TransitionState::None;
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