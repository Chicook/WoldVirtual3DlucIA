/*
 * aplicar materiales texturas - Threejs Basics
 * Pregunta: ¿Cómo aplicar materiales y texturas realistas a un avatar 3D?
 * 
 * ID: threejs_basics_aplicar_materiales_texturas_-_threejs_basics_20250705_215832
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:58:32.026149
 * Actualizado: 2025-07-05T21:58:32.026149
 * 
 * Tags: scene, loadTexture, clothesTexture, init, createAvatarMaterialized, eyeTexture, eyeMaterial, skinTexture, clothesMaterial, texture, material, mesh, threejs_basics, skinMaterial, textureLoader, avatar
 * Dependencias: three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';
import { TextureLoader } from 'three';

// Función para cargar texturas (reutilizable)
async function loadTexture(path) {
  const textureLoader = new TextureLoader();
  return new Promise((resolve, reject) => {
    textureLoader.load(path, resolve, undefined, reject);
  });
}


async function createAvatarMaterialized() {

    const skinTexture = await loadTexture('ruta/a/textura/piel.jpg'); //  <-  Ruta a tu textura
    const eyeTexture = await loadTexture('ruta/a/textura/ojos.jpg'); //  <-  Ruta a tu textura
    const clothesTexture = await loadTexture('ruta/a/textura/ropa.jpg'); //  <-  Ruta a tu textura


  const avatar = new THREE.Group();

  // Material de la piel
  const skinMaterial = new THREE.MeshStandardMaterial({
    map: skinTexture, // Aplicamos la textura de piel
    roughness: 0.8, // Ajusta la rugosidad
    metalness: 0.1, // Ajusta la metalicidad
  });

  // Material de los ojos
  const eyeMaterial = new THREE.MeshStandardMaterial({
    map: eyeTexture,
    roughness: 0.1, // Ojos más suaves
    metalness: 0.0,
  });

  // Material de la ropa
  const clothesMaterial = new THREE.MeshStandardMaterial({
    map: clothesTexture,
    roughness: 0.5,
    metalness: 0.0,
  });


  // ... (Código para crear la geometría del avatar -  reutilizar el del ejemplo anterior) ...

  // Aplicar los materiales a las partes del cuerpo
  head.material = skinMaterial;
  // ... crea la geometría de los ojos y aplica eyeMaterial
  torso.material = clothesMaterial;
  leftArm.material = skinMaterial;
  // ... y así sucesivamente para el resto de las partes

  return avatar;
}

// Ejemplo de uso:
async function init() {
    const avatar = await createAvatarMaterialized();
    scene.add(avatar);
}

init();