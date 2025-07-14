// Crear una luz puntual roja
const pointLight = new THREE.PointLight(0xff0000, 1, 100); 

// Posicionar la luz
pointLight.position.set(5, 5, 5); 

// Añadir la luz a la escena
scene.add(pointLight);


//Ajustar la atenuación (opcional, pero recomendable para realismo)
pointLight.decay = 2; //  atenuación cuadrática, valor por defecto es 1 (lineal).

//Ejemplo de uso con diferentes valores de decay:
//decay = 0: Sin atenuación, la luz alcanza infinitamente.
//decay = 1: Atenuación lineal.
//decay = 2: Atenuación cuadrática (más realista).
