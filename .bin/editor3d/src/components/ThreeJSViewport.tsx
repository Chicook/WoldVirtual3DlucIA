import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import EditorIntegration from '../core/EditorIntegration';
import './ThreeJSViewport.css';

export const ThreeJSViewport: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorIntegration | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Inicializar el editor con las funciones JavaScript integradas
    editorRef.current = new EditorIntegration();
    editorRef.current.initialize(mount);
    
    setIsReady(true);

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="threejs-viewport-container">
      <div className="viewport-header">
        <h3>Zona 3D de Trabajo</h3>
        <div className="viewport-status">
          <span className="status-indicator active"></span>
          <span>Activo</span>
        </div>
      </div>
      
      <div 
        ref={mountRef} 
        className="threejs-canvas-container"
        style={{ 
          width: '100%', 
          height: 'calc(100% - 50px)',
          background: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '4px'
        }}
      >
        {!isReady && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Cargando editor 3D...</p>
          </div>
        )}
      </div>
    </div>
  );
}; 