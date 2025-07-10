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
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolClick = (tool: string) => {
    setSelectedTool(tool);
    setToolsMenuOpen(false);
    if (onToolSelect) onToolSelect(tool);
  };

  return (
    <header className="modern-header">
      <nav className="main-menu">
        <button className="menu-btn" onClick={() => setSceneMenuOpen(v => !v)}>Scene</button>
        <button className="menu-btn" onClick={() => setToolsMenuOpen(v => !v)}>Herramientas</button>
      </nav>
      <div className="editor-title">Editor3DWoldVirtuallucIA</div>
      <button className="publish-btn" onClick={onPublish} disabled={isPublishing}>
        {isPublishing ? 'Publicando...' : 'Publicar'}
      </button>
      {sceneMenuOpen && (
        <div className="scene-menu-dropdown">
          <div className="scene-menu-title">Añadir objeto</div>
          {sceneObjects.map(obj => (
            <button key={obj.type} className="scene-menu-item">{obj.label}</button>
          ))}
        </div>
      )}
      {toolsMenuOpen && (
        <div className="tools-menu-dropdown">
          <div className="tools-menu-title">Herramientas de edición</div>
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
    </header>
  );
};

export default ModernHeader; 