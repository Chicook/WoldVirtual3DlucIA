//! Sistema de networking P2P descentralizado para el motor 3D
//! 
//! Proporciona comunicación peer-to-peer sin servidor central,
//! descubrimiento automático de nodos y sincronización de estado en tiempo real.

use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use tokio::sync::mpsc;
use tracing::{info, debug, error, warn};
use anyhow::{Result, anyhow};
use libp2p::{
    core::{upgrade, transport, PeerId},
    noise,
    swarm::{NetworkBehaviour, Swarm, SwarmEvent},
    tcp, yamux, Multiaddr,
};
use libp2p::ping::{Ping, PingEvent};
use libp2p::identify::{Identify, IdentifyEvent};
use libp2p::kad::{Kademlia, KademliaEvent, QueryResult};
use libp2p::gossipsub::{Gossipsub, GossipsubEvent, MessageId, ValidationMode};
use libp2p::request_response::{RequestResponse, RequestResponseEvent, RequestResponseCodec};
use std::io;
use std::marker::PhantomData;

/// Sistema de networking principal
pub struct NetworkingSystem {
    /// Configuración del sistema
    config: NetworkingConfig,
    /// Swarm de libp2p
    swarm: Option<Swarm<MetaversoBehaviour>>,
    /// Nodos conectados
    peers: Arc<RwLock<HashMap<PeerId, PeerInfo>>>,
    /// Mensajes pendientes
    pending_messages: Arc<RwLock<Vec<NetworkMessage>>>,
    /// Estado del sistema
    state: Arc<RwLock<NetworkState>>,
    /// Estadísticas del sistema
    stats: NetworkingStats,
    /// Estado del sistema
    running: bool,
}

/// Configuración del sistema de networking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkingConfig {
    /// Habilitado
    pub enabled: bool,
    /// Tipo de red
    pub network_type: NetworkType,
    /// Configuración P2P
    pub p2p_config: P2PConfig,
    /// Configuración de mensajes
    pub message_config: MessageConfig,
    /// Configuración de seguridad
    pub security_config: SecurityConfig,
}

/// Tipo de red
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NetworkType {
    Local,
    P2P,
    Client,
    Server,
    Custom(String),
}

/// Configuración P2P
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct P2PConfig {
    /// Habilitado
    pub enabled: bool,
    /// Configuración de descubrimiento
    pub discovery_config: DiscoveryConfig,
    /// Configuración de conexión
    pub connection_config: ConnectionConfig,
    /// Configuración de mensajes
    pub message_config: MessageConfig,
}

/// Configuración de descubrimiento
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveryConfig {
    /// Habilitado
    pub enabled: bool,
    /// Método de descubrimiento
    pub discovery_method: DiscoveryMethod,
    /// Nodos bootstrap
    pub bootstrap_nodes: Vec<String>,
    /// Configuración de DHT
    pub dht_config: DHTConfig,
}

/// Método de descubrimiento
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DiscoveryMethod {
    DHT,
    MDNS,
    Bootstrap,
    Custom(String),
}

/// Configuración de DHT
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DHTConfig {
    /// Habilitado
    pub enabled: bool,
    /// Tamaño de bucket
    pub bucket_size: usize,
    /// Factor de replicación
    pub replication_factor: usize,
    /// TTL
    pub ttl: u64,
}

/// Configuración de conexión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionConfig {
    /// Máximo conexiones
    pub max_connections: usize,
    /// Timeout de conexión
    pub connection_timeout: u64,
    /// Keep alive
    pub keep_alive: bool,
    /// Configuración de retry
    pub retry_config: RetryConfig,
}

/// Configuración de retry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryConfig {
    /// Habilitado
    pub enabled: bool,
    /// Máximo intentos
    pub max_attempts: u32,
    /// Delay inicial
    pub initial_delay: u64,
    /// Factor de backoff
    pub backoff_factor: f32,
}

/// Configuración de mensajes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageConfig {
    /// Tipos de mensaje
    pub message_types: Vec<MessageType>,
    /// Compresión
    pub compression: bool,
    /// Encriptación
    pub encryption: bool,
    /// Configuración de buffer
    pub buffer_config: BufferConfig,
}

/// Tipo de mensaje
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    Position,
    Animation,
    Chat,
    State,
    Custom(String),
}

/// Configuración de buffer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BufferConfig {
    /// Tamaño del buffer
    pub buffer_size: usize,
    /// Timeout
    pub timeout: u64,
    /// Configuración de flush
    pub flush_config: FlushConfig,
}

/// Configuración de flush
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlushConfig {
    /// Habilitado
    pub enabled: bool,
    /// Intervalo
    pub interval: u64,
    /// Tamaño mínimo
    pub min_size: usize,
}

/// Configuración de seguridad
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    /// Encriptación
    pub encryption: bool,
    /// Autenticación
    pub authentication: bool,
    /// Autorización
    pub authorization: bool,
    /// Configuración de claves
    pub key_config: KeyConfig,
}

/// Configuración de claves
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyConfig {
    /// Tipo de clave
    pub key_type: KeyType,
    /// Tamaño de clave
    pub key_size: usize,
    /// Rotación
    pub rotation: bool,
}

/// Tipo de clave
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KeyType {
    RSA,
    Ed25519,
    ECDSA,
    Custom(String),
}

/// Información del peer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerInfo {
    /// ID del peer
    pub peer_id: PeerId,
    /// Dirección
    pub address: Multiaddr,
    /// Estado de conexión
    pub connection_state: ConnectionState,
    /// Latencia
    pub latency: f32,
    /// Último ping
    pub last_ping: u64,
    /// Metadatos
    pub metadata: HashMap<String, String>,
}

/// Estado de conexión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConnectionState {
    Disconnected,
    Connecting,
    Connected,
    Failed,
}

/// Mensaje de red
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkMessage {
    /// ID del mensaje
    pub id: String,
    /// Tipo de mensaje
    pub message_type: MessageType,
    /// Remitente
    pub sender: PeerId,
    /// Destinatario
    pub recipient: Option<PeerId>,
    /// Datos
    pub data: Vec<u8>,
    /// Timestamp
    pub timestamp: u64,
    /// Prioridad
    pub priority: MessagePriority,
}

/// Prioridad del mensaje
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessagePriority {
    Low,
    Normal,
    High,
    Critical,
}

/// Estado de la red
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkState {
    /// Conectado
    pub connected: bool,
    /// Número de peers
    pub peer_count: usize,
    /// Latencia promedio
    pub average_latency: f32,
    /// Pérdida de paquetes
    pub packet_loss: f32,
    /// Ancho de banda
    pub bandwidth: BandwidthInfo,
}

/// Información de ancho de banda
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BandwidthInfo {
    /// Bytes enviados
    pub bytes_sent: u64,
    /// Bytes recibidos
    pub bytes_received: u64,
    /// Paquetes enviados
    pub packets_sent: u64,
    /// Paquetes recibidos
    pub packets_received: u64,
}

/// Estadísticas de networking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkingStats {
    /// Número de peers
    pub peer_count: usize,
    /// Mensajes enviados
    pub messages_sent: u64,
    /// Mensajes recibidos
    pub messages_received: u64,
    /// Latencia promedio
    pub average_latency: f32,
    /// Pérdida de paquetes
    pub packet_loss: f32,
    /// Tiempo de conexión
    pub connection_time: f32,
    /// Memoria utilizada
    pub memory_usage: usize,
}

/// Comportamiento de red del metaverso
#[derive(NetworkBehaviour)]
pub struct MetaversoBehaviour {
    /// Ping
    pub ping: Ping,
    /// Identificación
    pub identify: Identify,
    /// Kademlia DHT
    pub kademlia: Kademlia<libp2p::kad::store::MemoryStore>,
    /// Gossipsub
    pub gossipsub: Gossipsub,
    /// Request-Response
    pub request_response: RequestResponse<MetaversoCodec>,
}

/// Código de metaverso
#[derive(Debug)]
pub struct MetaversoCodec;

impl RequestResponseCodec for MetaversoCodec {
    type Protocol = MetaversoProtocol;
    type Request = Vec<u8>;
    type Response = Vec<u8>;

    fn read_request<T>(&mut self, _: &Self::Protocol, io: &mut T) -> io::Result<Self::Request>
    where
        T: io::Read,
    {
        let mut buf = Vec::new();
        io.read_to_end(&mut buf)?;
        Ok(buf)
    }

    fn read_response<T>(&mut self, _: &Self::Protocol, io: &mut T) -> io::Result<Self::Response>
    where
        T: io::Read,
    {
        let mut buf = Vec::new();
        io.read_to_end(&mut buf)?;
        Ok(buf)
    }

    fn write_request<T>(&mut self, _: &Self::Protocol, io: &mut T, data: Self::Request) -> io::Result<()>
    where
        T: io::Write,
    {
        io.write_all(&data)?;
        Ok(())
    }

    fn write_response<T>(&mut self, _: &Self::Protocol, io: &mut T, data: Self::Response) -> io::Result<()>
    where
        T: io::Write,
    {
        io.write_all(&data)?;
        Ok(())
    }
}

/// Protocolo de metaverso
#[derive(Debug, Clone)]
pub struct MetaversoProtocol;

impl AsRef<str> for MetaversoProtocol {
    fn as_ref(&self) -> &str {
        "/metaverso/1.0.0"
    }
}

impl NetworkingSystem {
    /// Crear nuevo sistema de networking
    pub fn new(config: NetworkingConfig) -> Self {
        info!("Inicializando sistema de networking");
        
        Self {
            config,
            swarm: None,
            peers: Arc::new(RwLock::new(HashMap::new())),
            pending_messages: Arc::new(RwLock::new(Vec::new())),
            state: Arc::new(RwLock::new(NetworkState {
                connected: false,
                peer_count: 0,
                average_latency: 0.0,
                packet_loss: 0.0,
                bandwidth: BandwidthInfo {
                    bytes_sent: 0,
                    bytes_received: 0,
                    packets_sent: 0,
                    packets_received: 0,
                },
            })),
            stats: NetworkingStats {
                peer_count: 0,
                messages_sent: 0,
                messages_received: 0,
                average_latency: 0.0,
                packet_loss: 0.0,
                connection_time: 0.0,
                memory_usage: 0,
            },
            running: false,
        }
    }

    /// Inicializar sistema
    pub async fn initialize(&mut self) -> Result<()> {
        info!("Inicializando sistema de networking");
        
        if !self.config.enabled {
            warn!("Sistema de networking deshabilitado");
            return Ok(());
        }

        // Crear swarm
        self.create_swarm().await?;

        // Configurar descubrimiento
        self.setup_discovery().await?;

        // Conectar a nodos bootstrap
        self.connect_bootstrap_nodes().await?;

        self.running = true;
        info!("Sistema de networking inicializado correctamente");
        
        Ok(())
    }

    /// Crear swarm
    async fn create_swarm(&mut self) -> Result<()> {
        // Crear transport
        let noise_keys = noise::Keypair::<noise::X25519Spec>::new()
            .into_authentic(&libp2p::identity::Keypair::generate_ed25519())
            .expect("Signing libp2p-noise static DH keypair failed.");

        let transport = tcp::TokioTcpConfig::new()
            .nodelay(true)
            .upgrade(upgrade::Version::V1)
            .authenticate(noise::NoiseConfig::xx(noise_keys).into_authenticated())
            .multiplex(yamux::YamuxConfig::default())
            .boxed();

        // Crear peer ID
        let peer_id = PeerId::random();

        // Crear comportamiento
        let behaviour = MetaversoBehaviour {
            ping: Ping::default(),
            identify: Identify::new(IdentifyConfig::new(
                "/metaverso/1.0.0".to_string(),
                peer_id,
            )),
            kademlia: Kademlia::new(peer_id, libp2p::kad::store::MemoryStore::new(peer_id)),
            gossipsub: Gossipsub::new(
                MessageAuthenticity::Signed(peer_id),
                GossipsubConfig::default(),
            )?,
            request_response: RequestResponse::new(
                MetaversoCodec,
                vec![(MetaversoProtocol, ProtocolSupport::Full)],
                Default::default(),
            ),
        };

        // Crear swarm
        let mut swarm = Swarm::new(transport, behaviour, peer_id);
        
        // Escuchar en puerto
        swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

        self.swarm = Some(swarm);
        info!("Swarm creado con peer ID: {}", peer_id);
        
        Ok(())
    }

    /// Configurar descubrimiento
    async fn setup_discovery(&mut self) -> Result<()> {
        if let Some(swarm) = &mut self.swarm {
            match self.config.p2p_config.discovery_config.discovery_method {
                DiscoveryMethod::DHT => {
                    // Configurar DHT
                    if self.config.p2p_config.discovery_config.dht_config.enabled {
                        // Agregar nodos bootstrap al DHT
                        for node in &self.config.p2p_config.discovery_config.bootstrap_nodes {
                            if let Ok(addr) = node.parse::<Multiaddr>() {
                                swarm.behaviour_mut().kademlia.add_address(&addr);
                            }
                        }
                    }
                }
                DiscoveryMethod::MDNS => {
                    // Configurar mDNS (no implementado en este ejemplo)
                }
                DiscoveryMethod::Bootstrap => {
                    // Configurar nodos bootstrap
                }
                DiscoveryMethod::Custom(_) => {
                    // Configuración personalizada
                }
            }
        }

        info!("Descubrimiento configurado");
        Ok(())
    }

    /// Conectar a nodos bootstrap
    async fn connect_bootstrap_nodes(&mut self) -> Result<()> {
        if let Some(swarm) = &mut self.swarm {
            for node in &self.config.p2p_config.discovery_config.bootstrap_nodes {
                if let Ok(addr) = node.parse::<Multiaddr>() {
                    if let Ok(peer_id) = addr.extract_peer_id() {
                        swarm.dial(addr)?;
                        info!("Conectando a nodo bootstrap: {}", peer_id);
                    }
                }
            }
        }

        Ok(())
    }

    /// Actualizar sistema
    pub async fn update(&mut self, delta_time: f32) -> Result<()> {
        if !self.running {
            return Ok(());
        }

        let start_time = std::time::Instant::now();

        // Procesar eventos del swarm
        self.process_swarm_events().await?;

        // Procesar mensajes pendientes
        self.process_pending_messages().await?;

        // Actualizar estado de peers
        self.update_peer_states().await?;

        // Actualizar estadísticas
        self.update_stats(start_time.elapsed().as_secs_f32());

        Ok(())
    }

    /// Procesar eventos del swarm
    async fn process_swarm_events(&mut self) -> Result<()> {
        if let Some(swarm) = &mut self.swarm {
            use futures::StreamExt;
            
            while let Some(event) = swarm.next().await {
                match event {
                    SwarmEvent::NewListenAddr { address, .. } => {
                        info!("Escuchando en: {}", address);
                    }
                    SwarmEvent::Behaviour(MetaversoBehaviourEvent::Ping(PingEvent {
                        peer,
                        result: Ok(rtt),
                    })) => {
                        self.update_peer_latency(peer, rtt).await;
                    }
                    SwarmEvent::Behaviour(MetaversoBehaviourEvent::Identify(IdentifyEvent::Received {
                        peer_id,
                        info,
                    })) => {
                        self.handle_peer_identified(peer_id, info).await;
                    }
                    SwarmEvent::Behaviour(MetaversoBehaviourEvent::Kademlia(KademliaEvent::OutboundQueryCompleted {
                        result: QueryResult::Bootstrap(Ok(_)),
                        ..
                    })) => {
                        info!("Bootstrap completado");
                    }
                    SwarmEvent::Behaviour(MetaversoBehaviourEvent::Gossipsub(GossipsubEvent::Message {
                        propagation_source,
                        message_id,
                        message,
                    })) => {
                        self.handle_gossipsub_message(propagation_source, message_id, message).await;
                    }
                    SwarmEvent::Behaviour(MetaversoBehaviourEvent::RequestResponse(RequestResponseEvent::Message {
                        peer,
                        message,
                    })) => {
                        self.handle_request_response(peer, message).await;
                    }
                    _ => {}
                }
            }
        }

        Ok(())
    }

    /// Actualizar latencia del peer
    async fn update_peer_latency(&mut self, peer: PeerId, rtt: std::time::Duration) {
        let mut peers = self.peers.write().unwrap();
        if let Some(peer_info) = peers.get_mut(&peer) {
            peer_info.latency = rtt.as_secs_f32() * 1000.0; // Convertir a ms
            peer_info.last_ping = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();
        }
    }

    /// Manejar peer identificado
    async fn handle_peer_identified(&mut self, peer_id: PeerId, info: libp2p::identify::Info) {
        let mut peers = self.peers.write().unwrap();
        let peer_info = PeerInfo {
            peer_id,
            address: info.listen_addrs[0].clone(),
            connection_state: ConnectionState::Connected,
            latency: 0.0,
            last_ping: 0,
            metadata: HashMap::new(),
        };
        peers.insert(peer_id, peer_info);
        
        let mut state = self.state.write().unwrap();
        state.peer_count = peers.len();
        state.connected = true;
    }

    /// Manejar mensaje gossipsub
    async fn handle_gossipsub_message(
        &mut self,
        source: PeerId,
        message_id: MessageId,
        message: libp2p::gossipsub::Message,
    ) {
        let network_message = NetworkMessage {
            id: message_id.to_string(),
            message_type: MessageType::Custom("gossipsub".to_string()),
            sender: source,
            recipient: None,
            data: message.data,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            priority: MessagePriority::Normal,
        };

        let mut pending = self.pending_messages.write().unwrap();
        pending.push(network_message);
    }

    /// Manejar request-response
    async fn handle_request_response(
        &mut self,
        peer: PeerId,
        message: libp2p::request_response::Message<Vec<u8>, Vec<u8>>,
    ) {
        match message {
            libp2p::request_response::Message::Request { request_id, request, .. } => {
                // Procesar request
                let response = self.process_request(request).await;
                // Enviar response (implementar)
            }
            libp2p::request_response::Message::Response { request_id, response } => {
                // Procesar response
                self.process_response(request_id, response).await;
            }
        }
    }

    /// Procesar request
    async fn process_request(&self, request: Vec<u8>) -> Vec<u8> {
        // Implementar procesamiento de request
        vec![]
    }

    /// Procesar response
    async fn process_response(&mut self, request_id: libp2p::request_response::RequestId, response: Vec<u8>) {
        // Implementar procesamiento de response
    }

    /// Procesar mensajes pendientes
    async fn process_pending_messages(&mut self) -> Result<()> {
        let mut pending = self.pending_messages.write().unwrap();
        let messages = std::mem::take(&mut *pending);

        for message in messages {
            self.process_message(message).await?;
        }

        Ok(())
    }

    /// Procesar mensaje
    async fn process_message(&mut self, message: NetworkMessage) -> Result<()> {
        match message.message_type {
            MessageType::Position => {
                // Procesar actualización de posición
                self.handle_position_update(message).await?;
            }
            MessageType::Animation => {
                // Procesar actualización de animación
                self.handle_animation_update(message).await?;
            }
            MessageType::Chat => {
                // Procesar mensaje de chat
                self.handle_chat_message(message).await?;
            }
            MessageType::State => {
                // Procesar actualización de estado
                self.handle_state_update(message).await?;
            }
            MessageType::Custom(_) => {
                // Procesar mensaje personalizado
                self.handle_custom_message(message).await?;
            }
        }

        self.stats.messages_received += 1;
        Ok(())
    }

    /// Manejar actualización de posición
    async fn handle_position_update(&mut self, message: NetworkMessage) -> Result<()> {
        // Implementar sincronización de posición
        debug!("Procesando actualización de posición de {}", message.sender);
        Ok(())
    }

    /// Manejar actualización de animación
    async fn handle_animation_update(&mut self, message: NetworkMessage) -> Result<()> {
        // Implementar sincronización de animación
        debug!("Procesando actualización de animación de {}", message.sender);
        Ok(())
    }

    /// Manejar mensaje de chat
    async fn handle_chat_message(&mut self, message: NetworkMessage) -> Result<()> {
        // Implementar procesamiento de chat
        debug!("Procesando mensaje de chat de {}", message.sender);
        Ok(())
    }

    /// Manejar actualización de estado
    async fn handle_state_update(&mut self, message: NetworkMessage) -> Result<()> {
        // Implementar sincronización de estado
        debug!("Procesando actualización de estado de {}", message.sender);
        Ok(())
    }

    /// Manejar mensaje personalizado
    async fn handle_custom_message(&mut self, message: NetworkMessage) -> Result<()> {
        // Implementar procesamiento de mensajes personalizados
        debug!("Procesando mensaje personalizado de {}", message.sender);
        Ok(())
    }

    /// Actualizar estado de peers
    async fn update_peer_states(&mut self) -> Result<()> {
        let mut peers = self.peers.write().unwrap();
        let mut total_latency = 0.0;
        let mut active_peers = 0;

        for peer_info in peers.values_mut() {
            // Verificar si el peer sigue activo
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();

            if now - peer_info.last_ping > 30 {
                peer_info.connection_state = ConnectionState::Disconnected;
            } else {
                total_latency += peer_info.latency;
                active_peers += 1;
            }
        }

        // Actualizar estado de red
        let mut state = self.state.write().unwrap();
        state.peer_count = active_peers;
        if active_peers > 0 {
            state.average_latency = total_latency / active_peers as f32;
        }

        Ok(())
    }

    /// Enviar mensaje
    pub async fn send_message(&mut self, message: NetworkMessage) -> Result<()> {
        if let Some(swarm) = &mut self.swarm {
            match message.message_type {
                MessageType::Position | MessageType::Animation | MessageType::State => {
                    // Usar gossipsub para mensajes de estado
                    let topic = libp2p::gossipsub::IdentTopic::new("metaverso-state");
                    swarm.behaviour_mut().gossipsub.publish(topic, message.data)?;
                }
                MessageType::Chat => {
                    // Usar gossipsub para chat
                    let topic = libp2p::gossipsub::IdentTopic::new("metaverso-chat");
                    swarm.behaviour_mut().gossipsub.publish(topic, message.data)?;
                }
                MessageType::Custom(_) => {
                    // Usar request-response para mensajes personalizados
                    if let Some(recipient) = message.recipient {
                        swarm.behaviour_mut().request_response.send_request(&recipient, message.data);
                    }
                }
            }

            self.stats.messages_sent += 1;
        }

        Ok(())
    }

    /// Obtener peers
    pub fn get_peers(&self) -> Vec<PeerInfo> {
        let peers = self.peers.read().unwrap();
        peers.values().cloned().collect()
    }

    /// Obtener estado de red
    pub fn get_network_state(&self) -> NetworkState {
        let state = self.state.read().unwrap();
        state.clone()
    }

    /// Actualizar estadísticas
    fn update_stats(&mut self, connection_time: f32) {
        self.stats.connection_time = connection_time;
        self.stats.peer_count = self.peers.read().unwrap().len();
        
        // Calcular latencia promedio
        let peers = self.peers.read().unwrap();
        let total_latency: f32 = peers.values().map(|p| p.latency).sum();
        if !peers.is_empty() {
            self.stats.average_latency = total_latency / peers.len() as f32;
        }

        // Calcular uso de memoria
        self.stats.memory_usage = std::mem::size_of_val(self);
    }

    /// Obtener estadísticas
    pub fn get_stats(&self) -> NetworkingStats {
        self.stats.clone()
    }

    /// Limpiar sistema
    pub async fn cleanup(&mut self) -> Result<()> {
        info!("Limpiando sistema de networking");
        
        self.running = false;
        self.swarm = None;
        self.peers.write().unwrap().clear();
        self.pending_messages.write().unwrap().clear();
        
        info!("Sistema de networking limpiado");
        Ok(())
    }
}

// Configuraciones adicionales
impl IdentifyConfig {
    fn new(protocol_version: String, peer_id: PeerId) -> Self {
        Self {
            protocol_version,
            agent_version: "metaverso/1.0.0".to_string(),
            local_peer_id: peer_id,
            push_listen_addr_updates: true,
            ..Default::default()
        }
    }
}

impl GossipsubConfig {
    fn default() -> Self {
        Self {
            validation_mode: ValidationMode::Strict,
            ..Default::default()
        }
    }
} 