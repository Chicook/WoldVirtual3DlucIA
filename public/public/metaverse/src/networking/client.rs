//! Cliente de Networking para Metaverso
//! Maneja la conexión del cliente con el servidor

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Configuración del cliente
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientConfig {
    pub auto_reconnect: bool,
    pub reconnect_attempts: u32,
    pub reconnect_delay: u64, // ms
    pub enable_auto_ping: bool,
    pub ping_interval: u64, // ms
    pub enable_compression: bool,
    pub enable_encryption: bool,
    pub buffer_size: usize,
}

impl Default for ClientConfig {
    fn default() -> Self {
        Self {
            auto_reconnect: true,
            reconnect_attempts: 5,
            reconnect_delay: 1000,
            enable_auto_ping: true,
            ping_interval: 5000,
            enable_compression: true,
            enable_encryption: true,
            buffer_size: 65536,
        }
    }
}

/// Estado del cliente
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClientState {
    Disconnected,
    Connecting,
    Connected,
    Authenticating,
    Authenticated,
    InGame,
    Reconnecting,
    Error,
}

/// Información de conexión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionInfo {
    pub server_url: String,
    pub port: u16,
    pub protocol: String,
    pub latency: u32, // ms
    pub bandwidth_up: f32, // Mbps
    pub bandwidth_down: f32, // Mbps
    pub packet_loss: f32, // %
    pub jitter: u32, // ms
}

/// Mensaje de red
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkMessage {
    pub id: String,
    pub message_type: MessageType,
    pub payload: String,
    pub timestamp: u64,
    pub reliable: bool,
    pub priority: MessagePriority,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    Connect,
    Disconnect,
    Authenticate,
    PlayerUpdate,
    Chat,
    Action,
    Sync,
    Heartbeat,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessagePriority {
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3,
}

/// Cliente de networking
#[wasm_bindgen]
pub struct NetworkClient {
    config: ClientConfig,
    state: ClientState,
    connection_info: Option<ConnectionInfo>,
    message_queue: Vec<NetworkMessage>,
    received_messages: Vec<NetworkMessage>,
    reconnect_attempts: u32,
    last_ping: u64,
    is_initialized: bool,
}

#[wasm_bindgen]
impl NetworkClient {
    /// Crear nuevo cliente de networking
    pub fn new() -> Self {
        Self {
            config: ClientConfig::default(),
            state: ClientState::Disconnected,
            connection_info: None,
            message_queue: Vec::new(),
            received_messages: Vec::new(),
            reconnect_attempts: 0,
            last_ping: 0,
            is_initialized: false,
        }
    }

    /// Inicializar el cliente
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.is_initialized = true;
        Ok(())
    }

    /// Conectar al servidor
    pub fn connect(&mut self, server_url: &str, port: u16) -> Result<(), JsValue> {
        if !self.is_initialized {
            return Err(JsValue::from_str("Cliente no inicializado"));
        }

        self.state = ClientState::Connecting;
        
        // Simular conexión
        std::thread::sleep(std::time::Duration::from_millis(100));
        
        self.connection_info = Some(ConnectionInfo {
            server_url: server_url.to_string(),
            port,
            protocol: "WebSocket".to_string(),
            latency: 50,
            bandwidth_up: 10.0,
            bandwidth_down: 100.0,
            packet_loss: 0.1,
            jitter: 5,
        });

        self.state = ClientState::Connected;
        Ok(())
    }

    /// Desconectar del servidor
    pub fn disconnect(&mut self) -> Result<(), JsValue> {
        self.state = ClientState::Disconnected;
        self.connection_info = None;
        self.message_queue.clear();
        self.received_messages.clear();
        self.reconnect_attempts = 0;
        Ok(())
    }

    /// Enviar mensaje
    pub fn send_message(&mut self, message_type: &str, payload: &str, reliable: bool) -> Result<String, JsValue> {
        if self.state != ClientState::Connected && self.state != ClientState::Authenticated && self.state != ClientState::InGame {
            return Err(JsValue::from_str("No conectado al servidor"));
        }

        let message_type_enum = match message_type {
            "connect" => MessageType::Connect,
            "disconnect" => MessageType::Disconnect,
            "authenticate" => MessageType::Authenticate,
            "player_update" => MessageType::PlayerUpdate,
            "chat" => MessageType::Chat,
            "action" => MessageType::Action,
            "sync" => MessageType::Sync,
            "heartbeat" => MessageType::Heartbeat,
            _ => MessageType::Custom(message_type.to_string()),
        };

        let message = NetworkMessage {
            id: format!("msg_{}", rand::random::<u32>()),
            message_type: message_type_enum,
            payload: payload.to_string(),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            reliable,
            priority: MessagePriority::Normal,
        };

        self.message_queue.push(message.clone());
        Ok(message.id)
    }

    /// Enviar mensaje con prioridad
    pub fn send_message_with_priority(&mut self, message_type: &str, payload: &str, reliable: bool, priority: &str) -> Result<String, JsValue> {
        if self.state != ClientState::Connected && self.state != ClientState::Authenticated && self.state != ClientState::InGame {
            return Err(JsValue::from_str("No conectado al servidor"));
        }

        let message_type_enum = match message_type {
            "connect" => MessageType::Connect,
            "disconnect" => MessageType::Disconnect,
            "authenticate" => MessageType::Authenticate,
            "player_update" => MessageType::PlayerUpdate,
            "chat" => MessageType::Chat,
            "action" => MessageType::Action,
            "sync" => MessageType::Sync,
            "heartbeat" => MessageType::Heartbeat,
            _ => MessageType::Custom(message_type.to_string()),
        };

        let priority_enum = match priority {
            "low" => MessagePriority::Low,
            "normal" => MessagePriority::Normal,
            "high" => MessagePriority::High,
            "critical" => MessagePriority::Critical,
            _ => MessagePriority::Normal,
        };

        let message = NetworkMessage {
            id: format!("msg_{}", rand::random::<u32>()),
            message_type: message_type_enum,
            payload: payload.to_string(),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            reliable,
            priority: priority_enum,
        };

        self.message_queue.push(message.clone());
        Ok(message.id)
    }

    /// Obtener mensajes recibidos
    pub fn get_received_messages(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.received_messages).unwrap_or_default()
    }

    /// Limpiar mensajes recibidos
    pub fn clear_received_messages(&mut self) {
        self.received_messages.clear();
    }

    /// Simular recepción de mensaje
    pub fn simulate_received_message(&mut self, message_type: &str, payload: &str) -> Result<(), JsValue> {
        let message_type_enum = match message_type {
            "connect" => MessageType::Connect,
            "disconnect" => MessageType::Disconnect,
            "authenticate" => MessageType::Authenticate,
            "player_update" => MessageType::PlayerUpdate,
            "chat" => MessageType::Chat,
            "action" => MessageType::Action,
            "sync" => MessageType::Sync,
            "heartbeat" => MessageType::Heartbeat,
            _ => MessageType::Custom(message_type.to_string()),
        };

        let message = NetworkMessage {
            id: format!("msg_{}", rand::random::<u32>()),
            message_type: message_type_enum,
            payload: payload.to_string(),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            reliable: false,
            priority: MessagePriority::Normal,
        };

        self.received_messages.push(message);
        Ok(())
    }

    /// Enviar ping
    pub fn send_ping(&mut self) -> Result<(), JsValue> {
        if !self.config.enable_auto_ping {
            return Ok(());
        }

        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        if current_time - self.last_ping >= self.config.ping_interval / 1000 {
            self.send_message("heartbeat", "ping", false)?;
            self.last_ping = current_time;
        }

        Ok(())
    }

    /// Obtener estado del cliente
    pub fn get_state(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.state).unwrap_or_default()
    }

    /// Verificar si está conectado
    pub fn is_connected(&self) -> bool {
        matches!(self.state, ClientState::Connected | ClientState::Authenticated | ClientState::InGame)
    }

    /// Obtener información de conexión
    pub fn get_connection_info(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.connection_info).unwrap_or_default()
    }

    /// Obtener configuración
    pub fn get_config(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.config).unwrap_or_default()
    }

    /// Actualizar configuración
    pub fn update_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        let new_config: ClientConfig = serde_wasm_bindgen::from_value(config)?;
        self.config = new_config;
        Ok(())
    }

    /// Obtener estadísticas del cliente
    pub fn get_client_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "state": self.state,
            "message_queue_size": self.message_queue.len(),
            "received_messages_count": self.received_messages.len(),
            "reconnect_attempts": self.reconnect_attempts,
            "last_ping": self.last_ping,
            "connection_info": self.connection_info,
        });

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }

    /// Verificar si está inicializado
    pub fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Drop for NetworkClient {
    fn drop(&mut self) {
        // Limpiar conexión
        let _ = self.disconnect();
    }
} 