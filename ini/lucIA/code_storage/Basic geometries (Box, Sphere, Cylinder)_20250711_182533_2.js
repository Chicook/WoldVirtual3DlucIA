     const geometry = new THREE.CylinderGeometry(1, 1, 2, 32, 1);
     const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
     const cylinder = new THREE.Mesh(geometry, material);
     scene.add(cylinder);