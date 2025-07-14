//! Mundo del ECS
//! Gestiona entidades, componentes y sistemas en un mundo unificado

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use super::{EntityId, ComponentId, ECSConfig};
use super::entity::Entity;

/// Mundo del ECS
#[derive(Debug, Clone)]
pub struct World {
    entities: HashMap<EntityId, Entity>,
    component_stores: HashMap<ComponentId, HashMap<EntityId, Box<dyn erased_serde::Serialize>>>,
    entity_components: HashMap<EntityId, Vec<ComponentId>>,
    config: ECSConfig,
    is_initialized: bool,
}

impl World {
    /// Crear nuevo mundo
    pub fn new() -> Self {
        Self {
            entities: HashMap::new(),
            component_stores: HashMap::new(),
            entity_components: HashMap::new(),
            config: ECSConfig::default(),
            is_initialized: false,
        }
    }

    /// Inicializar mundo
    pub fn initialize(&mut self, config: &ECSConfig) -> Result<(), JsValue> {
        self.config = config.clone();
        self.is_initialized = true;
        Ok(())
    }

    /// Crear entidad
    pub fn create_entity(&mut self, entity_id: EntityId) {
        let entity = Entity::new(entity_id);
        self.entities.insert(entity_id, entity);
        self.entity_components.insert(entity_id, Vec::new());
    }

    /// Eliminar entidad
    pub fn destroy_entity(&mut self, entity_id: EntityId) -> Result<(), JsValue> {
        if !self.entities.contains_key(&entity_id) {
            return Err(JsValue::from_str("Entidad no encontrada"));
        }

        // Remover de todas las tiendas de componentes
        if let Some(component_ids) = self.entity_components.get(&entity_id) {
            for &component_id in component_ids {
                if let Some(store) = self.component_stores.get_mut(&component_id) {
                    store.remove(&entity_id);
                }
            }
        }

        self.entities.remove(&entity_id);
        self.entity_components.remove(&entity_id);
        Ok(())
    }

    /// Verificar si entidad existe
    pub fn entity_exists(&self, entity_id: EntityId) -> bool {
        self.entities.contains_key(&entity_id)
    }

    /// Obtener entidad
    pub fn get_entity(&self, entity_id: EntityId) -> Option<&Entity> {
        self.entities.get(&entity_id)
    }

    /// Obtener entidad mutable
    pub fn get_entity_mut(&mut self, entity_id: EntityId) -> Option<&mut Entity> {
        self.entities.get_mut(&entity_id)
    }

    /// Obtener todas las entidades
    pub fn get_all_entities(&self) -> Vec<&Entity> {
        self.entities.values().collect()
    }

    /// Obtener entidades activas
    pub fn get_active_entities(&self) -> Vec<&Entity> {
        self.entities.values()
            .filter(|entity| entity.is_active())
            .collect()
    }

    /// Añadir componente a entidad
    pub fn add_component<T: 'static + erased_serde::Serialize>(&mut self, entity_id: EntityId, component_id: ComponentId, component: T) -> Result<(), JsValue> {
        if !self.entity_exists(entity_id) {
            return Err(JsValue::from_str("Entidad no encontrada"));
        }

        // Obtener o crear tienda de componentes
        let store = self.component_stores.entry(component_id).or_insert_with(HashMap::new);
        store.insert(entity_id, Box::new(component));

        // Actualizar lista de componentes de la entidad
        if let Some(components) = self.entity_components.get_mut(&entity_id) {
            if !components.contains(&component_id) {
                components.push(component_id);
            }
        }

        Ok(())
    }

    /// Obtener componente de entidad
    pub fn get_component<T: 'static + erased_serde::Serialize>(&self, entity_id: EntityId, component_id: ComponentId) -> Option<&T> {
        self.component_stores.get(&component_id)?
            .get(&entity_id)?
            .downcast_ref::<T>()
    }

    /// Obtener componente mutable de entidad
    pub fn get_component_mut<T: 'static + erased_serde::Serialize>(&mut self, entity_id: EntityId, component_id: ComponentId) -> Option<&mut T> {
        self.component_stores.get_mut(&component_id)?
            .get_mut(&entity_id)?
            .downcast_mut::<T>()
    }

    /// Remover componente de entidad
    pub fn remove_component(&mut self, entity_id: EntityId, component_id: ComponentId) -> Result<bool, JsValue> {
        if !self.entity_exists(entity_id) {
            return Err(JsValue::from_str("Entidad no encontrada"));
        }

        let removed = if let Some(store) = self.component_stores.get_mut(&component_id) {
            store.remove(&entity_id).is_some()
        } else {
            false
        };

        if removed {
            if let Some(components) = self.entity_components.get_mut(&entity_id) {
                components.retain(|&id| id != component_id);
            }
        }

        Ok(removed)
    }

    /// Verificar si entidad tiene componente
    pub fn has_component(&self, entity_id: EntityId, component_id: ComponentId) -> bool {
        self.component_stores.get(&component_id)
            .map_or(false, |store| store.contains_key(&entity_id))
    }

    /// Obtener entidades con componente
    pub fn get_entities_with_component(&self, component_id: ComponentId) -> Vec<EntityId> {
        self.component_stores.get(&component_id)
            .map(|store| store.keys().copied().collect())
            .unwrap_or_default()
    }

    /// Obtener entidades con múltiples componentes
    pub fn get_entities_with_components(&self, component_ids: &[ComponentId]) -> Vec<EntityId> {
        if component_ids.is_empty() {
            return Vec::new();
        }

        let mut result = self.get_entities_with_component(component_ids[0]);

        for &component_id in &component_ids[1..] {
            let entities_with_component = self.get_entities_with_component(component_id);
            result.retain(|&entity_id| entities_with_component.contains(&entity_id));
        }

        result
    }

    /// Obtener entidades sin componente
    pub fn get_entities_without_component(&self, component_id: ComponentId) -> Vec<EntityId> {
        let entities_with_component = self.get_entities_with_component(component_id);
        self.entities.keys()
            .filter(|&&entity_id| !entities_with_component.contains(&entity_id))
            .copied()
            .collect()
    }

    /// Obtener componentes de entidad
    pub fn get_entity_components(&self, entity_id: EntityId) -> Vec<ComponentId> {
        self.entity_components.get(&entity_id)
            .cloned()
            .unwrap_or_default()
    }

    /// Obtener estadísticas del mundo
    pub fn get_world_stats(&self) -> serde_json::Value {
        serde_json::json!({
            "total_entities": self.entities.len(),
            "active_entities": self.get_active_entities().len(),
            "component_types": self.component_stores.len(),
            "total_components": self.component_stores.values().map(|store| store.len()).sum::<usize>(),
            "is_initialized": self.is_initialized,
        })
    }

    /// Obtener número de entidades
    pub fn get_entity_count(&self) -> usize {
        self.entities.len()
    }

    /// Obtener número de componentes
    pub fn get_component_count(&self) -> usize {
        self.component_stores.values().map(|store| store.len()).sum()
    }

    /// Actualizar configuración
    pub fn update_config(&mut self, config: &ECSConfig) -> Result<(), JsValue> {
        self.config = config.clone();
        Ok(())
    }

    /// Limpiar entidades inactivas
    pub fn cleanup_inactive_entities(&mut self) -> usize {
        let inactive_entities: Vec<EntityId> = self.entities.iter()
            .filter(|(_, entity)| !entity.is_active())
            .map(|(&id, _)| id)
            .collect();

        let count = inactive_entities.len();
        for entity_id in inactive_entities {
            let _ = self.destroy_entity(entity_id);
        }

        count
    }

    /// Obtener entidades como JSON
    pub fn get_entities_json(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.entities).unwrap_or_default()
    }

    /// Obtener componentes como JSON
    pub fn get_components_json(&self) -> JsValue {
        let mut components_data = HashMap::new();
        
        for (component_id, store) in &self.component_stores {
            let mut entity_components = HashMap::new();
            for (entity_id, component) in store {
                // Convertir componente a JSON (simplificado)
                entity_components.insert(entity_id, "Component".to_string());
            }
            components_data.insert(component_id, entity_components);
        }

        serde_wasm_bindgen::to_value(&components_data).unwrap_or_default()
    }
}

/// Gestor del mundo
#[wasm_bindgen]
pub struct WorldManager {
    world: World,
}

#[wasm_bindgen]
impl WorldManager {
    /// Crear nuevo gestor del mundo
    pub fn new() -> Self {
        Self {
            world: World::new(),
        }
    }

    /// Inicializar mundo
    pub fn initialize(&mut self, config: JsValue) -> Result<(), JsValue> {
        let config: ECSConfig = serde_wasm_bindgen::from_value(config)?;
        self.world.initialize(&config)
    }

    /// Crear entidad
    pub fn create_entity(&mut self, entity_id: EntityId) {
        self.world.create_entity(entity_id);
    }

    /// Eliminar entidad
    pub fn destroy_entity(&mut self, entity_id: EntityId) -> Result<(), JsValue> {
        self.world.destroy_entity(entity_id)
    }

    /// Verificar si entidad existe
    pub fn entity_exists(&self, entity_id: EntityId) -> bool {
        self.world.entity_exists(entity_id)
    }

    /// Obtener entidad
    pub fn get_entity(&self, entity_id: EntityId) -> JsValue {
        self.world.get_entity(entity_id)
            .map(|entity| serde_wasm_bindgen::to_value(entity).unwrap_or_default())
            .unwrap_or_default()
    }

    /// Obtener todas las entidades
    pub fn get_all_entities(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.world.get_all_entities()).unwrap_or_default()
    }

    /// Obtener entidades activas
    pub fn get_active_entities(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.world.get_active_entities()).unwrap_or_default()
    }

    /// Añadir componente
    pub fn add_component(&mut self, entity_id: EntityId, component_id: ComponentId, component: JsValue) -> Result<(), JsValue> {
        // Esta es una implementación simplificada
        // En una implementación real, necesitarías manejar diferentes tipos de componentes
        self.world.add_component(entity_id, component_id, component)
    }

    /// Obtener entidades con componente
    pub fn get_entities_with_component(&self, component_id: ComponentId) -> JsValue {
        serde_wasm_bindgen::to_value(&self.world.get_entities_with_component(component_id)).unwrap_or_default()
    }

    /// Obtener entidades con múltiples componentes
    pub fn get_entities_with_components(&self, component_ids: JsValue) -> JsValue {
        let component_ids: Vec<ComponentId> = serde_wasm_bindgen::from_value(component_ids).unwrap_or_default();
        serde_wasm_bindgen::to_value(&self.world.get_entities_with_components(&component_ids)).unwrap_or_default()
    }

    /// Obtener estadísticas del mundo
    pub fn get_world_stats(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.world.get_world_stats()).unwrap_or_default()
    }

    /// Obtener número de entidades
    pub fn get_entity_count(&self) -> usize {
        self.world.get_entity_count()
    }

    /// Obtener número de componentes
    pub fn get_component_count(&self) -> usize {
        self.world.get_component_count()
    }

    /// Limpiar entidades inactivas
    pub fn cleanup_inactive_entities(&mut self) -> usize {
        self.world.cleanup_inactive_entities()
    }

    /// Obtener entidades como JSON
    pub fn get_entities_json(&self) -> JsValue {
        self.world.get_entities_json()
    }

    /// Obtener componentes como JSON
    pub fn get_components_json(&self) -> JsValue {
        self.world.get_components_json()
    }
} 