import React from 'react';

/**
 * DeploymentComponent - Componente para simular y visualizar el proceso de despliegue
 * Permite iniciar un despliegue, ver logs y estado del deployment
 */
export interface DeploymentLog {
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface DeploymentState {
  status: 'idle' | 'deploying' | 'success' | 'error';
  logs: DeploymentLog[];
  lastDeployedAt?: number;
}

const initialState: DeploymentState = {
  status: 'idle',
  logs: [],
};

export const DeploymentComponent: React.FC = () => {
  const [state, setState] = React.useState<DeploymentState>(initialState);

  // Simula el proceso de despliegue
  const deploy = async () => {
    setState({
      status: 'deploying',
      logs: [
        { timestamp: Date.now(), message: 'Iniciando despliegue...', type: 'info' },
      ],
    });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setState((prev) => ({
        ...prev,
        logs: [
          ...prev.logs,
          { timestamp: Date.now(), message: 'Subiendo archivos...', type: 'info' },
        ],
      }));
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setState((prev) => ({
        ...prev,
        status: 'success',
        logs: [
          ...prev.logs,
          { timestamp: Date.now(), message: 'Despliegue completado con éxito.', type: 'success' },
        ],
        lastDeployedAt: Date.now(),
      }));
    } catch (e: any) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        logs: [
          ...prev.logs,
          { timestamp: Date.now(), message: 'Error durante el despliegue: ' + e.message, type: 'error' },
        ],
      }));
    }
  };

  return (
    <div className="deployment-component">
      <h3>Deployment</h3>
      <button onClick={deploy} disabled={state.status === 'deploying'}>
        {state.status === 'deploying' ? 'Desplegando...' : 'Iniciar Despliegue'}
      </button>
      <div className="deployment-logs" style={{ maxHeight: 120, overflowY: 'auto', background: '#222', color: '#fff', padding: 8, marginTop: 8 }}>
        {state.logs.map((log, idx) => (
          <div key={idx} style={{ color: log.type === 'error' ? 'red' : log.type === 'success' ? 'lime' : '#fff' }}>
            [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
          </div>
        ))}
      </div>
      {state.status === 'success' && state.lastDeployedAt && (
        <div style={{ color: 'lime', marginTop: 8 }}>
          Último despliegue: {new Date(state.lastDeployedAt).toLocaleString()}
        </div>
      )}
      {state.status === 'error' && (
        <div style={{ color: 'red', marginTop: 8 }}>
          Ocurrió un error durante el despliegue.
        </div>
      )}
    </div>
  );
};

export default DeploymentComponent; 