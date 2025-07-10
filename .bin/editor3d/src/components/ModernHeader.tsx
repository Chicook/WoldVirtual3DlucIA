import React, { useState } from 'react';
import './ModernHeader.css';

interface ModernHeaderProps {
  onPublish?: () => void;
  isPublishing?: boolean;
  onToolSelect?: (tool: string) => void;
}

const sceneObjects = [
  { type: 'cube', label: 'Cubo' },
  { type: 'sphere', label: 'Esfera' },
  { type: 'cylinder', label: 'Cilindro' },
];

const tools = [
  { key: 'stretch', label: 'Estirar' },
  { key: 'duplicate', label: 'Duplicar' },
  { key: 'extrude', label: 'Extruir' },
  { key: 'animate', label: 'Animar' },
];

export const ModernHeader: React.FC<ModernHeaderProps> = ({ onPublish, isPublishing, onToolSelect }) => {
  const [sceneMenuOpen, setSceneMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [sceneMenuMinimized, setSceneMenuMinimized] = useState(false);
  const [toolsMenuMinimized, setToolsMenuMinimized] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolClick = (tool: string) => {
    setSelectedTool(tool);
    setToolsMenuOpen(false);
    if (onToolSelect) onToolSelect(tool);
  };

  const handleSceneMenuToggle = () => {
    if (sceneMenuOpen) {
      setSceneMenuOpen(false);
      setSceneMenuMinimized(false);
    } else {
      setSceneMenuOpen(true);
      setSceneMenuMinimized(false);
    }
  };

  const handleToolsMenuToggle = () => {
    if (toolsMenuOpen) {
      setToolsMenuOpen(false);
      setToolsMenuMinimized(false);
    } else {
      setToolsMenuOpen(true);
      setToolsMenuMinimized(false);
    }
  };

  const closeSceneMenu = () => {
    setSceneMenuOpen(false);
    setSceneMenuMinimized(false);
  };

  const closeToolsMenu = () => {
    setToolsMenuOpen(false);
    setToolsMenuMinimized(false);
  };

  const minimizeSceneMenu = () => {
    setSceneMenuMinimized(!sceneMenuMinimized);
  };

  const minimizeToolsMenu = () => {
    setToolsMenuMinimized(!toolsMenuMinimized);
  };

  return (
    <header className="modern-header">
      <nav className="main-menu">
        <button 
          className={`menu-btn${sceneMenuOpen ? ' active' : ''}`} 
          onClick={handleSceneMenuToggle}
        >
          Scene
        </button>
        <button 
          className={`menu-btn${toolsMenuOpen ? ' active' : ''}`} 
          onClick={handleToolsMenuToggle}
        >
          Herramientas
        </button>
      </nav>
      <div className="editor-title">Editor3DWoldVirtuallucIA</div>
      <button className="publish-btn" onClick={onPublish} disabled={isPublishing}>
        {isPublishing ? 'Publicando...' : 'Publicar'}
      </button>
      
      {/* Menú de Escena */}
      {sceneMenuOpen && (
        <div className={`scene-menu-dropdown${sceneMenuMinimized ? ' minimized' : ''}`}>
          <div className="menu-header">
            <div className="menu-title">Jerarquía de Escena</div>
            <div className="menu-controls">
              <button 
                className="menu-control-btn minimize-btn" 
                onClick={minimizeSceneMenu}
                title={sceneMenuMinimized ? "Expandir" : "Minimizar"}
              >
                {sceneMenuMinimized ? '□' : '−'}
              </button>
              <button 
                className="menu-control-btn close-btn" 
                onClick={closeSceneMenu}
                title="Cerrar"
              >
                ×
              </button>
            </div>
          </div>
          {!sceneMenuMinimized && (
            <div className="menu-content">
              <div className="scene-hierarchy">
                <div className="hierarchy-item">
                  <span className="hierarchy-icon">📁</span>
                  <span className="hierarchy-label">Escena Principal</span>
                </div>
                <div className="hierarchy-item">
                  <span className="hierarchy-icon">📦</span>
                  <span className="hierarchy-label">Cubo (Seleccionado)</span>
                </div>
                <div className="hierarchy-item">
                  <span className="hierarchy-icon">🔵</span>
                  <span className="hierarchy-label">Esfera</span>
                </div>
              </div>
              <div className="add-object-section">
                <div className="section-title">Añadir objeto</div>
                {sceneObjects.map(obj => (
                  <button key={obj.type} className="scene-menu-item">
                    {obj.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Menú de Herramientas */}
      {toolsMenuOpen && (
        <div className={`tools-menu-dropdown${toolsMenuMinimized ? ' minimized' : ''}`}>
          <div className="menu-header">
            <div className="menu-title">Herramientas de Edición</div>
            <div className="menu-controls">
              <button 
                className="menu-control-btn minimize-btn" 
                onClick={minimizeToolsMenu}
                title={toolsMenuMinimized ? "Expandir" : "Minimizar"}
              >
                {toolsMenuMinimized ? '□' : '−'}
              </button>
              <button 
                className="menu-control-btn close-btn" 
                onClick={closeToolsMenu}
                title="Cerrar"
              >
                ×
              </button>
            </div>
          </div>
          {!toolsMenuMinimized && (
            <div className="menu-content">
              {tools.map(tool => (
                <button
                  key={tool.key}
                  className={`tools-menu-item${selectedTool === tool.key ? ' selected' : ''}`}
                  onClick={() => handleToolClick(tool.key)}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default ModernHeader; 