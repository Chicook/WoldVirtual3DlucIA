// Código extraído de: Custom shaders and materials
// API: Gemini
// Fecha: 2025-07-11 21:36:59

// Ejemplo 1
import * as THREE from 'three';

// Vertex Shader
const vertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader
const fragmentShader = `
  varying vec3 vNormal;
  uniform vec3 lightDirection;
  uniform vec3 lightColor;
  uniform float shininess;

  void main() {
    float diffuse = max(dot(vNormal, lightDirection), 0.0);
    vec3 diffuseColor = diffuse * lightColor;

    vec3 reflection = reflect(-lightDirection, vNormal);
    float specular = pow(max(dot(reflection, normalize(cameraPosition)), 0.0), shininess);
    vec3 specularColor = specular * lightColor;

    gl_FragColor = vec4(diffuseColor + specularColor, 1.0);
  }
`;

// Material Personalizado
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    lightDirection: { value: new THREE.Vector3(0.5, 1.0, 0.5).normalize() },
    lightColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
    shininess: { value: 32.0 }
  }
});

// ... (resto del código Three.js para crear la escena, la geometría, etc.)

// Ejemplo 2
// Fragment Shader
uniform sampler2D dissolveTexture;
uniform float dissolveThreshold;

void main() {
    vec4 texColor = texture2D(dissolveTexture, vUv);
    if (texColor.r < dissolveThreshold) {
        discard; // Descarta el píxel si está por debajo del umbral
    }
    // ... resto del código del shader
}

