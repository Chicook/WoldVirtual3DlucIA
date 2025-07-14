//! # Entity Component System (ECS)
//! 
//! Sistema ECS optimizado para el metaverso 3D descentralizado.
//! Proporciona gestión eficiente de entidades, componentes y sistemas.

use std::collections::HashMap;
use std::any::{Any, TypeId};
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use tracing::{info, error, debug};

/// ID único de entidad
pub type EntityId = u64;

/// Componente base para todos los componentes del ECS
pub trait Component: Send + Sync + 'static {
    /// Tipo del componente
    fn component_type() -> TypeId;
    /// Clona el componente
    fn clone_component(&self) -> Box<dyn Component>;
}

/// Sistema base para todos los sistemas del ECS
#[async_trait::async_trait]
pub trait System: Send + Sync {
    /// Actualiza el sistema
    async fn update(&mut self, world: &mut World) -> Result<(), Box<dyn std::error::Error>>;
    /// Obtiene las dependencias del sistema
    fn dependencies(&self) -> Vec<TypeId>;
    /// Obtiene el nombre del sistema
    fn name(&self) -> &'static str;
}

/// Mundo del ECS que contiene todas las entidades y sistemas
pub struct World {
    /// Contador de entidades
    entity_counter: EntityId,
    /// Entidades activas
    entities: HashMap<EntityId, Entity>,
    /// Componentes organizados por tipo
    components: HashMap<TypeId, HashMap<EntityId, Box<dyn Component>>>,
    /// Sistemas registrados
    systems: Vec<Box<dyn System>>,
    /// Sistema de eventos
    events: Arc<RwLock<EventSystem>>,
}

/// Entidad del ECS
#[derive(Debug, Clone)]
pub struct Entity {
    /// ID único de la entidad
    pub id: EntityId,
    /// Nombre de la entidad
    pub name: String,
    /// Componentes de la entidad
    pub components: Vec<TypeId>,
    /// Estado de la entidad
    pub active: bool,
}

/// Sistema de eventos del ECS
pub struct EventSystem {
    /// Eventos pendientes
    events: Vec<Event>,
    /// Suscriptores de eventos
    subscribers: HashMap<EventType, Vec<Box<dyn EventHandler>>>,
}

/// Tipo de evento
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum EventType {
    EntityCreated(EntityId),
    EntityDestroyed(EntityId),
    ComponentAdded(EntityId, TypeId),
    ComponentRemoved(EntityId, TypeId),
    SystemStarted(String),
    SystemStopped(String),
    Custom(String),
}

/// Evento del sistema
#[derive(Debug, Clone)]
pub struct Event {
    /// Tipo de evento
    pub event_type: EventType,
    /// Datos del evento
    pub data: Option<Box<dyn Any + Send + Sync>>,
    /// Timestamp del evento
    pub timestamp: std::time::Instant,
}

/// Manejador de eventos
#[async_trait::async_trait]
pub trait EventHandler: Send + Sync {
    /// Maneja un evento
    async fn handle(&self, event: &Event) -> Result<(), Box<dyn std::error::Error>>;
}

impl World {
    /// Crea un nuevo mundo ECS
    pub fn new() -> Self {
        info!("🌍 Creando nuevo mundo ECS...");
        
        Self {
            entity_counter: 0,
            entities: HashMap::new(),
            components: HashMap::new(),
            systems: Vec::new(),
            events: Arc::new(RwLock::new(EventSystem::new())),
        }
    }

    /// Crea una nueva entidad
    pub fn create_entity(&mut self, name: &str) -> EntityId {
        let id = self.entity_counter;
        self.entity_counter += 1;
        
        let entity = Entity {
            id,
            name: name.to_string(),
            components: Vec::new(),
            active: true,
        };
        
        self.entities.insert(id, entity);
        
        // Emitir evento
        let event = Event {
            event_type: EventType::EntityCreated(id),
            data: None,
            timestamp: std::time::Instant::now(),
        };
        
        tokio::spawn({
            let events = self.events.clone();
            async move {
                if let Ok(mut events) = events.write().await {
                    events.emit(event).await;
                }
            }
        });
        
        debug!("✅ Entidad creada: {} (ID: {})", name, id);
        id
    }

    /// Destruye una entidad
    pub fn destroy_entity(&mut self, id: EntityId) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(entity) = self.entities.remove(&id) {
            // Remover todos los componentes de la entidad
            for component_type in &entity.components {
                if let Some(components) = self.components.get_mut(component_type) {
                    components.remove(&id);
                }
            }
            
            // Emitir evento
            let event = Event {
                event_type: EventType::EntityDestroyed(id),
                data: None,
                timestamp: std::time::Instant::now(),
            };
            
            tokio::spawn({
                let events = self.events.clone();
                async move {
                    if let Ok(mut events) = events.write().await {
                        events.emit(event).await;
                    }
                }
            });
            
            debug!("🗑️ Entidad destruida: {} (ID: {})", entity.name, id);
        }
        
        Ok(())
    }

    /// Agrega un componente a una entidad
    pub fn add_component<T: Component>(&mut self, entity_id: EntityId, component: T) -> Result<(), Box<dyn std::error::Error>> {
        let component_type = T::component_type();
        
        // Agregar componente al mapa de componentes
        self.components
            .entry(component_type)
            .or_insert_with(HashMap::new)
            .insert(entity_id, component.clone_component());
        
        // Actualizar entidad
        if let Some(entity) = self.entities.get_mut(&entity_id) {
            entity.components.push(component_type);
        }
        
        // Emitir evento
        let event = Event {
            event_type: EventType::ComponentAdded(entity_id, component_type),
            data: None,
            timestamp: std::time::Instant::now(),
        };
        
        tokio::spawn({
            let events = self.events.clone();
            async move {
                if let Ok(mut events) = events.write().await {
                    events.emit(event).await;
                }
            }
        });
        
        debug!("➕ Componente agregado a entidad {}: {:?}", entity_id, component_type);
        Ok(())
    }

    /// Obtiene un componente de una entidad
    pub fn get_component<T: Component>(&self, entity_id: EntityId) -> Option<&T> {
        let component_type = T::component_type();
        
        self.components
            .get(&component_type)?
            .get(&entity_id)?
            .as_any()
            .downcast_ref::<T>()
    }

    /// Obtiene un componente mutable de una entidad
    pub fn get_component_mut<T: Component>(&mut self, entity_id: EntityId) -> Option<&mut T> {
        let component_type = T::component_type();
        
        self.components
            .get_mut(&component_type)?
            .get_mut(&entity_id)?
            .as_any_mut()
            .downcast_mut::<T>()
    }

    /// Remueve un componente de una entidad
    pub fn remove_component<T: Component>(&mut self, entity_id: EntityId) -> Result<(), Box<dyn std::error::Error>> {
        let component_type = T::component_type();
        
        // Remover componente del mapa
        if let Some(components) = self.components.get_mut(&component_type) {
            components.remove(&entity_id);
        }
        
        // Actualizar entidad
        if let Some(entity) = self.entities.get_mut(&entity_id) {
            entity.components.retain(|&x| x != component_type);
        }
        
        // Emitir evento
        let event = Event {
            event_type: EventType::ComponentRemoved(entity_id, component_type),
            data: None,
            timestamp: std::time::Instant::now(),
        };
        
        tokio::spawn({
            let events = self.events.clone();
            async move {
                if let Ok(mut events) = events.write().await {
                    events.emit(event).await;
                }
            }
        });
        
        debug!("➖ Componente removido de entidad {}: {:?}", entity_id, component_type);
        Ok(())
    }

    /// Registra un sistema
    pub fn register_system(&mut self, system: Box<dyn System>) {
        let system_name = system.name().to_string();
        self.systems.push(system);
        
        debug!("🔧 Sistema registrado: {}", system_name);
    }

    /// Actualiza todos los sistemas
    pub async fn update_systems(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        for system in &mut self.systems {
            if let Err(e) = system.update(self).await {
                error!("❌ Error actualizando sistema {}: {}", system.name(), e);
            }
        }
        
        Ok(())
    }

    /// Obtiene todas las entidades con un componente específico
    pub fn query<T: Component>(&self) -> Vec<EntityId> {
        let component_type = T::component_type();
        
        self.components
            .get(&component_type)
            .map(|components| components.keys().cloned().collect())
            .unwrap_or_default()
    }

    /// Obtiene el número de entidades
    pub fn entity_count(&self) -> usize {
        self.entities.len()
    }

    /// Obtiene el número de sistemas
    pub fn system_count(&self) -> usize {
        self.systems.len()
    }

    /// Verifica si una entidad existe
    pub fn entity_exists(&self, id: EntityId) -> bool {
        self.entities.contains_key(&id)
    }

    /// Obtiene información de una entidad
    pub fn get_entity(&self, id: EntityId) -> Option<&Entity> {
        self.entities.get(&id)
    }
}

impl EventSystem {
    /// Crea un nuevo sistema de eventos
    pub fn new() -> Self {
        Self {
            events: Vec::new(),
            subscribers: HashMap::new(),
        }
    }

    /// Emite un evento
    pub async fn emit(&mut self, event: Event) {
        self.events.push(event.clone());
        
        // Notificar suscriptores
        if let Some(handlers) = self.subscribers.get(&event.event_type) {
            for handler in handlers {
                if let Err(e) = handler.handle(&event).await {
                    error!("❌ Error manejando evento: {}", e);
                }
            }
        }
    }

    /// Suscribe un manejador a un tipo de evento
    pub fn subscribe(&mut self, event_type: EventType, handler: Box<dyn EventHandler>) {
        self.subscribers
            .entry(event_type)
            .or_insert_with(Vec::new)
            .push(handler);
    }

    /// Procesa eventos pendientes
    pub fn process_events(&mut self) {
        self.events.clear();
    }
}

/// Sistema ECS principal
pub struct EcsSystem {
    /// Mundo del ECS
    world: Arc<RwLock<World>>,
    /// Estado del sistema
    running: bool,
}

impl EcsSystem {
    /// Crea un nuevo sistema ECS
    pub fn new() -> Self {
        info!("🔧 Creando sistema ECS...");
        
        Self {
            world: Arc::new(RwLock::new(World::new())),
            running: false,
        }
    }

    /// Inicializa el sistema ECS
    pub async fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🚀 Inicializando sistema ECS...");
        
        // Registrar sistemas por defecto
        let mut world = self.world.write().await;
        
        // Sistema de renderizado
        world.register_system(Box::new(RenderSystem::new()));
        
        // Sistema de física
        world.register_system(Box::new(PhysicsSystem::new()));
        
        // Sistema de audio
        world.register_system(Box::new(AudioSystem::new()));
        
        // Sistema de networking
        world.register_system(Box::new(NetworkSystem::new()));
        
        // Sistema de crypto
        world.register_system(Box::new(CryptoSystem::new()));
        
        self.running = true;
        
        info!("✅ Sistema ECS inicializado correctamente");
        Ok(())
    }

    /// Actualiza el sistema ECS
    pub async fn update(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        if !self.running {
            return Ok(());
        }
        
        let mut world = self.world.write().await;
        world.update_systems().await?;
        
        Ok(())
    }

    /// Limpia el sistema ECS
    pub async fn cleanup(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🧹 Limpiando sistema ECS...");
        
        self.running = false;
        
        let mut world = self.world.write().await;
        world.entities.clear();
        world.components.clear();
        world.systems.clear();
        
        info!("✅ Sistema ECS limpiado correctamente");
        Ok(())
    }

    /// Obtiene el estado de salud del sistema
    pub async fn health_check(&self) -> bool {
        self.running
    }

    /// Obtiene el número de entidades
    pub async fn get_entity_count(&self) -> usize {
        let world = self.world.read().await;
        world.entity_count()
    }
}

// Sistemas específicos del metaverso

/// Sistema de renderizado
pub struct RenderSystem {
    name: &'static str,
}

impl RenderSystem {
    pub fn new() -> Self {
        Self { name: "RenderSystem" }
    }
}

#[async_trait::async_trait]
impl System for RenderSystem {
    async fn update(&mut self, _world: &mut World) -> Result<(), Box<dyn std::error::Error>> {
        // Lógica de renderizado
        Ok(())
    }

    fn dependencies(&self) -> Vec<TypeId> {
        vec![]
    }

    fn name(&self) -> &'static str {
        self.name
    }
}

/// Sistema de física
pub struct PhysicsSystem {
    name: &'static str,
}

impl PhysicsSystem {
    pub fn new() -> Self {
        Self { name: "PhysicsSystem" }
    }
}

#[async_trait::async_trait]
impl System for PhysicsSystem {
    async fn update(&mut self, _world: &mut World) -> Result<(), Box<dyn std::error::Error>> {
        // Lógica de física
        Ok(())
    }

    fn dependencies(&self) -> Vec<TypeId> {
        vec![]
    }

    fn name(&self) -> &'static str {
        self.name
    }
}

/// Sistema de audio
pub struct AudioSystem {
    name: &'static str,
}

impl AudioSystem {
    pub fn new() -> Self {
        Self { name: "AudioSystem" }
    }
}

#[async_trait::async_trait]
impl System for AudioSystem {
    async fn update(&mut self, _world: &mut World) -> Result<(), Box<dyn std::error::Error>> {
        // Lógica de audio
        Ok(())
    }

    fn dependencies(&self) -> Vec<TypeId> {
        vec![]
    }

    fn name(&self) -> &'static str {
        self.name
    }
}

/// Sistema de networking
pub struct NetworkSystem {
    name: &'static str,
}

impl NetworkSystem {
    pub fn new() -> Self {
        Self { name: "NetworkSystem" }
    }
}

#[async_trait::async_trait]
impl System for NetworkSystem {
    async fn update(&mut self, _world: &mut World) -> Result<(), Box<dyn std::error::Error>> {
        // Lógica de networking
        Ok(())
    }

    fn dependencies(&self) -> Vec<TypeId> {
        vec![]
    }

    fn name(&self) -> &'static str {
        self.name
    }
}

/// Sistema de crypto
pub struct CryptoSystem {
    name: &'static str,
}

impl CryptoSystem {
    pub fn new() -> Self {
        Self { name: "CryptoSystem" }
    }
}

#[async_trait::async_trait]
impl System for CryptoSystem {
    async fn update(&mut self, _world: &mut World) -> Result<(), Box<dyn std::error::Error>> {
        // Lógica de crypto
        Ok(())
    }

    fn dependencies(&self) -> Vec<TypeId> {
        vec![]
    }

    fn name(&self) -> &'static str {
        self.name
    }
}

// Componentes específicos del metaverso

/// Componente de transformación 3D
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transform {
    pub position: [f32; 3],
    pub rotation: [f32; 3],
    pub scale: [f32; 3],
}

impl Component for Transform {
    fn component_type() -> TypeId {
        TypeId::of::<Self>()
    }

    fn clone_component(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }
}

/// Componente de modelo 3D
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Model {
    pub mesh_id: String,
    pub material_id: String,
    pub visible: bool,
}

impl Component for Model {
    fn component_type() -> TypeId {
        TypeId::of::<Self>()
    }

    fn clone_component(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }
}

/// Componente de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Camera {
    pub fov: f32,
    pub near: f32,
    pub far: f32,
    pub active: bool,
}

impl Component for Camera {
    fn component_type() -> TypeId {
        TypeId::of::<Self>()
    }

    fn clone_component(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }
}

/// Componente de luz
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Light {
    pub light_type: LightType,
    pub color: [f32; 3],
    pub intensity: f32,
    pub range: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LightType {
    Point,
    Directional,
    Spot,
    Ambient,
}

impl Component for Light {
    fn component_type() -> TypeId {
        TypeId::of::<Self>()
    }

    fn clone_component(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }
}

/// Componente de física
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Physics {
    pub mass: f32,
    pub velocity: [f32; 3],
    pub acceleration: [f32; 3],
    pub collider: Collider,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Collider {
    Box { size: [f32; 3] },
    Sphere { radius: f32 },
    Capsule { radius: f32, height: f32 },
}

impl Component for Physics {
    fn component_type() -> TypeId {
        TypeId::of::<Self>()
    }

    fn clone_component(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }
}

/// Componente de audio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Audio {
    pub source_id: String,
    pub volume: f32,
    pub pitch: f32,
    pub looped: bool,
    pub spatial: bool,
}

impl Component for Audio {
    fn component_type() -> TypeId {
        TypeId::of::<Self>()
    }

    fn clone_component(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }
}

/// Componente de networking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Network {
    pub owner_id: String,
    pub replicated: bool,
    pub authoritative: bool,
    pub interpolation: bool,
}

impl Component for Network {
    fn component_type() -> TypeId {
        TypeId::of::<Self>()
    }

    fn clone_component(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }
}

/// Componente de crypto
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Crypto {
    pub nft_id: Option<String>,
    pub token_id: Option<String>,
    pub owner_address: Option<String>,
    pub verified: bool,
}

impl Component for Crypto {
    fn component_type() -> TypeId {
        TypeId::of::<Self>()
    }

    fn clone_component(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }
}

/// Sistema ECS principal
pub struct ECSSystem {
    /// Configuración del sistema
    config: ECSConfig,
    /// Entidades del sistema
    entities: Arc<RwLock<HashMap<EntityId, Entity>>>,
    /// Componentes del sistema
    components: Arc<RwLock<HashMap<ComponentType, HashMap<EntityId, Box<dyn Component>>>>>,
    /// Sistemas del ECS
    systems: Vec<Box<dyn ECSSystem>>,
    /// Cola de comandos
    command_queue: VecDeque<ECSCommand>,
    /// Estadísticas del sistema
    stats: ECSStats,
    /// Estado del sistema
    running: bool,
}

/// Configuración del sistema ECS
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ECSConfig {
    /// Habilitado
    pub enabled: bool,
    /// Configuración de entidades
    pub entity_config: EntityConfig,
    /// Configuración de componentes
    pub component_config: ComponentConfig,
    /// Configuración de sistemas
    pub system_config: SystemConfig,
    /// Configuración de optimización
    pub optimization_config: OptimizationConfig,
}

/// Configuración de entidades
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityConfig {
    /// Máximo número de entidades
    pub max_entities: usize,
    /// Pool de entidades
    pub entity_pool: bool,
    /// Reutilización de IDs
    pub id_reuse: bool,
}

/// Configuración de componentes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentConfig {
    /// Máximo número de componentes por entidad
    pub max_components_per_entity: usize,
    /// Cache de componentes
    pub component_cache: bool,
    /// Serialización automática
    pub auto_serialization: bool,
}

/// Configuración de sistemas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemConfig {
    /// Ejecución paralela
    pub parallel_execution: bool,
    /// Prioridad de sistemas
    pub system_priority: bool,
    /// Hot-reloading
    pub hot_reloading: bool,
}

/// Configuración de optimización
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationConfig {
    /// Cache-friendly layout
    pub cache_friendly: bool,
    /// Memory pooling
    pub memory_pooling: bool,
    /// Batch processing
    pub batch_processing: bool,
}

/// ID de entidad
pub type EntityId = u64;

/// Entidad del sistema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    /// ID de la entidad
    pub id: EntityId,
    /// Nombre de la entidad
    pub name: String,
    /// Componentes de la entidad
    pub components: Vec<ComponentType>,
    /// Estado de la entidad
    pub state: EntityState,
    /// Metadatos de la entidad
    pub metadata: HashMap<String, String>,
}

/// Estado de entidad
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityState {
    /// Activa
    pub active: bool,
    /// Visible
    pub visible: bool,
    /// Seleccionada
    pub selected: bool,
    /// Bloqueada
    pub locked: bool,
}

/// Tipo de componente
#[derive(Debug, Clone, Hash, Eq, PartialEq, Serialize, Deserialize)]
pub enum ComponentType {
    Transform,
    Mesh,
    Material,
    Light,
    Camera,
    Physics,
    Audio,
    Animation,
    Script,
    Network,
    Custom(String),
}

/// Trait para componentes
pub trait Component: Send + Sync {
    /// Obtener tipo de componente
    fn get_type(&self) -> ComponentType;
    /// Clonar componente
    fn clone_box(&self) -> Box<dyn Component>;
    /// Serializar componente
    fn serialize(&self) -> Result<Vec<u8>>;
    /// Deserializar componente
    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>>;
}

/// Componente de transformación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransformComponent {
    /// Posición
    pub position: Vec3,
    /// Rotación
    pub rotation: Quat,
    /// Escala
    pub scale: Vec3,
    /// Matriz de transformación
    pub matrix: Mat4,
    /// Padre
    pub parent: Option<EntityId>,
    /// Hijos
    pub children: Vec<EntityId>,
}

impl Component for TransformComponent {
    fn get_type(&self) -> ComponentType {
        ComponentType::Transform
    }

    fn clone_box(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }

    fn serialize(&self) -> Result<Vec<u8>> {
        Ok(bincode::serialize(self)?)
    }

    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>> {
        let component: TransformComponent = bincode::deserialize(data)?;
        Ok(Box::new(component))
    }
}

/// Componente de malla
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeshComponent {
    /// ID de la malla
    pub mesh_id: String,
    /// Vertices
    pub vertices: Vec<Vec3>,
    /// Normales
    pub normals: Vec<Vec3>,
    /// UVs
    pub uvs: Vec<Vec3>,
    /// Índices
    pub indices: Vec<u32>,
    /// Material
    pub material_id: Option<String>,
    /// LOD
    pub lod_level: u32,
}

impl Component for MeshComponent {
    fn get_type(&self) -> ComponentType {
        ComponentType::Mesh
    }

    fn clone_box(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }

    fn serialize(&self) -> Result<Vec<u8>> {
        Ok(bincode::serialize(self)?)
    }

    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>> {
        let component: MeshComponent = bincode::deserialize(data)?;
        Ok(Box::new(component))
    }
}

/// Componente de material
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaterialComponent {
    /// ID del material
    pub material_id: String,
    /// Tipo de material
    pub material_type: MaterialType,
    /// Propiedades del material
    pub properties: HashMap<String, f32>,
    /// Texturas
    pub textures: HashMap<String, String>,
    /// Shader
    pub shader: Option<String>,
}

/// Tipo de material
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MaterialType {
    PBR,
    Unlit,
    Custom(String),
}

impl Component for MaterialComponent {
    fn get_type(&self) -> ComponentType {
        ComponentType::Material
    }

    fn clone_box(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }

    fn serialize(&self) -> Result<Vec<u8>> {
        Ok(bincode::serialize(self)?)
    }

    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>> {
        let component: MaterialComponent = bincode::deserialize(data)?;
        Ok(Box::new(component))
    }
}

/// Componente de luz
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightComponent {
    /// Tipo de luz
    pub light_type: LightType,
    /// Color
    pub color: Vec3,
    /// Intensidad
    pub intensity: f32,
    /// Rango
    pub range: f32,
    /// Ángulo
    pub angle: f32,
    /// Sombras
    pub shadows: bool,
    /// Configuración de sombras
    pub shadow_config: ShadowConfig,
}

/// Tipo de luz
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LightType {
    Directional,
    Point,
    Spot,
    Area,
}

/// Configuración de sombras
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShadowConfig {
    /// Resolución
    pub resolution: u32,
    /// Bias
    pub bias: f32,
    /// Soft shadows
    pub soft_shadows: bool,
}

impl Component for LightComponent {
    fn get_type(&self) -> ComponentType {
        ComponentType::Light
    }

    fn clone_box(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }

    fn serialize(&self) -> Result<Vec<u8>> {
        Ok(bincode::serialize(self)?)
    }

    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>> {
        let component: LightComponent = bincode::deserialize(data)?;
        Ok(Box::new(component))
    }
}

/// Componente de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraComponent {
    /// Tipo de cámara
    pub camera_type: CameraType,
    /// FOV
    pub fov: f32,
    /// Aspect ratio
    pub aspect_ratio: f32,
    /// Near plane
    pub near_plane: f32,
    /// Far plane
    pub far_plane: f32,
    /// Proyección
    pub projection: Mat4,
    /// View matrix
    pub view: Mat4,
}

/// Tipo de cámara
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CameraType {
    Perspective,
    Orthographic,
}

impl Component for CameraComponent {
    fn get_type(&self) -> ComponentType {
        ComponentType::Camera
    }

    fn clone_box(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }

    fn serialize(&self) -> Result<Vec<u8>> {
        Ok(bincode::serialize(self)?)
    }

    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>> {
        let component: CameraComponent = bincode::deserialize(data)?;
        Ok(Box::new(component))
    }
}

/// Componente de física
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsComponent {
    /// Tipo de cuerpo
    pub body_type: BodyType,
    /// Masa
    pub mass: f32,
    /// Velocidad
    pub velocity: Vec3,
    /// Fuerza
    pub force: Vec3,
    /// Colisión
    pub collision: bool,
    /// Configuración de colisión
    pub collision_config: CollisionConfig,
}

/// Tipo de cuerpo
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BodyType {
    Static,
    Dynamic,
    Kinematic,
}

/// Configuración de colisión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollisionConfig {
    /// Forma de colisión
    pub shape: CollisionShape,
    /// Filtro de colisión
    pub filter: u32,
    /// Material de colisión
    pub material: String,
}

/// Forma de colisión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollisionShape {
    Box(Vec3),
    Sphere(f32),
    Capsule(f32, f32),
    Mesh(Vec<Vec3>),
}

impl Component for PhysicsComponent {
    fn get_type(&self) -> ComponentType {
        ComponentType::Physics
    }

    fn clone_box(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }

    fn serialize(&self) -> Result<Vec<u8>> {
        Ok(bincode::serialize(self)?)
    }

    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>> {
        let component: PhysicsComponent = bincode::deserialize(data)?;
        Ok(Box::new(component))
    }
}

/// Componente de audio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioComponent {
    /// ID del audio
    pub audio_id: String,
    /// Tipo de audio
    pub audio_type: AudioType,
    /// Volumen
    pub volume: f32,
    /// Pitch
    pub pitch: f32,
    /// Loop
    pub looped: bool,
    /// Espacial
    pub spatial: bool,
    /// Configuración espacial
    pub spatial_config: SpatialAudioConfig,
}

/// Tipo de audio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AudioType {
    Music,
    SFX,
    Voice,
    Ambient,
}

/// Configuración de audio espacial
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpatialAudioConfig {
    /// Distancia mínima
    pub min_distance: f32,
    /// Distancia máxima
    pub max_distance: f32,
    /// Rolloff
    pub rolloff: f32,
}

impl Component for AudioComponent {
    fn get_type(&self) -> ComponentType {
        ComponentType::Audio
    }

    fn clone_box(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }

    fn serialize(&self) -> Result<Vec<u8>> {
        Ok(bincode::serialize(self)?)
    }

    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>> {
        let component: AudioComponent = bincode::deserialize(data)?;
        Ok(Box::new(component))
    }
}

/// Componente de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationComponent {
    /// ID de la animación
    pub animation_id: String,
    /// Tipo de animación
    pub animation_type: AnimationType,
    /// Estado de la animación
    pub state: AnimationState,
    /// Configuración de la animación
    pub config: AnimationConfig,
}

/// Tipo de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnimationType {
    Skeletal,
    Morphing,
    Procedural,
}

/// Estado de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationState {
    /// Reproduciendo
    pub playing: bool,
    /// Pausada
    pub paused: bool,
    /// Tiempo actual
    pub current_time: f32,
    /// Velocidad
    pub speed: f32,
    /// Peso
    pub weight: f32,
}

/// Configuración de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationConfig {
    /// Duración
    pub duration: f32,
    /// FPS
    pub fps: f32,
    /// Loop
    pub looped: bool,
    /// Interpolación
    pub interpolation: InterpolationConfig,
}

/// Configuración de interpolación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterpolationConfig {
    /// Tipo de interpolación
    pub interpolation_type: InterpolationType,
    /// Easing
    pub easing: EasingConfig,
}

/// Tipo de interpolación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InterpolationType {
    Linear,
    Bezier,
    CatmullRom,
}

/// Configuración de easing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EasingConfig {
    /// Tipo de easing
    pub easing_type: EasingType,
    /// Parámetros
    pub parameters: [f32; 4],
}

/// Tipo de easing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EasingType {
    None,
    In,
    Out,
    InOut,
    Custom,
}

impl Component for AnimationComponent {
    fn get_type(&self) -> ComponentType {
        ComponentType::Animation
    }

    fn clone_box(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }

    fn serialize(&self) -> Result<Vec<u8>> {
        Ok(bincode::serialize(self)?)
    }

    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>> {
        let component: AnimationComponent = bincode::deserialize(data)?;
        Ok(Box::new(component))
    }
}

/// Componente de script
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScriptComponent {
    /// ID del script
    pub script_id: String,
    /// Tipo de script
    pub script_type: ScriptType,
    /// Código del script
    pub code: String,
    /// Estado del script
    pub state: ScriptState,
}

/// Tipo de script
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScriptType {
    JavaScript,
    TypeScript,
    Rust,
    WASM,
}

/// Estado del script
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScriptState {
    /// Cargado
    pub loaded: bool,
    /// Ejecutándose
    pub running: bool,
    /// Error
    pub error: Option<String>,
}

impl Component for ScriptComponent {
    fn get_type(&self) -> ComponentType {
        ComponentType::Script
    }

    fn clone_box(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }

    fn serialize(&self) -> Result<Vec<u8>> {
        Ok(bincode::serialize(self)?)
    }

    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>> {
        let component: ScriptComponent = bincode::deserialize(data)?;
        Ok(Box::new(component))
    }
}

/// Componente de red
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkComponent {
    /// ID de red
    pub network_id: String,
    /// Tipo de red
    pub network_type: NetworkType,
    /// Estado de red
    pub state: NetworkState,
    /// Configuración de red
    pub config: NetworkConfig,
}

/// Tipo de red
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NetworkType {
    Local,
    P2P,
    Client,
    Server,
}

/// Estado de red
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkState {
    /// Conectado
    pub connected: bool,
    /// Latencia
    pub latency: f32,
    /// Pérdida de paquetes
    pub packet_loss: f32,
}

/// Configuración de red
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    /// Puerto
    pub port: u16,
    /// Host
    pub host: String,
    /// Protocolo
    pub protocol: String,
}

impl Component for NetworkComponent {
    fn get_type(&self) -> ComponentType {
        ComponentType::Network
    }

    fn clone_box(&self) -> Box<dyn Component> {
        Box::new(self.clone())
    }

    fn serialize(&self) -> Result<Vec<u8>> {
        Ok(bincode::serialize(self)?)
    }

    fn deserialize(data: &[u8]) -> Result<Box<dyn Component>> {
        let component: NetworkComponent = bincode::deserialize(data)?;
        Ok(Box::new(component))
    }
}

/// Comando del ECS
#[derive(Debug, Clone)]
pub enum ECSCommand {
    CreateEntity(Entity),
    DestroyEntity(EntityId),
    AddComponent(EntityId, Box<dyn Component>),
    RemoveComponent(EntityId, ComponentType),
    UpdateComponent(EntityId, ComponentType, Box<dyn Component>),
    SetEntityState(EntityId, EntityState),
}

/// Sistema del ECS
pub trait ECSSystem: Send + Sync {
    /// Ejecutar sistema
    fn execute(&self, world: &ECSSystem) -> Result<()>;
    /// Obtener prioridad
    fn get_priority(&self) -> u32;
    /// Obtener nombre
    fn get_name(&self) -> &str;
}

/// Estadísticas del ECS
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ECSStats {
    /// Número de entidades
    pub entity_count: usize,
    /// Número de componentes
    pub component_count: usize,
    /// Número de sistemas
    pub system_count: usize,
    /// Tiempo de ejecución
    pub execution_time: f32,
    /// Memoria utilizada
    pub memory_usage: usize,
    /// Comandos por frame
    pub commands_per_frame: usize,
}

impl ECSSystem {
    /// Crear nuevo sistema ECS
    pub fn new(config: ECSConfig) -> Self {
        info!("Inicializando sistema ECS");
        
        Self {
            config,
            entities: Arc::new(RwLock::new(HashMap::new())),
            components: Arc::new(RwLock::new(HashMap::new())),
            systems: Vec::new(),
            command_queue: VecDeque::new(),
            stats: ECSStats {
                entity_count: 0,
                component_count: 0,
                system_count: 0,
                execution_time: 0.0,
                memory_usage: 0,
                commands_per_frame: 0,
            },
            running: false,
        }
    }

    /// Inicializar sistema
    pub async fn initialize(&mut self) -> Result<()> {
        info!("Inicializando sistema ECS");
        
        if !self.config.enabled {
            warn!("Sistema ECS deshabilitado");
            return Ok(());
        }

        // Inicializar sistemas por defecto
        self.initialize_default_systems().await?;
        
        self.running = true;
        info!("Sistema ECS inicializado correctamente");
        
        Ok(())
    }

    /// Inicializar sistemas por defecto
    async fn initialize_default_systems(&mut self) -> Result<()> {
        // Sistema de transformación
        self.add_system(Box::new(TransformSystem::new()));
        
        // Sistema de renderizado
        self.add_system(Box::new(RenderSystem::new()));
        
        // Sistema de física
        self.add_system(Box::new(PhysicsSystem::new()));
        
        // Sistema de animación
        self.add_system(Box::new(AnimationSystem::new()));
        
        // Sistema de audio
        self.add_system(Box::new(AudioSystem::new()));
        
        // Sistema de red
        self.add_system(Box::new(NetworkSystem::new()));
        
        // Sistema de scripts
        self.add_system(Box::new(ScriptSystem::new()));
        
        info!("Sistemas por defecto inicializados");
        Ok(())
    }

    /// Actualizar sistema
    pub async fn update(&mut self, delta_time: f32) -> Result<()> {
        if !self.running {
            return Ok(());
        }

        let start_time = std::time::Instant::now();

        // Procesar comandos
        self.process_commands().await?;

        // Ejecutar sistemas
        self.execute_systems().await?;

        // Actualizar estadísticas
        self.update_stats(start_time.elapsed().as_secs_f32());

        Ok(())
    }

    /// Procesar comandos
    async fn process_commands(&mut self) -> Result<()> {
        let mut commands = std::mem::take(&mut self.command_queue);
        
        for command in commands.drain(..) {
            match command {
                ECSCommand::CreateEntity(entity) => {
                    self.create_entity_internal(entity).await?;
                }
                ECSCommand::DestroyEntity(entity_id) => {
                    self.destroy_entity_internal(entity_id).await?;
                }
                ECSCommand::AddComponent(entity_id, component) => {
                    self.add_component_internal(entity_id, component).await?;
                }
                ECSCommand::RemoveComponent(entity_id, component_type) => {
                    self.remove_component_internal(entity_id, component_type).await?;
                }
                ECSCommand::UpdateComponent(entity_id, component_type, component) => {
                    self.update_component_internal(entity_id, component_type, component).await?;
                }
                ECSCommand::SetEntityState(entity_id, state) => {
                    self.set_entity_state_internal(entity_id, state).await?;
                }
            }
        }

        self.stats.commands_per_frame = commands.len();
        Ok(())
    }

    /// Ejecutar sistemas
    async fn execute_systems(&mut self) -> Result<()> {
        // Ordenar sistemas por prioridad
        let mut systems = self.systems.clone();
        systems.sort_by_key(|system| system.get_priority());

        // Ejecutar sistemas
        for system in systems {
            if let Err(e) = system.execute(self) {
                error!("Error ejecutando sistema {}: {}", system.get_name(), e);
            }
        }

        Ok(())
    }

    /// Crear entidad
    pub async fn create_entity(&mut self, name: String) -> Result<EntityId> {
        let entity_id = self.generate_entity_id();
        let entity = Entity {
            id: entity_id,
            name,
            components: Vec::new(),
            state: EntityState {
                active: true,
                visible: true,
                selected: false,
                locked: false,
            },
            metadata: HashMap::new(),
        };

        self.command_queue.push_back(ECSCommand::CreateEntity(entity));
        Ok(entity_id)
    }

    /// Crear entidad interna
    async fn create_entity_internal(&mut self, entity: Entity) -> Result<()> {
        let mut entities = self.entities.write().unwrap();
        entities.insert(entity.id, entity);
        self.stats.entity_count = entities.len();
        Ok(())
    }

    /// Destruir entidad
    pub async fn destroy_entity(&mut self, entity_id: EntityId) -> Result<()> {
        self.command_queue.push_back(ECSCommand::DestroyEntity(entity_id));
        Ok(())
    }

    /// Destruir entidad interna
    async fn destroy_entity_internal(&mut self, entity_id: EntityId) -> Result<()> {
        // Remover componentes
        let mut components = self.components.write().unwrap();
        for component_map in components.values_mut() {
            component_map.remove(&entity_id);
        }

        // Remover entidad
        let mut entities = self.entities.write().unwrap();
        entities.remove(&entity_id);
        self.stats.entity_count = entities.len();

        Ok(())
    }

    /// Agregar componente
    pub async fn add_component(&mut self, entity_id: EntityId, component: Box<dyn Component>) -> Result<()> {
        self.command_queue.push_back(ECSCommand::AddComponent(entity_id, component));
        Ok(())
    }

    /// Agregar componente interno
    async fn add_component_internal(&mut self, entity_id: EntityId, component: Box<dyn Component>) -> Result<()> {
        let component_type = component.get_type();
        
        // Agregar a componentes
        let mut components = self.components.write().unwrap();
        components
            .entry(component_type.clone())
            .or_insert_with(HashMap::new)
            .insert(entity_id, component);

        // Actualizar entidad
        let mut entities = self.entities.write().unwrap();
        if let Some(entity) = entities.get_mut(&entity_id) {
            entity.components.push(component_type);
        }

        self.stats.component_count = components.values().map(|m| m.len()).sum();
        Ok(())
    }

    /// Remover componente
    pub async fn remove_component(&mut self, entity_id: EntityId, component_type: ComponentType) -> Result<()> {
        self.command_queue.push_back(ECSCommand::RemoveComponent(entity_id, component_type));
        Ok(())
    }

    /// Remover componente interno
    async fn remove_component_internal(&mut self, entity_id: EntityId, component_type: ComponentType) -> Result<()> {
        // Remover de componentes
        let mut components = self.components.write().unwrap();
        if let Some(component_map) = components.get_mut(&component_type) {
            component_map.remove(&entity_id);
        }

        // Actualizar entidad
        let mut entities = self.entities.write().unwrap();
        if let Some(entity) = entities.get_mut(&entity_id) {
            entity.components.retain(|c| *c != component_type);
        }

        self.stats.component_count = components.values().map(|m| m.len()).sum();
        Ok(())
    }

    /// Obtener componente
    pub fn get_component<T: Component + 'static>(&self, entity_id: EntityId, component_type: ComponentType) -> Option<T> {
        let components = self.components.read().unwrap();
        components
            .get(&component_type)?
            .get(&entity_id)?
            .as_any()
            .downcast_ref::<T>()
            .cloned()
    }

    /// Obtener entidad
    pub fn get_entity(&self, entity_id: EntityId) -> Option<Entity> {
        let entities = self.entities.read().unwrap();
        entities.get(&entity_id).cloned()
    }

    /// Obtener entidades con componente
    pub fn get_entities_with_component(&self, component_type: ComponentType) -> Vec<EntityId> {
        let components = self.components.read().unwrap();
        components
            .get(&component_type)
            .map(|m| m.keys().cloned().collect())
            .unwrap_or_default()
    }

    /// Agregar sistema
    pub fn add_system(&mut self, system: Box<dyn ECSSystem>) {
        self.systems.push(system);
        self.stats.system_count = self.systems.len();
    }

    /// Generar ID de entidad
    fn generate_entity_id(&self) -> EntityId {
        use std::sync::atomic::{AtomicU64, Ordering};
        static ENTITY_COUNTER: AtomicU64 = AtomicU64::new(1);
        ENTITY_COUNTER.fetch_add(1, Ordering::Relaxed)
    }

    /// Actualizar estadísticas
    fn update_stats(&mut self, execution_time: f32) {
        self.stats.execution_time = execution_time;
        // Calcular uso de memoria (simplificado)
        self.stats.memory_usage = std::mem::size_of_val(self);
    }

    /// Obtener estadísticas
    pub fn get_stats(&self) -> ECSStats {
        self.stats.clone()
    }

    /// Limpiar sistema
    pub async fn cleanup(&mut self) -> Result<()> {
        info!("Limpiando sistema ECS");
        
        self.running = false;
        self.entities.write().unwrap().clear();
        self.components.write().unwrap().clear();
        self.systems.clear();
        self.command_queue.clear();
        
        info!("Sistema ECS limpiado");
        Ok(())
    }
}

// Sistemas específicos

/// Sistema de transformación
pub struct TransformSystem {
    priority: u32,
}

impl TransformSystem {
    pub fn new() -> Self {
        Self { priority: 100 }
    }
}

impl ECSSystem for TransformSystem {
    fn execute(&self, world: &ECSSystem) -> Result<()> {
        // Actualizar transformaciones
        let entities = world.get_entities_with_component(ComponentType::Transform);
        
        for entity_id in entities {
            if let Some(transform) = world.get_component::<TransformComponent>(entity_id, ComponentType::Transform) {
                // Actualizar matriz de transformación
                let matrix = Mat4::from_translation(transform.position)
                    * Mat4::from_quat(transform.rotation)
                    * Mat4::from_scale(transform.scale);
                
                // Aquí se actualizaría la matriz en el componente
            }
        }
        
        Ok(())
    }

    fn get_priority(&self) -> u32 {
        self.priority
    }

    fn get_name(&self) -> &str {
        "TransformSystem"
    }
}

/// Sistema de renderizado
pub struct RenderSystem {
    priority: u32,
}

impl RenderSystem {
    pub fn new() -> Self {
        Self { priority: 200 }
    }
}

impl ECSSystem for RenderSystem {
    fn execute(&self, world: &ECSSystem) -> Result<()> {
        // Renderizar entidades con malla
        let entities = world.get_entities_with_component(ComponentType::Mesh);
        
        for entity_id in entities {
            if let Some(mesh) = world.get_component::<MeshComponent>(entity_id, ComponentType::Mesh) {
                if let Some(transform) = world.get_component::<TransformComponent>(entity_id, ComponentType::Transform) {
                    // Renderizar malla con transformación
                }
            }
        }
        
        Ok(())
    }

    fn get_priority(&self) -> u32 {
        self.priority
    }

    fn get_name(&self) -> &str {
        "RenderSystem"
    }
}

/// Sistema de física
pub struct PhysicsSystem {
    priority: u32,
}

impl PhysicsSystem {
    pub fn new() -> Self {
        Self { priority: 150 }
    }
}

impl ECSSystem for PhysicsSystem {
    fn execute(&self, world: &ECSSystem) -> Result<()> {
        // Simular física
        let entities = world.get_entities_with_component(ComponentType::Physics);
        
        for entity_id in entities {
            if let Some(physics) = world.get_component::<PhysicsComponent>(entity_id, ComponentType::Physics) {
                // Simular física del cuerpo
            }
        }
        
        Ok(())
    }

    fn get_priority(&self) -> u32 {
        self.priority
    }

    fn get_name(&self) -> &str {
        "PhysicsSystem"
    }
}

/// Sistema de animación
pub struct AnimationSystem {
    priority: u32,
}

impl AnimationSystem {
    pub fn new() -> Self {
        Self { priority: 175 }
    }
}

impl ECSSystem for AnimationSystem {
    fn execute(&self, world: &ECSSystem) -> Result<()> {
        // Actualizar animaciones
        let entities = world.get_entities_with_component(ComponentType::Animation);
        
        for entity_id in entities {
            if let Some(animation) = world.get_component::<AnimationComponent>(entity_id, ComponentType::Animation) {
                // Actualizar estado de animación
            }
        }
        
        Ok(())
    }

    fn get_priority(&self) -> u32 {
        self.priority
    }

    fn get_name(&self) -> &str {
        "AnimationSystem"
    }
}

/// Sistema de audio
pub struct AudioSystem {
    priority: u32,
}

impl AudioSystem {
    pub fn new() -> Self {
        Self { priority: 250 }
    }
}

impl ECSSystem for AudioSystem {
    fn execute(&self, world: &ECSSystem) -> Result<()> {
        // Procesar audio
        let entities = world.get_entities_with_component(ComponentType::Audio);
        
        for entity_id in entities {
            if let Some(audio) = world.get_component::<AudioComponent>(entity_id, ComponentType::Audio) {
                // Procesar fuente de audio
            }
        }
        
        Ok(())
    }

    fn get_priority(&self) -> u32 {
        self.priority
    }

    fn get_name(&self) -> &str {
        "AudioSystem"
    }
}

/// Sistema de red
pub struct NetworkSystem {
    priority: u32,
}

impl NetworkSystem {
    pub fn new() -> Self {
        Self { priority: 300 }
    }
}

impl ECSSystem for NetworkSystem {
    fn execute(&self, world: &ECSSystem) -> Result<()> {
        // Procesar red
        let entities = world.get_entities_with_component(ComponentType::Network);
        
        for entity_id in entities {
            if let Some(network) = world.get_component::<NetworkComponent>(entity_id, ComponentType::Network) {
                // Procesar comunicación de red
            }
        }
        
        Ok(())
    }

    fn get_priority(&self) -> u32 {
        self.priority
    }

    fn get_name(&self) -> &str {
        "NetworkSystem"
    }
}

/// Sistema de scripts
pub struct ScriptSystem {
    priority: u32,
}

impl ScriptSystem {
    pub fn new() -> Self {
        Self { priority: 125 }
    }
}

impl ECSSystem for ScriptSystem {
    fn execute(&self, world: &ECSSystem) -> Result<()> {
        // Ejecutar scripts
        let entities = world.get_entities_with_component(ComponentType::Script);
        
        for entity_id in entities {
            if let Some(script) = world.get_component::<ScriptComponent>(entity_id, ComponentType::Script) {
                // Ejecutar script
            }
        }
        
        Ok(())
    }

    fn get_priority(&self) -> u32 {
        self.priority
    }

    fn get_name(&self) -> &str {
        "ScriptSystem"
    }
}

// Extensión para Component trait
pub trait ComponentExt: Component {
    fn as_any(&self) -> &dyn std::any::Any;
}

impl<T: Component + 'static> ComponentExt for T {
    fn as_any(&self) -> &dyn std::any::Any {
        self
    }
}

// Implementación de Clone para Box<dyn Component>
impl Clone for Box<dyn Component> {
    fn clone(&self) -> Self {
        self.clone_box()
    }
} 