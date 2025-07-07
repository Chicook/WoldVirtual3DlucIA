import React, { useState, useCallback } from 'react';
import { useEngine } from '../contexts/EngineContext';
import './EngineControls.css';

interface EngineControlsProps {
  className?: string;
}

export const EngineControls: React.FC<EngineControlsProps> = ({ className = '' }) => {
  const { engine, isConnected, sendCommand } = useEngine();
  const [activeTab, setActiveTab] = useState<'render' | 'physics' | 'network' | 'audio' | 'debug'>('render');
  const [isExpanded, setIsExpanded] = useState(false);

  // Estados para controles de renderizado
  const [renderSettings, setRenderSettings] = useState({
    shadowQuality: 'high',
    antialiasing: true,
    vsync: true,
    maxFPS: 60,
    renderDistance: 1000
  });

  // Estados para controles de física
  const [physicsSettings, setPhysicsSettings] = useState({
    gravity: { x: 0, y: -9.81, z: 0 },
    timeScale: 1.0,
    collisionDetection: 'sweep',
    solverIterations: 10
  });

  // Estados para controles de red
  const [networkSettings, setNetworkSettings] = useState({
    maxPlayers: 100,
    tickRate: 60,
    interpolation: true,
    compression: true
  });

  // Estados para controles de audio
  const [audioSettings, setAudioSettings] = useState({
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    spatialAudio: true,
    maxDistance: 100
  });

  // Estados para controles de debug
  const [debugSettings, setDebugSettings] = useState({
    showFPS: true,
    showColliders: false,
    showWireframe: false,
    showBoundingBoxes: false,
    profiling: false
  });

  // Handlers para renderizado
  const handleRenderSettingChange = useCallback((setting: string, value: any) => {
    setRenderSettings(prev => ({ ...prev, [setting]: value }));
    sendCommand('updateRenderSettings', { [setting]: value });
  }, [sendCommand]);

  // Handlers para física
  const handlePhysicsSettingChange = useCallback((setting: string, value: any) => {
    setPhysicsSettings(prev => ({ ...prev, [setting]: value }));
    sendCommand('updatePhysicsSettings', { [setting]: value });
  }, [sendCommand]);

  // Handlers para red
  const handleNetworkSettingChange = useCallback((setting: string, value: any) => {
    setNetworkSettings(prev => ({ ...prev, [setting]: value }));
    sendCommand('updateNetworkSettings', { [setting]: value });
  }, [sendCommand]);

  // Handlers para audio
  const handleAudioSettingChange = useCallback((setting: string, value: any) => {
    setAudioSettings(prev => ({ ...prev, [setting]: value }));
    sendCommand('updateAudioSettings', { [setting]: value });
  }, [sendCommand]);

  // Handlers para debug
  const handleDebugSettingChange = useCallback((setting: string, value: any) => {
    setDebugSettings(prev => ({ ...prev, [setting]: value }));
    sendCommand('updateDebugSettings', { [setting]: value });
  }, [sendCommand]);

  // Comandos de control del motor
  const handleEngineCommand = useCallback((command: string, params?: any) => {
    sendCommand(command, params);
  }, [sendCommand]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'render':
        return (
          <div className="engine-controls-tab-content">
            <div className="control-group">
              <label>Calidad de Sombras</label>
              <select 
                value={renderSettings.shadowQuality}
                onChange={(e) => handleRenderSettingChange('shadowQuality', e.target.value)}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="ultra">Ultra</option>
              </select>
            </div>

            <div className="control-group">
              <label>
                <input 
                  type="checkbox"
                  checked={renderSettings.antialiasing}
                  onChange={(e) => handleRenderSettingChange('antialiasing', e.target.checked)}
                />
                Antialiasing
              </label>
            </div>

            <div className="control-group">
              <label>
                <input 
                  type="checkbox"
                  checked={renderSettings.vsync}
                  onChange={(e) => handleRenderSettingChange('vsync', e.target.checked)}
                />
                V-Sync
              </label>
            </div>

            <div className="control-group">
              <label>FPS Máximo</label>
              <input 
                type="range"
                min="30"
                max="144"
                value={renderSettings.maxFPS}
                onChange={(e) => handleRenderSettingChange('maxFPS', parseInt(e.target.value))}
              />
              <span>{renderSettings.maxFPS} FPS</span>
            </div>

            <div className="control-group">
              <label>Distancia de Renderizado</label>
              <input 
                type="range"
                min="100"
                max="5000"
                step="100"
                value={renderSettings.renderDistance}
                onChange={(e) => handleRenderSettingChange('renderDistance', parseInt(e.target.value))}
              />
              <span>{renderSettings.renderDistance}m</span>
            </div>
          </div>
        );

      case 'physics':
        return (
          <div className="engine-controls-tab-content">
            <div className="control-group">
              <label>Escala de Tiempo</label>
              <input 
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={physicsSettings.timeScale}
                onChange={(e) => handlePhysicsSettingChange('timeScale', parseFloat(e.target.value))}
              />
              <span>{physicsSettings.timeScale}x</span>
            </div>

            <div className="control-group">
              <label>Detección de Colisiones</label>
              <select 
                value={physicsSettings.collisionDetection}
                onChange={(e) => handlePhysicsSettingChange('collisionDetection', e.target.value)}
              >
                <option value="discrete">Discreta</option>
                <option value="sweep">Sweep</option>
                <option value="continuous">Continua</option>
              </select>
            </div>

            <div className="control-group">
              <label>Iteraciones del Solver</label>
              <input 
                type="range"
                min="1"
                max="20"
                value={physicsSettings.solverIterations}
                onChange={(e) => handlePhysicsSettingChange('solverIterations', parseInt(e.target.value))}
              />
              <span>{physicsSettings.solverIterations}</span>
            </div>

            <div className="control-group">
              <label>Gravedad X</label>
              <input 
                type="range"
                min="-20"
                max="20"
                step="0.1"
                value={physicsSettings.gravity.x}
                onChange={(e) => handlePhysicsSettingChange('gravity', { 
                  ...physicsSettings.gravity, 
                  x: parseFloat(e.target.value) 
                })}
              />
              <span>{physicsSettings.gravity.x}</span>
            </div>

            <div className="control-group">
              <label>Gravedad Y</label>
              <input 
                type="range"
                min="-20"
                max="20"
                step="0.1"
                value={physicsSettings.gravity.y}
                onChange={(e) => handlePhysicsSettingChange('gravity', { 
                  ...physicsSettings.gravity, 
                  y: parseFloat(e.target.value) 
                })}
              />
              <span>{physicsSettings.gravity.y}</span>
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="engine-controls-tab-content">
            <div className="control-group">
              <label>Jugadores Máximos</label>
              <input 
                type="range"
                min="10"
                max="500"
                step="10"
                value={networkSettings.maxPlayers}
                onChange={(e) => handleNetworkSettingChange('maxPlayers', parseInt(e.target.value))}
              />
              <span>{networkSettings.maxPlayers}</span>
            </div>

            <div className="control-group">
              <label>Tick Rate</label>
              <input 
                type="range"
                min="20"
                max="120"
                step="5"
                value={networkSettings.tickRate}
                onChange={(e) => handleNetworkSettingChange('tickRate', parseInt(e.target.value))}
              />
              <span>{networkSettings.tickRate} Hz</span>
            </div>

            <div className="control-group">
              <label>
                <input 
                  type="checkbox"
                  checked={networkSettings.interpolation}
                  onChange={(e) => handleNetworkSettingChange('interpolation', e.target.checked)}
                />
                Interpolación
              </label>
            </div>

            <div className="control-group">
              <label>
                <input 
                  type="checkbox"
                  checked={networkSettings.compression}
                  onChange={(e) => handleNetworkSettingChange('compression', e.target.checked)}
                />
                Compresión de Datos
              </label>
            </div>

            <div className="control-group">
              <button 
                onClick={() => handleEngineCommand('restartNetwork')}
                disabled={!isConnected}
              >
                Reiniciar Red
              </button>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="engine-controls-tab-content">
            <div className="control-group">
              <label>Volumen Principal</label>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioSettings.masterVolume}
                onChange={(e) => handleAudioSettingChange('masterVolume', parseFloat(e.target.value))}
              />
              <span>{Math.round(audioSettings.masterVolume * 100)}%</span>
            </div>

            <div className="control-group">
              <label>Volumen de Música</label>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioSettings.musicVolume}
                onChange={(e) => handleAudioSettingChange('musicVolume', parseFloat(e.target.value))}
              />
              <span>{Math.round(audioSettings.musicVolume * 100)}%</span>
            </div>

            <div className="control-group">
              <label>Volumen de Efectos</label>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioSettings.sfxVolume}
                onChange={(e) => handleAudioSettingChange('sfxVolume', parseFloat(e.target.value))}
              />
              <span>{Math.round(audioSettings.sfxVolume * 100)}%</span>
            </div>

            <div className="control-group">
              <label>
                <input 
                  type="checkbox"
                  checked={audioSettings.spatialAudio}
                  onChange={(e) => handleAudioSettingChange('spatialAudio', e.target.checked)}
                />
                Audio Espacial 3D
              </label>
            </div>

            <div className="control-group">
              <label>Distancia Máxima de Audio</label>
              <input 
                type="range"
                min="10"
                max="500"
                step="10"
                value={audioSettings.maxDistance}
                onChange={(e) => handleAudioSettingChange('maxDistance', parseInt(e.target.value))}
              />
              <span>{audioSettings.maxDistance}m</span>
            </div>
          </div>
        );

      case 'debug':
        return (
          <div className="engine-controls-tab-content">
            <div className="control-group">
              <label>
                <input 
                  type="checkbox"
                  checked={debugSettings.showFPS}
                  onChange={(e) => handleDebugSettingChange('showFPS', e.target.checked)}
                />
                Mostrar FPS
              </label>
            </div>

            <div className="control-group">
              <label>
                <input 
                  type="checkbox"
                  checked={debugSettings.showColliders}
                  onChange={(e) => handleDebugSettingChange('showColliders', e.target.checked)}
                />
                Mostrar Colisionadores
              </label>
            </div>

            <div className="control-group">
              <label>
                <input 
                  type="checkbox"
                  checked={debugSettings.showWireframe}
                  onChange={(e) => handleDebugSettingChange('showWireframe', e.target.checked)}
                />
                Modo Wireframe
              </label>
            </div>

            <div className="control-group">
              <label>
                <input 
                  type="checkbox"
                  checked={debugSettings.showBoundingBoxes}
                  onChange={(e) => handleDebugSettingChange('showBoundingBoxes', e.target.checked)}
                />
                Mostrar Bounding Boxes
              </label>
            </div>

            <div className="control-group">
              <label>
                <input 
                  type="checkbox"
                  checked={debugSettings.profiling}
                  onChange={(e) => handleDebugSettingChange('profiling', e.target.checked)}
                />
                Profiling Activo
              </label>
            </div>

            <div className="control-group">
              <button 
                onClick={() => handleEngineCommand('exportDebugInfo')}
                disabled={!isConnected}
              >
                Exportar Info de Debug
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`engine-controls ${className} ${isExpanded ? 'expanded' : ''}`}>
      <div className="engine-controls-header">
        <h3>Controles del Motor</h3>
        <button 
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="engine-controls-tabs">
            <button 
              className={`tab ${activeTab === 'render' ? 'active' : ''}`}
              onClick={() => setActiveTab('render')}
            >
              Renderizado
            </button>
            <button 
              className={`tab ${activeTab === 'physics' ? 'active' : ''}`}
              onClick={() => setActiveTab('physics')}
            >
              Física
            </button>
            <button 
              className={`tab ${activeTab === 'network' ? 'active' : ''}`}
              onClick={() => setActiveTab('network')}
            >
              Red
            </button>
            <button 
              className={`tab ${activeTab === 'audio' ? 'active' : ''}`}
              onClick={() => setActiveTab('audio')}
            >
              Audio
            </button>
            <button 
              className={`tab ${activeTab === 'debug' ? 'active' : ''}`}
              onClick={() => setActiveTab('debug')}
            >
              Debug
            </button>
          </div>

          <div className="engine-controls-content">
            {renderTabContent()}
          </div>

          <div className="engine-controls-actions">
            <button 
              onClick={() => handleEngineCommand('pause')}
              disabled={!isConnected}
              className="action-button pause"
            >
              Pausar
            </button>
            <button 
              onClick={() => handleEngineCommand('resume')}
              disabled={!isConnected}
              className="action-button resume"
            >
              Reanudar
            </button>
            <button 
              onClick={() => handleEngineCommand('reset')}
              disabled={!isConnected}
              className="action-button reset"
            >
              Reiniciar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EngineControls;
