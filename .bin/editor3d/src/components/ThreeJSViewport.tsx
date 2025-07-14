import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import './ThreeJSViewport.css';

// Importar utilidades JavaScript
import { EditorCore } from '../threejs-utils/funciones_js/EditorCore.js';
import { ObjectCreators } from '../threejs-utils/funciones_js/ObjectCreators.js';
import { SelectionHelpers } from '../threejs-utils/funciones_js/SelectionHelpers.js';
import { TransformTools } from '../threejs-utils/funciones_js/TransformTools.js';
import { MaterialHelpers } from '../threejs-utils/funciones_js/MaterialHelpers.js';

interface ThreeJSViewportProps {
  activeTool?: string;
  onToolChange?: (tool: string) => void;
  onObjectSelect?: (object: THREE.Object3D | null) => void;
  projectName?: string;
}

export const ThreeJSViewport: React.FC<ThreeJSViewportProps> = ({
  activeTool = 'select',
  onToolChange = () => {},
  onObjectSelect = () => {},
  projectName = 'WoldVirtual3D Project'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  const [interactionMode, setInteractionMode] = useState<'navigate' | 'transform'>('navigate');

  // Referencias de Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Referencias de utilidades
  const editorCoreRef = useRef<any>(null);
  const objectCreatorsRef = useRef<any>(null);
  const selectionHelpersRef = useRef<any>(null);
  const transformToolsRef = useRef<any>(null);
  const materialHelpersRef = useRef<any>(null);

  // Estado de interacción
  const isMouseDownRef = useRef(false);
  const isRightMouseDownRef = useRef(false);
  const lastMousePositionRef = useRef({ x: 0, y: 0 });

  // Inicialización del editor 3D
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || isInitialized) return;

    try {
      console.log('🚀 Inicializando Editor 3D...');

      // Tamaño del canvas
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      // Escena
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#23272e');
      sceneRef.current = scene;

      // Cámara
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(5, 5, 5);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Controles de navegación (OrbitControls)
      const orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.05;
      orbitControls.screenSpacePanning = false;
      orbitControls.minDistance = 1;
      orbitControls.maxDistance = 100;
      orbitControls.maxPolarAngle = Math.PI;
      orbitControlsRef.current = orbitControls;

      // Controles de transformación (TransformControls)
      const transformControls = new TransformControls(camera, renderer.domElement);
      transformControls.size = 0.8;
      transformControls.showX = true;
      transformControls.showY = true;
      transformControls.showZ = true;
      transformControlsRef.current = transformControls;

      // Configurar eventos de TransformControls
      transformControls.addEventListener('dragging-changed', (event) => {
        // Deshabilitar OrbitControls durante la transformación
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = !event.value;
        }
      });

      // Añadir controles a la escena
      scene.add(transformControls);

      // Grid y ejes
      const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
      scene.add(gridHelper);

      const axesHelper = new THREE.AxesHelper(10);
      scene.add(axesHelper);

      // Iluminación
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Inicializar utilidades
      editorCoreRef.current = new EditorCore();
      objectCreatorsRef.current = new ObjectCreators();
      selectionHelpersRef.current = new SelectionHelpers();
      transformToolsRef.current = new TransformTools();
      materialHelpersRef.current = new MaterialHelpers();

      // Añadir canvas al DOM
      mount.appendChild(renderer.domElement);

      // Render loop
      const animate = () => {
        requestAnimationFrame(animate);
        
        if (orbitControlsRef.current) {
          orbitControlsRef.current.update();
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();

      // Manejar redimensionamiento
      const handleResize = () => {
        if (!mount || !cameraRef.current || !rendererRef.current) return;
        
        const width = mount.clientWidth;
        const height = mount.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      };
      window.addEventListener('resize', handleResize);

      setIsInitialized(true);
      console.log('✅ Editor 3D inicializado correctamente');

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (mount && rendererRef.current) {
          mount.removeChild(rendererRef.current.domElement);
        }
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        if (orbitControlsRef.current) {
          orbitControlsRef.current.dispose();
        }
        if (transformControlsRef.current) {
          transformControlsRef.current.dispose();
        }
      };
    } catch (error) {
      console.error('❌ Error al inicializar Editor 3D:', error);
    }
  }, [isInitialized]);

  // Manejar eventos de mouse
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!sceneRef.current || !cameraRef.current || !raycasterRef.current) return;

    event.preventDefault();
    isMouseDownRef.current = true;
    isRightMouseDownRef.current = event.button === 2; // Botón derecho

    // Calcular posición del mouse
    const rect = mountRef.current?.getBoundingClientRect();
    if (!rect) return;

    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    lastMousePositionRef.current = { x: event.clientX, y: event.clientY };

    // Si es clic izquierdo, intentar seleccionar objeto
    if (event.button === 0 && !isRightMouseDownRef.current) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      
      const objects = sceneRef.current.children.filter(child => 
        child instanceof THREE.Mesh && child !== axesHelper
      );
      
      const intersects = raycasterRef.current.intersectObjects(objects);
      
      if (intersects.length > 0) {
        const selectedObj = intersects[0].object;
        setSelectedObject(selectedObj);
        onObjectSelect(selectedObj);
        
        // Configurar TransformControls para el objeto seleccionado
        if (transformControlsRef.current) {
          transformControlsRef.current.attach(selectedObj);
          
          // Configurar modo según la herramienta activa
          switch (activeTool) {
            case 'move':
              transformControlsRef.current.setMode('translate');
              break;
            case 'rotate':
              transformControlsRef.current.setMode('rotate');
              break;
            case 'scale':
              transformControlsRef.current.setMode('scale');
              break;
            default:
              transformControlsRef.current.setMode('translate');
          }
        }
        
        setInteractionMode('transform');
      } else {
        // Si no se seleccionó nada, deseleccionar
        setSelectedObject(null);
        onObjectSelect(null);
        
        if (transformControlsRef.current) {
          transformControlsRef.current.detach();
        }
        
        setInteractionMode('navigate');
      }
    }
  }, [activeTool, onObjectSelect]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    isMouseDownRef.current = false;
    isRightMouseDownRef.current = false;
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;

    // Solo permitir navegación con botón derecho
    if (isRightMouseDownRef.current) {
      setInteractionMode('navigate');
      if (transformControlsRef.current) {
        transformControlsRef.current.detach();
      }
    }
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault(); // Prevenir menú contextual
  }, []);

  // Crear objetos
  const createObject = useCallback((type: string) => {
    if (!sceneRef.current || !objectCreatorsRef.current) return;

    let newObject: THREE.Object3D | null = null;

    switch (type) {
      case 'cube':
        newObject = objectCreatorsRef.current.createCube(1, 1, 1);
        break;
      case 'sphere':
        newObject = objectCreatorsRef.current.createSphere(0.5, 32, 32);
        break;
      case 'cylinder':
        newObject = objectCreatorsRef.current.createCylinder(0.5, 0.5, 1, 32);
        break;
      case 'plane':
        newObject = objectCreatorsRef.current.createPlane(2, 2);
        break;
      default:
        return;
    }

    if (newObject) {
      sceneRef.current.add(newObject);
      
      // Seleccionar el objeto creado
      setSelectedObject(newObject);
      onObjectSelect(newObject);
      
      if (transformControlsRef.current) {
        transformControlsRef.current.attach(newObject);
        transformControlsRef.current.setMode('translate');
      }
      
      setInteractionMode('transform');
      console.log(`✅ Objeto ${type} creado y seleccionado`);
    }
  }, [onObjectSelect]);

  // Cambiar herramienta
  const changeTool = useCallback((tool: string) => {
    onToolChange(tool);
    
    if (transformControlsRef.current && selectedObject) {
      switch (tool) {
        case 'move':
          transformControlsRef.current.setMode('translate');
          break;
        case 'rotate':
          transformControlsRef.current.setMode('rotate');
          break;
        case 'scale':
          transformControlsRef.current.setMode('scale');
          break;
        default:
          transformControlsRef.current.setMode('translate');
      }
    }
  }, [onToolChange, selectedObject]);

  return (
    <div className="threejs-viewport-container">
      {/* Canvas Three.js */}
      <div 
        ref={mountRef}
        className="threejs-canvas-container"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}
      />

      {/* Toolbar de herramientas */}
      <div className="toolbar">
        <div className="tool-group">
          <button 
            className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => changeTool('select')}
            title="Seleccionar (Q)"
          >
            👆
          </button>
          <button 
            className={`tool-btn ${activeTool === 'move' ? 'active' : ''}`}
            onClick={() => changeTool('move')}
            title="Mover (G)"
          >
            ✋
          </button>
          <button 
            className={`tool-btn ${activeTool === 'rotate' ? 'active' : ''}`}
            onClick={() => changeTool('rotate')}
            title="Rotar (R)"
          >
            🔄
          </button>
          <button 
            className={`tool-btn ${activeTool === 'scale' ? 'active' : ''}`}
            onClick={() => changeTool('scale')}
            title="Escalar (S)"
          >
            📏
          </button>
        </div>

        <div className="tool-group">
          <button 
            className="tool-btn"
            onClick={() => createObject('cube')}
            title="Crear Cubo"
          >
            📦
          </button>
          <button 
            className="tool-btn"
            onClick={() => createObject('sphere')}
            title="Crear Esfera"
          >
            🔵
          </button>
          <button 
            className="tool-btn"
            onClick={() => createObject('cylinder')}
            title="Crear Cilindro"
          >
            🏗️
          </button>
          <button 
            className="tool-btn"
            onClick={() => createObject('plane')}
            title="Crear Plano"
          >
            📄
          </button>
        </div>
      </div>

      {/* Información de estado */}
      <div className="viewport-info">
        <div className="info-item">
          <span className="info-label">Herramienta:</span>
          <span className="info-value">{activeTool}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Modo:</span>
          <span className="info-value">{interactionMode}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Objeto:</span>
          <span className="info-value">
            {selectedObject ? selectedObject.name || 'Sin nombre' : 'Ninguno'}
          </span>
        </div>
      </div>
    </div>
  );
}; 