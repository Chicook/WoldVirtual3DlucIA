//! Sistema de Colisiones para Física
//! Maneja detección y resolución de colisiones

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use super::{ColliderType, Contact};

/// AABB (Axis-Aligned Bounding Box)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AABB {
    pub min: [f32; 3],
    pub max: [f32; 3],
}

impl AABB {
    /// Crear nuevo AABB
    pub fn new(min: [f32; 3], max: [f32; 3]) -> Self {
        Self { min, max }
    }

    /// Crear AABB desde centro y tamaño
    pub fn from_center_size(center: [f32; 3], size: [f32; 3]) -> Self {
        let half_size = [size[0] * 0.5, size[1] * 0.5, size[2] * 0.5];
        Self {
            min: [center[0] - half_size[0], center[1] - half_size[1], center[2] - half_size[2]],
            max: [center[0] + half_size[0], center[1] + half_size[1], center[2] + half_size[2]],
        }
    }

    /// Verificar si intersecta con otro AABB
    pub fn intersects(&self, other: &AABB) -> bool {
        self.min[0] <= other.max[0] && self.max[0] >= other.min[0] &&
        self.min[1] <= other.max[1] && self.max[1] >= other.min[1] &&
        self.min[2] <= other.max[2] && self.max[2] >= other.min[2]
    }

    /// Obtener centro del AABB
    pub fn get_center(&self) -> [f32; 3] {
        [
            (self.min[0] + self.max[0]) * 0.5,
            (self.min[1] + self.max[1]) * 0.5,
            (self.min[2] + self.max[2]) * 0.5,
        ]
    }

    /// Obtener tamaño del AABB
    pub fn get_size(&self) -> [f32; 3] {
        [
            self.max[0] - self.min[0],
            self.max[1] - self.min[1],
            self.max[2] - self.min[2],
        ]
    }

    /// Expandir AABB
    pub fn expand(&mut self, amount: f32) {
        self.min[0] -= amount;
        self.min[1] -= amount;
        self.min[2] -= amount;
        self.max[0] += amount;
        self.max[1] += amount;
        self.max[2] += amount;
    }

    /// Unir con otro AABB
    pub fn union(&mut self, other: &AABB) {
        self.min[0] = self.min[0].min(other.min[0]);
        self.min[1] = self.min[1].min(other.min[1]);
        self.min[2] = self.min[2].min(other.min[2]);
        self.max[0] = self.max[0].max(other.max[0]);
        self.max[1] = self.max[1].max(other.max[1]);
        self.max[2] = self.max[2].max(other.max[2]);
    }
}

/// Esfera de colisión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sphere {
    pub center: [f32; 3],
    pub radius: f32,
}

impl Sphere {
    /// Crear nueva esfera
    pub fn new(center: [f32; 3], radius: f32) -> Self {
        Self { center, radius }
    }

    /// Verificar si intersecta con otra esfera
    pub fn intersects_sphere(&self, other: &Sphere) -> bool {
        let dx = self.center[0] - other.center[0];
        let dy = self.center[1] - other.center[1];
        let dz = self.center[2] - other.center[2];
        let distance_squared = dx * dx + dy * dy + dz * dz;
        let radius_sum = self.radius + other.radius;
        distance_squared <= radius_sum * radius_sum
    }

    /// Verificar si intersecta con AABB
    pub fn intersects_aabb(&self, aabb: &AABB) -> bool {
        let closest_point = [
            self.center[0].clamp(aabb.min[0], aabb.max[0]),
            self.center[1].clamp(aabb.min[1], aabb.max[1]),
            self.center[2].clamp(aabb.min[2], aabb.max[2]),
        ];

        let dx = self.center[0] - closest_point[0];
        let dy = self.center[1] - closest_point[1];
        let dz = self.center[2] - closest_point[2];
        let distance_squared = dx * dx + dy * dy + dz * dz;

        distance_squared <= self.radius * self.radius
    }
}

/// Cápsula de colisión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Capsule {
    pub start: [f32; 3],
    pub end: [f32; 3],
    pub radius: f32,
}

impl Capsule {
    /// Crear nueva cápsula
    pub fn new(start: [f32; 3], end: [f32; 3], radius: f32) -> Self {
        Self { start, end, radius }
    }

    /// Obtener centro de la cápsula
    pub fn get_center(&self) -> [f32; 3] {
        [
            (self.start[0] + self.end[0]) * 0.5,
            (self.start[1] + self.end[1]) * 0.5,
            (self.start[2] + self.end[2]) * 0.5,
        ]
    }

    /// Obtener altura de la cápsula
    pub fn get_height(&self) -> f32 {
        let dx = self.end[0] - self.start[0];
        let dy = self.end[1] - self.start[1];
        let dz = self.end[2] - self.start[2];
        (dx * dx + dy * dy + dz * dz).sqrt()
    }

    /// Obtener punto más cercano en el segmento
    pub fn get_closest_point_on_segment(&self, point: &[f32; 3]) -> [f32; 3] {
        let segment = [
            self.end[0] - self.start[0],
            self.end[1] - self.start[1],
            self.end[2] - self.start[2],
        ];

        let to_point = [
            point[0] - self.start[0],
            point[1] - self.start[1],
            point[2] - self.start[2],
        ];

        let segment_length_squared = segment[0] * segment[0] + segment[1] * segment[1] + segment[2] * segment[2];
        
        if segment_length_squared < 1e-6 {
            return self.start;
        }

        let t = (to_point[0] * segment[0] + to_point[1] * segment[1] + to_point[2] * segment[2]) / segment_length_squared;
        let t = t.clamp(0.0, 1.0);

        [
            self.start[0] + segment[0] * t,
            self.start[1] + segment[1] * t,
            self.start[2] + segment[2] * t,
        ]
    }
}

/// Detector de colisiones
#[wasm_bindgen]
pub struct CollisionDetector {
    broad_phase: BroadPhase,
    narrow_phase: NarrowPhase,
}

/// Fase amplia de detección de colisiones
#[derive(Debug, Clone)]
pub struct BroadPhase {
    pairs: Vec<(u64, u64)>,
}

impl BroadPhase {
    /// Crear nueva fase amplia
    pub fn new() -> Self {
        Self { pairs: Vec::new() }
    }

    /// Actualizar pares de colisión
    pub fn update(&mut self, bodies: &HashMap<u64, super::RigidBody>) {
        self.pairs.clear();
        let body_ids: Vec<u64> = bodies.keys().copied().collect();

        for i in 0..body_ids.len() {
            for j in (i + 1)..body_ids.len() {
                let body_a_id = body_ids[i];
                let body_b_id = body_ids[j];

                if let (Some(body_a), Some(body_b)) = (bodies.get(&body_a_id), bodies.get(&body_b_id)) {
                    if body_a.enabled && body_b.enabled {
                        let aabb_a = self.get_aabb_from_body(body_a);
                        let aabb_b = self.get_aabb_from_body(body_b);

                        if aabb_a.intersects(&aabb_b) {
                            self.pairs.push((body_a_id, body_b_id));
                        }
                    }
                }
            }
        }
    }

    /// Obtener AABB de un cuerpo
    fn get_aabb_from_body(&self, body: &super::RigidBody) -> AABB {
        match &body.collider {
            ColliderType::Box { size } => {
                AABB::from_center_size(body.position, *size)
            },
            ColliderType::Sphere { radius } => {
                let size = [radius * 2.0, radius * 2.0, radius * 2.0];
                AABB::from_center_size(body.position, size)
            },
            ColliderType::Capsule { radius, height } => {
                let size = [radius * 2.0, height, radius * 2.0];
                AABB::from_center_size(body.position, size)
            },
            ColliderType::Cylinder { radius, height } => {
                let size = [radius * 2.0, height, radius * 2.0];
                AABB::from_center_size(body.position, size)
            },
            ColliderType::Mesh { vertices, .. } => {
                if vertices.is_empty() {
                    return AABB::new([0.0, 0.0, 0.0], [0.0, 0.0, 0.0]);
                }

                let mut min = vertices[0];
                let mut max = vertices[0];

                for vertex in vertices {
                    min[0] = min[0].min(vertex[0]);
                    min[1] = min[1].min(vertex[1]);
                    min[2] = min[2].min(vertex[2]);
                    max[0] = max[0].max(vertex[0]);
                    max[1] = max[1].max(vertex[1]);
                    max[2] = max[2].max(vertex[2]);
                }

                AABB::new(min, max)
            },
        }
    }

    /// Obtener pares de colisión
    pub fn get_pairs(&self) -> &Vec<(u64, u64)> {
        &self.pairs
    }
}

/// Fase estrecha de detección de colisiones
#[derive(Debug, Clone)]
pub struct NarrowPhase {
    contacts: Vec<Contact>,
}

impl NarrowPhase {
    /// Crear nueva fase estrecha
    pub fn new() -> Self {
        Self { contacts: Vec::new() }
    }

    /// Detectar colisiones entre pares
    pub fn detect_collisions(&mut self, pairs: &[(u64, u64)], bodies: &HashMap<u64, super::RigidBody>) {
        self.contacts.clear();

        for &(body_a_id, body_b_id) in pairs {
            if let (Some(body_a), Some(body_b)) = (bodies.get(&body_a_id), bodies.get(&body_b_id)) {
                if let Some(contact) = self.check_collision(body_a, body_b) {
                    self.contacts.push(contact);
                }
            }
        }
    }

    /// Verificar colisión entre dos cuerpos
    fn check_collision(&self, body_a: &super::RigidBody, body_b: &super::RigidBody) -> Option<Contact> {
        match (&body_a.collider, &body_b.collider) {
            (ColliderType::Box { size: size_a }, ColliderType::Box { size: size_b }) => {
                self.box_vs_box(body_a, size_a, body_b, size_b)
            },
            (ColliderType::Sphere { radius: radius_a }, ColliderType::Sphere { radius: radius_b }) => {
                self.sphere_vs_sphere(body_a, *radius_a, body_b, *radius_b)
            },
            (ColliderType::Box { size }, ColliderType::Sphere { radius }) => {
                self.box_vs_sphere(body_a, size, body_b, *radius)
            },
            (ColliderType::Sphere { radius }, ColliderType::Box { size }) => {
                self.box_vs_sphere(body_b, size, body_a, *radius)
            },
            _ => None,
        }
    }

    /// Colisión caja vs caja
    fn box_vs_box(&self, body_a: &super::RigidBody, size_a: &[f32; 3], body_b: &super::RigidBody, size_b: &[f32; 3]) -> Option<Contact> {
        let aabb_a = AABB::from_center_size(body_a.position, *size_a);
        let aabb_b = AABB::from_center_size(body_b.position, *size_b);

        if !aabb_a.intersects(&aabb_b) {
            return None;
        }

        // Calcular penetración en cada eje
        let penetration_x = (aabb_a.max[0] - aabb_a.min[0] + aabb_b.max[0] - aabb_b.min[0]) * 0.5 - (body_b.position[0] - body_a.position[0]).abs();
        let penetration_y = (aabb_a.max[1] - aabb_a.min[1] + aabb_b.max[1] - aabb_b.min[1]) * 0.5 - (body_b.position[1] - body_a.position[1]).abs();
        let penetration_z = (aabb_a.max[2] - aabb_a.min[2] + aabb_b.max[2] - aabb_b.min[2]) * 0.5 - (body_b.position[2] - body_a.position[2]).abs();

        if penetration_x <= 0.0 || penetration_y <= 0.0 || penetration_z <= 0.0 {
            return None;
        }

        // Encontrar el eje con menor penetración
        let (penetration, normal) = if penetration_x < penetration_y && penetration_x < penetration_z {
            (penetration_x, [if body_b.position[0] > body_a.position[0] { -1.0 } else { 1.0 }, 0.0, 0.0])
        } else if penetration_y < penetration_z {
            (penetration_y, [0.0, if body_b.position[1] > body_a.position[1] { -1.0 } else { 1.0 }, 0.0])
        } else {
            (penetration_z, [0.0, 0.0, if body_b.position[2] > body_a.position[2] { -1.0 } else { 1.0 }])
        };

        let point = [
            (body_a.position[0] + body_b.position[0]) * 0.5,
            (body_a.position[1] + body_b.position[1]) * 0.5,
            (body_a.position[2] + body_b.position[2]) * 0.5,
        ];

        Some(Contact {
            body_a: body_a.id,
            body_b: body_b.id,
            point,
            normal,
            penetration,
            impulse: 0.0,
            friction: (body_a.material.friction + body_b.material.friction) * 0.5,
        })
    }

    /// Colisión esfera vs esfera
    fn sphere_vs_sphere(&self, body_a: &super::RigidBody, radius_a: f32, body_b: &super::RigidBody, radius_b: f32) -> Option<Contact> {
        let dx = body_b.position[0] - body_a.position[0];
        let dy = body_b.position[1] - body_a.position[1];
        let dz = body_b.position[2] - body_a.position[2];
        let distance_squared = dx * dx + dy * dy + dz * dz;
        let radius_sum = radius_a + radius_b;

        if distance_squared > radius_sum * radius_sum {
            return None;
        }

        let distance = distance_squared.sqrt();
        let penetration = radius_sum - distance;

        let normal = if distance > 1e-6 {
            [dx / distance, dy / distance, dz / distance]
        } else {
            [1.0, 0.0, 0.0]
        };

        let point = [
            body_a.position[0] + normal[0] * radius_a,
            body_a.position[1] + normal[1] * radius_a,
            body_a.position[2] + normal[2] * radius_a,
        ];

        Some(Contact {
            body_a: body_a.id,
            body_b: body_b.id,
            point,
            normal,
            penetration,
            impulse: 0.0,
            friction: (body_a.material.friction + body_b.material.friction) * 0.5,
        })
    }

    /// Colisión caja vs esfera
    fn box_vs_sphere(&self, box_body: &super::RigidBody, box_size: &[f32; 3], sphere_body: &super::RigidBody, sphere_radius: f32) -> Option<Contact> {
        let aabb = AABB::from_center_size(box_body.position, *box_size);
        let sphere = Sphere::new(sphere_body.position, sphere_radius);

        if !sphere.intersects_aabb(&aabb) {
            return None;
        }

        // Encontrar el punto más cercano en la caja a la esfera
        let closest_point = [
            sphere.center[0].clamp(aabb.min[0], aabb.max[0]),
            sphere.center[1].clamp(aabb.min[1], aabb.max[1]),
            sphere.center[2].clamp(aabb.min[2], aabb.max[2]),
        ];

        let dx = sphere.center[0] - closest_point[0];
        let dy = sphere.center[1] - closest_point[1];
        let dz = sphere.center[2] - closest_point[2];
        let distance_squared = dx * dx + dy * dy + dz * dz;

        if distance_squared > sphere_radius * sphere_radius {
            return None;
        }

        let distance = distance_squared.sqrt();
        let penetration = sphere_radius - distance;

        let normal = if distance > 1e-6 {
            [dx / distance, dy / distance, dz / distance]
        } else {
            [1.0, 0.0, 0.0]
        };

        Some(Contact {
            body_a: box_body.id,
            body_b: sphere_body.id,
            point: closest_point,
            normal,
            penetration,
            impulse: 0.0,
            friction: (box_body.material.friction + sphere_body.material.friction) * 0.5,
        })
    }

    /// Obtener contactos
    pub fn get_contacts(&self) -> &Vec<Contact> {
        &self.contacts
    }
}

#[wasm_bindgen]
impl CollisionDetector {
    /// Crear nuevo detector de colisiones
    pub fn new() -> Self {
        Self {
            broad_phase: BroadPhase::new(),
            narrow_phase: NarrowPhase::new(),
        }
    }

    /// Detectar colisiones
    pub fn detect_collisions(&mut self, bodies: &HashMap<u64, super::RigidBody>) -> JsValue {
        self.broad_phase.update(bodies);
        self.narrow_phase.detect_collisions(self.broad_phase.get_pairs(), bodies);
        
        serde_wasm_bindgen::to_value(self.narrow_phase.get_contacts()).unwrap_or_default()
    }

    /// Obtener estadísticas
    pub fn get_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "broad_phase_pairs": self.broad_phase.pairs.len(),
            "narrow_phase_contacts": self.narrow_phase.contacts.len(),
        });

        serde_wasm_bindgen::to_value(&stats).unwrap_or_default()
    }
} 