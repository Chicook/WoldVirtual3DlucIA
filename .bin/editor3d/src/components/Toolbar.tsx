import React from 'react';
import { useEditor } from '../contexts/EditorContext';

const Toolbar: React.FC = () => {
  const { state, setEditMode, removeObject, saveScene, loadScene, exportScene } = useEditor();
  return (
    <div style={{ 
      height: '40px',
      background: '#252525', 
      borderBottom: '1px solid #404040',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      gap: '4px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#fff', fontWeight: 'bold' }}>Editor 3D</span>
        <span style={{ color: '#666', fontSize: '12px' }}>v1.0.0</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Transform Tools */}
      <div style={{ display: 'flex', gap: '2px', marginLeft: '8px' }}>
        <button 
          onClick={() => setEditMode('select')}
          style={{ 
            padding: '4px 8px', 
            background: state.editMode === 'select' ? '#007acc' : '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          title="Select (Q)"
        >
          Select
        </button>
        <button 
          onClick={() => setEditMode('move')}
          style={{ 
            padding: '4px 8px', 
            background: state.editMode === 'move' ? '#007acc' : '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          title="Move (G)"
        >
          Move
        </button>
        <button 
          onClick={() => setEditMode('rotate')}
          style={{ 
            padding: '4px 8px', 
            background: state.editMode === 'rotate' ? '#007acc' : '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          title="Rotate (R)"
        >
          Rotate
        </button>
        <button 
          onClick={() => setEditMode('scale')}
          style={{ 
            padding: '4px 8px', 
            background: state.editMode === 'scale' ? '#007acc' : '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          title="Scale (S)"
        >
          Scale
        </button>
      </div>

      {/* Edit Tools */}
      <div style={{ display: 'flex', gap: '2px', marginLeft: '8px' }}>
        <button 
          style={{ 
            padding: '4px 8px', 
            background: '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button 
          style={{ 
            padding: '4px 8px', 
            background: '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          title="Redo (Ctrl+Y)"
        >
          Redo
        </button>
      </div>

      {/* Publish Tools */}
      <div style={{ display: 'flex', gap: '2px', marginLeft: '8px' }}>
        <button 
          onClick={() => {
            // TODO: Conectar con @/client para publicar la escena
            console.log('Publicando escena en el metaverso...');
            alert('Funcionalidad de publicación en desarrollo. Se conectará con el módulo cliente.');
          }}
          style={{ 
            padding: '4px 12px', 
            background: '#28a745',
            color: '#fff',
            border: '1px solid #1e7e34',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
          title="Publicar en el metaverso"
        >
          🚀 Publicar
        </button>
        <button 
          onClick={saveScene}
          style={{ 
            padding: '4px 8px', 
            background: '#17a2b8',
            color: '#fff',
            border: '1px solid #138496',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          title="Guardar escena"
        >
          💾 Guardar
        </button>
        <button 
          onClick={loadScene}
          style={{ 
            padding: '4px 8px', 
            background: '#17a2b8',
            color: '#fff',
            border: '1px solid #138496',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          title="Cargar escena"
        >
          📂 Cargar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => {
            if (state.selectedObject) {
              removeObject(state.selectedObject.id);
            }
          }}
          disabled={!state.selectedObject}
          style={{ 
            padding: '6px 12px', 
            background: state.selectedObject ? '#dc3545' : '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: state.selectedObject ? 'pointer' : 'not-allowed',
            fontSize: '12px'
          }}
          title="Delete selected object (Del)"
        >
          Delete
        </button>
        <button 
          style={{ 
            padding: '6px 12px', 
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title="Duplicate selected object (Ctrl+D)"
        >
          Duplicate
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          style={{ 
            padding: '6px 12px', 
            background: '#007acc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title="Publish to blockchain (requires WCV)"
        >
          Publish
        </button>
        <button 
          style={{ 
            padding: '6px 12px', 
            background: '#6f42c1',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title="Connect Wallet"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default Toolbar; 