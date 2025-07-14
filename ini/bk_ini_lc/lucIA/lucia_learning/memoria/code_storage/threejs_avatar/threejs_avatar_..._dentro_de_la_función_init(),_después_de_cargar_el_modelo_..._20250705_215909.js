/*
 * ... dentro de la función init(), después de cargar el modelo ...
 * Pregunta: ¿Cómo crear un sistema de huesos (skeleton) para animaciones de avatar?
 * 
 * ID: threejs_avatar_..._dentro_de_la_función_init(),_después_de_cargar_el_modelo_..._20250705_215909
 * Categoría: threejs_avatar
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T21:59:09.198348
 * Actualizado: 2025-07-05T21:59:09.198348
 * 
 * Tags: brazoIzquierdo, avatar, threejs_avatar, model
 * Dependencias: 
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

// ... dentro de la función init(), después de cargar el modelo ...

// Rotar el brazo izquierdo 45 grados en el eje X
const brazoIzquierdo = skeleton.getBoneByName("brazo_izquierdo"); // Reemplaza con el nombre real del hueso
if (brazoIzquierdo) {
  brazoIzquierdo.rotation.x = THREE.MathUtils.degToRad(45);
}