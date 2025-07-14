/*
 * crear geometrías básicas - Threejs Basics
 * Pregunta: ¿Cómo crear geometrías básicas para un avatar humano en Three.js?
 * 
 * ID: threejs_basics_crear_geometrías_básicas_-_threejs_basics_20250705_215813
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:58:13.626980
 * Actualizado: 2025-07-05T21:58:13.626980
 * 
 * Tags: headGeometry, leftArmGeometry, material, mesh, threejs_basics, avatar, scene, geometry, rightArmGeometry, three.js, rightArm, createAvatar, leftArm, head, torso, leftLeg, createBodyPart, torsoGeometry, legGeometry, rightLeg
 * Dependencias: three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';

function createBodyPart(geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function createAvatar() {
  const avatar = new THREE.Group();

  // Material (puedes personalizarlo)
  const material = new THREE.MeshStandardMaterial({ color: 0x808080 });

  // Cabeza (SphereGeometry)
  const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const head = createBodyPart(headGeometry, material);
  avatar.add(head);

  // Torso (BoxGeometry)
  const torsoGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
  const torso = createBodyPart(torsoGeometry, material);
  torso.position.y = -1; // Posicion debajo de la cabeza
  avatar.add(torso);

  // Brazo izquierdo
  const leftArmGeometry = new THREE.BoxGeometry(0.25, 1, 0.25);
  const leftArm = createBodyPart(leftArmGeometry, material);
  leftArm.position.set(-0.75, -0.5, 0); // Posición relativa al torso
  avatar.add(leftArm);

  // Brazo derecho (similar al izquierdo, cambiando la posición x)
  const rightArmGeometry = new THREE.BoxGeometry(0.25, 1, 0.25);
  const rightArm = createBodyPart(rightArmGeometry, material);
  rightArm.position.set(0.75, -0.5, 0);
  avatar.add(rightArm);


  // Piernas (similar a los brazos, ajustando posición y dimensiones)
  const legGeometry = new THREE.BoxGeometry(0.25, 1.25, 0.25);
  const leftLeg = createBodyPart(legGeometry, material);
  leftLeg.position.set(-0.3, -2, 0);
  avatar.add(leftLeg);

  const rightLeg = createBodyPart(legGeometry, material);
  rightLeg.position.set(0.3, -2, 0);
  avatar.add(rightLeg);


  return avatar;
}


// Ejemplo de uso:
const avatar = createAvatar();
scene.add(avatar);