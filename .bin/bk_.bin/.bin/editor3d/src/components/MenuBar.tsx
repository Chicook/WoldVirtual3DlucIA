import React from 'react';

const MenuBar: React.FC = () => {
  return (
    <div style={{ 
      height: '24px', 
      background: '#1e1e1e',
      borderBottom: '1px solid #404040',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      fontSize: '11px'
    }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ color: '#ccc', cursor: 'pointer' }}>File</span>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ color: '#ccc', cursor: 'pointer' }}>Edit</span>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ color: '#ccc', cursor: 'pointer' }}>Object</span>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ color: '#ccc', cursor: 'pointer' }}>View</span>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ color: '#ccc', cursor: 'pointer' }}>Animation</span>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ color: '#ccc', cursor: 'pointer' }}>Render</span>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ color: '#ccc', cursor: 'pointer' }}>Window</span>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ color: '#ccc', cursor: 'pointer' }}>Help</span>
        </div>
      </div>
      
      <div style={{ flex: 1 }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#666', fontSize: '10px' }}>World Virtual Editor</span>
        <span style={{ color: '#666', fontSize: '10px' }}>v1.0.0</span>
      </div>
    </div>
  );
};

export default MenuBar; 