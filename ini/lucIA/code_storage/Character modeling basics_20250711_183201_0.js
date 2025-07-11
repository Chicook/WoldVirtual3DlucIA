// Ejemplo: Creando un cuerpo simple con BoxGeometry
const geometry = new THREE.BoxGeometry(1, 2, 1); // Ancho, Alto, Profundidad
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Material verde
const body = new THREE.Mesh(geometry, material);
scene.add(body);