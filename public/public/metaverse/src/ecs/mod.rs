//! Sistema ECS (Entity Component System) para Metaverso
//! Maneja entidades, componentes y sistemas del mundo virtual

pub mod entity;
pub mod component;
pub mod system;
pub mod world;
pub mod query;

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// ID único de entidad
pub type EntityId = u64;

/// ID único de componente
pub type ComponentId = u32;

/// ID único de sistema
pub type SystemId = u32;

/// Configuración del ECS
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ECSConfig {
    pub max_entities: usize,
    pub max_components_per_entity: usize,
    pub enable_parallel_processing: bool,
    pub enable_component_caching: bool,
    pub enable_entity_pooling: bool,
    pub update_rate: u32, // Hz
}

impl Default for ECSConfig {
    fn default() -> Self {
        Self {
            max_entities: 10000,
            max_components_per_entity: 16,
            enable_parallel_processing: true,
            enable_component_caching: true,
            enable_entity_pooling: true,
            update_rate: 60,
        }
    }
}

/// Gestor principal del ECS
#[wasm_bindgen]
pub struct ECSManager {
    config: ECSConfig,
    world: world::World,
    systems: HashMap<SystemId, system::System>,
    next_entity_id: EntityId,
    next_system_id: SystemId,
    is_initialized: bool,
}

#[wasm_bindgen]
impl ECSManager {
    /// Crear nuevo gestor ECS
    pub fn new() -> Self {
        Self {
            config: ECSConfig::default(),
            world: world::World::new(),
            systems: HashMap::new(),
            next_entity_id: 1,
            next_system_id: 1,
            is_initialized: false,
        }
    }

    /// Inicializar el ECS
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.world.initialize(&self.config)?;
        self.is_initialized = true;
        Ok(())
    }

    /// Crear nueva entidad
    pub fn create_entity(&mut self) -> EntityId {
        let entity_id = self.next_entity_id;
        self.next_entity_id += 1;
        
        self.world.create_entity(entity_id);
        entity_id
    }

    /// Eliminar entidad
    pub fn destroy_entity(&mut self, entity_id: EntityId) -> Result<(), JsValue> {
        self.world.destroy_entity(entity_id)?;
        Ok(())
    }

    /// Verificar si entidad existe
    pub fn entity_exists(&self, entity_id: EntityId) -> bool {
        self.world.entity_exists(entity_id)
    }

    /// Obtener todas las entidades
    pub fn get_all_entities(&self) -> JsValue {
        let entities = self.world.get_all_entities();
        serde_wasm_bindgen::to_value(&entities).unwrap_or_default()
    }

    /// Obtener configuración
    pub fn get_config(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.config).unwrap_or_default()
    }

    /// Actualizar configuración
    pub fn update_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        let new_config: ECSConfig = serde_wasm_bindgen::from_value(config)?;
        self.config = new_config;
        
        if self.is_initialized {
            self.world.update_config(&self.config)?;
        }
        
        Ok(())
    }

    /// Obtener estadísticas del ECS
    pub fn get_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "total_entities": self.world.get_entity_count(),
            "total_components": self.world.get_component_count(),
            "total_systems": self.systems.len(),
            "next_entity_id": self.next_entity_id,
            "next_system_id": self.next_system_id,
            "is_initialized": self.is_initialized,
        });

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }

    /// Verificar si está inicializado
    pub fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Drop for ECSManager {
    fn drop(&mut self) {
        // Limpiar recursos
        self.systems.clear();
    }
} 