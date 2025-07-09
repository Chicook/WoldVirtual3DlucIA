import React from 'react';

const LeftPanel: React.FC = () => {
  return (
    <aside className="left-panel">
      <div className="panel-header">
        <h3>Herramientas</h3>
      </div>
      <div className="panel-content">
        <div className="tool-section">
          <h4>Geometrías Básicas</h4>
          <div className="tool-grid">
            <button className="geometry-btn" data-geometry="box">Cubo</button>
            <button className="geometry-btn" data-geometry="sphere">Esfera</button>
            <button className="geometry-btn" data-geometry="cylinder">Cilindro</button>
            <button className="geometry-btn" data-geometry="plane">Plano</button>
            <button className="geometry-btn" data-geometry="cone">Cono</button>
            <button className="geometry-btn" data-geometry="torus">Toro</button>
          </div>
        </div>
        <div className="tool-section">
          <h4>Luces</h4>
          <div className="tool-grid">
            <button className="light-btn" data-light="ambient">Ambiental</button>
            <button className="light-btn" data-light="directional">Direccional</button>
            <button className="light-btn" data-light="point">Puntual</button>
            <button className="light-btn" data-light="spot">Spot</button>
          </div>
        </div>
        <div className="tool-section">
          <h4>Materiales</h4>
          <div className="material-picker">
            <input type="color" id="material-color" defaultValue="#ffffff" />
            <select id="material-type">
              <option value="basic">Básico</option>
              <option value="phong">Phong</option>
              <option value="lambert">Lambert</option>
              <option value="standard">Standard</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftPanel; 