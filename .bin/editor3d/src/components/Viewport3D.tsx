import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Viewport3D.css';

interface Viewport3DProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onViewportChange: (viewport: string) => void;
  projectName: string;
}

interface CameraState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  zoom: number;
}

interface SceneObject {
  id: string;
  name: string;
  type: 'cube' | 'sphere' | 'light' | 'camera';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  selected: boolean;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  activeTool,
  onToolChange,
  onViewportChange,
  projectName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState<CameraState>({
    position: { x: 0, y: 5, z: 10 },
    rotation: { x: -20, y: 0, z: 0 },
    zoom: 1
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([
    {
      id: '1',
      name: 'Cube',
      type: 'cube',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      selected: true
    },
    {
      id: '2',
      name: 'Light',
      type: 'light',
      position: { x: 5, y: 5, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      selected: false
    }
  ]);
  const [viewportMode, setViewportMode] = useState<'perspective' | 'orthographic'>('perspective');
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showGizmo, setShowGizmo] = useState(true);

  // Inicializar canvas y contexto
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const resizeCanvas = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Renderizar escena 3D
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configurar contexto
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);

    // Dibujar grid
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Dibujar ejes
    if (showAxes) {
      drawAxes(ctx);
    }

    // Dibujar objetos de la escena
    sceneObjects.forEach(obj => {
      drawObject(ctx, obj);
    });

    // Dibujar gizmo
    if (showGizmo) {
      drawGizmo(ctx);
    }

    ctx.restore();
  }, [camera, sceneObjects, showGrid, showAxes, showGizmo]);

  // Dibujar grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    const gridSpacing = 1;
    
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    // Líneas verticales
    for (let x = -gridSize; x <= gridSize; x += gridSpacing) {
      ctx.moveTo(x * 20, -gridSize * 20);
      ctx.lineTo(x * 20, gridSize * 20);
    }

    // Líneas horizontales
    for (let z = -gridSize; z <= gridSize; z += gridSpacing) {
      ctx.moveTo(-gridSize * 20, z * 20);
      ctx.lineTo(gridSize * 20, z * 20);
    }

    ctx.stroke();

    // Líneas principales más gruesas
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Eje X (rojo)
    ctx.strokeStyle = '#ff4444';
    ctx.moveTo(0, 0);
    ctx.lineTo(gridSize * 20, 0);
    
    // Eje Z (azul)
    ctx.strokeStyle = '#4444ff';
    ctx.moveTo(0, 0);
    ctx.lineTo(0, gridSize * 20);
    
    ctx.stroke();
  };

  // Dibujar ejes de coordenadas
  const drawAxes = (ctx: CanvasRenderingContext2D) => {
    const axisLength = 100;
    
    // Eje X (rojo)
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(axisLength, 0);
    ctx.stroke();
    
    // Eje Y (verde)
    ctx.strokeStyle = '#44ff44';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -axisLength);
    ctx.stroke();
    
    // Eje Z (azul)
    ctx.strokeStyle = '#4444ff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-axisLength * 0.7, -axisLength * 0.7);
    ctx.stroke();
  };

  // Dibujar objeto 3D
  const drawObject = (ctx: CanvasRenderingContext2D, obj: SceneObject) => {
    const { position, scale, selected } = obj;
    
    ctx.save();
    ctx.translate(position.x * 20, -position.z * 20);
    ctx.scale(scale.x, scale.z);

    if (obj.type === 'cube') {
      // Dibujar cubo
      const size = 20;
      ctx.fillStyle = selected ? '#4a9eff' : '#666666';
      ctx.strokeStyle = selected ? '#ffffff' : '#444444';
      ctx.lineWidth = selected ? 2 : 1;
      
      ctx.fillRect(-size/2, -size/2, size, size);
      ctx.strokeRect(-size/2, -size/2, size, size);
      
      // Etiqueta del objeto
      if (selected) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(obj.name, 0, -size/2 - 10);
      }
    } else if (obj.type === 'light') {
      // Dibujar luz
      const size = 15;
      ctx.fillStyle = '#ffff44';
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Rayos de luz
      ctx.strokeStyle = '#ffff44';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x = Math.cos(angle) * (size + 10);
        const y = Math.sin(angle) * (size + 10);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  };

  // Dibujar gizmo de transformación
  const drawGizmo = (ctx: CanvasRenderingContext2D) => {
    const selectedObject = sceneObjects.find(obj => obj.selected);
    if (!selectedObject) return;

    const { position } = selectedObject;
    ctx.save();
    ctx.translate(position.x * 20, -position.z * 20);

    const gizmoSize = 30;
    
    if (activeTool === 'move') {
      // Gizmo de movimiento
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(gizmoSize, 0);
      ctx.stroke();
      
      ctx.strokeStyle = '#44ff44';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -gizmoSize);
      ctx.stroke();
      
      ctx.strokeStyle = '#4444ff';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-gizmoSize * 0.7, -gizmoSize * 0.7);
      ctx.stroke();
    } else if (activeTool === 'rotate') {
      // Gizmo de rotación
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, gizmoSize, 0, Math.PI * 2);
      ctx.stroke();
    } else if (activeTool === 'scale') {
      // Gizmo de escala
      const handleSize = 8;
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(gizmoSize - handleSize/2, -handleSize/2, handleSize, handleSize);
      
      ctx.fillStyle = '#44ff44';
      ctx.fillRect(-handleSize/2, -gizmoSize - handleSize/2, handleSize, handleSize);
      
      ctx.fillStyle = '#4444ff';
      ctx.fillRect(-gizmoSize * 0.7 - handleSize/2, -gizmoSize * 0.7 - handleSize/2, handleSize, handleSize);
    }

    ctx.restore();
  };

  // Eventos del mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (e.buttons === 1) { // Botón izquierdo - rotar cámara
      setCamera(prev => ({
        ...prev,
        rotation: {
          x: prev.rotation.x + deltaY * 0.5,
          y: prev.rotation.y + deltaX * 0.5,
          z: prev.rotation.z
        }
      }));
    } else if (e.buttons === 2) { // Botón derecho - pan
      setCamera(prev => ({
        ...prev,
        position: {
          x: prev.position.x - deltaX * 0.1,
          y: prev.position.y,
          z: prev.position.z + deltaY * 0.1
        }
      }));
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(5, prev.zoom * zoomDelta))
    }));
  };

  // Renderizar escena cuando cambien las dependencias
  useEffect(() => {
    renderScene();
  }, [renderScene]);

  return (
    <div className="viewport-3d-container" ref={containerRef}>
      {/* Controles de viewport */}
      <div className="viewport-controls-overlay">
        <div className="viewport-controls-top">
          <div className="viewport-mode-controls">
            <button 
              className={`viewport-mode-btn ${viewportMode === 'perspective' ? 'active' : ''}`}
              onClick={() => setViewportMode('perspective')}
              title="Perspective View"
            >
              🔍
            </button>
            <button 
              className={`viewport-mode-btn ${viewportMode === 'orthographic' ? 'active' : ''}`}
              onClick={() => setViewportMode('orthographic')}
              title="Orthographic View"
            >
              📐
            </button>
          </div>
          
          <div className="viewport-display-controls">
            <button 
              className={`display-control-btn ${showGrid ? 'active' : ''}`}
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid"
            >
              🔲
            </button>
            <button 
              className={`display-control-btn ${showAxes ? 'active' : ''}`}
              onClick={() => setShowAxes(!showAxes)}
              title="Toggle Axes"
            >
              📏
            </button>
            <button 
              className={`display-control-btn ${showWireframe ? 'active' : ''}`}
              onClick={() => setShowWireframe(!showWireframe)}
              title="Toggle Wireframe"
            >
              🔗
            </button>
            <button 
              className={`display-control-btn ${showGizmo ? 'active' : ''}`}
              onClick={() => setShowGizmo(!showGizmo)}
              title="Toggle Gizmo"
            >
              🎯
            </button>
          </div>
        </div>
        
        <div className="viewport-info">
          <span className="viewport-mode-label">{viewportMode.toUpperCase()}</span>
          <span className="camera-info">
            Pos: ({camera.position.x.toFixed(1)}, {camera.position.y.toFixed(1)}, {camera.position.z.toFixed(1)})
          </span>
          <span className="zoom-info">Zoom: {(camera.zoom * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Canvas 3D */}
      <canvas
        ref={canvasRef}
        className="viewport-3d-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Overlay de herramientas */}
      <div className="viewport-tools-overlay">
        <div className="tool-indicator">
          <span className="tool-icon">
            {activeTool === 'select' && '👆'}
            {activeTool === 'move' && '✋'}
            {activeTool === 'rotate' && '🔄'}
            {activeTool === 'scale' && '📏'}
          </span>
          <span className="tool-name">{activeTool.toUpperCase()}</span>
        </div>
        
        <div className="viewport-help">
          <span>LMB: Rotate Camera | RMB: Pan | Scroll: Zoom</span>
        </div>
      </div>

      {/* Panel de objetos de la escena */}
      <div className="scene-objects-panel">
        <h4>Scene Objects</h4>
        <div className="scene-objects-list">
          {sceneObjects.map(obj => (
            <div 
              key={obj.id}
              className={`scene-object-item ${obj.selected ? 'selected' : ''}`}
              onClick={() => {
                setSceneObjects(prev => 
                  prev.map(o => ({ ...o, selected: o.id === obj.id }))
                );
              }}
            >
              <span className="object-icon">
                {obj.type === 'cube' && '📦'}
                {obj.type === 'sphere' && '⚪'}
                {obj.type === 'light' && '💡'}
                {obj.type === 'camera' && '📷'}
              </span>
              <span className="object-name">{obj.name}</span>
            </div>
          ))}
        </div>
        <button className="add-object-btn" title="Add Object">+</button>
      </div>
    </div>
  );
}; 