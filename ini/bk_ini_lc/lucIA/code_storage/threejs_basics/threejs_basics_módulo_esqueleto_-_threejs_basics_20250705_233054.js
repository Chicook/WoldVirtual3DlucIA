/*
 * Módulo Esqueleto - Threejs Basics
 * Módulo 3: Mi Esqueleto
 * 
 * ID: threejs_basics_módulo_esqueleto_-_threejs_basics_20250705_233054
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T23:30:54.663680
 * Actualizado: 2025-07-05T23:30:54.663680
 * 
 * Tags: animate, renderer, material, threejs_basics, geometry, skeleton, camera, animation, boneHip, boneHead, bones, skinMesh, boneTorso, scene, mesh
 * Dependencias: three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three'; // desarrollar la escena, cámara y renderizador (asumo que ya tienes esto configurado) const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); const renderer = new THREE.WebGLRenderer(); renderer.setSize( window.innerWidth, window.innerHeight ); document.body.appendChild( renderer.domElement ); // desarrollar el esqueleto (Bones) const bones = []; // Hueso de la cadera (root) const boneHip = new THREE.Bone(); bones.push(boneHip); // Hueso del torso const boneTorso = new THREE.Bone(); boneTorso.position.y = 1; // Posición relativa a la cadera bones.push(boneTorso); boneHip.add(boneTorso); // Agregar el torso como hijo de la cadera // Hueso de la cabeza const boneHead = new THREE.Bone(); boneHead.position.y = 1; // Posición relativa al torso bones.push(boneHead); boneTorso.add(boneHead); // Agregar la cabeza como hijo del torso // desarrollar un SkinnedMesh (malla que se deformará con el esqueleto) const geometry = new THREE.BoxGeometry(1, 1, 1); // Geometría simple de ejemplo const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ); // SkinnedMesh necesita un array de huesos y un array de influencias (pesos) const skinMesh = new THREE.SkinnedMesh( geometry, material ); const skeleton = new THREE.Skeleton( bones ); skinMesh.add( boneHip ); // Agregar el hueso raíz al SkinnedMesh skinMesh.bind( skeleton ); // Vincular el esqueleto al SkinnedMesh scene.add( skinMesh ); camera.position.z = 5; // Función de animación function animate() { requestAnimationFrame( animate ); // Ejemplo de rotación del hueso del torso boneTorso.rotation.x += 0.01; renderer.render( scene, camera ); } animate();