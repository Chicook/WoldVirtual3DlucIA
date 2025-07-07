import React from 'react';
import { useEditor } from '../contexts/EditorContext';

const SceneEditor: React.FC = () => {
  const { 
    state, 
    addObject, 
    removeObject, 
    selectObject, 
    setEditMode, 
    saveScene, 
    loadScene, 
    exportScene 
  } = useEditor();

  const handleAddObject = (type: string) => {
    addObject(type);
  };

  const handleRemoveObject = () => {
    if (state.selectedObject) {
      removeObject(state.selectedObject.id);
    }
  };

  const handleDuplicateObject = () => {
    if (state.selectedObject) {
      const newObject = addObject(
        state.selectedObject.geometry?.toLowerCase().replace('Geometry', '') || 'cube',
        `${state.selectedObject.name}_copy`
      );
      // Copiar propiedades del objeto seleccionado
      selectObject(newObject);
    }
  };

  return (
    <div style={{ 
      padding: '16px', 
      background: '#1a1a1a', 
      borderTop: '1px solid #333',
      minHeight: '120px'
    }}>
      {/* Edit Mode Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={() => setEditMode('select')}
          style={{ 
            padding: '8px 16px', 
            background: state.editMode === 'select' ? '#007acc' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Select
        </button>
        <button 
          onClick={() => setEditMode('move')}
          style={{ 
            padding: '8px 16px', 
            background: state.editMode === 'move' ? '#007acc' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Move
        </button>
        <button 
          onClick={() => setEditMode('rotate')}
          style={{ 
            padding: '8px 16px', 
            background: state.editMode === 'rotate' ? '#007acc' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Rotate
        </button>
        <button 
          onClick={() => setEditMode('scale')}
          style={{ 
            padding: '8px 16px', 
            background: state.editMode === 'scale' ? '#007acc' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Scale
        </button>
      </div>

      {/* Add Object Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={() => handleAddObject('cube')}
          style={{ 
            padding: '8px 16px', 
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Cube
        </button>
        <button 
          onClick={() => handleAddObject('sphere')}
          style={{ 
            padding: '8px 16px', 
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Sphere
        </button>
        <button 
          onClick={() => handleAddObject('cylinder')}
          style={{ 
            padding: '8px 16px', 
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Cylinder
        </button>
        <button 
          onClick={() => handleAddObject('plane')}
          style={{ 
            padding: '8px 16px', 
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Plane
        </button>
      </div>

      {/* Scene Management Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={saveScene}
          style={{ 
            padding: '8px 16px', 
            background: '#17a2b8',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Save Scene
        </button>
        <button 
          onClick={loadScene}
          style={{ 
            padding: '8px 16px', 
            background: '#17a2b8',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Load Scene
        </button>
        <button 
          onClick={exportScene}
          style={{ 
            padding: '8px 16px', 
            background: '#17a2b8',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export
        </button>
      </div>

      {/* Object Management Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={handleRemoveObject}
          disabled={!state.selectedObject}
          style={{ 
            padding: '8px 16px', 
            background: state.selectedObject ? '#dc3545' : '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: state.selectedObject ? 'pointer' : 'not-allowed'
          }}
        >
          Delete
        </button>
        <button 
          onClick={handleDuplicateObject}
          disabled={!state.selectedObject}
          style={{ 
            padding: '8px 16px', 
            background: state.selectedObject ? '#28a745' : '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: state.selectedObject ? 'pointer' : 'not-allowed'
          }}
        >
          Duplicate
        </button>
      </div>

      {/* Status Information */}
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#ccc' }}>
        <strong>Edit Mode:</strong> {state.editMode} | 
        <strong> Objects:</strong> {state.sceneObjects.length} | 
        <strong> Selected:</strong> {state.selectedObject ? state.selectedObject.name : 'None'}
      </div>
    </div>
  );
};

export default SceneEditor; 