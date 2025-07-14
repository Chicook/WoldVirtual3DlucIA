import React, { useState } from 'react';
import { useEditor } from '../contexts/EditorContext';

const ObjectPanel: React.FC = () => {
  const { state, selectObject, updateObject } = useEditor();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['scene']));

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const toggleVisibility = (id: string) => {
    const obj = state.sceneObjects.find(o => o.id === id);
    if (obj) {
      updateObject(id, { visible: !obj.visible });
    }
  };

  const renderObject = (obj: any, level: number = 0) => {
    const isExpanded = expandedItems.has(obj.id);
    const isSelected = state.selectedObject?.id === obj.id;
    const hasChildren = obj.children && obj.children.length > 0;

    return (
      <div key={obj.id}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            paddingLeft: `${level * 16 + 8}px`,
            background: isSelected ? '#007acc' : 'transparent',
            cursor: 'pointer',
            fontSize: '12px',
            borderBottom: '1px solid #333'
          }}
          onClick={() => selectObject(obj)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(obj.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '10px',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(obj.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: obj.visible ? '#fff' : '#666',
                cursor: 'pointer',
                fontSize: '12px',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {obj.visible ? '👁' : '👁‍🗨'}
            </button>

            <span style={{ 
              color: obj.visible ? '#fff' : '#666',
              fontWeight: obj.type === 'group' ? 'bold' : 'normal'
            }}>
              {obj.name}
            </span>
          </div>

          <span style={{ 
            color: '#666', 
            fontSize: '10px',
            marginLeft: '8px'
          }}>
            {obj.type}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {obj.children!.map((child: any) => renderObject(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

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
          Scene Objects
        </h3>
        <div style={{ 
          fontSize: '11px', 
          color: '#666',
          marginTop: '4px'
        }}>
          {state.sceneObjects.length} objects
        </div>
      </div>

      <div style={{ 
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 200px)'
      }}>
        {/* Scene Root */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            background: expandedItems.has('scene') ? '#007acc' : 'transparent',
            cursor: 'pointer',
            fontSize: '12px',
            borderBottom: '1px solid #333'
          }}
          onClick={() => toggleExpanded('scene')}
        >
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '10px',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '4px'
            }}
          >
            {expandedItems.has('scene') ? '▼' : '▶'}
          </button>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>Scene</span>
        </div>

        {/* Scene Objects */}
        {expandedItems.has('scene') && (
          <div>
            {state.sceneObjects.map(obj => renderObject(obj, 1))}
          </div>
        )}
      </div>

      <div style={{ 
        padding: '8px',
        borderTop: '1px solid #333',
        background: '#252525'
      }}>
        <button 
          style={{ 
            width: '100%',
            padding: '6px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          + Add Object
        </button>
      </div>
    </div>
  );
};

export default ObjectPanel; 