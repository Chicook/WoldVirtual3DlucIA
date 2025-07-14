import React, { useState } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { MaterialProperties, TextureInfo } from '../../services/MaterialSystem';
import './styles.css';

const MaterialPanel: React.FC = () => {
  const { state, createMaterial, addTexture, applyMaterial } = useEditor();
  const [activeTab, setActiveTab] = useState<'materials' | 'textures' | 'create'>('materials');
  const [newMaterial, setNewMaterial] = useState<Partial<MaterialProperties>>({
    name: '',
    type: 'standard',
    color: '#ffffff',
    opacity: 1,
    transparent: false,
    metalness: 0,
    roughness: 0.5
  });

  const [newTexture, setNewTexture] = useState<Partial<TextureInfo>>({
    name: '',
    url: '',
    type: 'color'
  });

  const handleCreateMaterial = () => {
    if (newMaterial.name && newMaterial.type) {
      const material: MaterialProperties = {
        id: `mat_${Date.now()}`,
        name: newMaterial.name,
        type: newMaterial.type as any,
        color: newMaterial.color || '#ffffff',
        opacity: newMaterial.opacity || 1,
        transparent: newMaterial.transparent || false,
        metalness: newMaterial.metalness,
        roughness: newMaterial.roughness,
        emissive: newMaterial.emissive,
        emissiveIntensity: newMaterial.emissiveIntensity
      };
      
      createMaterial(material);
      setNewMaterial({
        name: '',
        type: 'standard',
        color: '#ffffff',
        opacity: 1,
        transparent: false,
        metalness: 0,
        roughness: 0.5
      });
    }
  };

  const handleAddTexture = async () => {
    if (newTexture.name && newTexture.url && newTexture.type) {
      const texture: TextureInfo = {
        id: `tex_${Date.now()}`,
        name: newTexture.name,
        url: newTexture.url,
        type: newTexture.type as any,
        loaded: false
      };
      
      await addTexture(texture);
      setNewTexture({
        name: '',
        url: '',
        type: 'color'
      });
    }
  };

  const handleApplyMaterial = (materialId: string) => {
    if (state.selectedObject) {
      applyMaterial(state.selectedObject.id, materialId);
    }
  };

  return (
    <div className="material-panel">
      <div className="material-panel-header">
        <h3>Materiales Avanzados</h3>
        <div className="material-tabs">
          <button
            className={activeTab === 'materials' ? 'active' : ''}
            onClick={() => setActiveTab('materials')}
          >
            Materiales
          </button>
          <button
            className={activeTab === 'textures' ? 'active' : ''}
            onClick={() => setActiveTab('textures')}
          >
            Texturas
          </button>
          <button
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            Crear
          </button>
        </div>
      </div>

      <div className="material-panel-content">
        {activeTab === 'materials' && (
          <div className="materials-list">
            <h4>Materiales Disponibles</h4>
            {state.materials.map(material => (
              <div key={material.id} className="material-item">
                <div className="material-info">
                  <div className="material-name">{material.name}</div>
                  <div className="material-type">{material.type}</div>
                  <div 
                    className="material-color-preview"
                    style={{ backgroundColor: material.color }}
                  />
                </div>
                <button
                  onClick={() => handleApplyMaterial(material.id)}
                  disabled={!state.selectedObject}
                  className="apply-material-btn"
                >
                  Aplicar
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'textures' && (
          <div className="textures-list">
            <h4>Texturas Disponibles</h4>
            {state.textures.map(texture => (
              <div key={texture.id} className="texture-item">
                <div className="texture-info">
                  <div className="texture-name">{texture.name}</div>
                  <div className="texture-type">{texture.type}</div>
                  <div className="texture-status">
                    {texture.loaded ? '✓ Cargada' : '⏳ Cargando...'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="create-section">
            <div className="create-material">
              <h4>Crear Nuevo Material</h4>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del material"
                />
              </div>
              
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  value={newMaterial.type}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="basic">Basic</option>
                  <option value="lambert">Lambert</option>
                  <option value="phong">Phong</option>
                  <option value="standard">Standard</option>
                  <option value="physical">Physical</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="form-group">
                <label>Color:</label>
                <input
                  type="color"
                  value={newMaterial.color}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Opacidad:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newMaterial.opacity}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                />
                <span>{newMaterial.opacity}</span>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newMaterial.transparent}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, transparent: e.target.checked }))}
                  />
                  Transparente
                </label>
              </div>

              {newMaterial.type === 'standard' || newMaterial.type === 'physical' ? (
                <>
                  <div className="form-group">
                    <label>Metalness:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newMaterial.metalness}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, metalness: parseFloat(e.target.value) }))}
                    />
                    <span>{newMaterial.metalness}</span>
                  </div>

                  <div className="form-group">
                    <label>Roughness:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newMaterial.roughness}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                    />
                    <span>{newMaterial.roughness}</span>
                  </div>
                </>
              ) : null}

              <button onClick={handleCreateMaterial} className="create-btn">
                Crear Material
              </button>
            </div>

            <div className="create-texture">
              <h4>Añadir Textura</h4>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={newTexture.name}
                  onChange={(e) => setNewTexture(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre de la textura"
                />
              </div>

              <div className="form-group">
                <label>URL:</label>
                <input
                  type="text"
                  value={newTexture.url}
                  onChange={(e) => setNewTexture(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="URL de la imagen"
                />
              </div>

              <div className="form-group">
                <label>Tipo:</label>
                <select
                  value={newTexture.type}
                  onChange={(e) => setNewTexture(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="color">Color</option>
                  <option value="normal">Normal</option>
                  <option value="roughness">Roughness</option>
                  <option value="metalness">Metalness</option>
                  <option value="ao">Ambient Occlusion</option>
                  <option value="emissive">Emissive</option>
                </select>
              </div>

              <button onClick={handleAddTexture} className="create-btn">
                Añadir Textura
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialPanel; 