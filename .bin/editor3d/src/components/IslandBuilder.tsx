import React, { useState } from 'react';

interface IslandObject {
  id: string;
  name: string;
  type: 'terrain' | 'building' | 'decoration' | 'spawn' | 'portal';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  properties: Record<string, any>;
}

const IslandBuilder: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<'terrain' | 'building' | 'decoration' | 'spawn'>('terrain');
  const [islandObjects, setIslandObjects] = useState<IslandObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<IslandObject | null>(null);

  const terrainTools = [
    { name: 'Plane', icon: '⬜', description: 'Terreno plano' },
    { name: 'Hill', icon: '🏔️', description: 'Colina' },
    { name: 'Mountain', icon: '⛰️', description: 'Montaña' },
    { name: 'Water', icon: '💧', description: 'Agua' }
  ];

  const buildingTools = [
    { name: 'House', icon: '🏠', description: 'Casa básica' },
    { name: 'Tower', icon: '🗼', description: 'Torre' },
    { name: 'Bridge', icon: '🌉', description: 'Puente' },
    { name: 'Portal', icon: '🌀', description: 'Portal de teleportación' }
  ];

  const decorationTools = [
    { name: 'Tree', icon: '🌳', description: 'Árbol' },
    { name: 'Rock', icon: '🪨', description: 'Roca' },
    { name: 'Flower', icon: '🌸', description: 'Flor' },
    { name: 'Light', icon: '💡', description: 'Luz' }
  ];

  const spawnTools = [
    { name: 'Spawn Point', icon: '📍', description: 'Punto de aparición' },
    { name: 'Safe Zone', icon: '🛡️', description: 'Zona segura' },
    { name: 'Info Point', icon: 'ℹ️', description: 'Punto de información' }
  ];

  const addObject = (type: string, name: string) => {
    const newObject: IslandObject = {
      id: `obj_${Date.now()}`,
      name,
      type: type as any,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      properties: {}
    };

    setIslandObjects([...islandObjects, newObject]);
    setSelectedObject(newObject);
  };

  const removeObject = (id: string) => {
    setIslandObjects(islandObjects.filter(obj => obj.id !== id));
    if (selectedObject?.id === id) {
      setSelectedObject(null);
    }
  };

  const saveIsland = () => {
    const islandData = {
      name: 'Isla Inicial del Metaverso',
      objects: islandObjects,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0',
        description: 'Isla inicial donde los usuarios aparecen al registrarse'
      }
    };
    
    console.log('Guardando isla:', islandData);
    alert('Isla guardada. Se aplicará como isla inicial en el metaverso.');
  };

  const getToolList = () => {
    switch (selectedTool) {
      case 'terrain': return terrainTools;
      case 'building': return buildingTools;
      case 'decoration': return decorationTools;
      case 'spawn': return spawnTools;
      default: return [];
    }
  };

  return (
    <div style={{ 
      height: '100%',
      background: '#1e1e1e',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        height: '30px', 
        background: '#252525',
        borderBottom: '1px solid #404040',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: '11px'
      }}>
        <span style={{ color: '#ccc', marginRight: '8px' }}>Island Builder</span>
        
        <button 
          onClick={saveIsland}
          style={{
            padding: '2px 8px',
            background: '#28a745',
            color: '#fff',
            border: '1px solid #1e7e34',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px',
            marginLeft: 'auto'
          }}
        >
          💾 Guardar Isla
        </button>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Tools */}
        <div style={{ 
          width: '200px', 
          background: '#252525',
          borderRight: '1px solid #404040',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Tool Categories */}
          <div style={{ 
            padding: '8px',
            borderBottom: '1px solid #404040',
            fontSize: '11px',
            color: '#ccc'
          }}>
            Tools
          </div>
          
          <div style={{ 
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <button
              onClick={() => setSelectedTool('terrain')}
              style={{
                padding: '6px 8px',
                background: selectedTool === 'terrain' ? '#007acc' : '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px',
                textAlign: 'left'
              }}
            >
              🏔️ Terrain
            </button>
            <button
              onClick={() => setSelectedTool('building')}
              style={{
                padding: '6px 8px',
                background: selectedTool === 'building' ? '#007acc' : '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px',
                textAlign: 'left'
              }}
            >
              🏠 Buildings
            </button>
            <button
              onClick={() => setSelectedTool('decoration')}
              style={{
                padding: '6px 8px',
                background: selectedTool === 'decoration' ? '#007acc' : '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px',
                textAlign: 'left'
              }}
            >
              🌳 Decorations
            </button>
            <button
              onClick={() => setSelectedTool('spawn')}
              style={{
                padding: '6px 8px',
                background: selectedTool === 'spawn' ? '#007acc' : '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px',
                textAlign: 'left'
              }}
            >
              📍 Spawn Points
            </button>
          </div>

          {/* Tool List */}
          <div style={{ 
            flex: 1,
            padding: '8px',
            overflowY: 'auto'
          }}>
            <div style={{ 
              fontSize: '11px',
              color: '#ccc',
              marginBottom: '8px'
            }}>
              {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} Tools
            </div>
            
            {getToolList().map(tool => (
              <div
                key={tool.name}
                onClick={() => addObject(selectedTool, tool.name)}
                style={{
                  padding: '8px',
                  background: '#333',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '16px' }}>{tool.icon}</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>
                    {tool.name}
                  </div>
                  <div style={{ color: '#666', fontSize: '9px' }}>
                    {tool.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - 3D View */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          background: '#2b2b2b'
        }}>
          {/* 3D View Header */}
          <div style={{ 
            height: '30px', 
            background: '#252525',
            borderBottom: '1px solid #404040',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            fontSize: '11px',
            color: '#ccc'
          }}>
            <span>3D View - Isla Inicial</span>
            <div style={{ flex: 1 }} />
            <span>Objetos: {islandObjects.length}</span>
          </div>

          {/* 3D View Content */}
          <div style={{ 
            flex: 1,
            background: '#2b2b2b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏝️</div>
              <div>Vista 3D de la Isla Inicial</div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>
                Usa las herramientas de la izquierda para construir
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Object List & Properties */}
        <div style={{ 
          width: '250px', 
          background: '#252525',
          borderLeft: '1px solid #404040',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Object List */}
          <div style={{ 
            height: '50%',
            borderBottom: '1px solid #404040'
          }}>
            <div style={{ 
              padding: '8px',
              borderBottom: '1px solid #404040',
              fontSize: '11px',
              color: '#ccc'
            }}>
              Objects ({islandObjects.length})
            </div>
            
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              padding: '4px'
            }}>
              {islandObjects.map(obj => (
                <div
                  key={obj.id}
                  onClick={() => setSelectedObject(obj)}
                  style={{
                    padding: '6px 8px',
                    background: selectedObject?.id === obj.id ? '#007acc' : 'transparent',
                    color: selectedObject?.id === obj.id ? '#fff' : '#ccc',
                    cursor: 'pointer',
                    fontSize: '10px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{obj.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeObject(obj.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Properties */}
          <div style={{ 
            flex: 1,
            padding: '8px'
          }}>
            <div style={{ 
              fontSize: '11px',
              color: '#ccc',
              marginBottom: '8px'
            }}>
              Properties
            </div>
            
            {selectedObject ? (
              <div style={{ fontSize: '10px' }}>
                <div style={{ color: '#ccc', marginBottom: '8px' }}>
                  {selectedObject.name} ({selectedObject.type})
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>
                    Position X
                  </label>
                  <input
                    type="number"
                    value={selectedObject.position.x}
                    onChange={(e) => {
                      const newObj = { ...selectedObject };
                      newObj.position.x = parseFloat(e.target.value) || 0;
                      setSelectedObject(newObj);
                      setIslandObjects(islandObjects.map(obj => 
                        obj.id === selectedObject.id ? newObj : obj
                      ));
                    }}
                    style={{
                      width: '100%',
                      padding: '2px 4px',
                      background: '#333',
                      border: '1px solid #555',
                      color: '#ccc',
                      fontSize: '10px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>
                    Position Y
                  </label>
                  <input
                    type="number"
                    value={selectedObject.position.y}
                    onChange={(e) => {
                      const newObj = { ...selectedObject };
                      newObj.position.y = parseFloat(e.target.value) || 0;
                      setSelectedObject(newObj);
                      setIslandObjects(islandObjects.map(obj => 
                        obj.id === selectedObject.id ? newObj : obj
                      ));
                    }}
                    style={{
                      width: '100%',
                      padding: '2px 4px',
                      background: '#333',
                      border: '1px solid #555',
                      color: '#ccc',
                      fontSize: '10px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ color: '#ccc', display: 'block', marginBottom: '4px' }}>
                    Position Z
                  </label>
                  <input
                    type="number"
                    value={selectedObject.position.z}
                    onChange={(e) => {
                      const newObj = { ...selectedObject };
                      newObj.position.z = parseFloat(e.target.value) || 0;
                      setSelectedObject(newObj);
                      setIslandObjects(islandObjects.map(obj => 
                        obj.id === selectedObject.id ? newObj : obj
                      ));
                    }}
                    style={{
                      width: '100%',
                      padding: '2px 4px',
                      background: '#333',
                      border: '1px solid #555',
                      color: '#ccc',
                      fontSize: '10px'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ color: '#666', fontSize: '10px' }}>
                Selecciona un objeto para ver sus propiedades
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IslandBuilder; 