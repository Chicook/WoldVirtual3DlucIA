/*
 * Crear geometría del avatar
 * Creación de avatar 3D en Three.js
 * 
 * ID: threejs_basics_crear_geometría_del_avatar_20250705_214109
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:41:09.514332
 * Actualizado: 2025-07-05T21:41:09.514332
 * 
 * Tags: material, mesh, threejs_basics, animateAvatar, geometry, avatarMaterial, avatar, avatarGeometry, scene, three.js, animation
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