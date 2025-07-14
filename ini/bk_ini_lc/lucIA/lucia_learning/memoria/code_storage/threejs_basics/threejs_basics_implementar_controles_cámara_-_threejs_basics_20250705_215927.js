/*
 * implementar controles cámara - Threejs Basics
 * Pregunta: ¿Cómo implementar controles de cámara para ver el avatar desde diferentes ángulos?
 * 
 * ID: threejs_basics_implementar_controles_cámara_-_threejs_basics_20250705_215927
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:59:27.547595
 * Actualizado: 2025-07-05T21:59:27.547595
 * 
 * Tags: scene, camera, controls, animation, threejs_basics, animate, avatar
 * Dependencias: three/examples/jsm/controls/OrbitControls.js, three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ... (Tu código de inicialización de escena, cámara, renderer, etc.)

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0); // Ajusta el punto objetivo (ej. la posición del avatar)
controls.update(); // Actualiza los controles

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Actualiza los controles en cada frame
  renderer.render(scene, camera);
}

animate();