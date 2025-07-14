/*
 * Módulo Formas Humanas - Threejs Basics
 * Módulo 2: Formas Humanas Básicas
 * 
 * ID: threejs_basics_módulo_formas_humanas_-_threejs_basics_20250705_233417
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T23:34:17.455786
 * Actualizado: 2025-07-05T23:34:17.455786
 * 
 * Tags: torsoMaterial, human, geometry, headGeometry, legMaterial, armMaterial, mesh, leg, legGeometry, createArm, arm, armGeometry, createHuman, threejs_basics, createLeg, torso, torsoGeometry, headMaterial, material, head
 * Dependencias: three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three'; function createHuman() { const human = new THREE.Group(); // Cabeza const headGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Radio, segmentosWidth, segmentosHeight const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 }); // Color piel const head = new THREE.Mesh(headGeometry, headMaterial); human.add(head); // Torso const torsoGeometry = new THREE.BoxGeometry(1, 1.5, 0.5); // Ancho, alto, profundidad const torsoMaterial = new THREE.MeshStandardMaterial({ color: 0x006699 }); // Color azul const torso = new THREE.Mesh(torsoGeometry, torsoMaterial); torso.position.y = -1; // Ajustar posición vertical human.add(torso); // Brazos const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 32); // Radio superior, radio inferior, altura, segmentos radiales const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 }); function createArm(side) { const arm = new THREE.Mesh(armGeometry, armMaterial); arm.position.x = side * 0.6; // Posición horizontal según el lado (izquierdo o derecho) arm.position.y = -0.5; // Posición vertical human.add(arm); } createArm(-1); // Brazo izquierdo createArm(1); // Brazo derecho // Piernas const legGeometry = new THREE.CylinderGeometry(0.2, 0.1, 1.5, 32); const legMaterial = new THREE.MeshStandardMaterial({ color: 0x663300 }); // Color marrón function createLeg(side) { const leg = new THREE.Mesh(legGeometry, legMaterial); leg.position.x = side * 0.3; leg.position.y = -2; human.add(leg); } createLeg(-1); // Pierna izquierda createLeg(1); // Pierna derecha return human; } export { createHuman };