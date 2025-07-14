const geometry = new THREE.BoxGeometry(1, 1, 1);
const subdivisionsLevel = 2;
const subdivisionModifier = new THREE.SubdivisionModifier(subdivisionsLevel);
subdivisionModifier.modify(geometry);