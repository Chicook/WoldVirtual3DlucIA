/*
 * Módulo Representación - Threejs Basics
 * Módulo 4: Mi Representación
 * 
 * ID: threejs_basics_módulo_representación_-_threejs_basics_20250705_233242
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T23:32:42.403839
 * Actualizado: 2025-07-05T23:32:42.403839
 * 
 * Tags: threejs_basics, animation, mesh, camera, scene, renderer, directionalLight, textureLoader, animate, material, skinTexture, model, ambientLight, avatar, texture, loader
 * Dependencias: three, three/examples/jsm/loaders/GLTFLoader.js
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three'; import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Escena, cámara y renderizador const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); const renderer = new THREE.WebGLRenderer(); renderer.setSize( window.innerWidth, window.innerHeight ); document.body.appendChild( renderer.domElement ); // Luz ambiental const ambientLight = new THREE.AmbientLight( 0x404040 ); scene.add( ambientLight ); // Luz direccional const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 ); directionalLight.position.set( 1, 1, 1 ); scene.add( directionalLight ); // Cargar el modelo GLTF (reemplaza 'avatar.glb' con la ruta de tu modelo) const loader = new GLTFLoader(); loader.load( 'avatar.glb', function ( gltf ) { const model = gltf.scene; scene.add( model ); // Ajustar la posición/escala del modelo si es necesario model.position.y = -1; // Ejemplo: Ajustar la altura model.scale.set(0.5, 0.5, 0.5); // Ejemplo: Ajustar la escala // Recorrer los materiales del modelo y aplicar texturas/propiedades model.traverse( ( child ) => { if ( child.isMesh ) { // Ejemplo: Aplicar una textura a la piel if (child.name === "SkinMesh") { // Reemplaza "SkinMesh" con el nombre de tu mesh const textureLoader = new THREE.TextureLoader(); const skinTexture = textureLoader.load('skin.jpg'); // Reemplaza 'skin.jpg' child.material = new THREE.MeshStandardMaterial({ map: skinTexture }); } // ... Repite para otros materiales (ropa, cabello, etc.) // Optimización: activar shadow casting/receiving si es necesario child.castShadow = true; child.receiveShadow = true; } }); // Animación (loop de renderizado) function animate() { requestAnimationFrame( animate ); renderer.render( scene, camera ); } animate(); }, undefined, function ( error ) { console.error( error ); } ); // Posición de la cámara camera.position.z = 5;