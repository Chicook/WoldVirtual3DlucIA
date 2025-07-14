//! Sistema de Física para Metaverso
//! Maneja colisiones, gravedad, fuerzas y simulación física

pub mod collision;
pub mod rigidbody;
pub mod forces;
pub mod constraints;

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Configuración de física
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsConfig {
    pub gravity: [f32; 3],
    pub time_step: f32,
    pub max_sub_steps: u32,
    pub enable_ccd: bool, // Continuous Collision Detection
    pub enable_multithreading: bool,
    pub solver_iterations: u32,
    pub enable_debug_draw: bool,
    pub max_contacts: usize,
    pub contact_tolerance: f32,
    pub island_solver: bool,
}

impl Default for PhysicsConfig {
    fn default() -> Self {
        Self {
            gravity: [0.0, -9.81, 0.0],
            time_step: 1.0 / 60.0,
            max_sub_steps: 4,
            enable_ccd: true,
            enable_multithreading: true,
            solver_iterations: 4,
            enable_debug_draw: false,
            max_contacts: 1000,
            contact_tolerance: 0.001,
            island_solver: true,
        }
    }
}

/// Tipo de colisionador
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ColliderType {
    Box {
        size: [f32; 3],
    },
    Sphere {
        radius: f32,
    },
    Capsule {
        radius: f32,
        height: f32,
    },
    Cylinder {
        radius: f32,
        height: f32,
    },
    Mesh {
        vertices: Vec<[f32; 3]>,
        indices: Vec<u32>,
    },
}

/// Material físico
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsMaterial {
    pub friction: f32,
    pub restitution: f32,
    pub density: f32,
    pub name: String,
}

impl Default for PhysicsMaterial {
    fn default() -> Self {
        Self {
            friction: 0.5,
            restitution: 0.5,
            density: 1.0,
            name: "Default".to_string(),
        }
    }
}

/// Cuerpo rígido
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RigidBody {
    pub id: u64,
    pub position: [f32; 3],
    pub rotation: [f32; 4], // Quaternion
    pub linear_velocity: [f32; 3],
    pub angular_velocity: [f32; 3],
    pub mass: f32,
    pub inertia: [f32; 3],
    pub collider: ColliderType,
    pub material: PhysicsMaterial,
    pub is_static: bool,
    pub is_kinematic: bool,
    pub is_trigger: bool,
    pub enabled: bool,
    pub gravity_scale: f32,
    pub linear_damping: f32,
    pub angular_damping: f32,
}

impl Default for RigidBody {
    fn default() -> Self {
        Self {
            id: 0,
            position: [0.0, 0.0, 0.0],
            rotation: [0.0, 0.0, 0.0, 1.0],
            linear_velocity: [0.0, 0.0, 0.0],
            angular_velocity: [0.0, 0.0, 0.0],
            mass: 1.0,
            inertia: [1.0, 1.0, 1.0],
            collider: ColliderType::Box { size: [1.0, 1.0, 1.0] },
            material: PhysicsMaterial::default(),
            is_static: false,
            is_kinematic: false,
            is_trigger: false,
            enabled: true,
            gravity_scale: 1.0,
            linear_damping: 0.0,
            angular_damping: 0.0,
        }
    }
}

/// Contacto de colisión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Contact {
    pub body_a: u64,
    pub body_b: u64,
    pub point: [f32; 3],
    pub normal: [f32; 3],
    pub penetration: f32,
    pub impulse: f32,
    pub friction: f32,
}

/// Gestor principal de física
#[wasm_bindgen]
pub struct PhysicsManager {
    config: PhysicsConfig,
    bodies: HashMap<u64, RigidBody>,
    contacts: Vec<Contact>,
    materials: HashMap<String, PhysicsMaterial>,
    next_body_id: u64,
    is_initialized: bool,
}

#[wasm_bindgen]
impl PhysicsManager {
    /// Crear nuevo gestor de física
    pub fn new() -> Self {
        let mut manager = Self {
            config: PhysicsConfig::default(),
            bodies: HashMap::new(),
            contacts: Vec::new(),
            materials: HashMap::new(),
            next_body_id: 1,
            is_initialized: false,
        };

        // Crear materiales predefinidos
        manager.create_default_materials();
        manager
    }

    /// Inicializar el sistema de física
    pub fn initialize(&mut self) -> Result<(), JsValue> {
        self.is_initialized = true;
        Ok(())
    }

    /// Crear materiales predefinidos
    fn create_default_materials(&mut self) {
        self.materials.insert("Default".to_string(), PhysicsMaterial::default());
        
        self.materials.insert("Ice".to_string(), PhysicsMaterial {
            friction: 0.1,
            restitution: 0.8,
            density: 0.9,
            name: "Ice".to_string(),
        });

        self.materials.insert("Rubber".to_string(), PhysicsMaterial {
            friction: 0.8,
            restitution: 0.9,
            density: 1.2,
            name: "Rubber".to_string(),
        });

        self.materials.insert("Metal".to_string(), PhysicsMaterial {
            friction: 0.3,
            restitution: 0.2,
            density: 7.8,
            name: "Metal".to_string(),
        });

        self.materials.insert("Wood".to_string(), PhysicsMaterial {
            friction: 0.6,
            restitution: 0.4,
            density: 0.7,
            name: "Wood".to_string(),
        });
    }

    /// Crear cuerpo rígido
    pub fn create_rigid_body(&mut self, position: &[f32; 3], collider: JsValue) -> Result<u64, JsValue> {
        let body_id = self.next_body_id;
        self.next_body_id += 1;

        let collider_type: ColliderType = serde_wasm_bindgen::from_value(collider)?;

        let body = RigidBody {
            id: body_id,
            position: *position,
            rotation: [0.0, 0.0, 0.0, 1.0],
            linear_velocity: [0.0, 0.0, 0.0],
            angular_velocity: [0.0, 0.0, 0.0],
            mass: 1.0,
            inertia: [1.0, 1.0, 1.0],
            collider: collider_type,
            material: PhysicsMaterial::default(),
            is_static: false,
            is_kinematic: false,
            is_trigger: false,
            enabled: true,
            gravity_scale: 1.0,
            linear_damping: 0.0,
            angular_damping: 0.0,
        };

        self.bodies.insert(body_id, body);
        Ok(body_id)
    }

    /// Crear cuerpo estático
    pub fn create_static_body(&mut self, position: &[f32; 3], collider: JsValue) -> Result<u64, JsValue> {
        let body_id = self.create_rigid_body(position, collider)?;
        
        if let Some(body) = self.bodies.get_mut(&body_id) {
            body.is_static = true;
            body.mass = 0.0;
        }

        Ok(body_id)
    }

    /// Eliminar cuerpo rígido
    pub fn destroy_rigid_body(&mut self, body_id: u64) -> Result<(), JsValue> {
        if self.bodies.remove(&body_id).is_some() {
            // Remover contactos relacionados
            self.contacts.retain(|contact| contact.body_a != body_id && contact.body_b != body_id);
            Ok(())
        } else {
            Err(JsValue::from_str("Cuerpo no encontrado"))
        }
    }

    /// Obtener cuerpo rígido
    pub fn get_rigid_body(&self, body_id: u64) -> Result<JsValue, JsValue> {
        let body = self.bodies.get(&body_id)
            .ok_or_else(|| JsValue::from_str("Cuerpo no encontrado"))?;
        
        serde_wasm_bindgen::to_value(body)
            .map_err(|_| JsValue::from_str("Error al serializar cuerpo"))
    }

    /// Obtener todos los cuerpos
    pub fn get_all_bodies(&self) -> JsValue {
        let body_list: Vec<&RigidBody> = self.bodies.values().collect();
        serde_wasm_bindgen::to_value(&body_list).unwrap_or_default()
    }

    /// Aplicar fuerza
    pub fn apply_force(&mut self, body_id: u64, force: &[f32; 3], point: Option<&[f32; 3]>) -> Result<(), JsValue> {
        let body = self.bodies.get_mut(&body_id)
            .ok_or_else(|| JsValue::from_str("Cuerpo no encontrado"))?;

        if body.is_static || body.is_kinematic {
            return Err(JsValue::from_str("No se puede aplicar fuerza a un cuerpo estático o cinemático"));
        }

        // Aplicar fuerza lineal
        body.linear_velocity[0] += force[0] / body.mass * self.config.time_step;
        body.linear_velocity[1] += force[1] / body.mass * self.config.time_step;
        body.linear_velocity[2] += force[2] / body.mass * self.config.time_step;

        // Aplicar torque si se especifica un punto
        if let Some(point) = point {
            let r = [
                point[0] - body.position[0],
                point[1] - body.position[1],
                point[2] - body.position[2],
            ];

            let torque = [
                r[1] * force[2] - r[2] * force[1],
                r[2] * force[0] - r[0] * force[2],
                r[0] * force[1] - r[1] * force[0],
            ];

            body.angular_velocity[0] += torque[0] / body.inertia[0] * self.config.time_step;
            body.angular_velocity[1] += torque[1] / body.inertia[1] * self.config.time_step;
            body.angular_velocity[2] += torque[2] / body.inertia[2] * self.config.time_step;
        }

        Ok(())
    }

    /// Aplicar impulso
    pub fn apply_impulse(&mut self, body_id: u64, impulse: &[f32; 3], point: Option<&[f32; 3]>) -> Result<(), JsValue> {
        let body = self.bodies.get_mut(&body_id)
            .ok_or_else(|| JsValue::from_str("Cuerpo no encontrado"))?;

        if body.is_static || body.is_kinematic {
            return Err(JsValue::from_str("No se puede aplicar impulso a un cuerpo estático o cinemático"));
        }

        // Aplicar impulso lineal
        body.linear_velocity[0] += impulse[0] / body.mass;
        body.linear_velocity[1] += impulse[1] / body.mass;
        body.linear_velocity[2] += impulse[2] / body.mass;

        // Aplicar impulso angular si se especifica un punto
        if let Some(point) = point {
            let r = [
                point[0] - body.position[0],
                point[1] - body.position[1],
                point[2] - body.position[2],
            ];

            let angular_impulse = [
                r[1] * impulse[2] - r[2] * impulse[1],
                r[2] * impulse[0] - r[0] * impulse[2],
                r[0] * impulse[1] - r[1] * impulse[0],
            ];

            body.angular_velocity[0] += angular_impulse[0] / body.inertia[0];
            body.angular_velocity[1] += angular_impulse[1] / body.inertia[1];
            body.angular_velocity[2] += angular_impulse[2] / body.inertia[2];
        }

        Ok(())
    }

    /// Establecer velocidad
    pub fn set_velocity(&mut self, body_id: u64, linear_velocity: &[f32; 3], angular_velocity: Option<&[f32; 3]>) -> Result<(), JsValue> {
        let body = self.bodies.get_mut(&body_id)
            .ok_or_else(|| JsValue::from_str("Cuerpo no encontrado"))?;

        body.linear_velocity = *linear_velocity;

        if let Some(angular_velocity) = angular_velocity {
            body.angular_velocity = *angular_velocity;
        }

        Ok(())
    }

    /// Establecer posición
    pub fn set_position(&mut self, body_id: u64, position: &[f32; 3]) -> Result<(), JsValue> {
        let body = self.bodies.get_mut(&body_id)
            .ok_or_else(|| JsValue::from_str("Cuerpo no encontrado"))?;

        body.position = *position;
        Ok(())
    }

    /// Actualizar física
    pub fn update(&mut self, delta_time: f32) -> Result<(), JsValue> {
        if !self.is_initialized {
            return Err(JsValue::from_str("Física no inicializada"));
        }

        let time_step = self.config.time_step.min(delta_time);
        let sub_steps = (delta_time / time_step).min(self.config.max_sub_steps as f32) as u32;

        for _ in 0..sub_steps {
            self.update_step(time_step)?;
        }

        Ok(())
    }

    /// Actualizar un paso de física
    fn update_step(&mut self, time_step: f32) -> Result<(), JsValue> {
        // Aplicar gravedad
        for body in self.bodies.values_mut() {
            if body.enabled && !body.is_static && !body.is_kinematic {
                let gravity_force = [
                    self.config.gravity[0] * body.gravity_scale,
                    self.config.gravity[1] * body.gravity_scale,
                    self.config.gravity[2] * body.gravity_scale,
                ];

                body.linear_velocity[0] += gravity_force[0] * time_step;
                body.linear_velocity[1] += gravity_force[1] * time_step;
                body.linear_velocity[2] += gravity_force[2] * time_step;
            }
        }

        // Aplicar amortiguación
        for body in self.bodies.values_mut() {
            if body.enabled && !body.is_static {
                body.linear_velocity[0] *= 1.0 - body.linear_damping * time_step;
                body.linear_velocity[1] *= 1.0 - body.linear_damping * time_step;
                body.linear_velocity[2] *= 1.0 - body.linear_damping * time_step;

                body.angular_velocity[0] *= 1.0 - body.angular_damping * time_step;
                body.angular_velocity[1] *= 1.0 - body.angular_damping * time_step;
                body.angular_velocity[2] *= 1.0 - body.angular_damping * time_step;
            }
        }

        // Integrar posición
        for body in self.bodies.values_mut() {
            if body.enabled && !body.is_static {
                body.position[0] += body.linear_velocity[0] * time_step;
                body.position[1] += body.linear_velocity[1] * time_step;
                body.position[2] += body.linear_velocity[2] * time_step;

                // Integración simple de rotación (en una implementación real usaría quaterniones)
                body.rotation[0] += body.angular_velocity[0] * time_step * 0.5;
                body.rotation[1] += body.angular_velocity[1] * time_step * 0.5;
                body.rotation[2] += body.angular_velocity[2] * time_step * 0.5;
            }
        }

        // Detectar colisiones
        self.detect_collisions()?;

        // Resolver colisiones
        self.resolve_collisions()?;

        Ok(())
    }

    /// Detectar colisiones
    fn detect_collisions(&mut self) -> Result<(), JsValue> {
        self.contacts.clear();
        let body_ids: Vec<u64> = self.bodies.keys().copied().collect();

        for i in 0..body_ids.len() {
            for j in (i + 1)..body_ids.len() {
                let body_a_id = body_ids[i];
                let body_b_id = body_ids[j];

                if let (Some(body_a), Some(body_b)) = (self.bodies.get(&body_a_id), self.bodies.get(&body_b_id)) {
                    if body_a.enabled && body_b.enabled {
                        if let Some(contact) = self.check_collision(body_a, body_b) {
                            self.contacts.push(contact);
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// Verificar colisión entre dos cuerpos
    fn check_collision(&self, body_a: &RigidBody, body_b: &RigidBody) -> Option<Contact> {
        // Implementación simplificada de detección de colisiones
        // En una implementación real, esto sería mucho más complejo

        match (&body_a.collider, &body_b.collider) {
            (ColliderType::Box { size: size_a }, ColliderType::Box { size: size_b }) => {
                // Detección de colisión entre cajas
                let min_a = [
                    body_a.position[0] - size_a[0] * 0.5,
                    body_a.position[1] - size_a[1] * 0.5,
                    body_a.position[2] - size_a[2] * 0.5,
                ];
                let max_a = [
                    body_a.position[0] + size_a[0] * 0.5,
                    body_a.position[1] + size_a[1] * 0.5,
                    body_a.position[2] + size_a[2] * 0.5,
                ];

                let min_b = [
                    body_b.position[0] - size_b[0] * 0.5,
                    body_b.position[1] - size_b[1] * 0.5,
                    body_b.position[2] - size_b[2] * 0.5,
                ];
                let max_b = [
                    body_b.position[0] + size_b[0] * 0.5,
                    body_b.position[1] + size_b[1] * 0.5,
                    body_b.position[2] + size_b[2] * 0.5,
                ];

                if min_a[0] <= max_b[0] && max_a[0] >= min_b[0] &&
                   min_a[1] <= max_b[1] && max_a[1] >= min_b[1] &&
                   min_a[2] <= max_b[2] && max_a[2] >= min_b[2] {
                    
                    // Calcular punto de contacto y normal
                    let center_a = body_a.position;
                    let center_b = body_b.position;
                    let normal = [
                        center_b[0] - center_a[0],
                        center_b[1] - center_a[1],
                        center_b[2] - center_a[2],
                    ];

                    let length = (normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]).sqrt();
                    
                    if length > 0.0 {
                        let normalized_normal = [
                            normal[0] / length,
                            normal[1] / length,
                            normal[2] / length,
                        ];

                        let point = [
                            (center_a[0] + center_b[0]) * 0.5,
                            (center_a[1] + center_b[1]) * 0.5,
                            (center_a[2] + center_b[2]) * 0.5,
                        ];

                        return Some(Contact {
                            body_a: body_a.id,
                            body_b: body_b.id,
                            point,
                            normal: normalized_normal,
                            penetration: length,
                            impulse: 0.0,
                            friction: (body_a.material.friction + body_b.material.friction) * 0.5,
                        });
                    }
                }
            },
            _ => {
                // Otros tipos de colisionadores
            }
        }

        None
    }

    /// Resolver colisiones
    fn resolve_collisions(&mut self) -> Result<(), JsValue> {
        for contact in &self.contacts {
            if let (Some(body_a), Some(body_b)) = (self.bodies.get_mut(&contact.body_a), self.bodies.get_mut(&contact.body_b)) {
                if body_a.is_static && body_b.is_static {
                    continue;
                }

                // Resolución de penetración
                let penetration = contact.penetration;
                if penetration > 0.0 {
                    let correction = penetration * 0.5;

                    if body_a.is_static {
                        body_b.position[0] += contact.normal[0] * correction;
                        body_b.position[1] += contact.normal[1] * correction;
                        body_b.position[2] += contact.normal[2] * correction;
                    } else if body_b.is_static {
                        body_a.position[0] -= contact.normal[0] * correction;
                        body_a.position[1] -= contact.normal[1] * correction;
                        body_a.position[2] -= contact.normal[2] * correction;
                    } else {
                        body_a.position[0] -= contact.normal[0] * correction;
                        body_a.position[1] -= contact.normal[1] * correction;
                        body_a.position[2] -= contact.normal[2] * correction;

                        body_b.position[0] += contact.normal[0] * correction;
                        body_b.position[1] += contact.normal[1] * correction;
                        body_b.position[2] += contact.normal[2] * correction;
                    }
                }
            }
        }

        Ok(())
    }

    /// Obtener contactos
    pub fn get_contacts(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.contacts).unwrap_or_default()
    }

    /// Obtener configuración
    pub fn get_config(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.config).unwrap_or_default()
    }

    /// Actualizar configuración
    pub fn update_config(&mut self, config: JsValue) -> Result<(), JsValue> {
        let new_config: PhysicsConfig = serde_wasm_bindgen::from_value(config)?;
        self.config = new_config;
        Ok(())
    }

    /// Obtener estadísticas de física
    pub fn get_physics_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "total_bodies": self.bodies.len(),
            "active_bodies": self.bodies.values().filter(|b| b.enabled && !b.is_static).count(),
            "static_bodies": self.bodies.values().filter(|b| b.is_static).count(),
            "total_contacts": self.contacts.len(),
            "materials": self.materials.len(),
            "gravity": self.config.gravity,
            "time_step": self.config.time_step,
        });

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }

    /// Verificar si está inicializado
    pub fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Drop for PhysicsManager {
    fn drop(&mut self) {
        // Limpiar recursos
        self.bodies.clear();
        self.contacts.clear();
    }
} 