const shape1 = new THREE.BoxGeometry(1, 1, 1);
const shape2 = new THREE.CylinderGeometry(0.5, 0.5, 2);
const combinedGeometry = new THREE.BufferGeometry().copy(shape1);
combinedGeometry.merge(shape2.toNonIndexed());