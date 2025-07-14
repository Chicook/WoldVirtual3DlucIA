/*
 * crear sistema gestos - Threejs Basics
 * Pregunta: ¿Cómo crear un sistema de gestos y expresiones faciales?
 * 
 * ID: threejs_basics_crear_sistema_gestos_-_threejs_basics_20250705_220007
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T22:00:07.717113
 * Actualizado: 2025-07-05T22:00:07.717113
 * 
 * Tags: scene, neutralTargetIndex, smileInfluence, camera, geometry, animation, smileTargetIndex, threejs_basics, animate, avatar, model
 * Dependencias: three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';
// ... (tu código de inicialización de escena, cámara, etc.)

// Suponiendo que tu modelo tiene morph targets cargados desde un formato como glTF
// avatar.geometry.morphAttributes.position contiene los datos de los morph targets

// Ejemplo: Cambiar entre dos morph targets (neutral y sonrisa)
const neutralTargetIndex = 0; // Índice del morph target neutral
const smileTargetIndex = 1; // Índice del morph target sonrisa

let smileInfluence = 0;

function animate() {
  requestAnimationFrame(animate);

  // Animación simple de la sonrisa (puedes usar cualquier lógica aquí)
  smileInfluence = Math.sin(Date.now() * 0.001) * 0.5 + 0.5;

  // Aplica la influencia a los morph targets
  avatar.morphTargetInfluences[neutralTargetIndex] = 1 - smileInfluence;
  avatar.morphTargetInfluences[smileTargetIndex] = smileInfluence;

  renderer.render(scene, camera);
}

animate();