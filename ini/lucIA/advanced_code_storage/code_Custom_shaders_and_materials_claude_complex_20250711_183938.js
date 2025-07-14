// Código extraído de: Custom shaders and materials
// API: Claude
// Fecha: 2025-07-11 18:39:19

// Ejemplo 1
// Definición del Vertex Shader
const vertexShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Deformación procedural
    vec3 pos = position;
    pos.y += sin(pos.x * 10.0 + time) * 0.1;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Definición del Fragment Shader
const fragmentShader = `
  uniform vec3 color;
  uniform float glossiness;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    // Cálculo de iluminación personalizada
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, light), 0.0);
    
    vec3 finalColor = color * diff;
    
    // Añadir especular
    if(diff > 0.0) {
      vec3 reflection = reflect(-light, vNormal);
      float spec = pow(max(dot(reflection, vec3(0.0, 0.0, 1.0)), 0.0), glossiness);
      finalColor += vec3(spec);
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Ejemplo 2
// 1. Crear material personalizado
const customMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0x2194CE) },
    glossiness: { value: 32.0 }
  }
});

// 2. Sistema de actualización
function update(deltaTime) {
  customMaterial.uniforms.time.value += deltaTime;
}

// 3. Optimización con defines
customMaterial.defines = {
  USE_SPECULAR: '',
  DOUBLE_SIDED: ''
};

// Ejemplo 3
function initShader() {
  try {
    // Compilación de shader
    const shader = new THREE.ShaderMaterial({/*...*/});
    
    // Verificación de compatibilidad
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('Shader compilation error');
    }
    
    return shader;
  } catch (error) {
    console.error('Shader initialization failed:', error);
    return new THREE.MeshStandardMaterial(); // Fallback
  }
}

// Ejemplo 4
class CustomMaterialSystem {
  constructor() {
    this.materials = new Map();
    this.updateQueue = [];
  }

  addMaterial(id, material) {
    this.materials.set(id, material);
    if (material.uniforms.time) {
      this.updateQueue.push(material);
    }
  }

  update(deltaTime) {
    for (const material of this.updateQueue) {
      material.uniforms.time.value += deltaTime;
    }
  }
}

