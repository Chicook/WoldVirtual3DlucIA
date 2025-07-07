/*
 * Módulo Mundo Virtual - Threejs Basics
 * Módulo 5: Mi Mundo Virtual
 * 
 * ID: threejs_basics_módulo_mundo_virtual_-_threejs_basics_20250705_233313
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T23:33:13.362093
 * Actualizado: 2025-07-05T23:33:13.362093
 * 
 * Tags: ambientLight, groundGeometry, intersects, renderer, raycaster, threejs_basics, mesh, directionalLight, geometry, cube, ground, groundMaterial, animation, scene, material, camera, animate, controls, mouse, i, cubeGeometry, cubeMaterial
 * Dependencias: three/examples/jsm/controls/OrbitControls.js, three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three'; import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Escena const scene = new THREE.Scene(); scene.background = new THREE.Color(0x87ceeb); // Cielo azul // Cámara const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); camera.position.set(0, 5, 10); // Renderizador const renderer = new THREE.WebGLRenderer(); renderer.setSize(window.innerWidth, window.innerHeight); document.body.appendChild(renderer.domElement); // Controles de órbita (para navegar con el mouse) const controls = new OrbitControls(camera, renderer.domElement); // Suelo const groundGeometry = new THREE.PlaneGeometry(20, 20); const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 }); // Verde const ground = new THREE.Mesh(groundGeometry, groundMaterial); ground.rotation.x = -Math.PI / 2; // Rotar para que sea horizontal scene.add(ground); // Cubo (ejemplo de objeto interactivo) const cubeGeometry = new THREE.BoxGeometry(1, 1, 1); const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Rojo const cube = new THREE.Mesh(cubeGeometry, cubeMaterial); cube.position.set(3, 0.5, 0); scene.add(cube); // Luz ambiental const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz suave general scene.add(ambientLight); // Luz direccional (como el sol) const directionalLight = new THREE.DirectionalLight(0xffffff, 1); directionalLight.position.set(5, 10, 5); scene.add(directionalLight); // Raycaster para la interacción const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2(); window.addEventListener('click', (event) => { mouse.x = (event.clientX / window.innerWidth) * 2 - 1; mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; raycaster.setFromCamera(mouse, camera); const intersects = raycaster.intersectObjects(scene.children); for (let i = 0; i < intersects.length; i++) { if (intersects[i].object === cube) { // Si se hace clic en el cubo intersects[i].object.material.color.set(0x0000ff); // Cambiar color a azul console.log("¡Clic en el cubo!"); } } }); // Animación (loop de renderizado) function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); } animate(); // Ajustar al redimensionar la ventana window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });