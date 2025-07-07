//! Sistema de Consultas para ECS
//! Permite consultar entidades y componentes de manera eficiente

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use super::{EntityId, ComponentId};

/// Tipo de consulta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QueryType {
    All,
    Any,
    None,
}

/// Filtro de consulta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryFilter {
    pub query_type: QueryType,
    pub required_components: Vec<ComponentId>,
    pub optional_components: Vec<ComponentId>,
    pub excluded_components: Vec<ComponentId>,
    pub tags: Vec<String>,
    pub active_only: bool,
}

impl Default for QueryFilter {
    fn default() -> Self {
        Self {
            query_type: QueryType::All,
            required_components: Vec::new(),
            optional_components: Vec::new(),
            excluded_components: Vec::new(),
            tags: Vec::new(),
            active_only: true,
        }
    }
}

/// Resultado de consulta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryResult {
    pub entity_id: EntityId,
    pub components: HashMap<ComponentId, String>, // Componente serializado como string
    pub tags: Vec<String>,
    pub is_active: bool,
}

/// Consulta del ECS
#[derive(Debug, Clone)]
pub struct Query {
    pub id: String,
    pub filter: QueryFilter,
    pub cached_results: Vec<QueryResult>,
    pub last_update: u64,
    pub cache_duration: u64, // ms
    pub is_cached: bool,
}

impl Query {
    /// Crear nueva consulta
    pub fn new(id: String, filter: QueryFilter) -> Self {
        Self {
            id,
            filter,
            cached_results: Vec::new(),
            last_update: 0,
            cache_duration: 100, // 100ms por defecto
            is_cached: true,
        }
    }

    /// Verificar si la consulta está actualizada
    pub fn is_up_to_date(&self, current_time: u64) -> bool {
        if !self.is_cached {
            return false;
        }
        current_time - self.last_update < self.cache_duration
    }

    /// Actualizar timestamp
    pub fn update_timestamp(&mut self, current_time: u64) {
        self.last_update = current_time;
    }

    /// Limpiar caché
    pub fn clear_cache(&mut self) {
        self.cached_results.clear();
        self.last_update = 0;
    }

    /// Establecer duración de caché
    pub fn set_cache_duration(&mut self, duration: u64) {
        self.cache_duration = duration;
    }

    /// Habilitar/deshabilitar caché
    pub fn set_cached(&mut self, cached: bool) {
        self.is_cached = cached;
        if !cached {
            self.clear_cache();
        }
    }
}

/// Gestor de consultas
#[wasm_bindgen]
pub struct QueryManager {
    queries: HashMap<String, Query>,
    next_query_id: u32,
}

#[wasm_bindgen]
impl QueryManager {
    /// Crear nuevo gestor de consultas
    pub fn new() -> Self {
        Self {
            queries: HashMap::new(),
            next_query_id: 1,
        }
    }

    /// Crear consulta
    pub fn create_query(&mut self, filter: JsValue) -> Result<String, JsValue> {
        let filter: QueryFilter = serde_wasm_bindgen::from_value(filter)?;
        let query_id = format!("query_{}", self.next_query_id);
        self.next_query_id += 1;

        let query = Query::new(query_id.clone(), filter);
        self.queries.insert(query_id.clone(), query);

        Ok(query_id)
    }

    /// Crear consulta con componentes requeridos
    pub fn create_query_with_components(&mut self, required_components: JsValue, optional_components: Option<JsValue>, excluded_components: Option<JsValue>) -> Result<String, JsValue> {
        let required: Vec<ComponentId> = serde_wasm_bindgen::from_value(required_components)?;
        let optional: Vec<ComponentId> = optional_components
            .map(|v| serde_wasm_bindgen::from_value(v))
            .unwrap_or(Ok(Vec::new()))?;
        let excluded: Vec<ComponentId> = excluded_components
            .map(|v| serde_wasm_bindgen::from_value(v))
            .unwrap_or(Ok(Vec::new()))?;

        let filter = QueryFilter {
            query_type: QueryType::All,
            required_components: required,
            optional_components: optional,
            excluded_components: excluded,
            tags: Vec::new(),
            active_only: true,
        };

        self.create_query(serde_wasm_bindgen::to_value(&filter)?)
    }

    /// Crear consulta por tags
    pub fn create_query_by_tags(&mut self, tags: JsValue) -> Result<String, JsValue> {
        let tags: Vec<String> = serde_wasm_bindgen::from_value(tags)?;
        
        let filter = QueryFilter {
            query_type: QueryType::All,
            required_components: Vec::new(),
            optional_components: Vec::new(),
            excluded_components: Vec::new(),
            tags: tags,
            active_only: true,
        };

        self.create_query(serde_wasm_bindgen::to_value(&filter)?)
    }

    /// Ejecutar consulta
    pub fn execute_query(&mut self, query_id: &str, entities: JsValue) -> Result<JsValue, JsValue> {
        let query = self.queries.get_mut(query_id)
            .ok_or_else(|| JsValue::from_str("Consulta no encontrada"))?;

        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        // Verificar caché
        if query.is_cached && query.is_up_to_date(current_time) {
            return Ok(serde_wasm_bindgen::to_value(&query.cached_results).unwrap_or_default());
        }

        // Ejecutar consulta
        let entities_data: Vec<serde_json::Value> = serde_wasm_bindgen::from_value(entities)?;
        let results = self.execute_query_internal(query, &entities_data);

        // Actualizar caché
        query.cached_results = results.clone();
        query.update_timestamp(current_time);

        Ok(serde_wasm_bindgen::to_value(&results).unwrap_or_default())
    }

    /// Ejecutar consulta interna
    fn execute_query_internal(&self, query: &Query, entities: &[serde_json::Value]) -> Vec<QueryResult> {
        let mut results = Vec::new();

        for entity_data in entities {
            if let Some(entity_id) = entity_data.get("id").and_then(|v| v.as_u64()) {
                if self.matches_filter(query, entity_data) {
                    if let Some(result) = self.create_query_result(entity_data) {
                        results.push(result);
                    }
                }
            }
        }

        results
    }

    /// Verificar si entidad coincide con filtro
    fn matches_filter(&self, query: &Query, entity_data: &serde_json::Value) -> bool {
        // Verificar si solo entidades activas
        if query.filter.active_only {
            if let Some(is_active) = entity_data.get("active").and_then(|v| v.as_bool()) {
                if !is_active {
                    return false;
                }
            }
        }

        // Verificar tags
        if !query.filter.tags.is_empty() {
            if let Some(entity_tags) = entity_data.get("tags").and_then(|v| v.as_array()) {
                let entity_tags: Vec<String> = entity_tags.iter()
                    .filter_map(|v| v.as_str().map(|s| s.to_string()))
                    .collect();

                let has_required_tags = query.filter.tags.iter()
                    .all(|tag| entity_tags.contains(tag));

                if !has_required_tags {
                    return false;
                }
            } else {
                return false;
            }
        }

        // Verificar componentes
        if let Some(components) = entity_data.get("components").and_then(|v| v.as_array()) {
            let component_ids: Vec<ComponentId> = components.iter()
                .filter_map(|v| v.get("id").and_then(|id| id.as_u64()).map(|id| id as ComponentId))
                .collect();

            // Verificar componentes requeridos
            for &required_id in &query.filter.required_components {
                if !component_ids.contains(&required_id) {
                    return false;
                }
            }

            // Verificar componentes excluidos
            for &excluded_id in &query.filter.excluded_components {
                if component_ids.contains(&excluded_id) {
                    return false;
                }
            }
        } else {
            // Si no hay componentes y se requieren, no coincide
            if !query.filter.required_components.is_empty() {
                return false;
            }
        }

        true
    }

    /// Crear resultado de consulta
    fn create_query_result(&self, entity_data: &serde_json::Value) -> Option<QueryResult> {
        let entity_id = entity_data.get("id")?.as_u64()? as EntityId;
        let is_active = entity_data.get("active").and_then(|v| v.as_bool()).unwrap_or(true);

        let mut components = HashMap::new();
        if let Some(components_array) = entity_data.get("components").and_then(|v| v.as_array()) {
            for component_data in components_array {
                if let (Some(id), Some(component_type)) = (
                    component_data.get("id").and_then(|v| v.as_u64()),
                    component_data.get("type").and_then(|v| v.as_str())
                ) {
                    components.insert(id as ComponentId, component_type.to_string());
                }
            }
        }

        let tags = entity_data.get("tags")
            .and_then(|v| v.as_array())
            .map(|tags_array| {
                tags_array.iter()
                    .filter_map(|v| v.as_str().map(|s| s.to_string()))
                    .collect()
            })
            .unwrap_or_default();

        Some(QueryResult {
            entity_id,
            components,
            tags,
            is_active,
        })
    }

    /// Obtener consulta
    pub fn get_query(&self, query_id: &str) -> JsValue {
        self.queries.get(query_id)
            .map(|query| serde_wasm_bindgen::to_value(query).unwrap_or_default())
            .unwrap_or_default()
    }

    /// Obtener todas las consultas
    pub fn get_all_queries(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.queries).unwrap_or_default()
    }

    /// Eliminar consulta
    pub fn remove_query(&mut self, query_id: &str) -> Result<(), JsValue> {
        if self.queries.remove(query_id).is_some() {
            Ok(())
        } else {
            Err(JsValue::from_str("Consulta no encontrada"))
        }
    }

    /// Limpiar caché de consulta
    pub fn clear_query_cache(&mut self, query_id: &str) -> Result<(), JsValue> {
        let query = self.queries.get_mut(query_id)
            .ok_or_else(|| JsValue::from_str("Consulta no encontrada"))?;
        
        query.clear_cache();
        Ok(())
    }

    /// Limpiar caché de todas las consultas
    pub fn clear_all_caches(&mut self) {
        for query in self.queries.values_mut() {
            query.clear_cache();
        }
    }

    /// Establecer duración de caché
    pub fn set_cache_duration(&mut self, query_id: &str, duration: u64) -> Result<(), JsValue> {
        let query = self.queries.get_mut(query_id)
            .ok_or_else(|| JsValue::from_str("Consulta no encontrada"))?;
        
        query.set_cache_duration(duration);
        Ok(())
    }

    /// Habilitar/deshabilitar caché
    pub fn set_query_cached(&mut self, query_id: &str, cached: bool) -> Result<(), JsValue> {
        let query = self.queries.get_mut(query_id)
            .ok_or_else(|| JsValue::from_str("Consulta no encontrada"))?;
        
        query.set_cached(cached);
        Ok(())
    }

    /// Obtener estadísticas de consultas
    pub fn get_query_stats(&self) -> JsValue {
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        let mut stats = serde_json::Map::new();
        stats.insert("total_queries".to_string(), serde_json::Value::Number(self.queries.len().into()));
        stats.insert("cached_queries".to_string(), serde_json::Value::Number(
            self.queries.values().filter(|q| q.is_cached).count().into()
        ));
        stats.insert("up_to_date_queries".to_string(), serde_json::Value::Number(
            self.queries.values().filter(|q| q.is_up_to_date(current_time)).count().into()
        ));

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }

    /// Consulta rápida por componentes
    pub fn quick_query(&self, required_components: JsValue, entities: JsValue) -> Result<JsValue, JsValue> {
        let required: Vec<ComponentId> = serde_wasm_bindgen::from_value(required_components)?;
        let entities_data: Vec<serde_json::Value> = serde_wasm_bindgen::from_value(entities)?;

        let mut results = Vec::new();

        for entity_data in entities_data {
            if let Some(components) = entity_data.get("components").and_then(|v| v.as_array()) {
                let component_ids: Vec<ComponentId> = components.iter()
                    .filter_map(|v| v.get("id").and_then(|id| id.as_u64()).map(|id| id as ComponentId))
                    .collect();

                let has_all_required = required.iter().all(|&id| component_ids.contains(&id));
                if has_all_required {
                    if let Some(entity_id) = entity_data.get("id").and_then(|v| v.as_u64()) {
                        results.push(entity_id);
                    }
                }
            }
        }

        Ok(serde_wasm_bindgen::to_value(&results).unwrap_or_default())
    }

    /// Consulta rápida por tags
    pub fn quick_query_by_tags(&self, tags: JsValue, entities: JsValue) -> Result<JsValue, JsValue> {
        let tags: Vec<String> = serde_wasm_bindgen::from_value(tags)?;
        let entities_data: Vec<serde_json::Value> = serde_wasm_bindgen::from_value(entities)?;

        let mut results = Vec::new();

        for entity_data in entities_data {
            if let Some(entity_tags) = entity_data.get("tags").and_then(|v| v.as_array()) {
                let entity_tags: Vec<String> = entity_tags.iter()
                    .filter_map(|v| v.as_str().map(|s| s.to_string()))
                    .collect();

                let has_required_tags = tags.iter().all(|tag| entity_tags.contains(tag));
                if has_required_tags {
                    if let Some(entity_id) = entity_data.get("id").and_then(|v| v.as_u64()) {
                        results.push(entity_id);
                    }
                }
            }
        }

        Ok(serde_wasm_bindgen::to_value(&results).unwrap_or_default())
    }
} 