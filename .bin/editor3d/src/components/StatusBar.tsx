import React from 'react';

const StatusBar: React.FC = () => {
  return (
    <div style={{ 
      height: '20px', 
      background: '#1e1e1e',
      borderTop: '1px solid #404040',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      fontSize: '10px',
      color: '#ccc'
    }}>
      <span style={{ marginRight: '16px' }}>Ready</span>
      
      <span style={{ marginRight: '16px' }}>Objects: 3</span>
      
      <span style={{ marginRight: '16px' }}>Vertices: 1,234</span>
      
      <span style={{ marginRight: '16px' }}>Faces: 456</span>
      
      <div style={{ flex: 1 }} />
      
      <span style={{ marginRight: '16px' }}>Cursor: (0.5, 1.2, -0.3)</span>
      
      <span style={{ marginRight: '16px' }}>FPS: 60</span>
      
      <span>Memory: 45MB</span>
    </div>
  );
};

export default StatusBar; 