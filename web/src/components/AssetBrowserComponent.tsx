import React, { useState, useEffect } from 'react';
import { messageBus } from '../core/InterModuleMessageBus';

interface AssetBrowserProps {
  userId?: string;
}

interface AssetItem {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
  tags: string[];
  preview: string;
  rating: number;
  downloads: number;
}

const AssetBrowserComponent = ({ userId }: AssetBrowserProps) => {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('name');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const availableTags = [
    '3D', 'Character', 'Environment', 'Vehicle', 'Weapon', 
    'Fantasy', 'Sci-Fi', 'Medieval', 'Modern', 'Low-Poly',
    'High-Quality', 'Free', 'Premium', 'Animated', 'Rigged'
  ];

  useEffect(() => {
    loadAssetLibrary();
  }, []);

  const loadAssetLibrary = async () => {
    setIsLoading(true);
    try {
      // Simular carga de biblioteca de assets
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockAssets: AssetItem[] = [
        {
          id: '1',
          name: 'Cyberpunk Character',
          type: 'Character',
          size: '15.2 MB',
          category: 'Characters',
          tags: ['3D', 'Character', 'Sci-Fi', 'Rigged', 'Premium'],
          preview: '🎭',
          rating: 4.8,
          downloads: 1250
        },
        {
          id: '2',
          name: 'Medieval Castle',
          type: 'Environment',
          size: '45.7 MB',
          category: 'Environments',
          tags: ['3D', 'Environment', 'Medieval', 'High-Quality'],
          preview: '🏰',
          rating: 4.6,
          downloads: 890
        },
        {
          id: '3',
          name: 'Flying Car',
          type: 'Vehicle',
          size: '23.1 MB',
          category: 'Vehicles',
          tags: ['3D', 'Vehicle', 'Sci-Fi', 'Animated'],
          preview: '🚗',
          rating: 4.4,
          downloads: 567
        },
        {
          id: '4',
          name: 'Magic Sword',
          type: 'Weapon',
          size: '8.9 MB',
          category: 'Weapons',
          tags: ['3D', 'Weapon', 'Fantasy', 'Low-Poly', 'Free'],
          preview: '⚔️',
          rating: 4.2,
          downloads: 2100
        },
        {
          id: '5',
          name: 'Forest Scene',
          type: 'Environment',
          size: '67.3 MB',
          category: 'Environments',
          tags: ['3D', 'Environment', 'Nature', 'High-Quality'],
          preview: '🌲',
          rating: 4.7,
          downloads: 743
        }
      ];
      
      setAssets(mockAssets);
    } catch (error) {
      console.error('Error cargando biblioteca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (filterTags.length === 0) return true;
    return filterTags.some(tag => asset.tags.includes(tag));
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      case 'size':
        return parseFloat(a.size) - parseFloat(b.size);
      default:
        return 0;
    }
  });

  const handleTagToggle = (tag: string) => {
    setFilterTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAssetSelect = (asset: AssetItem) => {
    messageBus.publish('asset-selected', { asset, userId });
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="asset-browser-container">
      <div className="browser-header">
        <h2>Explorador de Assets</h2>
        <div className="browser-stats">
          <span>Total: {assets.length}</span>
          <span>Filtrados: {filteredAssets.length}</span>
          <span>Mostrando: {sortedAssets.length}</span>
        </div>
      </div>

      <div className="browser-controls">
        <div className="view-controls">
          <button 
            onClick={() => setViewMode('grid')}
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            📱 Grid
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            📋 Lista
          </button>
        </div>

        <div className="sort-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Por Nombre</option>
            <option value="rating">Por Rating</option>
            <option value="downloads">Por Descargas</option>
            <option value="size">Por Tamaño</option>
          </select>
        </div>
      </div>

      <div className="tag-filters">
        <h4>Filtros por Tags:</h4>
        <div className="tags-container">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`tag-btn ${filterTags.includes(tag) ? 'active' : ''}`}
            >
              {tag}
            </button>
          ))}
        </div>
        {filterTags.length > 0 && (
          <button 
            onClick={() => setFilterTags([])}
            className="clear-filters-btn"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="browser-content">
        {isLoading ? (
          <div className="loading-library">
            <div className="spinner"></div>
            <p>Explorando biblioteca de assets...</p>
          </div>
        ) : (
          <div className={`assets-display ${viewMode}`}>
            {sortedAssets.map(asset => (
              <div 
                key={asset.id} 
                className={`asset-item ${viewMode}`}
                onClick={() => handleAssetSelect(asset)}
              >
                <div className="asset-preview">
                  <div className="preview-icon">{asset.preview}</div>
                  <div className="asset-overlay">
                    <button className="preview-btn">👁️ Vista Previa</button>
                    <button className="download-btn">⬇️ Descargar</button>
                  </div>
                </div>
                
                <div className="asset-details">
                  <h4 className="asset-title">{asset.name}</h4>
                  <p className="asset-category">{asset.category}</p>
                  <p className="asset-size">{asset.size}</p>
                  
                  <div className="asset-rating">
                    <span className="stars">{renderStars(asset.rating)}</span>
                    <span className="rating-text">({asset.rating})</span>
                  </div>
                  
                  <div className="asset-stats">
                    <span className="downloads">⬇️ {asset.downloads}</span>
                  </div>
                  
                  <div className="asset-tags">
                    {asset.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {asset.tags.length > 3 && (
                      <span className="more-tags">+{asset.tags.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="browser-footer">
        <div className="footer-info">
          <span>Usuario: {userId}</span>
          <span>Assets Disponibles: {assets.length}</span>
          <span>Filtros Activos: {filterTags.length}</span>
        </div>
        <div className="footer-actions">
          <button 
            onClick={() => messageBus.publish('load-component', {
              componentName: 'AssetManager',
              props: { userId },
              targetId: 'dynamic-content'
            })}
            className="btn-secondary"
          >
            Volver al Gestor
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetBrowserComponent; 