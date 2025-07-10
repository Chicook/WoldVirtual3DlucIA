import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './ThreeJSViewport.css';

export const ThreeJSViewport: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Escena básica
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#23272e');

    // Cámara
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(6, 6, 6);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
    scene.add(gridHelper);

    // Ejes
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    // Luz
    const light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(5, 10, 7);
    scene.add(light);

    // Overlay visual si no hay conexión
    if (overlayRef.current) {
      overlayRef.current.style.display = 'flex';
    }

    // Animación
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="threejs-viewport-container">
      <div ref={mountRef} className="threejs-canvas-container" />
      <div ref={overlayRef} className="threejs-viewport-overlay">
        <div className="threejs-viewport-label">
          <h2>Zona 3D de trabajo</h2>
          <p>Visualización activa. Aquí se editarán objetos 3D.</p>
        </div>
      </div>
    </div>
  );
}; 