import React from 'react';
import './EditorUI.css';

const Header: React.FC<{onPublish?: () => void, isPublishing?: boolean}> = ({ onPublish, isPublishing }) => (
  <header className="editorui-header">
    <div className="editorui-header-left">
      <span className="editorui-logo">🌐</span>
      <span className="editorui-title">WoldVirtual3DlucIA</span>
    </div>
    <div className="editorui-header-center">
      {/* Espacio para menú contextual, breadcrumbs, etc. */}
    </div>
    <div className="editorui-header-right">
      {/* Usuario futuro */}
      <button className={`editorui-publish-btn${isPublishing ? ' publishing' : ''}`} onClick={onPublish} disabled={isPublishing}>
        {isPublishing ? <span className="editorui-spinner"></span> : <span className="editorui-publish-icon">🚀</span>}
        {isPublishing ? 'Publicando...' : 'Publicar Escena'}
      </button>
    </div>
  </header>
);

export default Header; 