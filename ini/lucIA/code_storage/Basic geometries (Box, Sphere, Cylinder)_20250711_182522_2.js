// ... (configuración básica - igual que el ejemplo anterior)

// CylinderGeometry (radio superior, radio inferior, altura, segmentos radiales)
const geometry = new THREE.CylinderGeometry( 0.5, 0.5, 2, 32 ); // Cilindro de radio 0.5 y altura 2
const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } ); // Azul
const cylinder = new THREE.Mesh( geometry, material );
scene.add( cylinder );

// ... (resto del código - igual que el ejemplo anterior)