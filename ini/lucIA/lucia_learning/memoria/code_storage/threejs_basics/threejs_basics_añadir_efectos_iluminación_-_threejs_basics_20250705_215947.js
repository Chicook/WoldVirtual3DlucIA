/*
 * añadir efectos iluminación - Threejs Basics
 * Pregunta: ¿Cómo añadir efectos de iluminación para que el avatar se vea realista?
 * 
 * ID: threejs_basics_añadir_efectos_iluminación_-_threejs_basics_20250705_215947
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:59:47.617638
 * Actualizado: 2025-07-05T21:59:47.617638
 * 
 * Tags: scene, ambientLight, directionalLight, camera, pointLight, mesh, threejs_basics, avatar
 * Dependencias: three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';

// ... (tu código de inicialización de escena, cámara, renderer, etc.)

// Luz ambiental suave
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Color blanco, intensidad 0.2
scene.add(ambientLight);

// Luz direccional (como el sol)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Color blanco, intensidad 0.8
directionalLight.position.set(1, 2, 1); // Posición de la luz
directionalLight.castShadow = true; // Habilita la proyección de sombras
scene.add(directionalLight);

// Ajustes de sombras para la luz direccional (opcional, pero recomendado)
directionalLight.shadow.mapSize.width = 2048; // Resolución de la sombra
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5; // Ajusta estos valores según la escena
directionalLight.shadow.camera.far = 500;


// Luz puntual (como una bombilla)
const pointLight = new THREE.PointLight(0xff0000, 1, 100); // Color rojo, intensidad 1, distancia 100
pointLight.position.set(-2, 1, 2);
pointLight.castShadow = true;
scene.add(pointLight);


// Asegúrate de que tu avatar proyecte y reciba sombras:
avatar.traverse(function (child) {
    if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
    }
});


// Habilita las sombras en el renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo de sombra (PCFSoftShadowMap es suave)

// ... (resto de tu código)