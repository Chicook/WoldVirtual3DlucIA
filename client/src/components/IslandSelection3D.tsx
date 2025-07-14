import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface IslandSelection3DProps {
  onSelectIsland: () => void;
}

const IslandSelection3D: React.FC<IslandSelection3DProps> = ({ onSelectIsland }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const islandMesh = useRef<THREE.Mesh | undefined>(undefined);

  useEffect(() => {
    // Escena, cámara y renderizador
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#16213e');

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 6, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    mountRef.current!.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Isla flotante (mesh avanzada)
    const islandGeometry = new THREE.CylinderGeometry(5, 8, 2, 48, 1, false);
    const islandMaterial = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      flatShading: true,
      roughness: 0.6,
      metalness: 0.2,
    });
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.set(0, 0, 0);
    island.castShadow = true;
    island.receiveShadow = true;
    island.name = 'island'; // Identificador para el raycaster
    scene.add(island);
    islandMesh.current = island;

    // Decoración: árboles simples
    for (let i = 0; i < 5; i++) {
      const treeTrunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x8d5524 })
      );
      const treeLeaves = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + Math.random() * 0.2, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x228b22 })
      );
      const angle = (i / 5) * Math.PI * 2;
      const radius = 3.5 + Math.random() * 0.5;
      treeTrunk.position.set(Math.cos(angle) * radius, 1, Math.sin(angle) * radius);
      treeLeaves.position.set(treeTrunk.position.x, 1.7, treeTrunk.position.z);
      scene.add(treeTrunk);
      scene.add(treeLeaves);
    }

    // Agua animada alrededor
    const waterGeometry = new THREE.CylinderGeometry(10, 10, 0.5, 64);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      roughness: 0.8,
      metalness: 0.1,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.set(0, -1.2, 0);
    scene.add(water);

    // Animación de la isla (flotando)
    let t = 0;
    const animate = () => {
      t += 0.01;
      island.position.y = Math.sin(t) * 0.3;
      island.rotation.y += 0.002;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Click handler para seleccionar la isla
    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      // Usar array de objetos para escalabilidad
      const intersects = raycaster.current.intersectObjects([island], true);
      if (intersects.length > 0) {
        console.log('Isla 3D seleccionada:', intersects[0]);
        onSelectIsland();
      } else {
        console.log('Clic en escena, pero no en la isla.');
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    // Limpieza
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onSelectIsland]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#16213e', position: 'relative' }}
    >
      {/* Aquí se monta la escena 3D de selección de isla */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          background: 'rgba(0,0,0,0.7)',
          padding: '12px 32px',
          borderRadius: 20,
          fontSize: 20,
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}
      >
        Haz clic en la isla para entrar al metaverso
      </div>
    </div>
  );
};

export default IslandSelection3D; 