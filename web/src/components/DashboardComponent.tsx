import { useState, useEffect } from 'react';
import { centralCoordinator } from '../core/CentralModuleCoordinator';
import { messageBus } from '../core/InterModuleMessageBus';

interface DashboardProps {
  userId?: string;
}

const DashboardComponent = ({ userId }: DashboardProps) => {
  const [moduleStats, setModuleStats] = useState<Record<string, any>>({});
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    uptime: 0
  });

  useEffect(() => {
    // Actualizar estadísticas de módulos
    const updateModuleStats = () => {
      const stats = centralCoordinator.getAllModulesStatus();
      setModuleStats(stats);
    };

    // Actualizar métricas del sistema
    const updateSystemMetrics = () => {
      setSystemMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        uptime: Date.now()
      });
    };

    updateModuleStats();
    updateSystemMetrics();

    const interval = setInterval(() => {
      updateModuleStats();
      updateSystemMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getModuleStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'loading': return 'orange';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const loadModuleGroup = async (groupName: string) => {
    if (!userId) return;
    
    try {
      await centralCoordinator.loadModuleGroup(groupName as any, userId);
      messageBus.publish('module-group-loaded', { group: groupName, userId });
    } catch (error) {
      console.error(`Error cargando grupo ${groupName}:`, error);
    }
  };

  return (
    <div className="dashboard-component">
      <div className="dashboard-header">
        <h2>Dashboard del Sistema</h2>
        <div className="dashboard-controls">
          <button onClick={() => loadModuleGroup('CORE')}>Cargar Core</button>
          <button onClick={() => loadModuleGroup('FRONTEND')}>Cargar Frontend</button>
          <button onClick={() => loadModuleGroup('BLOCKCHAIN')}>Cargar Blockchain</button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Métricas del Sistema */}
        <div className="dashboard-card system-metrics">
          <h3>Métricas del Sistema</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">CPU</span>
              <div className="metric-bar">
                <div 
                  className="metric-fill" 
                  style={{ width: `${systemMetrics.cpu}%` }}
                ></div>
              </div>
              <span className="metric-value">{systemMetrics.cpu.toFixed(1)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Memoria</span>
              <div className="metric-bar">
                <div 
                  className="metric-fill" 
                  style={{ width: `${systemMetrics.memory}%` }}
                ></div>
              </div>
              <span className="metric-value">{systemMetrics.memory.toFixed(1)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Red</span>
              <div className="metric-bar">
                <div 
                  className="metric-fill" 
                  style={{ width: `${systemMetrics.network}%` }}
                ></div>
              </div>
              <span className="metric-value">{systemMetrics.network.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Estado de Módulos */}
        <div className="dashboard-card module-status">
          <h3>Estado de Módulos</h3>
          <div className="module-list">
            {Object.entries(moduleStats).map(([moduleName, status]) => (
              <div key={moduleName} className="module-status-item">
                <span className="module-name">{moduleName}</span>
                <span 
                  className="status-indicator"
                  style={{ backgroundColor: getModuleStatusColor(status.status) }}
                ></span>
                <span className="status-text">{status.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="dashboard-card quick-actions">
          <h3>Acciones Rápidas</h3>
          <div className="actions-grid">
            <button onClick={() => messageBus.publish('load-component', {
              componentName: 'Editor3D',
              props: { userId },
              targetId: 'dynamic-content'
            })}>
              Abrir Editor 3D
            </button>
            <button onClick={() => messageBus.publish('load-component', {
              componentName: 'EngineBridge',
              props: { userId },
              targetId: 'dynamic-content'
            })}>
              Conectar Engine
            </button>
            <button onClick={() => messageBus.publish('load-component', {
              componentName: 'BinaryTools',
              props: { userId },
              targetId: 'dynamic-content'
            })}>
              Herramientas
            </button>
          </div>
        </div>

        {/* Información del Usuario */}
        <div className="dashboard-card user-info">
          <h3>Información del Usuario</h3>
          <div className="user-details">
            <p><strong>ID:</strong> {userId || 'No asignado'}</p>
            <p><strong>Módulos activos:</strong> {Object.keys(moduleStats).length}</p>
            <p><strong>Estado:</strong> Conectado</p>
            <p><strong>Última actividad:</strong> {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="footer-info">
          <span>WoldVirtual3DlucIA Dashboard</span>
          <span>Módulos: {Object.keys(moduleStats).length}</span>
          <span>Uptime: {Math.floor((Date.now() - systemMetrics.uptime) / 1000)}s</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent; 