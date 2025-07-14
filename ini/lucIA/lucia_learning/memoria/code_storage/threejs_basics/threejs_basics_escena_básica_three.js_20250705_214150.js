/*
 * Escena Básica Three.js
 * Ejemplo completo de una escena básica con un cubo rotatorio
 * 
 * ID: threejs_basics_escena_básica_three.js_20250705_214150
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:41:50.540187
 * Actualizado: 2025-07-05T21:41:50.540187
 * 
 * Tags: threejs, básico, escena, cubo, animación
 * Dependencias: three
 * Nivel: beginner
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

/*
 * Ejemplos de uso:
 * 1. Aprender conceptos básicos de Three.js
 * 2. Crear primera escena 3D
 */

// Crear escena básica de Three.js
import * as THREE from 'three';

// Configurar escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear geometría
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();