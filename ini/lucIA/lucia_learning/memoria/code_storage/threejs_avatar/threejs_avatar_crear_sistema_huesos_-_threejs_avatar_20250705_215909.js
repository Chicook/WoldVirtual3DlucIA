/*
 * crear sistema huesos - Threejs Avatar
 * Pregunta: ¿Cómo crear un sistema de huesos (skeleton) para animaciones de avatar?
 * 
 * ID: threejs_avatar_crear_sistema_huesos_-_threejs_avatar_20250705_215909
 * Categoría: threejs_avatar
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:59:09.183387
 * Actualizado: 2025-07-05T21:59:09.183387
 * 
 * Tags: scene, init, loadAvatarWithSkeleton, mesh, threejs_avatar, skeleton, loader, avatar, model
 * Dependencias: three/examples/jsm/loaders/GLTFLoader.js, three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

async function loadAvatarWithSkeleton(path) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        const skeleton = model.children[0].skeleton; // Suponiendo que el primer hijo del modelo es el mesh con el esqueleto

        // Verificar que el esqueleto se cargó correctamente
        if (skeleton) {
          console.log("Esqueleto cargado:", skeleton);
          // Acceder a los huesos individualmente
          // skeleton.bones[0] // Hueso raíz
          // skeleton.bones[1] // Segundo hueso, etc.

          resolve({ model, skeleton });
        } else {
          reject("El modelo no contiene un esqueleto.");
        }
      },
      undefined,
      reject
    );
  });
}


async function init() {
  // ... (Tu código de inicialización de escena, cámara, etc.)

  try {
    const { model, skeleton } = await loadAvatarWithSkeleton('ruta/a/tu/modelo.glb');
    scene.add(model);
  } catch (error) {
    console.error("Error al cargar el modelo:", error);
  }

 // ... (Resto de tu código)
}

init();