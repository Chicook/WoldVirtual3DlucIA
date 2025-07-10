import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import './ThreeJSViewport.css';

// Importar utilidades JavaScript
import { 
  EditorCore, 
  ObjectCreators, 
  TransformTools, 
  SelectionHelpers, 
  NavigationHelpers 
} from '../threejs-utils/funciones_js/index.js';

export const ThreeJSViewport: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedObjects, setSelectedObjects] = useState<THREE.Object3D[]>([]);
  const [sceneObjects, setSceneObjects] = useState<THREE.Object3D[]>([]);

  // Instancias de utilidades
  const editorCore = useRef<EditorCore>();
  const objectCreators = useRef<ObjectCreators>();
  const transformTools = useRef<TransformTools>();
  const selectionHelpers = useRef<SelectionHelpers>();
  const navigationHelpers = useRef<NavigationHelpers>();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Inicializar utilidades
    editorCore.current = new EditorCore();
    objectCreators.current = new ObjectCreators();
    transformTools.current = new TransformTools();
    selectionHelpers.current = new SelectionHelpers();
    navigationHelpers.current = new NavigationHelpers();

    // Inicializar editor
    editorCore.current.initialize(mount);
    
    // Configurar navegación
    navigationHelpers.current.setupNavigation(
      editorCore.current.camera,
      editorCore.current.renderer,
      editorCore.current.scene
    );

    // Configurar selección
    selectionHelpers.current.setupRaycaster(
      editorCore.current.camera,
      editorCore.current.renderer
    );

    // Configurar transformaciones
    transformTools.current.setupTransformControls(
      editorCore.current.camera,
      editorCore.current.renderer
    );

    // Eventos de mouse
    const handleMouseDown = (event: MouseEvent) => {
      if (selectedTool === 'select') {
        const selected = selectionHelpers.current?.selectObjectFromEvent(event);
        if (selected) {
          setSelectedObjects([selected]);
          transformTools.current?.setTarget(selected);
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedObjects.length > 0) {
            selectedObjects.forEach(obj => {
              editorCore.current?.removeObject(obj);
            });
            setSelectedObjects([]);
            setSceneObjects(prev => prev.filter(obj => !selectedObjects.includes(obj)));
          }
          break;
        case 'Escape':
          setSelectedObjects([]);
          transformTools.current?.setTarget(null);
          break;
      }
    };

    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);

    setIsReady(true);

    // Cleanup
    return () => {
      mount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
      editorCore.current?.cleanup();
    };
  }, []);

  // Funciones de herramientas
  const createCube = useCallback(() => {
    if (!objectCreators.current || !editorCore.current) return;
    
    const cube = objectCreators.current.createCube();
    editorCore.current.addObject(cube);
    setSceneObjects(prev => [...prev, cube]);
  }, []);

  const createSphere = useCallback(() => {
    if (!objectCreators.current || !editorCore.current) return;
    
    const sphere = objectCreators.current.createSphere();
    editorCore.current.addObject(sphere);
    setSceneObjects(prev => [...prev, sphere]);
  }, []);

  const createCylinder = useCallback(() => {
    if (!objectCreators.current || !editorCore.current) return;
    
    const cylinder = objectCreators.current.createCylinder();
    editorCore.current.addObject(cylinder);
    setSceneObjects(prev => [...prev, cylinder]);
  }, []);

  const setTransformMode = useCallback((mode: 'translate' | 'rotate' | 'scale') => {
    transformTools.current?.setMode(mode);
  }, []);

  return (
    <div className="threejs-viewport-container">
      <div className="viewport-header">
        <h3>Zona 3D de Trabajo</h3>
        <div className="viewport-controls">
          <div className="tool-buttons">
            <button 
              className={selectedTool === 'select' ? 'active' : ''}
              onClick={() => setSelectedTool('select')}
            >
              Seleccionar
            </button>
            <button 
              className={selectedTool === 'move' ? 'active' : ''}
              onClick={() => {
                setSelectedTool('move');
                setTransformMode('translate');
              }}
            >
              Mover
            </button>
            <button 
              className={selectedTool === 'rotate' ? 'active' : ''}
              onClick={() => {
                setSelectedTool('rotate');
                setTransformMode('rotate');
              }}
            >
              Rotar
            </button>
            <button 
              className={selectedTool === 'scale' ? 'active' : ''}
              onClick={() => {
                setSelectedTool('scale');
                setTransformMode('scale');
              }}
            >
              Escalar
            </button>
          </div>
          
          <div className="object-buttons">
            <button onClick={createCube}>Cubo</button>
            <button onClick={createSphere}>Esfera</button>
            <button onClick={createCylinder}>Cilindro</button>
          </div>
        </div>
        
        <div className="viewport-status">
          <span className="status-indicator active"></span>
          <span>Activo - {selectedObjects.length} objeto(s) seleccionado(s)</span>
        </div>
      </div>
      
      <div 
        ref={mountRef} 
        className="threejs-canvas-container"
        style={{ 
          width: '100%', 
          height: 'calc(100% - 80px)',
          background: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '4px',
          cursor: selectedTool === 'select' ? 'crosshair' : 'pointer'
        }}
      >
        {!isReady && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Cargando editor 3D...</p>
          </div>
        )}
      </div>
      
      <div className="viewport-info">
        <p>Herramienta: {selectedTool} | Objetos: {sceneObjects.length} | Seleccionados: {selectedObjects.length}</p>
        <p>Controles: LMB = Seleccionar, MMB = Pan, RMB = Orbit, Scroll = Zoom, Delete = Eliminar</p>
      </div>
    </div>
  );
}; 