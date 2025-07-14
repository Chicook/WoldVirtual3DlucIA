import React, { useState, useEffect } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { avatarRegistry, AvatarData, AvatarCategory } from '../../services/AvatarRegistry';
import './styles.css';

const AvatarRegistryComponent: React.FC = () => {
  const { state, exportAvatar } = useEditor();
  const [avatars, setAvatars] = useState<AvatarData[]>([]);
  const [categories, setCategories] = useState<AvatarCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarData | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newAvatarData, setNewAvatarData] = useState({
    name: '',
    description: '',
    type: 'humanoid' as const,
    category: 'humanoid',
    tags: [] as string[],
    author: 'Usuario'
  });

  useEffect(() => {
    loadAvatars();
    loadCategories();
  }, []);

  const loadAvatars = () => {
    const allAvatars = avatarRegistry.getAllAvatars();
    setAvatars(allAvatars);
  };

  const loadCategories = () => {
    const allCategories = avatarRegistry.getCategories();
    setCategories(allCategories);
  };

  const filteredAvatars = avatars.filter(avatar => {
    const matchesCategory = selectedCategory === 'all' || avatar.type === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      avatar.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      avatar.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleCreateAvatar = () => {
    if (!state.selectedObject) {
      alert('Selecciona un objeto en la escena para crear un avatar');
      return;
    }

    const avatarData = {
      ...newAvatarData,
      version: '1.0.0',
      modelData: {
        geometry: state.selectedObject.geometry || 'BoxGeometry',
        material: state.selectedObject.material || { color: '#ffffff' },
        position: state.selectedObject.position,
        rotation: state.selectedObject.rotation,
        scale: state.selectedObject.scale,
        animations: [],
        scripts: []
      },
      metadata: {},
      exportData: {}
    };

    const avatarId = avatarRegistry.registerAvatar(avatarData);
    loadAvatars();
    setShowCreateForm(false);
    setNewAvatarData({
      name: '',
      description: '',
      type: 'humanoid',
      category: 'humanoid',
      tags: [],
      author: 'Usuario'
    });

    console.log(`Avatar creado con ID: ${avatarId}`);
  };

  const handleDeleteAvatar = (avatarId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este avatar?')) {
      avatarRegistry.removeAvatar(avatarId);
      loadAvatars();
      if (selectedAvatar?.id === avatarId) {
        setSelectedAvatar(null);
      }
    }
  };

  const handleExportAvatar = (avatarId: string) => {
    const avatar = avatarRegistry.getAvatar(avatarId);
    if (avatar) {
      const gltfData = avatarRegistry.exportAvatarAsGLTF(avatarId);
      if (gltfData) {
        const blob = new Blob([gltfData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${avatar.name}.gltf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleImportAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          const avatarId = avatarRegistry.importAvatar(importData);
          loadAvatars();
          console.log(`Avatar importado con ID: ${avatarId}`);
        } catch (error) {
          console.error('Error importando avatar:', error);
          alert('Error al importar el archivo de avatar');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="avatar-registry">
      <div className="avatar-registry-header">
        <h3>Registro de Avatares</h3>
        <div className="header-actions">
          <button 
            className="create-avatar-btn"
            onClick={() => setShowCreateForm(true)}
            disabled={!state.selectedObject}
          >
            Crear Avatar
          </button>
          <label className="import-avatar-btn">
            Importar
            <input
              type="file"
              accept=".json,.gltf"
              onChange={handleImportAvatar}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Filtros */}
      <div className="avatar-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar avatares..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de avatares */}
      <div className="avatar-list">
        {filteredAvatars.length === 0 ? (
          <div className="no-avatars">
            <p>No se encontraron avatares</p>
            {selectedCategory !== 'all' && (
              <button onClick={() => setSelectedCategory('all')}>
                Ver todos los avatares
              </button>
            )}
          </div>
        ) : (
          filteredAvatars.map(avatar => (
            <div
              key={avatar.id}
              className={`avatar-item ${selectedAvatar?.id === avatar.id ? 'selected' : ''}`}
              onClick={() => setSelectedAvatar(avatar)}
            >
              <div className="avatar-thumbnail">
                {avatar.thumbnail ? (
                  <img src={avatar.thumbnail} alt={avatar.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {categories.find(c => c.id === avatar.type)?.icon || '👤'}
                  </div>
                )}
              </div>
              <div className="avatar-info">
                <h4>{avatar.name}</h4>
                <p>{avatar.description}</p>
                <div className="avatar-tags">
                  {avatar.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                  {avatar.tags.length > 3 && (
                    <span className="tag-more">+{avatar.tags.length - 3}</span>
                  )}
                </div>
              </div>
              <div className="avatar-actions">
                <button
                  className="action-btn export-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportAvatar(avatar.id);
                  }}
                  title="Exportar"
                >
                  📤
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAvatar(avatar.id);
                  }}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detalles del avatar seleccionado */}
      {selectedAvatar && (
        <div className="avatar-details">
          <h4>Detalles del Avatar</h4>
          <div className="detail-item">
            <label>Nombre:</label>
            <span>{selectedAvatar.name}</span>
          </div>
          <div className="detail-item">
            <label>Descripción:</label>
            <span>{selectedAvatar.description}</span>
          </div>
          <div className="detail-item">
            <label>Tipo:</label>
            <span>{categories.find(c => c.id === selectedAvatar.type)?.name}</span>
          </div>
          <div className="detail-item">
            <label>Creado:</label>
            <span>{new Date(selectedAvatar.created).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <label>Autor:</label>
            <span>{selectedAvatar.author}</span>
          </div>
          <div className="detail-item">
            <label>Versión:</label>
            <span>{selectedAvatar.version}</span>
          </div>
        </div>
      )}

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="create-avatar-modal">
          <div className="modal-content">
            <h4>Crear Nuevo Avatar</h4>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={newAvatarData.name}
                onChange={(e) => setNewAvatarData({...newAvatarData, name: e.target.value})}
                placeholder="Nombre del avatar"
              />
            </div>
            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                value={newAvatarData.description}
                onChange={(e) => setNewAvatarData({...newAvatarData, description: e.target.value})}
                placeholder="Descripción del avatar"
              />
            </div>
            <div className="form-group">
              <label>Tipo:</label>
              <select
                value={newAvatarData.type}
                onChange={(e) => setNewAvatarData({...newAvatarData, type: e.target.value as any})}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tags (separados por comas):</label>
              <input
                type="text"
                value={newAvatarData.tags.join(', ')}
                onChange={(e) => setNewAvatarData({
                  ...newAvatarData, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCreateAvatar} disabled={!newAvatarData.name}>
                Crear Avatar
              </button>
              <button onClick={() => setShowCreateForm(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarRegistryComponent; 