import React from 'react';
import { useBinContext } from '../context/BinContext';
import { BinModule } from '../types';

interface BinModuleCardProps {
  module: BinModule;
}

const BinModuleCard: React.FC<BinModuleCardProps> = ({ module }) => {
  const { selectModule } = useBinContext();

  const handleClick = () => {
    selectModule(module);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'var(--success-color)';
      case 'inactive':
        return 'var(--error-color)';
      case 'warning':
        return 'var(--warning-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div className="bin-module-card" onClick={handleClick}>
      <div className="bin-module-title">{module.name}</div>
      <div className="bin-module-description">{module.description}</div>
      
      <div style={{ marginBottom: '15px' }}>
        <span 
          className="bin-module-status"
          style={{ 
            background: getStatusColor(module.status),
            color: 'white'
          }}
        >
          {module.status}
        </span>
        <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          v{module.version}
        </span>
      </div>

      {module.dependencies.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <small style={{ color: 'var(--text-secondary)' }}>
            Dependencias: {module.dependencies.join(', ')}
          </small>
        </div>
      )}

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Actualizado: {module.lastUpdated.toLocaleDateString()}
      </div>
    </div>
  );
};

export default BinModuleCard; 