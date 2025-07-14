import React, { useState, useEffect } from 'react';
import { versionApi } from '../api/versionApi';

const VersionDiff = ({ workflow, version1, version2 }) => {
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (workflow && version1 && version2) {
      loadDiff();
    }
  }, [workflow, version1, version2]);

  const loadDiff = async () => {
    try {
      setLoading(true);
      const data = await versionApi.compareVersions(workflow, version1, version2);
      setDiff(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar diferencias: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="version-diff">
        <div className="diff-header">
          <h3>Comparando versiones</h3>
        </div>
        <div className="loading">Cargando diferencias...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="version-diff">
        <div className="diff-header">
          <h3>Comparación de versiones</h3>
          <button onClick={loadDiff} className="refresh-btn">🔄</button>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!diff) {
    return (
      <div className="version-diff">
        <div className="diff-header">
          <h3>Comparación de versiones</h3>
        </div>
        <div className="empty-state">No hay diferencias para mostrar</div>
      </div>
    );
  }

  return (
    <div className="version-diff">
      <div className="diff-header">
        <h3>Comparación: {version1} vs {version2}</h3>
        <button onClick={loadDiff} className="refresh-btn" title="Actualizar">🔄</button>
      </div>
      
      <div className="diff-summary">
        <div className="summary-item">
          <span className="label">Líneas totales:</span>
          <span className="value">{diff.summary.totalLines}</span>
        </div>
        <div className="summary-item">
          <span className="label">Añadidas:</span>
          <span className="value added">{diff.summary.addedLines}</span>
        </div>
        <div className="summary-item">
          <span className="label">Eliminadas:</span>
          <span className="value removed">{diff.summary.removedLines}</span>
        </div>
        <div className="summary-item">
          <span className="label">Modificadas:</span>
          <span className="value modified">{diff.summary.modifiedLines}</span>
        </div>
      </div>
      
      <div className="diff-content">
        {diff.changes.added.length > 0 && (
          <div className="diff-section">
            <h4>Líneas añadidas</h4>
            {diff.changes.added.map((change, index) => (
              <div key={index} className="diff-line added">
                <span className="line-number">+{change.line}</span>
                <span className="line-content">{change.content}</span>
              </div>
            ))}
          </div>
        )}
        
        {diff.changes.removed.length > 0 && (
          <div className="diff-section">
            <h4>Líneas eliminadas</h4>
            {diff.changes.removed.map((change, index) => (
              <div key={index} className="diff-line removed">
                <span className="line-number">-{change.line}</span>
                <span className="line-content">{change.content}</span>
              </div>
            ))}
          </div>
        )}
        
        {diff.changes.modified.length > 0 && (
          <div className="diff-section">
            <h4>Líneas modificadas</h4>
            {diff.changes.modified.map((change, index) => (
              <div key={index} className="diff-line modified">
                <div className="line-number">{change.line}</div>
                <div className="line-changes">
                  <div className="old-line">- {change.old}</div>
                  <div className="new-line">+ {change.new}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {diff.changes.added.length === 0 && 
         diff.changes.removed.length === 0 && 
         diff.changes.modified.length === 0 && (
          <div className="no-changes">
            <p>No hay diferencias entre las versiones seleccionadas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionDiff; 