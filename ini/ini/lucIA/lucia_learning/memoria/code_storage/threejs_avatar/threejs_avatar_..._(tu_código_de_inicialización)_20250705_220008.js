/*
 * ... (tu código de inicialización)
 * Pregunta: ¿Cómo crear un sistema de gestos y expresiones faciales?
 * 
 * ID: threejs_avatar_..._(tu_código_de_inicialización)_20250705_220008
 * Categoría: threejs_avatar
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T22:00:08.314877
 * Actualizado: 2025-07-05T22:00:08.314877
 * 
 * Tags: boneMano, avatar, animate, threejs_avatar
 * Dependencias: 
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

// ... (tu código de inicialización)

// Suponiendo que 'avatar' tiene un esqueleto cargado
const boneMano = avatar.skeleton.bones.find(bone => bone.name === 'Mano');

function animate() {
  // ...

  // Rotar la mano (ejemplo)
  boneMano.rotation.x = Math.sin(Date.now() * 0.002);

  // ...
}