import React from 'react';
import { BinModule } from '../types';
import { useBinContext } from '../context/BinContext';

const BinModuleDetail: React.FC = () => {
  const { state, selectModule, updateModuleStatus } = useBinContext();

  if (!state.selectedModule) {
    return null;
  }

  const { selectedModule } = state;

  const handleBack = () => {
    selectModule(null);
  };

  const handleStatusChange = (newStatus: 'active' | 'inactive' | 'warning') => {
    updateModuleStatus(selectedModule.id, newStatus);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button className="bin-button secondary" onClick={handleBack}>
          ← Volver
        </button>
      </div>

      <div className="bin-module-card" style={{ marginBottom: '20px' }}>
        <h2 className="bin-module-title">{selectedModule.name}</h2>
        <p className="bin-module-description">{selectedModule.description}</p>
        
        <div style={{ marginBottom: '20px' }}>
          <strong>Versión:</strong> {selectedModule.version}<br />
          <strong>Estado:</strong> 
          <span 
            className="bin-module-status"
            style={{ 
              background: selectedModule.status === 'active' ? 'var(--success-color)' : 
                         selectedModule.status === 'inactive' ? 'var(--error-color)' : 'var(--warning-color)',
              color: 'white',
              marginLeft: '10px'
            }}
          >
            {selectedModule.status}
          </span>
        </div>

        {selectedModule.dependencies.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Dependencias:</strong>
            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
              {selectedModule.dependencies.map((dep) => (
                <li key={dep} style={{ color: 'var(--text-secondary)' }}>{dep}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <strong>Última actualización:</strong> {selectedModule.lastUpdated.toLocaleString()}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="bin-button"
            onClick={() => handleStatusChange('active')}
            style={{ 
              background: selectedModule.status === 'active' ? 'var(--success-color)' : 'var(--border-color)'
            }}
          >
            Activar
          </button>
          <button 
            className="bin-button secondary"
            onClick={() => handleStatusChange('warning')}
            style={{ 
              background: selectedModule.status === 'warning' ? 'var(--warning-color)' : 'var(--border-color)'
            }}
          >
            Advertencia
          </button>
          <button 
            className="bin-button danger"
            onClick={() => handleStatusChange('inactive')}
            style={{ 
              background: selectedModule.status === 'inactive' ? 'var(--error-color)' : 'var(--border-color)'
            }}
          >
            Desactivar
          </button>
        </div>
      </div>

      <div className="bin-module-card">
        <h3 style={{ color: 'var(--accent-color)', marginBottom: '15px' }}>
          Acciones del Módulo
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <button className="bin-button">Ejecutar</button>
          <button className="bin-button secondary">Configurar</button>
          <button className="bin-button secondary">Actualizar</button>
          <button className="bin-button secondary">Logs</button>
          <button className="bin-button secondary">Métricas</button>
          <button className="bin-button secondary">Documentación</button>
        </div>
      </div>
    </div>
  );
};

export default BinModuleDetail; 