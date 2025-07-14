     const geometry = new THREE.BoxGeometry(1, 1, 1);
     const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
     const cube = new THREE.Mesh(geometry, material);
     scene.add(cube);