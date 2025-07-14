// Establecer atributos
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

// Obtener atributos
const positionAttribute = geometry.getAttribute('position');
const normalAttribute = geometry.getAttribute('normal');
const uvAttribute = geometry.getAttribute('uv');