// Carga una textura y crea un material con ella
const texture = new THREE.TextureLoader().load('path/to/texture.jpg');
const material = new THREE.MeshStandardMaterial({
  map: texture,
  // Otros parámetros del material
});

// Ajustar las coordenadas UV de una geometría
const geometry = new THREE.BoxGeometry(1, 1, 1);
geometry.faceVertexUvs[0].forEach((faceUv, i) => {
  // Ajustar las coordenadas UV de cada cara
  faceUv[0].set(0.5, 0.5);
  faceUv[1].set(0.5, 0.0);
  faceUv[2].set(0.0, 0.5);
});
geometry.uvsNeedUpdate = true;

// Crear un atlas de texturas
const atlasTexture = new THREE.VideoTexture(videoElement);
atlasTexture.magFilter = THREE.NearestFilter;
atlasTexture.minFilter = THREE.NearestFilter;

// Dividir una textura grande en un atlas
const width = 2048;
const height = 2048;
const numCols = 4;
const numRows = 4;
const tileWidth = width / numCols;
const tileHeight = height / numRows;

for (let y = 0; y < numRows; y++) {
  for (let x = 0; x < numCols; x++) {
    const material = new THREE.MeshStandardMaterial({
      map: new THREE.Texture(atlasTexture, new THREE.UVMapping()),
      // Otros parámetros del material
    });
    material.map.offset.set(x / numCols, y / numRows);
    material.map.repeat.set(1 / numCols, 1 / numRows);
  }
}