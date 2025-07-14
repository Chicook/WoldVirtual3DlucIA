import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEditor } from '../contexts/EditorContext';
import { gizmoSystem, GizmoEvent } from '../services/GizmoSystem';

interface ViewportProps {
  onObjectSelect?: (object: THREE.Object3D | null) => void;
  viewportType?: string;
}

const Viewport: React.FC<ViewportProps> = ({ onObjectSelect, viewportType = '3D' }) => {
  const { state, selectObject } = useEditor();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [shadingMode, setShadingMode] = useState<'solid' | 'wireframe' | 'material'>('solid');
  const [viewMode, setViewMode] = useState<'perspective' | 'orthographic'>('perspective');
  const [gridSize, setGridSize] = useState(20);
  const [gridDivisions, setGridDivisions] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('Viewport: Montando escena');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    sceneRef.current = scene;
    console.log('Viewport: Escena creada');

    // Crear cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;
    console.log('Viewport: Cámara creada');

    // Crear renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    console.log('Viewport: Renderer creado');

    // Crear controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    console.log('Viewport: Controles creados');

    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Añadir grid helper mejorado
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x666666, 0x999999);
    gridHelper.position.y = 0;
    gridHelper.material.opacity = 0.8;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;
    console.log('Viewport: GridHelper añadido');

    // Añadir ejes de coordenadas mejorados
    const axesHelper = new THREE.AxesHelper(5);
    (axesHelper.material as THREE.LineBasicMaterial).linewidth = 2;
    scene.add(axesHelper);
    axesHelperRef.current = axesHelper;
    console.log('Viewport: AxesHelper añadido');

    // Función para crear geometría basada en el tipo
    const createGeometry = (type: string) => {
      switch (type) {
        case 'BoxGeometry':
          return new THREE.BoxGeometry(1, 1, 1);
        case 'SphereGeometry':
          return new THREE.SphereGeometry(0.5, 32, 32);
        case 'CylinderGeometry':
          return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        case 'PlaneGeometry':
          return new THREE.PlaneGeometry(20, 20);
        default:
          return new THREE.BoxGeometry(1, 1, 1);
      }
    };

    // Función para crear material basado en las propiedades
    const createMaterial = (materialProps: any) => {
      const material = new THREE.MeshLambertMaterial({
        color: materialProps?.color || 0xffffff,
        opacity: materialProps?.opacity || 1,
        transparent: materialProps?.transparent || false
      });
      return material;
    };

    // Crear objetos iniciales desde el estado
    state.sceneObjects.forEach(obj => {
      const geometry = createGeometry(obj.geometry || 'BoxGeometry');
      const material = createMaterial(obj.material);
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
      mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
      mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
      mesh.visible = obj.visible;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { 
        id: obj.id,
        name: obj.name, 
        type: obj.type,
        sceneObject: obj
      };
      
      meshRefs.current.set(obj.id, mesh);
      scene.add(mesh);
    });

    // Montar renderer
    typeof mountRef.current !== 'undefined' && mountRef.current.appendChild(renderer.domElement);
    console.log('Viewport: Renderer montado en el DOM');

    // Configurar sistema de gizmos
    gizmoSystem.setCameraAndRenderer(camera, renderer);
    scene.add(gizmoSystem.getGizmoGroup());

    // Añadir objetos al sistema de gizmos
    meshRefs.current.forEach((mesh, id) => {
      gizmoSystem.addGizmoObject(id, mesh);
    });

    // Listener para eventos de gizmos
    const handleGizmoEvent = (event: GizmoEvent) => {
      if (event.type === 'transform' && event.objectId) {
        const mesh = meshRefs.current.get(event.objectId);
        if (mesh && event.position) {
          mesh.position.copy(event.position);
        }
        if (mesh && event.rotation) {
          mesh.rotation.copy(event.rotation);
        }
        if (mesh && event.scale) {
          mesh.scale.copy(event.scale);
        }
      }
    };

    gizmoSystem.addEventListener(handleGizmoEvent);

    // Función de renderizado
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      // Actualizar posición del gizmo en cada frame
      if (state.selectedObject && gizmoSystem.selectedGizmo) {
        gizmoSystem.updateGizmos();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Manejar redimensionamiento
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // --- GIZMO Y ORBIT CONTROLS ---
    // Desactivar OrbitControls al arrastrar gizmo
    let draggingGizmo = false;
    const originalEnable = controls.enablePan;

    const handleMouseDown = (event: MouseEvent) => {
      console.log('Viewport: handleMouseDown', event.type, event.button, event.clientX, event.clientY);
      if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Primero manejar gizmos
      gizmoSystem.handleMouseDown(event);
      // Detectar si el mouse está sobre el gizmo
      const gizmoGroup = gizmoSystem.getGizmoGroup();
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouseRef.current, cameraRef.current);
      const gizmoIntersects = raycaster.intersectObjects(gizmoGroup.children, true);
      if (gizmoIntersects.length > 0) {
        draggingGizmo = true;
        controls.enabled = false;
        console.log('Viewport: Arrastrando gizmo, OrbitControls desactivado');
      } else {
        draggingGizmo = false;
        controls.enabled = true;
      }

      // Si no se está manipulando un gizmo, manejar selección
      if (!sceneRef.current) return;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0 && !draggingGizmo) {
        const selectedMesh = intersects[0].object as THREE.Mesh;
        const sceneObject = selectedMesh.userData.sceneObject;
        if (sceneObject) {
          console.log('Viewport: Objeto seleccionado por click', sceneObject);
          selectObject(sceneObject);
          onObjectSelect?.(selectedMesh);
          gizmoSystem.selectObject(sceneObject.id);
          gizmoSystem.updateGizmos();
          console.log('Viewport: Gizmo actualizado tras selección', gizmoSystem.getGizmoGroup());
          if (gizmoSystem.getGizmoGroup().children.length === 0) {
            console.warn('Viewport: El gizmoGroup está vacío, no se muestra ningún gizmo');
          } else {
            console.log('Viewport: GizmoGroup tiene hijos:', gizmoSystem.getGizmoGroup().children);
          }
          if (!sceneRef.current) return;
          sceneRef.current.children.forEach((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              const material = child.material as THREE.MeshLambertMaterial;
              if (material.emissive) {
                material.emissive = new THREE.Color(0x000000);
              }
              // Quitar outline si existe
              if (child.userData.outline) {
                sceneRef.current?.remove(child.userData.outline);
                child.userData.outline = null;
              }
            }
          });
          // Añadir outline al objeto seleccionado
          const material = selectedMesh.material as THREE.MeshLambertMaterial;
          if (material.emissive) {
            material.emissive = new THREE.Color(0x444444);
          }
          // Crear outline
          const outline = selectedMesh.clone();
          outline.material = material.clone();
          (outline.material as THREE.MeshLambertMaterial).color = new THREE.Color(0xffff00);
          (outline.material as THREE.MeshLambertMaterial).emissive = new THREE.Color(0xffff00);
          (outline.material as THREE.MeshLambertMaterial).opacity = 0.5;
          (outline.material as THREE.MeshLambertMaterial).transparent = true;
          outline.scale.multiplyScalar(1.05);
          outline.userData.isOutline = true;
          selectedMesh.userData.outline = outline;
          sceneRef.current.add(outline);
        }
      } else {
        selectObject(null);
        onObjectSelect?.(null);
        
        // Quitar resaltado
        if (!sceneRef.current) return;
        sceneRef.current.children.forEach((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            const material = child.material as THREE.MeshLambertMaterial;
            if (material.emissive) {
              material.emissive = new THREE.Color(0x000000);
            }
            // Quitar outline si existe
            if (child.userData.outline) {
              sceneRef.current?.remove(child.userData.outline);
              child.userData.outline = null;
            }
          }
        });
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      gizmoSystem.handleMouseMove(event);
      if (draggingGizmo) {
        controls.enabled = false;
      }
      // Log para saber si se ejecuta
      //console.log('Viewport: handleMouseMove', event.type, event.clientX, event.clientY);
    };

    const handleMouseUp = (event: MouseEvent) => {
      gizmoSystem.handleMouseUp();
      if (draggingGizmo) {
        controls.enabled = true;
        draggingGizmo = false;
        console.log('Viewport: Soltó gizmo, OrbitControls reactivado');
      }
      // Log para saber si se ejecuta
      //console.log('Viewport: handleMouseUp', event.type, event.clientX, event.clientY);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      gizmoSystem.removeEventListener(handleGizmoEvent);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onObjectSelect, gridSize, gridDivisions]);

  // Sincronizar cambios del estado con la escena Three.js
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const currentMeshIds = new Set(meshRefs.current.keys());
    const newMeshIds = new Set(state.sceneObjects.map(obj => obj.id));

    // Función para crear geometría basada en el tipo
    const createGeometry = (type: string) => {
      switch (type) {
        case 'BoxGeometry':
          return new THREE.BoxGeometry(1, 1, 1);
        case 'SphereGeometry':
          return new THREE.SphereGeometry(0.5, 32, 32);
        case 'CylinderGeometry':
          return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        case 'PlaneGeometry':
          return new THREE.PlaneGeometry(20, 20);
        default:
          return new THREE.BoxGeometry(1, 1, 1);
      }
    };

    // Función para crear material basado en las propiedades
    const createMaterial = (materialProps: any) => {
      const material = new THREE.MeshLambertMaterial({
        color: materialProps?.color || 0xffffff,
        opacity: materialProps?.opacity || 1,
        transparent: materialProps?.transparent || false
      });
      return material;
    };

    // Eliminar objetos que ya no existen en el estado
    currentMeshIds.forEach(id => {
      if (!newMeshIds.has(id)) {
        const mesh = meshRefs.current.get(id);
        if (mesh) {
          scene.remove(mesh);
          meshRefs.current.delete(id);
        }
      }
    });

    // Añadir o actualizar objetos
    state.sceneObjects.forEach(obj => {
      let mesh = meshRefs.current.get(obj.id);
      
      if (!mesh) {
        // Crear nuevo mesh
        const geometry = createGeometry(obj.geometry || 'BoxGeometry');
        const material = createMaterial(obj.material);
        mesh = new THREE.Mesh(geometry, material);
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { 
          id: obj.id,
          name: obj.name, 
          type: obj.type,
          sceneObject: obj
        };
        
        meshRefs.current.set(obj.id, mesh);
        scene.add(mesh);
      } else {
        // Actualizar mesh existente
        mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
        mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
        mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
        mesh.visible = obj.visible;
        
        // Actualizar material si es necesario
        if (obj.material) {
          const material = mesh.material as THREE.MeshLambertMaterial;
          material.color.setHex(parseInt(obj.material.color.replace('#', '0x')));
          material.opacity = obj.material.opacity;
          material.transparent = obj.material.transparent;
        }
        
        // Actualizar outline si existe
        if (mesh.userData.outline) {
          const outline = mesh.userData.outline;
          outline.position.copy(mesh.position);
          outline.rotation.copy(mesh.rotation);
          outline.scale.copy(mesh.scale);
          outline.visible = obj.visible;
        }
        
        // Actualizar userData
        mesh.userData.sceneObject = obj;
      }
    });
  }, [state.sceneObjects]);

  // Sincronizar modo de transformación con gizmos
  useEffect(() => {
    if (state.transformMode) {
      gizmoSystem.setTransformMode(state.transformMode);
    }
  }, [state.transformMode]);

  // Sincronizar estado de gizmos
  useEffect(() => {
    if (!state.gizmosEnabled) {
      gizmoSystem.clearAllGizmos();
    }
  }, [state.gizmosEnabled]);

  // Actualizar grid cuando cambien sus propiedades
  useEffect(() => {
    if (!sceneRef.current || !gridHelperRef.current) return;

    const scene = sceneRef.current;
    const oldGrid = gridHelperRef.current;
    
    // Remover grid anterior
    scene.remove(oldGrid);
    
    // Crear nuevo grid con nuevas propiedades
    const newGrid = new THREE.GridHelper(gridSize, gridDivisions, 0x666666, 0x999999);
    newGrid.position.y = 0;
    newGrid.material.opacity = 0.8;
    newGrid.material.transparent = true;
    newGrid.visible = showGrid;
    
    scene.add(newGrid);
    gridHelperRef.current = newGrid;
  }, [gridSize, gridDivisions, showGrid]);

  const setCameraView = (view: string) => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    switch (view) {
      case 'front':
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        break;
      case 'back':
        camera.position.set(0, 0, -10);
        camera.lookAt(0, 0, 0);
        break;
      case 'top':
        camera.position.set(0, 10, 0);
        camera.lookAt(0, 0, 0);
        break;
      case 'bottom':
        camera.position.set(0, -10, 0);
        camera.lookAt(0, 0, 0);
        break;
      case 'left':
        camera.position.set(-10, 0, 0);
        camera.lookAt(0, 0, 0);
        break;
      case 'right':
        camera.position.set(10, 0, 0);
        camera.lookAt(0, 0, 0);
        break;
      case 'perspective':
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        break;
    }
    
    controls.target.set(0, 0, 0);
    controls.update();
  };

  const toggleGrid = () => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = !showGrid;
      setShowGrid(!showGrid);
    }
  };

  const toggleAxes = () => {
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = !showAxes;
      setShowAxes(!showAxes);
    }
  };

  return (
    <div 
      ref={mountRef} 
      style={{ 
        flex: 1, 
        background: '#2a2a2a',
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
    >
      {/* Viewport Overlay - Similar to Blender */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        zIndex: 10
      }}>
        {/* Debug Info */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'monospace',
          marginBottom: '8px'
        }}>
          <div>Transform: {state.transformMode}</div>
          <div>Gizmos: {state.gizmosEnabled ? 'ON' : 'OFF'}</div>
          <div>Selected: {state.selectedObject?.name || 'None'}</div>
        </div>
      </div>

      {/* Viewport Overlay - Similar to Blender */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {/* Viewport Info */}
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace'
        }}>
          {viewportType} View
        </div>
        
        {/* Camera Info */}
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace'
        }}>
          Camera: (5.0, 5.0, 5.0)
        </div>

        {/* Shading Mode */}
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace'
        }}>
          Shading: {shadingMode}
        </div>

        {/* Grid Controls */}
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          marginTop: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <button
              onClick={toggleGrid}
              style={{
                background: showGrid ? '#007acc' : '#333',
                color: '#fff',
                border: '1px solid #555',
                padding: '2px 6px',
                borderRadius: '2px',
                fontSize: '9px',
                cursor: 'pointer'
              }}
            >
              Grid {showGrid ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={toggleAxes}
              style={{
                background: showAxes ? '#007acc' : '#333',
                color: '#fff',
                border: '1px solid #555',
                padding: '2px 6px',
                borderRadius: '2px',
                fontSize: '9px',
                cursor: 'pointer'
              }}
            >
              Axes {showAxes ? 'ON' : 'OFF'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Size: </span>
            <input
              type="number"
              value={gridSize}
              min={1}
              max={100}
              step={1}
              onChange={e => setGridSize(Number(e.target.value))}
              style={{ 
                width: '40px', 
                background: '#333',
                border: '1px solid #555',
                color: '#fff',
                fontSize: '9px',
                padding: '2px'
              }}
            />
            <span>Div: </span>
            <input
              type="number"
              value={gridDivisions}
              min={1}
              max={100}
              step={1}
              onChange={e => setGridDivisions(Number(e.target.value))}
              style={{ 
                width: '40px', 
                background: '#333',
                border: '1px solid #555',
                color: '#fff',
                fontSize: '9px',
                padding: '2px'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Viewport Controls - Similar to Blender */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {/* View Controls */}
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', maxWidth: '200px' }}>
          <button 
            onClick={() => setCameraView('front')}
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              border: '1px solid #555',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer',
              minWidth: '40px'
            }}
            title="Front View"
          >
            Front
          </button>
          <button 
            onClick={() => setCameraView('back')}
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              border: '1px solid #555',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer',
              minWidth: '40px'
            }}
            title="Back View"
          >
            Back
          </button>
          <button 
            onClick={() => setCameraView('left')}
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              border: '1px solid #555',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer',
              minWidth: '40px'
            }}
            title="Left View"
          >
            Left
          </button>
          <button 
            onClick={() => setCameraView('right')}
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              border: '1px solid #555',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer',
              minWidth: '40px'
            }}
            title="Right View"
          >
            Right
          </button>
          <button 
            onClick={() => setCameraView('top')}
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              border: '1px solid #555',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer',
              minWidth: '40px'
            }}
            title="Top View"
          >
            Top
          </button>
          <button 
            onClick={() => setCameraView('bottom')}
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              border: '1px solid #555',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer',
              minWidth: '40px'
            }}
            title="Bottom View"
          >
            Bottom
          </button>
          <button 
            onClick={() => setCameraView('perspective')}
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              border: '1px solid #555',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer',
              minWidth: '40px'
            }}
            title="Perspective View"
          >
            Persp
          </button>
        </div>

        {/* Shading Controls */}
        <div style={{ display: 'flex', gap: '2px' }}>
          <button 
            onClick={() => setShadingMode('solid')}
            style={{
              background: shadingMode === 'solid' ? '#007acc' : 'rgba(0,0,0,0.7)',
              color: '#fff',
              border: '1px solid #555',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer'
            }}
            title="Solid Shading"
          >
            Solid
          </button>
          <button 
            onClick={() => setShadingMode('wireframe')}
            style={{
              background: shadingMode === 'wireframe' ? '#007acc' : 'rgba(0,0,0,0.7)',
              color: '#fff',
              border: '1px solid #555',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer'
            }}
            title="Wireframe Shading"
          >
            Wire
          </button>
          <button 
            onClick={() => setShadingMode('material')}
            style={{
              background: shadingMode === 'material' ? '#007acc' : 'rgba(0,0,0,0.7)',
              color: '#fff',
              border: '1px solid #555',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              cursor: 'pointer'
            }}
            title="Material Preview"
          >
            Material
          </button>
        </div>

        {/* Options */}
        <button style={{
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          border: '1px solid #555',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          cursor: 'pointer'
        }}>
          Options
        </button>
      </div>
    </div>
  );
};

export default Viewport; 