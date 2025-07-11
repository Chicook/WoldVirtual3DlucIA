// Código extraído de: Custom shaders and materials
// API: Claude
// Fecha: 2025-07-11 21:37:18

// Ejemplo 1
// Definición del Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Definición del Fragment Shader
const fragmentShader = `
  uniform vec3 color;
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    // Efecto de ondulación basado en tiempo
    float pattern = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
    
    // Iluminación básica
    float lighting = dot(vNormal, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
    
    vec3 finalColor = color * pattern * lighting;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Implementación en Three.js
const customMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    color: { value: new THREE.Color(0x00ff00) },
    time: { value: 0.0 }
  }
});

// Ejemplo 2
class CustomShaderMaterial extends THREE.ShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        ...options.uniforms
      },
      // Habilitar transparencia si es necesario
      transparent: true,
      // Habilitar doble cara si es necesario
      side: THREE.DoubleSide
    });
  }
}

// Ejemplo 3
function animate() {
  requestAnimationFrame(animate);
  
  // Actualizar uniforms
  material.uniforms.time.value += 0.01;
  
  renderer.render(scene, camera);
}

// Ejemplo 4
// Reutilizar texturas
const textureLoader = new THREE.TextureLoader();
const sharedTexture = textureLoader.load('texture.jpg');
sharedTexture.generateMipmaps = false; // Si no son necesarios

// Ejemplo 5
class ShaderManager {
  constructor() {
    this.validateShader = (shader) => {
      try {
        const gl = renderer.getContext();
        const compiled = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(compiled, shader);
        gl.compileShader(compiled);
        
        if (!gl.getShaderParameter(compiled, gl.COMPILE_STATUS)) {
          throw new Error('Shader compilation error');
        }
      } catch (error) {
        console.error('Shader validation failed:', error);
        // Fallback a material básico
        return new THREE.MeshBasicMaterial();
      }
    }
  }
}

// Ejemplo 6
// Sistema de materiales modular
class MaterialSystem {
  constructor() {
    this.materials = new Map();
    
    this.add = (name, material) => {
      this.materials.set(name, material);
    }
    
    this.get = (name) => {
      return this.materials.get(name) || this.getDefaultMaterial();
    }
  }
}

