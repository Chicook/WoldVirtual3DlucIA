/*
 * Módulo Esqueleto - Threejs Basics
 * Módulo 3: Mi Esqueleto
 * 
 * ID: threejs_basics_módulo_esqueleto_-_threejs_basics_20250705_233145
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T23:31:45.592621
 * Actualizado: 2025-07-05T23:31:45.592621
 * 
 * Tags: bones, skeletonHelper, renderer, material, bone2, skinGeo, bone1, model, ambientLight, animation, animate, threejs_basics, scene, camera, mesh, skeleton, rootBone, bone0, geometry
 * Dependencias: three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three'; // Escena, cámara y renderizador const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); const renderer = new THREE.WebGLRenderer(); renderer.setSize( window.innerWidth, window.innerHeight ); document.body.appendChild( renderer.domElement ); // Luz ambiental const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); scene.add(ambientLight); // Geometría simple para visualizar el esqueleto (puedes reemplazarla con tu modelo) const geometry = new THREE.BoxGeometry(1, 1, 1); const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); const mesh = new THREE.Mesh(geometry, material); scene.add(mesh); // Huesos const bones = []; // Hueso raíz (pelvis) const bone0 = new THREE.Bone(); // Crea el hueso bone0.position.y = -2; // Posición inicial bones.push(bone0); // Hueso torso const bone1 = new THREE.Bone(); bone1.position.y = 1; bones.push(bone1); bone0.add(bone1); // bone1 es hijo de bone0 // Hueso cabeza const bone2 = new THREE.Bone(); bone2.position.y = 1; bones.push(bone2); bone1.add(bone2); // bone2 es hijo de bone1 // SkinnedMesh const skinGeo = new THREE.SkinnedMesh(geometry, material); const rootBone = bones[0]; const skeleton = new THREE.Skeleton(bones); skinGeo.add(rootBone); // Agrega el hueso raíz a la malla skinGeo.bind(skeleton); // Vincula el esqueleto a la malla scene.add(skinGeo); //Helpers para visualizar los huesos (opcional) const skeletonHelper = new THREE.SkeletonHelper( skinGeo ); scene.add( skeletonHelper ); camera.position.z = 5; // Animación (ejemplo simple) const animate = function () { requestAnimationFrame( animate ); // Rota el hueso del torso bone1.rotation.x = Math.sin(Date.now() * 0.005) * 0.5; renderer.render( scene, camera ); }; animate();