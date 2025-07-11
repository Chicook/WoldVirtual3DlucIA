// Código extraído de: Custom shaders and materials
// API: Claude
// Fecha: 2025-07-11 21:39:47

// Ejemplo 1
// Shader Structure
const customMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() },
        customColor: { value: new THREE.Color(0x00ff00) }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 customColor;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
            vec3 color = customColor * abs(sin(time));
            color *= dot(vNormal, vec3(0.0, 1.0, 0.0));
            gl_FragColor = vec4(color, 1.0);
        }
    `
});

// Ejemplo 2
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = customMaterial;
const mesh = new THREE.Mesh(geometry, material);

// Ejemplo 3
function animate() {
    material.uniforms.time.value = performance.now() * 0.001;
    material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    requestAnimationFrame(animate);
}

// Ejemplo 4
const ShaderLoader = {
    init(material) {
        try {
            // Compilación de shader
            const isValid = material.program.diagnostics;
            if (!isValid) {
                throw new Error('Shader compilation failed');
            }
        } catch (error) {
            console.error('Shader error:', error);
            // Fallback a material básico
            return new THREE.MeshBasicMaterial();
        }
    }
};

// Ejemplo 5
class CustomShaderSystem {
    constructor(renderer) {
        this.renderer = renderer;
        this.materials = new Map();
    }

    addMaterial(id, material) {
        this.materials.set(id, material);
        this.updateShaderUniforms();
    }

    updateShaderUniforms() {
        this.materials.forEach(material => {
            if (material.type === 'ShaderMaterial') {
                // Sincronización con sistema global
                material.uniformsNeedUpdate = true;
            }
        });
    }
}

