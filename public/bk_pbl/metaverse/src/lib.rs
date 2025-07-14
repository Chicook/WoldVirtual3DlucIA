//! Metaverso Crypto World Virtual 3D - Motor Principal
//! Sistema completo de metaverso descentralizado con audio, blockchain y exploración 3D

pub mod audio;
pub mod blockchain;
pub mod crypto;
pub mod ecs;
pub mod networking;
pub mod physics;
pub mod renderer;
pub mod scene;
pub mod utils;

use wasm_bindgen::prelude::*;

/// Configuración principal del metaverso
#[derive(Debug, Clone)]
pub struct MetaversoConfig {
    pub audio_enabled: bool,
    pub blockchain_enabled: bool,
    pub networking_enabled: bool,
    pub physics_enabled: bool,
    pub renderer_enabled: bool,
    pub max_players: u32,
    pub world_size: f32,
    pub island_count: u32,
}

impl Default for MetaversoConfig {
    fn default() -> Self {
        Self {
            audio_enabled: true,
            blockchain_enabled: true,
            networking_enabled: true,
            physics_enabled: true,
            renderer_enabled: true,
            max_players: 1000,
            world_size: 10000.0,
            island_count: 7,
        }
    }
}

/// Gestor principal del metaverso
#[wasm_bindgen]
pub struct MetaversoEngine {
    config: MetaversoConfig,
    audio_manager: Option<audio::AudioManager>,
    blockchain_manager: Option<blockchain::BlockchainManager>,
    is_initialized: bool,
}

#[wasm_bindgen]
impl MetaversoEngine {
    /// Crear nuevo motor del metaverso
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            config: MetaversoConfig::default(),
            audio_manager: None,
            blockchain_manager: None,
            is_initialized: false,
        }
    }

    /// Inicializar el motor del metaverso
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        // Inicializar sistema de audio
        if self.config.audio_enabled {
            let mut audio_manager = audio::AudioManager::new();
            audio_manager.initialize()?;
            self.audio_manager = Some(audio_manager);
        }

        // Inicializar sistema de blockchain
        if self.config.blockchain_enabled {
            let mut blockchain_manager = blockchain::BlockchainManager::new();
            blockchain_manager.initialize()?;
            self.blockchain_manager = Some(blockchain_manager);
        }

        self.is_initialized = true;
        Ok(())
    }

    /// Obtener gestor de audio
    pub fn get_audio_manager(&self) -> Option<&audio::AudioManager> {
        self.audio_manager.as_ref()
    }

    /// Obtener gestor de blockchain
    pub fn get_blockchain_manager(&self) -> Option<&blockchain::BlockchainManager> {
        self.blockchain_manager.as_ref()
    }

    /// Verificar si está inicializado
    pub fn is_initialized(&self) -> bool {
        self.is_initialized
    }

    /// Obtener configuración
    pub fn get_config(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.config).unwrap_or_default()
    }

    /// Actualizar configuración
    pub fn update_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        let new_config: MetaversoConfig = serde_wasm_bindgen::from_value(config)?;
        self.config = new_config;
        Ok(())
    }
}

impl Drop for MetaversoEngine {
    fn drop(&mut self) {
        // Limpiar recursos
        self.audio_manager = None;
        self.blockchain_manager = None;
    }
}

// Funciones globales para JavaScript
#[wasm_bindgen]
pub fn create_metaverso_engine() -> MetaversoEngine {
    MetaversoEngine::new()
}

#[wasm_bindgen]
pub fn initialize_metaverso(engine: &mut MetaversoEngine) -> Result<(), JsValue> {
    engine.initialize()
}

#[wasm_bindgen]
pub fn get_audio_manager(engine: &MetaversoEngine) -> Option<audio::AudioManager> {
    engine.audio_manager.clone()
}

#[wasm_bindgen]
pub fn get_blockchain_manager(engine: &MetaversoEngine) -> Option<blockchain::BlockchainManager> {
    engine.blockchain_manager.clone()
} 