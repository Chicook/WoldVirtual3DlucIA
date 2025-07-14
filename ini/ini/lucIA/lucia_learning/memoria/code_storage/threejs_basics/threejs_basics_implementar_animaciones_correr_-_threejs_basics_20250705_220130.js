/*
 * implementar animaciones correr - Threejs Basics
 * Pregunta: ¿Cómo implementar animaciones de caminar, correr y saltar?
 * 
 * ID: threejs_basics_implementar_animaciones_correr_-_threejs_basics_20250705_220130
 * Categoría: threejs_basics
 * Lenguaje: javascript
 * Autor: Lucía
 * Versión: 1.0.0
 * Creado: 2025-07-05T22:01:30.446706
 * Actualizado: 2025-07-05T22:01:30.446706
 * 
 * Tags: scene, camera, changeAnimation, animation, threejs_basics, newAction, currentAction, loader, animate, avatar, model
 * Dependencias: three/examples/jsm/loaders/GLTFLoader.js, three
 * Nivel: intermediate
 * Verificado: No
 * Cobertura de tests: 0.0%
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let avatar, mixer, actions = {}; // Guardar las acciones de animación

// Cargar el modelo con animaciones
const loader = new GLTFLoader();
loader.load('avatar_animado.glb', (gltf) => {
  avatar = gltf.scene;
  scene.add(avatar);

  // Crear AnimationMixer
  mixer = new THREE.AnimationMixer(avatar);

  // Obtener las animaciones y crear acciones
  gltf.animations.forEach((clip) => {
    actions[clip.name] = mixer.clipAction(clip);
  });

  // Reproducir la animación de idle por defecto
  actions['idle'].play();
});


// Función para cambiar de animación
function changeAnimation(newName) {
  const currentAction = Object.values(actions).find(action => action.isRunning());
  const newAction = actions[newName];

  if (currentAction && newAction) {
    currentAction.crossFadeTo(newAction, 0.3, true); // Transición suave
    newAction.play();
  }
}

// En el bucle de animación
function animate() {
  requestAnimationFrame(animate);

  // Actualizar el mixer
  if (mixer) mixer.update(clock.getDelta());

  renderer.render(scene, camera);
}

// Ejemplo de uso (con eventos de teclado o controles)
document.addEventListener('keydown', (event) => {
  if (event.key === 'w') { // Caminar
    changeAnimation('walk');
  } else if (event.key === 'shift' && actions['walk'].isRunning()) { // Correr (manteniendo shift mientras caminas)
    changeAnimation('run');
  } else if (event.key === ' ') { // Saltar
    changeAnimation('jump');
  } else if (event.key === 's'){ // Idle
    changeAnimation('idle');
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'shift' && actions['run'].isRunning()) { // Volver a caminar al soltar shift
    changeAnimation('walk');
  }
});


//  Al finalizar la animación de saltar, volver a idle o caminar/correr (según el estado previo)
actions['jump'].onLoop = function(event){
    if(event.loop === Math.floor(event.action.time/event.action.getClip().duration)){
        if (actions['walk']._previousState === THREE.LoopOnce){
            changeAnimation('walk');
        } else if (actions['run']._previousState === THREE.LoopOnce){
             changeAnimation('run');
        } else {
            changeAnimation('idle');
        }

    }
}