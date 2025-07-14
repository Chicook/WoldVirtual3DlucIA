// ... (código para crear la escena, cámara y geometrías) ...

// Luz ambiental
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Luz direccional (simulando el sol)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

// Luz puntual (simulando una lámpara)
const pointLight = new THREE.PointLight(0xffaa00, 1, 50);
pointLight.position.set(-5, 2, -5);
scene.add(pointLight);


// ... (código para renderizar la escena) ...
