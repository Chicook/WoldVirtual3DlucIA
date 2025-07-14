import React, { useState, useEffect } from 'react';
import { versionApi } from '../api/versionApi';

const VersionList = ({ workflow, onVersionSelect, selectedVersion }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (workflow) {
      loadVersions();
    }
  }, [workflow]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const data = await versionApi.getWorkflowVersions(workflow.name);
      setVersions(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar versiones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionClick = (version) => {
    onVersionSelect(version);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="version-list">
        <div className="version-list-header">
          <h3>Versiones</h3>
        </div>
        <div className="loading">Cargando versiones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="version-list">
        <div className="version-list-header">
          <h3>Versiones</h3>
          <button onClick={loadVersions} className="refresh-btn">🔄</button>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="version-list">
      <div className="version-list-header">
        <h3>Versiones</h3>
        <button onClick={loadVersions} className="refresh-btn" title="Actualizar">🔄</button>
      </div>
      
      <div className="version-items">
        {versions.map((version) => (
          <div
            key={version.version}
            className={`version-item ${selectedVersion?.version === version.version ? 'selected' : ''}`}
            onClick={() => handleVersionClick(version)}
          >
            <div className="version-header">
              <span className="version-number">{version.version}</span>
              <span className="version-date">{formatDate(version.timestamp)}</span>
            </div>
            
            <div className="version-description">{version.description}</div>
            
            <div className="version-meta">
              <span className="version-author">por {version.author}</span>
              <div className="version-tags">
                {version.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {versions.length === 0 && (
        <div className="empty-state">
          <p>No hay versiones disponibles</p>
        </div>
      )}
    </div>
  );
};

export default VersionList; 