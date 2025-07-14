// Código extraído de: Custom shaders and materials
// API: Gemini
// Fecha: 2025-07-11 18:38:59

// Ejemplo 1
import * as THREE from 'three';

const myMaterial = new THREE.ShaderMaterial({
  uniforms: {
    u_time: { value: 0.0 }, // Ejemplo de uniform
    u_color: { value: new THREE.Color('blue') }
  },
  vertexShader: `
    varying vec2 vUv; // Pasamos las coordenadas de textura al fragment shader

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float u_time;
    uniform vec3 u_color;
    varying vec2 vUv;

    void main() {
      vec3 color = u_color * (1.0 + sin(u_time + vUv.x * 10.0) * 0.5); // Efecto de onda
      gl_FragColor = vec4(color, 1.0);
    }
  `
});

// Ejemplo 2
// ... (código anterior)

uniforms: {
  // ...
  u_dissolveThreshold: { value: 0.0 } // Control de la disolución
},

fragmentShader: `
  // ...
  uniform float u_dissolveThreshold;

  void main() {
    // ...
    if (vUv.y < u_dissolveThreshold) {
      discard; // Descartamos el fragmento si está por debajo del umbral
    }
    // ...
  }
`

// En el loop de animación:
myMaterial.uniforms.u_dissolveThreshold.value += 0.01;

