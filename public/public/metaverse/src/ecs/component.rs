//! Sistema de Componentes para ECS
//! Define y maneja los componentes del mundo virtual

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use super::ComponentId;

/// Componente de transformación 3D
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transform {
    pub position: [f32; 3],
    pub rotation: [f32; 3],
    pub scale: [f32; 3],
    pub matrix: [[f32; 4]; 4],
}

impl Default for Transform {
    fn default() -> Self {
        Self {
            position: [0.0, 0.0, 0.0],
            rotation: [0.0, 0.0, 0.0],
            scale: [1.0, 1.0, 1.0],
            matrix: [
                [1.0, 0.0, 0.0, 0.0],
                [0.0, 1.0, 0.0, 0.0],
                [0.0, 0.0, 1.0, 0.0],
                [0.0, 0.0, 0.0, 1.0],
            ],
        }
    }
}

/// Componente de renderizado
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Renderable {
    pub mesh_id: String,
    pub material_id: String,
    pub visible: bool,
    pub cast_shadow: bool,
    pub receive_shadow: bool,
    pub layer: u8,
}

impl Default for Renderable {
    fn default() -> Self {
        Self {
            mesh_id: "".to_string(),
            material_id: "".to_string(),
            visible: true,
            cast_shadow: true,
            receive_shadow: true,
            layer: 0,
        }
    }
}

/// Componente de física
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Physics {
    pub mass: f32,
    pub velocity: [f32; 3],
    pub acceleration: [f32; 3],
    pub friction: f32,
    pub restitution: f32,
    pub collider_type: ColliderType,
    pub collider_size: [f32; 3],
    pub is_static: bool,
    pub is_trigger: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ColliderType {
    Box,
    Sphere,
    Capsule,
    Mesh,
}

impl Default for Physics {
    fn default() -> Self {
        Self {
            mass: 1.0,
            velocity: [0.0, 0.0, 0.0],
            acceleration: [0.0, 0.0, 0.0],
            friction: 0.5,
            restitution: 0.5,
            collider_type: ColliderType::Box,
            collider_size: [1.0, 1.0, 1.0],
            is_static: false,
            is_trigger: false,
        }
    }
}

/// Componente de audio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Audio {
    pub sound_id: String,
    pub volume: f32,
    pub pitch: f32,
    pub looped: bool,
    pub spatial: bool,
    pub min_distance: f32,
    pub max_distance: f32,
    pub is_playing: bool,
}

impl Default for Audio {
    fn default() -> Self {
        Self {
            sound_id: "".to_string(),
            volume: 1.0,
            pitch: 1.0,
            looped: false,
            spatial: true,
            min_distance: 1.0,
            max_distance: 100.0,
            is_playing: false,
        }
    }
}

/// Componente de animación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Animation {
    pub animation_id: String,
    pub speed: f32,
    pub looped: bool,
    pub playing: bool,
    pub current_time: f32,
    pub duration: f32,
    pub blend_weight: f32,
}

impl Default for Animation {
    fn default() -> Self {
        Self {
            animation_id: "".to_string(),
            speed: 1.0,
            looped: true,
            playing: false,
            current_time: 0.0,
            duration: 0.0,
            blend_weight: 1.0,
        }
    }
}

/// Componente de jugador
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub player_id: String,
    pub username: String,
    pub health: f32,
    pub max_health: f32,
    pub stamina: f32,
    pub max_stamina: f32,
    pub level: u32,
    pub experience: u64,
    pub wallet_address: Option<String>,
    pub current_island: String,
}

impl Default for Player {
    fn default() -> Self {
        Self {
            player_id: "".to_string(),
            username: "".to_string(),
            health: 100.0,
            max_health: 100.0,
            stamina: 100.0,
            max_stamina: 100.0,
            level: 1,
            experience: 0,
            wallet_address: None,
            current_island: "forest".to_string(),
        }
    }
}

/// Componente de IA
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AI {
    pub ai_type: AIType,
    pub behavior_tree: String,
    pub target_entity: Option<u64>,
    pub patrol_points: Vec<[f32; 3]>,
    pub current_patrol_index: usize,
    pub detection_range: f32,
    pub attack_range: f32,
    pub state: AIState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AIType {
    Passive,
    Aggressive,
    Neutral,
    Friendly,
    Boss,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AIState {
    Idle,
    Patrolling,
    Chasing,
    Attacking,
    Fleeing,
    Dead,
}

impl Default for AI {
    fn default() -> Self {
        Self {
            ai_type: AIType::Passive,
            behavior_tree: "".to_string(),
            target_entity: None,
            patrol_points: Vec::new(),
            current_patrol_index: 0,
            detection_range: 10.0,
            attack_range: 2.0,
            state: AIState::Idle,
        }
    }
}

/// Componente de inventario
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Inventory {
    pub items: HashMap<String, InventoryItem>,
    pub max_items: usize,
    pub gold: u64,
    pub tokens: HashMap<String, u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryItem {
    pub id: String,
    pub name: String,
    pub quantity: u32,
    pub max_quantity: u32,
    pub item_type: ItemType,
    pub rarity: ItemRarity,
    pub level_required: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ItemType {
    Weapon,
    Armor,
    Consumable,
    Material,
    Quest,
    Cosmetic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ItemRarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
    Mythic,
}

impl Default for Inventory {
    fn default() -> Self {
        Self {
            items: HashMap::new(),
            max_items: 50,
            gold: 0,
            tokens: HashMap::new(),
        }
    }
}

/// Componente de interacción
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Interactable {
    pub interaction_type: InteractionType,
    pub interaction_range: f32,
    pub interaction_text: String,
    pub is_interactable: bool,
    pub cooldown: f32,
    pub last_interaction: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InteractionType {
    Talk,
    Trade,
    Craft,
    Harvest,
    Open,
    Use,
    Pickup,
}

impl Default for Interactable {
    fn default() -> Self {
        Self {
            interaction_type: InteractionType::Use,
            interaction_range: 2.0,
            interaction_text: "Interact".to_string(),
            is_interactable: true,
            cooldown: 0.0,
            last_interaction: 0.0,
        }
    }
}

/// Componente de partículas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParticleSystem {
    pub particle_count: u32,
    pub max_particles: u32,
    pub emission_rate: f32,
    pub lifetime: f32,
    pub start_color: [f32; 4],
    pub end_color: [f32; 4],
    pub start_size: f32,
    pub end_size: f32,
    pub velocity: [f32; 3],
    pub acceleration: [f32; 3],
    pub active: bool,
}

impl Default for ParticleSystem {
    fn default() -> Self {
        Self {
            particle_count: 0,
            max_particles: 100,
            emission_rate: 10.0,
            lifetime: 2.0,
            start_color: [1.0, 1.0, 1.0, 1.0],
            end_color: [1.0, 1.0, 1.0, 0.0],
            start_size: 1.0,
            end_size: 0.0,
            velocity: [0.0, 1.0, 0.0],
            acceleration: [0.0, -9.81, 0.0],
            active: true,
        }
    }
}

/// Gestor de componentes
#[wasm_bindgen]
pub struct ComponentManager {
    components: HashMap<ComponentId, Box<dyn erased_serde::Serialize>>,
    component_types: HashMap<String, ComponentId>,
    next_component_id: ComponentId,
}

#[wasm_bindgen]
impl ComponentManager {
    /// Crear nuevo gestor de componentes
    pub fn new() -> Self {
        let mut manager = Self {
            components: HashMap::new(),
            component_types: HashMap::new(),
            next_component_id: 1,
        };

        // Registrar tipos de componentes predefinidos
        manager.register_component_type("Transform");
        manager.register_component_type("Renderable");
        manager.register_component_type("Physics");
        manager.register_component_type("Audio");
        manager.register_component_type("Animation");
        manager.register_component_type("Player");
        manager.register_component_type("AI");
        manager.register_component_type("Inventory");
        manager.register_component_type("Interactable");
        manager.register_component_type("ParticleSystem");

        manager
    }

    /// Registrar tipo de componente
    pub fn register_component_type(&mut self, type_name: &str) -> ComponentId {
        if let Some(&id) = self.component_types.get(type_name) {
            id
        } else {
            let id = self.next_component_id;
            self.next_component_types.insert(type_name.to_string(), id);
            self.next_component_id += 1;
            id
        }
    }

    /// Obtener ID de tipo de componente
    pub fn get_component_type_id(&self, type_name: &str) -> Option<ComponentId> {
        self.component_types.get(type_name).copied()
    }

    /// Crear componente Transform
    pub fn create_transform(&self, position: &[f32; 3], rotation: &[f32; 3], scale: &[f32; 3]) -> JsValue {
        let transform = Transform {
            position: *position,
            rotation: *rotation,
            scale: *scale,
            matrix: [
                [1.0, 0.0, 0.0, 0.0],
                [0.0, 1.0, 0.0, 0.0],
                [0.0, 0.0, 1.0, 0.0],
                [0.0, 0.0, 0.0, 1.0],
            ],
        };
        serde_wasm_bindgen::to_value(&transform).unwrap_or_default()
    }

    /// Crear componente Renderable
    pub fn create_renderable(&self, mesh_id: &str, material_id: &str) -> JsValue {
        let renderable = Renderable {
            mesh_id: mesh_id.to_string(),
            material_id: material_id.to_string(),
            visible: true,
            cast_shadow: true,
            receive_shadow: true,
            layer: 0,
        };
        serde_wasm_bindgen::to_value(&renderable).unwrap_or_default()
    }

    /// Crear componente Physics
    pub fn create_physics(&self, mass: f32, collider_type: &str) -> JsValue {
        let collider_type_enum = match collider_type {
            "Box" => ColliderType::Box,
            "Sphere" => ColliderType::Sphere,
            "Capsule" => ColliderType::Capsule,
            "Mesh" => ColliderType::Mesh,
            _ => ColliderType::Box,
        };

        let physics = Physics {
            mass,
            velocity: [0.0, 0.0, 0.0],
            acceleration: [0.0, 0.0, 0.0],
            friction: 0.5,
            restitution: 0.5,
            collider_type: collider_type_enum,
            collider_size: [1.0, 1.0, 1.0],
            is_static: false,
            is_trigger: false,
        };
        serde_wasm_bindgen::to_value(&physics).unwrap_or_default()
    }

    /// Crear componente Player
    pub fn create_player(&self, player_id: &str, username: &str) -> JsValue {
        let player = Player {
            player_id: player_id.to_string(),
            username: username.to_string(),
            health: 100.0,
            max_health: 100.0,
            stamina: 100.0,
            max_stamina: 100.0,
            level: 1,
            experience: 0,
            wallet_address: None,
            current_island: "forest".to_string(),
        };
        serde_wasm_bindgen::to_value(&player).unwrap_or_default()
    }

    /// Obtener estadísticas
    pub fn get_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "total_components": self.components.len(),
            "component_types": self.component_types.len(),
            "next_component_id": self.next_component_id,
        });

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }
} 