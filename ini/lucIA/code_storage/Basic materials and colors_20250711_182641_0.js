// Definir el código del shader personalizado
const customShader = {
  uniforms: {
    color: { value: new THREE.Color(0xffffff) },
    time: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float time;
    varying vec2 vUv;

    void main() {
      vec2 p = vUv;
      float wave = sin(p.x * 10.0 + time * 2.0) * 0.1;
      vec3 finalColor = color + vec3(wave, wave, wave);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

// Crear el material personalizado
const customMaterial = new THREE.ShaderMaterial(customShader);

// Actualizar el material en cada frame
function animate() {
  customShader.uniforms.time.value += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}