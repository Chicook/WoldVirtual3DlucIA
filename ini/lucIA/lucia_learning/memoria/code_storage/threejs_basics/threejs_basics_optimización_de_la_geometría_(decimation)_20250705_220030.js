/*
 * Optimización de la geometría (Decimation)
 * Pregunta: ¿Cómo optimizar el rendimiento del avatar para el metaverso?
 * 
 * ID: threejs_basics_optimización_de_la_geometría_(decimation)_20250705_220030
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T22:00:30.142871
 * Actualizado: 2025-07-05T22:00:30.142871
 * 
 * Tags: scene, modifier, texture, geometry, material, mesh, matrix, dummy, threejs_basics, decimatedGeometry, instancedMesh, instances, textureLoader, i, avatar
 * Dependencias: three/examples/jsm/modifiers/SimplifyModifier.js, three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

// Optimización de la geometría (Decimation)
import * as THREE from 'three';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';

// ... tu código de inicialización ...

// Suponiendo que 'avatarGeometry' es la geometría original
const modifier = new SimplifyModifier();

const decimatedGeometry = modifier.modify( avatarGeometry, avatarGeometry.attributes.position.count * 0.5 ); // Reducir a la mitad

avatar.geometry = decimatedGeometry;


// Optimización de texturas
// Usar texturas con potencias de 2 (128x128, 256x256, 512x512, etc.)
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load( 'textura.jpg', (texture) => {
    texture.minFilter = THREE.NearestFilter; // O THREE.LinearMipMapLinearFilter para mejor calidad si se usan mipmaps
    texture.magFilter = THREE.NearestFilter; // O THREE.LinearFilter
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Ajustar la anisotropía
    // ... aplicar la textura al material ...
});

// Instanciamiento (InstancedMesh) para múltiples copias del avatar
const instances = 100; // Número de instancias

const matrix = new THREE.Matrix4();
const dummy = new THREE.Object3D();

const instancedMesh = new THREE.InstancedMesh( avatar.geometry, avatar.material, instances );

for ( let i = 0; i < instances; i ++ ) {

    dummy.position.set( Math.random() * 100 - 50, 0, Math.random() * 100 - 50 );
    dummy.rotation.set( 0, Math.random() * 2 * Math.PI, 0 );
    dummy.scale.setScalar( 0.5 + Math.random() ); // Variar la escala ligeramente
    dummy.updateMatrix();

    matrix.copy( dummy.matrix );

    instancedMesh.setMatrixAt( i, matrix );

}

scene.add( instancedMesh );