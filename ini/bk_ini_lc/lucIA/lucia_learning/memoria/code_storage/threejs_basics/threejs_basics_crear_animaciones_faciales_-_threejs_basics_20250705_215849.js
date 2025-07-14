/*
 * crear animaciones faciales - Threejs Basics
 * Pregunta: ¿Cómo crear animaciones faciales y corporales para un avatar 3D?
 * 
 * ID: threejs_basics_crear_animaciones_faciales_-_threejs_basics_20250705_215849
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:58:49.487537
 * Actualizado: 2025-07-05T21:58:49.487537
 * 
 * Tags: scene, action, init, loadAnimatedModel, camera, animations, animation, threejs_basics, mixer, loader, animate, avatar, model
 * Dependencias: three/examples/jsm/loaders/GLTFLoader.js, three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Función para cargar un modelo animado (GLTF/GLB)
async function loadAnimatedModel(path) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(path, (gltf) => {
      const model = gltf.scene;
      const animations = gltf.animations;
      resolve({ model, animations });
    }, undefined, reject);
  });
}

async function init() {
  // ... (Tu código de inicialización de escena, cámara, etc.)

  // Carga el modelo animado
  const { model, animations } = await loadAnimatedModel('ruta/a/tu/modelo.glb');
  scene.add(model);

  // Crea el AnimationMixer
  const mixer = new THREE.AnimationMixer(model);

  // Reproduce una animación específica (si la hay)
  if (animations && animations.length > 0) {
    const action = mixer.clipAction(animations[0]); // Primera animación
    action.play();
  }

  // Función de animación (loop)
  const animate = () => {
    requestAnimationFrame(animate);
    mixer.update(clock.getDelta()); // Actualiza el mixer
    renderer.render(scene, camera);
  };

  animate();
}

init();