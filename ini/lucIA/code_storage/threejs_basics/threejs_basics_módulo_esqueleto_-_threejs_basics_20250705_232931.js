/*
 * Módulo Esqueleto - Threejs Basics
 * Módulo 3: Mi Esqueleto
 * 
 * ID: threejs_basics_módulo_esqueleto_-_threejs_basics_20250705_232931
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T23:29:31.443956
 * Actualizado: 2025-07-05T23:29:31.443956
 * 
 * Tags: animation, leftArmBone, vertexIndex, bones, skinIndices, i, renderer, torsoBone, scene, geometry, camera, pelvisBone, threejs_basics, rightArmBone, animate, skinWeights, skeleton, mesh, material, headBone
 * Dependencias: three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three'; // Crear la escena, cámara y renderizador (asumo que ya tienes esto configurado) const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); const renderer = new THREE.WebGLRenderer(); renderer.setSize( window.innerWidth, window.innerHeight ); document.body.appendChild( renderer.domElement ); // desarrollar el esqueleto const bones = []; // Hueso raíz (pelvis) const pelvisBone = new THREE.Bone(); bones.push( pelvisBone ); // Hueso del torso const torsoBone = new THREE.Bone(); torsoBone.position.y = 1; // Posición relativa al pelvisBone bones.push( torsoBone ); pelvisBone.add( torsoBone ); // Conectar torso al pelvis // Hueso de la cabeza const headBone = new THREE.Bone(); headBone.position.y = 1; // Posición relativa al torsoBone bones.push( headBone ); torsoBone.add( headBone ); // Hueso del brazo izquierdo const leftArmBone = new THREE.Bone(); leftArmBone.position.x = -0.5; // Posición relativa al torsoBone leftArmBone.position.y = 0.8; bones.push( leftArmBone ); torsoBone.add( leftArmBone ); // Hueso del brazo derecho (similar al izquierdo) const rightArmBone = new THREE.Bone(); rightArmBone.position.x = 0.5; rightArmBone.position.y = 0.8; bones.push( rightArmBone ); torsoBone.add( rightArmBone ); // desarrollar un SkinnedMesh (malla que se deformará con el esqueleto) const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 ); // Geometría simple para visualizar los huesos const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ); // desarrollar un array de influencias para la piel. En este caso simple, cada vértice es influenciado por un solo hueso. const skinIndices = []; const skinWeights = []; for (let i = 0; i < geometry.attributes.position.count; i++) { const vertexIndex = Math.floor(i / 3) % bones.length; // Asignar un hueso a cada vértice (simplificado) skinIndices.push(vertexIndex, 0, 0); skinWeights.push(1, 0, 0); } geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 3 ) ); geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 3 ) ); const mesh = new THREE.SkinnedMesh( geometry, material ); const skeleton = new THREE.Skeleton( bones ); mesh.add( bones[ 0 ] ); // Agregar el hueso raíz a la malla mesh.bind( skeleton ); scene.add( mesh ); camera.position.z = 5; // Render loop function animate() { requestAnimationFrame( animate ); renderer.render( scene, camera ); } animate();