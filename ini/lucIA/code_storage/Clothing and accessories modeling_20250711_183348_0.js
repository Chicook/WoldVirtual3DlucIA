// Crear un anillo
const geometry = new THREE.TorusGeometry(1, 0.1, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 });
const ring = new THREE.Mesh(geometry, material);
scene.add(ring);

// Crear un brazalete
const braceletGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 32);
const braceletMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9 });
const bracelet = new THREE.Mesh(braceletGeometry, braceletMaterial);
bracelet.rotation.x = Math.PI / 2;
scene.add(bracelet);