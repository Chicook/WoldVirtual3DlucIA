import React from 'react';

const tools = [
  { icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
    ), label: 'Seleccionar', tooltip: 'Herramienta de selección', key: 'select' },
  { icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12h14" /></svg>
    ), label: 'Mover', tooltip: 'Herramienta de mover', key: 'move' },
  { icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2" /></svg>
    ), label: 'Rotar', tooltip: 'Herramienta de rotar', key: 'rotate' },
  { icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 12h16" /></svg>
    ), label: 'Escalar', tooltip: 'Herramienta de escalar', key: 'scale' },
];

const geometries = [
  { label: 'Cubo', key: 'box' },
  { label: 'Esfera', key: 'sphere' },
  { label: 'Cilindro', key: 'cylinder' },
  { label: 'Plano', key: 'plane' },
  { label: 'Cono', key: 'cone' },
  { label: 'Toro', key: 'torus' },
];

const lights = [
  { label: 'Ambiental', key: 'ambient' },
  { label: 'Direccional', key: 'directional' },
  { label: 'Puntual', key: 'point' },
  { label: 'Spot', key: 'spot' },
];

const LeftPanel: React.FC = () => {
  return (
    <aside className="left-panel" style={{ alignItems: 'center', paddingTop: 'var(--spacing-md)' }}>
      {/* Barra vertical de herramientas principales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: '2rem' }}>
        {tools.map(tool => (
          <button
            key={tool.key}
            className="tool-btn"
            style={{ width: 48, height: 48, margin: '0 auto', position: 'relative' }}
            title={tool.tooltip}
          >
            {tool.icon}
            <span style={{ position: 'absolute', left: '110%', top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: 4, fontSize: 12, whiteSpace: 'nowrap', opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s' }} className="tool-tooltip">{tool.tooltip}</span>
          </button>
        ))}
      </div>
      {/* Separador visual */}
      <hr style={{ width: '60%', border: '1px solid var(--border-color)', margin: '1rem 0' }} />
      {/* Geometrías */}
      <div style={{ width: '100%', marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 0.5rem 0', textAlign: 'center' }}>Geometrías</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {geometries.map(g => (
            <button key={g.key} className="geometry-btn" data-geometry={g.key} style={{ width: '80%', margin: '0 auto' }}>{g.label}</button>
          ))}
        </div>
      </div>
      {/* Luces */}
      <div style={{ width: '100%', marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 0.5rem 0', textAlign: 'center' }}>Luces</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lights.map(l => (
            <button key={l.key} className="light-btn" data-light={l.key} style={{ width: '80%', margin: '0 auto' }}>{l.label}</button>
          ))}
        </div>
      </div>
      {/* Materiales */}
      <div style={{ width: '100%' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 0.5rem 0', textAlign: 'center' }}>Materiales</h4>
        <div className="material-picker" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <input type="color" id="material-color" defaultValue="#ffffff" style={{ width: 40, height: 40 }} />
          <select id="material-type" style={{ width: '80%' }}>
            <option value="basic">Básico</option>
            <option value="phong">Phong</option>
            <option value="lambert">Lambert</option>
            <option value="standard">Standard</option>
          </select>
        </div>
      </div>
    </aside>
  );
};

export default LeftPanel; 