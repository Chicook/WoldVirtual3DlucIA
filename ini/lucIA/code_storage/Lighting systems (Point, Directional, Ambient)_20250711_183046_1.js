// Crear una luz direccional blanca
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);

// Definir la dirección de la luz (hacia dónde apunta, no desde dónde viene)
directionalLight.target.position.set(0, 0, 0); // Apunta al origen
directionalLight.position.set(10, 10, 10);  //Posición de la luz (solo influye en la dirección)
scene.add(directionalLight);
scene.add(directionalLight.target); // IMPORTANTE: Añadir el target a la escena

// Alternativa para definir la dirección:
//directionalLight.position.normalize(); // Normaliza la dirección 
