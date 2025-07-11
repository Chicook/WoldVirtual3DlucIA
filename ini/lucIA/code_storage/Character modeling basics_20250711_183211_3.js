const decimateModifier = new THREE.DecimateModifier();
decimateModifier.ratio = 0.5; // Reduce la geometría al 50%
decimateModifier.modify(geometry);