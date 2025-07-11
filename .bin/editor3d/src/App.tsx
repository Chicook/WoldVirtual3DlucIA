import React, { useState } from 'react';
import ModernHeader from './components/ModernHeader';
import { ThreeJSViewport } from './components/ThreeJSViewport';
import './components/ThreeJSViewport.css';
import './styles/modern-editor-theme.css';
import './styles/blender-godot-animations.css';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [projectName] = useState('WoldVirtual3D Project');

  const handleToolChange = (tool: string) => {
    setActiveTool(tool);
    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Tool changed to:', tool);
    }
  };

  const handleObjectSelect = (object: any) => {
    setSelectedObject(object);
    // Solo log en desarrollo y si hay cambio real
    if (process.env.NODE_ENV === 'development' && object !== selectedObject) {
      console.log('🎯 Selected object:', object?.name || 'Unnamed object');
    }
  };

  const handlePublish = () => {
    console.log('🚀 Publishing project:', projectName);
    // Aquí iría la lógica de publicación
  };

  return (
    <div className="editor-root" style={{ width: '100vw', height: '100vh', background: '#181a20' }}>
      <ModernHeader 
        onPublish={handlePublish}
        isPublishing={false}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
        <ThreeJSViewport 
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onObjectSelect={handleObjectSelect}
          projectName={projectName}
        />
      </main>
    </div>
  );
};

export default App;
