// Definir un atributo personalizado de color
const colorAttribute = new THREE.BufferAttribute(new Float32Array(numVertices * 3), 3);
geometry.setAttribute('color', colorAttribute);

// Establecer los valores del atributo de color
for (let i = 0; i < numVertices; i++) {
  colorAttribute.setXYZ(i, Math.random(), Math.random(), Math.random());
}