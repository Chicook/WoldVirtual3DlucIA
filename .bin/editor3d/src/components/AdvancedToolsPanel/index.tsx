import React from 'react';
import { useEditor } from '../../contexts/EditorContext';
import './styles.css';

const AdvancedToolsPanel: React.FC = () => {
  const { state, setTransformMode, toggleGizmos, applyMaterial, addAnimation, addScript, exportAvatar } = useEditor();

  const materialPresets = [
    { id: 'default', name: 'Default', type: 'standard' },
    { id: 'metal', name: 'Metal', type: 'standard' },
    { id: 'plastic', name: 'Plastic', type: 'standard' },
    { id: 'glass', name: 'Glass', type: 'standard' },
    { id: 'emissive', name: 'Emissive', type: 'standard' },
    { id: 'wireframe', name: 'Wireframe', type: 'basic' }
  ];

  const animationTypes = [
    { id: 'rotation', name: 'Rotación' },
    { id: 'bounce', name: 'Rebote' },
    { id: 'float', name: 'Flotación' },
    { id: 'pulse', name: 'Pulso' }
  ];

  const scriptTypes = [
    { id: 'rotation', name: 'Rotación Continua' },
    { id: 'bounce', name: 'Rebote' },
    { id: 'float', name: 'Flotación' },
    { id: 'pulse', name: 'Pulso' }
  ];

  const handleMaterialApply = () => {
    if (state.selectedObject) {
      const selectedPreset = materialPresets[0]; // Por ahora aplica el primero
      applyMaterial(state.selectedObject.id, selectedPreset.id);
    }
  };

  const handleAnimationAdd = () => {
    if (state.selectedObject) {
      const selectedAnimation = animationTypes[0]; // Por ahora añade el primero
      addAnimation(state.selectedObject.id, selectedAnimation.id);
    }
  };

  const handleScriptAdd = () => {
    if (state.selectedObject) {
      const selectedScript = scriptTypes[0]; // Por ahora añade el primero
      addScript(state.selectedObject.id, selectedScript.id);
    }
  };

  const handleAvatarExport = () => {
    if (state.selectedObject) {
      exportAvatar(state.selectedObject.id);
    }
  };

  return (
    <div className="advanced-tools-panel">
      <h3>Herramientas Avanzadas</h3>
      
      {/* Transformación */}
      <div className="tool-section">
        <h4>Transformación</h4>
        <div className="transform-buttons">
          <button
            className={`transform-btn ${state.transformMode === 'translate' ? 'active' : ''}`}
            onClick={() => setTransformMode('translate')}
            title="Mover"
          >
            <span className="icon">↔</span>
            Mover
          </button>
          <button
            className={`transform-btn ${state.transformMode === 'rotate' ? 'active' : ''}`}
            onClick={() => setTransformMode('rotate')}
            title="Rotar"
          >
            <span className="icon">⟲</span>
            Rotar
          </button>
          <button
            className={`transform-btn ${state.transformMode === 'scale' ? 'active' : ''}`}
            onClick={() => setTransformMode('scale')}
            title="Escalar"
          >
            <span className="icon">⤧</span>
            Escalar
          </button>
        </div>
      </div>

      {/* Gizmos */}
      <div className="tool-section">
        <h4>Gizmos</h4>
        <button
          className={`gizmo-toggle ${state.gizmosEnabled ? 'active' : ''}`}
          onClick={toggleGizmos}
        >
          {state.gizmosEnabled ? 'Desactivar' : 'Activar'} Gizmos
        </button>
      </div>

      {/* Materiales */}
      <div className="tool-section">
        <h4>Materiales</h4>
        <div className="material-presets">
          {materialPresets.map(preset => (
            <button
              key={preset.id}
              className="material-preset-btn"
              onClick={() => state.selectedObject && applyMaterial(state.selectedObject.id, preset.id)}
              disabled={!state.selectedObject}
              title={preset.name}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Animaciones */}
      <div className="tool-section">
        <h4>Animaciones</h4>
        <div className="animation-types">
          {animationTypes.map(animation => (
            <button
              key={animation.id}
              className="animation-btn"
              onClick={() => state.selectedObject && addAnimation(state.selectedObject.id, animation.id)}
              disabled={!state.selectedObject}
              title={animation.name}
            >
              {animation.name}
            </button>
          ))}
        </div>
      </div>

      {/* Scripts */}
      <div className="tool-section">
        <h4>Scripts</h4>
        <div className="script-types">
          {scriptTypes.map(script => (
            <button
              key={script.id}
              className="script-btn"
              onClick={() => state.selectedObject && addScript(state.selectedObject.id, script.id)}
              disabled={!state.selectedObject}
              title={script.name}
            >
              {script.name}
            </button>
          ))}
        </div>
      </div>

      {/* Exportación de Avatar */}
      <div className="tool-section">
        <h4>Avatar</h4>
        <button
          className="export-avatar-btn"
          onClick={handleAvatarExport}
          disabled={!state.selectedObject}
        >
          Exportar como Avatar
        </button>
      </div>

      {/* Información de Debug */}
      <div className="tool-section debug-info">
        <h4>Debug</h4>
        <div className="debug-stats">
          <p>Objetos: {state.sceneObjects.length}</p>
          <p>Seleccionado: {state.selectedObject?.name || 'Ninguno'}</p>
          <p>Modo: {state.transformMode}</p>
          <p>Gizmos: {state.gizmosEnabled ? 'ON' : 'OFF'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedToolsPanel; 