//! Componente de estado del motor
//! 
//! Muestra el estado de conexión, estadísticas y controles del motor 3D

import React, { useState, useEffect } from 'react';
import { useEngine, useEngineConnection, useEngineStats } from '../contexts/EngineContext';
import './EngineStatus.css';

/// Props del componente
interface EngineStatusProps {
  /// Mostrar panel expandido
  expanded?: boolean;
  /// Callback cuando se expande/contrae
  onToggleExpanded?: (expanded: boolean) => void;
}

/// Componente de estado del motor
export const EngineStatus: React.FC<EngineStatusProps> = ({ 
  expanded = false, 
  onToggleExpanded 
}) => {
  const { 
    connected, 
    loading, 
    error, 
    latency, 
    connect, 
    disconnect, 
    getStats,
    syncState 
  } = useEngine();
  
  const { stats } = useEngineStats();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  /// Actualizar estadísticas
  const updateStats = async () => {
    try {
      await getStats();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
    }
  };

  /// Sincronizar estado
  const handleSync = async () => {
    try {
      await syncState();
    } catch (error) {
      console.error('Error sincronizando estado:', error);
    }
  };

  /// Auto-refresh de estadísticas
  useEffect(() => {
    if (!autoRefresh || !connected) return;

    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, connected]);

  /// Actualizar estadísticas al conectar
  useEffect(() => {
    if (connected) {
      updateStats();
    }
  }, [connected]);

  return (
    <div className={`engine-status ${expanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="engine-status-header">
        <div className="engine-status-title">
          <span className="engine-icon">🚀</span>
          <span className="engine-title">Motor 3D</span>
        </div>
        
        <div className="engine-status-controls">
          <button
            className={`engine-connect-btn ${connected ? 'connected' : 'disconnected'}`}
            onClick={connected ? disconnect : connect}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Conectando...
              </>
            ) : connected ? (
              <>
                <span className="status-dot connected"></span>
                Desconectar
              </>
            ) : (
              <>
                <span className="status-dot disconnected"></span>
                Conectar
              </>
            )}
          </button>

          {expanded && (
            <button
              className="engine-toggle-btn"
              onClick={() => onToggleExpanded?.(!expanded)}
            >
              {expanded ? '−' : '+'}
            </button>
          )}
        </div>
      </div>

      {/* Estado de conexión */}
      <div className="engine-connection-status">
        <div className="status-item">
          <span className="status-label">Estado:</span>
          <span className={`status-value ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {connected && (
          <>
            <div className="status-item">
              <span className="status-label">Latencia:</span>
              <span className="status-value">{latency}ms</span>
            </div>

            <div className="status-item">
              <span className="status-label">Última actualización:</span>
              <span className="status-value">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </>
        )}

        {error && (
          <div className="status-item error">
            <span className="status-label">Error:</span>
            <span className="status-value">{error}</span>
          </div>
        )}
      </div>

      {/* Panel expandido */}
      {expanded && connected && (
        <div className="engine-status-expanded">
          {/* Controles */}
          <div className="engine-controls">
            <button
              className="engine-sync-btn"
              onClick={handleSync}
              title="Sincronizar estado"
            >
              🔄 Sincronizar
            </button>

            <label className="engine-auto-refresh">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
          </div>

          {/* Estadísticas de rendimiento */}
          {stats && (
            <div className="engine-performance">
              <h4>Rendimiento</h4>
              <div className="performance-grid">
                <div className="performance-item">
                  <span className="performance-label">FPS</span>
                  <span className="performance-value">{stats.performance?.fps.toFixed(1) || 'N/A'}</span>
                </div>
                
                <div className="performance-item">
                  <span className="performance-label">Frame Time</span>
                  <span className="performance-value">{stats.performance?.frameTime.toFixed(2) || 'N/A'}ms</span>
                </div>
                
                <div className="performance-item">
                  <span className="performance-label">CPU</span>
                  <span className="performance-value">{stats.performance?.cpuUsage.toFixed(1) || 'N/A'}%</span>
                </div>
                
                <div className="performance-item">
                  <span className="performance-label">GPU</span>
                  <span className="performance-value">{stats.performance?.gpuUsage.toFixed(1) || 'N/A'}%</span>
                </div>
                
                <div className="performance-item">
                  <span className="performance-label">Memoria</span>
                  <span className="performance-value">{stats.performance?.memoryUsage.toFixed(1) || 'N/A'}%</span>
                </div>
                
                <div className="performance-item">
                  <span className="performance-label">Draw Calls</span>
                  <span className="performance-value">{stats.performance?.drawCalls || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas del motor */}
          {stats && (
            <div className="engine-stats">
              <h4>Estadísticas del Motor</h4>
              <div className="stats-grid">
                <div className="stats-item">
                  <span className="stats-label">Entidades</span>
                  <span className="stats-value">{stats.entities || 0}</span>
                </div>
                
                <div className="stats-item">
                  <span className="stats-label">Componentes</span>
                  <span className="stats-value">{stats.components || 0}</span>
                </div>
                
                <div className="stats-item">
                  <span className="stats-label">Sistemas</span>
                  <span className="stats-value">{stats.systems || 0}</span>
                </div>
                
                <div className="stats-item">
                  <span className="stats-label">Triángulos</span>
                  <span className="stats-value">{stats.performance?.triangles || 0}</span>
                </div>
                
                <div className="stats-item">
                  <span className="stats-label">Vértices</span>
                  <span className="stats-value">{stats.performance?.vertices || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas de red */}
          {stats?.network && (
            <div className="engine-network">
              <h4>Red</h4>
              <div className="network-grid">
                <div className="network-item">
                  <span className="network-label">Peers</span>
                  <span className="network-value">{stats.network.connectedPeers}</span>
                </div>
                
                <div className="network-item">
                  <span className="network-label">Mensajes Enviados</span>
                  <span className="network-value">{stats.network.messagesSent}</span>
                </div>
                
                <div className="network-item">
                  <span className="network-label">Mensajes Recibidos</span>
                  <span className="network-value">{stats.network.messagesReceived}</span>
                </div>
                
                <div className="network-item">
                  <span className="network-label">Ancho de Banda</span>
                  <span className="network-value">{(stats.network.bandwidth / 1024 / 1024).toFixed(2)} MB/s</span>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas de memoria */}
          {stats?.memory && (
            <div className="engine-memory">
              <h4>Memoria</h4>
              <div className="memory-grid">
                <div className="memory-item">
                  <span className="memory-label">Total</span>
                  <span className="memory-value">{(stats.memory.total / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                
                <div className="memory-item">
                  <span className="memory-label">Usado</span>
                  <span className="memory-value">{(stats.memory.used / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                
                <div className="memory-item">
                  <span className="memory-label">Libre</span>
                  <span className="memory-value">{(stats.memory.free / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                
                <div className="memory-item">
                  <span className="memory-label">Asignado</span>
                  <span className="memory-value">{(stats.memory.allocated / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EngineStatus; 