import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ResizablePanel.css';

interface ResizablePanelProps {
  children: React.ReactNode;
  direction: 'horizontal' | 'vertical';
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  onResize?: (size: number) => void;
  className?: string;
  style?: React.CSSProperties;
  resizeHandleClass?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  collapseThreshold?: number;
  snapToGrid?: boolean;
  gridSize?: number;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  direction = 'horizontal',
  minSize = 200,
  maxSize = 800,
  defaultSize = 300,
  onResize,
  className = '',
  style = {},
  resizeHandleClass = '',
  isCollapsed = false,
  onToggleCollapse,
  collapseThreshold = 50,
  snapToGrid = false,
  gridSize = 10
}) => {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [startSize, setStartSize] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // Función para calcular el tamaño basado en la dirección
  const getSizeStyle = useCallback(() => {
    if (isCollapsed) {
      return direction === 'horizontal' ? { width: '40px' } : { height: '40px' };
    }
    
    const finalSize = snapToGrid ? Math.round(size / gridSize) * gridSize : size;
    return direction === 'horizontal' ? { width: `${finalSize}px` } : { height: `${finalSize}px` };
  }, [size, isCollapsed, direction, snapToGrid, gridSize]);

  // Función para manejar el inicio del resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartPos(direction === 'horizontal' ? e.clientX : e.clientY);
    setStartSize(size);
    
    // Agregar listeners globales
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [direction, size]);

  // Función para manejar el movimiento del mouse durante resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - startPos;
    let newSize = startSize + delta;

    // Aplicar límites
    newSize = Math.max(minSize, Math.min(maxSize, newSize));

    // Snap to grid si está habilitado
    if (snapToGrid) {
      newSize = Math.round(newSize / gridSize) * gridSize;
    }

    setSize(newSize);
    
    // Llamar callback si existe
    if (onResize) {
      onResize(newSize);
    }
  }, [isResizing, startPos, startSize, direction, minSize, maxSize, snapToGrid, gridSize, onResize]);

  // Función para manejar el fin del resize
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    
    // Remover listeners globales
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  // Función para manejar doble clic en el handle
  const handleDoubleClick = useCallback(() => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  }, [onToggleCollapse]);

  // Función para manejar teclas durante resize
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isResizing) return;

    let newSize = size;
    const step = e.shiftKey ? gridSize * 5 : gridSize;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        newSize = Math.max(minSize, size - step);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        newSize = Math.min(maxSize, size + step);
        break;
      case 'Home':
        newSize = minSize;
        break;
      case 'End':
        newSize = maxSize;
        break;
      case 'Escape':
        setSize(startSize);
        handleMouseUp();
        return;
      default:
        return;
    }

    e.preventDefault();
    setSize(newSize);
    
    if (onResize) {
      onResize(newSize);
    }
  }, [isResizing, size, minSize, maxSize, gridSize, startSize, handleMouseUp, onResize]);

  // Efecto para manejar eventos de teclado
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isResizing, handleKeyDown]);

  // Efecto para limpiar listeners al desmontar
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [handleMouseMove, handleMouseUp, handleKeyDown]);

  // Función para resetear el tamaño
  const resetSize = useCallback(() => {
    setSize(defaultSize);
    if (onResize) {
      onResize(defaultSize);
    }
  }, [defaultSize, onResize]);

  // Función para maximizar el panel
  const maximizeSize = useCallback(() => {
    setSize(maxSize);
    if (onResize) {
      onResize(maxSize);
    }
  }, [maxSize, onResize]);

  // Función para minimizar el panel
  const minimizeSize = useCallback(() => {
    setSize(minSize);
    if (onResize) {
      onResize(minSize);
    }
  }, [minSize, onResize]);

  // Renderizar el handle de resize
  const renderResizeHandle = () => {
    const handleClasses = [
      'resize-handle',
      `resize-handle-${direction}`,
      resizeHandleClass,
      isResizing ? 'resizing' : ''
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={handleRef}
        className={handleClasses}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title={`Drag to resize${onToggleCollapse ? ', double-click to toggle' : ''}`}
      >
        <div className="resize-indicator">
          {direction === 'horizontal' ? '⋮' : '⋯'}
        </div>
        {isResizing && (
          <div className="resize-overlay">
            <div className="resize-info">
              {direction === 'horizontal' ? `${size}px` : `${size}px`}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizar controles de resize
  const renderResizeControls = () => {
    if (!isResizing) return null;

    return (
      <div className="resize-controls">
        <button 
          className="resize-control-btn"
          onClick={resetSize}
          title="Reset size (R)"
        >
          ↺
        </button>
        <button 
          className="resize-control-btn"
          onClick={minimizeSize}
          title="Minimize (Home)"
        >
          −
        </button>
        <button 
          className="resize-control-btn"
          onClick={maximizeSize}
          title="Maximize (End)"
        >
          +
        </button>
        <button 
          className="resize-control-btn"
          onClick={handleMouseUp}
          title="Cancel (Esc)"
        >
          ✕
        </button>
      </div>
    );
  };

  // Clases del panel
  const panelClasses = [
    'resizable-panel',
    `resizable-panel-${direction}`,
    isCollapsed ? 'collapsed' : '',
    isResizing ? 'resizing' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={panelRef}
      className={panelClasses}
      style={{
        ...getSizeStyle(),
        ...style
      }}
    >
      {children}
      {renderResizeHandle()}
      {renderResizeControls()}
      
      {/* Overlay durante resize */}
      {isResizing && (
        <div className="resize-overlay-full" />
      )}
    </div>
  );
};

export default ResizablePanel; 