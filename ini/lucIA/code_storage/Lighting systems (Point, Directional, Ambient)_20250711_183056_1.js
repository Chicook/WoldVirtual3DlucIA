     const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
     directionalLight.position.set(0, 1, 1).normalize();
     scene.add(directionalLight);