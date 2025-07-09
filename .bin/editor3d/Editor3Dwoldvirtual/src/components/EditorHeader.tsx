import React from 'react';

const EditorHeader: React.FC = () => {
  return (
    <header className="editor-header">
      <div className="header-left">
        <h1>Editor 3D WoldVirtual</h1>
        <span className="version">v1.0.0</span>
      </div>
      <div className="header-center">
        <div className="toolbar">
          <button className="tool-btn active" title="Seleccionar">
            <i className="icon-select" />
          </button>
          <button className="tool-btn" title="Mover">
            <i className="icon-move" />
          </button>
          <button className="tool-btn" title="Rotar">
            <i className="icon-rotate" />
          </button>
          <button className="tool-btn" title="Escalar">
            <i className="icon-scale" />
          </button>
        </div>
      </div>
      <div className="header-right">
        <button className="btn-primary">Guardar</button>
        <button className="btn-secondary">Cargar</button>
        <button className="btn-secondary">Exportar</button>
      </div>
    </header>
  );
};

export default EditorHeader; 