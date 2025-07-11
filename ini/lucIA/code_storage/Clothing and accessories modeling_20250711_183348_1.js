// Crear la forma del cinturón
const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(10, 0);
shape.lineTo(10, 1);
shape.lineTo(0, 1);
shape.closePath();

// Extruir la forma
const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 };
const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const material = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5 });
const belt = new THREE.Mesh(geometry, material);
scene.add(belt);