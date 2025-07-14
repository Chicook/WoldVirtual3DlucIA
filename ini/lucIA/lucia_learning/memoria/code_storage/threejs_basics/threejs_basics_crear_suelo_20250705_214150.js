/*
 * Crear suelo
 * Creación de avatar 3D en Three.js
 * 
 * ID: threejs_basics_crear_suelo_20250705_214150
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:41:50.584081
 * Actualizado: 2025-07-05T21:41:50.584081
 * 
 * Tags: material, groundMaterial, avatar, three.js, threejs_basics, ground, scene, groundGeometry, geometry, mesh
 * Dependencias: 
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

// Crear suelo
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);