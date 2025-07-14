// Código extraído de: Custom shaders and materials
// API: Gemini
// Fecha: 2025-07-11 21:39:29

// Ejemplo 1
import * as THREE from 'three';

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.y += sin(time + position.x * 10.0) * 0.1; // Efecto de onda
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment Shader
const fragmentShader = `
  uniform float time;
  varying vec2 vUv;

  void main() {
    vec3 color = vec3(0.5 + 0.5 * sin(time + vUv.x * 5.0), 0.0, 0.5 + 0.5 * cos(time + vUv.y * 5.0));
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Material Personalizado
const customMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

// ... (resto del código Three.js para crear la escena, geometría, etc.)

// En el loop de animación:
function animate() {
  // ...
  customMaterial.uniforms.time.value += 0.01; // Actualizar el tiempo
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

