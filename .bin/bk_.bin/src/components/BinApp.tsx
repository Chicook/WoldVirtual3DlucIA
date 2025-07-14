import React from 'react';
import { useBinContext } from '../context/BinContext';
import BinModuleCard from './BinModuleCard';
import BinModuleDetail from './BinModuleDetail';
import { BinModule } from '../types';

const BinApp: React.FC = () => {
  const { state } = useBinContext();

  return (
    <div className="bin-container">
      <div className="bin-header">
        <h1 className="bin-title">🔧 Sistema de Binarios</h1>
        <p className="bin-subtitle">
          WoldVirtual3DlucIA - Gestión Avanzada de Ejecutables y Herramientas
        </p>
      </div>

      {state.error && (
        <div style={{ 
          background: 'var(--error-color)', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          color: 'white'
        }}>
          Error: {state.error}
        </div>
      )}

      {state.isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Cargando módulos...</div>
        </div>
      ) : (
        <>
          {state.selectedModule ? (
            <BinModuleDetail />
          ) : (
            <div className="bin-grid">
              {state.modules.map((module) => (
                <BinModuleCard key={module.id} module={module} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BinApp; 