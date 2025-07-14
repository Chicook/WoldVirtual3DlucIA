// Ejemplo: Creando una jerarquía simple
const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.5), new THREE.MeshBasicMaterial({color: 0x00ff00}));
const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshBasicMaterial({color: 0xffccff}));
head.position.y = 1; // Posicionamos la cabeza encima del cuerpo
body.add(head);
scene.add(body);