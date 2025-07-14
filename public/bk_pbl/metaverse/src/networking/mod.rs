//! Sistema de Networking para Metaverso
//! Maneja comunicación en tiempo real, sincronización y multiplayer

pub mod client;
pub mod server;
pub mod protocol;
pub mod sync;
pub mod rpc;

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Configuración de networking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    pub server_url: String,
    pub port: u16,
    pub max_players: u32,
    pub tick_rate: u32, // Hz
    pub enable_compression: bool,
    pub enable_encryption: bool,
    pub connection_timeout: u64, // ms
    pub heartbeat_interval: u64, // ms
    pub max_packet_size: usize,
    pub enable_reliable_udp: bool,
}

impl Default for NetworkConfig {
    fn default() -> Self {
        Self {
            server_url: "ws://localhost".to_string(),
            port: 8080,
            max_players: 1000,
            tick_rate: 60,
            enable_compression: true,
            enable_encryption: true,
            connection_timeout: 30000,
            heartbeat_interval: 5000,
            max_packet_size: 65536,
            enable_reliable_udp: true,
        }
    }
}

/// Estado de conexión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConnectionState {
    Disconnected,
    Connecting,
    Connected,
    Authenticating,
    Authenticated,
    InGame,
    Error,
}

/// Información del jugador en red
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkPlayer {
    pub player_id: String,
    pub username: String,
    pub position: [f32; 3],
    pub rotation: [f32; 3],
    pub current_island: String,
    pub ping: u32,
    pub last_seen: u64,
    pub is_active: bool,
}

/// Gestor principal de networking
#[wasm_bindgen]
pub struct NetworkManager {
    config: NetworkConfig,
    connection_state: ConnectionState,
    players: HashMap<String, NetworkPlayer>,
    local_player_id: Option<String>,
    is_initialized: bool,
}

#[wasm_bindgen]
impl NetworkManager {
    /// Crear nuevo gestor de networking
    pub fn new() -> Self {
        Self {
            config: NetworkConfig::default(),
            connection_state: ConnectionState::Disconnected,
            players: HashMap::new(),
            local_player_id: None,
            is_initialized: false,
        }
    }

    /// Inicializar el sistema de networking
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        // Inicializar WebSocket o WebRTC según configuración
        self.is_initialized = true;
        Ok(())
    }

    /// Conectar al servidor
    pub fn connect(&mut self) -> Result<(), JsValue> {
        if !self.is_initialized {
            return Err(JsValue::from_str("Networking no inicializado"));
        }

        self.connection_state = ConnectionState::Connecting;
        
        // Simular conexión
        std::thread::sleep(std::time::Duration::from_millis(100));
        self.connection_state = ConnectionState::Connected;
        
        Ok(())
    }

    /// Desconectar del servidor
    pub fn disconnect(&mut self) -> Result<(), JsValue> {
        self.connection_state = ConnectionState::Disconnected;
        self.players.clear();
        self.local_player_id = None;
        Ok(())
    }

    /// Autenticar jugador
    pub fn authenticate(&mut self, username: &str, token: &str) -> Result<String, JsValue> {
        if self.connection_state != ConnectionState::Connected {
            return Err(JsValue::from_str("No conectado al servidor"));
        }

        self.connection_state = ConnectionState::Authenticating;
        
        // Simular autenticación
        let player_id = format!("player_{}", rand::random::<u32>());
        self.local_player_id = Some(player_id.clone());
        
        let player = NetworkPlayer {
            player_id: player_id.clone(),
            username: username.to_string(),
            position: [0.0, 0.0, 0.0],
            rotation: [0.0, 0.0, 0.0],
            current_island: "forest".to_string(),
            ping: 50,
            last_seen: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            is_active: true,
        };

        self.players.insert(player_id.clone(), player);
        self.connection_state = ConnectionState::Authenticated;
        
        Ok(player_id)
    }

    /// Enviar posición del jugador
    pub fn send_player_position(&mut self, position: &[f32; 3], rotation: &[f32; 3]) -> Result<(), JsValue> {
        if let Some(player_id) = &self.local_player_id {
            if let Some(player) = self.players.get_mut(player_id) {
                player.position = *position;
                player.rotation = *rotation;
                player.last_seen = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs();
            }
        }
        Ok(())
    }

    /// Cambiar isla del jugador
    pub fn change_player_island(&mut self, island: &str) -> Result<(), JsValue> {
        if let Some(player_id) = &self.local_player_id {
            if let Some(player) = self.players.get_mut(player_id) {
                player.current_island = island.to_string();
            }
        }
        Ok(())
    }

    /// Obtener jugadores cercanos
    pub fn get_nearby_players(&self, position: &[f32; 3], radius: f32) -> JsValue {
        let nearby_players: Vec<&NetworkPlayer> = self.players.values()
            .filter(|player| {
                if !player.is_active || player.player_id == self.local_player_id.as_ref().unwrap_or(&"".to_string()) {
                    return false;
                }

                let distance = ((position[0] - player.position[0]).powi(2) +
                               (position[1] - player.position[1]).powi(2) +
                               (position[2] - player.position[2]).powi(2)).sqrt();
                
                distance <= radius
            })
            .collect();

        serde_wasm_bindgen::to_value(&nearby_players).unwrap_or_default()
    }

    /// Obtener jugadores en la misma isla
    pub fn get_players_in_island(&self, island: &str) -> JsValue {
        let island_players: Vec<&NetworkPlayer> = self.players.values()
            .filter(|player| player.current_island == island && player.is_active)
            .collect();

        serde_wasm_bindgen::to_value(&island_players).unwrap_or_default()
    }

    /// Obtener estado de conexión
    pub fn get_connection_state(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.connection_state).unwrap_or_default()
    }

    /// Verificar si está conectado
    pub fn is_connected(&self) -> bool {
        matches!(self.connection_state, ConnectionState::Connected | ConnectionState::Authenticated | ConnectionState::InGame)
    }

    /// Verificar si está autenticado
    pub fn is_authenticated(&self) -> bool {
        matches!(self.connection_state, ConnectionState::Authenticated | ConnectionState::InGame)
    }

    /// Obtener configuración
    pub fn get_config(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.config).unwrap_or_default()
    }

    /// Actualizar configuración
    pub fn update_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        let new_config: NetworkConfig = serde_wasm_bindgen::from_value(config)?;
        self.config = new_config;
        Ok(())
    }

    /// Obtener estadísticas de networking
    pub fn get_network_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "connection_state": self.connection_state,
            "total_players": self.players.len(),
            "active_players": self.players.values().filter(|p| p.is_active).count(),
            "local_player_id": self.local_player_id,
            "server_url": self.config.server_url,
            "port": self.config.port,
            "tick_rate": self.config.tick_rate,
        });

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }

    /// Verificar si está inicializado
    pub fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Drop for NetworkManager {
    fn drop(&mut self) {
        // Limpiar conexión
        let _ = self.disconnect();
    }
} 