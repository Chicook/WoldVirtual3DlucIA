import React from 'react';
import ModernHeader from './components/ModernHeader';
import { ThreeJSViewport } from './components/ThreeJSViewport';
import './components/ThreeJSViewport.css';
// ELIMINADOS: estilos antiguos que interfieren
// import './styles/modern-editor-theme.css';
// import './styles/blender-godot-animations.css';

const App: React.FC = () => {
  // Props mínimas para ModernHeader
  const noop = () => {};
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#0f1419', // Fondo muy oscuro tipo Blender
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header moderno y prominente */}
      <ModernHeader 
        onPublish={noop}
        isPublishing={false}
      />
      
      {/* Zona 3D de trabajo - OCUPA TODO EL ESPACIO */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 64px)',
        background: '#1a1a1a',
        borderTop: '2px solid #333'
      }}>
        <ThreeJSViewport />
      </main>
    </div>
  );
};

export default App;
