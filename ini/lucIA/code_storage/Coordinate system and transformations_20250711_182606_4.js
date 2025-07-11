// Crear un objeto padre y un objeto hijo
const parent = new THREE.Object3D();
const child = new THREE.Mesh(geometry, material);
parent.add(child);

// Transformar el objeto padre
parent.position.set(x, y, z);
parent.rotation.y = THREE.MathUtils.degToRad(45);

// El objeto hijo hereda las transformaciones del padre