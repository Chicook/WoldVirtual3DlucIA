const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffcccc });
const arm = new THREE.Mesh(armGeometry, armMaterial);
arm.position.x = 0.6; // Posicionar el brazo a un lado del cuerpo
body.add(arm);