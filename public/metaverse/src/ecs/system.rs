//! Sistema de Sistemas para ECS
//! Maneja la lógica de procesamiento de entidades y componentes

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use super::{SystemId, EntityId, ComponentId};

/// Tipo de sistema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemType {
    Update,
    Render,
    Physics,
    Audio,
    Network,
    AI,
    Animation,
    Particle,
    Custom(String),
}

/// Prioridad del sistema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemPriority {
    Critical = 0,
    High = 1,
    Normal = 2,
    Low = 3,
    Background = 4,
}

/// Estado del sistema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemState {
    Inactive,
    Active,
    Paused,
    Error,
}

/// Sistema del ECS
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct System {
    pub id: SystemId,
    pub name: String,
    pub system_type: SystemType,
    pub priority: SystemPriority,
    pub state: SystemState,
    pub required_components: Vec<ComponentId>,
    pub optional_components: Vec<ComponentId>,
    pub excluded_components: Vec<ComponentId>,
    pub enabled: bool,
    pub update_rate: f32, // Hz
    pub last_update: f64,
    pub total_updates: u64,
    pub average_update_time: f64,
    pub metadata: HashMap<String, String>,
}

impl System {
    /// Crear nuevo sistema
    pub fn new(id: SystemId, name: String, system_type: SystemType) -> Self {
        Self {
            id,
            name,
            system_type,
            priority: SystemPriority::Normal,
            state: SystemState::Inactive,
            required_components: Vec::new(),
            optional_components: Vec::new(),
            excluded_components: Vec::new(),
            enabled: true,
            update_rate: 60.0,
            last_update: 0.0,
            total_updates: 0,
            average_update_time: 0.0,
            metadata: HashMap::new(),
        }
    }

    /// Añadir componente requerido
    pub fn require_component(&mut self, component_id: ComponentId) {
        if !self.required_components.contains(&component_id) {
            self.required_components.push(component_id);
        }
    }

    /// Añadir componente opcional
    pub fn optional_component(&mut self, component_id: ComponentId) {
        if !self.optional_components.contains(&component_id) {
            self.optional_components.push(component_id);
        }
    }

    /// Excluir componente
    pub fn exclude_component(&mut self, component_id: ComponentId) {
        if !self.excluded_components.contains(&component_id) {
            self.excluded_components.push(component_id);
        }
    }

    /// Verificar si entidad es compatible
    pub fn is_entity_compatible(&self, entity_components: &[ComponentId]) -> bool {
        // Verificar componentes requeridos
        for required in &self.required_components {
            if !entity_components.contains(required) {
                return false;
            }
        }

        // Verificar componentes excluidos
        for excluded in &self.excluded_components {
            if entity_components.contains(excluded) {
                return false;
            }
        }

        true
    }

    /// Activar sistema
    pub fn activate(&mut self) {
        self.state = SystemState::Active;
    }

    /// Desactivar sistema
    pub fn deactivate(&mut self) {
        self.state = SystemState::Inactive;
    }

    /// Pausar sistema
    pub fn pause(&mut self) {
        self.state = SystemState::Paused;
    }

    /// Habilitar sistema
    pub fn enable(&mut self) {
        self.enabled = true;
    }

    /// Deshabilitar sistema
    pub fn disable(&mut self) {
        self.enabled = false;
    }

    /// Actualizar estadísticas
    pub fn update_stats(&mut self, update_time: f64) {
        self.total_updates += 1;
        self.average_update_time = (self.average_update_time * (self.total_updates - 1) as f64 + update_time) / self.total_updates as f64;
    }

    /// Establecer metadata
    pub fn set_metadata(&mut self, key: String, value: String) {
        self.metadata.insert(key, value);
    }

    /// Obtener metadata
    pub fn get_metadata(&self, key: &str) -> Option<&String> {
        self.metadata.get(key)
    }
}

/// Sistema de actualización de transformaciones
#[derive(Debug, Clone)]
pub struct TransformSystem {
    pub system: System,
}

impl TransformSystem {
    /// Crear nuevo sistema de transformaciones
    pub fn new(id: SystemId) -> Self {
        let mut system = System::new(id, "TransformSystem".to_string(), SystemType::Update);
        system.priority = SystemPriority::High;
        system.update_rate = 60.0;
        
        Self { system }
    }

    /// Actualizar transformaciones
    pub fn update(&mut self, entities: &mut Vec<Entity>) -> Result<(), String> {
        let start_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64();

        for entity in entities {
            if let Some(transform) = entity.get_component_mut::<Transform>(0) {
                // Actualizar matriz de transformación
                self.update_transform_matrix(transform);
            }
        }

        let update_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64() - start_time;

        self.system.update_stats(update_time);
        Ok(())
    }

    /// Actualizar matriz de transformación
    fn update_transform_matrix(&self, transform: &mut Transform) {
        // Implementación simplificada de matriz de transformación
        // En una implementación real, esto calcularía la matriz completa
        transform.matrix[3][0] = transform.position[0];
        transform.matrix[3][1] = transform.position[1];
        transform.matrix[3][2] = transform.position[2];
    }
}

/// Sistema de física
#[derive(Debug, Clone)]
pub struct PhysicsSystem {
    pub system: System,
    pub gravity: [f32; 3],
    pub time_step: f32,
}

impl PhysicsSystem {
    /// Crear nuevo sistema de física
    pub fn new(id: SystemId) -> Self {
        let mut system = System::new(id, "PhysicsSystem".to_string(), SystemType::Physics);
        system.priority = SystemPriority::High;
        system.update_rate = 60.0;
        system.require_component(1); // Transform
        system.require_component(2); // Physics

        Self {
            system,
            gravity: [0.0, -9.81, 0.0],
            time_step: 1.0 / 60.0,
        }
    }

    /// Actualizar física
    pub fn update(&mut self, entities: &mut Vec<Entity>) -> Result<(), String> {
        let start_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64();

        for entity in entities {
            if let (Some(transform), Some(physics)) = (
                entity.get_component_mut::<Transform>(0),
                entity.get_component_mut::<Physics>(2)
            ) {
                if !physics.is_static {
                    self.update_physics(transform, physics);
                }
            }
        }

        let update_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64() - start_time;

        self.system.update_stats(update_time);
        Ok(())
    }

    /// Actualizar física de entidad
    fn update_physics(&self, transform: &mut Transform, physics: &mut Physics) {
        // Aplicar gravedad
        physics.acceleration[0] += self.gravity[0];
        physics.acceleration[1] += self.gravity[1];
        physics.acceleration[2] += self.gravity[2];

        // Actualizar velocidad
        physics.velocity[0] += physics.acceleration[0] * self.time_step;
        physics.velocity[1] += physics.acceleration[1] * self.time_step;
        physics.velocity[2] += physics.acceleration[2] * self.time_step;

        // Aplicar fricción
        physics.velocity[0] *= 1.0 - physics.friction * self.time_step;
        physics.velocity[1] *= 1.0 - physics.friction * self.time_step;
        physics.velocity[2] *= 1.0 - physics.friction * self.time_step;

        // Actualizar posición
        transform.position[0] += physics.velocity[0] * self.time_step;
        transform.position[1] += physics.velocity[1] * self.time_step;
        transform.position[2] += physics.velocity[2] * self.time_step;

        // Resetear aceleración
        physics.acceleration = [0.0, 0.0, 0.0];
    }
}

/// Sistema de renderizado
#[derive(Debug, Clone)]
pub struct RenderSystem {
    pub system: System,
    pub render_queue: Vec<EntityId>,
}

impl RenderSystem {
    /// Crear nuevo sistema de renderizado
    pub fn new(id: SystemId) -> Self {
        let mut system = System::new(id, "RenderSystem".to_string(), SystemType::Render);
        system.priority = SystemPriority::Normal;
        system.update_rate = 60.0;
        system.require_component(0); // Transform
        system.require_component(1); // Renderable

        Self {
            system,
            render_queue: Vec::new(),
        }
    }

    /// Actualizar renderizado
    pub fn update(&mut self, entities: &Vec<Entity>) -> Result<(), String> {
        let start_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64();

        self.render_queue.clear();

        for entity in entities {
            if let (Some(_transform), Some(renderable)) = (
                entity.get_component::<Transform>(0),
                entity.get_component::<Renderable>(1)
            ) {
                if renderable.visible {
                    self.render_queue.push(entity.id);
                }
            }
        }

        let update_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64() - start_time;

        self.system.update_stats(update_time);
        Ok(())
    }

    /// Obtener cola de renderizado
    pub fn get_render_queue(&self) -> &Vec<EntityId> {
        &self.render_queue
    }
}

/// Sistema de audio
#[derive(Debug, Clone)]
pub struct AudioSystem {
    pub system: System,
    pub audio_sources: HashMap<EntityId, String>,
}

impl AudioSystem {
    /// Crear nuevo sistema de audio
    pub fn new(id: SystemId) -> Self {
        let mut system = System::new(id, "AudioSystem".to_string(), SystemType::Audio);
        system.priority = SystemPriority::Low;
        system.update_rate = 30.0;
        system.require_component(0); // Transform
        system.require_component(3); // Audio

        Self {
            system,
            audio_sources: HashMap::new(),
        }
    }

    /// Actualizar audio
    pub fn update(&mut self, entities: &Vec<Entity>) -> Result<(), String> {
        let start_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64();

        for entity in entities {
            if let (Some(transform), Some(audio)) = (
                entity.get_component::<Transform>(0),
                entity.get_component::<Audio>(3)
            ) {
                if audio.is_playing {
                    self.update_audio_source(entity.id, transform, audio);
                }
            }
        }

        let update_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64() - start_time;

        self.system.update_stats(update_time);
        Ok(())
    }

    /// Actualizar fuente de audio
    fn update_audio_source(&mut self, entity_id: EntityId, transform: &Transform, audio: &Audio) {
        // En una implementación real, esto actualizaría la posición 3D del audio
        self.audio_sources.insert(entity_id, audio.sound_id.clone());
    }
}

/// Sistema de IA
#[derive(Debug, Clone)]
pub struct AISystem {
    pub system: System,
    pub behavior_trees: HashMap<String, String>,
}

impl AISystem {
    /// Crear nuevo sistema de IA
    pub fn new(id: SystemId) -> Self {
        let mut system = System::new(id, "AISystem".to_string(), SystemType::AI);
        system.priority = SystemPriority::Normal;
        system.update_rate = 10.0;
        system.require_component(0); // Transform
        system.require_component(6); // AI

        Self {
            system,
            behavior_trees: HashMap::new(),
        }
    }

    /// Actualizar IA
    pub fn update(&mut self, entities: &mut Vec<Entity>) -> Result<(), String> {
        let start_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64();

        for entity in entities {
            if let (Some(transform), Some(ai)) = (
                entity.get_component_mut::<Transform>(0),
                entity.get_component_mut::<AI>(6)
            ) {
                self.update_ai_behavior(transform, ai);
            }
        }

        let update_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs_f64() - start_time;

        self.system.update_stats(update_time);
        Ok(())
    }

    /// Actualizar comportamiento de IA
    fn update_ai_behavior(&self, transform: &mut Transform, ai: &mut AI) {
        match ai.state {
            AIState::Idle => {
                // Comportamiento de espera
            },
            AIState::Patrolling => {
                if !ai.patrol_points.is_empty() {
                    let target_point = ai.patrol_points[ai.current_patrol_index];
                    let distance = self.calculate_distance(&transform.position, &target_point);
                    
                    if distance < 1.0 {
                        ai.current_patrol_index = (ai.current_patrol_index + 1) % ai.patrol_points.len();
                    } else {
                        // Mover hacia el punto de patrulla
                        self.move_towards(transform, &target_point, 2.0);
                    }
                }
            },
            AIState::Chasing => {
                // Comportamiento de persecución
            },
            AIState::Attacking => {
                // Comportamiento de ataque
            },
            AIState::Fleeing => {
                // Comportamiento de huida
            },
            AIState::Dead => {
                // Comportamiento de muerte
            },
        }
    }

    /// Calcular distancia entre dos puntos
    fn calculate_distance(&self, pos1: &[f32; 3], pos2: &[f32; 3]) -> f32 {
        let dx = pos1[0] - pos2[0];
        let dy = pos1[1] - pos2[1];
        let dz = pos1[2] - pos2[2];
        (dx * dx + dy * dy + dz * dz).sqrt()
    }

    /// Mover hacia un objetivo
    fn move_towards(&self, transform: &mut Transform, target: &[f32; 3], speed: f32) {
        let direction = [
            target[0] - transform.position[0],
            target[1] - transform.position[1],
            target[2] - transform.position[2],
        ];

        let length = (direction[0] * direction[0] + direction[1] * direction[1] + direction[2] * direction[2]).sqrt();
        
        if length > 0.0 {
            let normalized = [
                direction[0] / length,
                direction[1] / length,
                direction[2] / length,
            ];

            transform.position[0] += normalized[0] * speed * 0.016; // 60 FPS
            transform.position[1] += normalized[1] * speed * 0.016;
            transform.position[2] += normalized[2] * speed * 0.016;
        }
    }
}

/// Gestor de sistemas
#[wasm_bindgen]
pub struct SystemManager {
    systems: HashMap<SystemId, Box<dyn SystemTrait>>,
    system_order: Vec<SystemId>,
    next_system_id: SystemId,
}

trait SystemTrait {
    fn get_system(&self) -> &System;
    fn get_system_mut(&mut self) -> &mut System;
    fn update(&mut self, entities: &mut Vec<Entity>) -> Result<(), String>;
}

impl SystemTrait for TransformSystem {
    fn get_system(&self) -> &System {
        &self.system
    }

    fn get_system_mut(&mut self) -> &mut System {
        &mut self.system
    }

    fn update(&mut self, entities: &mut Vec<Entity>) -> Result<(), String> {
        self.update(entities)
    }
}

impl SystemTrait for PhysicsSystem {
    fn get_system(&self) -> &System {
        &self.system
    }

    fn get_system_mut(&mut self) -> &mut System {
        &mut self.system
    }

    fn update(&mut self, entities: &mut Vec<Entity>) -> Result<(), String> {
        self.update(entities)
    }
}

impl SystemTrait for RenderSystem {
    fn get_system(&self) -> &System {
        &self.system
    }

    fn get_system_mut(&mut self) -> &mut System {
        &mut self.system
    }

    fn update(&mut self, entities: &mut Vec<Entity>) -> Result<(), String> {
        self.update(entities)
    }
}

impl SystemTrait for AudioSystem {
    fn get_system(&self) -> &System {
        &self.system
    }

    fn get_system_mut(&mut self) -> &mut System {
        &mut self.system
    }

    fn update(&mut self, entities: &mut Vec<Entity>) -> Result<(), String> {
        self.update(entities)
    }
}

impl SystemTrait for AISystem {
    fn get_system(&self) -> &System {
        &self.system
    }

    fn get_system_mut(&mut self) -> &mut System {
        &mut self.system
    }

    fn update(&mut self, entities: &mut Vec<Entity>) -> Result<(), String> {
        self.update(entities)
    }
}

#[wasm_bindgen]
impl SystemManager {
    /// Crear nuevo gestor de sistemas
    pub fn new() -> Self {
        let mut manager = Self {
            systems: HashMap::new(),
            system_order: Vec::new(),
            next_system_id: 1,
        };

        // Crear sistemas predefinidos
        manager.create_transform_system();
        manager.create_physics_system();
        manager.create_render_system();
        manager.create_audio_system();
        manager.create_ai_system();

        manager
    }

    /// Crear sistema de transformaciones
    pub fn create_transform_system(&mut self) -> SystemId {
        let system_id = self.next_system_id;
        self.next_system_id += 1;

        let transform_system = TransformSystem::new(system_id);
        self.systems.insert(system_id, Box::new(transform_system));
        self.system_order.push(system_id);

        system_id
    }

    /// Crear sistema de física
    pub fn create_physics_system(&mut self) -> SystemId {
        let system_id = self.next_system_id;
        self.next_system_id += 1;

        let physics_system = PhysicsSystem::new(system_id);
        self.systems.insert(system_id, Box::new(physics_system));
        self.system_order.push(system_id);

        system_id
    }

    /// Crear sistema de renderizado
    pub fn create_render_system(&mut self) -> SystemId {
        let system_id = self.next_system_id;
        self.next_system_id += 1;

        let render_system = RenderSystem::new(system_id);
        self.systems.insert(system_id, Box::new(render_system));
        self.system_order.push(system_id);

        system_id
    }

    /// Crear sistema de audio
    pub fn create_audio_system(&mut self) -> SystemId {
        let system_id = self.next_system_id;
        self.next_system_id += 1;

        let audio_system = AudioSystem::new(system_id);
        self.systems.insert(system_id, Box::new(audio_system));
        self.system_order.push(system_id);

        system_id
    }

    /// Crear sistema de IA
    pub fn create_ai_system(&mut self) -> SystemId {
        let system_id = self.next_system_id;
        self.next_system_id += 1;

        let ai_system = AISystem::new(system_id);
        self.systems.insert(system_id, Box::new(ai_system));
        self.system_order.push(system_id);

        system_id
    }

    /// Actualizar todos los sistemas
    pub fn update_all_systems(&mut self, entities: &mut Vec<Entity>) -> Result<(), JsValue> {
        for &system_id in &self.system_order {
            if let Some(system) = self.systems.get_mut(&system_id) {
                let system_info = system.get_system();
                
                if system_info.enabled && system_info.state == SystemState::Active {
                    if let Err(e) = system.update(entities) {
                        return Err(JsValue::from_str(&format!("Error en sistema {}: {}", system_info.name, e)));
                    }
                }
            }
        }
        Ok(())
    }

    /// Obtener sistema
    pub fn get_system(&self, system_id: SystemId) -> Option<JsValue> {
        self.systems.get(&system_id)
            .map(|system| serde_wasm_bindgen::to_value(system.get_system()).unwrap_or_default())
    }

    /// Obtener todos los sistemas
    pub fn get_all_systems(&self) -> JsValue {
        let systems: Vec<&System> = self.systems.values()
            .map(|system| system.get_system())
            .collect();
        
        serde_wasm_bindgen::to_value(&systems).unwrap_or_default()
    }

    /// Obtener estadísticas
    pub fn get_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "total_systems": self.systems.len(),
            "active_systems": self.systems.values()
                .filter(|system| system.get_system().state == SystemState::Active)
                .count(),
            "next_system_id": self.next_system_id,
        });

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }
} 