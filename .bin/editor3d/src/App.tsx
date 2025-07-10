import React from 'react';
import ModernHeader from './components/ModernHeader';
import { ThreeJSViewport } from './components/ThreeJSViewport';
import './components/ThreeJSViewport.css';
import './styles/modern-editor-theme.css';
import './styles/blender-godot-animations.css';

const App: React.FC = () => {
  // Props mínimas para ModernHeader
  const noop = () => {};
  return (
    <div className="editor-root" style={{ width: '100vw', height: '100vh', background: '#181a20' }}>
      <ModernHeader 
        onPublish={noop}
        isPublishing={false}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
        <ThreeJSViewport />
      </main>
    </div>
  );
};

export default App;
