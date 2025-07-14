/*
 * Módulo Formas Humanas - Threejs Basics
 * Módulo 2: Formas Humanas Básicas
 * 
 * ID: threejs_basics_módulo_formas_humanas_-_threejs_basics_20250705_214518
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:45:18.915731
 * Actualizado: 2025-07-05T21:45:18.915731
 * 
 * Tags: scene, rightLeg, controls, rightArm, leftArm, mesh, body, head, headGeometry, directionalLight, animate, ambientLight, leftLeg, headMaterial, bodyGeometry, renderer, material, legGeometry, geometry, threejs_basics, legMaterial, bodyMaterial, armMaterial, armGeometry, camera, animation
 * Dependencias: three/examples/jsm/controls/OrbitControls.js, three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Controles de cámara
const controls = new OrbitControls( camera, renderer.domElement );

// Luz ambiental
const ambientLight = new THREE.AmbientLight( 0x404040 ); // Luz suave
scene.add( ambientLight );

// Luz direccional
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 1, 1, 1 );
scene.add( directionalLight );


// Cuerpo
const bodyGeometry = new THREE.CylinderGeometry( 0.5, 0.5, 1.5, 16 ); // torso
const bodyMaterial = new THREE.MeshStandardMaterial( { color: 0x8d5524 } ); // piel
const body = new THREE.Mesh( bodyGeometry, bodyMaterial );
scene.add( body );


// Cabeza
const headGeometry = new THREE.SphereGeometry( 0.5, 32, 32 );
const headMaterial = new THREE.MeshStandardMaterial( { color: 0xffdbac } );
const head = new THREE.Mesh( headGeometry, headMaterial );
head.position.y = 1.25; // Posición de la cabeza sobre el torso
scene.add( head );


// Brazos
const armGeometry = new THREE.CylinderGeometry( 0.15, 0.15, 1, 8 );
const armMaterial = new THREE.MeshStandardMaterial( { color: 0x8d5524 } );

const leftArm = new THREE.Mesh( armGeometry, armMaterial );
leftArm.position.x = -0.75;
leftArm.position.y = 0.5;
scene.add( leftArm );

const rightArm = new THREE.Mesh( armGeometry, armMaterial );
rightArm.position.x = 0.75;
rightArm.position.y = 0.5;
scene.add( rightArm );

// Piernas
const legGeometry = new THREE.CylinderGeometry( 0.2, 0.2, 1.5, 8 );
const legMaterial = new THREE.MeshStandardMaterial( { color: 0x2e86ab } ); // azul

const leftLeg = new THREE.Mesh( legGeometry, legMaterial );
leftLeg.position.x = -0.3;
leftLeg.position.y = -1.25;
scene.add( leftLeg );

const rightLeg = new THREE.Mesh( legGeometry, legMaterial );
rightLeg.position.x = 0.3;
rightLeg.position.y = -1.25;
scene.add( rightLeg );


camera.position.z = 5;

// Renderizado
function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

animate();