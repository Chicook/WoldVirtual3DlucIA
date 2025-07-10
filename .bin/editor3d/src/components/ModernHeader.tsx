import React, { useState, useEffect } from 'react';
import './ModernHeader.css';

interface ModernHeaderProps {
  onPublish: () => void;
  isPublishing: boolean;
  onSave?: () => void;
  onExport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  showLucIA?: boolean;
  onToggleLucIA?: () => void;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  onPublish,
  isPublishing,
  onSave,
  onExport,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  projectName = 'Untitled Project',
  onProjectNameChange,
  showLucIA = false,
  onToggleLucIA
}) => {
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState(projectName);
  const [showMenu, setShowMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Efecto para sincronizar el nombre del proyecto
  useEffect(() => {
    setTempProjectName(projectName);
  }, [projectName]);

  // Manejar cambio de nombre del proyecto
  const handleProjectNameSubmit = () => {
    if (onProjectNameChange && tempProjectName.trim()) {
      onProjectNameChange(tempProjectName.trim());
    }
    setIsEditingProjectName(false);
  };

  // Manejar teclas en el input del nombre
  const handleProjectNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleProjectNameSubmit();
    } else if (e.key === 'Escape') {
      setTempProjectName(projectName);
      setIsEditingProjectName(false);
    }
  };

  // Menús desplegables
  const menuItems = {
    file: [
      { label: 'New Project', icon: '📄', action: () => console.log('New Project') },
      { label: 'Open Project', icon: '📁', action: () => console.log('Open Project') },
      { label: 'Save Project', icon: '💾', action: onSave },
      { label: 'Save As...', icon: '💾', action: () => console.log('Save As') },
      { label: 'Export', icon: '📤', action: onExport },
      { label: 'Import', icon: '📥', action: () => console.log('Import') },
      { label: 'Exit', icon: '🚪', action: () => console.log('Exit') }
    ],
    edit: [
      { label: 'Undo', icon: '↶', action: onUndo, disabled: !canUndo },
      { label: 'Redo', icon: '↷', action: onRedo, disabled: !canRedo },
      { label: 'Cut', icon: '✂️', action: () => console.log('Cut') },
      { label: 'Copy', icon: '📋', action: () => console.log('Copy') },
      { label: 'Paste', icon: '📋', action: () => console.log('Paste') },
      { label: 'Delete', icon: '🗑️', action: () => console.log('Delete') },
      { label: 'Select All', icon: '☑️', action: () => console.log('Select All') }
    ],
    view: [
      { label: 'Toggle Left Panel', icon: '◀️', action: () => console.log('Toggle Left Panel') },
      { label: 'Toggle Right Panel', icon: '▶️', action: () => console.log('Toggle Right Panel') },
      { label: 'Toggle Timeline', icon: '⏱️', action: () => console.log('Toggle Timeline') },
      { label: 'Fullscreen', icon: '⛶', action: () => console.log('Fullscreen') },
      { label: 'Reset Layout', icon: '🔄', action: () => console.log('Reset Layout') }
    ],
    tools: [
      { label: 'Select Tool', icon: '👆', action: () => console.log('Select Tool') },
      { label: 'Move Tool', icon: '✋', action: () => console.log('Move Tool') },
      { label: 'Rotate Tool', icon: '🔄', action: () => console.log('Rotate Tool') },
      { label: 'Scale Tool', icon: '📏', action: () => console.log('Scale Tool') },
      { label: 'Paint Tool', icon: '🎨', action: () => console.log('Paint Tool') },
      { label: 'Sculpt Tool', icon: '🗿', action: () => console.log('Sculpt Tool') }
    ],
    render: [
      { label: 'Render Image', icon: '🖼️', action: () => console.log('Render Image') },
      { label: 'Render Animation', icon: '🎬', action: () => console.log('Render Animation') },
      { label: 'Render Settings', icon: '⚙️', action: () => console.log('Render Settings') },
      { label: 'Viewport Render', icon: '👁️', action: () => console.log('Viewport Render') }
    ],
    help: [
      { label: 'Documentation', icon: '📚', action: () => console.log('Documentation') },
      { label: 'Tutorials', icon: '🎓', action: () => console.log('Tutorials') },
      { label: 'Keyboard Shortcuts', icon: '⌨️', action: () => console.log('Shortcuts') },
      { label: 'About', icon: 'ℹ️', action: () => console.log('About') }
    ]
  };

  // Renderizar menú desplegable
  const renderDropdownMenu = (menuKey: string, items: any[]) => (
    <div className={`dropdown-menu ${activeMenu === menuKey ? 'active' : ''}`}>
      {items.map((item, index) => (
        <button
          key={index}
          className={`dropdown-item ${item.disabled ? 'disabled' : ''}`}
          onClick={item.disabled ? undefined : item.action}
          disabled={item.disabled}
        >
          <span className="dropdown-icon">{item.icon}</span>
          <span className="dropdown-label">{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <header className="modern-header">
      {/* Logo y nombre del proyecto */}
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🎨</span>
          <span className="logo-text">WoldVirtual3D</span>
        </div>
        
        <div className="project-info">
          {isEditingProjectName ? (
            <input
              type="text"
              className="project-name-input"
              value={tempProjectName}
              onChange={(e) => setTempProjectName(e.target.value)}
              onKeyDown={handleProjectNameKeyDown}
              onBlur={handleProjectNameSubmit}
              autoFocus
            />
          ) : (
            <button
              className="project-name-btn"
              onClick={() => setIsEditingProjectName(true)}
              title="Click to edit project name"
            >
              <span className="project-name">{projectName}</span>
              <span className="edit-icon">✏️</span>
            </button>
          )}
        </div>
      </div>

      {/* Menús principales */}
      <div className="header-center">
        <nav className="main-menu">
          {Object.entries(menuItems).map(([menuKey, items]) => (
            <div key={menuKey} className="menu-item">
              <button
                className={`menu-button ${activeMenu === menuKey ? 'active' : ''}`}
                onClick={() => setActiveMenu(activeMenu === menuKey ? null : menuKey)}
                onMouseEnter={() => setActiveMenu(menuKey)}
              >
                {menuKey.charAt(0).toUpperCase() + menuKey.slice(1)}
              </button>
              {renderDropdownMenu(menuKey, items)}
            </div>
          ))}
        </nav>
      </div>

      {/* Controles del lado derecho */}
      <div className="header-right">
        {/* Herramientas rápidas */}
        <div className="quick-tools">
          <button
            className={`tool-btn ${canUndo ? '' : 'disabled'}`}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <span className="tool-icon">↶</span>
          </button>
          
          <button
            className={`tool-btn ${canRedo ? '' : 'disabled'}`}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <span className="tool-icon">↷</span>
          </button>
          
          <div className="tool-separator"></div>
          
          <button
            className="tool-btn"
            onClick={onSave}
            title="Save (Ctrl+S)"
          >
            <span className="tool-icon">💾</span>
          </button>
        </div>

        {/* Botón LucIA */}
        {onToggleLucIA && (
          <button
            className={`lucia-btn ${showLucIA ? 'active' : ''}`}
            onClick={onToggleLucIA}
            title="Toggle LucIA Assistant"
          >
            <span className="lucia-icon">🤖</span>
          </button>
        )}

        {/* Botón de publicación principal */}
        <button
          className={`publish-button ${isPublishing ? 'publishing' : ''}`}
          onClick={onPublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <>
              <span className="spinner"></span>
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <span className="publish-icon">🚀</span>
              <span>Publish</span>
            </>
          )}
        </button>
      </div>

      {/* Overlay para cerrar menús */}
      {activeMenu && (
        <div
          className="menu-overlay"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </header>
  );
};

export default ModernHeader; 