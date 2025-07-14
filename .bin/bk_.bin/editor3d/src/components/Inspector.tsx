import React from 'react';
import { useEditor } from '../contexts/EditorContext';

const Inspector: React.FC = () => {
  const { state, updateObject } = useEditor();
  const selectedObject = state.selectedObject;

  const updateProperty = (path: string, value: any) => {
    if (!selectedObject) return;

    const updates: any = {};
    const keys = path.split('.');
    let current: any = updates;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    updateObject(selectedObject.id, updates);
  };

  if (!selectedObject) {
    return (
      <div style={{ 
        flex: 1,
        background: '#1a1a1a',
        borderRight: '1px solid #333',
        padding: '16px',
        color: '#666',
        fontSize: '12px'
      }}>
        No object selected
      </div>
    );
  }

  return (
    <div style={{ 
      flex: 1,
      background: '#1a1a1a',
      borderRight: '1px solid #333',
      minWidth: '250px',
      maxWidth: '300px'
    }}>
      <div style={{ 
        padding: '12px', 
        borderBottom: '1px solid #333',
        background: '#252525'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: '#fff',
          fontWeight: 'bold'
        }}>
          Inspector
        </h3>
        <div style={{ 
          fontSize: '11px', 
          color: '#666',
          marginTop: '4px'
        }}>
          {selectedObject.name} ({selectedObject.type})
        </div>
      </div>

      <div style={{ 
        padding: '12px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 300px)'
      }}>
        {/* Transform Properties */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '12px', 
            color: '#fff',
            fontWeight: 'bold'
          }}>
            Transform
          </h4>
          
          {/* Position */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ 
              fontSize: '10px', 
              color: '#ccc',
              display: 'block',
              marginBottom: '4px'
            }}>
              Position
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['x', 'y', 'z'].map(axis => (
                <div key={axis} style={{ flex: 1 }}>
                  <input
                    type="number"
                    value={selectedObject.position[axis as keyof typeof selectedObject.position]}
                    onChange={(e) => updateProperty(`position.${axis}`, parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      background: '#333',
                      border: '1px solid #555',
                      color: '#fff',
                      fontSize: '10px',
                      borderRadius: '2px'
                    }}
                    step="0.1"
                  />
                  <div style={{ 
                    fontSize: '8px', 
                    color: '#666',
                    textAlign: 'center',
                    marginTop: '2px'
                  }}>
                    {axis.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rotation */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ 
              fontSize: '10px', 
              color: '#ccc',
              display: 'block',
              marginBottom: '4px'
            }}>
              Rotation (radians)
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['x', 'y', 'z'].map(axis => (
                <div key={axis} style={{ flex: 1 }}>
                  <input
                    type="number"
                    value={selectedObject.rotation[axis as keyof typeof selectedObject.rotation]}
                    onChange={(e) => updateProperty(`rotation.${axis}`, parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      background: '#333',
                      border: '1px solid #555',
                      color: '#fff',
                      fontSize: '10px',
                      borderRadius: '2px'
                    }}
                    step="0.1"
                  />
                  <div style={{ 
                    fontSize: '8px', 
                    color: '#666',
                    textAlign: 'center',
                    marginTop: '2px'
                  }}>
                    {axis.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ 
              fontSize: '10px', 
              color: '#ccc',
              display: 'block',
              marginBottom: '4px'
            }}>
              Scale
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['x', 'y', 'z'].map(axis => (
                <div key={axis} style={{ flex: 1 }}>
                  <input
                    type="number"
                    value={selectedObject.scale[axis as keyof typeof selectedObject.scale]}
                    onChange={(e) => updateProperty(`scale.${axis}`, parseFloat(e.target.value) || 1)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      background: '#333',
                      border: '1px solid #555',
                      color: '#fff',
                      fontSize: '10px',
                      borderRadius: '2px'
                    }}
                    step="0.1"
                    min="0"
                  />
                  <div style={{ 
                    fontSize: '8px', 
                    color: '#666',
                    textAlign: 'center',
                    marginTop: '2px'
                  }}>
                    {axis.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Material Properties */}
        {selectedObject.material && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '12px', 
              color: '#fff',
              fontWeight: 'bold'
            }}>
              Material
            </h4>
            
            <div style={{ marginBottom: '8px' }}>
              <label style={{ 
                fontSize: '10px', 
                color: '#ccc',
                display: 'block',
                marginBottom: '4px'
              }}>
                Color
              </label>
              <input
                type="color"
                value={selectedObject.material.color}
                onChange={(e) => updateProperty('material.color', e.target.value)}
                style={{
                  width: '100%',
                  height: '30px',
                  background: '#333',
                  border: '1px solid #555',
                  borderRadius: '2px'
                }}
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ 
                fontSize: '10px', 
                color: '#ccc',
                display: 'block',
                marginBottom: '4px'
              }}>
                Opacity
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedObject.material.opacity}
                onChange={(e) => updateProperty('material.opacity', parseFloat(e.target.value))}
                style={{
                  width: '100%'
                }}
              />
              <div style={{ 
                fontSize: '10px', 
                color: '#666',
                textAlign: 'center'
              }}>
                {selectedObject.material.opacity}
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ 
                fontSize: '10px', 
                color: '#ccc',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <input
                  type="checkbox"
                  checked={selectedObject.material.transparent}
                  onChange={(e) => updateProperty('material.transparent', e.target.checked)}
                />
                Transparent
              </label>
            </div>
          </div>
        )}

        {/* Geometry Properties */}
        {selectedObject.geometry && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '12px', 
              color: '#fff',
              fontWeight: 'bold'
            }}>
              Geometry
            </h4>
            
            <div style={{ 
              fontSize: '10px', 
              color: '#ccc',
              marginBottom: '4px'
            }}>
              Type: {selectedObject.geometry}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspector; 