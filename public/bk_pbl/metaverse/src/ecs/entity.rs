//! Sistema de Entidades para ECS
//! Maneja la creación, gestión y destrucción de entidades

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use super::{EntityId, ComponentId};

/// Entidad del mundo virtual
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub id: EntityId,
    pub name: Option<String>,
    pub active: bool,
    pub components: HashMap<ComponentId, Box<dyn erased_serde::Serialize>>,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, String>,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Entity {
    /// Crear nueva entidad
    pub fn new(id: EntityId) -> Self {
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        Self {
            id,
            name: None,
            active: true,
            components: HashMap::new(),
            tags: Vec::new(),
            metadata: HashMap::new(),
            created_at: current_time,
            updated_at: current_time,
        }
    }

    /// Establecer nombre de la entidad
    pub fn set_name(&mut self, name: String) {
        self.name = Some(name);
        self.update_timestamp();
    }

    /// Obtener nombre de la entidad
    pub fn get_name(&self) -> Option<&String> {
        self.name.as_ref()
    }

    /// Añadir componente
    pub fn add_component<T: 'static + erased_serde::Serialize>(&mut self, component_id: ComponentId, component: T) {
        self.components.insert(component_id, Box::new(component));
        self.update_timestamp();
    }

    /// Obtener componente
    pub fn get_component<T: 'static + erased_serde::Serialize>(&self, component_id: ComponentId) -> Option<&T> {
        self.components.get(&component_id)
            .and_then(|comp| comp.downcast_ref::<T>())
    }

    /// Obtener componente mutable
    pub fn get_component_mut<T: 'static + erased_serde::Serialize>(&mut self, component_id: ComponentId) -> Option<&mut T> {
        self.components.get_mut(&component_id)
            .and_then(|comp| comp.downcast_mut::<T>())
    }

    /// Remover componente
    pub fn remove_component(&mut self, component_id: ComponentId) -> bool {
        let removed = self.components.remove(&component_id).is_some();
        if removed {
            self.update_timestamp();
        }
        removed
    }

    /// Verificar si tiene componente
    pub fn has_component(&self, component_id: ComponentId) -> bool {
        self.components.contains_key(&component_id)
    }

    /// Obtener todos los IDs de componentes
    pub fn get_component_ids(&self) -> Vec<ComponentId> {
        self.components.keys().copied().collect()
    }

    /// Añadir tag
    pub fn add_tag(&mut self, tag: String) {
        if !self.tags.contains(&tag) {
            self.tags.push(tag);
            self.update_timestamp();
        }
    }

    /// Remover tag
    pub fn remove_tag(&mut self, tag: &str) -> bool {
        let initial_len = self.tags.len();
        self.tags.retain(|t| t != tag);
        let removed = self.tags.len() < initial_len;
        if removed {
            self.update_timestamp();
        }
        removed
    }

    /// Verificar si tiene tag
    pub fn has_tag(&self, tag: &str) -> bool {
        self.tags.contains(&tag.to_string())
    }

    /// Obtener todos los tags
    pub fn get_tags(&self) -> &Vec<String> {
        &self.tags
    }

    /// Establecer metadata
    pub fn set_metadata(&mut self, key: String, value: String) {
        self.metadata.insert(key, value);
        self.update_timestamp();
    }

    /// Obtener metadata
    pub fn get_metadata(&self, key: &str) -> Option<&String> {
        self.metadata.get(key)
    }

    /// Remover metadata
    pub fn remove_metadata(&mut self, key: &str) -> bool {
        let removed = self.metadata.remove(key).is_some();
        if removed {
            self.update_timestamp();
        }
        removed
    }

    /// Obtener toda la metadata
    pub fn get_all_metadata(&self) -> &HashMap<String, String> {
        &self.metadata
    }

    /// Activar entidad
    pub fn activate(&mut self) {
        self.active = true;
        self.update_timestamp();
    }

    /// Desactivar entidad
    pub fn deactivate(&mut self) {
        self.active = false;
        self.update_timestamp();
    }

    /// Verificar si está activa
    pub fn is_active(&self) -> bool {
        self.active
    }

    /// Actualizar timestamp
    fn update_timestamp(&mut self) {
        self.updated_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
    }

    /// Obtener tiempo de vida
    pub fn get_lifetime(&self) -> u64 {
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        current_time - self.created_at
    }

    /// Clonar entidad
    pub fn clone_with_new_id(&self, new_id: EntityId) -> Self {
        let mut cloned = self.clone();
        cloned.id = new_id;
        cloned.created_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        cloned.updated_at = cloned.created_at;
        cloned
    }
}

/// Gestor de entidades
#[wasm_bindgen]
pub struct EntityManager {
    entities: HashMap<EntityId, Entity>,
    next_entity_id: EntityId,
    entity_pool: Vec<EntityId>,
}

#[wasm_bindgen]
impl EntityManager {
    /// Crear nuevo gestor de entidades
    pub fn new() -> Self {
        Self {
            entities: HashMap::new(),
            next_entity_id: 1,
            entity_pool: Vec::new(),
        }
    }

    /// Crear nueva entidad
    pub fn create_entity(&mut self) -> EntityId {
        let entity_id = if let Some(id) = self.entity_pool.pop() {
            id
        } else {
            let id = self.next_entity_id;
            self.next_entity_id += 1;
            id
        };

        let entity = Entity::new(entity_id);
        self.entities.insert(entity_id, entity);
        entity_id
    }

    /// Crear entidad con nombre
    pub fn create_entity_with_name(&mut self, name: &str) -> EntityId {
        let entity_id = self.create_entity();
        if let Some(entity) = self.entities.get_mut(&entity_id) {
            entity.set_name(name.to_string());
        }
        entity_id
    }

    /// Eliminar entidad
    pub fn destroy_entity(&mut self, entity_id: EntityId) -> bool {
        if self.entities.remove(&entity_id).is_some() {
            self.entity_pool.push(entity_id);
            true
        } else {
            false
        }
    }

    /// Obtener entidad
    pub fn get_entity(&self, entity_id: EntityId) -> Option<&Entity> {
        self.entities.get(&entity_id)
    }

    /// Obtener entidad mutable
    pub fn get_entity_mut(&mut self, entity_id: EntityId) -> Option<&mut Entity> {
        self.entities.get_mut(&entity_id)
    }

    /// Verificar si entidad existe
    pub fn entity_exists(&self, entity_id: EntityId) -> bool {
        self.entities.contains_key(&entity_id)
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

    /// Obtener entidades por tag
    pub fn get_entities_by_tag(&self, tag: &str) -> Vec<&Entity> {
        self.entities.values()
            .filter(|entity| entity.has_tag(tag))
            .collect()
    }

    /// Obtener entidades por nombre
    pub fn get_entities_by_name(&self, name: &str) -> Vec<&Entity> {
        self.entities.values()
            .filter(|entity| entity.get_name().map_or(false, |n| n == name))
            .collect()
    }

    /// Obtener estadísticas
    pub fn get_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "total_entities": self.entities.len(),
            "active_entities": self.get_active_entities().len(),
            "pooled_entities": self.entity_pool.len(),
            "next_entity_id": self.next_entity_id,
        });

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }

    /// Limpiar entidades inactivas
    pub fn cleanup_inactive_entities(&mut self) -> usize {
        let initial_count = self.entities.len();
        self.entities.retain(|_, entity| entity.is_active());
        initial_count - self.entities.len()
    }

    /// Obtener entidades como JSON
    pub fn get_entities_json(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.entities).unwrap_or_default()
    }
} 