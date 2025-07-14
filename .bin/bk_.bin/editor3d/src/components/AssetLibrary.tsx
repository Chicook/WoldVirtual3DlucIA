import React, { useState } from 'react';

interface Asset {
  id: string;
  name: string;
  type: 'model' | 'texture' | 'material' | 'sound';
  category: string;
  thumbnail: string;
  description: string;
  tags: string[];
}

const AssetLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const assets: Asset[] = [
    {
      id: '1',
      name: 'Basic Cube',
      type: 'model',
      category: 'primitives',
      thumbnail: '📦',
      description: 'Simple cube geometry',
      tags: ['primitive', 'cube', 'basic']
    },
    {
      id: '2',
      name: 'Sphere',
      type: 'model',
      category: 'primitives',
      thumbnail: '🔵',
      description: 'Basic sphere geometry',
      tags: ['primitive', 'sphere', 'round']
    },
    {
      id: '3',
      name: 'Cylinder',
      type: 'model',
      category: 'primitives',
      thumbnail: '🔘',
      description: 'Cylinder geometry',
      tags: ['primitive', 'cylinder', 'tube']
    },
    {
      id: '4',
      name: 'Plane',
      type: 'model',
      category: 'primitives',
      thumbnail: '⬜',
      description: 'Flat plane geometry',
      tags: ['primitive', 'plane', 'flat']
    },
    {
      id: '5',
      name: 'Tree',
      type: 'model',
      category: 'nature',
      thumbnail: '🌳',
      description: 'Simple tree model',
      tags: ['nature', 'tree', 'plant']
    },
    {
      id: '6',
      name: 'Rock',
      type: 'model',
      category: 'nature',
      thumbnail: '🪨',
      description: 'Rock formation',
      tags: ['nature', 'rock', 'stone']
    },
    {
      id: '7',
      name: 'House',
      type: 'model',
      category: 'buildings',
      thumbnail: '🏠',
      description: 'Simple house model',
      tags: ['building', 'house', 'architecture']
    },
    {
      id: '8',
      name: 'Car',
      type: 'model',
      category: 'vehicles',
      thumbnail: '🚗',
      description: 'Basic car model',
      tags: ['vehicle', 'car', 'transport']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Assets' },
    { id: 'primitives', name: 'Primitives' },
    { id: 'nature', name: 'Nature' },
    { id: 'buildings', name: 'Buildings' },
    { id: 'vehicles', name: 'Vehicles' },
    { id: 'textures', name: 'Textures' },
    { id: 'materials', name: 'Materials' }
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAssetClick = (asset: Asset) => {
    console.log('Asset selected:', asset);
    // Aquí se implementaría la lógica para añadir el asset a la escena
  };

  return (
    <div style={{ 
      flex: 1,
      background: '#1a1a1a',
      borderTop: '1px solid #333',
      minHeight: '200px'
    }}>
      <div style={{ 
        padding: '12px', 
        borderBottom: '1px solid #333',
        background: '#252525'
      }}>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '14px', 
          color: '#fff',
          fontWeight: 'bold'
        }}>
          Asset Library
        </h3>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px',
            background: '#333',
            border: '1px solid #555',
            color: '#fff',
            fontSize: '11px',
            borderRadius: '4px',
            marginBottom: '8px'
          }}
        />

        {/* Categories */}
        <div style={{ 
          display: 'flex', 
          gap: '4px',
          flexWrap: 'wrap'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '4px 8px',
                background: selectedCategory === category.id ? '#007acc' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div style={{ 
        padding: '12px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 400px)'
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '8px'
        }}>
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              onClick={() => handleAssetClick(asset)}
              style={{
                background: '#252525',
                border: '1px solid #333',
                borderRadius: '4px',
                padding: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                fontSize: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333';
                e.currentTarget.style.borderColor = '#007acc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#252525';
                e.currentTarget.style.borderColor = '#333';
              }}
            >
              <div style={{ 
                fontSize: '24px', 
                marginBottom: '4px',
                lineHeight: '1'
              }}>
                {asset.thumbnail}
              </div>
              <div style={{ 
                color: '#fff',
                fontWeight: 'bold',
                marginBottom: '2px',
                fontSize: '9px'
              }}>
                {asset.name}
              </div>
              <div style={{ 
                color: '#666',
                fontSize: '8px'
              }}>
                {asset.type}
              </div>
            </div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: '12px',
            padding: '20px'
          }}>
            No assets found
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div style={{ 
        padding: '12px',
        borderTop: '1px solid #333',
        background: '#252525'
      }}>
        <button 
          style={{ 
            width: '100%',
            padding: '8px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          + Upload Asset
        </button>
        <div style={{ 
          fontSize: '9px', 
          color: '#666',
          marginTop: '4px',
          textAlign: 'center'
        }}>
          GLTF, GLB, FBX, OBJ supported
        </div>
      </div>
    </div>
  );
};

export default AssetLibrary; 