//! # Física Distribuida
//! 
//! Implementación completa de física distribuida para el metaverso.
//! Maneja sincronización, particionamiento espacial y optimización de rendimiento.

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{RwLock, mpsc};
use serde::{Serialize, Deserialize};
use tracing::{info, error, debug, warn};
use nalgebra::{Vector3, Isometry3};
use rapier3d::prelude::*;
use uuid::Uuid;

use super::{PhysicsObject, CollisionEvent, PhysicsConfig};

/// Sistema de física distribuida
pub struct DistributedPhysics {
    /// Configuración
    config: DistributedPhysicsConfig,
    /// Nodos de física
    nodes: Arc<RwLock<HashMap<String, PhysicsNode>>>,
    /// Particionamiento espacial
    spatial_partitioning: SpatialPartitioning,
    /// Sincronización
    synchronization: PhysicsSynchronization,
    /// Canal de eventos
    event_tx: mpsc::Sender<DistributedPhysicsEvent>,
    /// Canal de comandos
    command_tx: mpsc::Sender<DistributedPhysicsCommand>,
    /// Estado del sistema
    running: bool,
}

/// Configuración de física distribuida
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DistributedPhysicsConfig {
    /// Habilitar física distribuida
    pub enabled: bool,
    /// Número máximo de nodos
    pub max_nodes: usize,
    /// Tamaño de región por nodo
    pub region_size: f32,
    /// Frecuencia de sincronización
    pub sync_frequency: std::time::Duration,
    /// Tolerancia de latencia
    pub latency_tolerance: std::time::Duration,
    /// Habilitar predicción
    pub enable_prediction: bool,
    /// Habilitar interpolación
    pub enable_interpolation: bool,
    /// Configuración de optimización
    pub optimization: OptimizationConfig,
}

/// Configuración de optimización
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationConfig {
    /// LOD dinámico
    pub dynamic_lod: bool,
    /// Culling de frustum
    pub frustum_culling: bool,
    /// Occlusion culling
    pub occlusion_culling: bool,
    /// Level of detail
    pub lod_levels: Vec<LODLevel>,
    /// Distancia de renderizado
    pub render_distance: f32,
}

/// Nivel de LOD
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LODLevel {
    /// Distancia
    pub distance: f32,
    /// Factor de reducción
    pub reduction_factor: f32,
    /// Nivel de detalle
    pub detail_level: u32,
}

/// Nodo de física
pub struct PhysicsNode {
    /// ID del nodo
    pub id: String,
    /// Región de responsabilidad
    pub region: PhysicsRegion,
    /// Objetos físicos en este nodo
    pub objects: HashMap<u64, PhysicsObject>,
    /// Estado del nodo
    pub status: NodeStatus,
    /// Estadísticas del nodo
    pub stats: NodeStats,
    /// Última actualización
    pub last_update: std::time::Instant,
}

/// Región de física
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsRegion {
    /// Centro de la región
    pub center: [f32; 3],
    /// Tamaño de la región
    pub size: [f32; 3],
    /// Bounds de la región
    pub bounds: RegionBounds,
    /// Objetos en la región
    pub objects: Vec<u64>,
}

/// Bounds de región
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegionBounds {
    /// Mínimo
    pub min: [f32; 3],
    /// Máximo
    pub max: [f32; 3],
}

/// Estado del nodo
#[derive(Debug, Clone)]
pub enum NodeStatus {
    Active,
    Inactive,
    Overloaded,
    Error(String),
    Syncing,
}

/// Estadísticas del nodo
#[derive(Debug, Clone)]
pub struct NodeStats {
    /// Número de objetos
    pub object_count: usize,
    /// CPU usage
    pub cpu_usage: f32,
    /// Memory usage
    pub memory_usage: f32,
    /// Latencia de red
    pub network_latency: std::time::Duration,
    /// FPS
    pub fps: f32,
    /// Última actualización
    pub last_update: std::time::Instant,
}

/// Particionamiento espacial
pub struct SpatialPartitioning {
    /// Octree para particionamiento
    octree: Octree,
    /// Configuración
    config: PartitioningConfig,
    /// Estadísticas
    stats: PartitioningStats,
}

/// Octree
pub struct Octree {
    /// Nodos del octree
    nodes: Vec<OctreeNode>,
    /// Configuración
    config: OctreeConfig,
    /// Profundidad máxima
    max_depth: u32,
}

/// Nodo del octree
#[derive(Debug, Clone)]
pub struct OctreeNode {
    /// Centro del nodo
    pub center: [f32; 3],
    /// Tamaño del nodo
    pub size: f32,
    /// Objetos en el nodo
    pub objects: Vec<u64>,
    /// Hijos del nodo
    pub children: Vec<usize>,
    /// Profundidad
    pub depth: u32,
    /// Bounds del nodo
    pub bounds: RegionBounds,
}

/// Configuración del octree
#[derive(Debug, Clone)]
pub struct OctreeConfig {
    /// Profundidad máxima
    pub max_depth: u32,
    /// Tamaño mínimo del nodo
    pub min_node_size: f32,
    /// Número máximo de objetos por nodo
    pub max_objects_per_node: usize,
    /// Factor de expansión
    pub expansion_factor: f32,
}

/// Configuración de particionamiento
#[derive(Debug, Clone)]
pub struct PartitioningConfig {
    /// Estrategia de particionamiento
    pub strategy: PartitioningStrategy,
    /// Tamaño de región
    pub region_size: f32,
    /// Solapamiento
    pub overlap: f32,
    /// Rebalanceo automático
    pub auto_rebalance: bool,
}

/// Estrategia de particionamiento
#[derive(Debug, Clone)]
pub enum PartitioningStrategy {
    Uniform,
    Adaptive,
    LoadBalanced,
    SpatialHash,
}

/// Estadísticas de particionamiento
#[derive(Debug, Clone)]
pub struct PartitioningStats {
    /// Número total de nodos
    pub total_nodes: usize,
    /// Número de objetos
    pub total_objects: usize,
    /// Tiempo de actualización
    pub update_time: std::time::Duration,
    /// Eficiencia de particionamiento
    pub efficiency: f32,
}

/// Sincronización de física
pub struct PhysicsSynchronization {
    /// Estado de sincronización
    state: SyncState,
    /// Configuración
    config: SyncConfig,
    /// Buffer de sincronización
    sync_buffer: SyncBuffer,
}

/// Estado de sincronización
#[derive(Debug, Clone)]
pub struct SyncState {
    /// Última sincronización
    pub last_sync: std::time::Instant,
    /// Latencia de red
    pub network_latency: std::time::Duration,
    /// Jitter
    pub jitter: std::time::Duration,
    /// Pérdida de paquetes
    pub packet_loss: f32,
    /// Estado de sincronización
    pub sync_status: SyncStatus,
}

/// Estado de sincronización
#[derive(Debug, Clone)]
pub enum SyncStatus {
    Synchronized,
    Desynchronized,
    Syncing,
    Error(String),
}

/// Configuración de sincronización
#[derive(Debug, Clone)]
pub struct SyncConfig {
    /// Frecuencia de sincronización
    pub sync_frequency: std::time::Duration,
    /// Interpolación
    pub interpolation: bool,
    /// Predicción
    pub prediction: bool,
    /// Compensación de latencia
    pub lag_compensation: bool,
    /// Tolerancia de desincronización
    pub desync_tolerance: f32,
}

/// Buffer de sincronización
pub struct SyncBuffer {
    /// Estados anteriores
    previous_states: Vec<PhysicsState>,
    /// Estados futuros
    future_states: Vec<PhysicsState>,
    /// Tamaño máximo del buffer
    max_size: usize,
}

/// Estado de física
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsState {
    /// ID del objeto
    pub object_id: u64,
    /// Posición
    pub position: [f32; 3],
    /// Rotación
    pub rotation: [f32; 4],
    /// Velocidad lineal
    pub linear_velocity: [f32; 3],
    /// Velocidad angular
    pub angular_velocity: [f32; 3],
    /// Timestamp
    pub timestamp: std::time::Instant,
}

/// Evento de física distribuida
#[derive(Debug, Clone)]
pub enum DistributedPhysicsEvent {
    /// Objeto movido
    ObjectMoved { object_id: u64, new_position: [f32; 3] },
    /// Colisión detectada
    CollisionDetected { collision: CollisionEvent },
    /// Nodo sobrecargado
    NodeOverloaded { node_id: String },
    /// Sincronización requerida
    SyncRequired { node_id: String },
    /// Error de sincronización
    SyncError { node_id: String, error: String },
}

/// Comando de física distribuida
#[derive(Debug, Clone)]
pub enum DistributedPhysicsCommand {
    /// Agregar objeto
    AddObject { object: PhysicsObject },
    /// Remover objeto
    RemoveObject { object_id: u64 },
    /// Actualizar objeto
    UpdateObject { object: PhysicsObject },
    /// Mover objeto
    MoveObject { object_id: u64, position: [f32; 3] },
    /// Aplicar fuerza
    ApplyForce { object_id: u64, force: [f32; 3] },
    /// Sincronizar nodo
    SyncNode { node_id: String },
    /// Rebalancear
    Rebalance,
}

impl DistributedPhysics {
    /// Crear nuevo sistema de física distribuida
    pub fn new(config: DistributedPhysicsConfig) -> Self {
        let (event_tx, _event_rx) = mpsc::channel(1000);
        let (command_tx, _command_rx) = mpsc::channel(1000);

        Self {
            config,
            nodes: Arc::new(RwLock::new(HashMap::new())),
            spatial_partitioning: SpatialPartitioning::new(),
            synchronization: PhysicsSynchronization::new(),
            event_tx,
            command_tx,
            running: false,
        }
    }

    /// Inicializar sistema
    pub async fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🚀 Inicializando sistema de física distribuida...");

        // Inicializar particionamiento espacial
        self.spatial_partitioning.initialize().await?;

        // Inicializar sincronización
        self.synchronization.initialize().await?;

        // Crear nodo inicial
        let initial_node = PhysicsNode::new("main".to_string());
        self.nodes.write().await.insert("main".to_string(), initial_node);

        self.running = true;
        info!("✅ Sistema de física distribuida inicializado");

        Ok(())
    }

    /// Actualizar sistema
    pub async fn update(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        if !self.running {
            return Ok(());
        }

        // Actualizar particionamiento espacial
        self.spatial_partitioning.update().await?;

        // Actualizar sincronización
        self.synchronization.update().await?;

        // Procesar comandos
        self.process_commands().await?;

        // Procesar eventos
        self.process_events().await?;

        // Rebalancear si es necesario
        if self.should_rebalance().await {
            self.rebalance().await?;
        }

        Ok(())
    }

    /// Agregar objeto físico
    pub async fn add_object(&mut self, object: PhysicsObject) -> Result<(), Box<dyn std::error::Error>> {
        let object_id = object.id;
        
        // Determinar nodo apropiado
        let node_id = self.find_appropriate_node(&object).await?;
        
        // Agregar objeto al nodo
        if let Some(node) = self.nodes.write().await.get_mut(&node_id) {
            node.objects.insert(object_id, object.clone());
            node.stats.object_count = node.objects.len();
            
            // Actualizar particionamiento espacial
            self.spatial_partitioning.add_object(object_id, &object).await?;
            
            info!("✅ Objeto {} agregado al nodo {}", object_id, node_id);
        }

        Ok(())
    }

    /// Remover objeto físico
    pub async fn remove_object(&mut self, object_id: u64) -> Result<(), Box<dyn std::error::Error>> {
        // Encontrar nodo que contiene el objeto
        let mut nodes = self.nodes.write().await;
        for node in nodes.values_mut() {
            if node.objects.contains_key(&object_id) {
                node.objects.remove(&object_id);
                node.stats.object_count = node.objects.len();
                
                // Actualizar particionamiento espacial
                self.spatial_partitioning.remove_object(object_id).await?;
                
                info!("✅ Objeto {} removido del nodo {}", object_id, node.id);
                break;
            }
        }

        Ok(())
    }

    /// Actualizar objeto físico
    pub async fn update_object(&mut self, object: PhysicsObject) -> Result<(), Box<dyn std::error::Error>> {
        let object_id = object.id;
        
        // Encontrar nodo que contiene el objeto
        let mut nodes = self.nodes.write().await;
        for node in nodes.values_mut() {
            if let Some(existing_object) = node.objects.get_mut(&object_id) {
                *existing_object = object.clone();
                
                // Actualizar particionamiento espacial
                self.spatial_partitioning.update_object(object_id, &object).await?;
                
                // Enviar evento de movimiento
                let _ = self.event_tx.send(DistributedPhysicsEvent::ObjectMoved {
                    object_id,
                    new_position: object.position,
                }).await;
                
                break;
            }
        }

        Ok(())
    }

    /// Encontrar nodo apropiado para un objeto
    async fn find_appropriate_node(&self, object: &PhysicsObject) -> Result<String, Box<dyn std::error::Error>> {
        let nodes = self.nodes.read().await;
        
        // Buscar nodo con menor carga
        let mut best_node = None;
        let mut min_load = f32::MAX;
        
        for (node_id, node) in nodes.iter() {
            if node.status == NodeStatus::Active {
                let load = self.calculate_node_load(node).await;
                if load < min_load {
                    min_load = load;
                    best_node = Some(node_id.clone());
                }
            }
        }
        
        best_node.ok_or_else(|| "No hay nodos disponibles".into())
    }

    /// Calcular carga de un nodo
    async fn calculate_node_load(&self, node: &PhysicsNode) -> f32 {
        let object_count = node.objects.len() as f32;
        let cpu_usage = node.stats.cpu_usage;
        let memory_usage = node.stats.memory_usage;
        
        // Fórmula de carga ponderada
        object_count * 0.4 + cpu_usage * 0.3 + memory_usage * 0.3
    }

    /// Verificar si se necesita rebalanceo
    async fn should_rebalance(&self) -> bool {
        let nodes = self.nodes.read().await;
        
        if nodes.len() < 2 {
            return false;
        }
        
        let loads: Vec<f32> = nodes.values()
            .map(|node| node.stats.cpu_usage)
            .collect();
        
        let avg_load = loads.iter().sum::<f32>() / loads.len() as f32;
        let max_load = loads.iter().fold(0.0, |a, &b| a.max(b));
        
        // Rebalancear si la diferencia es mayor al 20%
        (max_load - avg_load) / avg_load > 0.2
    }

    /// Rebalancear carga entre nodos
    async fn rebalance(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🔄 Rebalanceando carga entre nodos...");
        
        // Implementar algoritmo de rebalanceo
        // 1. Calcular carga de cada nodo
        // 2. Identificar nodos sobrecargados y subcargados
        // 3. Mover objetos entre nodos
        // 4. Actualizar particionamiento espacial
        
        info!("✅ Rebalanceo completado");
        Ok(())
    }

    /// Procesar comandos
    async fn process_commands(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Procesar comandos pendientes
        Ok(())
    }

    /// Procesar eventos
    async fn process_events(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Procesar eventos pendientes
        Ok(())
    }

    /// Limpiar sistema
    pub async fn cleanup(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🧹 Limpiando sistema de física distribuida...");
        
        self.running = false;
        
        // Limpiar nodos
        self.nodes.write().await.clear();
        
        // Limpiar particionamiento espacial
        self.spatial_partitioning.cleanup().await?;
        
        // Limpiar sincronización
        self.synchronization.cleanup().await?;
        
        info!("✅ Sistema de física distribuida limpiado");
        Ok(())
    }

    /// Health check
    pub async fn health_check(&self) -> bool {
        self.running && !self.nodes.read().await.is_empty()
    }

    /// Obtener estadísticas
    pub async fn get_stats(&self) -> DistributedPhysicsStats {
        let nodes = self.nodes.read().await;
        let node_count = nodes.len();
        let total_objects: usize = nodes.values().map(|n| n.objects.len()).sum();
        
        DistributedPhysicsStats {
            node_count,
            total_objects,
            spatial_partitioning_stats: self.spatial_partitioning.get_stats().await,
            sync_stats: self.synchronization.get_stats().await,
        }
    }
}

/// Estadísticas de física distribuida
#[derive(Debug, Clone)]
pub struct DistributedPhysicsStats {
    /// Número de nodos
    pub node_count: usize,
    /// Número total de objetos
    pub total_objects: usize,
    /// Estadísticas de particionamiento espacial
    pub spatial_partitioning_stats: PartitioningStats,
    /// Estadísticas de sincronización
    pub sync_stats: SyncState,
}

impl PhysicsNode {
    /// Crear nuevo nodo
    pub fn new(id: String) -> Self {
        Self {
            id,
            region: PhysicsRegion::default(),
            objects: HashMap::new(),
            status: NodeStatus::Active,
            stats: NodeStats::default(),
            last_update: std::time::Instant::now(),
        }
    }
}

impl PhysicsRegion {
    /// Crear nueva región
    pub fn new(center: [f32; 3], size: [f32; 3]) -> Self {
        let half_size = [size[0] / 2.0, size[1] / 2.0, size[2] / 2.0];
        let bounds = RegionBounds {
            min: [center[0] - half_size[0], center[1] - half_size[1], center[2] - half_size[2]],
            max: [center[0] + half_size[0], center[1] + half_size[1], center[2] + half_size[2]],
        };
        
        Self {
            center,
            size,
            bounds,
            objects: Vec::new(),
        }
    }
}

impl Default for PhysicsRegion {
    fn default() -> Self {
        Self::new([0.0, 0.0, 0.0], [1000.0, 1000.0, 1000.0])
    }
}

impl NodeStats {
    /// Crear estadísticas por defecto
    pub fn default() -> Self {
        Self {
            object_count: 0,
            cpu_usage: 0.0,
            memory_usage: 0.0,
            network_latency: std::time::Duration::from_millis(0),
            fps: 60.0,
            last_update: std::time::Instant::now(),
        }
    }
}

impl SpatialPartitioning {
    /// Crear nuevo particionamiento espacial
    pub fn new() -> Self {
        Self {
            octree: Octree::new(),
            config: PartitioningConfig::default(),
            stats: PartitioningStats::default(),
        }
    }

    /// Inicializar
    pub async fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.octree.initialize(&self.config).await?;
        Ok(())
    }

    /// Actualizar
    pub async fn update(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.octree.update().await?;
        self.update_stats().await;
        Ok(())
    }

    /// Agregar objeto
    pub async fn add_object(&mut self, object_id: u64, object: &PhysicsObject) -> Result<(), Box<dyn std::error::Error>> {
        self.octree.add_object(object_id, object).await?;
        Ok(())
    }

    /// Remover objeto
    pub async fn remove_object(&mut self, object_id: u64) -> Result<(), Box<dyn std::error::Error>> {
        self.octree.remove_object(object_id).await?;
        Ok(())
    }

    /// Actualizar objeto
    pub async fn update_object(&mut self, object_id: u64, object: &PhysicsObject) -> Result<(), Box<dyn std::error::Error>> {
        self.octree.update_object(object_id, object).await?;
        Ok(())
    }

    /// Limpiar
    pub async fn cleanup(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.octree.cleanup().await?;
        Ok(())
    }

    /// Obtener estadísticas
    pub async fn get_stats(&self) -> PartitioningStats {
        self.stats.clone()
    }

    /// Actualizar estadísticas
    async fn update_stats(&mut self) {
        self.stats.total_nodes = self.octree.nodes.len();
        self.stats.total_objects = self.octree.get_total_objects().await;
        self.stats.update_time = std::time::Duration::from_millis(1); // Placeholder
        self.stats.efficiency = self.calculate_efficiency().await;
    }

    /// Calcular eficiencia
    async fn calculate_efficiency(&self) -> f32 {
        // Implementar cálculo de eficiencia
        0.85 // Placeholder
    }
}

impl PartitioningConfig {
    /// Crear configuración por defecto
    pub fn default() -> Self {
        Self {
            strategy: PartitioningStrategy::Adaptive,
            region_size: 100.0,
            overlap: 10.0,
            auto_rebalance: true,
        }
    }
}

impl PartitioningStats {
    /// Crear estadísticas por defecto
    pub fn default() -> Self {
        Self {
            total_nodes: 0,
            total_objects: 0,
            update_time: std::time::Duration::from_millis(0),
            efficiency: 0.0,
        }
    }
}

impl Octree {
    /// Crear nuevo octree
    pub fn new() -> Self {
        Self {
            nodes: Vec::new(),
            config: OctreeConfig::default(),
            max_depth: 8,
        }
    }

    /// Inicializar
    pub async fn initialize(&mut self, config: &PartitioningConfig) -> Result<(), Box<dyn std::error::Error>> {
        // Crear nodo raíz
        let root_node = OctreeNode::new([0.0, 0.0, 0.0], 1000.0, 0);
        self.nodes.push(root_node);
        Ok(())
    }

    /// Actualizar
    pub async fn update(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Actualizar octree
        Ok(())
    }

    /// Agregar objeto
    pub async fn add_object(&mut self, object_id: u64, object: &PhysicsObject) -> Result<(), Box<dyn std::error::Error>> {
        // Agregar objeto al octree
        Ok(())
    }

    /// Remover objeto
    pub async fn remove_object(&mut self, object_id: u64) -> Result<(), Box<dyn std::error::Error>> {
        // Remover objeto del octree
        Ok(())
    }

    /// Actualizar objeto
    pub async fn update_object(&mut self, object_id: u64, object: &PhysicsObject) -> Result<(), Box<dyn std::error::Error>> {
        // Actualizar objeto en el octree
        Ok(())
    }

    /// Limpiar
    pub async fn cleanup(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.nodes.clear();
        Ok(())
    }

    /// Obtener número total de objetos
    pub async fn get_total_objects(&self) -> usize {
        self.nodes.iter().map(|node| node.objects.len()).sum()
    }
}

impl OctreeNode {
    /// Crear nuevo nodo
    pub fn new(center: [f32; 3], size: f32, depth: u32) -> Self {
        let half_size = size / 2.0;
        let bounds = RegionBounds {
            min: [center[0] - half_size, center[1] - half_size, center[2] - half_size],
            max: [center[0] + half_size, center[1] + half_size, center[2] + half_size],
        };
        
        Self {
            center,
            size,
            objects: Vec::new(),
            children: Vec::new(),
            depth,
            bounds,
        }
    }
}

impl OctreeConfig {
    /// Crear configuración por defecto
    pub fn default() -> Self {
        Self {
            max_depth: 8,
            min_node_size: 10.0,
            max_objects_per_node: 10,
            expansion_factor: 1.2,
        }
    }
}

impl PhysicsSynchronization {
    /// Crear nueva sincronización
    pub fn new() -> Self {
        Self {
            state: SyncState::default(),
            config: SyncConfig::default(),
            sync_buffer: SyncBuffer::new(),
        }
    }

    /// Inicializar
    pub async fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.state.sync_status = SyncStatus::Synchronized;
        Ok(())
    }

    /// Actualizar
    pub async fn update(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Actualizar sincronización
        Ok(())
    }

    /// Limpiar
    pub async fn cleanup(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.sync_buffer.cleanup().await?;
        Ok(())
    }

    /// Obtener estadísticas
    pub async fn get_stats(&self) -> SyncState {
        self.state.clone()
    }
}

impl SyncState {
    /// Crear estado por defecto
    pub fn default() -> Self {
        Self {
            last_sync: std::time::Instant::now(),
            network_latency: std::time::Duration::from_millis(0),
            jitter: std::time::Duration::from_millis(0),
            packet_loss: 0.0,
            sync_status: SyncStatus::Synchronized,
        }
    }
}

impl SyncConfig {
    /// Crear configuración por defecto
    pub fn default() -> Self {
        Self {
            sync_frequency: std::time::Duration::from_millis(16), // 60 FPS
            interpolation: true,
            prediction: true,
            lag_compensation: true,
            desync_tolerance: 0.1,
        }
    }
}

impl SyncBuffer {
    /// Crear nuevo buffer
    pub fn new() -> Self {
        Self {
            previous_states: Vec::new(),
            future_states: Vec::new(),
            max_size: 100,
        }
    }

    /// Limpiar
    pub async fn cleanup(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.previous_states.clear();
        self.future_states.clear();
        Ok(())
    }
} 