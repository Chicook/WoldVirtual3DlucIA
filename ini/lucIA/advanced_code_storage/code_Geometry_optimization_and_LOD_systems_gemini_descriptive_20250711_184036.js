// Código extraído de: Geometry optimization and LOD systems
// API: Gemini
// Fecha: 2025-07-11 18:40:18

// Ejemplo 1
import * as THREE from 'three';

// Cargar las diferentes versiones LOD de la malla
const lod = new THREE.LOD();

const geometryHigh = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const meshHigh = new THREE.Mesh(geometryHigh, material);
lod.addLevel(meshHigh, 0); // Visible hasta una distancia de 0

const geometryMedium = new THREE.SphereGeometry(1, 16, 16);
const meshMedium = new THREE.Mesh(geometryMedium, material);
lod.addLevel(meshMedium, 20); // Visible desde 0 hasta 20

const geometryLow = new THREE.SphereGeometry(1, 8, 8);
const meshLow = new THREE.Mesh(geometryLow, material);
lod.addLevel(meshLow, 50); // Visible desde 20 hasta 50


scene.add(lod);

// En el loop de renderizado:
lod.update(camera);

