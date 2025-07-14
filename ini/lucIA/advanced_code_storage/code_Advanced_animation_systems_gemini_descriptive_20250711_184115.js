// Código extraído de: Advanced animation systems
// API: Gemini
// Fecha: 2025-07-11 18:40:58

// Ejemplo 1
// Declarar variables para el péndulo
let pendulumLength = 2;
let pendulumAngle = 0;
let pendulumAngularVelocity = 0;
let gravity = 9.8;

// En la función de actualización (animate())
function animate() {
  // Calcular la aceleración angular
  let angularAcceleration = -gravity / pendulumLength * Math.sin(pendulumAngle);

  // Actualizar la velocidad y el ángulo del péndulo
  pendulumAngularVelocity += angularAcceleration * deltaTime;
  pendulumAngle += pendulumAngularVelocity * deltaTime;

  // Aplicar la rotación al objeto del péndulo
  pendulum.rotation.z = pendulumAngle;

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

// Ejemplo 2
// Suponiendo que tienes animaciones 'walk' y 'wave' cargadas

const mixer = new THREE.AnimationMixer( model );
const walkAction = mixer.clipAction( model.animations[0] ); // 'walk'
const waveAction = mixer.clipAction( model.animations[1] ); // 'wave'

walkAction.play();
waveAction.play();
waveAction.setEffectiveWeight(0.5); // Ajustar la influencia de 'wave'

// En la función de actualización (animate())
function animate() {
  mixer.update( deltaTime ); // Actualizar el mixer

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

// Ejemplo 3
// Definir estados de animación con machina.js
const characterFSM = new machina.Fsm({
  initialState: "idle",
  states: {
    idle: {
      _onEnter: () => { playAnimation("idle"); },
      run: () => { this.transition("running"); }
    },
    running: {
      _onEnter: () => { playAnimation("run"); },
      jump: () => { this.transition("jumping"); }
    },
    // ... más estados
  }
});

// Función para reproducir animaciones en Three.js
function playAnimation(name) {
  // ... lógica para iniciar la animación correspondiente en Three.js
}

