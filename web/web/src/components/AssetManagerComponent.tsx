import React, { useState, useEffect } from 'react';
import { messageBus } from '../core/InterModuleMessageBus';

interface AssetManagerProps {
  userId?: string;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
  uploadDate: string;
  status: 'active' | 'processing' | 'error';
}

const AssetManagerComponent = ({ userId }: AssetManagerProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'Todos', icon: '📁' },
    { id: 'models', name: 'Modelos 3D', icon: '🎨' },
    { id: 'textures', name: 'Texturas', icon: '🖼️' },
    { id: 'audio', name: 'Audio', icon: '🎵' },
    { id: 'animations', name: 'Animaciones', icon: '🎬' },
    { id: 'scripts', name: 'Scripts', icon: '📜' }
  ];

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      // Simular carga de assets
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAssets: Asset[] = [
        {
          id: '1',
          name: 'Character_Model.fbx',
          type: 'model',
          size: '2.3 MB',
          category: 'models',
          uploadDate: '2024-01-15',
          status: 'active'
        },
        {
          id: '2',
          name: 'Stone_Texture.png',
          type: 'texture',
          size: '512 KB',
          category: 'textures',
          uploadDate: '2024-01-14',
          status: 'active'
        },
        {
          id: '3',
          name: 'Background_Music.mp3',
          type: 'audio',
          size: '1.8 MB',
          category: 'audio',
          uploadDate: '2024-01-13',
          status: 'active'
        },
        {
          id: '4',
          name: 'Walk_Animation.fbx',
          type: 'animation',
          size: '890 KB',
          category: 'animations',
          uploadDate: '2024-01-12',
          status: 'processing'
        },
        {
          id: '5',
          name: 'Physics_Script.js',
          type: 'script',
          size: '45 KB',
          category: 'scripts',
          uploadDate: '2024-01-11',
          status: 'active'
        }
      ];
      
      setAssets(mockAssets);
    } catch (error) {
      console.error('Error cargando assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'processing': return 'orange';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const handleAssetAction = (action: string, assetId: string) => {
    console.log(`Acción ${action} en asset ${assetId}`);
    messageBus.publish('asset-action', { action, assetId, userId });
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || '📄';
  };

  return (
    <div className="asset-manager-container">
      <div className="asset-header">
        <h2>Gestor de Assets</h2>
        <div className="asset-stats">
          <span>Total: {assets.length}</span>
          <span>Filtrados: {filteredAssets.length}</span>
          <span>Espacio: 2.3 GB</span>
        </div>
      </div>

      <div className="asset-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="asset-content">
        {isLoading ? (
          <div className="loading-assets">
            <div className="spinner"></div>
            <p>Cargando assets...</p>
          </div>
        ) : (
          <div className="assets-grid">
            {filteredAssets.map(asset => (
              <div key={asset.id} className="asset-card">
                <div className="asset-icon">
                  {getCategoryIcon(asset.category)}
                </div>
                <div className="asset-info">
                  <h4 className="asset-name">{asset.name}</h4>
                  <p className="asset-details">
                    <span className="asset-type">{asset.type}</span>
                    <span className="asset-size">{asset.size}</span>
                  </p>
                  <p className="asset-date">{asset.uploadDate}</p>
                </div>
                <div className="asset-status">
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(asset.status) }}
                  ></span>
                  <span className="status-text">{asset.status}</span>
                </div>
                <div className="asset-actions">
                  <button 
                    onClick={() => handleAssetAction('preview', asset.id)}
                    className="action-btn preview"
                  >
                    👁️
                  </button>
                  <button 
                    onClick={() => handleAssetAction('download', asset.id)}
                    className="action-btn download"
                  >
                    ⬇️
                  </button>
                  <button 
                    onClick={() => handleAssetAction('edit', asset.id)}
                    className="action-btn edit"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleAssetAction('delete', asset.id)}
                    className="action-btn delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="asset-footer">
        <div className="footer-actions">
          <button 
            onClick={() => messageBus.publish('load-component', {
              componentName: 'AssetUploader',
              props: { userId },
              targetId: 'dynamic-content'
            })}
            className="btn-primary"
          >
            Subir Nuevo Asset
          </button>
          <button 
            onClick={() => messageBus.publish('load-component', {
              componentName: 'AssetBrowser',
              props: { userId },
              targetId: 'dynamic-content'
            })}
            className="btn-secondary"
          >
            Explorar Assets
          </button>
        </div>
        <div className="footer-info">
          <span>Usuario: {userId}</span>
          <span>Assets: {filteredAssets.length}</span>
          <span>Compresión: Activada</span>
        </div>
      </div>
    </div>
  );
};

export default AssetManagerComponent; 