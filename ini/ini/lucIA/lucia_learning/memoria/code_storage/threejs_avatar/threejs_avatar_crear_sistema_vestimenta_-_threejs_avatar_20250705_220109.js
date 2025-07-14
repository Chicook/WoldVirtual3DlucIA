/*
 * crear sistema vestimenta - Threejs Avatar
 * Pregunta: ¿Cómo crear un sistema de vestimenta intercambiable?
 * 
 * ID: threejs_avatar_crear_sistema_vestimenta_-_threejs_avatar_20250705_220109
 * Categoría: threejs_avatar
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T22:01:09.207643
 * Actualizado: 2025-07-05T22:01:09.207643
 * 
 * Tags: scene, loadCloth, changeOutfit, clothes, threejs_avatar, clothName, cloth, loader, avatar, model
 * Dependencias: three/examples/jsm/loaders/GLTFLoader.js, three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Modelo base del avatar
let avatar;

// Objeto para almacenar las prendas
const clothes = {};

// Cargar el modelo base del avatar
const loader = new GLTFLoader();
loader.load('avatar_base.glb', (gltf) => {
  avatar = gltf.scene;
  scene.add(avatar);
});

// Función para cargar una prenda
function loadCloth(clothName, clothPath) {
  loader.load(clothPath, (gltf) => {
    const cloth = gltf.scene;
    cloth.name = clothName; // Asignar un nombre para identificarla

    // Ajustar la posición y rotación de la prenda para que se adapte al avatar
    cloth.position.set(0, 0, 0); // Ajustar según sea necesario
    cloth.rotation.set(0, 0, 0); // Ajustar según sea necesario

    // Agregar la prenda al objeto 'clothes' y al avatar
    clothes[clothName] = cloth;
    avatar.add(cloth);

    // Ocultar la prenda inicialmente (opcional)
    cloth.visible = false;
  });
}

// Cargar diferentes prendas
loadCloth('camiseta', 'camiseta.glb');
loadCloth('pantalones', 'pantalones.glb');
loadCloth('vestido', 'vestido.glb');


// Función para cambiar la vestimenta
function changeOutfit(outfit) {
  // Ocultar todas las prendas
  for (const clothName in clothes) {
    clothes[clothName].visible = false;
  }

  // Mostrar las prendas del outfit especificado
  if (outfit && outfit.length > 0) {
    outfit.forEach(clothName => {
      if (clothes[clothName]) {
        clothes[clothName].visible = true;
      }
    });
  }
}

// Ejemplo de uso:
changeOutfit(['camiseta', 'pantalones']); // Mostrar camiseta y pantalones
changeOutfit(['vestido']); // Mostrar el vestido
changeOutfit([]); // Ocultar toda la ropa