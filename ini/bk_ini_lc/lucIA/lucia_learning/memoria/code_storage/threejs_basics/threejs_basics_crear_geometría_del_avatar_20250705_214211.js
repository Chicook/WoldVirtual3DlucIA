/*
 * Crear geometría del avatar
 * Creación de avatar 3D en Three.js
 * 
 * ID: threejs_basics_crear_geometría_del_avatar_20250705_214211
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:42:11.649561
 * Actualizado: 2025-07-05T21:42:11.649561
 * 
 * Tags: mesh, avatarMaterial, threejs_basics, animateAvatar, three.js, material, scene, animation, geometry, avatar, avatarGeometry
 * Dependencias: 
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

// Crear geometría del avatar
    const avatarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    const avatarMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
    
    // Añadir a la escena
    scene.add(avatar);
    
    // Función de animación
    function animateAvatar() {
        avatar.rotation.y += 0.01;
        requestAnimationFrame(animateAvatar);
    }
    animateAvatar();